/* Raport _ Cartea Casei - intrarea (Manu, 02.11.2026): ecranul de deschidere cu panoul, modul admin și modul client.
   Admin (local, prin Cockpit): sus, selectorul cu toate adresele (localitate, stradă, număr, CF, luna_zi). ?client=1 arată pagina ca un client.
   Client (linkul public): prezentarea generală + câmpul „introdu codul raportului”; cu codul se deschide raportul oficial; datele private cer al doilea cod, verificat pe server. */
(function () {
  "use strict";
  const FN = "https://vzrozriarqocscpgfscw.supabase.co/functions/v1/raport_cod";
  const q = new URLSearchParams(location.search);
  const local = /^(localhost|127\.0\.0\.1|192\.168\.|10\.)/.test(location.hostname);
  if (window.parent !== window) { document.getElementById("cc-splash")?.remove(); return; }   // în aplicație, intrarea o face aplicația
  const CLIENT = !local || q.get("client") === "1";
  const REMOTE = !local || q.get("remote") === "1";   // datele vin prin funcție doar pe linkul public; local, ?client=1 doar arată interfața
  window.CC_CLIENT = CLIENT; window.CC_REMOTE = REMOTE;
  if (CLIENT) document.documentElement.classList.add("cc-client");

  const st = document.createElement("style"); st.id = "cc-intrare-css";
  st.textContent = `
html.cc-client #ac-bar,html.cc-client #pick,html.cc-client #gn-sel,html.cc-client #gn-open,html.cc-client #mn-rev,html.cc-client #mn-asp,html.cc-client #mn-poz,html.cc-client #mn-gen,html.cc-client #mn-cli,html.cc-client #mbar{display:none!important}
#pick{max-width:min(720px,70vw);font:600 13px var(--font);padding:6px 8px;border:1px solid #c9ced8;border-radius:8px;background:#fff}
.cc-cod{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.cc-cod input{font:700 18px var(--mono,monospace);letter-spacing:.14em;padding:10px 14px;border-radius:10px;border:1px solid #c9ced8;width:190px;text-transform:uppercase;background:#fff;color:#1a1e2a}
.cc-cod button{font:700 14px var(--font);padding:12px 18px;border-radius:10px;border:0;background:#f2b04a;color:#1a1e2a;cursor:pointer}
.cc-cod small{flex-basis:100%;font:13px var(--font);color:#fff;min-height:16px}
#cc-iesi{position:fixed;right:14px;bottom:14px;z-index:60;font:600 12.5px var(--font);border:1px solid #c9ced8;background:#fff;border-radius:999px;padding:7px 12px;cursor:pointer}`;
  document.head.appendChild(st);

  /* ---------- ecranul de deschidere ---------- */
  const inchide = () => { const s = document.getElementById("cc-splash"); if (!s || s.dataset.g) return; s.dataset.g = "1"; s.style.opacity = "0"; setTimeout(() => s.remove(), 450); };
  const t0 = Date.now();
  const gata = setInterval(() => {
    const ok = document.body.classList.contains("generic") || (typeof D !== "undefined" && D && D.id && document.querySelector("#rezumat .card, #rezumat .p2-cov"));
    if ((ok && Date.now() - t0 > 900) || Date.now() - t0 > 4500) { clearInterval(gata); inchide(); }
  }, 120);

  /* ---------- denumirea după tip ---------- */
  const NUME = { teren: "Cartea Terenului", apartament: "Cartea Apartamentului", casa: "Cartea Casei" };
  setInterval(() => { try { const d = typeof D !== "undefined" ? D : null; if (!d || !d.id || document.body.classList.contains("generic")) return; const n = NUME[d.tip] || "Cartea Casei", b = document.querySelector(".brand>span"); if (b && b.textContent !== n) b.textContent = n; if (document.title !== n + " · " + (d.eticheta || "")) document.title = n + " · " + (d.eticheta || ""); } catch (e) {} }, 1500);

  if (!CLIENT) return;

  /* ---------- mod client: codul raportului ---------- */
  const stare = async o => { const c = await caches.open("cc-cod"); if (o) await c.put("/__stare", new Response(JSON.stringify(o), { headers: { "Content-Type": "application/json" } })); else await c.delete("/__stare"); };
  const citeste = async () => { try { const r = await (await caches.open("cc-cod")).match("/__stare"); return r ? await r.json() : null; } catch (e) { return null; } };
  window.CC_STARE = { citeste, scrie: stare, FN };
  async function intra(cod, msg) {
    if (!REMOTE) { msg.textContent = "local nu se verifică codul: folosește linkul public"; return; }
    msg.textContent = "se verifică…";
    try {
      const r = await fetch(FN, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "cod", cod }) }), j = await r.json();
      if (!r.ok) { msg.textContent = j.error || "codul nu e valid"; return; }
      await stare({ id: j.id, titlu: j.titlu, tip: j.tip, token: j.token, n: 1 });
      const reg = await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller && reg.active) await new Promise(res => { navigator.serviceWorker.addEventListener("controllerchange", res, { once: true }); setTimeout(res, 1500); });
      location.hash = j.id; location.reload();
    } catch (e) { msg.textContent = "nu s-a putut verifica; încearcă din nou"; }
  }
  function camp() {
    const go = document.querySelector("#generic .gn-go"); if (!go || go.querySelector(".cc-cod")) return;
    const w = document.createElement("div"); w.className = "cc-cod";
    w.innerHTML = `<input id="cc-in" placeholder="CC-XXXXXX" maxlength="9" autocomplete="off" aria-label="codul raportului"><button type="button" id="cc-go">Deschide raportul</button><small id="cc-m">Introdu codul raportului primit.</small>`;
    go.appendChild(w);
    const go2 = () => intra(w.querySelector("#cc-in").value, w.querySelector("#cc-m"));
    w.querySelector("#cc-go").onclick = go2; w.querySelector("#cc-in").onkeydown = e => { if (e.key === "Enter") go2(); };
    const m = location.hash.match(/cod=([A-Za-z0-9-]+)/); if (m) { w.querySelector("#cc-in").value = m[1]; go2(); }
  }
  setInterval(camp, 400);
  if (REMOTE && "serviceWorker" in navigator) navigator.serviceWorker.register("sw_cod.js").catch(e => console.warn("sw", e));
  citeste().then(s => {
    if (!s) return;
    const b = document.createElement("button"); b.id = "cc-iesi"; b.textContent = "închide raportul";
    b.onclick = async () => { await stare(null); location.hash = ""; location.reload(); };
    const pune = () => document.body ? document.body.appendChild(b) : setTimeout(pune, 200); pune();
  });
})();
