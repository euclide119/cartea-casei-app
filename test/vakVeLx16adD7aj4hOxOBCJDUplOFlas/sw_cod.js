/* Raportul public (mod client) + aplicația de test pe telefon: UN SINGUR service worker pe acest scope.
   Date: nu stau pe GitHub. Cu jetonul primit (cod, QR sau jeton Admin), p/<id>/… și piata_istoric.json vin prin funcția „raport_cod";
   fără jeton, lista de proprietăți e goală și pagina rămâne prezentarea generală. Jetonul stă în Cache „cc-cod” (/__stare), ca să supraviețuiască repornirii service worker-ului.
   v82.4.0 (07.11.2026), extins pe loc:
   · Admin (stare.adm): proprietati.json = lista celor 10 locații din funcție; datele merg cu ?n=1 când e „vezi ca client”; se păstrează în Cache „cc-date” pentru offline;
   · restul fișierelor aplicației: network-first (cu revalidare) pentru index.html, JS, CSS, JSON; cache doar ca rezervă offline;
   · version.json: mereu din rețea, niciodată din cache; skipWaiting + clients.claim (pagina reîncarcă o singură dată la schimbare). */
const FN = "https://vzrozriarqocscpgfscw.supabase.co/functions/v1/raport_cod";
const APP = "cc-app-v82-4";
const stare = async () => { try { const r = await (await caches.open("cc-cod")).match("/__stare"); return r ? await r.json() : null; } catch (e) { return null; } };
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (/^cc-app-/.test(k) && k !== APP) await caches.delete(k);
  await self.clients.claim();
})()));
const json = o => new Response(JSON.stringify(o), { headers: { "Content-Type": "application/json; charset=utf-8" } });
async function retea(req) {   // network-first, cu rezervă din cache
  const c = await caches.open(APP);
  try {
    const r = await fetch(new Request(req, { cache: "no-cache" }));
    if (r && r.ok && req.method === "GET") c.put(req, r.clone()).catch(() => {});
    return r;
  } catch (e) {
    const m = (await c.match(req)) || (await c.match(req, { ignoreSearch: true })) || (req.mode === "navigate" ? (await c.match("index.html")) || (await c.match("./")) : null);
    if (m) return m;
    return new Response("fără internet și fără copie locală", { status: 503 });
  }
}
async function date(url, s, cheie) {   // datele Admin: rețea, cu copie offline (doar pentru Admin)
  try {
    let r = await fetch(url);
    for (let i = 0; i < 3 && r.status === 429; i++) {   // v82.20.0: limita umană (master / Admin) încetinește, nu blochează: se așteaptă retry_after și se reîncearcă; blocarea unui card (fără retry_after) nu se reîncearcă
      let ra = 0; try { ra = Number((await r.clone().json()).retry_after) || 0; } catch (e) {}
      if (!ra) break; await new Promise(ok => setTimeout(ok, Math.min(ra, 30) * 1000)); r = await fetch(url);
    }
    if (s && s.adm && r.ok) (await caches.open("cc-date")).put(cheie, r.clone()).catch(() => {});
    return r;
  } catch (e) {
    if (s && s.adm) { const m = await (await caches.open("cc-date")).match(cheie); if (m) return m; }
    return new Response("fără internet", { status: 503 });
  }
}
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== "GET") return;
  const baza = new URL("./", self.registration.scope).pathname;
  if (!u.pathname.startsWith(baza)) return;
  const r = u.pathname.slice(baza.length);
  if (r === "version.json") { e.respondWith(fetch(new Request(e.request, { cache: "no-store" })).catch(() => new Response("{}", { status: 503 }))); return; }
  if (r === "proprietati.json") {
    e.respondWith(stare().then(async s => {
      if (!s) return json([]);
      if (s.adm) { try { const x = await fetch(`${FN}?t=${encodeURIComponent(s.token)}&f=__lista`); if (x.ok) return x; if (x.status === 401) return json([]); } catch (err) {} return json(s.lista || []); }
      return json([{ id: s.id, eticheta: s.titlu || s.id }]);
    }));
    return;
  }
  const m = r.match(/^p\/(.+)$/);
  if (m || r === "piata_istoric.json") {
    const f = m ? decodeURIComponent(m[1]) : r;
    const sec = u.searchParams.get("sec") || "";   // v82.17.0: DOM pe secțiuni (cardul)
    e.respondWith(stare().then(s => s ? date(`${FN}?t=${encodeURIComponent(s.token)}&f=${encodeURIComponent(f)}${sec ? "&sec=" + encodeURIComponent(sec) : ""}${s.adm && s.n < 2 ? "&n=1" : ""}`, s && (s.k || s.m || s.pv) ? Object.assign({}, s, { adm: 0 }) : s, `https://cc.local/d/${s.n < 2 ? 1 : 2}/${f}${sec ? "#" + sec : ""}`) : new Response("cere codul raportului", { status: 401 })));   // cardul: fără copie offline a datelor private
    return;
  }
  e.respondWith(retea(e.request));
});
