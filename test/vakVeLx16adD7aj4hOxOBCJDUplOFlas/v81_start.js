/* Raportul Casei v81 - cronometrele paginii (REGULI_V81 §3.8, 03.11.2026).
   Modulele își refac conținutul din oră în oră prin zeci de setInterval: măsurat în repaus, 33 de sarcini lungi în 20 s și hărți redesenate la fiecare 1,5 s.
   Aici se înregistrează cronometrele pornite la încărcare, ca acordeon.js să le oprească după ce pagina s-a așezat. Cele pornite după oprire (ex. „play” la însorire) nu sunt atinse. */
(function () {
  "use strict";
  const pune = window.setInterval.bind(window), scoate = window.clearInterval.bind(window);
  const L = new Map(); let oprite = false, urm = 0;
  window.setInterval = function (f, t, ...a) {
    const cur = pune(f, t, ...a);
    if (!oprite) L.set(cur, { cur, f, t, a });
    return cur;
  };
  window.clearInterval = function (id) { const e = L.get(id); if (e) { scoate(e.cur); L.delete(id); } else scoate(id); };
  function opreste() { oprite = true; L.forEach(e => scoate(e.cur)); }
  function porneste() { oprite = false; L.forEach(e => { e.cur = pune(e.f, e.t, ...e.a); }); }
  /* repornește cronometrele pentru ms milisecunde (altă proprietate, PIN deblocat), apoi le oprește la loc */
  function puls(ms) { clearTimeout(urm); if (oprite) porneste(); urm = setTimeout(opreste, ms); }
  window.CC_TIMERE = { opreste, porneste, puls, nr: () => L.size };
  /* altă locație = pagină încărcată din nou pe ea (Manu, 06.11.2026): după așezare modulele nu se mai redesenează singure,
     iar hărțile și textele rămâneau de la proprietatea dinainte (Giarmata Vii). O încărcare curată e aceeași pentru orice proprietate. */
  const idDin = h => { const x = decodeURIComponent(String(h || "").replace(/^#/, "")); return x && !x.includes("=") ? x.split(".")[0] : ""; };
  let id0 = idDin(location.hash);
  addEventListener("hashchange", () => { const n = idDin(location.hash), cur = (typeof D !== "undefined" && D && D.id) || id0; if (n && cur && n !== cur) { id0 = n; location.reload(); } });
  document.addEventListener("change", e => { if (e.target && e.target.id === "pick" && e.target.value) { const v = e.target.value, cur = (typeof D !== "undefined" && D && D.id) || id0; if (v !== cur) { e.stopImmediatePropagation(); location.hash = v; } } }, true);
  /* data unei imagini de satelit, cum o vede clientul: sezon și an („iarnă 2025”); cu {an:1}, imaginile mai vechi de 3 ani au doar anul (Manu, 06.11.2026) */
  window.CC_SEZON = (d, o) => { const m = String(d || "").match(/(\d{4})-(\d{1,2})|(\d{1,2})\.(\d{1,2})\.(\d{4})|^(\d{4})$/); if (!m) return "";
    const an = +(m[1] || m[5] || m[6]), lu = +(m[2] || m[4] || 0); if (!lu || (o && o.an && new Date().getFullYear() - an > 3)) return String(an);
    return (lu === 12 || lu <= 2 ? "iarnă" : lu <= 5 ? "primăvară" : lu <= 8 ? "vară" : "toamnă") + " " + an; };

  /* aceleași date se cereau de până la 18 ori (măsurat 05.11.2026: 67 de cereri, 8,6 MB). Un fișier se cere o singură dată pe încărcare de pagină. */
  const f0 = window.fetch.bind(window), cereri = new Map();
  window.fetch = function (u, o) {
    const m = (o && o.method) || "GET", url = typeof u === "string" ? u : (u && u.url) || "";
    if (o && o.body || !/^(GET|HEAD)$/.test(m) || !/\.(json|pdf)(\?|$)/.test(url) || /^https?:/.test(url) && !url.startsWith(location.origin)) return f0(u, o);
    const k = m + " " + url.split("?")[0];
    if (!cereri.has(k)) cereri.set(k, f0(u, o));
    return cereri.get(k).then(r => r.clone());
  };

  /* imaginile capitolelor închise nu se descarcă până nu se deschide capitolul (10 MB la deschidere, măsurat pe telefon) */
  const dI = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML"); let lenes = true;
  Object.defineProperty(Element.prototype, "innerHTML", { configurable: true, get() { return dI.get.call(this); }, set(v) {
    if (lenes && typeof v === "string" && v.indexOf("<im") >= 0 && (!this.isConnected || this.closest(".wrap > section")))
      v = v.replace(/(<img\b[^>]*?)\ssrc="(p\/[^"]*)"/g, '$1 data-lz="$2"').replace(/(<image\b[^>]*?)\shref="(p\/[^"]*)"/g, '$1 data-lzh="$2"');
    dI.set.call(this, v); } });
  window.CC_LENES = {
    arata(r) { (r || document).querySelectorAll("[data-lz],[data-lzh]").forEach(e => { if (e.dataset.lz) { e.src = e.dataset.lz; delete e.dataset.lz; } else { e.setAttribute("href", e.dataset.lzh); delete e.dataset.lzh; } }); },
    gata() { lenes = false; document.querySelectorAll("[data-lz],[data-lzh]").forEach(e => { if (!e.closest("section.ac-s")) this.arata(e.parentElement); }); }
  };
})();
