// Service worker de Prossima Fermata: la app funciona sin conexión y se actualiza sola.
// Estrategia: red primero (revalidando siempre con el servidor) y, sin conexión, la copia guardada.
const CACHE = "pf-v4";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png", "./pizza-boh.svg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, {cache: "reload"})))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Fuentes de Google: primero la copia guardada
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.open(CACHE).then(async c => (await c.match(req)) || fetch(req).then(r => { c.put(req, r.clone()); return r; })));
    return;
  }
  if (url.origin !== location.origin) return;
  const fresh = req.mode === "navigate" ? fetch(url.href, {cache: "no-cache", credentials: "same-origin"}) : fetch(req, {cache: "no-cache"});
  e.respondWith(fresh.then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req.mode === "navigate" ? "./index.html" : req, copy)); } return r; })
    .catch(() => caches.match(req).then(r => r || caches.match("./index.html"))));
});
