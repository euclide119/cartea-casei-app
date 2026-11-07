/* Raport _ Cartea Casei - meniul din spate, ca în aplicație (Manu, 02.11.2026): în lista de capitole, „pdf, trimitere și alte servicii” și „mapa proprietății”.
   Pagina se deschide peste raport (servicii.html). Pdf-ul are capitole de bifat; cele private nu intră niciodată în pdf. Merge pe orice raport, nu doar pe G7. */
(function () {
  "use strict";
  if (window.parent !== window) return;   // în aplicația cu cont, meniul e al aplicației
  const st = document.createElement("style"); st.id = "cc-serv-css";
  st.textContent = `#cc-serv{position:fixed;inset:0;z-index:80;background:#f4efe4;border:0;width:100%;height:100%}
#cc-sf{grid-column:1/-1;order:9999;width:100%}.cc-pasi{margin:28px 0 6px;text-align:left}.cc-pasi>span{display:flex;align-items:center;gap:12px;font:700 12px/1 var(--font);letter-spacing:.12em;text-transform:uppercase;color:#4a5063}.cc-pasi>span::before,.cc-pasi>span::after{content:"";flex:1;height:2px;background:#1a1a1a}.cc-pasi h2{font-size:28px!important;margin:16px 0 4px!important;color:#1a1a1a!important}.cc-pasi p{margin:0;font-size:15px;color:#3d3d3d}@media print{.cc-pasi{display:none}}#cc-sf iframe{width:100%;height:900px;border:0;display:block;background:transparent}body:not(.raport-complet) #cc-sf{display:none}@media print{#cc-sf{display:none!important}}
#cc-serv-nav{display:flex;flex-direction:column;gap:2px;margin:10px 0}#cc-serv-nav button{font-weight:700;text-align:left}#cc-serv-nav button i{font-style:normal;display:inline-block;width:22px}
html:has(#cc-serv) #cl-home,html:has(#cc-serv) #cc-iesi{display:none!important}
#cc-fil{display:none}
@media print{section canvas{height:auto!important}body.cc-tip section.cc-prim{break-before:auto!important;page-break-before:auto!important}[data-l="cad"],[data-l="acte"] polygon,.g7-ch,.hm-ch{display:none!important}body.cc-tip .wrap>section.cc-np,body.cc-tip #cl-final.cc-np,body.cc-tip .rc-bar,body.cc-tip #rc-bar{display:none!important}body.cc-tip #cc-fil{display:block;position:fixed;right:6mm;bottom:3mm;font:8pt system-ui;color:#555}#cc-serv{display:none!important}}`;
  document.head.appendChild(st);
  const rap = () => { const d = typeof D !== "undefined" ? D : null; return d && d.id ? d : null; };
  let prompt0 = null; addEventListener("beforeinstallprompt", e => { e.preventDefault(); prompt0 = e; });
  const capitole = () => [...document.querySelectorAll("nav#tabs button[data-t]")].filter(b => !b.closest("#g7-priv") && !["surse", "stare", "evaluare", "proiecte"].includes(b.dataset.t) && !b.hidden && getComputedStyle(b).display !== "none")
    .map(b => ({ k: b.dataset.t, t: b.innerText.replace(/\s*\n\s*/g, " ").replace(/^\d+\s*/, "").trim() })).filter(c => c.k !== "rezumat").reduce((l, c) => (l.push(c), l), [{ k: "rezumat", t: "rezumat și concluzii" }]);
  async function pregateste() {
    const d = rap(); if (!d) return null;
    const s = window.CC_STARE ? await window.CC_STARE.citeste() : null, cod = s && s.cod ? s.cod : "";
    window.CC_SERV = {
      raport: { id: d.id, titlu: (s && s.titlu) || d.eticheta || d.id, cod, tip_proprietate: d.tip || (s && s.tip) || "casa" }, capitole: () => window.CC_ACORDEON ? window.CC_ACORDEON.pentruBife() : capitole(), inchide, tipareste: l => window.CC_PDF && window.CC_ACORDEON ? (inchide(), window.CC_PDF.capitole(l.map(Number).sort((a, b) => a - b))) : tipareste(l, cod),
      prompt: () => prompt0, instaleaza: async () => { if (prompt0) { prompt0.prompt(); try { await prompt0.userChoice; } catch (e) {} prompt0 = null; } },
      inaltime: h => { const f = document.querySelector("#cc-sf iframe"); if (f) f.style.height = Math.ceil(h) + "px"; },
      afis: () => { const b = document.getElementById("g7p"); if (b) { inchide(); window.showTab("g7_afis"); b.click(); return ""; } if (document.querySelector('nav#tabs [data-t="g7_privat"]')) { inchide(); window.showTab("g7_privat"); return ""; } return "planșa se pregătește la comandă: cere-o la „am nevoie și de”."; },
      cerere: async (servicii, nota, contact) => { try { const t = await (window.CC_STARE ? window.CC_STARE.citeste() : null); if (!t) return { error: "cererile se trimit după ce intri cu codul raportului." };
        const r = await fetch(window.CC_STARE.FN, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "cerere", token: t.token, servicii, nota, contact }) }), j = await r.json(); return r.ok ? j : { error: j.error }; } catch (e) { return { error: "cererea nu s-a putut trimite acum." }; } }
    };
    return window.CC_SERV;
  }
  async function deschide(ecran) {
    if (!(await pregateste())) return; inchide();
    const f = document.createElement("iframe"); f.id = "cc-serv"; f.title = "pdf și cereri"; f.src = "servicii.html#" + ecran; document.body.appendChild(f); document.documentElement.style.overflow = "hidden";
  }
  /* la finalul raportului: pdf cu capitole de bifat, planșa de promovare, mapa, „am nevoie și de”, ca pagina finală din aplicație */
  function bloc() {
    const w = document.querySelector(".wrap"); if (!w || !rap() || document.body.classList.contains("generic")) { document.getElementById("cc-sf")?.remove(); return; }
    if (document.getElementById("cc-sf")) return;
    const d = document.createElement("div"); d.id = "cc-sf"; d.innerHTML = `<div class="cc-pasi"><span>până aici, raportul</span><h2>Pașii următori</h2><p>Ce faci mai departe: pdf-ul raportului, actele pentru notar și bancă, ce mai poți cere prin noi. Deschide doar ce te interesează.</p></div><iframe title="pdf, trimitere și alte servicii" scrolling="no"></iframe>`; w.appendChild(d);
    const f = d.querySelector("iframe"), porn = async () => { if (f.src) return; if (await pregateste()) f.src = "servicii.html#inline"; };
    new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { o.disconnect(); porn(); } }, { rootMargin: "1200px" }).observe(d);
  }
  function inchide() { document.getElementById("cc-serv")?.remove(); document.documentElement.style.overflow = ""; }
  function tipareste(lista, cod) {
    inchide(); if (!lista.length) return;
    if (!document.body.classList.contains("raport-complet")) document.querySelector('[data-a="rap"]')?.click();
    const set = new Set(lista);
    setTimeout(() => {
      document.querySelectorAll(".wrap>section").forEach(s => s.classList.toggle("cc-np", !set.has(s.id)));
      const prim = [...document.querySelectorAll(".wrap>section")].filter(s => set.has(s.id)).sort((a, b) => (+a.style.order || 0) - (+b.style.order || 0))[0]; if (prim) prim.classList.add("cc-prim");
      document.getElementById("cl-final")?.classList.toggle("cc-np", !set.has("rezumat"));
      let m = document.getElementById("cc-fil"); if (!m) { m = document.createElement("div"); m.id = "cc-fil"; document.body.appendChild(m); } m.textContent = "raport " + (cod || (rap() && rap().eticheta) || "");
      window.__cadPrint = 1; window.dispatchEvent(new Event("resize"));   // cadastrul nu apare niciodată în export; harta se redesenează fără el
      document.body.classList.add("cc-tip");
      const gata = () => { window.__cadPrint = 0; window.dispatchEvent(new Event("resize")); document.body.classList.remove("cc-tip"); document.querySelectorAll(".cc-np,.cc-prim").forEach(s => s.classList.remove("cc-np", "cc-prim")); removeEventListener("afterprint", gata); };
      addEventListener("afterprint", gata); try { window.print(); } catch (e) { gata(); }
    }, 1500);
  }
  function monteaza() {
    const nav = document.querySelector("nav#tabs"); if (!nav || !rap() || document.body.classList.contains("generic")) { document.getElementById("cc-serv-nav")?.remove(); return; }
    if (document.getElementById("cc-serv-nav")) return;
    const g = document.createElement("div"); g.id = "cc-serv-nav";
    g.innerHTML = `<button type="button" id="cc-s-f"><i>✓</i>pdf, trimitere și alte servicii</button><button type="button" id="cc-s-m"><i>▤</i>mapa proprietății</button>`;
    g.querySelector("#cc-s-f").onclick = () => deschide("final"); g.querySelector("#cc-s-m").onclick = () => deschide("mapa");
    const t = document.getElementById("ng-tools"); if (t && t.parentElement === nav) nav.insertBefore(g, t); else nav.appendChild(g);
  }
  setInterval(() => { try { monteaza(); bloc(); } catch (e) {} }, 900);
  /* butonul „exportă pdf” de sus deschide aceeași pagină, cu capitole de bifat */
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest('[data-a="pdf"]'); if (b && rap()) { e.preventDefault(); e.stopImmediatePropagation(); deschide("final"); } }, true);
})();
