/* Raport _ Cartea Casei - planul \u201eraport excelent\u201d (PC31), etapele E3 + E5 + rezumat + \u201ece mai verific\u0103m\u201d (24.10.2026).
   E3 contrast m\u0103surat: sub titlul fiec\u0103rei poze (antet de capitol, cartona\u0219ele paginii principale) se m\u0103soar\u0103 luminozitatea real\u0103 a zonei
      (canvas, 20 x 20 e\u0219antioane, decupajul \u201ecover\u201d cu punctul focal); umbra se \u00eendese\u0219te \u00een trepte (35 \u2192 55 \u2192 70 \u2192 82 %) p\u00e2n\u0103 la contrast 4,5:1 cu textul alb.
   rezumat: la \u00eenceputul \u201erezumat \u0219i concluzii\u201d, 5 concluzii mari, c\u00e2te una pe grup de capitole, \u00een culoarea celui mai slab verdict din grup.
   ce mai verific\u0103m: capitolele informative f\u0103r\u0103 date pentru loca\u021bie (schema: la_lipsa = dispare) nu dispar f\u0103r\u0103 urm\u0103: apar \u00eentr-un singur bloc scurt.
   E5 pagina final\u0103: nota juridic\u0103 (o dat\u0103, deja \u00een subsol), creditele obligatorii pentru fundalurile folosite efectiv \u0219i \u201ece lipse\u0219te\u201d; pe ecran str\u00e2nse, la tipar \u00eentregi.
   E4: clasele de a\u0219ezare la tipar din p/<id>/layout.json (paginator.py): normal / compact / larg pe capitol. */
(function () {
  "use strict";
  const $ = s => document.querySelector(s), $$ = (r, s) => [...(s ? r : document).querySelectorAll(s || r)];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const mic = s => (window.mic ? window.mic(s) : String(s ?? "").toLowerCase());
  const gD = () => { try { return D; } catch (e) { return null; } };

  const st = document.createElement("style"); st.id = "ex-css";
  st.textContent = `
.hero.hx:not(.mv) .hg-ov{background:radial-gradient(130% 150% at 0 0,rgba(8,12,20,var(--ov-a,.5)) 0%,rgba(8,12,20,calc(var(--ov-a,.5)*.5)) 48%,transparent 74%)!important}
.gn-h{background:radial-gradient(130% 150% at 0 0,rgba(8,12,20,var(--ov-a,.55)),rgba(8,12,20,calc(var(--ov-a,.55)*.4)) 50%,transparent 72%)!important}
#ex-5{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin:4px 0 6px}
#ex-5 .e5{border-radius:14px;padding:14px 14px 12px;background:color-mix(in srgb,var(--vc) 9%,var(--panel));border:1px solid color-mix(in srgb,var(--vc) 35%,#c9ced8);border-top:5px solid var(--vc);display:flex;flex-direction:column;gap:6px;break-inside:avoid}
#ex-5 .e5 em{font-style:normal;font:700 11.5px var(--font);letter-spacing:.03em;color:var(--vc)}
#ex-5 .e5 b{font:700 17px/1.25 "Fraunces",Georgia,serif;color:var(--fg)}
#ex-5 .e5 span{font:12.5px/1.45 var(--font);color:var(--muted)}
#ex-cv{border:1px solid #c9ced8;border-radius:14px;padding:14px 16px;background:var(--panel);display:flex;flex-direction:column;gap:10px;break-inside:avoid}
#ex-cv h3{margin:0;font:700 18px "Fraunces",Georgia,serif}
#ex-cv .g{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
#ex-cv .c{display:grid;grid-template-columns:72px minmax(0,1fr);gap:10px;align-items:start}
#ex-cv .c img{width:72px;height:54px;object-fit:cover;border-radius:8px}
#ex-cv .c b{display:block;font:700 13.5px var(--font)}#ex-cv .c span{font:12.5px/1.45 var(--font);color:var(--muted)}
#ex-fin{margin-top:10px;border-top:1px solid var(--line);padding-top:10px}
#ex-fin>summary{cursor:pointer;font:600 13px var(--font);color:var(--muted)}
#ex-fin h4{margin:10px 0 4px;font:700 13px var(--font)}
#ex-fin ul{margin:0;padding-left:18px;font:12px/1.5 var(--font);color:var(--muted)}
@media (max-width:900px){#ex-5{grid-template-columns:1fr 1fr}}
@media (max-width:600px){#ex-5{grid-template-columns:1fr}}
.ex-mk{display:block;height:0;overflow:hidden;font-size:1px;line-height:1px;color:#fff}
@media print{
 .wrap>section[id]:not(:first-of-type){break-before:page}
 #cl-final{break-before:page}
 .ex-mk{display:block;height:1px;overflow:visible;font-size:2px;color:#fefefe}
 h3,h4,.ch-t,.hm-t,.gn-gr,.vh,.rc-cap,.ev-sec>h3,.ng-sec>h3{break-after:avoid;page-break-after:avoid}
 .hm,.pz,.ch,.charts>*,.cards,.ev-sec,.ng-sec,#uc-ind .uc-c,#retrageri,#urbis,#evolutie>*,.tpan,.cn-l,.cn-k,table tr{break-inside:avoid}
 .hm-box{max-height:118mm;overflow:hidden}.hm-c{max-height:118mm;width:auto!important;max-width:100%}
 .pz svg,.pzmap,.tpan svg{max-height:120mm;width:auto;max-width:100%}
 #sumhart .hm-box,#sumauto svg{max-height:105mm}
 .ev-sec table tr:nth-child(n+10),.scroll table tr:nth-child(n+12){display:none}
 #ex-5{grid-template-columns:repeat(auto-fit,minmax(0,1fr))!important}
 #ex-fin{break-before:page}#ex-fin>summary{display:none}#ex-fin[open]>*,#ex-fin>*{display:block}
 #ex-5 .e5 b{font-size:11pt}#ex-5 .e5 span{font-size:8.5pt}
 section.ex-compact .cards,section.ex-compact .charts{gap:4px!important}
 .wrap>section.ex-lipit{break-before:auto!important;margin-top:8mm}
 section.ex-compact>.ex,section.ex-compact details,section.ex-compact .scroll~.scroll,section.ex-compact .ex.warn{display:none!important}
 section.ex-compact .scroll table tr:nth-child(n+6){display:none}
 section.ex-compact img:not(.hg-ph img),section.ex-compact svg{max-height:85mm}
 section.ex-compact .hm-box,section.ex-compact .hm-c{max-height:85mm!important}
 #rezumat.ex-compact #ter .tpan:not(:first-child),#rezumat.ex-compact #ter>.note{display:none!important}
 #rezumat.ex-compact #sumhart .hm-box,#rezumat.ex-compact #sumauto svg{max-height:80mm!important}
 #evaluare.ex-compact .ev-sec:nth-of-type(n+5){display:none!important}
 #negociere.ex-compact .ng-sec:not(.keep){display:none!important}
 section.ex-compact .lead,section.ex-compact .lead-jos,section.ex-compact .hx-b .hero-l{display:none!important}
 section.ex-compact .scroll table tr:nth-child(n+8){display:none}
 section.ex-compact .hm-box,section.ex-compact .pzmap,section.ex-compact .pz svg{max-height:95mm;overflow:hidden}
 section.ex-compact .charts{display:grid!important;grid-template-columns:1fr 1fr!important}
 section.ex-larg .hm-box,section.ex-larg .pz svg{max-height:none}
 section.ex-larg .cards{grid-template-columns:repeat(4,1fr)!important}
}`;
  document.head.appendChild(st);

  /* ---------- E3: contrast masurat ---------- */
  const lin = c => { c /= 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); };
  const cv = document.createElement("canvas"); cv.width = cv.height = 20; const cx = cv.getContext("2d", { willReadFrequently: true });
  function luminanta(img, box, zona) {   // box = dreptunghiul afisat al imaginii; zona = dreptunghiul de sub text, in aceleasi coordonate
    const iw = img.naturalWidth, ih = img.naturalHeight; if (!iw || !ih || !box.width) return null;
    const cs = getComputedStyle(img), op = (cs.objectPosition || "50% 50%").split(" ").map(v => parseFloat(v) / 100), fx = isNaN(op[0]) ? .5 : op[0], fy = isNaN(op[1]) ? .5 : op[1];
    const sc = Math.max(box.width / iw, box.height / ih), dw = iw * sc, dh = ih * sc, ox = (box.width - dw) * fx, oy = (box.height - dh) * fy;
    const sx = Math.max(0, (zona.x - ox) / sc), sy = Math.max(0, (zona.y - oy) / sc), sw = Math.min(iw - sx, zona.w / sc), sh = Math.min(ih - sy, zona.h / sc);
    if (sw <= 0 || sh <= 0) return null;
    try { cx.clearRect(0, 0, 20, 20); cx.drawImage(img, sx, sy, sw, sh, 0, 0, 20, 20); const d = cx.getImageData(0, 0, 20, 20).data; let L = 0;
      for (let i = 0; i < d.length; i += 4) L += .2126 * lin(d[i]) + .7152 * lin(d[i + 1]) + .0722 * lin(d[i + 2]);
      return Math.min(1, L / 400 * 1.12);   // 1,12: filtrul brightness(1.06) din standard.css
    } catch (e) { return null; }
  }
  const TREPTE = [.35, .55, .7, .82];
  function treapta(L) { if (L == null) return .55; for (const a of TREPTE) { const Lp = L * (1 - a); if (1.05 / (Lp + .05) >= 4.5) return a; } return TREPTE[TREPTE.length - 1]; }
  function contrast(img, txt, tinta) {
    if (!img || !txt || !tinta || (img.dataset.exC && tinta.dataset.exSrc === img.currentSrc)) return;
    if (!img.complete || !img.naturalWidth) { img.addEventListener("load", () => { delete img.dataset.exC; contrast(img, txt, tinta); }, { once: true }); return; }
    const b = img.getBoundingClientRect(), t = txt.getBoundingClientRect(); if (!b.width || !t.width) return;
    const z = { x: t.left - b.left - 8, y: t.top - b.top - 6, w: t.width + 16, h: t.height + 12 };
    const a = treapta(luminanta(img, b, z)); tinta.style.setProperty("--ov-a", a); img.dataset.exC = a; tinta.dataset.exSrc = img.currentSrc;
  }
  function contraste() {
    $$(".wrap > section > .hero.hx").forEach(H => contrast(H.querySelector(".hg-ph > img"), H.querySelector(".hg-ov h2"), H.querySelector(".hg-ov")));
    $$("#generic .gn-c").forEach(C => contrast(C.querySelector(".gn-i > img"), C.querySelector(".gn-h h2"), C.querySelector(".gn-h")));
  }

  /* ---------- rezumat: 5 concluzii pe grupuri ---------- */
  const GR = [["riscuri", "riscuri"], ["construire", "construire"], ["casa \u0219i actele", "casa \u0219i actele"], ["via\u021ba \u00een zon\u0103", "via\u021ba \u00een zon\u0103"], ["bani", "soare, bani \u0219i antecontract"]];
  const GRUP_DIN = g => /soare|antecontract/.test(g || "") ? "bani" : g;
  const RANG = { r: 3, o: 2, g: 1, i: 0 }, CUL = { r: "#c0392b", o: "#c86a0a", g: "#1f8a4c", i: "#2c5c9c" }, ETI = { r: "nu arat\u0103 bine", o: "de verificat", g: "arat\u0103 bine", i: "informativ" };
  function verdicte(Dd) {
    const V = window.VEC || [], H0 = (() => { try { return HR; } catch (e) { return null; } })(), out = {};
    V.forEach(v => { try { const X = v.k === "zonare" ? H0 : Dd[v.k]; if (!X) return; const c = v.def(v.k === "zonare" ? {} : X, H0); if (c && c.verd) out[v.k] = { cls: c.verd[0], txt: c.verd[1] }; } catch (e) {} });
    // capitolele fara intrare in VEC: verdictul din antet (hero), daca exista
    $$(".wrap > section[id] .hero-v i, .wrap > section[id] .hx-vd").forEach(i => { const s = i.closest("section"); if (!s || out[s.id]) return; const t = i.textContent.trim().toLowerCase();
      const k = Object.keys(ETI).find(x => ETI[x] === t); if (k) out[s.id] = { cls: k, txt: (s.querySelector(".hx-b .hero-v") || {}).textContent || "" }; });
    return out;
  }
  const titlu = id => { const c = ((window.RIC_SCHEMA || {}).capitole || []).find(x => x.id === id); return c ? (c.scurt || c.titlu) : id.replace(/_/g, " "); };
  const scurt = t => { t = String(t).replace(/\s+/g, " ").trim(); if (t.length <= 95) return t; return t.slice(0, 94).replace(/[\s,;:]+\S*$/, "") + "\u2026"; };
  const fr = x => { const t = mic(String(x.txt).split(/(?<=\.)\s/)[0]), n = titlu(x.k); return scurt(t.startsWith(n.split(" ")[0]) ? t : n + ": " + t); };
  function cinci(Dd) {
    const f = $("#cl-final"); if (!f || f.hidden) return;
    const VD = verdicte(Dd), sig = Dd.id + "|" + Object.entries(VD).map(([k, v]) => k + v.cls).sort().join(",");
    let b = $("#ex-5"); if (b && b.dataset.sig === sig) return;
    const G = {}; Object.entries(VD).forEach(([k, v]) => { const g = GRUP_DIN((window.RIC_GRUP || {})[k]); if (!g) return; (G[g] = G[g] || []).push(Object.assign({ k }, v)); });
    const html = GR.map(([g, nume]) => { const L = (G[g] || []).filter(x => x.cls !== "i"), toate = G[g] || [];
      if (!toate.length) return "";
      const rau = L.slice().sort((a, b) => RANG[b.cls] - RANG[a.cls]), w = rau[0] ? rau[0].cls : "i";
      const prob = rau.filter(x => x.cls === "r" || x.cls === "o").map(x => titlu(x.k));
      const fraza = w === "g" ? `nimic nu arat\u0103 r\u0103u la ${nume}.` : rau[0] ? fr(rau[0]) : `doar informativ la ${nume}.`;
      return `<div class="e5" style="--vc:${CUL[w]}"><em>${esc(nume)} \u00b7 ${ETI[w]}</em><b>${esc(fraza)}</b>${prob.length ? `<span>de verificat: ${esc(prob.slice(0, 4).join(", "))}</span>` : `<span>${toate.length} capitole verificate</span>`}</div>`; }).join("");
    if (!b) { b = document.createElement("div"); b.id = "ex-5"; const h = f.querySelector(":scope > h2"); h ? h.after(b) : f.prepend(b); }
    b.dataset.sig = sig; b.innerHTML = html;
  }

  /* ---------- ce mai verificam ---------- */
  const CUM = { internet: "re\u021belele de fibr\u0103 din zon\u0103 \u0219i acoperirea 4G / 5G a operatorilor, din h\u0103r\u021bile publice de acoperire.",
    criminalitate: "datele publice despre infrac\u021bionalitate, la nivel de ora\u0219 \u0219i jude\u021b, \u0219i iluminatul str\u0103zilor din jur.",
    energie: "anul construc\u021biei \u0219i certificatul energetic; c\u00e2nd lipse\u0219te, \u00eel face un auditor autorizat, prin colaboratorii no\u0219tri.",
    constructii_acte: "ce se vede din satelit pe parcel\u0103 fa\u021b\u0103 de ce apare \u00een cartea funciar\u0103; e nevoie de extrasul de carte funciar\u0103." };
  let IX = null; fetch("ilu/index.json").then(r => r.json()).then(j => IX = j).catch(() => {});
  const poza = (k, al) => { const a = window.RIC_ASPECT && (RIC_ASPECT.imagine(k) || (al && RIC_ASPECT.imagine(al))); if (a) return "ilu/" + String(a).replace(/^ilu\//, "");
    const o = IX && IX._ord && (IX._ord[k] || (al && IX._ord[al])); return o && o.ordine && o.ordine.length ? `ilu/g/${o.ordine[0]}_t.webp` : null; };
  function verificam(Dd) {
    const f = $("#cl-final"); if (!f || f.hidden || !window.RIC_SCHEMA) return;
    if ((Date.now() - (window.__sxT0 || 0)) < 7000) return;
    const S = window.RIC_STARE || {}, L = RIC_SCHEMA.capitole.filter(c => c.clasa === "informativ" && c.la_lipsa === "dispare" && S[c.id] && !S[c.id].are && CUM[c.id]);
    let b = $("#ex-cv"); const sig = Dd.id + "|" + L.map(c => c.id).join(",");
    if (b && b.dataset.sig === sig) return;
    if (!L.length) { b && b.remove(); return; }
    if (!b) { b = document.createElement("div"); b.id = "ex-cv"; f.appendChild(b); }
    b.dataset.sig = sig;
    b.innerHTML = `<h3>ce mai verific\u0103m pentru aceast\u0103 loca\u021bie</h3><div class="g">${L.map(c => { const p = poza(c.id, c.poza_alias);
      return `<div class="c">${p ? `<img src="${esc(p)}" alt="" loading="lazy">` : "<i></i>"}<div><b>${esc(c.titlu)}</b><span>${esc(CUM[c.id])}</span></div></div>`; }).join("")}</div>`;
  }

  /* ---------- E5: creditele si \u201ece lipseste\u201d (pagina finala) ---------- */
  const CRED = [
    [() => true, "date de hart\u0103 \u00a9 contributorii OpenStreetMap (ODbL)"],
    [d => !!d.inundatii || !!document.querySelector("#sumhart, .hm-c"), "imagini satelit: Esri World Imagery (Esri, Maxar / Vantor, Earthstar Geographics)"],
    [() => !!document.querySelector("#evolutie .ev-sat, #autorizatii .tpan"), "arhiva de imagini: Esri World Imagery Wayback"],
    [d => !!(d.arii_protejate && /voyager/.test(d.arii_protejate.fundal || "")), "fundal: \u00a9 CARTO (CARTO Voyager)"],
    [d => !!(d.monumente && /topo/.test(d.monumente.fundal || "")), "fundal: \u00a9 OpenTopoMap (CC-BY-SA), SRTM"],
    [() => !!document.querySelector("#teren3d canvas"), "relief: Terrain Tiles (Mapzen / AWS Open Data), SRTM, Copernicus DEM"],
    [d => !!d.alunecari, "relief \u0219i pante: Copernicus DEM (prin Open-Meteo, CC BY 4.0)"],
    [d => !!d.aer, "calitatea aerului: Copernicus Atmosphere Monitoring Service (prin Open-Meteo, CC BY 4.0)"],
    [d => !!d.pv, "energie solar\u0103: Global Solar Atlas (Solargis / Banca Mondial\u0103, CC BY 4.0)"],
    [d => !!d.inundatii, "h\u0103r\u021bile de hazard la inunda\u021bii: Administra\u021bia Na\u021bional\u0103 \u201eApele Rom\u00e2ne\u201d"],
    [d => !!d.populatie, "popula\u021bia: Institutul Na\u021bional de Statistic\u0103"],
    [d => !!(d.scoli && d.scoli.note && d.scoli.note.length), "rezultatele \u0219colilor: data.gov.ro (Ministerul Educa\u021biei)"],
    [() => !!document.getElementById("pret-piata"), "indicele pre\u021burilor locuin\u021belor: Eurostat"]
  ];
  function finala(Dd) {
    const ft = $("#rep-foot-p"); if (!ft) return;
    const S = window.RIC_STARE || {}, lipsa = ((window.RIC_SCHEMA || {}).capitole || []).filter(c => S[c.id] && (!S[c.id].are || S[c.id].stub)).map(c => c.titlu);
    const cr = CRED.filter(([f]) => { try { return f(Dd); } catch (e) { return false; } }).map(x => x[1]);
    const sig = Dd.id + "|" + cr.length + "|" + lipsa.join(",");
    let d = $("#ex-fin"); if (d && d.dataset.sig === sig) return;
    if (!d) { d = document.createElement("details"); d.id = "ex-fin"; ft.appendChild(d); }
    d.dataset.sig = sig;
    d.innerHTML = `<summary>credite pentru h\u0103r\u021bi \u0219i date \u00b7 ce lipse\u0219te pentru aceast\u0103 loca\u021bie</summary><h4>credite</h4><ul>${cr.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` +
      (lipsa.length ? `<h4>ce lipse\u0219te pentru aceast\u0103 loca\u021bie</h4><ul>${lipsa.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "");
  }
  addEventListener("beforeprint", () => { const d = $("#ex-fin"); if (d) d.open = true; });

  /* ---------- E4: modul de masurare pentru paginator.py (?pag=1&pres=normal|compact|larg) ---------- */
  const Q = new URLSearchParams(location.search), PAG = Q.get("pag") === "1", PRES = Q.get("pres");
  function marcaje() { if (!PAG) return; $$(".wrap > section[id], #cl-final, #rep-foot-p").forEach(s => { if (s.querySelector(":scope > .ex-mk")) return;
    const m = document.createElement("span"); m.className = "ex-mk"; m.textContent = "@@cap:" + s.id.replace(/-/g, "_") + "@@"; s.prepend(m); }); }
  /* ---------- E4: asezarea la tipar din layout.json ---------- */
  let LAY = null, layId = null;
  async function asezare(Dd) {
    if (layId !== Dd.id) { layId = Dd.id; LAY = null; try { const r = await fetch(`p/${Dd.id}/layout.json`, { cache: "no-cache" }); if (r.ok) LAY = await r.json(); } catch (e) {} }
    const C = (LAY && LAY.capitole) || {};
    $$(".wrap > section[id]").forEach(s => { const p = (PRES && PRES !== "auto" ? PRES : null) || (C[s.id] || {}).presetare || "normal";
      s.classList.toggle("ex-lipit", !(PRES && PRES !== "auto") && !!(C[s.id] || {}).lipit); s.classList.toggle("ex-compact", p === "compact"); s.classList.toggle("ex-larg", p === "larg"); });
  }

  function pas() { const Dd = gD(); try { contraste(); } catch (e) {} if (!Dd || document.body.classList.contains("generic")) return;
    try { cinci(Dd); verificam(Dd); finala(Dd); asezare(Dd); marcaje(); } catch (e) { console.warn("excelent", e); } }
  setInterval(pas, 1500); setTimeout(pas, 600);
  addEventListener("resize", () => { $$("img[data-ex-c]").forEach(i => delete i.dataset.exC); });
  window.RIC_EXCELENT = { contraste, treapta, luminanta };
})();
