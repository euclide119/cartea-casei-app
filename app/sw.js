/* Cartea Casei · service worker: doar scheletul aplicației (pornește și fără semnal).
   Capitolele, rapoartele și orice răspuns de la server NU se păstrează aici (alt domeniu → nu trec prin cache). */
const CACHE = 'cartea-casei-20261024d';
const SHELL = ['./', './index.html', './styles.css?v=20261024a', './app.js?v=20261024d', './cereri.js?v=20261024a', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.endsWith('config.js')) return;
  e.respondWith(fetch(e.request, { cache: 'no-store' }).then((r) => { const c = r.clone(); caches.open(CACHE).then((x) => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
});
