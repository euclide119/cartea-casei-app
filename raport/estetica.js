/* Raport _ Cartea Casei - stratul vizual (Manu, 23.10.2026): prioritate pe harti, grafice, desene si poze; text aerisit.
   1. Antetul fiecarui capitol: ilustratie (ilustratii.js) sau poza reala (p/<id>/poze.json, Wikimedia Commons, cu autor si licenta), titlu mai mare, eticheta verdictului.
   2. Prima pagina: cele 6 chenare cu cifra mare, pictograma capitolului si titlu scurt; fara text marunt.
   3. "Concluzii pe elemente": in Simplu doar numele + nivelul colorat, pe doua coloane.
   4. Insorire: orele de noapte unite intr-o singura banda, cu eticheta.
   5. Simplu = esentialul: antet, verdict, 4 chenare, o harta sau o poza, desenul retragerilor. Complet = tot.
   Nu modifica datele; doar aseaza. Se leaga de index.html prin D, renderSun, sectiunile #<capitol>, .wrap. */
(function () {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const $ = s => document.querySelector(s);
  const KICK = { inundatii: "Riscuri \u00b7 ap\u0103", seismic: "Riscuri \u00b7 cutremur", alunecari: "Riscuri \u00b7 teren", zgomot: "Riscuri \u00b7 zgomot", aer: "Riscuri \u00b7 aer",
    urbanism: "Construire \u00b7 ce e voie", autorizatii: "Construire \u00b7 ce se face \u00een jur", zonare: "Construire \u00b7 cartierul", monumente: "Patrimoniu", arii_protejate: "Natur\u0103",
    facilitati: "Via\u021ba \u00een zon\u0103", transport: "Via\u021ba \u00een zon\u0103 \u00b7 drumuri", scoli: "Via\u021ba \u00een zon\u0103 \u00b7 \u0219coli", populatie: "Via\u021ba \u00een zon\u0103 \u00b7 oameni",
    insorire: "Soare", pv: "Soare \u00b7 energie", costuri: "Bani", negociere: "Bani \u00b7 negociere", evaluare: "Bani \u00b7 valoare", cronologie: "Bani \u00b7 \u00een timp", surse: "Despre raport", stare: "Despre raport" };
  let POZE = null, pozeId = null;

  function css() {
    if ($("#es-css")) return;
    const s = document.createElement("style"); s.id = "es-css";
    s.textContent = `
/* ---- antetul capitolului ---- */
.hero{display:grid;grid-template-columns:168px minmax(0,1fr);gap:18px;align-items:center;padding:14px 18px 14px 14px;border-radius:16px;background:color-mix(in srgb,var(--c) 7%,var(--panel));border:1px solid color-mix(in srgb,var(--c) 22%,var(--line));margin:0 0 4px;break-inside:avoid}
.hero.big{grid-template-columns:260px minmax(0,1fr)}
.hero .ilu{width:100%;border-radius:12px;box-shadow:0 6px 18px -8px color-mix(in srgb,var(--c) 45%,transparent)}
.hero .hero-ph{position:relative;border-radius:12px;overflow:hidden;aspect-ratio:10/7;background:#222}
.hero .hero-ph img{width:100%;height:100%;object-fit:cover;display:block}
.hero .hero-gen{background:transparent}
.hero .hero-ph small{position:absolute;left:0;right:0;bottom:0;padding:3px 7px;font:10px/1.2 var(--mono);color:#fff;background:linear-gradient(transparent,rgba(0,0,0,.65));text-align:left}
.hero-t{display:flex;flex-direction:column;gap:6px;min-width:0}
.hero-k{font:700 11px/1 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--c)}
.hero h2{font:800 clamp(22px,2.6vw,28px)/1.1 var(--font);letter-spacing:-.02em;margin:0}
.hero-v{display:inline-flex;align-items:center;gap:8px;font:600 13.5px var(--font);color:var(--fg)}
.hero-v i{font:700 10.5px var(--mono);letter-spacing:.06em;text-transform:uppercase;font-style:normal;padding:3px 9px;border-radius:99px;color:#fff;background:var(--vc)}
.hero-l{font:14px/1.45 var(--font);color:var(--muted);margin:0;max-width:60ch}
.hero-c{font:11px/1.3 var(--mono);color:var(--muted)}.hero-c a{color:var(--muted)}
/* banner mare cu poza capitolului: banda, titlul si panoul sunt in standard.css (PC31, E2) */
.hg-ov .hero-k{color:#ffd9a0}
.hg-cr{position:absolute;top:8px;right:8px;max-width:60%;font:10.5px/1.3 var(--mono);color:#fff;background:rgba(0,0,0,.5);padding:3px 8px;border-radius:6px}.hg-cr a{color:#fff}
.hg-b{padding:12px 18px 14px;display:flex;flex-direction:column;gap:10px}
.hg-b:empty{display:none}
.hg-th{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.hg-th button{position:relative;padding:0;border:2px solid transparent;border-radius:8px;overflow:hidden;width:96px;height:64px;cursor:pointer;background:#ddd}
.hg-th button.on{border-color:var(--c)}.hg-th img{width:100%;height:100%;object-fit:cover;display:block}
.hg-th i{position:absolute;left:3px;top:3px;font:700 10px var(--mono);font-style:normal;color:#fff;background:rgba(0,0,0,.6);padding:1px 5px;border-radius:99px}
.hg-h{font-size:11.5px;color:var(--muted)}
section .lead-dup{display:none}
.blk-ph{margin:-4px -4px 10px;border-radius:10px;overflow:hidden;aspect-ratio:21/6;max-height:240px}.blk-ph img{width:100%;height:100%;object-fit:cover;display:block}
section>.vh>h2.h2-orig,section>div>h2.h2-orig{display:none}
section>.vh{margin-top:-2px}
section>.verd.verd-dup{display:none}
@media (max-width:640px){.hero,.hero.big{grid-template-columns:1fr;gap:10px}.hero .ilu{max-width:220px;margin:0 auto}.hero h2{font-size:22px}}
/* ---- prima pagina: cifre mari, pictograme, text scurt ---- */
.pp-g{grid-template-columns:repeat(auto-fill,minmax(236px,1fr))!important;gap:12px!important}
.pp-t{display:grid!important;grid-template-columns:58px minmax(0,1fr);grid-template-areas:"i k" "i n" "h h" "b b";column-gap:12px;row-gap:3px;padding:14px 16px 12px!important;border-top-width:6px!important;align-items:center}
.pp-t .pp-i{grid-area:i;width:58px;height:58px;border-radius:12px;overflow:hidden;align-self:start}
.pp-t .pp-i svg{width:58px;height:auto;display:block}
.pp-t .pp-k{grid-area:k;font-size:12px!important;letter-spacing:.08em!important}
.pp-t .pp-n{grid-area:n;font-size:32px!important;line-height:1!important}
.pp-t .pp-h{grid-area:h;font-size:14.5px!important;line-height:1.3!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-top:4px}
.pp-t .vb{grid-area:b}
.pp-h1{font-size:clamp(28px,4.4vw,44px)!important;max-width:22ch!important}
.pp-kick{font-size:12px!important}
.pp-sub{font-size:15px!important}
body.simplu .pp-t .vb{display:none!important}
body.simplu .pp-t .pp-h{-webkit-line-clamp:2}
/* ---- concluzii pe elemente: compact in Simplu ---- */
body.simplu #concluzii .cc-sec:not(.cc-urb){display:grid!important;grid-template-columns:1fr 1fr;gap:4px 14px}
body.simplu #concluzii .cc-sec:not(.cc-urb)>h3,body.simplu #concluzii .cc-sec:not(.cc-urb)>p{grid-column:1/-1}
body.simplu #concluzii .cc-r{grid-template-columns:minmax(0,1fr) auto!important;padding:5px 0;border-top:1px solid var(--line)!important}
body.simplu #concluzii .cc-r span.ct{display:none}
body.simplu #concluzii .cc-lg{display:none}
/* ---- titluri si aer ---- */
section>.vh h2,section h2{letter-spacing:-.015em}
section{gap:18px}
.ch-t,.hm-t{font-size:14.5px}
/* ---- Simplu: esentialul ---- */
body.simplu section .lead-jos{display:none!important}
body.simplu section .hm-ch,body.simplu section .hm-src{display:none!important}
body.simplu section .hero-l{display:none}
body.simplu section>.cards>.card:nth-child(n+5){display:none!important}
/* ---- insorire: noaptea unita ---- */
#hours{position:relative}
#hours .seg.nz{border-radius:0}#hours .seg.nz0{border-radius:4px 0 0 4px}#hours .seg.nz1{border-radius:0 4px 4px 0}
#hours .seg.nz span,#hours .seg.nz small{visibility:hidden}
.nlab{position:absolute;top:50%;transform:translate(-50%,-50%);font:600 11px var(--mono);color:#cfd6ff;white-space:nowrap;pointer-events:none;letter-spacing:.02em}
@media print{.hero{box-shadow:none}.pp-g{grid-template-columns:repeat(3,1fr)!important}}`;
    document.head.appendChild(s);
  }

  /* ---------- poze reale (poze.py -> p/<id>/poze.json) ---------- */
  /* ---------- imaginile Gemini (ilu/index.json): toate variantele pe capitol, una principala aleasa de Manu ---------- */
  let ILUX = null, PRINC = {}, dbE = null;
  try { PRINC = JSON.parse(localStorage.getItem("ric-ilu-princ") || "{}") || {}; } catch (e) {}
  async function incarcaIlu() {
    if (ILUX !== null) return;
    ILUX = {};
    try { const r = await fetch("ilu/index.json", { cache: "no-cache" }); if (r.ok) ILUX = await r.json(); } catch (e) { ILUX = {}; }
    try { dbE = window.claude ? await window.claude.use("db") : null; } catch (e) { dbE = null; }
    if (dbE) { try { const sn = await dbE.doc("setari/ilu").get(); if (sn && sn.exists) PRINC = Object.assign({}, PRINC, (sn.data() || {}).princ || {}); } catch (e) {} }
    document.querySelectorAll("section .hero").forEach(h => h.remove()); toate();
  }
  function salveazaPrinc() {
    try { localStorage.setItem("ric-ilu-princ", JSON.stringify(PRINC)); } catch (e) {}
    if (dbE) { try { dbE.doc("setari/ilu").set({ princ: PRINC, actualizat: Date.now() }); } catch (e) {} }
  }
  /* variantele unui capitol: imaginile generate + pozele reale din zona (poze.json), principala prima */
  function variante(k) {
    const L = ((ILUX && ILUX[k]) || []).map(x => ({ f: "ilu/" + x.f, t: "ilu/" + x.t, real: false, titlu: "" }));
    const Pz = (POZE && POZE[k]) || [];
    Pz.forEach(p => L.push({ f: `p/${D.id}/${p.fisier}`, t: `p/${D.id}/${p.fisier}`, real: true, titlu: p.titlu || "", autor: p.autor, licenta: p.licenta, pagina: p.pagina }));
    const pr = (window.RIC_ASPECT && RIC_ASPECT.imagine(k)) || PRINC[k];
    if (pr) { const ff = /^(p\/|ilu\/)/.test(pr) ? pr : "ilu/" + pr; let i = L.findIndex(x => x.f === ff);
      if (i < 0 && !/^p\//.test(ff)) { L.unshift({ f: ff, t: ff.replace(/\.webp$/, "_t.webp"), real: false, titlu: "" }); }
      else if (i > 0) L.unshift(L.splice(i, 1)[0]); }
    return L;
  }
  function eroareImg(img) { img.closest(".hg-ph")?.classList.add("fara"); }

  async function incarcaPoze() {
    const id = (typeof D !== "undefined" && D) ? D.id : null; if (!id || id === pozeId) return;
    pozeId = id; POZE = null;
    try { const r = await fetch(`p/${id}/poze.json`, { cache: "no-cache" }); if (r.ok) POZE = await r.json(); } catch (e) { POZE = null; }
    document.querySelectorAll("section .hero").forEach(h => h.remove());   // se refac cu poza
    toate();
  }
  function credit(k) {
    const L = POZE && POZE[k]; if (!L || !L.length) return "";
    const p = L[0], cr = [p.autor ? "foto " + p.autor : "", p.licenta].filter(Boolean).join(", ");
    return `<span class="hero-c">${esc(p.titlu || "")}${cr ? " \u00b7 " + esc(cr) : ""}${p.pagina ? ` \u00b7 <a href="${esc(p.pagina)}" target="_blank" rel="noopener">Wikimedia Commons</a>` : ""}</span>`;
  }
  function poza(k) {
    const L = POZE && POZE[k]; if (!L || !L.length) return "";
    const p = L[0];
    return `<figure class="hero-ph"><img src="p/${esc(D.id)}/${esc(p.fisier)}" alt="${esc(p.titlu || "")}" loading="lazy" title="${esc([p.titlu, p.autor, p.licenta].filter(Boolean).join(" \u00b7 "))}"></figure>`;
  }


  /* imaginile generate (prompturi Gemini, documente/analize/prompturi_gemini_imagini_raport.md) stau in ilu/<capitol>.webp;
     daca lipsesc, ramane desenul vectorial din ilustratii.js */
  const ILU_OK = {};
  function genIlu(k) {
    if (ILU_OK[k] === false) return ILU.desen(k);
    return `<figure class="hero-ph hero-gen"><img src="ilu/${k}.webp" alt="" onerror="this.closest('figure').outerHTML=window.ILU.desen('${k}');window.__iluNo&&window.__iluNo('${k}')"></figure>`;
  }
  window.__iluNo = k => { ILU_OK[k] = false; };
  /* ---------- antetul unui capitol ---------- */
  const VL = { g: ["arat\u0103 bine", "#1f8a4c"], o: ["de verificat", "#c86a0a"], r: ["nu arat\u0103 bine", "#c0392b"], i: ["informativ", "#2c5c9c"] };   // culorile din standard.css
  function antet(sec) {
    const k = sec.id; if (!window.ILU || !ILU.are(k)) return;
    const ex = sec.querySelector(":scope > .hero");
    const V = (typeof D !== "undefined" && D) ? variante(k) : [];
    if (ex && V.length && !ex.classList.contains("hg")) ex.remove();
    else if (ex && V.length && ex.dataset.pr !== V[0].f + "|" + V.length) ex.remove();
    if (sec.querySelector(":scope > .hero") && ex && ex.isConnected) { const cap = sec.querySelector(":scope > .rc-cap"), vrut = cap ? cap.nextElementSibling : sec.firstElementChild;   // antetul sta primul (dupa eticheta capitolului)
      if (vrut !== ex) (cap ? cap : sec).insertAdjacentElement(cap ? "afterend" : "afterbegin", ex); return; }
    const h2 = sec.querySelector(":scope > .vh > h2, :scope > div > h2, :scope > h2"); if (!h2) return;
    h2.classList.add("h2-orig");
    const verd = sec.querySelector(":scope > .verd"), vk = verd ? (verd.className.match(/\b([gori])\b/) || [])[1] : null;
    const lead = sec.querySelector(":scope > div > p.lead, :scope > p.lead:not(.lead-jos)");
    const c = ILU.COL[k] || "#888", big = k === "pv" || k === "insorire" || k === "negociere";
    if (V.length) {
      const m = V[0], cr = m.real ? [m.autor ? "foto " + m.autor : "", m.licenta].filter(Boolean).join(", ") : "";
      const el = document.createElement("div"); el.className = "hero hg"; el.style.setProperty("--c", c); el.dataset.pr = m.f + "|" + V.length;
      el.innerHTML = `<figure class="hg-ph"><img src="${esc(m.f)}" alt="" loading="lazy" onerror="this.closest('figure').classList.add('fara')"><figcaption class="hg-ov"><h2>${esc(window.mic ? mic(h2.textContent) : h2.textContent)}</h2></figcaption>${m.real ? `<small class="hg-cr">${esc(m.titlu)}${cr ? " \u00b7 " + esc(cr) : ""}${m.pagina ? ` \u00b7 <a href="${esc(m.pagina)}" target="_blank" rel="noopener">Wikimedia Commons</a>` : ""}</small>` : ""}</figure>` +
        `<div class="hg-b">${vk && VL[vk] ? `<span class="hero-v" style="--vc:${VL[vk][1]}"><i>${VL[vk][0]}</i>${esc(verd.querySelector("span")?.textContent || "")}</span>` : ""}${lead && !vk ? `<p class="hero-l">${esc(lead.textContent)}</p>` : ""}` +
        (V.length > 1 ? `<div class="hg-th" role="group" aria-label="Alege poza principal\u0103">${V.map((x, i) => `<button type="button" data-f="${esc(x.f)}" class="${i === 0 ? "on" : ""}" title="${i === 0 ? "Poz\u0103 principal\u0103" : "Folose\u0219te ca principal\u0103"}${x.real ? " \u00b7 foto real\u0103 din zon\u0103" : ""}"><img src="${esc(x.t)}" alt="" loading="lazy">${i === 0 ? "<i>\u2605</i>" : x.real ? "<i>foto</i>" : ""}</button>`).join("")}<span class="hg-h">alege poza principal\u0103; toate pozele sunt \u00een \u201ealege pozele\u201d din meniul instrumente.</span></div>` : "") + `</div>`;
      el.querySelectorAll(".hg-th button").forEach(b => b.onclick = () => { const v = b.dataset.f.replace(/^ilu\//, ""); if (window.RIC_ASPECT) RIC_ASPECT.set(k, { img: v }); else { PRINC[k] = v; salveazaPrinc(); el.remove(); antet(sec); } });
      if (verd && vk) verd.classList.add("verd-dup");
      if (lead && !vk) lead.classList.add("lead-dup");
      const cap0 = sec.querySelector(":scope > .rc-cap");
      (cap0 ? cap0 : sec).insertAdjacentElement(cap0 ? "afterend" : "afterbegin", el);
      return;
    }
    const el = document.createElement("div"); el.className = "hero" + (big ? " big" : ""); el.style.setProperty("--c", c);
    el.innerHTML = (poza(k) || genIlu(k)) + `<div class="hero-t"><h2>${esc(window.mic ? mic(h2.textContent) : h2.textContent)}</h2>` +
      (vk && VL[vk] ? `<span class="hero-v" style="--vc:${VL[vk][1]}"><i>${VL[vk][0]}</i>${esc(verd.querySelector("span")?.textContent || "")}</span>` : "") +
      (lead && !vk ? `<p class="hero-l">${esc(lead.textContent)}</p>` : "") + credit(k) + `</div>`;
    if (verd && vk) verd.classList.add("verd-dup");
    const cap = sec.querySelector(":scope > .rc-cap");
    (cap ? cap : sec).insertAdjacentElement(cap ? "afterend" : "afterbegin", el);
  }

  /* ---------- prima pagina: pictograme in chenare ---------- */
  function prima() {
    const g = $("#prima .pp-g"); if (!g || !window.ILU) return;
    g.querySelectorAll(".pp-t").forEach(t => { if (t.querySelector(".pp-i")) return; const k = t.dataset.go; if (!ILU.are(k)) return;
      const i = document.createElement("span"); i.className = "pp-i"; i.innerHTML = ILU.desen(k); t.prepend(i); });
  }

  /* ---------- concluzii: marcheaza blocul de urbanism (ramane intreg) ---------- */
  function concluzii() { document.querySelectorAll("#concluzii .cc-sec").forEach(s => { if (/urbanism/i.test(s.querySelector("h3")?.textContent || "")) s.classList.add("cc-urb"); }); }

  /* ---------- insorire: orele de noapte unite ---------- */
  function noapte() {
    const hb = $("#hours"); if (!hb) return;
    hb.querySelectorAll(".nlab").forEach(e => e.remove());
    const segs = [...hb.querySelectorAll(".seg")]; if (segs.length !== 24) return;
    const isN = s => /rgb\(30,\s*40,\s*80\)|#1e2850/i.test(s.style.background || s.style.backgroundColor);
    segs.forEach(s => s.classList.remove("nz", "nz0", "nz1"));
    let i = 0; const runs = [];
    while (i < 24) { if (!isN(segs[i])) { i++; continue; } let j = i; while (j < 24 && isN(segs[j])) j++; runs.push([i, j - 1]); i = j; }
    runs.forEach(([a, b]) => { if (b - a < 1) return; for (let k = a; k <= b; k++) { segs[k].classList.add("nz"); if (k === a) segs[k].classList.add("nz0"); if (k === b) segs[k].classList.add("nz1"); }
      const lab = document.createElement("span"); lab.className = "nlab"; lab.textContent = `\u263e noapte ${String(a).padStart(2, "0")}\u2013${String(b + 1).padStart(2, "0")}`;
      const r0 = segs[a].getBoundingClientRect(), r1 = segs[b].getBoundingClientRect(), rb = hb.getBoundingClientRect();
      lab.style.left = ((r0.left + r1.right) / 2 - rb.left) + "px"; hb.appendChild(lab); });
  }
  if (typeof window.renderSun === "function" && !window.__esSun) { window.__esSun = true; const o = window.renderSun; window.renderSun = function () { o.apply(this, arguments); noapte(); }; }

  /* ---------- insorire: soarele 3D peste desenul original (sfera cu gradient, halou, raze) ---------- */
  function soare3d() {
    try {
      const cv = document.getElementById("c"); if (!cv || typeof sunAt !== "function" || typeof D === "undefined" || !D) return;
      const s = sunAt(month, hour * 60); if (s.alt <= 0) return;
      const Sz = cv.width, cx = Sz / 2, cy = Sz / 2, Rp = Sz * .42, r = Rp * (1 - Math.max(s.alt, 0) / (Math.PI / 2));
      const x = cx + Math.sin(s.az) * r, y = cy - Math.cos(s.az) * r, ctx = cv.getContext("2d"), R = Sz / 44;
      ctx.save();
      const g0 = ctx.createRadialGradient(x, y, R * .6, x, y, R * 4); g0.addColorStop(0, "rgba(255,230,140,.55)"); g0.addColorStop(.5, "rgba(255,200,60,.18)"); g0.addColorStop(1, "rgba(255,190,40,0)");
      ctx.fillStyle = g0; ctx.beginPath(); ctx.arc(x, y, R * 4, 0, 2 * Math.PI); ctx.fill();
      ctx.strokeStyle = "rgba(255,225,120,.55)"; ctx.lineWidth = Math.max(1, Sz / 500);
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * R * 1.35, y + Math.sin(a) * R * 1.35); ctx.lineTo(x + Math.cos(a) * R * (i % 2 ? 1.9 : 2.3), y + Math.sin(a) * R * (i % 2 ? 1.9 : 2.3)); ctx.stroke(); }
      const g1 = ctx.createRadialGradient(x - R * .35, y - R * .4, R * .1, x, y, R); g1.addColorStop(0, "#fffbe0"); g1.addColorStop(.45, "#ffd84d"); g1.addColorStop(1, "#e08a00");
      ctx.fillStyle = g1; ctx.beginPath(); ctx.arc(x, y, R, 0, 2 * Math.PI); ctx.fill();
      ctx.strokeStyle = "rgba(160,90,0,.6)"; ctx.lineWidth = Math.max(1, Sz / 600); ctx.stroke();
      ctx.restore();
    } catch (e) {}
  }
  if (typeof window.draw === "function" && !window.__esDraw) { window.__esDraw = true; const o = window.draw; window.draw = function () { o.apply(this, arguments); soare3d(); }; }

  function blocuri() {
    [["retrageri", "retrageri"], ["urbis", "urbis"]].forEach(([id, k]) => { const b = document.getElementById(id); if (!b || b.querySelector(":scope > .blk-ph") || !ILUX || !ILUX[k]) return;
      const x = (variante(k)[0]); if (!x) return;
      const f = document.createElement("figure"); f.className = "blk-ph"; f.innerHTML = `<img src="${esc(x.f)}" alt="" loading="lazy" onerror="this.closest('figure').remove()">`; b.insertBefore(f, b.firstChild.nextSibling ? b.firstChild : null); b.insertBefore(f, b.firstChild); });
  }
  window.addEventListener("ric-aspect", e => { const d = e.detail || {}; if (!d.img) return; const sec = document.getElementById(d.k); const h = sec && sec.querySelector(":scope > .hero"); if (h) h.remove(); toate(); });
  window.RIC_ASPECT_VARIANTA = k => { const v = (typeof D !== "undefined" && D) ? variante(k) : []; return v[0] ? v[0].f.replace(/^ilu\//, "") : ""; };
  function toate() {
    document.querySelectorAll(".wrap > section[id]").forEach(antet);
    blocuri();
    prima(); concluzii(); noapte();
  }
  let tmr = null;
  const obs = new MutationObserver(() => { clearTimeout(tmr); tmr = setTimeout(() => { incarcaPoze(); toate(); }, 120); });
  function porneste() {
    css(); toate(); incarcaPoze(); incarcaIlu();
    document.querySelectorAll(".wrap > section[id], #prima, #concluzii").forEach(s => obs.observe(s, { childList: true }));
    setInterval(() => { incarcaPoze(); toate(); }, 1500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", porneste); else porneste();
  window.RIC_ESTETICA = { toate, noapte };
})();
