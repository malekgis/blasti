/* قاعدة بيانات العرض: كل شيء في هذا الجهاز فقط (localStorage).
   نفس الدوال التي توفرها قاعدة البيانات الحقيقية في api-supabase.js */
window.BlastiDemoAPI = (function () {
  "use strict";
  const B = window.BL, CFG = window.BLASTI_CONFIG || {};
  const KEY = "blasti-demo-v1", H = 3600e3, D = 864e5, LONG_INSIDE_MIN = 30;
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[rnd(0, a.length - 1)];
  const ALPHA = "ACDEFHJKMNPRTUVWXY3479";
  const newId = (n = 8) => { let s = ""; for (let i = 0; i < n; i++) s += ALPHA[rnd(0, ALPHA.length - 1)]; return s; };
  const randPlate = w => String(rnd(100, 99999)).padStart(5, "0") + "1" + String(rnd(5, 25)).padStart(2, "0") + String(w ?? (Math.random() < .85 ? 11 : pick([1, 30, 47, 53, 54]))).padStart(2, "0");
  const today = B.dayKey;
  let S, session = null;

  function defaultRules() {
    return { minPer: 4, veh: {
      car: { win: 48, max: 50, fuels: ["essence", "gasoil"] }, moto: { win: 24, max: 10, fuels: ["essence"] },
      suv: { win: 48, max: 80, fuels: ["essence", "gasoil"] }, pickup: { win: 48, max: 70, fuels: ["essence", "gasoil"] },
      truck: { win: 24, max: 200, fuels: ["gasoil"] }, bus: { win: 24, max: 150, fuels: ["gasoil"] }, tractor: { win: 72, max: 60, fuels: ["gasoil"] } } };
  }

  function seed() {
    const now = Date.now(), rules = defaultRules();
    const stations = [
      { id: "s1", name: "محطة وسط المدينة", pumps: { men: 2, women: 1, state: 1 }, fuel: { essence: true, gasoil: true } },
      { id: "s2", name: "محطة طريق عين صالح", pumps: { men: 2, women: 1, state: 1 }, fuel: { essence: true, gasoil: true } },
      { id: "s3", name: "محطة قطع الواد", pumps: { men: 1, women: 1, state: 1 }, fuel: { essence: true, gasoil: false } },
      { id: "s4", name: "محطة سرسوف", pumps: { men: 2, women: 1, state: 1 }, fuel: { essence: false, gasoil: false } }
    ];
    const tickets = [], gate = [], alerts = [], exempt = {};
    const vbag = ["car", "car", "car", "car", "car", "car", "car", "car", "suv", "suv", "suv", "pickup", "pickup", "moto", "moto", "truck", "bus", "tractor"];
    const plan = { s1: { men: [9, 2, 13], women: [3, 1, 3], state: [2, 1, 2] }, s2: { men: [5, 2, 8], women: [2, 1, 2], state: [1, 1, 1] }, s3: { men: [6, 1, 9], women: [2, 0, 4], state: [1, 0, 1] }, s4: { men: [3, 0, 15], women: [1, 0, 5], state: [1, 0, 3] } };
    const mk = (sid, lane, n, status, created) => {
      const v = lane === "state" ? pick(["car", "suv", "pickup"]) : pick(vbag), p = randPlate();
      if (lane === "state") exempt[p] = "state";
      const id = newId();
      return { id, code: "BL-T-" + id, plate: p, station: sid, lane, vtype: v, fuel: pick(rules.veh[v].fuels), number: n, day: today(created), createdAt: created, via: pick(["self", "self", "self", "self", "cyber", "cyber", "commune", "post"]), photo: null, status };
    };
    const ev = (sid, barrier, kind, ref, plate, note, at) => gate.push({ id: newId(), station: sid, barrier, kind, ref, plate, note, at });
    stations.forEach(s => {
      Object.keys(B.LANES).forEach(lane => {
        const [done, inside, wait] = plan[s.id][lane]; let n = 0;
        for (let i = 0; i < done; i++) { n++; const tIn = now - (done - i + 1) * rnd(16, 24) * 60e3; const t = mk(s.id, lane, n, "done", tIn - rnd(50, 150) * 60e3); t.enteredAt = tIn; t.exitedAt = tIn + rnd(6, 12) * 60e3; tickets.push(t); ev(s.id, "in", "ticket", t.id, t.plate, "", t.enteredAt); ev(s.id, "out", "ticket", t.id, t.plate, "", t.exitedAt); }
        for (let i = 0; i < inside; i++) { n++; const tIn = now - rnd(3, 12) * 60e3; const t = mk(s.id, lane, n, "inside", tIn - rnd(40, 120) * 60e3); t.enteredAt = tIn; tickets.push(t); ev(s.id, "in", "ticket", t.id, t.plate, "", t.enteredAt); }
        for (let i = 0; i < wait; i++) { n++; tickets.push(mk(s.id, lane, n, "waiting", now - (wait - i) * rnd(4, 9) * 60e3 - rnd(2, 6) * 60e3)); }
      });
      for (let k = 0; k < 5; k++) { const tIn = now - rnd(20, 40) * H; const t = mk(s.id, "men", k + 1, "done", tIn - H); t.vtype = "car"; t.fuel = "essence"; t.enteredAt = tIn; t.exitedAt = tIn + 9 * 60e3; tickets.push(t); }
    });
    /* s2: a vehicle inside for 52 minutes, a car that came in through the exit, manual openings */
    const longOne = tickets.find(t => t.station === "s2" && t.status === "inside" && t.lane === "men"); if (longOne) { longOne.enteredAt = now - 52 * 60e3; }
    for (let k = 0; k < 4; k++) ev("s2", "in", "manual", "", "", pick(["عطل في الماسح", "سيارة بلا تذكرة"]), now - rnd(1, 6) * H);
    const sneak = tickets.find(t => t.station === "s2" && t.status === "waiting");
    if (sneak) { ev("s2", "out", "refused", sneak.id, sneak.plate, "لم تمرّ من حاجز الدخول", now - 40 * 60e3); alerts.push({ id: newId(), plate: sneak.plate, station: "s2", reason: "noentry", detail: "قُدّمت تذكرته عند حاجز الخروج ولم تمرّ من حاجز الدخول", at: now - 40 * 60e3 }); }
    const rep = randPlate(11);
    { const tIn = now - 26 * H; const t = mk("s1", "men", 7, "done", tIn - H); t.plate = rep; t.vtype = "suv"; t.fuel = "gasoil"; t.enteredAt = tIn; t.exitedAt = tIn + 8 * 60e3; tickets.push(t); }
    alerts.push({ id: newId(), plate: rep, station: "s3", reason: "recent", detail: "حاول الحجز في اليوم الموالي لتزوّده في محطة وسط المدينة", at: now - 3 * H });
    alerts.push({ id: newId(), plate: rep, station: "s2", reason: "vtype", detail: "سُجّلت قبلها كرباعية الدفع، واليوم اختار دراجة نارية", at: now - 1.5 * H });
    alerts.push({ id: newId(), plate: "", station: "s2", reason: "manual", detail: "4 فتحات يدوية لحاجز الدخول اليوم", at: now - H });
    const P = (type, holder, plate, st, days) => { const id = newId(); return { id, code: "BL-P-" + id, type, holder, plate, station: st, from: now - 2 * D, to: now + days * D, revoked: false, inside: false }; };
    const passes = [P("naftal", "نفطال · مركز تمنراست", randPlate(11), null, 90), P("naftal", "نفطال · مركز تمنراست", randPlate(11), null, 90), P("gas", "موزّع الغاز المعتمد", randPlate(11), null, 60), P("civil", "الحماية المدنية · الوحدة الرئيسية", randPlate(11), null, 365), P("maint", "تقني مضخات · مؤسسة خاصة", "", "s1", 1)];
    passes[1].inside = true; passes[1].insideStation = "s1"; passes[1].insideAt = now - 20 * 60e3; ev("s1", "in", "pass", passes[1].id, passes[1].plate, "صهريج نفطال", passes[1].insideAt);
    passes[4].from = now - H; passes[4].to = now + 10 * H;
    stations.forEach(s => {
      const allowed = tickets.filter(t => t.station === s.id && t.enteredAt && today(t.enteredAt) === today()).reduce((a, t) => a + rules.veh[t.vtype].max, 0);
      const start = rnd(120000, 880000), sold = s.id === "s2" ? allowed + 1450 : Math.round(allowed * (.55 + Math.random() * .1));
      s.meter = { start, now: start + sold, readAt: now - 20 * 60e3 };
    });
    ["transport", "transport", "freight", "state", "state"].forEach(c => exempt[randPlate(11)] = c);
    return { v: 1, stations, tickets, gate, alerts, passes, exempt, rules };
  }
  function load() { try { const raw = localStorage.getItem(KEY); if (raw) { const o = JSON.parse(raw); if (o && o.v === 1) { S = o; return; } } } catch (e) {} S = seed(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { try { S.tickets.forEach(t => (t.photo = null)); localStorage.setItem(KEY, JSON.stringify(S)); } catch (e2) {} } }
  load();

  /* ---------- queue rules (identical to the SQL functions) ---------- */
  const st = id => S.stations.find(s => s.id === id);
  const pumpsOf = (s, lane) => Math.max(1, s.pumps[lane] || 1);
  const todays = (sid, lane) => S.tickets.filter(t => t.station === sid && t.day === today() && (!lane || t.lane === lane));
  const waiting = (sid, lane) => todays(sid, lane).filter(t => t.status === "waiting").sort((a, b) => a.number - b.number);
  const lastIn = (sid, lane) => todays(sid, lane).filter(t => t.status === "inside" || t.status === "done").reduce((m, t) => Math.max(m, t.number), 0);
  const gateWindow = (sid, lane) => pumpsOf(st(sid), lane) * 2;
  const aheadOf = t => { const li = lastIn(t.station, t.lane); return waiting(t.station, t.lane).filter(x => x.number > li && x.number < t.number).length; };
  const canEnter = t => t.number <= lastIn(t.station, t.lane) + gateWindow(t.station, t.lane);
  const etaMin = t => canEnter(t) ? 0 : Math.ceil(Math.max(1, aheadOf(t) - gateWindow(t.station, t.lane) + 1) * S.rules.minPer / pumpsOf(st(t.station), t.lane));
  const enteredToday = (sid, lane) => S.tickets.filter(t => t.station === sid && t.enteredAt && today(t.enteredAt) === today() && (!lane || t.lane === lane));
  const lastEntered = plate => S.tickets.filter(t => t.plate === plate && t.enteredAt).sort((a, b) => b.enteredAt - a.enteredAt)[0];
  const activeTicket = plate => S.tickets.find(t => t.plate === plate && (t.status === "waiting" || t.status === "inside") && t.day === today());
  const fuelOk = t => !!st(t.station).fuel[t.fuel];
  function tv(t) { if (!t) return null; return Object.assign({}, t, { stationName: st(t.station).name, ahead: t.status === "waiting" ? aheadOf(t) : 0, canEnter: t.status === "waiting" && canEnter(t), etaMin: t.status === "waiting" ? etaMin(t) : 0, max: S.rules.veh[t.vtype].max, isToday: t.day === today(), fuelOk: fuelOk(t) }); }
  const pub = t => t && { id: t.id, number: t.number, lane: t.lane, station: t.station, stationName: st(t.station).name, status: t.status, enteredAt: t.enteredAt || null };
  const pv = p => Object.assign({}, p, { live: !p.revoked && Date.now() >= p.from && Date.now() <= p.to });
  function alert(plate, sid, reason, detail) { if (S.alerts.find(a => a.plate === plate && a.station === sid && a.reason === reason && Date.now() - a.at < 120e3)) return; S.alerts.unshift({ id: newId(), plate, station: sid, reason, detail, at: Date.now() }); S.alerts = S.alerts.slice(0, 300); }
  function ev(sid, barrier, kind, ref, plate, note) { S.gate.push({ id: newId(), station: sid, barrier, kind, ref, plate, note, at: Date.now() }); if (S.gate.length > 800) S.gate = S.gate.slice(-800); }
  function rawCheck(plate, sid) {
    const cat = S.exempt[plate] || null, act = activeTicket(plate);
    if (act) return act.station === sid ? { kind: "mine", reason: "queue", ticket: act } : { kind: "red", reason: "queue", ticket: act };
    const last = lastEntered(plate);
    if (last && !cat) { const w = S.rules.veh[last.vtype].win; if (Date.now() - last.enteredAt < w * H) return { kind: "red", reason: "recent", ticket: last, until: last.enteredAt + w * H }; }
    return { kind: "ok", cat, lastV: last ? last.vtype : null };
  }
  const meterOf = sid => { const s = st(sid), sold = s.meter.now - s.meter.start, ent = enteredToday(sid), allowed = ent.reduce((a, t) => a + S.rules.veh[t.vtype].max, 0); return { start: s.meter.start, now: s.meter.now, readAt: s.meter.readAt, sold, count: ent.length, allowed, over: sold - allowed, avg: ent.length ? sold / ent.length : 0 }; };
  const manualToday = sid => S.gate.filter(g => g.station === sid && g.kind === "manual" && today(g.at) === today());
  const P = v => Promise.resolve(v);

  const api = {
    mode: "demo",
    stations: () => P(S.stations.map(s => ({ id: s.id, name: s.name, fuel: Object.assign({}, s.fuel), pumps: Object.assign({}, s.pumps), waiting: { women: waiting(s.id, "women").length, men: waiting(s.id, "men").length, state: waiting(s.id, "state").length } }))),
    rules: () => P(JSON.parse(JSON.stringify(S.rules))),
    checkPlate(plate, sid) {
      plate = B.norm(plate); const r = rawCheck(plate, sid);
      if (r.kind === "red") { alert(plate, sid, r.reason, r.reason === "recent" ? `حاول الحجز ${B.ago(r.ticket.enteredAt)} بعد تزوّده في ${st(r.ticket.station).name}` : `له تذكرة اليوم في ${st(r.ticket.station).name}`); save(); }
      return P({ kind: r.kind, reason: r.reason || null, ticket: pub(r.ticket), until: r.until || null, lastV: r.lastV || null, cat: r.cat || null });
    },
    register({ plate, station, lane, vtype, fuel, via, photo }) {
      plate = B.norm(plate); const s = st(station), rule = S.rules.veh[vtype];
      if (!B.validPlate(plate) || !s || !rule || !rule.fuels.includes(fuel) || !["women", "men", "state"].includes(lane)) return P({ ok: false, kind: "invalid" });
      const r = rawCheck(plate, station);
      if (r.kind !== "ok") return P({ ok: false, kind: r.kind, reason: r.reason, ticket: pub(r.ticket), until: r.until || null });
      if (r.lastV && r.lastV !== vtype) alert(plate, station, "vtype", `سُجّلت قبلها كـ"${B.VEH[r.lastV].label}"، واليوم اختار "${B.VEH[vtype].label}"`);
      lane = r.cat === "state" ? "state" : lane === "state" ? "men" : lane;
      const id = newId(), num = todays(station, lane).reduce((m, t) => Math.max(m, t.number), 0) + 1;
      const t = { id, code: "BL-T-" + id, plate, station, lane, vtype, fuel, number: num, day: today(), createdAt: Date.now(), via: B.VIA[via] ? via : "self", photo: photo || null, status: "waiting" };
      S.tickets.push(t);
      const withPhoto = S.tickets.filter(x => x.photo); if (withPhoto.length > 12) withPhoto.slice(0, withPhoto.length - 12).forEach(x => (x.photo = null));
      save(); return P({ ok: true, ticket: tv(t) });
    },
    ticket: code => { const c = B.parseCode(code); return P(c ? tv(S.tickets.find(t => t.code === c.code)) : null); },
    cancel(code) { const t = S.tickets.find(x => x.code === code); if (t && t.status === "waiting") { t.status = "cancelled"; save(); } return P(tv(t)); },

    scan(code, sid, barrier) {
      const s = st(sid), c = B.parseCode(code);
      const refuse = (title, msg, t, soft, p) => { ev(sid, barrier, "refused", t ? t.id : p ? p.id : "", t ? t.plate : p ? p.plate : "", title); save(); return P({ open: false, soft: !!soft, title, msg, ticket: tv(t), pass: p ? pv(p) : null }); };
      if (!c) return refuse("رمز غير معروف", "هذا ليس رمز تذكرة ولا تصريح من " + (CFG.APP_NAME || "بلاصتي") + ".");
      if (c.k === "P") {
        const p = S.passes.find(x => x.code === c.code);
        if (!p) return refuse("تصريح غير موجود", "هذا التصريح غير مسجّل لدى الولاية.");
        if (p.revoked) return refuse("تصريح ملغى", `ألغت ${B.PASS[p.type].by} هذا التصريح.`, null, false, p);
        if (Date.now() < p.from || Date.now() > p.to) return refuse("تصريح منتهي الصلاحية", "انتهت مدة هذا التصريح.", null, false, p);
        if (p.station && p.station !== sid) return refuse("التصريح لمحطة أخرى", `هذا التصريح صالح في ${st(p.station).name} فقط.`, null, false, p);
        if (barrier === "in") {
          if (p.inside) return refuse("التصريح مسجّل داخل المحطة", "مركبة دخلت بهذا التصريح ولم تخرج بعد. يُمسح عند الخروج أولاً.", null, false, p);
          p.inside = true; p.insideAt = Date.now(); p.insideStation = sid;
        } else {
          if (!p.inside || p.insideStation !== sid) { alert(p.plate, sid, "noentry", `${B.PASS[p.type].label}: مُسح عند الخروج دون أن يمرّ من حاجز الدخول`); return refuse("لم يمرّ من حاجز الدخول", "لا يُفتح حاجز الخروج إلا لمن دخل من حاجز الدخول.", null, false, p); }
          p.inside = false;
        }
        ev(sid, barrier, "pass", p.id, p.plate, B.PASS[p.type].label); save();
        return P({ open: true, kind: "pass", pass: pv(p) });
      }
      const t = S.tickets.find(x => x.code === c.code);
      if (!t) return refuse("تذكرة غير موجودة", "لم تُسجَّل هذه التذكرة.");
      if (t.station !== sid) { alert(t.plate, sid, "wrongst", `تذكرة ${st(t.station).name} قُدّمت عند ${B.BARRIER[barrier]} في ${s.name}`); return refuse("التذكرة لمحطة أخرى", `هذه التذكرة صالحة في ${st(t.station).name} فقط.`, t); }
      if (t.status === "cancelled") return refuse("تذكرة ملغاة", "أُلغي هذا الدور.", t);
      if (barrier === "in") {
        if (t.status === "inside") { alert(t.plate, sid, "reuse", `محاولة دخول ثانية بتذكرة ${B.LANES[t.lane].l} ${t.number} وصاحبها ما زال داخل المحطة`); return refuse("المركبة داخل المحطة", "دخلت بهذه التذكرة مركبة لم تخرج بعد. لا تُقبل مرتين.", t); }
        if (t.status === "done") { alert(t.plate, sid, "reuse", `محاولة دخول بتذكرة مستعملة ${B.LANES[t.lane].l} ${t.number}`); return refuse("التذكرة استُعملت", `دخلت بها المركبة الساعة ${B.hm(t.enteredAt)} وخرجت الساعة ${B.hm(t.exitedAt)}.`, t); }
        if (t.day !== today()) return refuse("تذكرة قديمة", "التذكرة صالحة في يوم الحجز فقط. احجز من جديد.", t);
        if (!fuelOk(t)) return refuse(`${B.FUEL[t.fuel]} غير متوفر الآن`, "التذكرة تبقى صالحة اليوم. ارجع عند وصول الصهريج.", t, true);
        if (!canEnter(t)) return refuse("لم يحن دورك بعد", `ارجع حوالي الساعة ${B.hm(Date.now() + etaMin(t) * 60e3)}. قبلك ${B.cars(aheadOf(t))}.`, t, true);
        t.status = "inside"; t.enteredAt = Date.now();
      } else {
        if (t.status === "waiting") { alert(t.plate, sid, "noentry", `تذكرة ${B.LANES[t.lane].l} ${t.number} قُدّمت عند الخروج ولم تمرّ من حاجز الدخول`); return refuse("لم تمرّ من حاجز الدخول", "هذه المركبة لم تدخل بتذكرتها. أُرسل تنبيه إلى المدير والولاية.", t); }
        if (t.status === "done") { alert(t.plate, sid, "reuse", `محاولة خروج ثانية بتذكرة ${B.LANES[t.lane].l} ${t.number}`); return refuse("خرجت من قبل", `خرجت هذه المركبة الساعة ${B.hm(t.exitedAt)}.`, t); }
        t.status = "done"; t.exitedAt = Date.now();
      }
      ev(sid, barrier, "ticket", t.id, t.plate, ""); save();
      return P({ open: true, kind: "ticket", ticket: tv(t) });
    },
    manualOpen(sid, barrier, reason, pin) {
      if (String(pin || "").trim() !== String(CFG.DEMO_PIN || "2026")) return P({ ok: false, error: "pin" });
      ev(sid, barrier, "manual", "", "", reason); alert("", sid, "manual", `فتح يدوي لـ${B.BARRIER[barrier]}: ${reason}`); save(); return P({ ok: true });
    },

    /* staff */
    session: () => P(session),
    login({ station, pin }) { if (String(pin || "").trim() !== String(CFG.DEMO_PIN || "2026")) return Promise.reject({ code: "bad_login" }); session = { role: "manager", station, name: "مدير " + st(station).name }; return P(session); },
    logout() { session = null; return P(true); },
    managerData(sid) {
      const s = st(sid), now = Date.now();
      const w = waiting(sid), inside = S.tickets.filter(t => t.station === sid && t.status === "inside").sort((a, b) => a.enteredAt - b.enteredAt);
      const done = S.tickets.filter(t => t.station === sid && t.status === "done" && t.exitedAt && today(t.exitedAt) === today()).sort((a, b) => b.exitedAt - a.exitedAt);
      return P({
        station: { id: s.id, name: s.name, fuel: Object.assign({}, s.fuel), pumps: Object.assign({}, s.pumps) },
        kpis: { waiting: w.length, inside: inside.length, done: done.length, manual: manualToday(sid).length },
        queue: w.map(tv), inside: inside.map(tv), done: done.slice(0, 8).map(tv),
        longInside: inside.filter(t => now - t.enteredAt > LONG_INSIDE_MIN * 60e3).map(tv),
        passesInside: S.passes.filter(p => p.inside && p.insideStation === sid).map(pv),
        log: S.gate.filter(g => g.station === sid).slice(-10).reverse(),
        passes: S.passes.filter(p => !p.station || p.station === sid).map(pv),
        meter: meterOf(sid), alerts: S.alerts.filter(a => a.station === sid).slice(0, 6)
      });
    },
    updateStation(sid, patch) { const s = st(sid); if (patch.fuel) Object.assign(s.fuel, patch.fuel); if (patch.pumps) Object.keys(patch.pumps).forEach(l => (s.pumps[l] = Math.min(8, Math.max(1, patch.pumps[l])))); save(); return P(true); },
    updateMeter(sid, start, now) {
      const s = st(sid); if (start != null) s.meter.start = start; if (now != null) s.meter.now = now; s.meter.readAt = Date.now();
      if (s.meter.now < s.meter.start) return Promise.reject({ code: "meter_order" });
      const m = meterOf(sid); if (m.over > 0) alert("", sid, "meter", `العدّاد سجّل ${B.L(m.over)} أكثر مما يحق للمركبات التي دخلت`);
      save(); return P(m);
    },
    noShow(id) { const t = S.tickets.find(x => x.id === id); if (t && t.status === "waiting") t.status = "cancelled"; save(); return P(true); },
    issuePass({ type, holder, plate, station, days }) {
      const id = newId(), now = Date.now(); let to = now + (days || 1) * D;
      if (type === "maint") { const e = new Date(); e.setHours(23, 59, 0, 0); to = e.getTime(); }
      const p = { id, code: "BL-P-" + id, type, holder, plate: B.norm(plate), station: type === "maint" ? station : (station || null), from: now, to, revoked: false, inside: false };
      S.passes.push(p); save(); return P(pv(p));
    },
    revokePass(id) { const p = S.passes.find(x => x.id === id); if (p) p.revoked = true; save(); return P(true); },
    wilayaData() {
      const rows = S.stations.map(s => {
        const m = meterOf(s.id), man = manualToday(s.id).length;
        const noentry = S.alerts.filter(a => a.station === s.id && a.reason === "noentry" && today(a.at) === today()).length;
        const reasons = []; if (m.over > 0) reasons.push("وقود خارج الحاجز"); if (man >= 3) reasons.push("فتح يدوي متكرر"); if (noentry) reasons.push("دخول من باب الخروج");
        return { id: s.id, name: s.name, tickets: todays(s.id).length, inside: S.tickets.filter(t => t.station === s.id && t.status === "inside").length, done: S.tickets.filter(t => t.station === s.id && t.status === "done" && t.exitedAt && today(t.exitedAt) === today()).length, waiting: waiting(s.id).length, manual: man, sold: m.sold, allowed: m.allowed, over: m.over, reasons };
      });
      const byPlate = {}; S.alerts.filter(a => a.plate).forEach(a => (byPlate[a.plate] = byPlate[a.plate] || []).push(a));
      const repeat = Object.entries(byPlate).filter(([, v]) => v.length >= 2).sort((a, b) => b[1].length - a[1].length).map(([plate, v]) => ({ plate, count: v.length, last: Math.max(...v.map(a => a.at)) }));
      return P({ rows, alerts: S.alerts.slice(0, 10).map(a => Object.assign({ stationName: st(a.station).name }, a)), repeat, rules: JSON.parse(JSON.stringify(S.rules)), exempt: Object.entries(S.exempt).map(([plate, cat]) => ({ plate, cat })), passes: S.passes.filter(p => p.type !== "maint").map(pv) });
    },
    setRule(v, { win, max }) { if (win) S.rules.veh[v].win = win; if (max) S.rules.veh[v].max = max; save(); return P(true); },
    addExempt(plate, cat) { plate = B.norm(plate); if (!B.validPlate(plate)) return Promise.reject({ code: "plate" }); S.exempt[plate] = cat; save(); return P(true); },
    removeExempt(plate) { delete S.exempt[plate]; save(); return P(true); },

    /* demo-only helpers for the presentation buttons */
    reset() { S = seed(); session = null; save(); return P(true); },
    demoPlate(kind, sid) {
      if (kind === "new") { let p; do { p = randPlate(11); } while (S.tickets.some(t => t.plate === p)); return p; }
      if (kind === "state") return Object.keys(S.exempt).find(x => S.exempt[x] === "state" && !activeTicket(x)) || null;
      if (kind === "recent") { const c = S.tickets.filter(t => t.status === "done" && !S.exempt[t.plate] && Date.now() - t.enteredAt < S.rules.veh[t.vtype].win * H && !activeTicket(t.plate)); return c.length ? pick(c).plate : null; }
      if (kind === "queue") { const c = S.tickets.filter(t => t.status === "waiting" && t.day === today() && t.station !== sid && !S.exempt[t.plate]); return c.length ? pick(c).plate : null; }
      return null;
    },
    demoCode(kind, sid, preferId, barrier) {
      const s = st(sid), mine = preferId ? S.tickets.find(t => t.id === preferId && t.station === sid) : null;
      const lanes = mine ? [mine.lane, ...["men", "women", "state"].filter(l => l !== mine.lane)] : ["men", "women", "state"];
      if (kind === "next") { const c = lanes.map(l => waiting(sid, l).find(t => canEnter(t) && t !== mine && s.fuel[t.fuel])).filter(Boolean); return c.length ? c[0].code : null; }
      if (kind === "early") { const c = lanes.flatMap(l => waiting(sid, l)).filter(t => !canEnter(t) && t !== mine); return c.length ? c[c.length - 1].code : null; }
      if (kind === "used") { const c = S.tickets.filter(t => t.station === sid && t.status === "done" && t.day === today()); return c.length ? pick(c).code : null; }
      if (kind === "other") { const c = S.tickets.filter(t => t.station !== sid && t.status === "waiting" && t.day === today()); return c.length ? pick(c).code : null; }
      if (kind === "inside") { const c = S.tickets.filter(t => t.station === sid && t.status === "inside" && t !== mine).sort((a, b) => a.enteredAt - b.enteredAt); return c.length ? c[0].code : null; }
      if (kind === "sneak") { const c = waiting(sid).filter(t => t !== mine); return c.length ? pick(c).code : null; }
      if (B.PASS[kind]) { const ok = S.passes.filter(x => x.type === kind && !x.revoked && (!x.station || x.station === sid) && Date.now() < x.to); const p = ok.find(x => barrier === "out" ? x.inside && x.insideStation === sid : !x.inside) || ok[0]; return p ? p.code : null; }
      return null;
    }
  };
  return api;
})();
