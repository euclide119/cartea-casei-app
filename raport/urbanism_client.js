/* Raport _ Cartea Casei - urbanismul pentru client (Manu, 23.10.2026).
   - \u201ece po\u021bi construi aici\u201d: fiecare indicator \u00eentr-un chenar cu o pictogram\u0103 sub titlu, valoarea pe scurt \u0219i eticheta treptei
     (exact = PUG digital \u00b7 regulament = regulamentul PUG \u00b7 lege \u00b7 estimat \u00b7 lips\u0103); f\u0103r\u0103 surse, f\u0103r\u0103 HCL / HG, f\u0103r\u0103 note.
     Dac\u0103 avem valoarea exact\u0103 o spunem; dac\u0103 nu, spunem valoarea implicit\u0103 (PUG / lege), cea mai restrictiv\u0103.
   - datele PUG: un singur r\u00e2nd orizontal (localitate, an, valabilitate, suprafa\u021ba intravilanului, revizuire \u00een curs).
   - autoriza\u021biile \u0219i certificatele de pe strad\u0103 \u0219i parcelele PUZ sub 300 m apar o singur\u0103 dat\u0103, \u00een \u201ece se mi\u0219c\u0103 \u00een zon\u0103\u201d (grafic);
     acolo se adaug\u0103 \u0219i num\u0103rul de autoriza\u021bii de construire emise \u00een ultimele 12 luni \u00een UAT.
   Tabelul complet (cu surse \u0219i note) r\u0103m\u00e2ne pentru noi: se vede cu \u201earat\u0103 sursele (intern)\u201d. */
(function () {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = (v, d = 0) => Number(v).toLocaleString("ro-RO", { maximumFractionDigits: d });
  const mic = s => (window.mic ? window.mic(s) : String(s ?? "").toLowerCase());
  const TR = { 1: ["exact", "#1f8a4c"], 2: ["regulament", "#2c5c9c"], 3: ["lege", "#b58900"], 4: ["estimat", "#7b847f"], 0: ["lips\u0103", "#c0392b"] };
  const NUME = { pot: "procentul de ocupare a terenului (POT)", cut: "coeficientul de utilizare (CUT)", regim: "regimul de \u00een\u0103l\u021bime", aliniament: "retragerea fa\u021b\u0103 de strad\u0103",
    lateral: "retragerea fa\u021b\u0103 de vecini", posterior: "retragerea fa\u021b\u0103 de fundul parcelei", insorire: "\u00eensorirea \u0219i distan\u021ba \u00eentre cl\u0103diri", parcela: "frontul minim la strad\u0103",
    verde: "spa\u021biul verde", parcari: "locurile de parcare", acces: "accesul carosabil", lea: "zone de protec\u021bie (re\u021bele, drumuri)", aero: "servitu\u021bi aeronautice",
    monumente: "monumente \u0219i situri", risc: "zone de risc", pug: "valabilitatea PUG" };
  /* pictograme mici, linie simpla, 64 x 44 */
  const I = {
    pot: `<rect x="8" y="6" width="48" height="32" rx="2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 2"/><rect x="18" y="13" width="22" height="16" fill="currentColor" opacity=".55"/>`,
    cut: `<rect x="20" y="28" width="24" height="10" fill="currentColor" opacity=".35"/><rect x="20" y="18" width="24" height="10" fill="currentColor" opacity=".55"/><rect x="20" y="8" width="24" height="10" fill="currentColor" opacity=".8"/>`,
    regim: `<path d="M16 40V16l12-9 12 9v24z" fill="currentColor" opacity=".45"/><path d="M50 8v32M46 12l4-4 4 4M46 36l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6"/>`,
    aliniament: `<rect x="4" y="34" width="56" height="8" fill="currentColor" opacity=".25"/><rect x="22" y="8" width="20" height="14" fill="currentColor" opacity=".6"/><path d="M32 23v10M29 26l3-3 3 3M29 30l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
    lateral: `<path d="M6 6v34M58 6v34" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 2"/><rect x="22" y="12" width="20" height="20" fill="currentColor" opacity=".6"/><path d="M8 22h12M44 22h12" stroke="currentColor" stroke-width="1.5"/>`,
    posterior: `<path d="M6 6h52" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 2"/><rect x="22" y="20" width="20" height="18" fill="currentColor" opacity=".6"/><path d="M32 8v10" stroke="currentColor" stroke-width="1.5"/>`,
    insorire: `<circle cx="20" cy="14" r="6" fill="currentColor" opacity=".8"/><path d="M20 3v3M20 22v3M9 14h3M28 14h3" stroke="currentColor" stroke-width="1.5"/><rect x="36" y="18" width="18" height="22" fill="currentColor" opacity=".5"/><path d="M24 20l12 8" stroke="currentColor" stroke-dasharray="2 2"/>`,
    parcela: `<rect x="10" y="4" width="44" height="30" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 40h44M14 37l-4 3 4 3M50 37l4 3-4 3" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
    verde: `<circle cx="22" cy="18" r="10" fill="currentColor" opacity=".55"/><path d="M22 28v12" stroke="currentColor" stroke-width="2"/><circle cx="44" cy="22" r="7" fill="currentColor" opacity=".4"/><path d="M44 29v11" stroke="currentColor" stroke-width="2"/>`,
    parcari: `<rect x="18" y="6" width="28" height="32" rx="6" fill="currentColor" opacity=".7"/><text x="32" y="30" text-anchor="middle" font-size="22" font-weight="800" fill="#fff" font-family="sans-serif">P</text>`,
    acces: `<path d="M4 40L24 6h16l20 34z" fill="currentColor" opacity=".25"/><path d="M32 10v6M32 22v6M32 34v4" stroke="currentColor" stroke-width="2"/>`,
    lea: `<path d="M32 4l-10 36M32 4l10 36M24 30h16M26 20h12M18 12h28" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 14q14 6 14-2M46 12q0 8 14 2" fill="none" stroke="currentColor"/>`,
    aero: `<path d="M8 30l20-8 4-14q2-3 4 0l2 14 18 8-18 0-2 8 4 4h-12l4-4-2-8z" fill="currentColor" opacity=".65"/>`,
    monumente: `<path d="M12 14l20-9 20 9z" fill="currentColor" opacity=".7"/><path d="M17 16v18M27 16v18M37 16v18M47 16v18" stroke="currentColor" stroke-width="3"/><rect x="10" y="35" width="44" height="5" fill="currentColor" opacity=".7"/>`,
    risc: `<path d="M4 26q7-8 14 0t14 0 14 0 14 0" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 36q7-8 14 0t14 0 14 0 14 0" fill="none" stroke="currentColor" stroke-width="2" opacity=".6"/><path d="M28 4l-4 10h6l-4 10" fill="none" stroke="currentColor" stroke-width="1.6"/>`,
    pug: `<rect x="16" y="4" width="32" height="38" rx="2" fill="currentColor" opacity=".18" stroke="currentColor"/><path d="M22 14h20M22 20h20M22 26h14" stroke="currentColor" stroke-width="1.6"/><circle cx="44" cy="34" r="6" fill="currentColor" opacity=".7"/>`
  };
  const ico = id => `<svg viewBox="0 0 64 44" aria-hidden="true">${I[id] || I.pug}</svg>`;

  /* valoarea pe scurt: fara paranteze lungi, fara trimiteri la acte; prima propozitie */
  function scurt(r) {
    const iv = r.interval;
    if (r.id === "pot" && iv && iv.min != null) return `max ${nf(iv.min)} %` + (iv.max && iv.max !== iv.min ? ` (\u00eentre ${nf(iv.min)} \u0219i ${nf(iv.max)} %, dup\u0103 func\u021biune)` : "") + " pentru locuin\u021be";
    if (r.id === "parcela" && iv) return `cel pu\u021bin ${nf(iv.max || iv.min)} m (case izolate sau cuplate), ${nf(iv.min)} m (\u00een\u0219iruite)`;
    if ((r.id === "lateral" || r.id === "posterior") && iv && iv.min != null) return `cel pu\u021bin ${nf(iv.min, 2)} m de hotar; 2 m dac\u0103 ai ferestre spre vecin`;
    let t = String(r.valoare || "").replace(/\s*\((?:[^()]|\([^()]*\))*\)/g, "").replace(/\b(HG|HCL|Legea|L\d+|art\.|Art\.\d|anexa|RGU|OUG|Ordin)\b[^;,.]*/g, "").replace(/\s{2,}/g, " ");
    t = t.split(/;\s*/)[0].trim().replace(/[,:]\s*$/, "");
    if (t.length > 120) t = t.slice(0, 117).replace(/\s+\S*$/, "") + "\u2026";
    return t || "\u2014";
  }
  /* cea mai restrictiva valoare cunoscuta: treptele 1-3 au prioritate fata de estimari */
  function alege(r) {
    const c = [r, ...(r.alte || [])].filter(x => x && x.valoare);
    const sigure = c.filter(x => x.treapta >= 1 && x.treapta <= 3).sort((a, b) => a.treapta - b.treapta);
    return Object.assign({ id: r.id, interval: r.interval }, sigure[0] || c[0] || r, { id: r.id });
  }

  function css() {
    if (document.getElementById("uc-css")) return;
    const s = document.createElement("style"); s.id = "uc-css";
    s.textContent = `
#uc-ind{background:var(--panel);border:1px solid #c9ced8;border-radius:16px;padding:18px 20px;display:flex;flex-direction:column;gap:12px}
#uc-ind h3{font:800 21px var(--font);margin:0;letter-spacing:-.01em}
#uc-ind .uc-s{font:13px/1.5 var(--font);color:var(--muted);margin:0}
#uc-ind .uc-leg{display:flex;flex-wrap:wrap;gap:6px 14px;font:12px var(--font);color:var(--muted)}
#uc-ind .uc-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
#uc-ind .uc-c{border:1px solid #c9ced8;border-radius:12px;padding:10px 12px 12px;display:flex;flex-direction:column;gap:6px;background:var(--bg)}
#uc-ind .uc-c b{font:700 13.5px/1.25 var(--font)}
#uc-ind .uc-ph{display:flex;align-items:center;justify-content:center;height:62px;border-radius:9px;background:color-mix(in srgb,var(--tc) 10%,var(--panel));color:var(--tc)}
#uc-ind .uc-ph svg{height:46px;width:auto}
#uc-ind .uc-v{font:13px/1.45 var(--font);color:var(--fg)}
.uc-t{align-self:flex-start;font:700 11px var(--font);letter-spacing:.02em;padding:2px 9px;border-radius:99px;color:#fff;background:var(--tc)}
#uc-pug{display:flex;flex-wrap:wrap;gap:0;border:1px solid #c9ced8;border-radius:14px;overflow:hidden;background:var(--panel)}
#uc-pug>div{flex:1 1 150px;padding:11px 14px;border-left:1px solid #c9ced8;display:flex;flex-direction:column;gap:2px}
#uc-pug>div:first-child{border-left:0}
#uc-pug span{font:12px var(--font);color:var(--muted)}#uc-pug b{font:700 15px var(--font)}
body:not(.cl-surse) #urbanism>#ind-box,body:not(.cl-surse) #urbanism>.ublock.uc-x{display:none!important}
#urbanism .ublock,#urbanism #urbis,#urbanism #retrageri,#urbanism .cards>div{border-color:#c9ced8!important}`;
    document.head.appendChild(s);
  }

  function indicatori(sec, Dd) {
    const R = Dd.indicatori_urbanistici?.indicatori; if (!R || sec.querySelector("#uc-ind")) return;
    const box = document.createElement("div"); box.id = "uc-ind"; box.className = "keep";
    const cards = R.map(r => { const a = alege(r), t = TR[a.treapta] || TR[0];
      return `<div class="uc-c" style="--tc:${t[1]}"><b>${esc(mic(NUME[r.id] || r.nume))}</b><div class="uc-ph">${ico(r.id)}</div><div class="uc-v">${esc(scurt(a))}</div><span class="uc-t">${t[0]}</span></div>`; }).join("");
    box.innerHTML = `<h3>ce po\u021bi construi aici</h3><p class="uc-s">valorile cele mai restrictive pe care le cunoa\u0219tem; eticheta spune de unde vin.</p>
      <div class="uc-leg">${[1, 2, 3, 4, 0].map(k => `<span class="uc-t" style="--tc:${TR[k][1]}">${TR[k][0]}</span>`).join("")}<span>exact = din PUG-ul digital al parcelei \u00b7 regulament = regulamentul PUG \u00b7 lege = valoarea din lege, c\u00e2nd PUG-ul nu spune altceva \u00b7 estimat = din cl\u0103dirile din jur</span></div>
      <div class="uc-g">${cards}</div>`;
    const ib = sec.querySelector(":scope > #ind-box"); (ib || sec.querySelector(":scope > .hero") || sec.firstElementChild).insertAdjacentElement("afterend", box);
  }

  function pug(sec, Dd) {
    const P = Dd.urbanism?.pug; if (!P?.gasit || sec.querySelector("#uc-pug")) return;
    const intr = (String(P.valabil || "").match(/Intravilan aprobat:\s*([\d.,]+)\s*ha/) || [])[1];
    const cells = [["PUG", mic(P.localitate || Dd.urbanism.uat || "")], ["aprobat \u00een", P.an || "\u2014"], ["valabil", /p\u00e2n\u0103 la aprobarea/.test(P.valabil || "") ? "p\u00e2n\u0103 la un PUG nou" : "de verificat"],
      ...(intr ? [["intravilan", intr.replace(/,\d+$/, "") + " ha"]] : []), ...(P.pug_nou ? [["revizuire", /preliminar/i.test(P.pug_nou) ? "\u00een preg\u0103tire" : "\u00een curs"]] : [])];
    const d = document.createElement("div"); d.id = "uc-pug"; d.className = "keep"; d.innerHTML = cells.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("");
    const box = sec.querySelector("#uc-ind"); (box || sec.firstElementChild).insertAdjacentElement("afterend", d);
  }

  /* blocurile duble (PUG lung, PUZ in apropiere, AC/CU pe strada, parcele PUZ < 300 m) se ascund la client; raman in \u201ece se misca in zona\u201d */
  function dubluri(sec) {
    sec.querySelectorAll(":scope > .ublock").forEach(b => { const t = (b.firstElementChild?.textContent || b.textContent).toLowerCase();
      if (/planul urbanistic general|planuri urbanistice zonale|autoriza\u021bii de construire \u0219i certificate|parcele din plan\u0219ele puz/.test(t)) b.classList.add("uc-x"); });
  }
  /* autorizatii emise in ultimele 12 luni in UAT, in blocul \u201ece se misca in zona\u201d */
  function ac12(sec, Dd) {
    const u = sec.querySelector("#urbis"); const T = Dd.autorizatii?.trimestre; if (!u || !T || u.querySelector(".uc-ac12")) return;
    const q = Object.keys(T).sort(), ult = q.slice(-5, -1).length === 4 ? q.slice(-5, -1) : q.slice(-4);   // ultimul trimestru e de obicei incomplet
    const n = ult.reduce((s, k) => s + Object.values(T[k]).reduce((a, b) => a + b, 0), 0), casa = ult.reduce((s, k) => s + (T[k].casa || 0), 0);
    const d = document.createElement("div"); d.className = "uc-ac12"; d.style.cssText = "display:flex;gap:18px;flex-wrap:wrap;align-items:baseline;padding:10px 14px;border:1px solid #c9ced8;border-radius:12px;background:var(--bg);margin:8px 0";
    d.innerHTML = `<b style="font:800 26px var(--mono)">${nf(n)}</b><span style="font:13px var(--font);color:var(--muted)">autoriza\u021bii de construire emise \u00een ultimele 12 luni \u00een ${esc(mic(Dd.autorizatii.uat || Dd.urbanism?.uat || ""))} (${esc(ult[0])}\u2013${esc(ult[ult.length - 1])}), dintre care ${nf(casa)} pentru case</span>`;
    const h = u.querySelector("h3"); h ? h.insertAdjacentElement("afterend", d) : u.prepend(d);
  }

  setInterval(() => { try {
    const Dd = typeof D !== "undefined" ? D : null, sec = document.getElementById("urbanism"); if (!Dd || !sec || !sec.firstElementChild) return;
    if (sec.dataset.uc !== Dd.id) { sec.querySelectorAll("#uc-ind,#uc-pug,.uc-ac12").forEach(e => e.remove()); sec.dataset.uc = Dd.id; }
    css(); indicatori(sec, Dd); pug(sec, Dd); dubluri(sec); ac12(sec, Dd);
  } catch (e) { console.warn("urbanism_client", e); } }, 1200);
})();
