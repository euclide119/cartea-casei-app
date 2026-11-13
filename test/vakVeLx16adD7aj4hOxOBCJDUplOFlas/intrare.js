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
  if (CLIENT) { try { localStorage.setItem("ric-surse", "0"); } catch (e) {} }
  /* la fiecare deschidere se cere din nou codul (sau QR-ul) și bifa: sesiunea rămâne doar cât e deschisă fila (Manu, 03.11.2026) */
  /* jetonul din QR se citește aici, la pornire: pagina de prezentare curăță adresa imediat după încărcare */
  const QR0 = (location.hash.match(/qr=((?!ad_)[A-Za-z0-9_-]+)/) || [])[1]; if (QR0) {   /* v82.4.0: valorile ad_… sunt ale Adminului (test_telefon.js) */ try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} }
  const K_INTRAT = "cc-intrat"; let intrat = false; try { intrat = sessionStorage.getItem(K_INTRAT) === "1"; } catch (e) {}
  const ADM_HINT = (() => { try { return localStorage.getItem("cc-adm") === "1" || /qr=ad_/.test(location.hash); } catch (e) { return /qr=ad_/.test(location.hash); } })();   // v82.4.0: sesiune Admin (aplicația de test)
  if (ADM_HINT) intrat = true;
  window.CC_CURAT = Promise.resolve(window.CC_ADM_P).then(a => CLIENT && REMOTE && !intrat && !(a && a.adm) ? caches.open("cc-cod").then(c => c.delete("/__stare")).catch(() => {}) : null);   // v82.4.0: sesiunea Admin nu se șterge la deschidere
  if (CLIENT && REMOTE) { const f0 = window.fetch; window.fetch = (...a) => window.CC_CURAT.then(() => f0.apply(window, a)); }
  window.CC_NIVEL_P = !CLIENT ? Promise.resolve(2) : REMOTE ? (async () => { try { await window.CC_CURAT; const r = await (await caches.open("cc-cod")).match("/__stare"); return r ? ((await r.json()).n || 1) : 1; } catch (e) { return 1; } })() : Promise.resolve(sessionStorage.getItem("g7priv:g7_parcela") === "1" ? 2 : 1);

  const st = document.createElement("style"); st.id = "cc-intrare-css";
  st.textContent = `
html.cc-client #ac-bar [data-a="adr"],html.cc-client #ac-bar [data-a="nou"],html.cc-client #pick,html.cc-client #gn-sel,html.cc-client #gn-open,html.cc-client #mn-rev,html.cc-client #mn-asp,html.cc-client #mn-poz,html.cc-client #mn-gen,html.cc-client #mn-cli,html.cc-client #mbar,html.cc-client nav [data-t="surse"],html.cc-client nav [data-t="stare"],html.cc-client #surse,html.cc-client #stare,html.cc-client #mn-jur,html.cc-client .hx-reg{display:none!important}
html.cc-client:not(.cc-priv) nav#tabs button[data-t="evaluare"],html.cc-client:not(.cc-priv) nav#tabs button[data-t="proiecte"],html.cc-client:not(.cc-priv) nav [data-t="evaluare"],html.cc-client:not(.cc-priv) #evaluare,html.cc-client:not(.cc-priv) nav [data-t="proiecte"],html.cc-client:not(.cc-priv) #proiecte{display:none!important}
html.cc-client:not(.cc-priv) nav [data-t="evaluare"],html.cc-client:not(.cc-priv) nav [data-t="proiecte"],html.cc-client:not(.cc-priv) #evaluare,html.cc-client:not(.cc-priv) #proiecte{display:none!important}
body.generic #cl-home,body.generic #cc-iesi{display:none!important}
#pick{max-width:min(720px,70vw);font:600 13px var(--font);padding:6px 8px;border:1px solid #c9ced8;border-radius:8px;background:#fff}
.cc-cod{position:fixed;left:0;right:0;bottom:0;z-index:55;display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:#1a1e2a;box-shadow:0 -6px 24px rgba(0,0,0,.35)}body.generic{padding-bottom:170px}
.cc-cod input{font:700 16px var(--mono,monospace);letter-spacing:.1em;padding:10px 12px;border-radius:10px;border:1px solid #c9ced8;flex:1 1 120px;max-width:220px;min-width:0;text-transform:uppercase;background:#fff;color:#1a1e2a}
.cc-cod button{flex:0 0 auto;font:700 14px var(--font);padding:11px 14px;border-radius:10px;border:0;background:#f2b04a;color:#1a1e2a;cursor:pointer}
.cc-cod small{flex-basis:100%;text-align:center;font:13px var(--font);color:#fff;min-height:16px}
body.generic .cc-cod{position:static!important;left:auto!important;right:auto!important;bottom:auto!important;margin:50px 0 48px!important;border-radius:14px;z-index:auto}   /* 50 px + row-gap 22 px din #generic = 3 rânduri libere (72 px) sub poză */
body.generic #generic .gn-cov{margin-top:48px}
#cc-iesi{position:fixed;right:14px;bottom:14px;z-index:60;font:600 12.5px var(--font);border:1px solid #c9ced8;background:#fff;border-radius:999px;padding:7px 12px;cursor:pointer}`;
  document.head.appendChild(st);

  /* ---------- ecranul de deschidere ---------- */
  const inchide = () => { const s = document.getElementById("cc-splash"); if (!s || s.dataset.g) return; s.dataset.g = "1"; s.style.opacity = "0"; s.style.pointerEvents = "none"; setTimeout(() => s.remove(), 450); };
  /* imaginea de deschidere după tipul proprietății (Manu, 02.11.2026): casa acum pentru Giarmata Vii, apartament și parcelă pentru rapoartele viitoare */
  (function () { const IMG = { casa: "deschidere.jpg", apartament: "deschidere_apartament.jpg", teren: "deschidere_parcela.jpg" }, PE_ID = { g7_parcela: "casa" };
    const id = (location.hash.replace("#", "").split(".")[0] || ""), tip = PE_ID[id] || (/^ap_|apartament/i.test(id) ? "apartament" : /parcela|teren/i.test(id) ? "teren" : "casa");
    const im = document.querySelector("#cc-splash img"); if (im && IMG[tip]) im.src = IMG[tip]; })();
  const t0 = Date.now();
  const gata = setInterval(() => {
    const ok = (document.body.classList.contains("generic") && !(CLIENT && REMOTE && intrat)) || (typeof D !== "undefined" && D && D.id && document.querySelector("#rezumat .card, #rezumat .p2-cov"));
    if ((ok && Date.now() - t0 > 1500) || Date.now() - t0 > (CLIENT && REMOTE && intrat ? 15000 : 6000)) { clearInterval(gata); inchide(); }
  }, 120);
  /* coperta stă cel mult 1,5 s și dispare la prima mișcare: mouse, derulare, zoom, atingere, tastă (Manu, 06.11.2026) */
  ["wheel", "mousemove", "touchstart", "pointerdown", "keydown", "scroll", "gesturestart"].forEach(ev => window.addEventListener(ev, () => { if (Date.now() - t0 > 250) inchide(); }, { passive: true, capture: true }));

  /* ---------- denumirea după tip ---------- */
  const NUME = { teren: "Cartea Terenului", apartament: "Cartea Apartamentului", casa: "Cartea Casei" };
  setInterval(() => { try { const d = typeof D !== "undefined" ? D : null; if (!d || !d.id || document.body.classList.contains("generic")) return; const n = NUME[d.tip] || "Cartea Casei", b = document.querySelector(".brand>span"); if (b && b.textContent !== n) b.textContent = n; if (document.title !== n + " · " + (d.eticheta || "")) document.title = n + " · " + (d.eticheta || ""); } catch (e) {} }, 1500);

  /* modul se vede mereu, ca să știi ce primește clientul (Manu, 06.11.2026): local = admin, cu unelte de lucru; „vezi ca clientul” = exact pagina publică, fără unelte */
  if (local) { const mb = document.createElement("a"); mb.id = "cc-modv"; mb.href = location.pathname + (CLIENT ? "" : "?client=1") + location.hash; mb.textContent = CLIENT ? "vedere client · înapoi la admin" : "admin · vezi ca clientul";
    mb.style.cssText = `position:fixed;right:12px;top:10px;z-index:70;font:700 12px var(--font,sans-serif);padding:6px 11px;border-radius:999px;text-decoration:none;box-shadow:0 2px 8px rgba(0,0,0,.25);background:${CLIENT ? "#1f6b3d" : "#9a2a1f"};color:#fff`;
    const pm = () => document.body ? document.body.appendChild(mb) : setTimeout(pm, 200); pm(); }
  if (CLIENT) { const sc = document.createElement("style"); sc.textContent = "html.cc-client .hg-th,html.cc-client .ax,html.cc-client #ax-bar{display:none!important}"; document.head.appendChild(sc); }
  if (!CLIENT) return;

  /* ---------- mod client: codul raportului ---------- */
  const stare = async o => { const c = await caches.open("cc-cod"); if (o) await c.put("/__stare", new Response(JSON.stringify(o), { headers: { "Content-Type": "application/json" } })); else await c.delete("/__stare"); };
  const citeste = async () => { try { const r = await (await caches.open("cc-cod")).match("/__stare"); return r ? await r.json() : null; } catch (e) { return null; } };
  window.CC_STARE = { citeste, scrie: stare, FN };
  /* bifa antibot (Manu, 02.11.2026), la intrarea cu QR și la PIN: bifă făcută de om (atingere reală, nu prea repede), provocare semnată de server, dovadă de calcul și câmp-capcană.
     E o protecție proprie, mai slabă decât un serviciu specializat (Turnstile, reCAPTCHA); oprește scripturile simple, nu un atacator hotărât. */
  /* sha-256 sincron: crypto.subtle e prea lent pe telefon pentru mii de încercări */
  const K256 = (() => { const k = [], pr = []; for (let n = 2; pr.length < 64; n++) { if (pr.every(p => n % p)) { pr.push(n); k.push((Math.cbrt(n) % 1) * 4294967296 >>> 0); } } return k; })();
  const sha = t => { const m = new TextEncoder().encode(t), l = m.length, n = ((l + 9 + 63) >> 6) << 6, b = new Uint8Array(n); b.set(m); b[l] = 128; const dv = new DataView(b.buffer); dv.setUint32(n - 4, l * 8); dv.setUint32(n - 8, Math.floor(l / 536870912));
    const H = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225], w = new Int32Array(64), r = (x, c) => (x >>> c) | (x << (32 - c));
    for (let o = 0; o < n; o += 64) { for (let i = 0; i < 16; i++) w[i] = dv.getInt32(o + i * 4); for (let i = 16; i < 64; i++) { const a = w[i - 15], c = w[i - 2]; w[i] = w[i - 16] + (r(a, 7) ^ r(a, 18) ^ (a >>> 3)) + w[i - 7] + (r(c, 17) ^ r(c, 19) ^ (c >>> 10)) | 0; }
      let [A, B, C, D0, E, F, G, HH] = H; for (let i = 0; i < 64; i++) { const t1 = HH + (r(E, 6) ^ r(E, 11) ^ r(E, 25)) + ((E & F) ^ (~E & G)) + K256[i] + w[i] | 0, t2 = (r(A, 2) ^ r(A, 13) ^ r(A, 22)) + ((A & B) ^ (A & C) ^ (B & C)) | 0; HH = G; G = F; F = E; E = D0 + t1 | 0; D0 = C; C = B; B = A; A = t1 + t2 | 0; }
      [A, B, C, D0, E, F, G, HH].forEach((v, i) => { H[i] = H[i] + v | 0; }); }
    const o = new Uint8Array(32), d2 = new DataView(o.buffer); H.forEach((v, i) => d2.setInt32(i * 4, v)); return o; };
  const zero = (h, n) => { for (let i = 0; i < n; i++) if (h[i >> 3] & (0x80 >> (i & 7))) return false; return true; };
  async function dovada() {
    const j = await (await fetch(FN, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "provocare" }) })).json();
    if (!j.c) throw new Error("verificarea nu pornește");
    const t0 = Date.now(); let x = 0; while (!zero(sha(j.c + ":" + x), j.biti || 14)) x++;
    const rest = 1700 - (Date.now() - t0); if (rest > 0) await new Promise(r => setTimeout(r, rest));
    return { c: j.c, x: String(x), h: "" };
  }
  window.CC_ANTIBOT = {
    /* pune bifa în `loc`; întoarce { ok(): Promise<dovada|null> } — null dacă nu e bifată */
    monteaza(loc) {
      const w = document.createElement("label"); w.className = "cc-ab";
      w.innerHTML = `<input type="checkbox" aria-label="nu sunt robot"><span>nu sunt robot</span><i class="cc-ab-s"></i><input type="text" name="site" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">`;
      loc.appendChild(w); const c = w.querySelector("input[type=checkbox]"), h = w.querySelector("input[name=site]"), s = w.querySelector(".cc-ab-s"), t0 = Date.now(); let p = null, om = false;
      c.addEventListener("click", e => { om = e.isTrusted; if (!c.checked) { p = null; s.textContent = ""; return; }
        if (!om) { c.checked = false; return; }
        s.textContent = "se verifică…"; p = dovada().then(d => { s.textContent = "verificat ✓"; return d; }, () => { s.textContent = "verificare eșuată; bifează din nou"; c.checked = false; return null; }); });
      return { ok: async () => { if (!c.checked || !p || Date.now() - t0 < 1200) return null; const d = await p; return d ? { ...d, h: h.value } : null; } };
    }
  };
  const stab = document.createElement("style"); stab.textContent = `.cc-ab span{white-space:nowrap}#cc-ab,#cc-acw{flex-basis:100%;display:flex;justify-content:center}.cc-acc a{color:#1f4fb0;text-decoration:underline}.cc-ab{position:relative;display:inline-flex;align-items:center;gap:8px;font:600 14px var(--font);padding:7px 11px;border:1px solid #c9ced8;border-radius:10px;background:#fff;color:#1a1e2a;cursor:pointer}.cc-ab input[type=checkbox]{width:24px;height:24px;margin:0}.cc-ab-s{font:600 13px var(--font);font-style:normal;color:#4a5063}`; document.head.appendChild(stab);
  async function intra(corp, msg, ab) {
    const dv = await ab.ok(); if (!dv) { msg.textContent = "bifează „nu sunt robot”"; return false; }
    msg.textContent = "se deschide raportul…";
    try {
      const r = await fetch(FN, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...corp, antibot: dv }) }), j = await r.json();
      if (!r.ok) { msg.textContent = j.error || "codul nu mai e valabil"; return false; }
      await stare({ id: j.id, titlu: j.titlu, tip: j.tip, token: j.token, n: 1, cod: corp.cod ? String(corp.cod).toUpperCase() : "" });
      try { sessionStorage.setItem(K_INTRAT, "1"); } catch (e) {}
      const reg = await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller && reg.active) await new Promise(res => { navigator.serviceWorker.addEventListener("controllerchange", res, { once: true }); setTimeout(res, 1500); });
      history.replaceState(null, "", location.pathname + "#" + j.id); location.reload(); return true;
    } catch (e) { msg.textContent = "nu s-a putut deschide; încearcă din nou"; return false; }
  }
  /* căsuța de cod stă mereu jos, la orice derulare a prezentării; cu QR, codul nu se mai scrie, rămâne doar bifa */
  function camp() {
    if (!document.body.classList.contains("generic") || document.querySelector(".cc-cod")) return;
    const cov = document.querySelector("#generic .gn-cov"); if (!cov) return;   // v82.24.1: coperta (poza de la început) se așază întâi; linia „Deschide raportul” vine după ea
    const jt = QR0;
    const w = document.createElement("div"); w.className = "cc-cod";
    w.innerHTML = `${jt ? "" : `<input id="cc-in" placeholder="CC-XXXXXX" maxlength="9" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="codul raportului">`}<button type="button" id="cc-go">Deschide raportul</button><div id="cc-ab"></div><div id="cc-acw"><label class="cc-ab cc-acc"><input type="checkbox" id="cc-acc" aria-label="accept condițiile de utilizare"><span>accept <a href="conditii.html" target="_blank" rel="noopener">condițiile de utilizare</a> și GDPR</span></label></div><small id="cc-m">${jt ? "Bifează și deschide raportul." : "Scrie codul raportului sau scanează codul QR."}</small>`;
    cov.after(w);   // v82.24.1 (cerere Manu 13.11.2026): coperta de sus în jos = 2 rânduri libere, poza, 3 rânduri libere, linia „Deschide raportul” cu câmpul de cod; nu mai e lipită jos/sub poză
    const m = w.querySelector("#cc-m"), go = w.querySelector("#cc-go"), inp = w.querySelector("#cc-in"), ab = window.CC_ANTIBOT.monteaza(w.querySelector("#cc-ab"));
    const merge = () => { if (!REMOTE) { m.textContent = "local nu se verifică codul: folosește adresa publică"; return; }
      if (inp && inp.value.replace(/[^A-Za-z0-9]/g, "").length < 6) { m.textContent = "scrie codul raportului"; return; }
      if (!w.querySelector("#cc-acc").checked) { m.textContent = "bifează „accept condițiile de utilizare”"; return; }
      go.disabled = true; intra(jt ? { actiune: "qr", qr: jt } : { actiune: "cod", cod: inp.value.trim() }, m, ab).then(ok => { if (!ok) go.disabled = false; }); };
    go.onclick = merge; if (inp) inp.onkeydown = e => { if (e.key === "Enter") merge(); };
  }
  setInterval(camp, 400);
  /* la client, sursele nu rămân nici în DOM: ce e marcat „sursă” se scoate, nu se ascunde; numele furnizorilor dispar din text */
  const NUME_S = /\s*[(\[]?\b(OpenStreetMap|OSM|Nominatim|Overpass|OSRM|Valhalla|Esri|Maxar|Vantor|Wayback|Sentinel-2|Copernicus|Open-Meteo|ANAR|Apele Române|Eurostat|INSSE|Solargis|Global Solar Atlas|cimec|data\.gov\.ro|Storia|OLX|Publi24|Imobiliare\.ro|Mapzen|SRTM|GeoNames|EFEHR|ROMPLUS|IGR)\b[)\]]?/g;
  function spala() {
    document.querySelectorAll(".x-src,.x-qr,.hm-src,.attr,.hg-cr,.hero-c,section#surse,section#stare").forEach(e => { if (e.id === "attr" || e.closest("#ex-fin") || !e.textContent) { if (e.id === "attr") e.textContent = ""; return; } e.textContent = ""; e.style.display = "none"; });
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { if (n.parentElement && n.parentElement.closest("script,style,textarea,input")) continue; NUME_S.lastIndex = 0; if (NUME_S.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(NUME_S, ""); }
    document.querySelectorAll("svg title").forEach(t => { if (NUME_S.test(t.textContent)) t.textContent = t.textContent.replace(NUME_S, ""); });
  }
  setInterval(spala, 1500);
  setInterval(() => { if (!document.documentElement.classList.contains("cc-priv")) document.querySelectorAll('nav#tabs [data-t="evaluare"],nav#tabs [data-t="proiecte"]').forEach(b => b.remove()); }, 700);
  if (REMOTE && "serviceWorker" in navigator) navigator.serviceWorker.register("sw_cod.js").catch(e => console.warn("sw", e));
  window.CC_CURAT.then(citeste).then(s => {
    if (!s || s.adm) return;   // v82.4.0: sesiunea Admin se închide doar prin revocare/expirare
    // sesiune expirată: se revine la câmpul de cod, nu rămâne o pagină goală
    setTimeout(() => { if (typeof D === "undefined" || !D || !D.id) { try { sessionStorage.removeItem(K_INTRAT); } catch (e) {} stare(null).then(() => { location.hash = ""; location.reload(); }); } }, 60000);
    const b = document.createElement("button"); b.id = "cc-iesi"; b.textContent = "închide raportul";
    b.onclick = async () => { try { sessionStorage.removeItem(K_INTRAT); } catch (e) {} await stare(null); location.hash = ""; location.reload(); };
    const pune = () => document.body ? document.body.appendChild(b) : setTimeout(pune, 200); pune();
  });
})();
