/* بلاصتي — الواجهة */
(function () {
  "use strict";
  const CFG = window.BLASTI_CONFIG || {}, B = window.BL;
  let api;
  try { api = CFG.MODE === "supabase" ? window.BlastiSupabaseAPI(CFG) : window.BlastiDemoAPI; }
  catch (e) { document.getElementById("app").innerHTML = `<div class="result red narrow"><div class="verdict"><span class="dot"></span>الإعدادات غير مكتملة</div><span>${String(e && e.message || e)}</span></div>`; return; }
  const DEMO = api.mode === "demo";
  const IN_CLAUDE = !!(window.claude && window.claude.use);
  const NAME = CFG.APP_NAME || "بلاصتي";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- icons ---------- */
  const I = {
    cam: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`,
    qr: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm9-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h3v2h-3v-2zm-4 4h2v3h-2v-3zm4 0h3v3h-2v-1h-1v-2zm-2 2h2v1h-2v-1z"/></svg>`,
    save: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>`,
    print: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/></svg>`,
    in: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h12m0 0-4-4m4 4-4 4"/><path d="M20 4v16"/></svg>`,
    out: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 12h12m0 0-4-4m4 4-4 4"/><path d="M4 4v16"/></svg>`,
    women: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="4.5" r="2.8"/><path d="M12 8.2c-2.3 0-3.7 1.3-4.3 3.6L6 19h3.4v3.5h5.2V19H18l-1.7-7.2c-.6-2.3-2-3.6-4.3-3.6z"/></svg>`,
    men: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="4.5" r="2.8"/><path d="M8.5 8.4h7a1.6 1.6 0 0 1 1.6 1.6v6.2h-2.3v6.3H9.2v-6.3H6.9V10a1.6 1.6 0 0 1 1.6-1.6z"/></svg>`,
    state: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5 21.5 8v1.5h-19V8z"/><rect x="4.5" y="10.5" width="2.5" height="7.5"/><rect x="10.75" y="10.5" width="2.5" height="7.5"/><rect x="17" y="10.5" width="2.5" height="7.5"/><rect x="2.5" y="19" width="19" height="2.5"/></svg>`,
    drop: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5c-4 5.3-6.2 8.6-6.2 11.6a6.2 6.2 0 0 0 12.4 0c0-3-2.2-6.3-6.2-11.6z"/></svg>`,
    car: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 11l1.6-4.2A2 2 0 0 1 8.5 5.5h7a2 2 0 0 1 1.9 1.3L19 11a2 2 0 0 1 2 2v4h-2v1.5a1.5 1.5 0 0 1-3 0V17H8v1.5a1.5 1.5 0 0 1-3 0V17H3v-4a2 2 0 0 1 2-2zm2.2 0h9.6l-1.1-3H8.3l-1.1 3z"/></svg>`,
    moto: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5.5" cy="16.5" r="3.3"/><circle cx="18.5" cy="16.5" r="3.3"/><path d="M5.5 16.5 9 10.5h5.5l2 3.5M13 10.5 11.5 7H9M16.5 14l2 2.5M14.5 10.5h3.5"/></svg>`,
    suv: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M3.5 7h11l4 4.2H20a1.5 1.5 0 0 1 1.5 1.5V16h-1.6a2.6 2.6 0 0 0-5 0H9.6a2.6 2.6 0 0 0-5 0H3V7.5A.5.5 0 0 1 3.5 7zm1.5 1.5v2.7h4V8.5zm5.5 0v2.7h5.6l-2.6-2.7z"/><circle cx="7.1" cy="16.6" r="2.1"/><circle cx="17.4" cy="16.6" r="2.1"/><rect x="1" y="9" width="1.5" height="5" rx=".75"/></svg>`,
    pickup: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12 7h4.6l3.9 4.3a1.5 1.5 0 0 1 .5 1.1V16h-1.6a2.6 2.6 0 0 0-5 0H9.6a2.6 2.6 0 0 0-5 0H2v-4.5h10zm1.5 1.5v3h5l-2.7-3z"/><circle cx="7.1" cy="16.6" r="2.1"/><circle cx="16.9" cy="16.6" r="2.1"/></svg>`,
    truck: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="1.5" y="4.5" width="12.5" height="10.5" rx="1"/><path d="M15 8h3.8l3.2 3.7V15h-7z"/><circle cx="6" cy="17.4" r="2.1"/><circle cx="18" cy="17.4" r="2.1"/></svg>`,
    bus: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M4 4h16a2 2 0 0 1 2 2v10H2V6a2 2 0 0 1 2-2zm.5 3v3.5h4V7zm6 0v3.5h4V7zm6 0v3.5h4V7z"/><circle cx="6.5" cy="17.6" r="2"/><circle cx="17.5" cy="17.6" r="2"/></svg>`,
    tractor: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 14.8V11h5V5.5h5.2l1.1 4.7a6.6 6.6 0 0 0-4 4.6z"/><circle cx="16.5" cy="15.5" r="4.6" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="5.2" cy="18" r="2.4"/></svg>`,
    naftal: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 8.5A3.5 3.5 0 0 1 5.5 5H12a3.5 3.5 0 0 1 3.5 3.5v6H2z"/><path d="M16.5 8.5h2.6l2.9 3.4v2.6h-5.5z"/><circle cx="6" cy="17" r="2"/><circle cx="18.5" cy="17" r="2"/></svg>`,
    gas: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 2h6v2.5h-1V6a6 6 0 0 1 4 5.6V20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8.4A6 6 0 0 1 10 6V4.5H9z"/></svg>`,
    maint: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.7 2.6a5.2 5.2 0 0 0-5.6 6.9L2.8 15.8a2.3 2.3 0 0 0 3.3 3.3l6.3-6.3a5.2 5.2 0 0 0 6.9-5.6l-3 3-2.9-.5-.5-2.9z"/></svg>`,
    civil: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/></svg>`
  };
  const VEH_ORDER = ["car", "moto", "suv", "pickup", "truck", "bus", "tractor"];

  /* ---------- small helpers ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("blasti-" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("blasti-" + k, JSON.stringify(v)); } catch (e) {} }
  };
  const prefs = Object.assign({ reg: "s1", mode: "self", via: "cyber", gate: "s1", barrier: "in", mLane: "all" }, store.get("prefs", {}));
  const savePrefs = () => store.set("prefs", prefs);
  const myTickets = () => store.get("my", []);
  const addMine = t => { const l = myTickets().filter(x => x.id !== t.id); l.unshift({ id: t.id, code: t.code }); store.set("my", l.slice(0, 10)); };
  const findMine = id => myTickets().find(x => x.id === id);
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), 3000); }
  const seg = (name, opts, val, cls = "") => `<div class="seg ${cls}" role="radiogroup">${opts.map(([v, l]) => `<input type="radio" name="${name}" id="${name}-${v}" value="${v}" ${v === val ? "checked" : ""}><label for="${name}-${v}">${l}</label>`).join("")}</div>`;
  const plateHTML = (p, cls = "") => { if (!p) return "—"; p = String(p); if (p.length < 6) return `<span class="plate ${cls}">${esc(p)}</span>`; return `<span class="plate ${cls}" aria-label="لوحة ${esc(p)}"><b>${esc(p.slice(0, -5))}</b><i>${esc(p.slice(-5, -2))}</i><b>${esc(p.slice(-2))}</b></span>`; };
  const tno = t => `<span class="tno ${t.lane}"><span class="l">${B.LANES[t.lane].l}</span>${t.number}</span>`;
  const laneChip = l => `<span class="lane ${l}">${B.LANES[l].label}</span>`;
  const vehChip = v => `<span class="veh">${I[v]}${B.VEH[v].label}</span>`;
  const fuelPills = s => Object.keys(B.FUEL).map(f => `<span class="pill ${s.fuel[f] ? "ok" : "wait"}">${B.FUEL[f]}: ${s.fuel[f] ? "متوفر" : "بانتظار الصهريج"}</span>`).join(" ");
  const stationOptions = (list, sel) => list.map(s => `<option value="${s.id}" ${s.id === sel ? "selected" : ""}>${esc(s.name)}</option>`).join("");
  const scrollTo = el => { if (el) el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" }); };
  const dateFR = t => new Date(B.ms(t)).toLocaleDateString("fr-DZ");
  const errMsg = e => (e && (e.message || e.code)) || "حدث خطأ. أعد المحاولة.";
  function qrSvg(text, cls = "qr") {
    if (typeof qrcode !== "function") return `<div class="hint" style="direction:ltr;text-align:center;padding:10px;font-family:var(--f-mono)">${esc(text)}</div>`;
    const q = qrcode(0, "M"); q.addData(text); q.make(); const n = q.getModuleCount(); let d = "";
    for (let r = 0; r < n; r++) { let c = 0; while (c < n) { if (q.isDark(r, c)) { const s = c; while (c < n && q.isDark(r, c)) c++; d += `M${s} ${r}h${c - s}v1h-${c - s}z`; } else c++; } }
    const v = n + 8; return `<svg class="${cls}" viewBox="-4 -4 ${v} ${v}" shape-rendering="crispEdges" role="img" aria-label="رمز QR"><rect x="-4" y="-4" width="${v}" height="${v}" fill="var(--plate)"/><path d="${d}" fill="var(--plate-ink)"/></svg>`;
  }
  const publicBase = () => (CFG.PUBLIC_URL || (location.origin + location.pathname)).replace(/#.*$/, "");
  let RULES = null, STATIONS = [];
  async function refreshBasics() { const [r, s] = await Promise.all([api.rules(), api.stations()]); RULES = r; STATIONS = s; }
  const stById = id => STATIONS.find(s => s.id === id) || STATIONS[0];
  const laneWait = (s, lane) => Math.ceil(s.waiting[lane] * RULES.minPer / Math.max(1, s.pumps[lane]));

  /* ---------- capabilities (only inside Claude) and browser fallbacks ---------- */
  const useCap = n => (IN_CLAUDE ? window.claude.use(n) : Promise.resolve(null)).catch(() => null);
  const samplePromise = useCap("sample"), downloadsPromise = useCap("downloads");
  function loadImage(file) { return new Promise((res, rej) => { const url = URL.createObjectURL(file); const i = new Image(); i.onload = () => { res(i); setTimeout(() => URL.revokeObjectURL(url), 1000); }; i.onerror = rej; i.src = url; }); }
  async function shrink(file) { try { const img = await loadImage(file); const k = Math.min(1, 360 / Math.max(img.width, img.height)); const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); return c.toDataURL("image/jpeg", .6); } catch (e) { return null; } }
  function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  async function readPlate(file) {
    const sample = await samplePromise;
    if (sample) {
      const lim = await sample.limits().catch(() => null);
      if (lim && lim.images) {
        try {
          const r = await sample.json('The image is a photo of an Algerian vehicle licence plate. Algerian plates contain only digits in three groups: a serial of 3 to 6 digits, then 3 digits (vehicle type + year), then a 2-digit wilaya code from 01 to 58, for example "01234 120 11". Read the plate on the vehicle. Reply with only JSON: {"plate": "<all digits left to right, no spaces>" or null if no plate is readable, "confidence": "high" or "low"}.', { images: [file], modelTier: "quick" });
          const p = B.norm(r && r.plate); return p ? { plate: p, low: r.confidence !== "high" || !B.validPlate(p) } : { none: true };
        } catch (e) { return { error: e && e.code }; }
      }
    }
    if (IN_CLAUDE) return { unavailable: true };
    /* free OCR in the browser (Tesseract.js): a suggestion the person always confirms */
    try {
      if (!window.Tesseract) await loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js");
      const worker = await Tesseract.createWorker("eng");
      await worker.setParameters({ tessedit_char_whitelist: "0123456789 " });
      const { data } = await worker.recognize(file); await worker.terminate();
      const groups = (data.text || "").match(/\d+/g) || []; let best = "";
      for (let i = 0; i < groups.length; i++) { let s = ""; for (let j = i; j < groups.length && s.length < 11; j++) { s += groups[j]; if (B.validPlate(s) && s.length > best.length) best = s; } }
      return best ? { plate: best, low: true } : { none: true };
    } catch (e) { return { unavailable: true }; }
  }
  async function decodeQRFile(file) {
    if (typeof jsQR !== "function") return { error: "lib" };
    try { const img = await loadImage(file); const k = Math.min(1, 1200 / Math.max(img.width, img.height)); const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); const g = c.getContext("2d"); g.drawImage(img, 0, 0, c.width, c.height); const d = g.getImageData(0, 0, c.width, c.height); const r = jsQR(d.data, c.width, c.height); return r ? { text: r.data } : { none: true }; } catch (e) { return { error: "img" }; }
  }
  async function ticketPNG(t) {
    const W = 720, HH = 1180, c = document.createElement("canvas"); c.width = W; c.height = HH; const g = c.getContext("2d");
    try { await document.fonts.ready; } catch (e) {}
    g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, W, HH);
    g.fillStyle = { women: "#7B3A6F", men: "#283C8C", state: "#1C6A73" }[t.lane]; g.fillRect(0, 0, W, 130);
    g.fillStyle = "#FFFFFF"; g.textAlign = "center"; g.direction = "rtl"; g.font = "800 44px 'Noto Kufi Arabic', Tahoma, sans-serif"; g.fillText(`${NAME} · ${B.LANES[t.lane].label}`, W / 2, 82);
    g.fillStyle = "#111114"; g.direction = "ltr"; g.font = "600 210px 'IBM Plex Mono', 'Courier New', monospace"; g.fillText(String(t.number), W / 2, 345);
    if (typeof qrcode === "function") { const q = qrcode(0, "M"); q.addData(t.code); q.make(); const n = q.getModuleCount(), cell = Math.floor(430 / n), x0 = Math.round((W - cell * n) / 2), y0 = 380; for (let r = 0; r < n; r++) for (let col = 0; col < n; col++) if (q.isDark(r, col)) g.fillRect(x0 + col * cell, y0 + r * cell, cell, cell); }
    g.direction = "rtl"; g.font = "700 34px 'IBM Plex Sans Arabic', Tahoma, sans-serif"; g.fillText(`${B.VEH[t.vtype].label} · ${B.FUEL[t.fuel]} · حتى ${t.max} لتر`, W / 2, 880);
    g.direction = "ltr"; g.font = "600 52px 'IBM Plex Mono', 'Courier New', monospace"; g.fillText(`${t.plate.slice(0, -5)}  ${t.plate.slice(-5, -2)}  ${t.plate.slice(-2)}`, W / 2, 965);
    g.direction = "rtl"; g.font = "600 30px 'IBM Plex Sans Arabic', Tahoma, sans-serif"; g.fillText(`${t.stationName} · ${B.dayKey(t.createdAt)} · ${B.hm(t.createdAt)}`, W / 2, 1040);
    g.font = "500 25px 'IBM Plex Sans Arabic', Tahoma, sans-serif"; g.fillStyle = "#56555F"; g.fillText("امسح الرمز عند حاجز الدخول ثم عند حاجز الخروج · صالحة مرة واحدة", W / 2, 1095);
    g.direction = "ltr"; g.font = "500 24px 'IBM Plex Mono', monospace"; g.fillText(t.code, W / 2, 1140);
    return await new Promise(r => c.toBlob(r, "image/png"));
  }
  async function saveTicket(t) {
    const blob = await ticketPNG(t), filename = `${CFG.APP_NAME_LATIN || "blasti"}-${t.number}-${t.code}.png`;
    if (IN_CLAUDE) {
      const dl = await downloadsPromise;
      if (!dl) return toast("الحفظ غير متاح في هذا العرض.");
      try { await dl.save({ filename, data: blob }); toast("حُفظت التذكرة"); } catch (e) { if (!e || e.code !== "declined") toast("تعذّر حفظ التذكرة هنا."); }
      return;
    }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); toast("حُفظت التذكرة في الهاتف");
  }
  function printOnly(cls) { document.body.classList.add(cls); const done = () => { document.body.classList.remove(cls); window.removeEventListener("afterprint", done); }; window.addEventListener("afterprint", done); window.print(); setTimeout(done, 60000); }

  /* ---------- routing ---------- */
  const views = { register: renderRegister, mine: renderMine, stations: renderStations, staff: renderStaff, gate: renderGate, manager: renderManager, wilaya: renderWilaya, qr: renderPosters };
  const STAFF_VIEWS = ["gate", "manager", "wilaya", "qr"];
  function route() { const h = location.hash.slice(1); const m = /^qr-([a-z0-9]+)$/i.exec(h); if (m) return { view: "register", locked: m[1] }; return { view: views[h] ? h : "register", locked: null }; }
  const current = () => route().view;
  let seq = 0;
  async function render() {
    const my = ++seq, r = route();
    document.body.classList.toggle("locked", !!r.locked);
    const tab = STAFF_VIEWS.includes(r.view) ? "staff" : r.view;
    document.querySelectorAll(".tabbar a").forEach(a => { if (a.dataset.tab === tab) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    window.scrollTo(0, 0);
    try { await refreshBasics(); if (my !== seq) return; if (r.locked && STATIONS.some(s => s.id === r.locked)) { prefs.reg = r.locked; savePrefs(); } await views[r.view](my); }
    catch (e) { if (my === seq) $("#app").innerHTML = `<div class="result red narrow"><div class="verdict"><span class="dot"></span>تعذّر الاتصال</div><span>${esc(errMsg(e))}</span><button class="btn" type="button" onclick="location.reload()">إعادة المحاولة</button></div>`; }
  }
  const BACK = `<a class="back noprint" href="#staff"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>العاملون</a>`;
  const paint = (my, html) => { if (my !== seq) return false; $("#app").innerHTML = (STAFF_VIEWS.includes(current()) ? BACK : "") + html; return true; };

  /* ---------- install as an app (Android: native prompt, iPhone: Share → Add to Home Screen) ---------- */
  let installEvt = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; const b = $("#install-card"); if (b) render(); });
  window.addEventListener("appinstalled", () => { installEvt = null; store.set("installed", true); });
  const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  function installCard() {
    if (IN_CLAUDE || standalone() || store.get("hideInstall", false)) return "";
    const ios = isIOS();
    if (!ios && !installEvt) return "";
    return `<div class="install" id="install-card"><img src="icon-192.png" alt="" width="48" height="48"><div class="stack" style="gap:4px;min-width:0">
      <b>ثبّت ${esc(NAME)} على هاتفك</b>
      <span class="hint">${ios ? `اضغط زر المشاركة <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-3px"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg> في أسفل Safari، ثم «إضافة إلى الشاشة الرئيسية».` : "يفتح من أيقونته مثل أي تطبيق، وبشاشة كاملة."}</span>
      <div class="row">${ios ? "" : `<button class="btn primary sm" id="install-go" type="button">تثبيت التطبيق</button>`}<button class="btn ghost sm" id="install-no" type="button">لاحقاً</button></div></div></div>`;
  }
  function bindInstall() {
    const go = $("#install-go"); if (go) go.onclick = async () => { if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch (e) {} installEvt = null; render(); };
    const no = $("#install-no"); if (no) no.onclick = () => { store.set("hideInstall", true); const c = $("#install-card"); if (c) c.remove(); };
  }
  let camTarget = "register";
  function openCam(target) { camTarget = target; const c = $("#cam"); c.value = ""; c.click(); }

  /* ===================== REGISTRATION ===================== */
  let R = { step: "start" };
  async function shownTicket() {
    const code = prefs.mode === "self" ? (myTickets()[0] || {}).code : R.done;
    if (!code) return null;
    const t = await api.ticket(code);
    if (!t || t.status === "cancelled" || !t.isToday) return null;
    if (prefs.mode === "self" && t.station !== prefs.reg && t.status === "waiting") prefs.reg = t.station;
    return t;
  }
  async function renderRegister(my) {
    const t = await shownTicket(); const s = stById(prefs.reg); const locked = route().locked;
    if (!paint(my, `<div class="narrow stack">
      ${t ? `<h2 class="page-title">${t.status === "waiting" ? "تذكرتك" : "آخر تذكرة"}</h2>` : `<div class="card stack" style="gap:10px">
        ${locked ? `<div><span class="label">أنت في</span><p class="big-title">${esc(s.name)}</p></div>` : `<div class="field"><label class="label" for="r-st">المحطة</label><select id="r-st">${stationOptions(STATIONS, s.id)}</select></div>`}
        <div class="row">${fuelPills(s)}</div>
        <div class="lane-mini">${["women", "men", "state"].map(l => `<div class="${l}"><span>${B.LANES[l].label}</span><b>${s.waiting[l]}</b><small>${s.fuel.essence || s.fuel.gasoil ? "≈ " + B.dur(laneWait(s, l)) : "—"}</small></div>`).join("")}</div>
      </div>`}
      ${t && prefs.mode === "self" ? "" : `<div class="card stack" style="gap:8px">
        <span class="label">من يسجّل؟</span>
        ${seg("r-mode", [["self", "أسجّل مركبتي"], ["other", "أسجّل لشخص آخر"]], prefs.mode)}
        ${prefs.mode === "other" ? `<div class="field"><label class="hint" for="r-via">نقطة التسجيل</label><select id="r-via">${["cyber", "commune", "post"].map(v => `<option value="${v}" ${prefs.via === v ? "selected" : ""}>${B.VIA[v]}</option>`).join("")}</select>
          <span class="hint">لمن لا يملك هاتفاً أو لا يعرف استعماله: صاحب مقهى الإنترنت أو موظف البلدية يسجّله ويطبع له التذكرة.</span></div>` : ""}
      </div>`}
      ${!t && R.step === "start" ? installCard() : ""}
      <div id="r-body" class="stack">${t ? ticketView(t) : regStep(s)}</div>
      ${locked ? `<div class="hint" style="text-align:center">فُتحت هذه الصفحة من ملصق ${esc(s.name)}. <a class="linkbtn" href="#register">كل المحطات</a></div>` : ""}
    </div>`)) return;
    const rs = $("#r-st"); if (rs) rs.onchange = e => { prefs.reg = e.target.value; R = { step: "start" }; savePrefs(); render(); };
    document.querySelectorAll("input[name=r-mode]").forEach(x => (x.onchange = e => { prefs.mode = e.target.value; R = { step: "start" }; savePrefs(); render(); }));
    const rv = $("#r-via"); if (rv) rv.onchange = e => { prefs.via = e.target.value; savePrefs(); };
    bindRegister(t); bindInstall();
  }
  function regStep(s) {
    switch (R.step) {
      case "busy": return `<div class="result neutral">${R.photo ? `<img class="thumb" src="${R.photo}" alt="صورة المركبة">` : ""}<div class="row"><div class="spinner"></div><b>${esc(R.msg || "لحظة…")}</b></div></div>`;
      case "manual": return `<form class="card stack" id="r-form" novalidate>
          ${R.note ? `<div class="hint" style="color:var(--warn)">${esc(R.note)}</div>` : ""}
          ${R.photo ? `<img class="thumb" src="${R.photo}" alt="صورة المركبة">` : ""}
          <div class="field"><label class="label" for="r-plate">أرقام لوحة المركبة</label>
          <input type="text" class="plate-in" id="r-plate" inputmode="numeric" dir="ltr" autocomplete="off" placeholder="01234 120 11" value="${esc(R.prefill || "")}">
          <span class="hint" id="r-err" hidden>الرقم غير مكتمل: الرقم التسلسلي ثم 3 أرقام ثم رمز الولاية.</span></div>
          <div class="row"><button class="btn primary" type="submit">متابعة</button><button class="btn ghost" type="button" data-r="back">رجوع</button></div>
        </form>`;
      case "vtype": return `<div class="card stack">
          ${R.photo ? `<img class="thumb" src="${R.photo}" alt="صورة المركبة">` : ""}
          <div class="row" style="justify-content:space-between"><div>${plateHTML(R.plate, "lg")}</div><button class="linkbtn" data-r="fix" type="button">تصحيح الأرقام</button></div>
          ${R.low ? `<span class="hint" style="color:var(--warn)">قُرئت الأرقام آلياً. تأكّد أنها مطابقة للوحة قبل المتابعة.</span>` : ""}
          <p class="step-title">ما نوع المركبة؟</p>
          <div class="veh-grid">${VEH_ORDER.map(k => `<button class="veh-btn ${R.lastV === k ? "last" : ""}" data-v="${k}" type="button">${I[k]}<b>${B.VEH[k].label}</b><small>حتى ${RULES.veh[k].max} لتر · كل ${B.hours(RULES.veh[k].win)}</small></button>`).join("")}</div>
          ${R.lastV ? `<span class="hint">آخر مرة سُجّلت هذه اللوحة كـ"${B.VEH[R.lastV].label}". تغيير النوع يُرسل تنبيهاً للمراقبة.</span>` : ""}
        </div>`;
      case "lane": return `<div class="card stack">
          <div class="row" style="justify-content:space-between">${plateHTML(R.plate)}${vehChip(R.vtype)}</div>
          <p class="step-title">${R.stateOnly ? "مركبة دولة مسجّلة" : "اختر القسم"}</p>
          <div class="pic-grid">${R.stateOnly ? `<button class="pic-btn state" data-l="state" type="button">${I.state}<span>قسم الدولة</span><small>${s.waiting.state} في الانتظار</small></button>`
            : ["women", "men"].map(l => `<button class="pic-btn ${l}" data-l="${l}" type="button">${I[l]}<span>${B.LANES[l].short}</span><small>${s.waiting[l]} في الانتظار</small></button>`).join("")}</div>
        </div>`;
      case "fuel": return `<div class="card stack">
          <div class="row" style="justify-content:space-between">${plateHTML(R.plate)}${vehChip(R.vtype)}</div>
          <p class="step-title">نوع الوقود</p>
          <div class="pic-grid">${RULES.veh[R.vtype].fuels.map(f => `<button class="pic-btn ${f}" data-f="${f}" type="button">${I.drop}<span>${B.FUEL[f]}</span>${s.fuel[f] ? "" : `<small>بانتظار الصهريج</small>`}</button>`).join("")}</div>
        </div>`;
      case "mineinfo": return `<div class="result amber"><div class="verdict"><span class="dot"></span>لهذه المركبة دور اليوم هنا</div>
          <div class="row">${plateHTML(R.plate)} ${tno(R.ticket)}</div>
          <span style="color:var(--ink)">افتح التذكرة من الهاتف الذي حجزت به، أو من الورقة المطبوعة. لحماية صاحب الدور، لا يظهر رمزه لغيره.</span>
          <button class="btn" data-r="back" type="button">رجوع</button></div>`;
      case "red": { const e = R.ticket; return `<div class="result red">
          <div class="verdict"><span class="dot"></span>لا يمكن الحجز الآن</div>
          <div>${plateHTML(R.plate, "lg")}</div>
          ${R.reason === "recent" ? `<div style="color:var(--ink)">تزوّدت هذه المركبة ${B.ago(e.enteredAt)} في ${esc(e.stationName)}. يمكن الحجز ${B.when(R.until)}.</div>`
            : `<div style="color:var(--ink)">لهذه المركبة دور اليوم في ${esc(e.stationName)} برقم ${tno(e)}. لا يمكن الحجز في محطتين.</div>`}
          <div class="row"><button class="btn" data-r="cam" type="button">إعادة التصوير</button><button class="btn ghost" data-r="back" type="button">رجوع</button></div></div>`; }
    }
    return `<button class="scan" data-r="cam" type="button">${I.cam}<span>صوّر لوحة المركبة</span><small>تُحفظ الصورة ورقم اللوحة تلقائياً</small></button>
      <div style="text-align:center;margin-top:-6px"><button class="linkbtn" data-r="type" type="button">لا تعمل الكاميرا؟ اكتب الأرقام</button></div>
      ${api.demoPlate ? `<details class="demo"><summary>للعرض على الوالي: أمثلة جاهزة</summary>
        <div class="demo-grid">
          <button class="btn" data-r="demo-new" type="button">مركبة جديدة<span>نوعها، قسمها، ثم التذكرة</span></button>
          <button class="btn" data-r="demo-state" type="button">مركبة دولة<span>قسم الدولة تلقائياً</span></button>
          <button class="btn" data-r="demo-recent" type="button">تزوّدت أمس<span>رفض مع موعد الحجز</span></button>
          <button class="btn" data-r="demo-queue" type="button">محجوزة في محطة أخرى<span>رفض الحجز المزدوج</span></button>
        </div></details>` : ""}`;
  }
  function ticketView(t) {
    const inside = t.status === "inside", done = t.status === "done", go = t.status === "waiting" && t.fuelOk && t.canEnter;
    const status = done ? `<div class="result green"><div class="verdict"><span class="dot"></span>خرجت من المحطة الساعة ${B.hm(t.exitedAt)}</div><span class="hint" style="color:var(--ink)">الحجز القادم ممكن ${B.when(B.ms(t.enteredAt) + RULES.veh[t.vtype].win * 3600e3)}.</span></div>`
      : inside ? `<div class="result green"><div class="verdict"><span class="dot"></span>أنت داخل المحطة منذ ${B.hm(t.enteredAt)}</div><span class="hint" style="color:var(--ink)">امسح نفس الرمز عند حاجز الخروج.</span></div>`
      : go ? `<div class="result amber"><div class="verdict"><span class="dot"></span>حان دورك: توجّه إلى حاجز الدخول</div></div>` : "";
    const enterTxt = done || inside ? "تمّ" : !t.fuelOk ? "عند وصول الصهريج" : go ? "الآن" : "حوالي " + B.hm(Date.now() + t.etaMin * 60e3);
    return `${status}
    <div class="tk ${t.lane}" id="ticket">
      <div class="tk-band"><span>${I[t.lane]}${B.LANES[t.lane].label}</span><span>${I[t.vtype]}${B.VEH[t.vtype].label}</span></div>
      <div class="tk-top"><div><span class="tk-lbl">رقمك</span><div class="tk-num">${t.number}</div></div><div class="tk-qr">${qrSvg(t.code)}</div></div>
      <div class="tk-grid">
        <div><span>قبلك</span><b>${t.status === "waiting" ? B.cars(t.ahead) : "—"}</b></div>
        <div><span>ادخل من الحاجز</span><b>${enterTxt}</b></div>
        <div><span>الوقود</span><b>${B.FUEL[t.fuel]}</b></div>
        <div><span>الحد الأقصى</span><b>${t.max} لتر</b></div>
      </div>
      <div class="tk-car">${t.photo ? `<img src="${t.photo}" alt="صورة المركبة عند التسجيل">` : `<span class="nophoto">صورة المركبة</span>`}<div>${plateHTML(t.plate)}<div class="tk-lbl" style="margin-top:4px">${esc(B.VIA[t.via] || "")}</div></div></div>
      <div class="tk-foot"><span>${esc(t.stationName)} · ${B.hm(t.createdAt)}</span><code>${t.code}</code></div>
    </div>
    <div class="row noprint">
      ${!IN_CLAUDE ? `<button class="btn primary" data-r="print" type="button">${I.print}طباعة التذكرة</button>` : ""}
      <button class="btn ${IN_CLAUDE ? "primary" : ""}" data-r="save" type="button">${I.save}حفظ كصورة</button>
      ${done ? `<button class="btn" data-r="clear" type="button">تسجيل مركبة أخرى</button>` : prefs.mode === "other" ? `<button class="btn" data-r="clear" type="button">تسجيل شخص آخر</button>` : t.status === "waiting" ? (R.confirmCancel ? `<span>إلغاء الدور؟</span><button class="btn danger sm" data-r="cancel-yes" type="button">نعم</button><button class="btn sm" data-r="cancel-no" type="button">لا</button>` : `<button class="btn ghost" data-r="cancel" type="button">إلغاء الدور</button>`) : ""}
    </div>
    <div class="perm noprint">${I.qr}<span>نفس الرمز يُمسح مرتين: عند حاجز الدخول ثم عند حاجز الخروج، من الهاتف أو على الورق. صالح في هذه المحطة واليوم فقط.</span></div>
    ${DEMO && t.status !== "done" ? `<a class="btn noprint" href="#gate" data-r="togate">جرّب: اذهب إلى الحاجز وامسح هذه التذكرة</a>` : ""}`;
  }
  function bindRegister(t) {
    const f = $("#r-form"); if (f) f.onsubmit = ev => { ev.preventDefault(); const p = B.norm($("#r-plate").value); if (!B.validPlate(p)) { $("#r-err").hidden = false; $("#r-plate").focus(); return; } regPlate(p, R.photo, false); };
    document.querySelectorAll("[data-r]").forEach(b => (b.onclick = () => regAct(b.dataset.r, t)));
    document.querySelectorAll("[data-v]").forEach(b => (b.onclick = () => { R.vtype = b.dataset.v; R.step = "lane"; paintReg(); }));
    document.querySelectorAll("[data-l]").forEach(b => (b.onclick = () => { R.lane = b.dataset.l; const fu = RULES.veh[R.vtype].fuels; if (fu.length === 1) return book(fu[0]); R.step = "fuel"; paintReg(); }));
    document.querySelectorAll("[data-f]").forEach(b => (b.onclick = () => book(b.dataset.f)));
  }
  function paintReg() { const box = $("#r-body"); if (!box) return render(); box.innerHTML = regStep(stById(prefs.reg)); bindRegister(null); scrollTo(box); }
  async function book(fuel) {
    const plate = R.plate, photo = R.photo, lane = R.lane || "men", vtype = R.vtype;
    R = { step: "busy", msg: "جارٍ الحجز…", photo }; paintReg();
    try {
      const r = await api.register({ plate, station: prefs.reg, lane, vtype, fuel, via: prefs.mode === "self" ? "self" : prefs.via, photo });
      if (!r.ok) { R = r.kind === "mine" ? { step: "mineinfo", plate, ticket: r.ticket } : { step: "red", plate, reason: r.reason, ticket: r.ticket, until: r.until }; return paintReg(); }
      if (prefs.mode === "self") addMine(r.ticket); R = { step: "start", done: r.ticket.code }; prefs.lastCode = r.ticket.code; savePrefs();
      await render(); scrollTo($("#ticket"));
    } catch (e) { R = { step: "manual", prefill: plate, photo, note: errMsg(e) }; paintReg(); }
  }
  async function regPlate(p, photo, low) {
    R = { step: "busy", msg: "جارٍ التحقق من اللوحة…", photo }; paintReg();
    try {
      const r = await api.checkPlate(p, prefs.reg);
      if (r.kind === "mine") { const m = findMine(r.ticket.id); if (m && prefs.mode === "self") { R = { step: "start" }; addMine({ id: m.id, code: m.code }); return render(); } R = { step: "mineinfo", plate: p, ticket: r.ticket }; }
      else if (r.kind === "red") R = { step: "red", plate: p, reason: r.reason, ticket: r.ticket, until: r.until };
      else { R = { step: "vtype", plate: p, photo, low, lastV: r.lastV, stateOnly: r.cat === "state" }; R.lane = R.stateOnly ? "state" : null; }
    } catch (e) { R = { step: "manual", prefill: p, photo, note: errMsg(e) }; }
    paintReg();
  }
  async function regAct(a, t) {
    if (a === "cam") return openCam("register");
    if (a === "type") { R = { step: "manual" }; paintReg(); const i = $("#r-plate"); if (i) i.focus(); return; }
    if (a === "fix") { R = { step: "manual", prefill: R.plate, photo: R.photo }; return paintReg(); }
    if (a === "back") { R = { step: "start" }; return paintReg(); }
    if (a === "clear") { if (prefs.mode === "self") store.set("my", myTickets().slice(1)); R = { step: "start" }; return render(); }
    if (a === "save" && t) return saveTicket(t);
    if (a === "print") return printOnly("print-ticket");
    if (a === "togate") { if (t) { prefs.gate = t.station; prefs.barrier = t.status === "inside" ? "out" : "in"; prefs.lastCode = t.code; savePrefs(); } return; }
    if (a === "cancel") { R.confirmCancel = true; return render(); }
    if (a === "cancel-no") { R.confirmCancel = false; return render(); }
    if (a === "cancel-yes" && t) { await api.cancel(t.code); R = { step: "start" }; if (prefs.mode === "self") store.set("my", myTickets().filter(x => x.id !== t.id)); toast("أُلغي الدور"); return render(); }
    if (a.startsWith("demo-") && api.demoPlate) { const p = api.demoPlate(a.slice(5), prefs.reg); if (!p) return toast("لا يوجد مثال مناسب الآن"); return regPlate(p, null, false); }
  }

  /* ===================== STAFF LOGIN (real database) ===================== */
  async function staffGate(my, roles, title) {
    if (DEMO) return { role: "wilaya", demo: true };
    const s = await api.session();
    if (s && roles.includes(s.role)) return s;
    paint(my, `<form class="card stack login" id="lg-form" novalidate>
      <h2>${esc(title)}</h2>
      ${s ? `<div class="hint" style="color:var(--bad)">حسابك (${esc(s.role)}) لا يملك هذه الصلاحية.</div>` : ""}
      <div class="field"><label class="label" for="lg-email">البريد الإلكتروني</label><input type="text" id="lg-email" dir="ltr" autocomplete="username" inputmode="email"></div>
      <div class="field"><label class="label" for="lg-pass">كلمة السر</label><input type="password" id="lg-pass" dir="ltr" autocomplete="current-password"></div>
      <span class="hint" id="lg-err" style="color:var(--bad)" hidden></span>
      <button class="btn primary block" type="submit">دخول</button>
      ${s ? `<button class="btn ghost" type="button" id="lg-out">تسجيل الخروج</button>` : ""}
      <span class="hint">الحسابات تنشئها الولاية لكل عون حاجز ومدير محطة.</span>
    </form>`);
    $("#lg-form").onsubmit = async ev => { ev.preventDefault(); try { await api.login({ email: $("#lg-email").value.trim(), password: $("#lg-pass").value }); render(); } catch (e) { const er = $("#lg-err"); er.textContent = "البريد أو كلمة السر غير صحيحة."; er.hidden = false; } };
    const o = $("#lg-out"); if (o) o.onclick = async () => { await api.logout(); render(); };
    return null;
  }

  /* ===================== THE GATES (entry and exit) ===================== */
  let G = { phase: "idle" }, gTimer = null, scanner = null;
  async function gateScan(code) {
    const sid = prefs.gate, barrier = prefs.barrier;
    G = { phase: "busy" }; paintGateResult();
    try { const r = await api.scan(code, sid, barrier); G = Object.assign({ phase: r.open ? "open" : r.soft ? "wait" : "refused" }, r); }
    catch (e) { G = { phase: "refused", title: "تعذّر التحقق", msg: errMsg(e) }; }
    clearTimeout(gTimer); G.armOpen = G.phase === "open";
    renderGateSoft();
    if (G.armOpen) gTimer = setTimeout(() => { G.armOpen = false; const b = $(".gate-box"); if (b) { b.classList.remove("open"); $(".gate-state").innerHTML = closedLabel(); } }, 7000);
  }
  const closedLabel = () => `${I.lock.replace('aria-hidden="true"', 'aria-hidden="true" width="22" height="22"')}مغلق`;
  function gateResult() {
    switch (G.phase) {
      case "busy": return `<div class="result neutral"><div class="row"><div class="spinner"></div><b>جارٍ التحقق…</b></div></div>`;
      case "open":
        if (G.manual) return `<div class="result amber"><div class="verdict"><span class="dot"></span>فتح يدوي</div><span class="hint" style="color:var(--ink)">السبب: ${esc(G.manual)}. سُجّل الفتح وأُرسل تنبيه إلى الولاية.</span></div>`;
        if (G.pass) { const p = G.pass; return `<div class="result green"><div class="verdict"><span class="dot"></span>${prefs.barrier === "in" ? "تصريح: تفضّل بالدخول" : "تصريح: خروج مسجّل"}</div>
          <div class="row"><span class="pass-type">${I[p.type]}${B.PASS[p.type].label}</span>${p.plate ? plateHTML(p.plate) : ""}</div>
          <span class="hint" style="color:var(--ink)">${esc(p.holder)} · صادر عن ${B.PASS[p.type].by} · صالح حتى ${dateFR(p.to)}.</span></div>`; }
        { const t = G.ticket; return `<div class="result green"><div class="verdict"><span class="dot"></span>${prefs.barrier === "in" ? "تفضّل بالدخول" : "طريق السلامة"}: ${tno(t)}</div>
          <div class="car-check">${t.photo ? `<img src="${t.photo}" alt="صورة المركبة عند التسجيل">` : `<span class="nophoto">لا توجد صورة${DEMO ? " (بيانات تجريبية)" : ""}</span>`}<div class="stack" style="gap:6px">${plateHTML(t.plate)}${vehChip(t.vtype)}<span>${laneChip(t.lane)}</span></div></div>
          ${prefs.barrier === "in" ? `<div class="facts"><div class="fact"><span class="label">الوقود</span><b>${B.FUEL[t.fuel]}</b></div><div class="fact"><span class="label">الحد الأقصى</span><b>${t.max} لتر</b></div><div class="fact"><span class="label">سُجّلت عبر</span><b>${esc(B.VIA[t.via] || "")}</b></div></div>
            <span class="hint" style="color:var(--ink)">قارن الصورة واللوحة بالمركبة. عند الخروج يُمسح نفس الرمز.</span>`
          : `<span class="hint" style="color:var(--ink)">دخلت ${B.hm(t.enteredAt)} وخرجت ${B.hm(t.exitedAt)}. انتهت صلاحية التذكرة.</span>`}</div>`; }
      case "wait": case "refused": return `<div class="result ${G.phase === "wait" ? "amber" : "red"}"><div class="verdict"><span class="dot"></span>${esc(G.title)}</div>${G.ticket ? `<div class="row">${tno(G.ticket)} ${plateHTML(G.ticket.plate)}</div>` : ""}${G.pass ? `<span class="pass-type">${I[G.pass.type]}${B.PASS[G.pass.type].label}</span>` : ""}<span style="color:var(--ink)">${esc(G.msg)}</span><span class="hint" style="color:var(--ink)">الحاجز يبقى مغلقاً.${G.phase === "wait" && G.ticket && G.ticket.code === prefs.lastCode && api.demoCode ? " للتجربة: اضغط «المركبة التالية» عدة مرات ليتقدّم الطابور، ثم امسح تذكرتك من جديد." : ""}</span></div>`;
    }
    return "";
  }
  function paintGateResult() { const r = $("#g-res"); if (r) { r.innerHTML = gateResult(); scrollTo(r); } }
  function renderGateSoft() { const box = $(".gate-box"); if (!box) return render(); box.classList.toggle("open", !!G.armOpen); $(".gate-state").innerHTML = G.armOpen ? "مفتوح" : closedLabel(); paintGateResult(); }
  async function renderGate(my) {
    const s0 = await staffGate(my, ["gate", "manager", "wilaya"], "دخول عون الحاجز"); if (!s0) return;
    if (!DEMO && s0.station && s0.role !== "wilaya") prefs.gate = s0.station;
    const s = stById(prefs.gate);
    const mine = prefs.lastCode && api.demoCode ? await api.ticket(prefs.lastCode) : null;
    const showMine = mine && mine.station === s.id && ((prefs.barrier === "in" && mine.status === "waiting") || (prefs.barrier === "out" && mine.status === "inside"));
    const inDemo = prefs.barrier === "in"
      ? [["next", "المركبة التالية تمسح تذكرتها", "الحاجز يفتح"], ["early", "جاء قبل وقته", "يبقى مغلقاً ويعطيه الساعة"], ["used", "تذكرة مستعملة", "لا تُقبل مرتين"], ["other", "تذكرة لمحطة أخرى", "مرفوضة"], ["naftal", "صهريج نفطال", "تصريح دائم"], ["gas", "شاحنة قارورات الغاز", "تصريح دائم"], ["maint", "فريق الصيانة", "تصريح ليوم واحد"], ["civil", "الحماية المدنية", "تصريح دائم"]]
      : [["inside", "مركبة داخل المحطة تخرج", "الحاجز يفتح"], ["sneak", "مركبة دخلت من باب الخروج", "تذكرتها لم تمرّ من الدخول"], ["used", "تذكرة خرجت من قبل", "لا تُقبل مرتين"], ["naftal", "صهريج نفطال يخرج", "يُغلق تصريح الدخول"], ["gas", "شاحنة الغاز تخرج", "لم تدخل؟ مرفوضة"]];
    if (!paint(my, `<div class="narrow stack">
      <div class="card stack" style="gap:10px">
        ${DEMO || s0.role === "wilaya" ? `<div class="field"><label class="label" for="g-st">المحطة</label><select id="g-st">${stationOptions(STATIONS, s.id)}</select></div>` : `<div><span class="label">المحطة</span><p class="big-title">${esc(s.name)}</p></div>`}
        ${seg("g-bar", [["in", `${I.in}حاجز الدخول`], ["out", `${I.out}حاجز الخروج`]], prefs.barrier, "bar-seg")}
        <div class="row">${fuelPills(s)}</div>
      </div>
      <div class="gate-box ${G.armOpen ? "open" : ""} ${prefs.barrier}">
        <svg class="gate-svg" viewBox="0 0 340 270" aria-hidden="true">
          <rect class="g-road" x="0" y="232" width="340" height="38" rx="6"/><path class="g-arrow" d="${prefs.barrier === "in" ? "M300 251h-50m0 0 10-8m-10 8 10 8" : "M200 251h50m0 0-10-8m10 8-10 8"}"/>
          <rect class="g-post" x="34" y="166" width="36" height="72" rx="5"/>
          <rect class="g-scan" x="40" y="188" width="24" height="30" rx="4"/><rect class="g-scan-win" x="44" y="193" width="16" height="12" rx="2"/>
          <circle class="g-light" cx="52" cy="154" r="9"/>
          <g class="g-arm"><rect class="a1" x="52" y="168" width="214" height="14" rx="7"/><rect class="a2" x="78" y="168" width="20" height="14"/><rect class="a2" x="118" y="168" width="20" height="14"/><rect class="a2" x="158" y="168" width="20" height="14"/><rect class="a2" x="198" y="168" width="20" height="14"/><rect class="a2" x="238" y="168" width="22" height="14" rx="4"/></g>
        </svg>
        <div class="gate-state">${G.armOpen ? "مفتوح" : closedLabel()}</div>
      </div>
      <div id="g-res" aria-live="polite">${gateResult()}</div>
      <div class="row" style="flex-wrap:nowrap">
        ${!IN_CLAUDE ? `<button class="scan slim" id="g-live" type="button">${I.qr}<span>تشغيل الماسح</span></button>` : ""}
        <button class="scan slim ${!IN_CLAUDE ? "alt" : ""}" id="g-cam" type="button">${I.cam}<span>${IN_CLAUDE ? "مسح تذكرة أو تصريح" : "من صورة"}</span></button>
      </div>
      <form class="row" id="g-form" style="flex-wrap:nowrap" novalidate><input type="text" id="g-code" dir="ltr" autocomplete="off" placeholder="BL-T-XXXXXXXX" aria-label="رمز التذكرة" style="font-family:var(--f-mono)"><button class="btn" type="submit">تحقّق</button></form>
      ${api.demoCode ? `<details class="demo" open><summary>للعرض على الوالي: ${B.BARRIER[prefs.barrier]}</summary>
        <div class="demo-grid">
          ${showMine ? `<button class="btn" data-g="mine" type="button">التذكرة التي حجزتها<span>${B.LANES[mine.lane].l} ${mine.number} · ${esc(B.VEH[mine.vtype].label)}</span></button>` : ""}
          ${inDemo.map(([k, a, b]) => `<button class="btn" data-g="${k}" type="button">${a}<span>${b}</span></button>`).join("")}
          <button class="btn ghost" data-g="reset" type="button">إعادة ضبط العرض<span>بيانات تجريبية جديدة</span></button>
        </div></details>` : ""}
      <details class="card"><summary style="cursor:pointer;font-weight:700">فتح يدوي (المدير فقط)</summary>
        <form id="g-man" class="stack" style="margin-top:12px;gap:10px" novalidate>
          <div class="field"><label class="label" for="gm-why">السبب</label><select id="gm-why"><option>عطل في الماسح</option><option>سيارة إسعاف بدون تصريح</option><option>أمر من مصالح الأمن</option><option>سبب آخر</option></select></div>
          ${DEMO ? `<div class="field"><label class="label" for="gm-code">كلمة سر المدير</label><input type="password" id="gm-code" inputmode="numeric" dir="ltr" autocomplete="off"></div>` : ""}
          <span class="hint" id="gm-err" style="color:var(--bad)" hidden></span>
          <button class="btn" type="submit">فتح ${B.BARRIER[prefs.barrier]}</button>
          <span class="hint">العون لا يفتح الحاجز. كل فتح يدوي يُسجَّل بالوقت والسبب ويظهر عند الولاية.${DEMO ? ` كلمة السر في هذا العرض: ${esc(CFG.DEMO_PIN || "2026")}` : ""}</span>
        </form>
      </details>
      <div class="perm">${I.lock}<span>الحاجزان يعملان بنفس التذكرة: الدخول مرة والخروج مرة. حاجز الخروج لا يُفتح لمن لم يمرّ من حاجز الدخول، فمن أُدخل من جهة الخروج يُكشف فوراً. ويُنصح بتركيب مسامير أحادية الاتجاه في ممر الخروج.</span></div>
    </div>`)) return;
    const gs = $("#g-st"); if (gs) gs.onchange = e => { prefs.gate = e.target.value; G = { phase: "idle" }; savePrefs(); render(); };
    document.querySelectorAll("input[name=g-bar]").forEach(x => (x.onchange = e => { prefs.barrier = e.target.value; G = { phase: "idle" }; savePrefs(); render(); }));
    $("#g-cam").onclick = () => openCam("gate");
    const lv = $("#g-live"); if (lv) lv.onclick = startScanner;
    $("#g-form").onsubmit = ev => { ev.preventDefault(); const v = $("#g-code").value; if (v.trim()) gateScan(v); };
    $("#g-man").onsubmit = async ev => {
      ev.preventDefault(); const why = $("#gm-why").value;
      try { const r = await api.manualOpen(prefs.gate, prefs.barrier, why, DEMO ? $("#gm-code").value : null); if (!r.ok) throw { message: r.error === "pin" || !r.error ? "كلمة السر غير صحيحة." : r.error }; clearTimeout(gTimer); G = { phase: "open", manual: why, armOpen: true }; renderGateSoft(); gTimer = setTimeout(() => { G.armOpen = false; const b = $(".gate-box"); if (b) { b.classList.remove("open"); $(".gate-state").innerHTML = closedLabel(); } }, 7000); }
      catch (e) { const er = $("#gm-err"); er.textContent = errMsg(e); er.hidden = false; }
    };
    document.querySelectorAll("[data-g]").forEach(b => (b.onclick = async () => {
      const k = b.dataset.g;
      if (k === "reset") { await api.reset(); store.set("my", []); prefs.lastCode = null; savePrefs(); G = { phase: "idle" }; toast("أُعيد ضبط البيانات التجريبية"); return render(); }
      if (k === "mine") return gateScan(prefs.lastCode);
      const code = api.demoCode(k, prefs.gate, mine ? mine.id : null, prefs.barrier);
      if (!code) return toast(B.PASS[k] && k === "maint" ? "لا يوجد تصريح صيانة لهذه المحطة اليوم. يصدره المدير." : "لا يوجد مثال مناسب الآن");
      gateScan(code);
    }));
  }
  /* live camera scanner (works on the public website) */
  async function startScanner() {
    if (scanner) return;
    const box = document.createElement("div"); box.className = "scanner";
    box.innerHTML = `<div class="sc-in"><video playsinline muted></video><div class="sc-frame"></div><div class="sc-bar"><span>${B.BARRIER[prefs.barrier]} · ${esc(stById(prefs.gate).name)}</span><button class="btn" type="button">إيقاف الماسح</button></div><div class="sc-msg" aria-live="polite"></div></div>`;
    document.body.appendChild(box);
    const video = box.querySelector("video"), msg = box.querySelector(".sc-msg"), c = document.createElement("canvas"), g = c.getContext("2d", { willReadFrequently: true });
    let stream, raf, last = { code: "", at: 0 }, busy = false;
    const stop = () => { cancelAnimationFrame(raf); if (stream) stream.getTracks().forEach(t => t.stop()); box.remove(); scanner = null; render(); };
    box.querySelector("button").onclick = stop;
    scanner = { stop };
    try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false }); video.srcObject = stream; await video.play(); }
    catch (e) { box.remove(); scanner = null; toast("لم يُسمح بالكاميرا. استعمل «من صورة» أو اكتب الرمز."); return; }
    const tick = async () => {
      if (!scanner) return;
      if (!busy && video.readyState >= 2 && typeof jsQR === "function") {
        const w = video.videoWidth, h = video.videoHeight, k = Math.min(1, 800 / Math.max(w, h)); c.width = Math.round(w * k); c.height = Math.round(h * k);
        g.drawImage(video, 0, 0, c.width, c.height); const r = jsQR(g.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
        if (r && r.data && !(r.data === last.code && Date.now() - last.at < 5000)) {
          last = { code: r.data, at: Date.now() }; busy = true;
          try { const d = await api.scan(r.data, prefs.gate, prefs.barrier); G = Object.assign({ phase: d.open ? "open" : d.soft ? "wait" : "refused", armOpen: !!d.open }, d); }
          catch (e) { G = { phase: "refused", title: "تعذّر التحقق", msg: errMsg(e) }; }
          msg.className = "sc-msg " + (G.phase === "open" ? "ok" : G.phase === "wait" ? "wait" : "bad"); msg.textContent = G.phase === "open" ? "مفتوح: " + (G.ticket ? `${B.LANES[G.ticket.lane].l} ${G.ticket.number}` : G.pass ? B.PASS[G.pass.type].label : "") : G.title;
          setTimeout(() => { busy = false; msg.textContent = ""; msg.className = "sc-msg"; }, 2500);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  /* ===================== MANAGER ===================== */
  async function renderManager(my) {
    let sess = await api.session();
    if (DEMO && !sess) {
      paint(my, `<form class="card stack login" id="lg-form" novalidate>
        <h2>دخول مدير المحطة</h2><p class="muted" style="margin:0">موقع خاص بمدير المحطة. لا يدخله العون.</p>
        <div class="field"><label class="label" for="lg-st">المحطة</label><select id="lg-st">${stationOptions(STATIONS, prefs.gate)}</select></div>
        <div class="field"><label class="label" for="lg-code">كلمة السر</label><input type="password" id="lg-code" autocomplete="off" inputmode="numeric" dir="ltr"><span class="hint" id="lg-err" style="color:var(--bad)" hidden>كلمة السر غير صحيحة.</span></div>
        <button class="btn primary block" type="submit">دخول</button><span class="hint">كلمة السر في هذا العرض: ${esc(CFG.DEMO_PIN || "2026")}</span></form>`);
      $("#lg-form").onsubmit = async ev => { ev.preventDefault(); try { await api.login({ station: $("#lg-st").value, pin: $("#lg-code").value }); render(); } catch (e) { $("#lg-err").hidden = false; } };
      return;
    }
    if (!DEMO) { sess = await staffGate(my, ["manager", "wilaya"], "دخول مدير المحطة"); if (!sess) return; }
    const sid = sess.station || prefs.gate; const d = await api.managerData(sid); const s = d.station, M = d.meter;
    const lf = prefs.mLane === "all" ? null : prefs.mLane;
    const q = d.queue.filter(t => !lf || t.lane === lf);
    const row = (t, extra) => `<tr><td>${tno(t)}</td><td>${vehChip(t.vtype)}</td><td>${plateHTML(t.plate)}</td><td>${B.FUEL[t.fuel]}</td>${extra}</tr>`;
    if (!paint(my, `<div class="stack">
      <div class="mgr-head"><div><span class="label">لوحة مدير المحطة</span><p class="big-title">${esc(s.name)}</p></div><button class="btn sm" id="m-out" type="button">خروج</button></div>
      <div class="kpis">
        <div class="kpi"><span class="label">في الانتظار</span><b>${d.kpis.waiting}</b></div>
        <div class="kpi"><span class="label">داخل المحطة الآن</span><b>${d.kpis.inside + d.passesInside.length}</b></div>
        <div class="kpi"><span class="label">خرجوا اليوم</span><b>${d.kpis.done}</b></div>
        <div class="kpi ${d.kpis.manual ? "alert" : ""}"><span class="label">فتح يدوي اليوم</span><b>${d.kpis.manual}</b></div>
      </div>
      ${d.longInside.length ? `<div class="result red"><div class="verdict"><span class="dot"></span>${B.cars(d.longInside.length)} داخل المحطة منذ أكثر من 30 دقيقة</div><div class="row">${d.longInside.map(t => `${tno(t)} ${plateHTML(t.plate)} <span class="hint">منذ ${B.hm(t.enteredAt)}</span>`).join(" · ")}</div><span class="hint" style="color:var(--ink)">مركبة تبقى طويلاً قد تملأ جالونات أو تُملأ عدة مرات. تحقّق منها.</span></div>` : ""}
      <div class="grid2">
        <div class="stack">
          <div class="card stack">
            <div class="row" style="justify-content:space-between"><h2>الطابور</h2><div style="min-width:min(100%,340px)">${seg("m-lane", [["all", "الكل"], ["women", "النساء"], ["men", "الرجال"], ["state", "الدولة"]], prefs.mLane, "four")}</div></div>
            ${q.length ? `<div class="tbl-wrap"><table><thead><tr><th>الرقم</th><th>المركبة</th><th>اللوحة</th><th>الوقود</th><th>التسجيل</th><th>الحالة</th><th></th></tr></thead><tbody>
              ${q.map(t => row(t, `<td>${esc(B.VIA[t.via] || "")} · ${B.hm(t.createdAt)}</td><td>${t.canEnter ? `<span class="pill ok">يمكنه الدخول</span>` : `<span class="pill info">ينتظر</span>`}</td><td><button class="btn sm ghost" data-noshow="${t.id}" type="button">غائب</button></td>`)).join("")}
            </tbody></table></div>` : `<div class="empty">لا أحد في الطابور.</div>`}
          </div>
          <div class="card stack">
            <h2>داخل المحطة الآن</h2>
            ${d.inside.length || d.passesInside.length ? `<div class="tbl-wrap"><table><thead><tr><th>الرقم</th><th>المركبة</th><th>اللوحة</th><th>الوقود</th><th>دخل</th></tr></thead><tbody>
              ${d.inside.map(t => row(t, `<td class="${Date.now() - B.ms(t.enteredAt) > 30 * 60e3 ? "bad-t" : ""}">${B.hm(t.enteredAt)}</td>`)).join("")}
              ${d.passesInside.map(p => `<tr><td colspan="2"><span class="pass-type">${I[p.type]}${B.PASS[p.type].label}</span></td><td>${plateHTML(p.plate)}</td><td>—</td><td>${p.insideAt ? B.hm(p.insideAt) : ""}</td></tr>`).join("")}
            </tbody></table></div>` : `<div class="empty">لا توجد مركبات داخل المحطة.</div>`}
          </div>
          <div class="card"><h2 style="margin-bottom:4px">سجل الحاجزين</h2>${d.log.length ? d.log.map(g => `<div class="list-item"><div class="row" style="justify-content:space-between"><b>${B.BARRIER[g.barrier] || ""} · ${g.kind === "ticket" ? "بتذكرة" : g.kind === "pass" ? "بتصريح: " + esc(g.note) : g.kind === "manual" ? "فتح يدوي" : "رفض: " + esc(g.note)}</b><span class="hint">${B.hm(g.at)}</span></div>${g.plate ? plateHTML(g.plate) : ""}${g.kind === "manual" ? `<span class="why">${esc(g.note)}</span>` : ""}</div>`).join("") : `<div class="empty">لا توجد حركة بعد.</div>`}</div>
        </div>
        <div class="stack">
          <div class="card">
            <h2 style="margin-bottom:6px">حالة المحطة</h2>
            ${Object.keys(B.FUEL).map(f => `<div class="toggle"><span>${B.FUEL[f]} <span class="hint">${s.fuel[f] ? "متوفر" : "بانتظار الصهريج"}</span></span><label class="switch"><input type="checkbox" id="fu-${f}" data-fuel="${f}" ${s.fuel[f] ? "checked" : ""} aria-label="${B.FUEL[f]} متوفر"><span></span></label></div>`).join("")}
            ${Object.keys(B.LANES).map(l => `<div class="toggle"><span>مضخات ${B.LANES[l].label}</span><div class="stepper"><button class="btn sm" data-pump="${l}:-1" type="button" aria-label="إنقاص">−</button><b>${s.pumps[l]}</b><button class="btn sm" data-pump="${l}:1" type="button" aria-label="زيادة">+</button></div></div>`).join("")}
            <div class="hint" style="margin-top:8px">حاجز الدخول يُدخل في كل قسم ضعف عدد مضخاته.</div>
          </div>
          <div class="card stack" style="gap:8px">
            <h2>عدّاد المضخات اليوم</h2>
            <div class="meter"><span>خرج من المضخات</span><b>${B.L(M.sold)}</b><span>مركبات دخلت من الحاجز</span><b>${M.count}</b><span>أقصى ما يحق لها</span><b>${B.L(M.allowed)}</b></div>
            <span class="pill ${M.over > 0 ? "bad" : "ok"}" style="align-self:flex-start">${M.over > 0 ? `${B.L(M.over)} أكثر من المسموح` : "مطابق"}</span>
            <form class="stack" id="m-meter" style="gap:8px" novalidate>
              <div class="row" style="flex-wrap:nowrap"><input type="text" id="mm-start" inputmode="numeric" dir="ltr" value="${M.start}" aria-label="قراءة الصباح"><input type="text" id="mm-now" inputmode="numeric" dir="ltr" value="${M.now}" aria-label="قراءة الآن"></div>
              <div class="row" style="justify-content:space-between"><span class="hint">قراءة الصباح · قراءة الآن</span><button class="btn sm" type="submit">تسجيل</button></div>
            </form>
            <span class="hint">آخر قراءة ${M.readAt ? B.hm(M.readAt) : "—"}. إذا خرج من المضخات أكثر مما يحق للمركبات التي دخلت، فهناك وقود بيع لمن لم يمرّ من الحاجز.</span>
          </div>
          <div class="card stack" style="gap:6px">
            <h2>تصاريح الدخول</h2>
            ${d.passes.map(p => passRow(p, p.type === "maint")).join("") || `<div class="empty">لا توجد تصاريح.</div>`}
            <form class="stack" id="m-pass" style="gap:8px;border-top:1px dashed var(--line);padding-top:10px" novalidate>
              <span class="label">تصريح صيانة ليوم واحد</span>
              <input type="text" id="mp-holder" placeholder="اسم التقني أو المؤسسة" aria-label="اسم التقني أو المؤسسة" autocomplete="off">
              <button class="btn sm" type="submit">إصدار التصريح</button>
              <span class="hint">تصاريح نفطال والغاز والحماية المدنية تصدرها الولاية.</span>
            </form>
          </div>
        </div>
      </div>
    </div>`)) return;
    $("#m-out").onclick = async () => { await api.logout(); render(); };
    document.querySelectorAll("input[name=m-lane]").forEach(r => (r.onchange = e => { prefs.mLane = e.target.value; savePrefs(); render(); }));
    document.querySelectorAll("[data-fuel]").forEach(c => (c.onchange = async () => { await api.updateStation(sid, { fuel: { [c.dataset.fuel]: c.checked } }); render(); }));
    document.querySelectorAll("[data-pump]").forEach(b => (b.onclick = async () => { const [l, dd] = b.dataset.pump.split(":"); await api.updateStation(sid, { pumps: { [l]: s.pumps[l] + Number(dd) } }); render(); }));
    document.querySelectorAll("[data-noshow]").forEach(b => (b.onclick = async () => { await api.noShow(b.dataset.noshow); toast("أُلغي دور الغائب"); render(); }));
    bindRevoke();
    $("#m-meter").onsubmit = async ev => { ev.preventDefault(); try { await api.updateMeter(sid, Number(B.norm($("#mm-start").value)), Number(B.norm($("#mm-now").value))); render(); } catch (e) { toast("قراءة الآن يجب أن تكون أكبر من قراءة الصباح"); } };
    $("#m-pass").onsubmit = async ev => { ev.preventDefault(); const h = $("#mp-holder").value.trim(); if (!h) return $("#mp-holder").focus(); await api.issuePass({ type: "maint", holder: h, plate: "", station: sid, days: 1 }); toast("صدر تصريح الصيانة"); render(); };
  }
  function passRow(p, canRevoke) {
    return `<div class="pass"><div class="pq">${qrSvg(p.code)}</div><div class="stack" style="gap:3px;min-width:0">
      <span class="pass-type">${I[p.type]}${B.PASS[p.type].label}${p.inside ? ` <span class="pill info">داخل المحطة</span>` : ""}</span><span class="hint">${esc(p.holder)}</span>${p.plate ? plateHTML(p.plate) : ""}
      <span class="hint">${p.station ? "محطة واحدة" : "كل محطات الولاية"} · ${p.live ? `صالح حتى ${dateFR(p.to)}` : p.revoked ? "ملغى" : "منتهي"}</span>
      ${canRevoke && p.live ? `<div><button class="btn sm ghost" data-revoke="${p.id}" type="button">إلغاء التصريح</button></div>` : ""}</div></div>`;
  }
  function bindRevoke() { document.querySelectorAll("[data-revoke]").forEach(b => (b.onclick = async () => { await api.revokePass(b.dataset.revoke); toast("أُلغي التصريح"); render(); })); }

  /* ===================== WILAYA / NAFTAL ===================== */
  const WHY = { recent: "محاولة حجز قبل انتهاء المدة", queue: "حجز في محطتين", vtype: "تغيير نوع المركبة", reuse: "تذكرة مستعملة", wrongst: "تذكرة محطة أخرى", manual: "فتح يدوي للحاجز", meter: "العدّاد أكثر من المسموح", noentry: "خروج دون المرور من الدخول" };
  async function renderWilaya(my) {
    const sess = await staffGate(my, ["wilaya"], "دخول مصالح الولاية"); if (!sess) return;
    const d = await api.wilayaData();
    const tot = d.rows.reduce((o, x) => ({ tk: o.tk + x.tickets, inside: o.inside + x.inside, man: o.man + x.manual, susp: o.susp + (x.reasons.length ? 1 : 0) }), { tk: 0, inside: 0, man: 0, susp: 0 });
    if (!paint(my, `<div class="stack">
      ${!DEMO ? `<div class="mgr-head"><div><span class="label">مصالح الولاية</span><p class="big-title">كل المحطات</p></div><button class="btn sm" id="w-out" type="button">خروج</button></div>` : ""}
      <div class="kpis">
        <div class="kpi"><span class="label">تذاكر اليوم</span><b>${tot.tk}</b></div>
        <div class="kpi"><span class="label">داخل المحطات الآن</span><b>${tot.inside}</b></div>
        <div class="kpi ${tot.man ? "alert" : ""}"><span class="label">فتح يدوي اليوم</span><b>${tot.man}</b></div>
        <div class="kpi ${tot.susp ? "alert" : ""}"><span class="label">محطات تحت المراقبة</span><b>${tot.susp}</b></div>
      </div>
      <div class="card stack">
        <h2>محطات الولاية اليوم</h2>
        <div class="tbl-wrap"><table><thead><tr><th>المحطة</th><th>تذاكر</th><th>ينتظرون</th><th>داخل</th><th>خرجوا</th><th>فتح يدوي</th><th>خرج من المضخات</th><th>يحق للداخلين</th><th>الحالة</th></tr></thead><tbody>
        ${d.rows.map(x => `<tr class="${x.reasons.length ? "row-bad" : ""}"><td><b>${esc(x.name)}</b></td><td class="num-cell">${x.tickets}</td><td class="num-cell">${x.waiting}</td><td class="num-cell">${x.inside}</td><td class="num-cell">${x.done}</td><td class="num-cell ${x.manual >= 3 ? "bad-t" : ""}">${x.manual}</td><td class="num-cell">${B.L(x.sold)}</td><td class="num-cell">${B.L(x.allowed)}</td>
          <td>${x.reasons.length ? x.reasons.map(r => `<span class="pill bad">${esc(r)}</span>`).join(" ") : `<span class="pill ok">عادي</span>`}</td></tr>`).join("")}
        </tbody></table></div>
        <span class="hint">"خرج من المضخات" من العدّاد، و"يحق للداخلين" مجموع الحد الأقصى لكل مركبة دخلت من الحاجز. إذا كان الأول أكبر، فهناك وقود بيع لمن لم يمرّ من الحاجز.</span>
      </div>
      <div class="grid2">
        <div class="stack">
          <div class="card"><h2 style="margin-bottom:4px">آخر التنبيهات</h2>${d.alerts.length ? d.alerts.map(a => `<div class="list-item"><div class="row" style="justify-content:space-between">${a.plate ? plateHTML(a.plate) : `<b>${esc(a.stationName)}</b>`}<span class="hint">${B.ago(a.at)}</span></div><span class="why">${WHY[a.reason] || "تنبيه"}</span><span class="hint">${esc(a.stationName)} · ${esc(a.detail)}</span></div>`).join("") : `<div class="empty">لا توجد تنبيهات.</div>`}</div>
          <div class="card"><h2 style="margin-bottom:4px">لوحات متكررة: احتمال تهريب</h2>
            ${d.repeat.length ? `<div class="tbl-wrap"><table><thead><tr><th>اللوحة</th><th>ولاية الترقيم</th><th>التنبيهات</th><th>آخرها</th></tr></thead><tbody>${d.repeat.map(r => `<tr><td>${plateHTML(r.plate)}</td><td>${esc(B.wilayaOf(r.plate))}</td><td><span class="pill bad">${r.count}</span></td><td>${B.ago(r.last)}</td></tr>`).join("")}</tbody></table></div><span class="hint">تُرسل هذه القائمة لمصالح الأمن والجمارك.</span>` : `<div class="empty">لا توجد لوحات متكررة.</div>`}
          </div>
          <div class="card stack" style="gap:6px">
            <h2>تصاريح الولاية الدائمة</h2>
            ${d.passes.map(p => passRow(p, true)).join("")}
            <form class="stack" id="w-pass" style="gap:8px;border-top:1px dashed var(--line);padding-top:10px" novalidate>
              <span class="label">إصدار تصريح جديد</span>
              <select id="wp-type" aria-label="نوع التصريح">${["naftal", "gas", "civil"].map(k => `<option value="${k}">${B.PASS[k].label}</option>`).join("")}</select>
              <input type="text" id="wp-holder" placeholder="الجهة (مثلاً: نفطال · مركز تمنراست)" aria-label="الجهة" autocomplete="off">
              <input type="text" id="wp-plate" inputmode="numeric" dir="ltr" placeholder="لوحة المركبة 01234 120 11" aria-label="لوحة المركبة" autocomplete="off">
              <select id="wp-days" aria-label="مدة الصلاحية"><option value="30">شهر</option><option value="90" selected>3 أشهر</option><option value="365">سنة</option></select>
              <button class="btn primary" type="submit">إصدار التصريح</button>
            </form>
          </div>
        </div>
        <div class="stack">
          <div class="card stack">
            <h2>قواعد كل نوع مركبة</h2>
            <div class="tbl-wrap"><table><thead><tr><th>المركبة</th><th>مرة كل</th><th>حتى</th></tr></thead><tbody>
            ${VEH_ORDER.map(k => `<tr><td>${vehChip(k)}</td><td><select id="rw-${k}" data-rw="${k}" aria-label="المدة">${[12, 24, 48, 72].map(h => `<option value="${h}" ${d.rules.veh[k].win === h ? "selected" : ""}>${h} سا</option>`).join("")}</select></td>
              <td><select id="rm-${k}" data-rm="${k}" aria-label="الحد الأقصى">${[10, 20, 40, 50, 60, 70, 80, 100, 150, 200, 300].map(m => `<option value="${m}" ${d.rules.veh[k].max === m ? "selected" : ""}>${m} ل</option>`).join("")}</select></td></tr>`).join("")}
            </tbody></table></div>
            <span class="hint">تُطبَّق على كل المحطات فوراً.</span>
          </div>
          <div class="card stack">
            <h2>مركبات الدولة والمرخّصة</h2>
            <span class="hint">قسم الدولة لا يظهر إلا للوحات المسجّلة هنا بطلب رسمي. النقل المرخّص لا تطبّق عليه مدة الانتظار.</span>
            ${d.exempt.slice(-6).reverse().map(x => `<div class="ex-row">${plateHTML(x.plate)}<span class="hint">${esc(B.CATS[x.cat])}</span><button class="btn sm ghost" data-unex="${x.plate}" type="button">إزالة</button></div>`).join("")}
            ${d.exempt.length > 6 ? `<span class="hint">و${d.exempt.length - 6} مركبة أخرى.</span>` : ""}
            <form id="ex-form" class="stack" style="gap:8px" novalidate>
              <input type="text" id="ex-plate" inputmode="numeric" dir="ltr" placeholder="01234 120 11" aria-label="لوحة المركبة" autocomplete="off">
              <select id="ex-cat" aria-label="الصنف">${Object.entries(B.CATS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("")}</select>
              <button class="btn primary" type="submit">إضافة</button>
            </form>
          </div>
        </div>
      </div>
    </div>`)) return;
    const wo = $("#w-out"); if (wo) wo.onclick = async () => { await api.logout(); render(); };
    document.querySelectorAll("[data-rw]").forEach(x => (x.onchange = async () => { await api.setRule(x.dataset.rw, { win: Number(x.value) }); toast("حُفظت القاعدة"); }));
    document.querySelectorAll("[data-rm]").forEach(x => (x.onchange = async () => { await api.setRule(x.dataset.rm, { max: Number(x.value) }); toast("حُفظت القاعدة"); render(); }));
    document.querySelectorAll("[data-unex]").forEach(b => (b.onclick = async () => { await api.removeExempt(b.dataset.unex); render(); }));
    bindRevoke();
    $("#ex-form").onsubmit = async ev => { ev.preventDefault(); try { await api.addExempt($("#ex-plate").value, $("#ex-cat").value); toast("أُضيفت المركبة"); render(); } catch (e) { toast("اكتب أرقام اللوحة كاملة"); } };
    $("#w-pass").onsubmit = async ev => { ev.preventDefault(); const h = $("#wp-holder").value.trim(), pl = B.norm($("#wp-plate").value); if (!h) return $("#wp-holder").focus(); if (pl && !B.validPlate(pl)) return toast("رقم اللوحة غير مكتمل"); await api.issuePass({ type: $("#wp-type").value, holder: h, plate: pl, station: null, days: Number($("#wp-days").value) }); toast("صدر التصريح"); render(); };
  }

  /* ===================== MY TICKETS ===================== */
  async function renderMine(my) {
    const list = (await Promise.all(myTickets().map(m => api.ticket(m.code).catch(() => null)))).filter(Boolean);
    const pill = t => t.status === "done" ? `<span class="pill ok">خرج ${B.hm(t.exitedAt)}</span>` : t.status === "inside" ? `<span class="pill ok">داخل المحطة</span>` : t.status === "cancelled" ? `<span class="pill bad">ملغاة</span>` : !t.isToday ? `<span class="pill wait">منتهية</span>` : t.canEnter && t.fuelOk ? `<span class="pill ok">حان دورك</span>` : `<span class="pill info">قبلك ${t.ahead}</span>`;
    if (!paint(my, `<div class="narrow stack">
      <h2 class="page-title">تذاكري</h2>
      ${list.length ? list.map(t => `<button class="tk-row ${t.lane}" data-open="${esc(t.code)}" type="button">
          <span class="tk-row-num">${t.number}</span>
          <span class="stack" style="gap:2px;min-width:0;text-align:start"><b>${esc(t.stationName)}</b><span class="hint">${B.LANES[t.lane].label} · ${B.VEH[t.vtype].label} · ${B.dayWord(t.createdAt)} ${B.hm(t.createdAt)}</span>${plateHTML(t.plate)}</span>
          ${pill(t)}</button>`).join("")
        : `<div class="card stack" style="align-items:center;text-align:center"><b>لا توجد تذاكر بعد</b><span class="hint">التذاكر التي تحجزها من هذا الهاتف تظهر هنا.</span><a class="btn primary" href="#register">احجز دورك</a></div>`}
      <span class="hint">التذاكر محفوظة في هذا الهاتف. إذا حجزت من مقهى إنترنت، فالورقة المطبوعة هي تذكرتك.</span>
    </div>`)) return;
    document.querySelectorAll("[data-open]").forEach(b => (b.onclick = () => { const c = b.dataset.open; const m = myTickets().find(x => x.code === c); if (m) addMine(m); prefs.mode = "self"; savePrefs(); location.hash = "register"; }));
  }

  /* ===================== STATIONS ===================== */
  async function renderStations(my) {
    if (!paint(my, `<div class="narrow stack">
      <h2 class="page-title">المحطات الآن</h2>
      ${STATIONS.map(s => { const open = s.fuel.essence || s.fuel.gasoil; return `<div class="card stack st-card" style="gap:10px">
        <div class="row" style="justify-content:space-between"><b class="st-name">${esc(s.name)}</b>${open ? `<span class="pill ok">مفتوحة</span>` : `<span class="pill wait">بانتظار الصهريج</span>`}</div>
        <div class="row">${fuelPills(s)}</div>
        <div class="lane-mini">${["women", "men", "state"].map(l => `<div class="${l}"><span>${B.LANES[l].label}</span><b>${s.waiting[l]}</b><small>${open ? "≈ " + B.dur(laneWait(s, l)) : "—"}</small></div>`).join("")}</div>
        <button class="btn ${open ? "primary" : ""}" data-book="${s.id}" type="button">احجز في هذه المحطة</button>
      </div>`; }).join("")}
      <span class="hint">الأرقام تتحدّث وحدها. المدة تقريبية حسب عدد المضخات العاملة.</span>
    </div>`)) return;
    document.querySelectorAll("[data-book]").forEach(b => (b.onclick = () => { prefs.reg = b.dataset.book; R = { step: "start" }; savePrefs(); location.hash = "register"; }));
  }

  /* ===================== STAFF HUB ===================== */
  async function renderStaff(my) {
    const sess = DEMO ? null : await api.session();
    const tile = (href, icon, title, sub) => `<a class="hub-tile" href="#${href}">${icon}<b>${title}</b><span>${sub}</span></a>`;
    if (!paint(my, `<div class="narrow stack">
      <h2 class="page-title">العاملون</h2>
      <p class="muted" style="margin:0">لأعوان الحواجز ومديري المحطات ومصالح الولاية ونفطال. ${DEMO ? "في نسخة العرض كل الواجهات مفتوحة للتجربة." : "كل واجهة تطلب حساباً تنشئه الولاية."}</p>
      ${sess ? `<div class="card row" style="justify-content:space-between"><span>متصل: <b>${esc(sess.name || sess.role)}</b></span><button class="btn sm" id="hub-out" type="button">خروج</button></div>` : ""}
      <div class="hub">
        ${tile("gate", I.qr, "الحاجزان", "مسح التذاكر عند الدخول والخروج")}
        ${tile("manager", I.lock, "مدير المحطة", "الطابور، الوقود، العدّاد، الصيانة")}
        ${tile("wilaya", I.state, "الولاية / نفطال", "كل المحطات، القواعد، التصاريح")}
        ${tile("qr", I.print, "ملصقات QR", "للمحطات ومقاهي الإنترنت والبلديات")}
      </div>
      ${installCard()}
    </div>`)) return;
    const o = $("#hub-out"); if (o) o.onclick = async () => { await api.logout(); render(); };
    bindInstall();
  }

  /* ===================== POSTERS ===================== */
  async function renderPosters(my) {
    paint(my, `<div class="stack">
      <div class="card stack" style="gap:8px">
        <h2>ملصق التسجيل لكل محطة</h2>
        <p style="margin:0">يُعلّق عند المحطة وفي مقاهي الإنترنت والبلديات. يمسحه السائق فيفتح موقع التسجيل باسم المحطة.</p>
        ${!IN_CLAUDE ? `<div><button class="btn primary" id="p-print" type="button">${I.print}طباعة الملصقات</button></div>` : `<span class="hint">في هذا العرض يشير الرمز إلى صفحة العرض الخاصة بك. على الموقع العام يشير تلقائياً إلى عنوان الموقع.</span>`}
      </div>
      <div class="qr-grid">${STATIONS.map(s => `<div class="qr-item"><div class="poster"><div class="p-brand">${esc(NAME)}</div><div class="p-name">${esc(s.name)}</div>${qrSvg(publicBase() + "#qr-" + s.id)}<div class="p-steps"><b>1</b> امسح الرمز &nbsp; <b>2</b> صوّر لوحة مركبتك<br><b>3</b> خذ رقمك ورمزك وادخل من الحاجز</div><div class="p-foot">ليس لديك هاتف؟ سجّل في مقهى إنترنت أو في البلدية</div></div><a class="btn noprint" href="#qr-${s.id}">افتح كما يراه السائق</a></div>`).join("")}</div>
    </div>`);
    const pp = $("#p-print"); if (pp) pp.onclick = () => printOnly("print-posters");
  }

  /* ---------- camera input: plate photo (registration) or QR photo (gate) ---------- */
  $("#cam").addEventListener("change", async ev => {
    const file = ev.target.files && ev.target.files[0]; if (!file) return;
    if (camTarget === "gate") {
      G = { phase: "busy" }; paintGateResult();
      const r = await decodeQRFile(file);
      if (r.text) return gateScan(r.text);
      G = { phase: "refused", title: "لم يُقرأ أي رمز", msg: "صوّر الرمز من قريب وبوضوح، أو اكتب رمز التذكرة." }; return paintGateResult();
    }
    const photo = await shrink(file);
    R = { step: "busy", msg: "جارٍ قراءة اللوحة…", photo }; paintReg();
    const r = await readPlate(file);
    if (r.plate) return regPlate(r.plate, photo, r.low);
    R = { step: "manual", photo, note: r.unavailable ? "حُفظت الصورة. اكتب أرقام اللوحة كما تظهر فيها." : r.none ? "لم تظهر اللوحة بوضوح. أعد التصوير من الأمام أو اكتب الأرقام." : "تعذّرت قراءة اللوحة. اكتب الأرقام." };
    paintReg();
  });

  /* ---------- boot ---------- */
  document.title = `${NAME} – وقود تمنراست`;
  document.querySelectorAll("[data-app-name]").forEach(el => (el.textContent = NAME));
  document.querySelectorAll("[data-app-tagline]").forEach(el => (el.textContent = CFG.TAGLINE || ""));
  const pilot = $(".pilot"); if (pilot) pilot.hidden = !DEMO;
  window.addEventListener("hashchange", () => { R = { step: "start" }; G = { phase: "idle" }; clearTimeout(gTimer); if (scanner) scanner.stop(); else render(); });
  render();
  setInterval(() => {
    if (scanner || document.hidden) return;
    if (document.activeElement && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (document.querySelector("details[open] form")) return;
    const v = current();
    if (v === "register" && R.step !== "start") return;
    if (v === "gate" && (G.armOpen || G.phase === "busy")) return;
    render();
  }, 20000);
})();
