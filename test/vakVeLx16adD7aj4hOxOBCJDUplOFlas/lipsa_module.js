/* Cartea Casei — module fără date (Manu, 07.11.2026, v82.2.0).
   date_fine.py scrie, pentru un modul care nu are date, fișierul așteptat cu {"stare":"lipsă","motiv":…,"sursa":…,"data":…}.
   Aici, orice p/<id>/*.json cu stare „lipsă” ajunge la modulele paginii ca 404, deci fiecare modul se poartă ca și până acum
   la un fișier absent; motivul rămâne în window.CC_LIPSA (cheie = fișierul), pentru mascare.js și pentru verificări. */
(function () {
  "use strict";
  const f0 = window.fetch; if (!f0 || window.CC_LIPSA) return;
  window.CC_LIPSA = {}; const ABS = {};
  const RE = /(?:^|\/)p\/([^/?#]+)\/([^?#]+\.json)(?:[?#]|$)/;
  window.fetch = async function (...a) {
    /* v82.2.1: date.json poate purta „fisiere_lipsa” (scris de date_fine.py): fișierele astea nu se mai cer, răspunsul 404 vine fără rețea */
    try {
      const u0 = decodeURIComponent(typeof a[0] === "string" ? a[0] : (a[0] && a[0].url) || ""), m0 = u0.match(/(?:^|\/)p\/([^/?#]+)\/([^/?#]+)(?:[?#]|$)/);
      if (m0 && ABS[m0[1]] && ABS[m0[1]].has(m0[2])) { window.CC_LIPSA[m0[2]] = window.CC_LIPSA[m0[2]] || { stare: "lipsă", sursa: "date.json:fisiere_lipsa" }; return new Response("", { status: 404, statusText: "lipsa" }); }
    } catch (e) {}
    const r = await f0.apply(this, a);
    try {
      const u1 = decodeURIComponent(typeof a[0] === "string" ? a[0] : (a[0] && a[0].url) || ""), m1 = u1.match(/(?:^|\/)p\/([^/?#]+)\/date\.json(?:[?#]|$)/);
      if (m1 && r.ok) { const j = await r.clone().json(); if (j && Array.isArray(j.fisiere_lipsa)) ABS[m1[1]] = new Set(j.fisiere_lipsa); }
    } catch (e) {}
    try {
      const u = typeof a[0] === "string" ? a[0] : (a[0] && a[0].url) || "";
      const m = decodeURIComponent(u).match(RE);
      if (!m || !r.ok) return r;
      const n = +(r.headers.get("content-length") || 0);
      if (n > 4096) return r;                       // fișierele „lipsă” au câteva sute de octeți
      const t = await r.clone().text();
      if (t.length > 4096 || t.indexOf("lips") < 0) return r;
      const j = JSON.parse(t);
      if (j && j.stare === "lipsă") { window.CC_LIPSA[m[2]] = j; return new Response("", { status: 404, statusText: "lipsa" }); }   /* fără diacritice: statusText cere ByteString, altfel Response aruncă */
    } catch (e) {}
    return r;
  };
})();
