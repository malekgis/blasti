/* ثوابت ودوال مشتركة بين الواجهة وقاعدة بيانات العرض */
window.BL = (function () {
  "use strict";
  const FUEL = { essence: "بنزين", gasoil: "مازوت" };
  const LANES = {
    women: { label: "قسم النساء", short: "نساء", l: "ن" },
    men: { label: "قسم الرجال", short: "رجال", l: "ر" },
    state: { label: "قسم الدولة", short: "الدولة", l: "د" }
  };
  const VEH = {
    car: { label: "سيارة سياحية" },
    moto: { label: "دراجة نارية" },
    suv: { label: "رباعية الدفع 4×4" },
    pickup: { label: "بيكاب / فورغون" },
    truck: { label: "شاحنة" },
    bus: { label: "حافلة" },
    tractor: { label: "جرار فلاحي" }
  };
  const PASS = {
    naftal: { label: "صهريج نفطال", by: "الولاية ونفطال" },
    gas: { label: "شاحنة قارورات الغاز", by: "الولاية" },
    maint: { label: "الصيانة", by: "مدير المحطة" },
    civil: { label: "الحماية المدنية والإسعاف", by: "الولاية" }
  };
  const CATS = { state: "مركبة دولة أو عامل حكومي", transport: "نقل عمومي مرخّص (تاكسي، حافلة)", freight: "نقل بضائع مرخّص" };
  const VIA = { self: "صاحب المركبة", cyber: "مقهى إنترنت", commune: "شباك البلدية", post: "مكتب البريد" };
  const BARRIER = { in: "حاجز الدخول", out: "حاجز الخروج" };
  const WILAYAS = ["أدرار","الشلف","الأغواط","أم البواقي","باتنة","بجاية","بسكرة","بشار","البليدة","البويرة","تمنراست","تبسة","تلمسان","تيارت","تيزي وزو","الجزائر","الجلفة","جيجل","سطيف","سعيدة","سكيكدة","سيدي بلعباس","عنابة","قالمة","قسنطينة","المدية","مستغانم","المسيلة","معسكر","ورقلة","وهران","البيض","إليزي","برج بوعريريج","بومرداس","الطارف","تندوف","تيسمسيلت","الوادي","خنشلة","سوق أهراس","تيبازة","ميلة","عين الدفلى","النعامة","عين تموشنت","غرداية","غليزان","تيميمون","برج باجي مختار","أولاد جلال","بني عباس","عين صالح","عين قزام","تقرت","جانت","المغير","المنيعة"];

  const ms = t => (t == null ? null : typeof t === "number" ? t : Date.parse(t));
  const pad = n => String(n).padStart(2, "0");
  const hm = t => { const d = new Date(ms(t)); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  const dayKey = t => { const d = new Date(ms(t) ?? Date.now()); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); };
  const dayWord = t => { const dd = Math.round((new Date(dayKey(t)).getTime() - new Date(dayKey()).getTime()) / 864e5); return dd <= 0 ? "اليوم" : dd === 1 ? "غداً" : dd === 2 ? "بعد غد" : `بعد ${dd} أيام`; };
  const when = t => `${dayWord(t)} على الساعة ${hm(t)}`;
  const mins = n => (n === 1 ? "دقيقة" : n === 2 ? "دقيقتين" : n <= 10 ? `${n} دقائق` : `${n} دقيقة`);
  const hours = n => (n === 1 ? "ساعة" : n === 2 ? "ساعتين" : n <= 10 ? `${n} ساعات` : `${n} ساعة`);
  const cars = n => (n === 0 ? "لا أحد" : n === 1 ? "مركبة واحدة" : n === 2 ? "مركبتان" : n <= 10 ? `${n} مركبات` : `${n} مركبة`);
  const ago = t => { const m = Math.max(1, Math.round((Date.now() - ms(t)) / 60e3)); if (m < 60) return `قبل ${mins(m)}`; const h = Math.floor(m / 60); if (h < 24) return `قبل ${hours(h)}`; const d = Math.floor(h / 24); return d === 1 ? "أمس" : `قبل ${d} أيام`; };
  const dur = min => { if (min <= 0) return "الآن"; if (min < 60) return mins(min); const h = Math.floor(min / 60), m = min % 60; return m ? `${hours(h)} و${mins(m)}` : hours(h); };
  const L = n => Number(Math.round(n || 0)).toLocaleString("en-US") + " ل";
  const norm = s => String(s || "").replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/\D/g, "");
  const validPlate = p => p.length >= 8 && p.length <= 11;
  const wilayaOf = p => { const w = parseInt(String(p).slice(-2), 10); return WILAYAS[w - 1] || "رمز غير معروف"; };
  /* رمز التذكرة: BL-T-XXXXXXXX ، رمز التصريح: BL-P-XXXXXXXX */
  const parseCode = raw => {
    const s = String(raw || "").trim().toUpperCase();
    let m = /(?:BL|DAWRI)-([TP])-([A-Z0-9]{4,12})/.exec(s);
    if (m) return { k: m[1], id: m[2], code: `BL-${m[1]}-${m[2]}` };
    m = /^([A-Z0-9]{8})$/.exec(s);
    if (m) return { k: "T", id: m[1], code: `BL-T-${m[1]}` };
    return null;
  };
  return { FUEL, LANES, VEH, PASS, CATS, VIA, BARRIER, WILAYAS, ms, hm, dayKey, dayWord, when, mins, hours, cars, ago, dur, L, norm, validPlate, wilayaOf, parseCode };
})();
