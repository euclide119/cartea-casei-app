/* Raport _ Cartea Casei - meniul lateral unic (Manu, 23.10.2026): toate butoanele din raport (Revizie, Genereaza raportul, Mod client,
   Raport juridic, Exporta PDF, PDF pregatit) stau intr-un grup "Instrumente" din bara laterala. Butoanele vechi din antet raman in pagina
   (le folosesc modulele lor), dar sunt ascunse; meniul le apasa. Nu mai exista comutatorul Simplu / Complet. */
(function () {
  "use strict";
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function css() {
    if ($("#mn-css")) return;
    const s = document.createElement("style"); s.id = "mn-css";
    s.textContent = `
.brand #ui-mod,.brand .bld-bar,.wrap>.mbar,#rc-bar{display:none!important}
#ng-tools{border-top:1px solid var(--line);margin-top:8px!important;padding-top:6px!important}
#ng-tools .nl{color:#7a4ea3!important}
.wrap>nav#tabs #ng-tools button,.wrap>nav#tabs #ng-tools a{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;text-align:left;padding:5px 8px;font:600 13px var(--font);border-radius:6px;border:1px solid transparent;background:none;color:var(--fg);cursor:pointer;text-decoration:none}
.wrap>nav#tabs #ng-tools button:hover,.wrap>nav#tabs #ng-tools a:hover{background:color-mix(in srgb,var(--fg) 7%,transparent)}
#ng-tools [aria-pressed="true"]{background:#7a4ea3!important;color:#fff!important}
#ng-tools i{font-style:normal;width:16px;text-align:center;opacity:.85}
body.generic #ng-tools [data-loc]{display:none!important}
@media print{#ng-tools{display:none!important}}
@media (max-width:900px){#ng-tools{display:inline-flex;flex-wrap:nowrap;gap:2px;border-top:0;margin-top:0!important}#ng-tools .nl{display:none}.wrap>nav#tabs #ng-tools button,.wrap>nav#tabs #ng-tools a{width:auto;white-space:nowrap}}`;
    document.head.appendChild(s);
  }
  const apasa = sel => { const b = $(sel); if (b) b.click(); };
  async function pdfPregatit() {
    const a = $("#mn-pdf"); if (!a || typeof D === "undefined" || !D) return;
    const url = `p/${D.id}/raport.pdf`; if (a.dataset.u === url) return; a.dataset.u = url; a.hidden = true;
    try { const r = await fetch(url, { method: "HEAD" }); if (r.ok) { a.href = url; a.hidden = false; } } catch (e) {}
  }
  function monteaza() {
    const nav = $("nav#tabs"); if (!nav) return false;
    if (!$("#ng-tools")) {
      css();
      const g = document.createElement("div"); g.className = "ng"; g.id = "ng-tools";
      g.innerHTML = `<span class="nl">Instrumente</span>
        <button type="button" id="mn-rev" data-loc title="Bife \u0219i sugestii pe fiecare element"><i>\u270e</i>Revizie</button>
        <button type="button" id="mn-asp" title="Alege poze, mut\u0103 textul, ajusteaz\u0103 dimensiuni"><i>\u25a3</i>Aspect</button>
        <button type="button" id="mn-poz" title="Alege poza principal\u0103 a fiec\u0103rui capitol (capitol \u00d7 poz\u0103)"><i>\u25a6</i>Alege pozele</button>
        <button type="button" id="mn-gen" data-loc title="Alege ce con\u021bine raportul"><i>\u2699</i>Genereaz\u0103 raportul</button>
        <button type="button" id="mn-cli" data-loc title="Raportul a\u0219a cum \u00eel vede clientul"><i>\u25d0</i>Mod client</button>
        <a href="juridic_model.html" id="mn-jur"><i>\u2696</i>Raport juridic</a>
        <button type="button" id="mn-print" data-loc><i>\u2193</i>Export\u0103 PDF</button>
        <a id="mn-pdf" data-loc hidden download><i>\u25a4</i>PDF preg\u0103tit</a>`;
      const dupa = nav.querySelector('[data-t="surse"]')?.closest(".ng") || nav.lastElementChild; dupa.after(g);
      $("#mn-rev").onclick = () => apasa("#ui-mod [data-rvb]");
      $("#mn-asp").onclick = () => { if (window.RIC_ASPECT) RIC_ASPECT.comuta(); };
      $("#mn-poz").onclick = () => { if (window.RIC_ASPECT) RIC_ASPECT.pagina(); };
      $("#mn-gen").onclick = () => apasa("#bld-open");
      $("#mn-cli").onclick = () => apasa("#bld-client");
      $("#mn-print").onclick = () => { try { window.print(); } catch (e) {} };
    }
    // stari: Revizie si Mod client apasate
    $("#mn-rev")?.setAttribute("aria-pressed", String(document.body.classList.contains("revizie")));
    $("#mn-asp")?.setAttribute("aria-pressed", String(document.body.classList.contains("aspect")));
    $("#mn-cli")?.setAttribute("aria-pressed", String(document.body.classList.contains("mod-client")));
    pdfPregatit();
    return true;
  }
  function porneste() { setInterval(monteaza, 700); monteaza(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", porneste); else porneste();
})();
