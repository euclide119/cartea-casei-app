/* Raportul Casei - PDF direct, fără imprimantă. Cod comun, fără date ale unui set: aceleași reguli pentru orice proprietate (REGULI_PDF.md, 06.11.2026).
   Ordinea: 1 copertă (imaginea de deschidere pe lățimea paginii) · 2 rezumat și concluzii · capitolele bifate · la sfârșit condițiile, nota juridică și creditele.
   Fiecare pagină are sus antetul capitolului (poză, titlu, nota pe bară). Un capitol nou începe pe pagina curentă dacă mai e cel puțin o treime liberă.
   Hărțile apropiate ca formă stau câte două pe rând. Nu intră: butoane, câmpuri, indicii de click („atinge”, „treci cu mouse-ul”), nivelul 2, datele fine.
   Paginile sunt imagini (bloc cu bloc, fără să se rupă o hartă); QR spre raportul interactiv la aproximativ 3 pagini, unde e loc, și pe ultima. */
/* bife_export.js (09.11.2026): trei cârlige minime, active doar cât window.CC_PDF_BIFE e setat de modulul bife: fără limita de 2 pagini pe capitol, fără rezumarea textelor lungi, tabelele bifate intră. Fără flag, comportament identic. */
(function () {
  "use strict";
  const LIB = ["https://cdn.jsdelivr.net/npm/modern-screenshot@4.4.39/dist/index.js", "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"];
  const LINK = "https://euclide119.github.io/cartea-casei-app/raport/";
  const A4 = { w: 210, h: 297, m: 10 }, UTIL = A4.h - 2 * A4.m - 6, MAX_PAG = 2, QR_MM = 24, QR_LOC = 32, TXT_CUV = 60, LW = A4.w - 2 * A4.m, PX = 936;
  const FIG_H = .5 * UTIL, PERECHE = 93, LIBER_CAP = .33 * UTIL;
  const CONT = ".hm,figure,.pz,.tpan,.g7-map,.ch,.box,.g7-puz,.rc,.cr-l";
  /* ce nu intră niciodată în PDF: comenzi, câmpuri, butoanele hărților, alegerea pozelor, coperta din rezumat */
  const SCOS = "button,input:not([data-rc=pret]),select,summary,.ov-st,.ac-mai,#ip-ctl,.hg-th,.g7-fc,.g7-ch,.cr-f,.cr-more,.p2-cov,.ac-ct,.g7-pop,.rc-ps,#cc-modv,.cc-acc,details:not([open]),#cl-final>h2";
  /* butoanele care sunt de fapt conținut (rândurile semaforului din rezumat, cardurile cu cifre) rămân */
  const scos = n => n.nodeType === 1 && n.matches && n.matches(SCOS) && !(n.tagName === "BUTTON" && n.closest(".sem,.cards,.cc-sem,#cl-final"));
  const INDICIU = /\b(dă|apasă|atinge|treci cu mouse|treci cu degetul|click|clic|bifează|bifeaza|trage pe|trage bara|alege anul|rulează|ruleaza|deschide fișa|vezi detaliile)\b/i;
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  let incarcat = null;
  const scripturi = () => incarcat || (incarcat = Promise.all(LIB.map(u => new Promise((ok, no) => { const s = document.createElement("script"); s.src = u; s.onload = ok; s.onerror = () => no(new Error("nu s-a încărcat " + u)); document.head.appendChild(s); }))));

  function ecran(t) {
    let o = document.getElementById("cc-pdf-o");
    if (!o) { o = document.createElement("div"); o.id = "cc-pdf-o"; o.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(20,22,30,.72);display:flex;align-items:center;justify-content:center;padding:16px"; o.innerHTML = `<div style="background:#fff;color:#1a1e2a;border-radius:14px;padding:20px 22px;max-width:420px;width:100%;font:15px/1.4 system-ui"><b id="cc-pdf-t"></b><div id="cc-pdf-b" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"></div></div>`; document.body.appendChild(o); }
    o.querySelector("#cc-pdf-t").textContent = t; return o;
  }
  const inchideE = () => document.getElementById("cc-pdf-o")?.remove();
  const cuv = el => (el.textContent || "").trim().split(/\s+/).filter(Boolean).length;
  const viz = el => el.getClientRects().length > 0;
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- pregătirea paginii pentru PDF (se reface la loc după) ---------- */
  const refa = [];
  function pregateste() {
    /* indiciile de folosire se scot propoziție cu propoziție: descrierea hărții rămâne */
    const w = document.createTreeWalker(document.querySelector(".wrap") || document.body, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { const v = n.nodeValue; if (!v || v.length < 6 || !INDICIU.test(v) || n.parentElement.closest("script,style")) continue;
      const nou = v.split(/(?<=[.!?;])\s+/).filter(p => !INDICIU.test(p)).join(" "); refa.push([n, v]); n.nodeValue = nou; }
    /* îndemnurile lipite de un titlu („…: ajustează-le”) se taie doar ele */
    const w2 = document.createTreeWalker(document.querySelector(".wrap") || document.body, NodeFilter.SHOW_TEXT);
    while ((n = w2.nextNode())) { const v = n.nodeValue; if (v && /:\s*(ajustează|alege|schimbă)[^.]*$/i.test(v)) { refa.push([n, v]); n.nodeValue = v.replace(/:\s*(ajustează|alege|schimbă)[^.]*$/i, ""); } }
    /* culorile din variabile CSS puse ca atribute SVG ies negre în captură: se scriu culorile calculate */
    $$("svg [fill*='var('], svg [stroke*='var(']").forEach(e => { ["fill", "stroke"].forEach(a => { const v = e.getAttribute(a); if (v && v.includes("var(")) { refa.push([e, a, v]); e.setAttribute(a, getComputedStyle(e)[a]); } }); });
  }
  function reface() { while (refa.length) { const r = refa.pop(); if (r.length === 2) r[0].nodeValue = r[1]; else r[0].setAttribute(r[1], r[2]); } }

  /* blocurile de nivel 1 ale unei secțiuni, cu prioritate: 3 = cifre și verdict, 2 = figură, 1 = text */
  function blocuri(s, L) {
    const hero = s.querySelector(":scope > .hero"); if (hero && viz(hero)) L.push({ el: hero, p: 3 });
    const umbla = p => [...p.children].forEach(c => {
      if (!viz(c) || c.matches(".rc-cap,.hero,.ac-n2,.ov,script,style,.vb") || scos(c)) return;
      /* o hartă fără nimic de arătat („nu au fost găsite…”) nu ocupă loc în PDF (06.11.2026) */
      if (c.matches(CONT) && /nu au fost găsit|niciun[a]? (obiectiv|clădire|sit|zon)|nu există date|fără date/i.test(c.textContent || "") && !c.querySelector("img[src*='/p/'],svg image")) return;
      if (c.matches(CONT) || c.matches("svg,canvas") || (c.matches("img") && c.getBoundingClientRect().width >= 200)) { if (c.getBoundingClientRect().width >= 150) L.push({ el: c, p: 2, fig: true }); return; }
      if (c.querySelector("img,svg[role=img],canvas")) { umbla(c); return; }
      const w = cuv(c); if (w < 3) return;
      if (c.matches(".verd,.cards,.g7-k,.g7-sint,.cc-scor")) { L.push({ el: c, p: 3 }); return; }
      if (c.matches("table,.scroll") && !window.CC_PDF_BIFE) return;
      if (w <= (window.CC_PDF_BIFE ? 9999 : TXT_CUV)) L.push({ el: c, p: 1 }); else if (c.children.length > 1) umbla(c); else L.push({ txt: (c.textContent || "").replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s/).slice(0, 2).join(" "), p: 1, cuib: s });
    });
    umbla(s);
  }
  /* explicația unei figuri fără text propriu: eticheta ei (aria-label) sau titlul de deasupra */
  function explicatie(b) {
    if (!b.fig || cuv(b.el) >= 8) return null;
    const a = b.el.querySelector("[aria-label]")?.getAttribute("aria-label") || b.el.getAttribute("aria-label");
    let h = b.el.previousElementSibling; while (h && !h.matches("h3,h4,.hm-t,.tt,figcaption")) h = h.previousElementSibling;
    const t = (a || (h && h.textContent) || "").trim(); return t.length > 6 ? t.charAt(0).toUpperCase() + t.slice(1) : null;
  }
  /* imaginile ascunse (poza din antet, cu încărcare întârziată) nu se încarcă niciodată: fără acest filtru, fiecare bloc aștepta tot timpul de expirare */
  async function poza(el, sc) {
    $$('img[loading="lazy"]', el).forEach(i => { i.loading = "eager"; });
    const c = await window.modernScreenshot.domToCanvas(el, { scale: sc || 1.25, font: false, timeout: 6000, backgroundColor: "#fff", filter: n => !scos(n) && !(n.tagName === "IMG" && getComputedStyle(n).display === "none") });
    return { url: c.toDataURL("image/jpeg", .82), w: c.width, h: c.height, sc: sc || 1.25 };
  }
  async function pozaHtml(html, cuib, sc) {
    const d = document.createElement("div"); d.style.cssText = `position:absolute;left:0;top:0;width:${PX}px;background:#fff;color:#1a1e2a;font:15px/1.45 var(--font,system-ui)`; d.innerHTML = html; (cuib || document.body).appendChild(d);
    await Promise.all($$("img", d).map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    try { return await poza(d, sc); } finally { d.remove(); }
  }
  const pozaText = (t, cuib, mic) => pozaHtml(`<div style="padding:2px 0;${mic ? "font-size:13px;color:#333;font-style:italic" : ""}">${esc(t)}</div>`, cuib);
  const credite = () => new Promise(ok => { const i = new Image(); i.onload = () => { const c = document.createElement("canvas"); c.width = i.naturalWidth; c.height = i.naturalHeight; c.getContext("2d").drawImage(i, 0, 0); ok({ url: c.toDataURL("image/jpeg", .85), w: c.width, h: c.height, sc: c.width / PX }); }; i.onerror = () => ok(null); i.src = "credite.webp"; });
  const imgUrl = src => new Promise(ok => { const i = new Image(); i.onload = () => { const c = document.createElement("canvas"); c.width = i.naturalWidth; c.height = i.naturalHeight; c.getContext("2d").drawImage(i, 0, 0); ok({ url: c.toDataURL("image/jpeg", .86), w: c.width, h: c.height }); }; i.onerror = () => ok(null); i.src = src; });

  /* mărimea unui bloc pe pagină: niciodată peste mărimea de pe ecran (936 px = lățimea utilă); o figură are cel mult jumătate de pagină */
  function dim(b, W) { let w = Math.min(W || LW, b.i.w / b.i.sc * LW / PX), h = b.i.h / b.i.w * w;
    if (b.fig && h > FIG_H && !W) { w = w * FIG_H / h; h = FIG_H; } if (h > UTIL) { w = w * UTIL / h; h = UTIL; } return { w, h }; }

  function qrDesen(doc, x, y, mm, eticheta) {
    const q = window.qrcode(0, "M"); q.addData(LINK); q.make(); const n = q.getModuleCount(), k = (mm - 2) / n;
    doc.setFillColor(255, 255, 255); doc.rect(x, y, mm, mm, "F"); doc.setFillColor(0, 0, 0);
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) doc.rect(x + 1 + c * k, y + 1 + r * k, k + .02, k + .02, "F");
    doc.setFontSize(7); doc.setTextColor(40); const cod = window.CC_SERV && window.CC_SERV.raport && window.CC_SERV.raport.cod; doc.text(eticheta || (cod ? "cod: " + cod : "raport interactiv"), x + mm / 2, y + mm + 3, { align: "center" });
  }
  /* QR: la aproximativ fiecare 3 pagini, pe prima de la a 3-a încolo cu loc liber jos în dreapta; obligatoriu pe ultima */
  function qr(doc, liber, de0) {
    let n = doc.internal.getNumberOfPages(); const puse = [];
    if (liber[n - 1] < QR_LOC) { doc.addPage(); liber.push(UTIL); n++; }
    let de = de0 || 3; for (let p = de; p < n; p++) { if (p < de) continue; if (liber[p - 1] >= QR_LOC) { puse.push(p); de = p + 3; } }
    puse.push(n);
    puse.forEach(p => { doc.setPage(p); qrDesen(doc, A4.w - A4.m - QR_MM, A4.h - A4.m - QR_MM - 4, QR_MM); });
    return puse;
  }

  /* ---------- așezarea pe pagini ---------- */
  function Pagini(doc) {
    const liber = [UTIL], st = { y: A4.m, antet: null, prima: true };
    const nou = () => { if (st.prima) { st.prima = false; } else { doc.addPage(); liber.push(UTIL); } st.y = A4.m; if (st.antet) pune(st.antet, true); };
    const loc = () => A4.m + UTIL - st.y;
    function pune(b, faraRupere) { const { w, h } = b.d || dim(b); if (!faraRupere && h > loc()) nou();
      doc.addImage(b.i.url, "JPEG", (A4.w - w) / 2, st.y, w, h, undefined, "FAST"); st.y += h + 3; liber[liber.length - 1] = Math.max(0, loc()); }
    /* un capitol nou: pagina curentă dacă mai are o treime liberă, altfel pagina următoare; antetul lui se repetă pe fiecare pagină a capitolului */
    function capitol(antet, L) { st.antet = antet;
      /* loc pentru antet + blocurile până la prima figură inclusiv (figura la 60 %): altfel capitolul începe pe pagina următoare, fără antet rămas singur jos */
      let need = dim(antet).h + 4; for (const b of (L || [])) { const h = dim(b).h; if (b.fig) { need += .6 * h; break; } need += h + 3; if (need > UTIL) break; }
      if (st.prima || loc() < Math.max(LIBER_CAP, need)) nou(); else { st.y += 4; pune(antet, true); } }
    function bloc(L) {
      for (let k = 0; k < L.length; k++) { const b = L[k], n = L[k + 1];
        /* două hărți apropiate ca formă, una lângă alta */
        if (b.fig && n && n.fig && !b.lat && !n.lat) { const d1 = dim(b, PERECHE), d2 = dim(n, PERECHE), r1 = d1.h / d1.w, r2 = d2.h / d2.w;
          if (r1 > .55 && r2 > .55 && Math.abs(r1 - r2) < .45) { const h = Math.max(d1.h, d2.h); if (h > loc()) nou();
            doc.addImage(b.i.url, "JPEG", A4.m, st.y, d1.w, d1.h, undefined, "FAST"); doc.addImage(n.i.url, "JPEG", A4.w - A4.m - d2.w, st.y, d2.w, d2.h, undefined, "FAST");
            st.y += h + 3; liber[liber.length - 1] = loc(); k++;
            [b.cap, n.cap].forEach((c, j) => { if (!c) return; const dc = dim(c, PERECHE - 4); doc.addImage(c.i.url, "JPEG", j ? A4.w - A4.m - dc.w : A4.m, st.y, dc.w, dc.h, undefined, "FAST"); });
            if (b.cap || n.cap) st.y += Math.max(b.cap ? dim(b.cap, PERECHE - 4).h : 0, n.cap ? dim(n.cap, PERECHE - 4).h : 0) + 3; liber[liber.length - 1] = loc(); continue; } }
        let d = dim(b);
        /* o figură care nu încape: se micșorează până la 60 % ca să rămână pe pagină */
        if (b.fig && d.h > loc() && loc() >= .6 * d.h) d = { w: d.w * loc() / d.h, h: loc() - (b.cap ? 8 : 0) };
        /* un titlu sau un rând scurt nu rămâne singur jos pe pagină */
        if (!b.fig && d.h < 22 && n && d.h + Math.min(dim(n).h, .6 * dim(n).h) > loc()) nou();
        b.d = d; pune(b); if (b.cap) pune(b.cap);
      }
    }
    return { liber, st, nou, pune, capitol, bloc, loc };
  }

  async function salveaza(doc, nume) {
    const blob = doc.output("blob"), fis = new File([blob], nume, { type: "application/pdf" }), url = URL.createObjectURL(blob);
    window.CC_PDF.ultim = { nume, pagini: doc.internal.getNumberOfPages(), mb: +(blob.size / 1048576).toFixed(1) };
    const a = document.createElement("a"); a.href = url; a.download = nume; document.body.appendChild(a); a.click(); a.remove();
    const o = ecran(`PDF gata: ${window.CC_PDF.ultim.pagini} pagini, ${window.CC_PDF.ultim.mb} MB.`), b = o.querySelector("#cc-pdf-b"); b.innerHTML = "";
    const buton = (t, f) => { const x = document.createElement("button"); x.type = "button"; x.textContent = t; x.style.cssText = "padding:9px 14px;border-radius:999px;border:2px solid #1a1e2a;background:#fff;color:#1a1e2a;font-weight:600;cursor:pointer"; x.onclick = f; b.appendChild(x); };
    buton("salvează din nou", () => { const l = document.createElement("a"); l.href = url; l.download = nume; l.click(); });
    if (navigator.canShare && navigator.canShare({ files: [fis] })) buton("trimite", () => navigator.share({ files: [fis], title: nume }).catch(() => {}));
    buton("închide", inchideE);
  }
  function mod(on) { document.body.classList.toggle("cc-pdf", on); window.__cadPrint = on ? 1 : 0; dispatchEvent(new Event("resize")); }
  /* în PDF: contrast pe hârtie (fără gri deschis pe alb), etichetele încap, legenda hărților pe mai multe rânduri */
  const css = document.createElement("style"); css.textContent = `body.cc-pdf section.ac-s.ac-asc,body.cc-pdf section.ac-s.ac-sub,body.cc-pdf #cl-final{visibility:visible!important}body.cc-pdf .ov-st{display:none!important}
body.cc-pdf{--muted:#3a3f4c!important;--line:#b9bdc6!important}body.cc-pdf .nt,body.cc-pdf small,body.cc-pdf .rt-sub,body.cc-pdf .ub-sub,body.cc-pdf .ub-n,body.cc-pdf .g7-p,body.cc-pdf .ex,body.cc-pdf .hm-t{color:#2b2f3a!important;opacity:1!important}
body.cc-pdf .hx-vd,body.cc-pdf .g7-badge,body.cc-pdf .hero-v i,body.cc-pdf .hx-vd *{white-space:nowrap!important;overflow:visible!important;height:auto!important;line-height:1.5!important;padding-top:2px!important;padding-bottom:2px!important}body.cc-pdf .pzc{white-space:normal!important}body.cc-pdf .ov-lg .lg{white-space:nowrap!important;line-height:1.3!important}body.cc-pdf .ov-lg{max-height:none!important;overflow:visible!important}
body.cc-pdf .rc-o label:has(input:not(:checked)){display:none!important}body.cc-pdf .rc-o label:has(input:checked)::before{content:"✓";font-weight:800;margin-right:-2px}body.cc-pdf .rc-p input{animation:none!important;background:#fff!important}
body.cc-pdf .rc{grid-template-columns:minmax(0,1fr)!important}body.cc-pdf .rc .dn{max-width:100%}body.cc-pdf table{table-layout:auto!important}body.cc-pdf td,body.cc-pdf th{vertical-align:top}body.cc-pdf .rc-kv{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:4px 14px!important}body.cc-pdf .rc-kv dt,body.cc-pdf .rc-kv dd{margin:0!important;line-height:1.4!important;white-space:normal!important;float:none!important}`; document.head.appendChild(css);

  /* antetul de capitol: poza, titlul, propoziția și nota pe bară (ex. „Acces și transport · 70 % bine”) */
  function antetHtml(c) {
    const img = c.el.querySelector(".ac-f img"), src = img ? img.currentSrc || img.src : "", pct = c.pct, col = c.col, COL = { g: "#1f8a4c", o: "#c86a0a", r: "#c0392b" };
    const p = (c.el.querySelector(".ac-t p") || {}).textContent || "";
    return `<div style="display:flex;gap:16px;align-items:center;padding:0 0 8px;border-bottom:2.5px solid #1a1a1a">
      ${src ? `<img src="${esc(src)}" style="width:150px;height:84px;object-fit:cover;border-radius:8px;flex:none">` : ""}
      <div style="flex:1;min-width:0"><div style="font:800 25px/1.15 var(--font,system-ui);color:#1a1a1a">${esc(c.t.replace(/^🔒\s*/, ""))}</div><div style="font:14px/1.35 var(--font,system-ui);color:#2b2f3a;margin-top:3px">${esc(p)}</div></div>
      ${pct != null ? `<div style="flex:none;width:170px;text-align:right"><div style="font:800 26px/1 var(--mono,monospace);color:${COL[col] || "#1a1a1a"}">${pct} %</div><div style="font:600 13px var(--font,system-ui);color:#1a1a1a;margin:2px 0 6px">${col === "g" ? "bine" : col === "o" ? "de verificat" : "atenție"}</div><div style="position:relative;height:10px;border-radius:5px;background:linear-gradient(90deg,#c0392b 0 33%,#e07b00 33% 66%,#1f8a4c 66%)"><i style="position:absolute;top:-4px;left:calc(${pct}% - 2px);width:4px;height:18px;background:#1a1a1a;border-radius:2px"></i></div></div>` : ""}</div>`;
  }
  /* coperta: imaginea de deschidere pe lățimea paginii, titlul și QR-ul */
  async function coperta(doc) {
    const sp = document.querySelector("#cc-splash img")?.getAttribute("src"), tip = typeof D !== "undefined" && D ? D.tip : "", src = sp || (tip === "apartament" ? "deschidere_apartament.jpg" : tip === "teren" ? "deschidere_parcela.jpg" : "deschidere.jpg");
    const im = await imgUrl(src); let y = 0;
    if (im) { const h = Math.min(A4.h * .58, im.h / im.w * A4.w); doc.addImage(im.url, "JPEG", 0, 0, A4.w, h, undefined, "FAST"); y = h + 8; }
    const hd = document.querySelector(".wrap > header"), brand = (document.querySelector(".brand>span") || {}).textContent || "Cartea Casei";
    const titlu = (hd && hd.querySelector("h1")?.textContent) || (typeof D !== "undefined" && D && D.eticheta) || document.title, sub = hd ? [...hd.querySelectorAll("p,small,span,div")].map(e => e.children.length ? "" : e.textContent.trim()).find(t => /coordonate|actualizat/.test(t)) || "" : "";
    const t = await pozaHtml(`<div style="padding:4px 0"><div style="font:700 15px var(--font,system-ui);letter-spacing:.18em;text-transform:uppercase;color:#4a5063">${esc(brand)}</div>
      <div style="font:800 46px/1.1 var(--font-t,Georgia,serif);color:#1a1a1a;margin:10px 0 12px">${esc(titlu)}</div><div style="font:15px var(--mono,monospace);color:#2b2f3a">${esc(sub)}</div>
      <div style="font:15px/1.45 var(--font,system-ui);color:#2b2f3a;margin-top:18px;max-width:640px">Raport generat electronic din datele publice și private disponibile la ${new Date().toLocaleDateString("ro-RO")}. Pe pagina următoare: rezumatul și concluziile; apoi capitolele. Codul QR deschide raportul interactiv.</div></div>`);
    const w = LW, h = t.h / t.w * w; doc.addImage(t.url, "JPEG", A4.m, y, w, h, undefined, "FAST");
    qrDesen(doc, A4.w - A4.m - 32, A4.h - A4.m - 38, 32, "scanează pentru raportul interactiv");
  }

  async function capitole(idx, nume) {
    ecran("Pregătesc PDF-ul…"); const A = window.CC_ACORDEON, C = A.caps();
    try {
      await scripturi(); mod(true); document.body.classList.add("ac-cl"); await new Promise(r => setTimeout(r, 500)); pregateste();
      const doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4", compress: true });
      /* 1 · coperta */
      await coperta(doc); doc.addPage(); const P = Pagini(doc); P.st.prima = true;
      /* 2 · rezumat și concluzii */
      const cf = document.getElementById("cl-final");
      if (cf && viz(cf)) { const ah = { i: await pozaHtml(`<div style="font:800 25px var(--font,system-ui);padding:0 0 8px;border-bottom:2.5px solid #1a1a1a">Rezumat și concluzii</div>`) }; P.capitol(ah); const b = { i: await poza(cf) }; let d = dim(b); if (d.h > P.loc()) d = { w: d.w * P.loc() / d.h, h: P.loc() }; b.d = d; P.pune(b, true); }
      P.st.antet = null; P.st.y = A4.m + UTIL + 1;   // capitolele încep pe pagina următoare
      /* 3 · capitolele */
      for (let n = 0; n < idx.length; n++) { const c = C[idx[n]], S = A.pentruPdf(idx[n]); ecran(`Pregătesc PDF-ul: ${n + 1} din ${idx.length} · ${c.t}`);
        const L = []; S.forEach(s => blocuri(s, L));
        /* cea mai relevantă figură (R9.2): cea cu strat activ, din secțiunea cu riscul cel mai mare; la nevoie de loc pleacă întâi celelalte */
        L.forEach(b => { if (!b.fig) return; const pc = b.el.closest("section")?.querySelector(".vb[data-pct]"); b.rel = (b.el.querySelector('button[aria-pressed="true"]') ? 1 : 0) + (pc ? (100 - +pc.dataset.pct) / 100 : 0); });
        for (const b of L) { try { b.i = b.el ? await poza(b.el) : await pozaText(b.txt, b.cuib); const ex = explicatie(b); if (ex) b.cap = { i: await pozaText(ex, b.el.closest("section"), true) }; } catch (e) { console.warn("pdf bloc", e); } }
        let tot = L.filter(b => b.i && b.i.w > 1 && b.i.h > 1);
        /* cel mult 2 pagini pe capitol: se renunță întâi la text, apoi la figurile mai puțin relevante */
        const pagini = l => { let p = 1, y = 26; for (const b of l) { const h = dim(b).h + (b.cap ? 8 : 0); if (y + h > UTIL) { p++; y = 26; } y += h + 3; } return p; };
        for (const pr of [1, 2, 3]) for (const b of tot.filter(x => x.p === pr).map((x, k) => [x, k]).sort((u, v) => (u[0].rel || 0) - (v[0].rel || 0) || v[1] - u[1]).map(u => u[0])) { if (pagini(tot) <= (window.CC_PDF_BIFE ? 99 : MAX_PAG)) break; tot.splice(tot.indexOf(b), 1); }
        const titlu = b => b && b.el && b.el.matches("h1,h2,h3"); tot = tot.filter((b, k) => !titlu(b) || (tot[k + 1] && !titlu(tot[k + 1])));
        if (!tot.length) continue;
        P.capitol({ i: await pozaHtml(antetHtml(c)) }, tot); P.bloc(tot);
      }
      /* 4 · la sfârșit: condițiile, nota juridică, creditele */
      P.st.antet = null; const fin = [];
      const rf = document.getElementById("rep-foot-p"); if (rf && viz(rf)) fin.push({ i: await poza(rf) });
      if (document.documentElement.dataset.ordJur === "1") { const e = document.getElementById("g7-ordprint"); if (e) { e.style.display = "block"; fin.push({ i: await poza(e) }); e.style.display = ""; } }
      const cr = await credite(); if (cr) fin.push({ i: cr });
      if (P.loc() < LIBER_CAP) P.nou(); P.bloc(fin);
      window.CC_PDF.qr = qr(doc, [0, ...P.liber], 4);
      await salveaza(doc, nume || `raport-${(typeof D !== "undefined" && D && D.id) || "proprietate"}.pdf`);
    } catch (e) { console.warn("pdf", e); const o = ecran("PDF-ul nu s-a putut face acum: " + e.message), b = o.querySelector("#cc-pdf-b"); b.innerHTML = `<button type="button" onclick="document.getElementById('cc-pdf-o').remove()" style="padding:9px 14px;border-radius:999px;border:2px solid #1a1e2a;background:#fff;font-weight:600">închide</button>`; }
    finally { reface(); if (!A.eLung0()) document.body.classList.remove("ac-cl"); mod(false); A.dupaPdf(); }
  }
  /* un document ca atare (extrasul, comanda) sau elemente deja în pagină (afișul): fiecare `pe_pagina` ocupă o pagină */
  async function din(titlu, corp, optiuni) {
    ecran("Pregătesc PDF-ul…"); const gaz = document.createElement("div"); let sect = [];
    try {
      await scripturi(); mod(true);
      let el;
      if (typeof corp === "string") { gaz.style.cssText = "position:fixed;left:-99999px;top:0;width:900px;background:#fff;padding:18px;--panel:#fff;--line:#ddd;--muted:#333;--font:system-ui;--mono:ui-monospace,Menlo,monospace;font-family:system-ui;color:#1a1e2a"; gaz.innerHTML = `<style>#cc-pdf-g h1,#cc-pdf-g h2,#cc-pdf-g h3{line-height:1.25!important;margin:0 0 12px!important;position:static!important}#cc-pdf-g .g7-b>*{position:static!important;margin-top:0!important}</style>` + corp; gaz.id = "cc-pdf-g"; document.body.appendChild(gaz);
        /* titlul pe două rânduri nu se mai taie și nu intră sub primul chenar (extrasul, 06.11.2026) */
        gaz.querySelectorAll("h1").forEach(h => { const d = document.createElement("div"); d.textContent = h.textContent; d.style.cssText = "font:700 34px/1.3 Georgia,serif;color:#1a1e2a;padding:0 0 10px"; h.replaceWith(d); }); const b = gaz.querySelector(".g7-b"); el = [...gaz.children].flatMap(c => c === b ? [...b.children] : [c]); }
      else { el = corp; sect = [...new Set(el.map(e => e.closest("section")).filter(Boolean))].filter(x => !x.classList.contains("ac-lung")); sect.forEach(x => x.classList.add("ac-lung")); }
      await new Promise(r => setTimeout(r, 400));
      const doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4", compress: true }), L = [];
      for (const e of el) if (viz(e) && (e.textContent || "").trim().length + e.querySelectorAll("img,svg,canvas").length > 0) L.push({ i: await poza(e) });
      if (!L.length) throw new Error("documentul nu e pregătit în pagină");   // niciodată un PDF gol
      let liber;
      if (optiuni && optiuni.pe_pagina) { liber = []; let pr = true; for (const b of L) { if (!pr) doc.addPage(); pr = false; let w = LW, h = b.i.h / b.i.w * w; if (h > UTIL) { w = w * UTIL / h; h = UTIL; } doc.addImage(b.i.url, "JPEG", (A4.w - w) / 2, A4.m, w, h, undefined, "FAST"); liber.push(UTIL - h); } }
      else { const P = Pagini(doc); P.bloc(L); liber = P.liber; }
      /* codul QR al documentului merge pe ultima pagină, unde e loc; fără o pagină doar pentru el */
      if (!(optiuni && optiuni.pe_pagina)) { const n = doc.internal.getNumberOfPages(); doc.setPage(n); if (liber[n - 1] >= QR_LOC) qrDesen(doc, A4.w - A4.m - QR_MM, A4.h - A4.m - QR_MM - 4, QR_MM); else { const y = A4.h - A4.m - 6; doc.setFontSize(7); doc.setTextColor(40); doc.text("raport interactiv: " + LINK, A4.w - A4.m, y, { align: "right" }); } window.CC_PDF.qr = [n]; }
      else window.CC_PDF.qr = [];
      await salveaza(doc, titlu.replace(/\s+/g, "-").toLowerCase() + ".pdf");
    } catch (e) { console.warn("pdf", e); ecran("PDF-ul nu s-a putut face acum: " + e.message); setTimeout(inchideE, 4000); }
    finally { gaz.remove(); sect.forEach(x => x.classList.remove("ac-lung")); mod(false); }
  }
  window.CC_PDF = { capitole, din };
})();
