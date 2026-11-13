/* Raport · Cartea Casei — urmărirea folosirii pentru Evidența QR (v82.19.0, 13.11.2026, cerut de Manu: sesiuni (minute, instalat sau nu), capitole și subcapitole
   deschise și timpul pe fiecare; fără permisiuni pe telefon).
   Ce face: la deschidere pornește o sesiune (raport_sesiuni) pentru cardul, codul master, previzualizarea sau Adminul curent; cât aplicația e VIZIBILĂ (Page Visibility)
   trimite o bătaie la ~30 s; urmărește ce capitole (ac-h), subcapitole (ac-sub-on) și secțiuni DOM (details.dfa-sec) sunt deschise și, la închidere, trimite tipul,
   numele și secundele. „Instalat” = display-mode: standalone. NU cere locație, cameră, microfon, notificări sau alte permisiuni; nu citește nimic din dispozitiv.
   Fără localStorage / IndexedDB: starea e doar în memorie. Clienții simpli (cod de intrare gratuit, cod de test) nu sunt urmăriți. */
(function () {
  "use strict";
  if (window.parent !== window || !window.CC_ADM_P) return;
  const FN = "https://vzrozriarqocscpgfscw.supabase.co/functions/v1/raport_cod";
  const inst = () => { try { return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true; } catch (e) { return false; } };
  const rid = () => (typeof D !== "undefined" && D && D.id) ? D.id : "";
  let sid = null, S = null, deschise = new Map(), coada = [], ultimRaport = "";
  const post = (b, keep) => fetch(FN, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...b, token: window.CC_ADM && window.CC_ADM.token }), keepalive: !!keep }).then(r => r.json().catch(() => ({}))).catch(() => ({}));
  const txt = e => (e ? (e.innerText || e.textContent || "") : "").replace(/\s+/g, " ").trim().slice(0, 120);

  function citeste() {   // ce e deschis acum: cheie -> {tip, capitol, subcapitol}
    const m = new Map(); let cap = "";
    document.querySelectorAll("button.ac-h[aria-expanded=true]").forEach(h => { const c = txt(h.querySelector("h2")) || txt(h); m.set("c|" + c, { tip: "capitol", capitol: c }); cap = c; });
    document.querySelectorAll("section.ac-sub.ac-sub-on").forEach(sc => { const n = txt(sc._acR) || sc.id || ""; if (n) m.set("s|" + n, { tip: "subcapitol", capitol: cap, subcapitol: n }); });
    document.querySelectorAll("details.dfa-sec[open]").forEach(d => { const n = "DOM · " + txt(d.querySelector("summary")); m.set("d|" + n, { tip: "dom_sectiune", capitol: "Depth of Market – Level 2", subcapitol: n }); });
    return m;
  }
  function inchide(k, v) { const secunde = Math.round((Date.now() - v.t0) / 1000); if (secunde >= 1) coada.push({ tip: v.tip, capitol: v.capitol || null, subcapitol: v.subcapitol || null, secunde, raport: v.raport }); deschise.delete(k); }
  async function trimite(keep) { if (!sid || !coada.length) return; const ev = coada.splice(0, 30); await post({ actiune: "eveniment", sid, ev }, keep); }
  function scan() {
    if (document.visibilityState !== "visible") return;
    const acum = citeste(), r = rid();
    for (const [k, v] of [...deschise]) if (!acum.has(k) || v.raport !== r) inchide(k, v);
    for (const [k, v] of acum) if (!deschise.has(k)) deschise.set(k, { ...v, t0: Date.now(), raport: r });
    if (r && r !== ultimRaport) { ultimRaport = r; coada.push({ tip: "raport", capitol: null, subcapitol: null, secunde: null, raport: r }); }
    if (coada.length >= 5) trimite(false);
  }
  function ascunsa(keep) { for (const [k, v] of [...deschise]) inchide(k, v); trimite(keep); if (sid) post({ actiune: "sesiune", op: "bataie", sid, raport: rid() }, keep); }
  async function porneste(s) {
    S = s; const r = await post({ actiune: "sesiune", op: "start", inst: inst() ? 1 : 0, raport: rid() }); if (!r || !r.sid) return; sid = r.sid;
    setInterval(() => { if (document.visibilityState === "visible" && sid) { post({ actiune: "sesiune", op: "bataie", sid, raport: rid() }); trimite(false); } }, 30000);   // evenimentele din coadă pleacă la fiecare bătaie
    setInterval(scan, 1000);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") ascunsa(true); else scan(); });
    addEventListener("pagehide", () => ascunsa(true));
  }
  window.CC_ADM_P.then(s => { if (!s || !s.token) return; if (!(s.k || s.m || s.pv || (s.adm && !s.c))) return; setTimeout(() => porneste(s), 2500); });
})();
