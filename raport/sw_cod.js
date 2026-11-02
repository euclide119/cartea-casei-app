/* Raportul public (mod client): datele nu stau pe GitHub. Cu jetonul primit după cod, p/<id>/… și piata_istoric.json vin prin funcția „raport_cod";
   fără jeton, lista de proprietăți e goală și pagina rămâne prezentarea generală. Jetonul stă în Cache, ca să supraviețuiască repornirii service worker-ului. */
const FN = "https://vzrozriarqocscpgfscw.supabase.co/functions/v1/raport_cod";
const stare = async () => { try { const r = await (await caches.open("cc-cod")).match("/__stare"); return r ? await r.json() : null; } catch (e) { return null; } };
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return;
  const baza = new URL("./", self.registration.scope).pathname;
  if (!u.pathname.startsWith(baza)) return;
  const r = u.pathname.slice(baza.length);
  const json = o => new Response(JSON.stringify(o), { headers: { "Content-Type": "application/json; charset=utf-8" } });
  if (r === "proprietati.json") { e.respondWith(stare().then(s => json(s ? [{ id: s.id, eticheta: s.titlu || s.id }] : []))); return; }
  const m = r.match(/^p\/(.+)$/);
  if (m || r === "piata_istoric.json") {
    e.respondWith(stare().then(s => s ? fetch(`${FN}?t=${encodeURIComponent(s.token)}&f=${encodeURIComponent(m ? decodeURIComponent(m[1]) : r)}`) : new Response("cere codul raportului", { status: 401 })));
  }
});
