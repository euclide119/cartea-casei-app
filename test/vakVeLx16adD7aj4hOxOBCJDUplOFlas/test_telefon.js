/* Raportul casei · aplicația de test pe telefon (v82.4.0, 07.11.2026).
   Un singur QR: adresa build-ului de test + #qr=ad_… (jeton Admin, 30 de zile, revocabil pe server). Aici:
   · schimbul QR → jeton de sesiune (funcția raport_cod, actiune admin_qr), fără câmp de cod și fără bifa antibot;
   · sesiunea stă în Cache „cc-cod” (/__stare, citit de service worker și de intrare.js) ȘI în IndexedDB (iOS poate evacua una dintre ele);
   · ecran clar „scanează din nou QR-ul” când lipsește, a expirat sau a fost revocat jetonul;
   · manifest dinamic cu start_url care poartă #qr=… (start_url din manifestul static nu păstrează fragmentul);
   · bară Admin: lista locațiilor (cele 10 din proprietati.json, servite doar prin funcție), „Vezi ca client” (mascarea), versiunea;
   · actualizare automată: version.json (în afara cache-ului) → bandă „versiune nouă vX” și reîncărcare.
   Fără QR și fără sesiune pe build-ul de test: nicio dată privată, doar ecranul de scanare. În alte build-uri (local, /app/, /raport/) modulul nu face nimic. */
(function () {
  "use strict";
  if (window.parent !== window) return;
  const FN = "https://vzrozriarqocscpgfscw.supabase.co/functions/v1/raport_cod";
  const TEST = /\/test\//.test(location.pathname) || /[?&]test=1/.test(location.search);
  const lg = (k, v) => { try { return v === undefined ? localStorage.getItem(k) : (v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v)); } catch (e) { return null; } };
  const hm = (location.hash.match(/qr=(ad_[A-Za-z0-9_-]+)/) || [])[1] || "";
  const hint = lg("cc-adm") === "1";
  /* v82.12.0 (modul opțional bife_export.js): #qr=…&r=<id>&bife=1 deschide direct raportul <id> și reține flagul; #…&sel=<cod> = instantaneu (doar pentru sesiunea curentă). Fără acești parametri, nimic nu se schimbă. */
  const hp = (() => { try { return new URLSearchParams((location.hash || "").replace(/^#/, "")); } catch (e) { return new URLSearchParams(""); } })();
  const R = /^[A-Za-z0-9_]{3,64}$/.test(hp.get("r") || "") ? hp.get("r") : "";
  if (hp.get("bife") === "1") lg("cc-bife", "1"); else if (hp.get("bife") === "0") lg("cc-bife", null);
  if (/^[a-z0-9]{10}$/.test(hp.get("sel") || "")) { try { sessionStorage.setItem("cc-sel", hp.get("sel")); } catch (e) {} }
  if (R) lg("cc-adm-id", R);
  if (R && !hm) lg("cc-adm-g", R);   /* v82.13.0 (perioada de test, gratuit): linkul client #r=<id> fără jeton Admin; după codul de intrare, sesiune de client pentru ACEL raport, 30 de zile */
  const extraHash = () => { const sl = (() => { try { return sessionStorage.getItem("cc-sel") || ""; } catch (e) { return ""; } })(), b = lg("cc-bife") === "1", r = R || lg("cc-adm-id") || "";
    return (b || sl) && r ? "&r=" + r + (b ? "&bife=1" : "") + (sl ? "&sel=" + sl : "") : ""; };
  if (!hm && !hint && !TEST) return;
  window.CC_TESTAPP = true;
  // proprietatea se așază SINCRON, înainte ca generic.js să citească adresa (altfel apare prezentarea generală): ultima aleasă, scrisă la schimbul QR
  if (!hm && hint) { const i0 = R || lg("cc-adm-id"); if (i0 && (R || !/^#[A-Za-z0-9_]/.test(location.hash))) { try { history.replaceState(null, "", location.pathname + location.search + "#" + i0); } catch (e) {} } }
  const F0 = window.fetch.bind(window);   // fetch-ul original: intrare.js îl învelește și îl ține până se termină schimbul QR (altfel blocaj)

  /* ---------- instalare ca aplicație ---------- */
  // manifestul dinamic (start_url cu #qr=…) se pune sincron, ca Chrome să evalueze criteriile PWA la încărcare
  { const q0 = hm || lg("cc-adm-qr"); if (q0) manifest(q0); else { const r0 = R || lg("cc-adm-g"); if (r0) manifestR(r0); } }
  const standalone = () => { if (/[?&]standalone=1/.test(location.search)) return true; try { return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true; } catch (e) { return false; } };
  let dip = window.__bip || null;   // evenimentul beforeinstallprompt, prins cât mai devreme de scriptul inline din <head> (index.html)
  addEventListener("cc-bip", () => { dip = window.__bip || dip; if (dip) instaleaza(); });
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); dip = e; instaleaza(); });
  addEventListener("appinstalled", () => { dip = null; document.getElementById("cc-tt-inst")?.remove(); document.getElementById("cc-tt-ios")?.remove(); if (window.CC_TT_INSTALAT) window.CC_TT_INSTALAT(); });
  function instaleaza() {   // buton vizibil „Instalează aplicația” în bară
    const mk = () => { const b = document.getElementById("cc-tt-bar"); if (!b) return setTimeout(mk, 400); if (standalone() || !dip || document.getElementById("cc-tt-inst")) return;
      const x = document.createElement("button"); x.id = "cc-tt-inst"; x.type = "button"; x.textContent = "Instalează aplicația";
      x.style.cssText = "font:700 12px -apple-system,system-ui,sans-serif;border:0;border-radius:8px;padding:6px 9px;background:#1a1e2a;color:#fffdf8;white-space:nowrap";
      x.onclick = async () => { try { dip.prompt(); await dip.userChoice; } catch (e) {} dip = null; x.remove(); };
      b.insertBefore(x, b.firstChild); };
    mk();
  }
  const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  function paneliOS() {   // iPhone nu poate instala automat: un panou cu pașii, o singură dată, doar în browser (nu în aplicația instalată)
    if ((!iOS && !/[?&]ios=1/.test(location.search)) || standalone() || lg("cc-ios-panou") === "1") return;
    const safari = !/CriOS|FxiOS|EdgiOS|OPiOS/.test(navigator.userAgent);
    const mk = () => { if (document.getElementById("cc-tt-ios")) return; const d = document.createElement("div"); d.id = "cc-tt-ios"; d.setAttribute("role", "dialog");
      d.style.cssText = "position:fixed;left:10px;right:10px;bottom:calc(104px + env(safe-area-inset-bottom));z-index:9500;background:#fffdf8;color:#1a1e2a;border:1.5px solid #1a1e2a;border-radius:16px;padding:14px 16px;font:15px/1.45 -apple-system,system-ui,sans-serif;box-shadow:0 10px 30px -8px rgba(26,30,42,.45);max-width:520px;margin:0 auto";
      d.innerHTML = `<b style="font-size:16px">Instalează aplicația pe iPhone</b><ol style="margin:8px 0 10px 18px;padding:0"><li>${safari ? "" : "Deschide linkul în <b>Safari</b>, apoi "}apasă <b>Partajează</b> <span aria-hidden="true">⎙</span> (bara de jos).</li><li>Alege <b>Adaugă pe ecranul principal</b>.</li><li>Apasă <b>Adaugă</b>. Aplicația se deschide apoi fără bara browserului.</li></ol><button type="button" style="font:700 14px -apple-system,system-ui,sans-serif;border:0;border-radius:10px;padding:9px 14px;background:#1a1e2a;color:#fffdf8">Am înțeles</button>`;
      d.querySelector("button").onclick = () => { lg("cc-ios-panou", "1"); d.remove(); }; document.body.appendChild(d); };
    document.body ? setTimeout(mk, 1500) : document.addEventListener("DOMContentLoaded", () => setTimeout(mk, 1500));
  }

  /* ---------- instalare obligatorie pe telefon (v82.8.0) ----------
     Pe telefon, în afara aplicației instalate, raportul stă sub „poarta de instalare”: imaginea de început, dedesubt „Instalează aplicația ca să deschizi raportul”, o bifă și butonul.
     Android/Chrome/Edge/Samsung: bifa + butonul cheamă beforeinstallprompt.prompt() (dialogul nativ cere o atingere de confirmare); iPhone/Safari: pașii vizuali (Partajează → Adaugă pe ecranul principal);
     browsere din aplicații (Facebook, Instagram, WhatsApp, Gmail…): „Deschide linkul în Chrome / Safari” cu copierea linkului. Desktop și admin local (localhost): fără poartă. Teste: ?gate=1 forțează poarta local, ?ua=ios|android|fb simulează clasa de browser, ?standalone=1 simulează aplicația instalată. */
  const UAs = navigator.userAgent, UAq = (location.search.match(/[?&]ua=(\w+)/) || [])[1] || "";
  const inApp = UAq === "fb" || /FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|TikTok|Snapchat|Messenger|GSA\/|; wv\)/i.test(UAs);
  const iosUA = UAq === "ios" || iOS;
  const mobil = UAq ? true : (/Android|iPhone|iPad|iPod|Mobile/i.test(UAs) || iOS);
  const eLocal = /^(localhost|127\.0\.0\.1|192\.168\.|10\.)/.test(location.hostname);
  const GATE = mobil && !standalone() && !(eLocal && !/[?&]gate=1/.test(location.search));
  window.CC_TT_GATE = GATE;
  function copiaza(m) {
    const ok = () => { m.textContent = "Linkul e copiat"; };
    const fb = () => { try { const t = document.createElement("textarea"); t.value = location.href; t.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); ok(); } catch (e) { m.textContent = "Copiază adresa din bara browserului"; } };
    try { navigator.clipboard.writeText(location.href).then(ok, fb); } catch (e) { fb(); }
  }
  function poarta() {
    const mk = () => {
      if (document.getElementById("cc-tt-poarta")) return;
      document.getElementById("cc-splash")?.remove();
      const d = document.createElement("div"); d.id = "cc-tt-poarta"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "raportul pe telefon");
      d.style.cssText = "position:fixed;inset:0;z-index:99990;background:#f6f1e7;color:#1a1e2a;overflow:auto;font:16px/1.5 -apple-system,system-ui,sans-serif;-webkit-text-size-adjust:100%";
      const AC = "#1d5fb0";   // albastrul din logo: bifa, textul și butonul au același accent și același stil (contrast ≈ 5,6:1 pe papirus, ≈ 6:1 text alb pe buton)
      const F = "font:600 18px/1.3 -apple-system,system-ui,sans-serif";
      const img = `<img src="deschidere.jpg" alt="Raportul casei" style="display:block;width:100%;max-height:46vh;object-fit:cover">`;
      const col = "min-height:54%;display:flex;flex-direction:column;align-items:center;gap:30px;padding:48px 44px calc(44px + env(safe-area-inset-bottom));box-sizing:border-box";
      const btn = `${F};border:0;border-radius:14px;padding:15px 36px;background:${AC};color:#fff;min-width:240px;max-width:100%`;
      const hint = `<div id="cc-tt-pm" role="status" style="font:500 14px/1.4 -apple-system,system-ui,sans-serif;color:#4a5063;text-align:center;min-height:20px"></div>`;
      if (inApp) d.innerHTML = `${img}<div style="${col}"><button id="cc-tt-cp" type="button" style="${btn}">Copiază linkul</button><div id="cc-tt-pm" role="status" style="font:500 14px/1.4 -apple-system,system-ui,sans-serif;color:#4a5063;text-align:center">${iosUA ? "⋯ → Deschide în Safari" : "⋮ → Deschide în Chrome"}</div></div>`;
      else d.innerHTML = `${img}<div style="${col}"><label style="display:flex;gap:14px;align-items:center;${F};color:${AC}"><input id="cc-tt-ck" type="checkbox" checked style="width:24px;height:24px;flex:none;margin:0;accent-color:${AC}"><span>Pe ecranul telefonului</span></label><button id="cc-tt-go" type="button" style="${btn}">Deschide raportul</button>${hint}</div>`;
      const hs = document.createElement("style"); hs.textContent = "#cl-home,#ac-cap,#cc-iesi,#cc-tt-bar,#cc-modv,#cc-tt-nou,.cc-cod{display:none!important}#cc-tt-go:disabled{opacity:.5}"; d.appendChild(hs);   // sub poartă nu se văd comenzile raportului
      document.body.appendChild(d);
      const m = d.querySelector("#cc-tt-pm"), cpb = d.querySelector("#cc-tt-cp");
      if (cpb) cpb.onclick = () => copiaza(m);
      const ck = d.querySelector("#cc-tt-ck"), go = d.querySelector("#cc-tt-go"); if (!ck) return;
      ck.onchange = () => { go.disabled = !ck.checked; };
      const intra = () => { const u = location.origin + location.pathname.replace(/[^/]*$/, "") + (hm ? "#qr=" + hm : (lg("cc-adm-qr") ? "#qr=" + lg("cc-adm-qr") : ((R || lg("cc-adm-g")) ? "#r=" + (R || lg("cc-adm-g")) : ""))); try { window.open(u, "_blank") || (location.href = u); } catch (e) { location.href = u; } };
      const instalat = () => { go.disabled = false; go.textContent = "Deschide aplicația"; ck.closest("label").style.display = "none"; m.textContent = ""; go.onclick = intra; };   // după instalare: același buton intră în aplicație (cod 1357 pentru raport, ca până acum)
      window.CC_TT_INSTALAT = instalat;
      go.onclick = async () => {
        if (!ck.checked) return;
        if (iosUA) {   // iPhone: un singur rând vizual + săgeată spre Partajează
          const ipad = /iPad/.test(UAs) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
          m.textContent = ipad ? "⎙ (sus) → Adaugă pe ecranul principal" : "⎙ → Adaugă pe ecranul principal";
          if (!document.getElementById("cc-tt-sag")) { const s = document.createElement("div"); s.id = "cc-tt-sag"; s.setAttribute("aria-hidden", "true"); s.style.cssText = ipad ? "position:fixed;top:6px;right:18px;z-index:99991;color:#1a1e2a" : "position:fixed;left:0;right:0;bottom:calc(6px + env(safe-area-inset-bottom));z-index:99991;text-align:center;color:#1a1e2a"; s.innerHTML = ipad ? `<svg width="30" height="36" viewBox="0 0 34 40"><path d="M17 38 V8 M6 18 L17 6 L28 18" stroke="#1a1e2a" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>` : `<svg width="30" height="36" viewBox="0 0 34 40" style="animation:cc-ttb 1s ease-in-out infinite alternate"><path d="M17 2 V32 M6 22 L17 34 L28 22" stroke="#1a1e2a" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><style>@keyframes cc-ttb{to{transform:translateY(6px)}}@media (prefers-reduced-motion:reduce){#cc-tt-sag svg{animation:none!important}}</style>`; d.appendChild(s); }
          return;
        }
        if (dip) {   // Android/Chrome/Edge/Samsung: dialogul nativ (cere o atingere de confirmare); refuzul rămâne tăcut
          const p = dip; dip = null; window.__bip = null; go.disabled = true;
          try { p.prompt(); const r = await p.userChoice; if (r && r.outcome === "accepted") setTimeout(instalat, 1200); else go.disabled = false; } catch (e) { go.disabled = false; }
          return;
        }
        m.textContent = "⋮ → Instalează aplicația";   // promptul nu e disponibil: doar indiciul vizual, un singur rând
      };
    };
    document.body ? mk() : document.addEventListener("DOMContentLoaded", mk);
  }
  if (GATE) poarta();
  function butonNou() {   // în aplicația instalată: „Comandă un raport nou”, mereu la vedere
    if (!standalone() || document.getElementById("cc-tt-nou")) return;
    const mk = () => { if (document.getElementById("cc-tt-nou")) return; const b = document.createElement("button"); b.id = "cc-tt-nou"; b.type = "button"; b.textContent = "Comandă un raport nou";
      b.style.cssText = "position:fixed;right:10px;top:calc(8px + env(safe-area-inset-top));z-index:9100;font:700 13px -apple-system,system-ui,sans-serif;border:1.5px solid #1a1e2a;border-radius:999px;padding:8px 13px;background:#fffdf8;color:#1a1e2a;box-shadow:0 2px 8px rgba(26,30,42,.25)";
      b.onclick = () => { document.body.classList.add("ac-cerere"); const t = document.getElementById("cc-sf") || document.getElementById("cl-final") || document.body; t.scrollIntoView({ behavior: "smooth", block: "start" }); }; document.body.appendChild(b); };
    document.body ? mk() : document.addEventListener("DOMContentLoaded", mk);
  }

  /* ---------- stocare dublă: Cache + IndexedDB ---------- */
  const idb = () => new Promise((ok, no) => { try { const r = indexedDB.open("cc-adm", 1); r.onupgradeneeded = () => r.result.createObjectStore("k"); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); } catch (e) { no(e); } });
  const idbGet = async k => { try { const d = await idb(); return await new Promise(ok => { const q = d.transaction("k").objectStore("k").get(k); q.onsuccess = () => ok(q.result || null); q.onerror = () => ok(null); }); } catch (e) { return null; } };
  const idbSet = async (k, v) => { try { const d = await idb(); await new Promise(ok => { const t = d.transaction("k", "readwrite"); v === null ? t.objectStore("k").delete(k) : t.objectStore("k").put(v, k); t.oncomplete = ok; t.onerror = ok; }); } catch (e) {} };
  const cacheGet = async () => { try { const r = await (await caches.open("cc-cod")).match("/__stare"); return r ? await r.json() : null; } catch (e) { return null; } };
  const cachePut = async s => { try { const c = await caches.open("cc-cod"); if (s) await c.put("/__stare", new Response(JSON.stringify(s), { headers: { "Content-Type": "application/json" } })); else await c.delete("/__stare"); } catch (e) {} };
  const salveaza = async s => { await cachePut(s); await idbSet("sesiune", s); lg("cc-adm", "1"); };
  window.CC_ADM_SALVEAZA = s => salveaza(s);   // folosit de mascare.js după ce codul de date fine e primit
  const sterge = async () => { await cachePut(null); await idbSet("sesiune", null); lg("cc-adm", null); lg("cc-adm-qr", null); try { await caches.delete("cc-date"); } catch (e) {} };
  const post = (b, ms) => { const c = new AbortController(), t = setTimeout(() => c.abort(), ms || 8000); return F0(FN, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b), signal: c.signal }).then(async r => ({ ok: r.ok, status: r.status, j: await r.json().catch(() => ({})) })).finally(() => clearTimeout(t)); };

  /* ---------- ecran „scanează din nou” ---------- */
  function ecran(titlu, text) {
    const mk = () => {
      document.getElementById("cc-splash")?.remove(); document.getElementById("cc-tt-scan")?.remove();
      const d = document.createElement("div"); d.id = "cc-tt-scan";
      d.style.cssText = "position:fixed;inset:0;z-index:99999;background:#f6f1e7;color:#1a1e2a;display:flex;align-items:center;justify-content:center;padding:28px;font:16px/1.5 -apple-system,system-ui,sans-serif;text-align:center";
      d.innerHTML = `<div style="max-width:420px"><div style="font-size:44px">📷</div><h1 style="font:700 22px -apple-system,system-ui,sans-serif;margin:10px 0">${titlu}</h1><p style="margin:0 0 14px">${text}</p>
${TEST ? `<div style="margin:0 0 16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><input id="cc-tt-cod" inputmode="numeric" autocomplete="off" maxlength="12" placeholder="cod raport" aria-label="cod raport" style="font:700 18px ui-monospace,Menlo,monospace;letter-spacing:.15em;width:8em;padding:10px 12px;border:1.5px solid #1a1e2a;border-radius:10px;background:#fff;color:#1a1e2a"><button id="cc-tt-cod-go" type="button" style="font:700 15px -apple-system,system-ui,sans-serif;border:0;border-radius:10px;padding:11px 16px;background:#1a1e2a;color:#fffdf8">Intră cu cod</button><div id="cc-tt-cod-m" role="status" style="flex-basis:100%;min-height:18px;font-size:14px;color:#9a2a1f"></div></div>` : ""}<p style="margin:0;font-size:14px;color:#3d4456"><b>Android:</b> scanează cu aparatul foto sau Google Lens, deschide în Chrome.<br><b>iPhone:</b> scanează cu aparatul foto (nu cu altă aplicație) și deschide în Safari.</p></div>`;
      document.body.appendChild(d);
      const go = d.querySelector("#cc-tt-cod-go"); if (go) { const inp = d.querySelector("#cc-tt-cod"), m = d.querySelector("#cc-tt-cod-m");
        const intra = async () => { const cod = inp.value.trim(); if (!cod) { m.textContent = "scrie codul raportului"; return; } go.disabled = true; m.textContent = "se verifică…";
          try { const r = await post({ actiune: "cod_test", cod }); if (!r.ok || !r.j.token) { m.textContent = r.j.error || "codul nu e valid"; go.disabled = false; return; }
            const lista = r.j.lista || [], id0 = lista[0] && lista[0].id; await salveaza({ adm: 1, c: 1, n: 1, ca_client: true, token: r.j.token, e: r.j.e, titlu: "Client", id: id0, lista });
            const alege = (lg("cc-adm-id") && lista.some(p => p.id === lg("cc-adm-id"))) ? lg("cc-adm-id") : id0; if (alege) { lg("cc-adm-id", alege); try { history.replaceState(null, "", location.pathname + location.search + "#" + alege); } catch (e) {} } location.reload();
          } catch (e) { m.textContent = "nu s-a putut verifica; încearcă din nou"; go.disabled = false; } };
        go.onclick = intra; inp.onkeydown = e => { if (e.key === "Enter") intra(); }; }
    };
    document.body ? mk() : document.addEventListener("DOMContentLoaded", mk);
  }

  /* ---------- ecran de intrare: un singur câmp „cod de intrare” (client cu link #r=<id>, perioada de test) ---------- */
  function ecranIntrare(id, msg) {
    const mk = () => {
      document.getElementById("cc-splash")?.remove(); document.getElementById("cc-tt-scan")?.remove();
      const AC = "#1d5fb0", F = "font:600 18px/1.3 -apple-system,system-ui,sans-serif";
      const d = document.createElement("div"); d.id = "cc-tt-scan"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "cod de intrare");
      d.style.cssText = "position:fixed;inset:0;z-index:99999;background:#f6f1e7;color:#1a1e2a;overflow:auto;font:16px/1.5 -apple-system,system-ui,sans-serif;-webkit-text-size-adjust:100%";
      d.innerHTML = `<img src="deschidere.jpg" alt="Raportul casei" style="display:block;width:100%;max-height:40vh;object-fit:cover"><div style="min-height:56%;display:flex;flex-direction:column;align-items:center;gap:30px;padding:44px 44px calc(44px + env(safe-area-inset-bottom));box-sizing:border-box">
<label for="cc-tt-ci" style="${F};color:${AC};text-align:center">Cod de intrare</label>
<input id="cc-tt-ci" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="24" aria-label="cod de intrare" style="font:700 20px ui-monospace,Menlo,monospace;letter-spacing:.08em;width:100%;max-width:320px;box-sizing:border-box;padding:14px 16px;border:2px solid ${AC};border-radius:14px;background:#fff;color:#1a1e2a;text-align:center">
<button id="cc-tt-cig" type="button" style="${F};border:0;border-radius:14px;padding:15px 36px;background:${AC};color:#fff;min-width:240px;max-width:100%">Deschide raportul</button>
<div id="cc-tt-cim" role="status" style="font:500 14px/1.4 -apple-system,system-ui,sans-serif;color:#9a2a1f;text-align:center;min-height:20px">${msg || ""}</div></div>`;
      document.body.appendChild(d);
      const inp = d.querySelector("#cc-tt-ci"), go = d.querySelector("#cc-tt-cig"), m = d.querySelector("#cc-tt-cim");
      const intra = async () => { const cod = inp.value.trim(); if (!cod) { m.textContent = "scrie codul de intrare"; return; } go.disabled = true; m.textContent = "se verifică…";
        try { const r = await post({ actiune: "cod_gratuit", cod, id }); if (!r.ok || !r.j.token) { m.textContent = r.status === 404 ? "raportul nu mai e disponibil" : (r.j.error || "codul nu e valid"); go.disabled = false; return; }
          await salveaza({ adm: 1, c: 1, g: 1, n: 1, ca_client: true, token: r.j.token, e: r.j.e, titlu: "Client", id, lista: r.j.lista || [] });
          lg("cc-adm-g", id); lg("cc-adm-id", id); try { history.replaceState(null, "", location.pathname + location.search + "#" + id); } catch (e) {} location.reload();
        } catch (e) { m.textContent = "nu s-a putut verifica; încearcă din nou"; go.disabled = false; } };
      go.onclick = intra; inp.onkeydown = e => { if (e.key === "Enter") intra(); };
    };
    document.body ? mk() : document.addEventListener("DOMContentLoaded", mk);
  }

  /* ---------- manifest dinamic: start_url cu #qr=… (Admin) sau #r=<id> (client cu cod) ---------- */
  function manifestR(id) { manifest("", id); }
  function manifest(qr, rid) {
    try {
      const base = location.origin + location.pathname.replace(/[^/]*$/, "");
      const sl0 = (() => { try { return sessionStorage.getItem("cc-sel") || ""; } catch (e) { return ""; } })();
      const m = { id: sl0 ? base + "?s=" + sl0 : base, name: "Raportul casei · test", short_name: "raport test", description: "raportul proprietății, test pe telefon", start_url: base + (rid ? "#r=" + rid : "#qr=" + qr + extraHash()), scope: base, display: "standalone", orientation: "portrait", background_color: "#f6f1e7", theme_color: "#f6f1e7", lang: "ro",
        icons: [{ src: base + "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" }, { src: base + "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }, { src: base + "icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" }] };
      const l = document.querySelector('link[rel="manifest"]'); if (l) l.href = URL.createObjectURL(new Blob([JSON.stringify(m)], { type: "application/manifest+json" }));
    } catch (e) {}
  }

  /* ---------- sesiunea ---------- */
  let motiv = "";
  window.CC_ADM_P = (async () => {
    if (window.CC_TT_GATE) { window.CC_ADM = null; return null; }   // sub poarta de instalare nu se schimbă QR-ul și nu se deschide sesiunea; se face în aplicația instalată (start_url poartă #qr=…)
    let s = await cacheGet();
    if (!(s && s.adm)) { const i = await idbGet("sesiune"); if (i && i.adm) { s = i; await cachePut(s); } else s = null; }   // iOS a evacuat Cache-ul: se reface din IndexedDB
    if (hm) {
      try {
        const r = await post({ actiune: "admin_qr", qr: hm });
        if (r.ok && r.j.token) {
          const vc = s && s.ca_client;
          s = { adm: 1, n: vc ? 1 : 2, ca_client: !!vc, token: r.j.token, e: r.j.e, titlu: "Admin", id: (s && s.id) || (r.j.lista && r.j.lista[0] && r.j.lista[0].id) || null, lista: r.j.lista || [] };
          await salveaza(s); lg("cc-adm-qr", hm);
        } else { s = null; await sterge(); motiv = r.j.error || "codul QR nu mai e valabil"; }
      } catch (e) { motiv = "nu s-a putut verifica codul QR (fără internet?)"; if (!s) { /* rămâne ecranul de scanare */ } }
    } else if (s) {
      if (s.e && s.e <= Date.now()) { await sterge(); s = null; motiv = "sesiunea a expirat"; }
      else { try { const r = await post({ actiune: "admin_verifica", token: s.token }, 4000); if (r.status === 401) { await sterge(); s = null; motiv = r.j.error || "sesiunea a fost revocată"; } } catch (e) { /* offline: se folosește ce e în cache */ } }
    } else if (hint) motiv = "sesiunea lipsește de pe acest telefon (iPhone șterge datele unei aplicații nefolosite o săptămână)";
    if (s && s.g && R && s.id !== R) s = null;   // sesiunea de client e doar pentru raportul ei
    window.CC_ADM = s;
    const rg = !hm && !lg("cc-adm-qr") ? (R || lg("cc-adm-g")) : "";
    if (!s && rg) { window.CC_TT_FARA = true; if (!window.CC_TT_GATE) ecranIntrare(rg, motiv ? motiv.charAt(0).toUpperCase() + motiv.slice(1) + "." : ""); }
    else if (!s) { window.CC_TT_FARA = true; if (!window.CC_TT_GATE) ecran("Scanează din nou QR-ul", (motiv ? motiv.charAt(0).toUpperCase() + motiv.slice(1) + ". " : "") + (TEST ? "Raportul de test se deschide doar cu cardul QR primit." : "Scanează cardul QR primit.")); }
    else { const q = lg("cc-adm-qr"); if (q) manifest(q); }
    return s;
  })();

  /* ---------- după încărcare: hash, service worker, bară, versiune ---------- */
  window.CC_ADM_P.then(async s => {
    if (!s) return;
    const lista = s.lista || [], id0 = decodeURIComponent((location.hash || "").replace(/^#/, "")).split(".")[0];
    const bun = x => lista.some(p => p.id === x);
    if (hm || !bun(id0)) {   // curăță #qr=… și așază proprietatea (ultima aleasă sau prima din listă)
      const alege = bun(lg("cc-adm-id")) ? lg("cc-adm-id") : (s.id && bun(s.id) ? s.id : (lista[0] || {}).id);
      if (alege) { lg("cc-adm-id", alege); try { history.replaceState(null, "", location.pathname + location.search + "#" + alege); } catch (e) {} }
      if (hm) {   // după schimbul QR: o singură reîncărcare, cu adresa curată și proprietatea așezată din start
        try { await navigator.serviceWorker.register("sw_cod.js"); await navigator.serviceWorker.ready; } catch (e) {}
        location.reload(); return;
      }
    }
    // primul acces: service worker-ul trebuie să controleze pagina înainte ca p/<id>/… să fie cerut; apoi o singură reîncărcare
    if ("serviceWorker" in navigator && !navigator.serviceWorker.controller) {
      try { const reg = await navigator.serviceWorker.register("sw_cod.js"); await navigator.serviceWorker.ready;
        if (!navigator.serviceWorker.controller) await new Promise(res => { navigator.serviceWorker.addEventListener("controllerchange", res, { once: true }); setTimeout(res, 2500); });
        if (!sessionStorage.getItem("cc-tt-rel")) { sessionStorage.setItem("cc-tt-rel", "1"); location.reload(); return; } } catch (e) {}
    }
    bara(s);
    versiune();
    instaleaza(); paneliOS(); butonNou();
  });

  function bara(s) {
    if (s.g) return;   // clientul cu cod nu vede bara Admin (lista, „vezi ca client”)
    const mk = () => {
      if (document.getElementById("cc-tt-bar")) return;
      const b = document.createElement("div"); b.id = "cc-tt-bar";
      b.style.cssText = "position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:9000;display:flex;gap:6px;align-items:center;background:rgba(255,253,248,.97);color:#1a1e2a;border:1.5px solid #1a1e2a;border-radius:12px;padding:6px 8px;font:600 12px -apple-system,system-ui,sans-serif;box-shadow:0 4px 16px rgba(26,30,42,.3);max-width:560px;margin:0 auto";
      const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
      const cur = decodeURIComponent((location.hash || "").replace(/^#/, "")).split(".")[0];
      b.innerHTML = `<span style="white-space:nowrap">${s.c || s.ca_client ? "👁 client" : "🔓 admin"}</span><select id="cc-tt-sel" aria-label="locația" style="flex:1;min-width:0;font:600 12px -apple-system,system-ui,sans-serif;padding:5px;border-radius:8px;border:0;background:#fff;color:#1a1e2a;border:1px solid #8a90a3">${(s.lista || []).map(p => `<option value="${esc(p.id)}"${p.id === cur ? " selected" : ""}>${esc(p.eticheta || p.id)}</option>`).join("")}</select>
${s.c ? "" : `<button id="cc-tt-cl" style="font:700 12px -apple-system,system-ui,sans-serif;border:0;border-radius:8px;padding:6px 9px;background:${s.ca_client ? "#1f6b3d" : "#f2b04a"};color:${s.ca_client ? "#fff" : "#1a1e2a"}">${s.ca_client ? "Înapoi la Admin" : "Vezi ca client"}</button>`}
<span id="cc-tt-v" style="color:#4a5063;font-weight:600"></span>`;
      document.body.appendChild(b);
      b.querySelector("#cc-tt-sel").onchange = e => { lg("cc-adm-id", e.target.value); location.hash = "#" + e.target.value; location.reload(); };
      const cl = b.querySelector("#cc-tt-cl"); if (cl) cl.onclick = async () => { s.ca_client = !s.ca_client; s.n = s.ca_client ? 1 : 2; await salveaza(s); location.reload(); };   // „Vezi ca client” pornește fără cod de date fine; codul (1357, verificat pe server) deblochează datele complete în această vedere
    };
    document.body ? mk() : document.addEventListener("DOMContentLoaded", mk);
    addEventListener("hashchange", () => { const h = decodeURIComponent(location.hash.replace(/^#/, "")).split(".")[0]; if (h) lg("cc-adm-id", h); });
  }

  /* ---------- versiune: version.json în afara cache-ului ---------- */
  let v0 = null;
  const vcmp = (x, y) => { const p = String(x).split(".").map(Number), q = String(y).split(".").map(Number); for (let i = 0; i < 3; i++) { const d = (p[i] || 0) - (q[i] || 0); if (d) return d; } return 0; };
  const citVer = async () => { try { const r = await F0("version.json?t=" + Date.now(), { cache: "no-store" }); return r.ok ? await r.json() : null; } catch (e) { return null; } };
  async function versiune() {
    const j = await citVer(); if (j) { v0 = j.versiune; const e = document.getElementById("cc-tt-v"); if (e) e.textContent = "v" + v0; }
    /* „există versiune nouă” se citește din funcție (Supabase, fără cache), nu de pe GitHub Pages: CDN-ul Pages ține fișierele până la 10 minute pe cale, cu sau fără ?t= */
    const ultima = async () => { const s = window.CC_ADM; if (!s || !s.token) return null; try { const r = await F0(`${FN}?t=${encodeURIComponent(s.token)}&f=__versiune`, { cache: "no-store" }); return r.ok ? (await r.json()).versiune || null : null; } catch (e) { return null; } };
    const verifica = async () => {
      const n = await ultima(); if (!n || !v0 || !(vcmp(n, v0) > 0)) return;   // doar o versiune mai nouă decât codul încărcat
      let ult = null; try { ult = JSON.parse(sessionStorage.getItem("cc-tt-ult") || "null"); } catch (e) {}
      if (ult && ult.v === n && Date.now() - ult.t < 150000) return;   // dacă CDN-ul servește încă codul vechi, se reîncearcă la următoarea verificare, nu într-o buclă
      try { sessionStorage.setItem("cc-tt-ult", JSON.stringify({ v: n, t: Date.now() })); } catch (e) {}
      const d = document.createElement("div"); d.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:99998;background:#1f6b3d;color:#fff;text-align:center;padding:calc(10px + env(safe-area-inset-top)) 12px 10px;font:700 14px -apple-system,system-ui,sans-serif";
      d.textContent = "versiune nouă v" + n + " · se actualizează…"; document.body.appendChild(d);
      try { const reg = await navigator.serviceWorker.getRegistration(); if (reg) await reg.update(); } catch (e) {}
      setTimeout(() => location.reload(), 1200);
    };
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { verifica(); sesiune(); } });
    setInterval(verifica, 60000); setInterval(sesiune, 300000); setTimeout(verifica, 4000);
  }
  async function sesiune() {   // jeton revocat sau expirat cât timp aplicația stă deschisă
    const s = window.CC_ADM; if (!s) return;
    if (s.e && s.e <= Date.now()) { const g = s.g ? s.id : null; await sterge(); window.CC_ADM = null; g ? ecranIntrare(g, "Sesiunea a expirat.") : ecran("Scanează din nou QR-ul", "Sesiunea a expirat."); return; }
    try { const r = await post({ actiune: "admin_verifica", token: s.token }, 5000); if (r.status === 401) { const g = s.g ? s.id : null; await sterge(); window.CC_ADM = null; g ? ecranIntrare(g, (r.j.error || "Sesiunea a fost revocată") + ".") : ecran("Scanează din nou QR-ul", (r.j.error || "Sesiunea a fost revocată") + "."); } } catch (e) { /* offline */ }
  }

  /* service worker-ul nou preia pagina deschisă: o singură reîncărcare coordonată */
  if ("serviceWorker" in navigator) { const avea = !!navigator.serviceWorker.controller; let rel = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (avea && !rel) { rel = true; location.reload(); } }); }
})();
