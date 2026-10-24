/* Raport _ Cartea Casei - prima pagina a raportului unei locatii, refacuta (Manu, 23.10.2026):
   coperta cu poza aleasa si un filtru de culoare, titlul = locul (nu un titlu de ziar), un rand calitativ cu ce am gasit;
   cele 6 elemente principale ca placi foto (poza capitolului + filtru in culoarea verdictului), cifra mare, eticheta mica;
   banda \u201ecum influenteaza pretul" ca o linie fina, eleganta; nota juridica scurta sub coperta. Inlocuieste window.PRIMA (vecinatate.js).
   Semaforul si concluziile primesc o asezare mai aerisita (doar CSS). Litere mici in tot ce scriem noi; datele raman cum sunt. */
(function () {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const mic = s => (window.mic ? window.mic(s) : String(s ?? "").toLowerCase());
  const nf = v => Number(v).toLocaleString("ro-RO");
  let IX = null;
  const COL = { r: "#c0392b", o: "#c86a0a", g: "#1f8a4c", i: "#2c5c9c" }   /* culorile din standard.css */, ETI = { r: "nu arat\u0103 bine", o: "de verificat", g: "arat\u0103 bine", i: "informativ" };
  const ORD = { r: 0, o: 1, g: 3, i: 4 };
  const PRI = ["inundatii", "seismic", "zgomot", "alunecari", "autorizatii", "costuri", "arii_protejate", "monumente", "aer", "transport", "scoli", "facilitati", "populatie", "zonare"];
  const NUME = { inundatii: "inunda\u021bii", seismic: "risc seismic", alunecari: "teren", zgomot: "zgomot", aer: "aer", autorizatii: "construc\u021bii \u00een jur", zonare: "zonare", monumente: "patrimoniu",
    arii_protejate: "natur\u0103 protejat\u0103", facilitati: "la pas", transport: "transport", scoli: "\u0219coli", populatie: "popula\u021bie", costuri: "costuri" };

  function foto(k) {
    const a = window.RIC_ASPECT && RIC_ASPECT.imagine(k); if (a) return "ilu/" + a.replace(/^ilu\//, "");
    const L = IX && IX[k]; return L && L[0] ? "ilu/" + L[0].f : null;
  }
  function pozBanda(html) { const m = String(html || "").match(/left:([\d.]+)%/); return m ? +m[1] : 50; }

  function css() {
    if (document.getElementById("p2-css")) return;
    const s = document.createElement("style"); s.id = "p2-css";
    s.textContent = `
#prima{margin:0 0 6px}
.p2-cov{position:relative;border-radius:20px;overflow:hidden;min-height:340px;display:flex;align-items:flex-end;background:#1d2533;isolation:isolate}
.p2-cov>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(1.18) saturate(1.05);z-index:-2}
.p2-cov::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(105deg,rgba(14,22,36,.72) 0%,rgba(14,22,36,.38) 45%,rgba(14,22,36,0) 100%),linear-gradient(0deg,rgba(184,110,0,.14),transparent 60%)}
.p2-in{padding:30px 32px 26px;color:#fff;display:flex;flex-direction:column;gap:12px;max-width:640px}
.p2-k{font:600 12.5px var(--mono);letter-spacing:.06em;color:#ffcf8a}
.p2-in h1{font:800 clamp(28px,4vw,46px)/1.04 var(--font);letter-spacing:-.025em;margin:0;color:#fff}
.p2-sub{font:16px/1.5 var(--font);color:#e9edf3;margin:0}
.p2-ch{display:flex;flex-wrap:wrap;gap:8px}
.p2-ch span{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:99px;background:rgba(255,255,255,.12);backdrop-filter:blur(6px);font:600 13.5px var(--font)}
.p2-ch b{font:800 17px var(--mono)}.p2-ch i{width:9px;height:9px;border-radius:50%;background:var(--c)}
.p2-val{margin-top:6px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.1);backdrop-filter:blur(6px);display:grid;gap:8px;max-width:440px}
.p2-val .p2-vt{display:flex;justify-content:space-between;font:12.5px var(--font);color:#dfe5ee}.p2-val .p2-vt b{color:#fff;font-weight:700}
.p2-line{position:relative;height:3px;border-radius:99px;background:linear-gradient(90deg,#c8443e,#d98a2b 45%,#e9c46a 55%,#2f8f4e)}
.p2-line i{position:absolute;top:50%;width:18px;height:18px;border-radius:50%;background:#fff;border:4px solid #1d2533;box-shadow:0 2px 10px rgba(0,0,0,.4);transform:translate(-50%,-50%)}
.p2-not{margin:10px 2px 0;font:12.5px/1.5 var(--font);color:var(--muted)}.p2-not a{color:var(--muted)}
.p2-g{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:14px}
.p2-t{all:unset;box-sizing:border-box;position:relative;cursor:pointer;border-radius:16px;overflow:hidden;min-height:210px;display:flex;flex-direction:column;justify-content:flex-end;isolation:isolate;background:#2a3140;transition:transform .2s,box-shadow .2s}
.p2-t:hover,.p2-t:focus-visible{transform:translateY(-3px);box-shadow:0 16px 30px -16px rgba(0,0,0,.55)}
.p2-t>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(1.3) saturate(.95);z-index:-3;transition:transform .5s}
.p2-t:hover>img{transform:scale(1.04)}
.p2-t::before{content:"";position:absolute;inset:0;z-index:-2;background:color-mix(in srgb,var(--c) 55%,#fff);mix-blend-mode:multiply;opacity:.55}
.p2-t::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(0deg,rgba(10,14,22,.78) 0%,rgba(10,14,22,.3) 50%,rgba(10,14,22,0) 100%)}
.p2-tb{padding:14px 16px 14px;color:#fff;display:flex;flex-direction:column;gap:4px}
.p2-tk{display:flex;align-items:center;justify-content:space-between;gap:8px;font:600 12.5px var(--font);color:#f0f3f7}
.p2-tk em{font-style:normal;font:800 12.5px var(--font);padding:4px 12px;border-radius:99px;background:var(--c);color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.25)}
.p2-tn{font:800 30px/1.05 var(--mono);letter-spacing:-.02em;color:#fff}
.p2-td{font:13px/1.35 var(--font);color:#e4e8ee;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.p2-tl{position:relative;height:2px;border-radius:99px;margin-top:8px;background:var(--c)}
.p2-tl i{position:absolute;top:50%;width:10px;height:10px;border-radius:50%;background:#fff;transform:translate(-50%,-50%);box-shadow:0 0 0 2.5px var(--c)}
@media (max-width:820px){.p2-g{grid-template-columns:1fr 1fr}.p2-in{padding:22px 18px}}
@media (max-width:520px){.p2-g{grid-template-columns:1fr}.p2-cov{min-height:420px}}
@media print{.p2-t,.p2-cov{break-inside:avoid}}
/* semaforul si concluziile, mai aerisite */
#semafor .sem-n{gap:12px!important}
#semafor .sem-n div{border-radius:14px!important;padding:14px 16px!important;background:var(--panel)!important;border:1px solid var(--line)!important;border-top:4px solid var(--c)!important}
#semafor .sem-n b{font-size:30px!important}
#semafor .sem-c{border-radius:14px!important;border:1px solid var(--line)!important;border-left:0!important;border-top:4px solid var(--c)!important;padding:14px 16px!important;gap:2px!important}
#semafor .sem-t{text-transform:none!important;letter-spacing:.02em!important;font:700 14px var(--font)!important;margin-bottom:6px}
#semafor .sem-r{padding:9px 0!important}#semafor .sem-r b{font-size:14.5px}
#concluzii .cc-sec{border-radius:14px!important;padding:16px 18px!important}
#concluzii .cc-n{text-transform:none!important;letter-spacing:0!important;font:600 12px var(--font)!important}`;
    document.head.appendChild(s);
  }

  function lista(D, HR) {
    const VEC = window.VEC || [];
    const L = VEC.filter(V => V.k === "zonare" ? HR : D[V.k]).map(V => { try { const c = V.def(V.k === "zonare" ? {} : D[V.k], HR); return c && c.cards && c.cards.length ? { V, c } : null; } catch (e) { return null; } }).filter(Boolean);
    const F = D.inundatii;
    if (F && F.hazard && F.hazard.hz10) {
      const z = F.hazard.hz10.dist_m, z1 = F.hazard.hz100 && F.hazard.hz100.dist_m, vd = z === 0 ? "r" : (typeof z === "number" && z <= 100) || z1 === 0 ? "o" : "g";
      L.push({ V: { k: "inundatii", t: "Inunda\u021bii" }, c: { verd: [vd], cards: [[F.rau ? nf(F.rau.dist_m) + " m" : "\u2014", "p\u00e2n\u0103 la " + (F.rau && F.rau.nume || "cel mai apropiat curs de ap\u0103")]], band: `left:${vd === "r" ? 15 : vd === "o" ? 38 : 72}%` } });
    }
    const pr = k => { const i = PRI.indexOf(k); return i < 0 ? 99 : i; };
    L.sort((a, b) => ((ORD[a.c.verd[0]] ?? 5) - (ORD[b.c.verd[0]] ?? 5)) || (pr(a.V.k) - pr(b.V.k)));
    return L;
  }

  function prima2(el, D, HR, go) {
    css(); const L = lista(D, HR); if (!L.length) { el.innerHTML = ""; return; }
    const nr = k => L.filter(x => x.c.verd[0] === k).length;
    const ef = L.reduce((s, x) => s + ({ r: -1, o: -.4, g: .6, i: 0 }[x.c.verd[0]] || 0), 0) / L.length, pos = 50 + Math.max(-1, Math.min(1, ef)) * 46;
    const adr = (D.urbanism && D.urbanism.adresa) || {}, loc = adr.localitate || (D.urbanism && D.urbanism.uat) || "";
    const titlu = adr.strada ? `${adr.strada}${adr.numar ? " " + adr.numar : ""}${loc ? ", " + loc : ""}` : (loc ? `${loc}, ${D.eticheta || ""}` : (D.eticheta || D.id));
    const cov = foto("rezumat");
    const sub = nr("r") ? `cele mai multe lucruri arat\u0103 bine sau sunt de verificat; ${nr("r") === 1 ? "unul nu arat\u0103 bine" : nr("r") + " nu arat\u0103 bine"} \u0219i merit\u0103 discutat \u00eenainte de arvun\u0103.`
      : nr("o") ? "nimic nu arat\u0103 r\u0103u; c\u00e2teva lucruri sunt de verificat \u00eenainte de arvun\u0103." : "tot ce am putut verifica arat\u0103 bine.";
    const val = ef < -.2 ? "trage pre\u021bul \u00een jos" : ef < .2 ? "neutru fa\u021b\u0103 de pre\u021b" : "sus\u021bine pre\u021bul";
    el.innerHTML = `<div class="p2-cov">${cov ? `<img src="${esc(cov)}" alt="">` : ""}<div class="p2-in"><span class="p2-k">${esc(mic("raportul loca\u021biei \u00b7 " + (D.eticheta || "")))}</span><h1>${esc(mic(titlu))}</h1><p class="p2-sub">${esc(sub)}</p>
        <div class="p2-ch">${[["g", "arat\u0103 bine"], ["o", "de verificat"], ["r", "nu arat\u0103 bine"]].filter(([k]) => nr(k)).map(([k, t]) => `<span style="--c:${COL[k]}"><i></i><b>${nr(k)}</b>${t}</span>`).join("")}</div>
        <div class="p2-val"><div class="p2-vt"><span>cum influen\u021beaz\u0103 pre\u021bul, pe scurt</span><b>${val}</b></div><div class="p2-line"><i style="left:${pos.toFixed(1)}%"></i></div><div class="p2-vt"><span>\u00een defavoare</span><span>\u00een favoare</span></div></div></div></div>
      <p class="p2-not">informa\u021biile sunt orientative \u0219i trebuie verificate cu un specialist (notar, avocat, inginer) \u00eenainte de orice decizie. <a href="#rep-foot-p" data-nota>cite\u0219te nota juridic\u0103</a></p>
      <div class="p2-g">${L.slice(0, 6).map(({ V, c }) => { const f = foto(V.k), v = c.verd[0];
        return `<button type="button" class="p2-t" data-go="${esc(V.k)}" style="--c:${COL[v] || "#4a6fa5"}">${f ? `<img src="${esc(f)}" alt="" loading="lazy">` : ""}<span class="p2-tb"><span class="p2-tk">${esc(NUME[V.k] || mic(V.t))}<em>${ETI[v] || ""}</em></span>
          <span class="p2-tn">${esc(c.cards[0][0])}</span><span class="p2-td">${esc(c.cards[0][1])}</span><span class="p2-tl" title="cum influen\u021beaz\u0103 pre\u021bul"><i style="left:${pozBanda(c.band).toFixed(1)}%"></i></span></span></button>`; }).join("")}</div>`;
    el.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
    el.querySelector("[data-nota]")?.addEventListener("click", e => { e.preventDefault(); document.getElementById("rep-foot-p")?.scrollIntoView({ behavior: "smooth" }); });
  }

  (async () => { try { const r = await fetch("ilu/index.json", { cache: "no-cache" }); if (r.ok) IX = await r.json(); } catch (e) {}
    try { if (typeof D !== "undefined" && D && document.getElementById("prima")) prima2(document.getElementById("prima"), D, typeof HR !== "undefined" ? HR : null, t => { window.showTab(t); scrollTo({ top: 0 }); }); } catch (e) {} })();
  window.PRIMA = prima2;
  window.addEventListener("ric-aspect", e => { const k = e.detail && e.detail.k; if (!e.detail || !e.detail.img) return;
    try { if (typeof D !== "undefined" && D) prima2(document.getElementById("prima"), D, typeof HR !== "undefined" ? HR : null, t => { window.showTab(t); scrollTo({ top: 0 }); }); } catch (er) {} });
})();
