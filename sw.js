/* بلاصتي — يجعل التطبيق يفتح بسرعة، ويعمل حتى عند ضعف الشبكة */
const VERSION = "blasti-v1";
const SHELL = ["./", "index.html", "style.css", "config.js", "common.js", "app.js", "api-demo.js", "api-supabase.js",
  "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "favicon-32.png"];
const LIBS = ["https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js",
  "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(async c => {
    await c.addAll(SHELL);
    await Promise.all(LIBS.map(u => fetch(u, { mode: "cors" }).then(r => r.ok && c.put(u, r)).catch(() => {})));
  }).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;                                   // database calls are never cached
  if (url.hostname.endsWith("supabase.co")) return;
  const isLib = url.hostname === "cdn.jsdelivr.net" || url.hostname.endsWith("gstatic.com") || url.hostname.endsWith("googleapis.com");
  if (isLib) {                                                         // libraries and fonts: cache first
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return r; })));
    return;
  }
  if (url.origin === location.origin) {                                // app files: network first, so updates arrive
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return r; })
      .catch(() => caches.match(req).then(hit => hit || caches.match("index.html"))));
  }
});
