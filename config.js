/* إعدادات بلاصتي — هذا هو الملف الوحيد الذي تحتاج تعديله
   Blasti settings — the only file you need to edit. */
window.BLASTI_CONFIG = {
  APP_NAME: "بلاصتي",
  APP_NAME_LATIN: "Blasti",
  TAGLINE: "بلاصتك في طابور الوقود · ولاية تمنراست",

  /* "demo"     : يعمل فوراً ببيانات تجريبية محفوظة في الجهاز فقط (للعرض)
     "supabase" : يعمل بقاعدة بيانات حقيقية مشتركة بين كل الهواتف والمحطات */
  MODE: "demo",

  /* من لوحة Supabase: Project Settings ← API */
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",

  /* عنوان الموقع العام الذي تطبعه ملصقات QR. اتركه فارغاً ليُستعمل عنوان الموقع نفسه */
  PUBLIC_URL: "",

  /* كلمة سر المدير في وضع العرض فقط */
  DEMO_PIN: "2026"
};
