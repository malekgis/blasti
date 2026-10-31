-- =====================================================================
--  بلاصتي · Blasti — قاعدة البيانات (Supabase / PostgreSQL)
--  انسخ هذا الملف كاملاً في Supabase ← SQL Editor ← Run
--  كل الكتابة والقراءة تمرّ عبر دوال آمنة (RPC). لا أحد يلمس الجداول مباشرة.
-- =====================================================================
create extension if not exists pgcrypto;

-- ---------- tables ----------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  minutes_per_vehicle int not null default 4,
  long_inside_minutes int not null default 30,
  timezone text not null default 'Africa/Algiers'
);
insert into public.settings (id) values (1) on conflict do nothing;

create table if not exists public.stations (
  id text primary key,
  name text not null,
  fuel_essence boolean not null default true,
  fuel_gasoil boolean not null default true,
  pumps_women int not null default 1 check (pumps_women between 1 and 12),
  pumps_men int not null default 2 check (pumps_men between 1 and 12),
  pumps_state int not null default 1 check (pumps_state between 1 and 12),
  meter_start bigint not null default 0,
  meter_now bigint not null default 0,
  meter_read_at timestamptz,
  active boolean not null default true
);

create table if not exists public.vehicle_rules (
  vtype text primary key,
  label text not null,
  window_hours int not null check (window_hours between 1 and 240),
  max_liters int not null check (max_liters between 1 and 1000),
  fuels text[] not null
);

create table if not exists public.exempt_plates (
  plate text primary key,
  category text not null check (category in ('state','transport','freight')),
  created_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  plate text not null,
  station_id text not null references public.stations(id),
  lane text not null check (lane in ('women','men','state')),
  vtype text not null references public.vehicle_rules(vtype),
  fuel text not null check (fuel in ('essence','gasoil')),
  number int not null,
  day date not null,
  via text not null default 'self' check (via in ('self','cyber','commune','post')),
  photo text,
  status text not null default 'waiting' check (status in ('waiting','inside','done','cancelled')),
  created_at timestamptz not null default now(),
  entered_at timestamptz,
  exited_at timestamptz,
  unique (station_id, day, lane, number)
);
create index if not exists tickets_plate_idx on public.tickets (plate, status);
create index if not exists tickets_station_day_idx on public.tickets (station_id, day, lane, status);

create table if not exists public.passes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('naftal','gas','maint','civil')),
  holder text not null,
  plate text,
  station_id text references public.stations(id),          -- null = كل المحطات
  valid_from timestamptz not null default now(),
  valid_to timestamptz not null,
  revoked boolean not null default false,
  inside boolean not null default false,
  inside_station text references public.stations(id),
  inside_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.gate_events (
  id bigserial primary key,
  station_id text not null references public.stations(id),
  barrier text not null check (barrier in ('in','out')),
  kind text not null check (kind in ('ticket','pass','manual','refused')),
  ref text, plate text, note text,
  by_user uuid,
  at timestamptz not null default now()
);
create index if not exists gate_events_station_idx on public.gate_events (station_id, at desc);

create table if not exists public.alerts (
  id bigserial primary key,
  station_id text references public.stations(id),
  plate text, reason text not null, detail text,
  at timestamptz not null default now()
);

-- staff accounts: create the user in Authentication, then add a row here
create table if not exists public.staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('gate','manager','wilaya')),
  station_id text references public.stations(id),
  name text
);

-- nobody reads or writes tables directly; everything goes through the functions below
alter table public.settings enable row level security;
alter table public.stations enable row level security;
alter table public.vehicle_rules enable row level security;
alter table public.exempt_plates enable row level security;
alter table public.tickets enable row level security;
alter table public.passes enable row level security;
alter table public.gate_events enable row level security;
alter table public.alerts enable row level security;
alter table public.staff enable row level security;
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- ---------- seed data (edit to the real stations of the wilaya) ----------
insert into public.stations (id, name, fuel_gasoil) values
  ('s1','محطة وسط المدينة', true),
  ('s2','محطة طريق عين صالح', true),
  ('s3','محطة قطع الواد', false),
  ('s4','محطة سرسوف', true)
on conflict (id) do nothing;

insert into public.vehicle_rules (vtype,label,window_hours,max_liters,fuels) values
  ('car','سيارة سياحية',48,50,'{essence,gasoil}'),
  ('moto','دراجة نارية',24,10,'{essence}'),
  ('suv','رباعية الدفع 4×4',48,80,'{essence,gasoil}'),
  ('pickup','بيكاب / فورغون',48,70,'{essence,gasoil}'),
  ('truck','شاحنة',24,200,'{gasoil}'),
  ('bus','حافلة',24,150,'{gasoil}'),
  ('tractor','جرار فلاحي',72,60,'{gasoil}')
on conflict (vtype) do nothing;

-- ---------- helpers ----------
create or replace function public.bl_today() returns date
language sql stable set search_path = public as $$
  select (now() at time zone (select timezone from settings where id = 1))::date
$$;

create or replace function public.bl_hm(t timestamptz) returns text
language sql stable set search_path = public as $$
  select to_char(t at time zone (select timezone from settings where id = 1), 'HH24:MI')
$$;

create or replace function public.bl_new_code(prefix text) returns text
language plpgsql volatile set search_path = public, extensions as $$
declare a text := 'ACDEFHJKMNPRTUVWXY3479'; s text := ''; b bytea := gen_random_bytes(8); i int;
begin
  for i in 0..7 loop s := s || substr(a, (get_byte(b, i) % length(a)) + 1, 1); end loop;
  return prefix || s;
end $$;

create or replace function public.bl_role() returns text
language sql stable security definer set search_path = public as $$
  select role from staff where user_id = auth.uid()
$$;

create or replace function public.bl_station() returns text
language sql stable security definer set search_path = public as $$
  select station_id from staff where user_id = auth.uid()
$$;

-- may the current user act on this station?  gate/manager: own station only; wilaya: all
create or replace function public.bl_can(p_station text, p_roles text[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where user_id = auth.uid() and role = any(p_roles)
                 and (role = 'wilaya' or station_id = p_station))
$$;

create or replace function public.bl_alert(p_station text, p_plate text, p_reason text, p_detail text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from alerts where station_id is not distinct from p_station and plate is not distinct from p_plate
             and reason = p_reason and at > now() - interval '2 minutes') then return; end if;
  insert into alerts (station_id, plate, reason, detail) values (p_station, nullif(p_plate,''), p_reason, p_detail);
end $$;

create or replace function public.bl_lane_label(p_lane text) returns text language sql immutable as $$
  select case p_lane when 'women' then 'ن' when 'men' then 'ر' else 'د' end
$$;

create or replace function public.bl_pumps(s public.stations, p_lane text) returns int language sql immutable as $$
  select greatest(1, case p_lane when 'women' then s.pumps_women when 'men' then s.pumps_men else s.pumps_state end)
$$;

create or replace function public.bl_last_in(p_station text, p_day date, p_lane text) returns int
language sql stable set search_path = public as $$
  select coalesce(max(number), 0) from tickets
  where station_id = p_station and day = p_day and lane = p_lane and status in ('inside','done')
$$;

-- full ticket view (with code and photo): only returned to the owner or to staff
create or replace function public.bl_ticket_json(t public.tickets) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare s stations; li int; win int; ahead int := 0; pumps int; can boolean := false; eta int := 0; mx int; mpv int;
begin
  select * into s from stations where id = t.station_id;
  select minutes_per_vehicle into mpv from settings where id = 1;
  pumps := bl_pumps(s, t.lane); win := pumps * 2;
  if t.status = 'waiting' then
    li := bl_last_in(t.station_id, t.day, t.lane);
    select count(*) into ahead from tickets x where x.station_id = t.station_id and x.day = t.day and x.lane = t.lane
      and x.status = 'waiting' and x.number > li and x.number < t.number;
    can := t.number <= li + win;
    eta := case when can then 0 else ceil(greatest(1, ahead - win + 1) * mpv::numeric / pumps)::int end;
  end if;
  select max_liters into mx from vehicle_rules where vtype = t.vtype;
  return jsonb_build_object('id', t.id, 'code', t.code, 'number', t.number, 'lane', t.lane, 'vtype', t.vtype, 'fuel', t.fuel,
    'plate', t.plate, 'station', t.station_id, 'stationName', s.name, 'status', t.status, 'day', t.day,
    'createdAt', t.created_at, 'enteredAt', t.entered_at, 'exitedAt', t.exited_at, 'via', t.via, 'photo', t.photo,
    'ahead', ahead, 'canEnter', can, 'etaMin', eta, 'max', mx, 'isToday', t.day = bl_today(),
    'fuelOk', case t.fuel when 'essence' then s.fuel_essence else s.fuel_gasoil end);
end $$;

-- limited view for people who only know the plate (no code, no photo: the ticket cannot be stolen)
create or replace function public.bl_ticket_public(t public.tickets) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('id', t.id, 'number', t.number, 'lane', t.lane, 'station', t.station_id,
    'stationName', (select name from stations where id = t.station_id), 'status', t.status, 'enteredAt', t.entered_at)
$$;

create or replace function public.bl_pass_json(p public.passes) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('id', p.id, 'code', p.code, 'type', p.type, 'holder', p.holder, 'plate', p.plate,
    'station', p.station_id, 'from', p.valid_from, 'to', p.valid_to, 'revoked', p.revoked, 'inside', p.inside,
    'insideAt', p.inside_at, 'live', (not p.revoked and now() between p.valid_from and p.valid_to))
$$;

create or replace function public.bl_meter(p_station text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare s stations; cnt int; allowed bigint; sold bigint;
begin
  select * into s from stations where id = p_station;
  select count(*), coalesce(sum(r.max_liters), 0) into cnt, allowed
    from tickets t join vehicle_rules r on r.vtype = t.vtype
    where t.station_id = p_station and t.entered_at is not null
      and (t.entered_at at time zone (select timezone from settings where id = 1))::date = bl_today();
  sold := s.meter_now - s.meter_start;
  return jsonb_build_object('start', s.meter_start, 'now', s.meter_now, 'readAt', s.meter_read_at, 'sold', sold,
    'count', cnt, 'allowed', allowed, 'over', sold - allowed, 'avg', case when cnt > 0 then sold::numeric / cnt else 0 end);
end $$;

-- =====================================================================
--  PUBLIC FUNCTIONS (anyone, no account)
-- =====================================================================
create or replace function public.get_rules() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('minPer', (select minutes_per_vehicle from settings where id = 1),
    'veh', (select jsonb_object_agg(vtype, jsonb_build_object('label', label, 'win', window_hours, 'max', max_liters, 'fuels', to_jsonb(fuels))) from vehicle_rules))
$$;

create or replace function public.station_overview() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', s.id, 'name', s.name,
      'fuel', jsonb_build_object('essence', s.fuel_essence, 'gasoil', s.fuel_gasoil),
      'pumps', jsonb_build_object('women', s.pumps_women, 'men', s.pumps_men, 'state', s.pumps_state),
      'waiting', jsonb_build_object(
        'women', (select count(*) from tickets t where t.station_id = s.id and t.day = bl_today() and t.lane = 'women' and t.status = 'waiting'),
        'men',   (select count(*) from tickets t where t.station_id = s.id and t.day = bl_today() and t.lane = 'men' and t.status = 'waiting'),
        'state', (select count(*) from tickets t where t.station_id = s.id and t.day = bl_today() and t.lane = 'state' and t.status = 'waiting'))
    ) order by s.id), '[]'::jsonb)
  from stations s where s.active
$$;

create or replace function public.check_plate(p_plate text, p_station text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare cat text; act tickets; lst tickets; win int; lastv text;
begin
  p_plate := regexp_replace(coalesce(p_plate,''), '\D', '', 'g');
  if length(p_plate) not between 8 and 11 then return jsonb_build_object('kind','invalid'); end if;
  select category into cat from exempt_plates where plate = p_plate;
  select * into act from tickets where plate = p_plate and status in ('waiting','inside') and day = bl_today() limit 1;
  if found then
    if act.station_id <> p_station then
      perform bl_alert(p_station, p_plate, 'queue', 'له تذكرة اليوم في ' || (select name from stations where id = act.station_id));
      return jsonb_build_object('kind','red','reason','queue','ticket', bl_ticket_public(act));
    end if;
    return jsonb_build_object('kind','mine','reason','queue','ticket', bl_ticket_public(act));
  end if;
  select * into lst from tickets where plate = p_plate and entered_at is not null order by entered_at desc limit 1;
  if found then
    lastv := lst.vtype;
    if cat is null then
      select window_hours into win from vehicle_rules where vtype = lst.vtype;
      if lst.entered_at > now() - make_interval(hours => win) then
        perform bl_alert(p_station, p_plate, 'recent', 'حاول الحجز قبل انتهاء المدة بعد تزوّده في ' || (select name from stations where id = lst.station_id));
        return jsonb_build_object('kind','red','reason','recent','ticket', bl_ticket_public(lst), 'until', lst.entered_at + make_interval(hours => win));
      end if;
    end if;
  end if;
  return jsonb_build_object('kind','ok','cat', cat, 'lastV', lastv);
end $$;

create or replace function public.register_ticket(p_plate text, p_station text, p_lane text, p_vtype text, p_fuel text, p_via text, p_photo text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare r jsonb; rule vehicle_rules; n int; t tickets; d date := bl_today();
begin
  p_plate := regexp_replace(coalesce(p_plate,''), '\D', '', 'g');
  if length(p_plate) not between 8 and 11 then return jsonb_build_object('ok', false, 'kind', 'invalid'); end if;
  if not exists (select 1 from stations where id = p_station and active) then return jsonb_build_object('ok', false, 'kind', 'invalid'); end if;
  select * into rule from vehicle_rules where vtype = p_vtype;
  if not found or not (p_fuel = any(rule.fuels)) or p_lane not in ('women','men','state') then return jsonb_build_object('ok', false, 'kind', 'invalid'); end if;
  if p_via not in ('self','cyber','commune','post') then p_via := 'self'; end if;
  if p_photo is not null and (length(p_photo) > 150000 or p_photo not like 'data:image/jpeg;base64,%') then p_photo := null; end if;

  r := check_plate(p_plate, p_station);
  if r->>'kind' <> 'ok' then return jsonb_build_object('ok', false) || r; end if;
  if (r->>'lastV') is not null and r->>'lastV' <> p_vtype then
    perform bl_alert(p_station, p_plate, 'vtype', 'سُجّلت قبلها كـ"' || (select label from vehicle_rules where vtype = r->>'lastV') || '"، واليوم اختار "' || rule.label || '"');
  end if;
  if r->>'cat' = 'state' then p_lane := 'state'; elsif p_lane = 'state' then p_lane := 'men'; end if;

  perform pg_advisory_xact_lock(hashtext(p_station || '|' || p_lane || '|' || d::text));
  select coalesce(max(number), 0) + 1 into n from tickets where station_id = p_station and day = d and lane = p_lane;
  insert into tickets (code, plate, station_id, lane, vtype, fuel, number, day, via, photo)
    values (bl_new_code('BL-T-'), p_plate, p_station, p_lane, p_vtype, p_fuel, n, d, p_via, p_photo)
    returning * into t;
  return jsonb_build_object('ok', true, 'ticket', bl_ticket_json(t));
end $$;

create or replace function public.get_ticket(p_code text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare t tickets;
begin
  select * into t from tickets where code = upper(trim(p_code));
  if not found then return null; end if;
  return bl_ticket_json(t);
end $$;

create or replace function public.cancel_ticket(p_code text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare t tickets;
begin
  update tickets set status = 'cancelled' where code = upper(trim(p_code)) and status = 'waiting' returning * into t;
  if not found then select * into t from tickets where code = upper(trim(p_code)); end if;
  if t.id is null then return null; end if;
  return bl_ticket_json(t);
end $$;

-- =====================================================================
--  GATES (entry and exit) — gate agent, manager or wilaya accounts
-- =====================================================================
create or replace function public.bl_refuse(p_station text, p_barrier text, p_ref text, p_plate text, p_title text, p_msg text, p_ticket jsonb, p_pass jsonb, p_soft boolean)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  insert into gate_events (station_id, barrier, kind, ref, plate, note, by_user) values (p_station, p_barrier, 'refused', p_ref, p_plate, p_title, auth.uid());
  return jsonb_build_object('open', false, 'soft', p_soft, 'title', p_title, 'msg', p_msg, 'ticket', p_ticket, 'pass', p_pass);
end $$;

create or replace function public.gate_scan(p_code text, p_station text, p_barrier text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare m text[]; c text; t tickets; p passes; s stations; tj jsonb; pj jsonb; li int; win int; ahead int; eta int; mpv int; fuel_ok boolean;
begin
  if not bl_can(p_station, array['gate','manager','wilaya']) then raise exception 'not_allowed' using hint = 'هذا الحساب لا يملك صلاحية هذا الحاجز'; end if;
  if p_barrier not in ('in','out') then raise exception 'bad_barrier'; end if;
  select * into s from stations where id = p_station;
  m := regexp_match(upper(coalesce(p_code,'')), '(?:BL|DAWRI)-([TP])-([A-Z0-9]{4,12})');
  if m is null and upper(trim(coalesce(p_code,''))) ~ '^[A-Z0-9]{8}$' then m := array['T', upper(trim(p_code))]; end if;
  if m is null then return bl_refuse(p_station, p_barrier, '', '', 'رمز غير معروف', 'هذا ليس رمز تذكرة ولا تصريح.', null, null, false); end if;
  c := 'BL-' || m[1] || '-' || m[2];

  -- ---- permanent passes ----
  if m[1] = 'P' then
    select * into p from passes where code = c for update;
    if not found then return bl_refuse(p_station, p_barrier, c, '', 'تصريح غير موجود', 'هذا التصريح غير مسجّل لدى الولاية.', null, null, false); end if;
    pj := bl_pass_json(p);
    if p.revoked then return bl_refuse(p_station, p_barrier, p.id::text, p.plate, 'تصريح ملغى', 'أُلغي هذا التصريح.', null, pj, false); end if;
    if now() not between p.valid_from and p.valid_to then return bl_refuse(p_station, p_barrier, p.id::text, p.plate, 'تصريح منتهي الصلاحية', 'انتهت مدة هذا التصريح.', null, pj, false); end if;
    if p.station_id is not null and p.station_id <> p_station then return bl_refuse(p_station, p_barrier, p.id::text, p.plate, 'التصريح لمحطة أخرى', 'هذا التصريح صالح في محطة أخرى فقط.', null, pj, false); end if;
    if p_barrier = 'in' then
      if p.inside then return bl_refuse(p_station, p_barrier, p.id::text, p.plate, 'التصريح مسجّل داخل المحطة', 'مركبة دخلت بهذا التصريح ولم تخرج بعد. يُمسح عند الخروج أولاً.', null, pj, false); end if;
      update passes set inside = true, inside_station = p_station, inside_at = now() where id = p.id returning * into p;
    else
      if not p.inside or p.inside_station is distinct from p_station then
        perform bl_alert(p_station, p.plate, 'noentry', 'تصريح مُسح عند الخروج دون المرور من حاجز الدخول');
        return bl_refuse(p_station, p_barrier, p.id::text, p.plate, 'لم يمرّ من حاجز الدخول', 'لا يُفتح حاجز الخروج إلا لمن دخل من حاجز الدخول.', null, pj, false);
      end if;
      update passes set inside = false where id = p.id returning * into p;
    end if;
    insert into gate_events (station_id, barrier, kind, ref, plate, note, by_user) values (p_station, p_barrier, 'pass', p.id::text, p.plate, p.type, auth.uid());
    return jsonb_build_object('open', true, 'kind', 'pass', 'pass', bl_pass_json(p));
  end if;

  -- ---- tickets ----
  select * into t from tickets where code = c for update;
  if not found then return bl_refuse(p_station, p_barrier, c, '', 'تذكرة غير موجودة', 'لم تُسجَّل هذه التذكرة.', null, null, false); end if;
  tj := bl_ticket_json(t);
  if t.station_id <> p_station then
    perform bl_alert(p_station, t.plate, 'wrongst', 'تذكرة محطة أخرى قُدّمت عند ' || s.name);
    return bl_refuse(p_station, p_barrier, t.id::text, t.plate, 'التذكرة لمحطة أخرى', 'هذه التذكرة صالحة في ' || (tj->>'stationName') || ' فقط.', tj, null, false);
  end if;
  if t.status = 'cancelled' then return bl_refuse(p_station, p_barrier, t.id::text, t.plate, 'تذكرة ملغاة', 'أُلغي هذا الدور.', tj, null, false); end if;

  if p_barrier = 'in' then
    if t.status = 'inside' then
      perform bl_alert(p_station, t.plate, 'reuse', 'محاولة دخول ثانية بتذكرة ' || bl_lane_label(t.lane) || ' ' || t.number || ' وصاحبها ما زال داخل المحطة');
      return bl_refuse(p_station, p_barrier, t.id::text, t.plate, 'المركبة داخل المحطة', 'دخلت بهذه التذكرة مركبة لم تخرج بعد. لا تُقبل مرتين.', tj, null, false);
    end if;
    if t.status = 'done' then
      perform bl_alert(p_station, t.plate, 'reuse', 'محاولة دخول بتذكرة مستعملة ' || bl_lane_label(t.lane) || ' ' || t.number);
      return bl_refuse(p_station, p_barrier, t.id::text, t.plate, 'التذكرة استُعملت', 'دخلت بها المركبة الساعة ' || bl_hm(t.entered_at) || ' وخرجت الساعة ' || bl_hm(t.exited_at) || '.', tj, null, false);
    end if;
    if t.day <> bl_today() then return bl_refuse(p_station, p_barrier, t.id::text, t.plate, 'تذكرة قديمة', 'التذكرة صالحة في يوم الحجز فقط. احجز من جديد.', tj, null, false); end if;
    fuel_ok := case t.fuel when 'essence' then s.fuel_essence else s.fuel_gasoil end;
    if not fuel_ok then return bl_refuse(p_station, p_barrier, t.id::text, t.plate, case t.fuel when 'essence' then 'بنزين' else 'مازوت' end || ' غير متوفر الآن', 'التذكرة تبقى صالحة اليوم. ارجع عند وصول الصهريج.', tj, null, true); end if;
    if not (tj->>'canEnter')::boolean then
      return bl_refuse(p_station, p_barrier, t.id::text, t.plate, 'لم يحن دورك بعد',
        'ارجع حوالي الساعة ' || bl_hm(now() + make_interval(mins => (tj->>'etaMin')::int)) || '. قبلك ' || (tj->>'ahead') || '.', tj, null, true);
    end if;
    update tickets set status = 'inside', entered_at = now() where id = t.id returning * into t;
  else
    if t.status = 'waiting' then
      perform bl_alert(p_station, t.plate, 'noentry', 'تذكرة ' || bl_lane_label(t.lane) || ' ' || t.number || ' قُدّمت عند الخروج ولم تمرّ من حاجز الدخول');
      return bl_refuse(p_station, p_barrier, t.id::text, t.plate, 'لم تمرّ من حاجز الدخول', 'هذه المركبة لم تدخل بتذكرتها. أُرسل تنبيه إلى المدير والولاية.', tj, null, false);
    end if;
    if t.status = 'done' then
      perform bl_alert(p_station, t.plate, 'reuse', 'محاولة خروج ثانية بتذكرة ' || bl_lane_label(t.lane) || ' ' || t.number);
      return bl_refuse(p_station, p_barrier, t.id::text, t.plate, 'خرجت من قبل', 'خرجت هذه المركبة الساعة ' || bl_hm(t.exited_at) || '.', tj, null, false);
    end if;
    update tickets set status = 'done', exited_at = now() where id = t.id returning * into t;
  end if;
  insert into gate_events (station_id, barrier, kind, ref, plate, note, by_user) values (p_station, p_barrier, 'ticket', t.id::text, t.plate, '', auth.uid());
  return jsonb_build_object('open', true, 'kind', 'ticket', 'ticket', bl_ticket_json(t));
end $$;

create or replace function public.manual_open(p_station text, p_barrier text, p_reason text) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
begin
  if not bl_can(p_station, array['manager','wilaya']) then return jsonb_build_object('ok', false, 'error', 'الفتح اليدوي للمدير فقط'); end if;
  if p_barrier not in ('in','out') then raise exception 'bad_barrier'; end if;
  insert into gate_events (station_id, barrier, kind, note, by_user) values (p_station, p_barrier, 'manual', left(p_reason, 120), auth.uid());
  perform bl_alert(p_station, '', 'manual', 'فتح يدوي لحاجز ' || case p_barrier when 'in' then 'الدخول' else 'الخروج' end || ': ' || left(p_reason, 120));
  return jsonb_build_object('ok', true);
end $$;

-- =====================================================================
--  STAFF FUNCTIONS
-- =====================================================================
create or replace function public.my_profile() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('role', role, 'station', station_id, 'name', name) from staff where user_id = auth.uid()
$$;

create or replace function public.manager_data(p_station text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare s stations; lim int;
begin
  if not bl_can(p_station, array['manager','wilaya']) then raise exception 'not_allowed'; end if;
  select * into s from stations where id = p_station;
  select long_inside_minutes into lim from settings where id = 1;
  return jsonb_build_object(
    'station', jsonb_build_object('id', s.id, 'name', s.name, 'fuel', jsonb_build_object('essence', s.fuel_essence, 'gasoil', s.fuel_gasoil), 'pumps', jsonb_build_object('women', s.pumps_women, 'men', s.pumps_men, 'state', s.pumps_state)),
    'kpis', jsonb_build_object(
      'waiting', (select count(*) from tickets where station_id = p_station and day = bl_today() and status = 'waiting'),
      'inside', (select count(*) from tickets where station_id = p_station and status = 'inside'),
      'done', (select count(*) from tickets where station_id = p_station and status = 'done' and exited_at >= now() - interval '24 hours' and day = bl_today()),
      'manual', (select count(*) from gate_events where station_id = p_station and kind = 'manual' and at >= date_trunc('day', now()))),
    'queue', coalesce((select jsonb_agg(bl_ticket_json(t) order by t.created_at) from tickets t where t.station_id = p_station and t.day = bl_today() and t.status = 'waiting'), '[]'),
    'inside', coalesce((select jsonb_agg(bl_ticket_json(t) order by t.entered_at) from tickets t where t.station_id = p_station and t.status = 'inside'), '[]'),
    'done', coalesce((select jsonb_agg(x) from (select bl_ticket_json(t) x from tickets t where t.station_id = p_station and t.status = 'done' and t.day = bl_today() order by t.exited_at desc limit 8) q), '[]'),
    'longInside', coalesce((select jsonb_agg(bl_ticket_json(t)) from tickets t where t.station_id = p_station and t.status = 'inside' and t.entered_at < now() - make_interval(mins => lim)), '[]'),
    'passesInside', coalesce((select jsonb_agg(bl_pass_json(p)) from passes p where p.inside and p.inside_station = p_station), '[]'),
    'log', coalesce((select jsonb_agg(jsonb_build_object('at', g.at, 'barrier', g.barrier, 'kind', g.kind, 'plate', g.plate, 'note', g.note)) from (select * from gate_events where station_id = p_station order by at desc limit 10) g), '[]'),
    'passes', coalesce((select jsonb_agg(bl_pass_json(p) order by p.created_at desc) from passes p where p.station_id is null or p.station_id = p_station), '[]'),
    'meter', bl_meter(p_station),
    'alerts', coalesce((select jsonb_agg(a) from (select station_id as station, plate, reason, detail, at from alerts where station_id = p_station order by at desc limit 6) a), '[]'));
end $$;

create or replace function public.update_station(p_station text, p_essence boolean, p_gasoil boolean, p_pumps_women int, p_pumps_men int, p_pumps_state int)
returns boolean language plpgsql volatile security definer set search_path = public as $$
begin
  if not bl_can(p_station, array['manager','wilaya']) then raise exception 'not_allowed'; end if;
  update stations set
    fuel_essence = coalesce(p_essence, fuel_essence), fuel_gasoil = coalesce(p_gasoil, fuel_gasoil),
    pumps_women = least(8, greatest(1, coalesce(p_pumps_women, pumps_women))),
    pumps_men = least(8, greatest(1, coalesce(p_pumps_men, pumps_men))),
    pumps_state = least(8, greatest(1, coalesce(p_pumps_state, pumps_state)))
  where id = p_station;
  return true;
end $$;

create or replace function public.update_meter(p_station text, p_start bigint, p_now bigint) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare m jsonb;
begin
  if not bl_can(p_station, array['manager','wilaya']) then raise exception 'not_allowed'; end if;
  if p_now < p_start then raise exception 'meter_order'; end if;
  update stations set meter_start = p_start, meter_now = p_now, meter_read_at = now() where id = p_station;
  m := bl_meter(p_station);
  if (m->>'over')::bigint > 0 then perform bl_alert(p_station, '', 'meter', 'العدّاد سجّل ' || (m->>'over') || ' لتر أكثر مما يحق للمركبات التي دخلت'); end if;
  return m;
end $$;

create or replace function public.no_show(p_ticket uuid) returns boolean
language plpgsql volatile security definer set search_path = public as $$
declare sid text;
begin
  select station_id into sid from tickets where id = p_ticket;
  if not bl_can(sid, array['manager','wilaya']) then raise exception 'not_allowed'; end if;
  update tickets set status = 'cancelled' where id = p_ticket and status = 'waiting';
  return true;
end $$;

create or replace function public.issue_pass(p_type text, p_holder text, p_plate text, p_station text, p_days int) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare p passes; until_ts timestamptz;
begin
  if p_type = 'maint' then
    if not bl_can(p_station, array['manager','wilaya']) then raise exception 'not_allowed'; end if;
    until_ts := ((bl_today() + 1)::timestamp at time zone (select timezone from settings where id = 1)) - interval '1 minute';
  else
    if bl_role() is distinct from 'wilaya' then raise exception 'not_allowed' using hint = 'تصاريح نفطال والغاز والحماية المدنية تصدرها الولاية'; end if;
    until_ts := now() + make_interval(days => least(greatest(coalesce(p_days, 30), 1), 366));
  end if;
  insert into passes (code, type, holder, plate, station_id, valid_to, created_by)
    values (bl_new_code('BL-P-'), p_type, left(p_holder, 120), nullif(regexp_replace(coalesce(p_plate,''), '\D', '', 'g'), ''),
            case when p_type = 'maint' then p_station else nullif(p_station, '') end, until_ts, auth.uid())
    returning * into p;
  return bl_pass_json(p);
end $$;

create or replace function public.revoke_pass(p_id uuid) returns boolean
language plpgsql volatile security definer set search_path = public as $$
declare p passes;
begin
  select * into p from passes where id = p_id;
  if not found then return false; end if;
  if not (bl_role() = 'wilaya' or (p.type = 'maint' and bl_can(p.station_id, array['manager']))) then raise exception 'not_allowed'; end if;
  update passes set revoked = true where id = p_id;
  return true;
end $$;

create or replace function public.wilaya_data() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if bl_role() is distinct from 'wilaya' then raise exception 'not_allowed'; end if;
  return jsonb_build_object(
    'rows', coalesce((select jsonb_agg(r order by r->>'id') from (
      select jsonb_build_object('id', s.id, 'name', s.name,
        'tickets', (select count(*) from tickets t where t.station_id = s.id and t.day = bl_today()),
        'waiting', (select count(*) from tickets t where t.station_id = s.id and t.day = bl_today() and t.status = 'waiting'),
        'inside', (select count(*) from tickets t where t.station_id = s.id and t.status = 'inside'),
        'done', (select count(*) from tickets t where t.station_id = s.id and t.day = bl_today() and t.status = 'done'),
        'manual', mn, 'sold', (m->>'sold')::bigint, 'allowed', (m->>'allowed')::bigint, 'over', (m->>'over')::bigint,
        'reasons', to_jsonb(array_remove(array[
          case when (m->>'over')::bigint > 0 then 'وقود خارج الحاجز' end,
          case when mn >= 3 then 'فتح يدوي متكرر' end,
          case when ne > 0 then 'دخول من باب الخروج' end], null))) r
      from stations s,
        lateral (select bl_meter(s.id) m) mm,
        lateral (select count(*) mn from gate_events g where g.station_id = s.id and g.kind = 'manual' and g.at >= date_trunc('day', now())) mm2,
        lateral (select count(*) ne from alerts a where a.station_id = s.id and a.reason = 'noentry' and a.at >= date_trunc('day', now())) mm3
      where s.active) x), '[]'),
    'alerts', coalesce((select jsonb_agg(a) from (select a.station_id as station, s.name as "stationName", a.plate, a.reason, a.detail, a.at from alerts a left join stations s on s.id = a.station_id order by a.at desc limit 10) a), '[]'),
    'repeat', coalesce((select jsonb_agg(r) from (select plate, count(*) as count, max(at) as last from alerts where plate is not null and at > now() - interval '30 days' group by plate having count(*) >= 2 order by count(*) desc limit 20) r), '[]'),
    'rules', get_rules(),
    'exempt', coalesce((select jsonb_agg(jsonb_build_object('plate', plate, 'cat', category) order by created_at) from exempt_plates), '[]'),
    'passes', coalesce((select jsonb_agg(bl_pass_json(p) order by p.created_at desc) from passes p where p.type <> 'maint'), '[]'));
end $$;

create or replace function public.set_rule(p_vtype text, p_window int, p_max int) returns boolean
language plpgsql volatile security definer set search_path = public as $$
begin
  if bl_role() is distinct from 'wilaya' then raise exception 'not_allowed'; end if;
  update vehicle_rules set window_hours = coalesce(p_window, window_hours), max_liters = coalesce(p_max, max_liters) where vtype = p_vtype;
  return true;
end $$;

create or replace function public.add_exempt(p_plate text, p_cat text) returns boolean
language plpgsql volatile security definer set search_path = public as $$
begin
  if bl_role() is distinct from 'wilaya' then raise exception 'not_allowed'; end if;
  p_plate := regexp_replace(coalesce(p_plate,''), '\D', '', 'g');
  if length(p_plate) not between 8 and 11 then raise exception 'plate'; end if;
  insert into exempt_plates (plate, category) values (p_plate, p_cat) on conflict (plate) do update set category = excluded.category;
  return true;
end $$;

create or replace function public.remove_exempt(p_plate text) returns boolean
language plpgsql volatile security definer set search_path = public as $$
begin
  if bl_role() is distinct from 'wilaya' then raise exception 'not_allowed'; end if;
  delete from exempt_plates where plate = p_plate;
  return true;
end $$;

-- ---------- who may call what ----------
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.get_rules(), public.station_overview(), public.check_plate(text, text),
  public.register_ticket(text, text, text, text, text, text, text), public.get_ticket(text), public.cancel_ticket(text)
  to anon, authenticated;
grant execute on function public.gate_scan(text, text, text), public.manual_open(text, text, text), public.my_profile(),
  public.manager_data(text), public.update_station(text, boolean, boolean, int, int, int), public.update_meter(text, bigint, bigint),
  public.no_show(uuid), public.issue_pass(text, text, text, text, int), public.revoke_pass(uuid), public.wilaya_data(),
  public.set_rule(text, int, int), public.add_exempt(text, text), public.remove_exempt(text)
  to authenticated;

-- =====================================================================
--  CREATE STAFF ACCOUNTS (after adding the user in Authentication → Users):
--  insert into public.staff (user_id, role, station_id, name)
--  select id, 'wilaya', null, 'مصالح الولاية' from auth.users where email = 'wilaya@example.dz';
--  select id, 'manager', 's1', 'مدير محطة وسط المدينة' from auth.users where email = 'manager.s1@example.dz';
--  select id, 'gate', 's1', 'حاجز محطة وسط المدينة' from auth.users where email = 'gate.s1@example.dz';
-- =====================================================================
