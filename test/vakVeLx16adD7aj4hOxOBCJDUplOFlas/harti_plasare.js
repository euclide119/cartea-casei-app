/* Raportul Casei v81 - butoanele și legendele hărților, peste hartă, în zona liberă (REGULI_V81_PAS2 §3, 03.11.2026). Cod comun, fără date ale unui set.
   Colțul se calculează la desenare: scor = acoperire × 3 + variația fundalului; cel mai mic scor câștigă, stânga-jos la egalitate.
   Acoperirea numără toate straturile hărții, și pe cele oprite, ca butoanele să nu sară când apeși pe ele. Peste 50 % în cel mai bun colț, butoanele ies sub hartă. */
(function () {
  "use strict";
  const FAM = [
    { sel: ".hm", map: ".hm-box", st: ".hm-ch", lg: ".hm-lg" },
    { sel: "figure.h79-f", map: "[data-z]", st: ".h79-ctl" },
    { sel: ".tpan:not(.ist)", map: ".tsvg", host: 1, st: ".pzchips", sub: ".tside .tsl,.tside input[type=range]", lg: ".tlg,.tleg,.tside" },
    { sel: ".pz", wrap: true, st: ".pzchips:has(button),.g7-ch", lg: ".pzchips:not(:has(button))" }
  ];
  const COLT = { bl: [0, .6], br: [.66, .6], tl: [0, 0], tr: [.66, 0] }, ORD = ["bl", "br", "tl", "tr"], LAT = .34, IN = .4, MAX_ACOP = .5, MAX_BTN = 6, N = 48;
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const css = document.createElement("style");
  css.textContent = `
.ov-map,.hm-box,[data-z],.tsvg,.ov-h{position:relative}.ov-h{display:block}
.ist .ist-img{position:relative}.ist .ist-d{position:absolute!important;left:10px!important;top:10px!important;right:auto!important;bottom:auto!important;background:rgba(16,19,28,.86)!important;color:#fff!important;font:700 15px/1.2 var(--font)!important;padding:5px 11px!important;border-radius:8px!important;text-shadow:none!important;z-index:2}
.ov .ov-tog{order:-1}.ov.ov-st.ov-str>:not(.ov-tog){display:none!important}
.ov{position:absolute;z-index:3;display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:0;background:none;color:#1a1e2a;max-width:60%;box-sizing:border-box;margin:0!important}
.ov.br,.ov.tr{align-items:flex-end}
.ov.bl{left:8px;bottom:8px}.ov.br{right:8px;bottom:8px}.ov.tl{left:8px;top:8px}.ov.tr{right:8px;top:8px}
.ov,.ov *{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
.ov .hm-ch,.ov .pzchips,.ov .g7-ch,.ov .h79-ctl,.ov .tbase,.ov .hm-base{display:flex!important;flex-direction:column!important;align-items:inherit!important;gap:3px!important;padding:0!important;margin:0!important;background:none!important;border:0!important;flex-wrap:nowrap!important;min-height:0!important;width:auto!important;height:auto!important;aspect-ratio:auto!important}
.ov button{width:auto!important;max-width:100%;text-align:left!important;padding:2px 8px!important;min-height:0!important;font-size:12.5px!important;line-height:1.35!important;white-space:nowrap!important;border:0!important;box-shadow:0 1px 3px rgba(0,0,0,.45)!important}
.ov button[aria-pressed="false"]{background:rgba(255,255,255,.88)!important}
.ov button[disabled],.ov .hm-ch>span:not(.hm-base),.ov .hm-base button[aria-pressed="true"],.ov .tbase button[aria-pressed="true"]{display:none!important}
.ov .ov-extra{display:none!important}.ov.ov-all .ov-extra{display:inline-block!important}.ov .ov-x{display:none!important}.ov.ov-des .ov-x{display:block!important}
.ov-mai{font-weight:700!important;background:#1a1e2a!important;color:#fff!important;border:0!important;border-radius:999px;cursor:pointer}

.ov-lg{font-size:12px;line-height:1.3;padding:0;background:none;border:0;box-shadow:none}
.ov-lg,.ov-lg *{color:#10131c!important;font-weight:600}.hm-box>.ov-lg.bl,.hm-box>.ov-lg.br{bottom:34px}.ov-lg .scroll,.ov-lg table{font-size:12px}.ov-lg td,.ov-lg th{padding:0 4px!important;border:0!important;background:none!important}.ov-lg>*{margin:0!important;background:none!important;border:0!important;box-shadow:none!important;padding:0!important;gap:1px 8px!important}.ov-lg *{background-color:transparent}
.ov-lg .hm-lg{display:flex!important;flex-direction:row!important;align-items:center!important;flex-wrap:wrap!important}.ov-lg .lg{white-space:nowrap}
.ov .g7-fc button[aria-pressed="true"]{display:none!important}
.ov-sub{margin-top:2px;font-size:11.5px;text-shadow:0 0 2px #fff,0 0 2px #fff,0 0 4px #fff}.ov input[type=range].ov-sub{width:170px;max-width:100%}
.ov.ov-afara{position:static!important;max-width:none!important;max-height:none!important;width:100%;padding:6px 0;flex-direction:row;flex-wrap:wrap;background:none;text-shadow:none;align-items:center}.ov.ov-afara .hm-ch,.ov.ov-afara .pzchips,.ov.ov-afara .g7-ch,.ov.ov-afara .h79-ctl,.ov.ov-afara .tbase,.ov.ov-afara .hm-base{flex-direction:row!important;flex-wrap:wrap!important}.ov.ov-afara button{width:auto!important}
.tpan.ov-gata{display:block!important}
.pz svg,.tsvg svg{max-height:82vh;display:block;margin:0 auto;overflow:hidden}
@media (max-width:700px){.ov button{font-size:11.5px!important;padding:2px 6px!important}.ov-lg{font-size:11px}}
@media print{.ov-st{display:none!important}.ov{box-shadow:none}}`;
  document.head.appendChild(css);

  /* eșantion 48 × 48 dintr-o imagine: pentru fiecare colț, cât din el e desenat (alfa) și cât variază luminozitatea */
  const cache = new Map();
  function imagine(src) {
    if (!src) return Promise.resolve(null);   // v82.2.1: fără sursă nu se face cerere (înainte: GET /null)
    if (cache.has(src)) return cache.get(src);
    const p = new Promise(ok => { const i = new Image(); i.onload = () => { try { const c = document.createElement("canvas"); c.width = c.height = N; const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(i, 0, 0, N, N); ok(x.getImageData(0, 0, N, N).data); } catch (e) { ok(null); } }; i.onerror = () => ok(null); i.src = src; });
    cache.set(src, p); return p;
  }
  function peColt(d, c, f) { if (!d) return 0; const [x0, y0] = COLT[c]; let n = 0, s = 0, s2 = 0, a = 0;
    for (let y = Math.floor(y0 * N); y < Math.min(N, Math.floor((y0 + IN) * N)); y++) for (let x = Math.floor(x0 * N); x < Math.min(N, Math.floor((x0 + LAT) * N)); x++) { const k = (y * N + x) * 4, l = (d[k] + d[k + 1] + d[k + 2]) / 765; n++; s += l; s2 += l * l; if (d[k + 3] > 40) a++; }
    return f === "alfa" ? a / n : Math.sqrt(Math.max(0, s2 / n - (s / n) ** 2)); }
  function vector(M, c) {
    const R = M.getBoundingClientRect(), [x0, y0] = COLT[c], ax = R.left + x0 * R.width, ay = R.top + y0 * R.height, aw = LAT * R.width, ah = IN * R.height; let s = 0, n = 0;
    for (const e of M.querySelectorAll("svg circle,svg polygon,svg path,svg text,svg polyline,svg rect")) { if (++n > 1500) break;
      const b = e.getBoundingClientRect(); if (!b.width || b.width * b.height > .3 * R.width * R.height) continue;
      const w = Math.min(ax + aw, b.right) - Math.max(ax, b.left), h = Math.min(ay + ah, b.bottom) - Math.max(ay, b.top); if (w > 0 && h > 0) s += w * h; }
    return Math.min(1, s / (aw * ah));
  }
  async function alege(M) {
    const iL = $$("img", M).filter(i => !i.closest(".ov")), iS = $$("svg image", M), straturi = [...iL.filter(i => i.classList.contains("l")), ...iS.slice(1)].map(i => i.src || i.getAttribute("href")), baza = iL.find(i => !i.classList.contains("l")) || iS[0];
    const dS = await Promise.all(straturi.map(imagine)), dB = baza ? await imagine(baza.src || baza.getAttribute("href")) : null;
    let dC = null; const cv = M.querySelector(":scope > canvas"); if (cv && cv.width) { try { const c = document.createElement("canvas"); c.width = c.height = N; const x = c.getContext("2d"); x.drawImage(cv, 0, 0, N, N); dC = x.getImageData(0, 0, N, N).data; } catch (e) {} }
    /* pe hărțile desenate pe canvas, data imaginii de satelit stă în stânga sus: colțul acela e ocupat */
    const stampila = M.querySelector(":scope > canvas.hm-c") ? .4 : 0;
    return ORD.map(c => { const ac = Math.min(1, dS.reduce((a, d) => a + peColt(d, c, "alfa"), 0) + vector(M, c) + (c === "tl" ? stampila : 0)), v = peColt(dB || dC, c, "var"); return { c, ac, scor: ac * 3 + v }; })
      .sort((a, b) => a.scor - b.scor || ORD.indexOf(a.c) - ORD.indexOf(b.c));
  }

  function montare(w, F) {
    let M = F.wrap ? w.querySelector(":scope > .ov-map") : w.querySelector(F.map);
    if (F.wrap && !M) { const s = $$(":scope > svg, :scope > img", w); if (!s.length) return null; M = document.createElement("div"); M.className = "ov-map"; s[0].before(M); s.forEach(e => M.appendChild(e)); }
    if (!M) return null;
    /* hărțile care își redesenează containerul (teritoriu: innerHTML pe .tsvg) primesc o gazdă: butoanele stau în gazdă, nu în hartă, și nu mai dispar la click (Manu, 06.11.2026) */
    let H = M;
    if (F.host) { H = M.parentElement && M.parentElement.classList.contains("ov-h") ? M.parentElement : null; if (!H) { H = document.createElement("div"); H.className = "ov-h"; M.before(H); H.appendChild(M); } }
    M._h = H;
    /* modulul a redesenat tot (harta.js: innerHTML pe .hm): butoanele noi se pun din nou peste hartă */
    if (w.dataset.ov && w.querySelector(".ov")) return M;
    const st = $$(F.st, w).filter(e => !e.closest(".ov") && e.querySelector("button,input")), lg = F.lg ? $$(F.lg, w).filter(e => !e.closest(".ov")) : [], sub = F.sub ? $$(F.sub, w) : [];
    if (!st.length && !lg.length) return null;
    w.dataset.ov = "1";
    if (st.length) { const b = document.createElement("div"); b.className = "ov ov-st"; st.forEach(e => b.appendChild(e)); sub.forEach(e => { e.classList.add("ov-sub"); b.appendChild(e); }); H.appendChild(b); }
    if (lg.length) { const b = document.createElement("div"); b.className = "ov ov-lg"; lg.forEach(e => b.appendChild(e)); H.appendChild(b); }
    if (w.matches(".tpan")) w.classList.add("ov-gata");
    return M;
  }
  /* un singur buton „straturi”, același pe toate hărțile: din start toate butoanele se văd; clientul le poate ascunde (Manu, 06.11.2026) */
  function straturi(b) {
    if (b.querySelector(":scope > .ov-tog") || $$("button", b).filter(x => !x.disabled).length < 2) return;
    const t = document.createElement("button"); t.type = "button"; t.className = "ov-mai ov-tog"; t.textContent = "straturi"; t.setAttribute("aria-expanded", "true");
    t.onclick = () => { const asc = b.classList.toggle("ov-str"); t.setAttribute("aria-expanded", String(!asc)); }; b.prepend(t);
  }
  /* cel mult 3 butoane peste hartă; restul în „alte straturi” (Manu, 07.11.2026, regula v81) */
  function limita(st) {
    if (!st) return; const bt = $$("button", st).filter(x => !x.classList.contains("ov-mai") && getComputedStyle(x).display !== "none");
    bt.forEach((x, i) => x.classList.toggle("ov-extra", i >= 3));
    let a = st.querySelector(":scope > .ov-alte");
    if (bt.length <= 3) { if (a) a.remove(); st.classList.remove("ov-all"); return; }
    if (!a) { a = document.createElement("button"); a.type = "button"; a.className = "ov-mai ov-alte"; a.onclick = () => { const on = st.classList.toggle("ov-all"); a.textContent = on ? "mai puține straturi" : "alte straturi"; }; st.appendChild(a); }
    a.textContent = st.classList.contains("ov-all") ? "mai puține straturi" : "alte straturi";
  }
  /* butoanele interactive în stânga, datele și legenda în dreapta (Manu, 06.11.2026); se schimbă doar dacă harta e plină pe partea aceea */
  async function plaseaza(w, F) {
    const M = montare(w, F); if (!M || !M.getClientRects().length || M.getBoundingClientRect().width < 150) return;
    const H = M._h || M, R = M.getBoundingClientRect(), st = H.querySelector(":scope > .ov-st") || w.querySelector(".ov-st"), lg = H.querySelector(":scope > .ov-lg") || w.querySelector(".ov-lg");
    const sc = w.dataset.ovRez ? JSON.parse(w.dataset.ovRez) : await alege(M); w.dataset.ovRez = JSON.stringify(sc);
    const pe = (b, c) => { b.classList.remove("bl", "br", "tl", "tr", "ov-afara"); b.classList.add(c); if (b.parentElement !== H) H.appendChild(b); };
    const afara = b => { b.classList.remove("bl", "br", "tl", "tr"); b.classList.add("ov-afara"); H.after(b); };
    const sta = sc.filter(x => x.c[1] === "l"), dr = sc.filter(x => x.c[1] === "r");
    if (!sc.length) return;   // v82.9.0: fără date de hartă (fără jeton) nu se calculează colțul
    let cS = sta[0] && sta[0].ac <= MAX_ACOP ? sta[0] : dr[0] && dr[0].ac <= MAX_ACOP ? dr[0] : null;
    w.dataset.ovColt = cS ? cS.c : "afara"; w.dataset.ovAcop = (+(cS || sc[0]).ac || 0).toFixed(2);
    if (st) { straturi(st);
      if (!cS) afara(st);
      else { pe(st, cS.c); const q = st.getBoundingClientRect(); if (q.height > .92 * R.height || q.width > .7 * R.width) { afara(st); cS = null; } } }
    if (lg) afara(lg);   /* v82.7.0: legenda sub hartă, nu peste ea (Manu, 07.11.2026) */
    limita(st);
  }
  /* parcelele cadastrale apar doar pe harta construcțiilor din zonă (Manu, 03.11.2026) */
  function faraCadastru(a) { $$("button,label", a).forEach(b => { if (b.closest("#autorizatii")) return; if (b.dataset.k === "cad" || b.dataset.l === "cad" || /parcele cadastrale|strat cadastral/i.test(b.textContent || "")) b.remove(); }); }
  /* comutatorul de fundal („Hartă plan / Satelit”) stă cu butoanele hărții, nu sub ele */
  function fundal(a) { $$(".ov-map > .g7-fc", a).forEach(f => { const st = f.parentElement.querySelector(":scope > .ov-st"); if (st) st.prepend(f); }); }
  function tot(r) { const a = r || document; faraCadastru(a); fundal(a); FAM.forEach(F => $$(F.sel, a).forEach(w => { if (F.sel === ".pz" && w.closest(".tpan")) return; plaseaza(w, F).catch(e => console.warn("plasare", e)); })); }
  let tz = 0; addEventListener("resize", () => { clearTimeout(tz); tz = setTimeout(() => tot(), 400); });
  /* după orice click pe o hartă: dacă modulul și-a redesenat butoanele, se pun la loc peste hartă */
  document.addEventListener("click", e => { const w = e.target.closest && e.target.closest(".hm,figure.h79-f,.tpan,.pz"); if (!w || e.target.closest(".ov-tog")) return; const sec = w.closest("section") || document; setTimeout(() => tot(sec), 80); setTimeout(() => tot(sec), 600); }, true);
  window.CC_PLASARE = { tot };
})();
