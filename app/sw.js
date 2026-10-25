/* Cartea Casei · service worker: doar scheletul aplicației (pornește și fără semnal).
   Capitolele, rapoartele și orice răspuns de la server NU se păstrează aici (alt domeniu → nu trec prin cache). */
const CACHE = 'cartea-casei-20261025g';
const SHELL = ['./', './index.html', './styles.css?v=20261025d', './app.js?v=20261025g', './cereri.js?v=20261024a', './mapa.js?v=20261025c', './manifest.webmanifest', './icon-192.png', './icon-512.png', './logo.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
const POZE = 'cartea-casei-poze';
/* sesiunea pentru raportul interactiv: o trimite aplicația (token, dispozitiv, rapoartele contului); se păstrează și după repornirea sw */
let SES = null;
const SES_CHEIE = '/__cc_sesiune';
const sesiune = async () => { if (SES) return SES; try { const r = await (await caches.open('cc-sesiune')).match(SES_CHEIE); if (r) SES = await r.json(); } catch (e) {} return SES; };
self.addEventListener('message', (e) => {
  if (e.data === 'sterge-poze') { SES = null; caches.delete(POZE); caches.delete('cc-sesiune'); return; }
  if (e.data && e.data.tip === 'sesiune') { SES = e.data; caches.open('cc-sesiune').then((c) => c.put(SES_CHEIE, new Response(JSON.stringify(SES), { headers: { 'Content-Type': 'application/json' } }))); }
});
const raspunsJson = (o, st = 200) => new Response(JSON.stringify(o), { status: st, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
async function fisierRaport(e, f, rid) {
  const S = await sesiune();
  if (!S || !S.jwt) return new Response('fără sesiune', { status: 401 });
  const r0 = (S.rapoarte || []).find((x) => x.id === rid) || {};
  const cheie = `/v/${rid}/${r0.versiune || ''}/${f}`;
  const c = await caches.open(POZE);
  // cheia are versiunea raportului: conținutul unei versiuni nu se schimbă, deci și datele (json) se servesc din telefon, fără alt apel la server
  if (r0.versiune) { const hit = await c.match(cheie); if (hit) return hit; }
  try {
    const r = await fetch(`${S.fn}fisier?raport=${encodeURIComponent(rid)}&f=${encodeURIComponent(f)}`, { headers: { Authorization: 'Bearer ' + S.jwt, apikey: S.apikey, 'x-dispozitiv': S.amp } });
    if (r.ok && r0.versiune) c.put(cheie, r.clone());
    return r;
  } catch (err) { const hit = await c.match(cheie); return hit || new Response('fără semnal', { status: 503 }); }
}
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  // raportul interactiv: datele proprietății doar cu cont; sursele și celelalte proprietăți nu există aici
  const rp = u.origin === location.origin ? u.pathname.match(/\/app\/raport\/(.+)$/) : null;
  if (rp && (e.request.method === 'GET' || e.request.method === 'HEAD')) {
    const cale = decodeURIComponent(rp[1]), m = cale.match(/^p\/([a-z0-9_]{3,64})\/(.+)$/);
    // HEAD (raportul verifică dacă un registru există): același răspuns, fără corp — altfel ar da 404 pe găzduirea publică și ar marca fals „fără registru"
    if (m) { const g = fisierRaport(e, m[1] + '/' + m[2], m[1]); e.respondWith(e.request.method === 'HEAD' ? g.then((r) => new Response(null, { status: r.status })) : g); return; }
    if (cale === 'proprietati.json') { e.respondWith(sesiune().then((S) => raspunsJson(((S && S.rapoarte) || []).map((r) => ({ id: r.id, eticheta: r.titlu }))))); return; }
    if (cale === 'surse.json') { e.respondWith(raspunsJson({})); return; }
    if (cale === 'piata_istoric.json') { e.respondWith(sesiune().then((S) => S && S.rid ? fisierRaport(e, 'piata_istoric.json', S.rid) : raspunsJson({}))); return; }
    if (cale === 'juridic_model.html') { e.respondWith(new Response('', { status: 404 })); return; }
  }
  // pozele raportului: rămân pe telefon (cheia = calea fișierului, fără semnătura care expiră); se șterg la „ieși din cont”
  if (e.request.method === 'GET' && /\.supabase\.co$/.test(u.hostname) && u.pathname.includes('/storage/v1/object/sign/rapoarte/')) {
    const cheie = u.origin + u.pathname;
    e.respondWith(caches.open(POZE).then(async (c) => {
      const hit = await c.match(cheie); if (hit) return hit;
      const r = await fetch(u.href, { mode: 'cors', credentials: 'omit' });
      if (r.ok) c.put(cheie, r.clone());
      return r;
    }).catch(() => fetch(e.request)));
    return;
  }
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.endsWith('config.js')) return;
  e.respondWith(fetch(e.request, { cache: 'no-store' }).then((r) => { const c = r.clone(); caches.open(CACHE).then((x) => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
});
