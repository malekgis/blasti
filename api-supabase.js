/* قاعدة البيانات الحقيقية: Supabase. كل العمليات تمرّ عبر الدوال الآمنة في supabase/schema.sql */
window.BlastiSupabaseAPI = function (cfg) {
  "use strict";
  if (!window.supabase || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
    throw new Error("أكمل SUPABASE_URL و SUPABASE_ANON_KEY في ملف js/config.js");
  }
  const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  const FRIENDLY = {
    not_allowed: "هذا الحساب لا يملك هذه الصلاحية.",
    meter_order: "قراءة الآن يجب أن تكون أكبر من قراءة الصباح.",
    plate: "رقم اللوحة غير مكتمل.",
    bad_barrier: "حاجز غير معروف."
  };
  async function rpc(fn, args) {
    const { data, error } = await sb.rpc(fn, args || {});
    if (error) {
      const key = Object.keys(FRIENDLY).find(k => (error.message || "").includes(k));
      throw { code: key || error.code || "error", message: key ? FRIENDLY[key] : (error.hint || "تعذّر الاتصال بالخادم. أعد المحاولة.") };
    }
    return data;
  }
  let profile = null;
  sb.auth.onAuthStateChange(() => { profile = null; });

  const api = {
    mode: "supabase",
    stations: () => rpc("station_overview"),
    rules: () => rpc("get_rules"),
    checkPlate: (plate, station) => rpc("check_plate", { p_plate: plate, p_station: station }),
    register: o => rpc("register_ticket", { p_plate: o.plate, p_station: o.station, p_lane: o.lane, p_vtype: o.vtype, p_fuel: o.fuel, p_via: o.via, p_photo: o.photo || null }),
    ticket: code => rpc("get_ticket", { p_code: code }),
    cancel: code => rpc("cancel_ticket", { p_code: code }),
    scan: (code, station, barrier) => rpc("gate_scan", { p_code: code, p_station: station, p_barrier: barrier }),
    manualOpen: (station, barrier, reason) => rpc("manual_open", { p_station: station, p_barrier: barrier, p_reason: reason }),

    async session() {
      const { data } = await sb.auth.getSession();
      if (!data || !data.session) return null;
      if (!profile) profile = await rpc("my_profile");
      return profile;
    },
    async login({ email, password }) {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw { code: "bad_login", message: "البريد أو كلمة السر غير صحيحة." };
      profile = null; return api.session();
    },
    async logout() { await sb.auth.signOut(); profile = null; return true; },

    managerData: station => rpc("manager_data", { p_station: station }),
    updateStation: (station, patch) => rpc("update_station", {
      p_station: station,
      p_essence: patch.fuel && "essence" in patch.fuel ? patch.fuel.essence : null,
      p_gasoil: patch.fuel && "gasoil" in patch.fuel ? patch.fuel.gasoil : null,
      p_pumps_women: patch.pumps && patch.pumps.women != null ? patch.pumps.women : null,
      p_pumps_men: patch.pumps && patch.pumps.men != null ? patch.pumps.men : null,
      p_pumps_state: patch.pumps && patch.pumps.state != null ? patch.pumps.state : null
    }),
    updateMeter: (station, start, now) => rpc("update_meter", { p_station: station, p_start: start, p_now: now }),
    noShow: id => rpc("no_show", { p_ticket: id }),
    issuePass: ({ type, holder, plate, station, days }) => rpc("issue_pass", { p_type: type, p_holder: holder, p_plate: plate || "", p_station: station || null, p_days: days || 30 }),
    revokePass: id => rpc("revoke_pass", { p_id: id }),
    wilayaData: () => rpc("wilaya_data"),
    setRule: (vtype, { win, max }) => rpc("set_rule", { p_vtype: vtype, p_window: win || null, p_max: max || null }),
    addExempt: (plate, cat) => rpc("add_exempt", { p_plate: plate, p_cat: cat }),
    removeExempt: plate => rpc("remove_exempt", { p_plate: plate })
  };
  return api;
};
