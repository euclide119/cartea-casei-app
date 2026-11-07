/* Raportul Casei v82.7.0 - legendele hărților (Manu, 07.11.2026, după testul pe telefon).
   Toate elementele aliniate la margine, pătratele/bulinele colorate pe aceeași coloană, fără chenar și fără colțuri evidențiate,
   fără paranteze și explicații („locuințe”, nu „locuințe (…)”). Legenda stă sub hartă (harti_plasare.js). Culori din tema deschisă; contrast ≥ 4,5:1. */
(function () {
  "use strict";
  const LEG = ".hm-lg,.tlg,.ov-lg .pzchips,.pz>.pzchips:not(:has(button)),.g7-leg,.h79-lg";
  const css = document.createElement("style");
  css.textContent = `
${LEG.split(",").map(s => s + "{display:flex!important;flex-direction:column!important;flex-wrap:nowrap!important;align-items:flex-start!important;gap:5px!important;margin:8px 0 0!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:none!important;color:#2a2f3a!important;font-size:13px!important;line-height:1.3!important;text-shadow:none!important}").join("")}
.ov-lg.ov-afara{display:block!important;width:100%;padding:0!important;margin:0!important;border:0!important;background:none!important;box-shadow:none!important;text-shadow:none!important}
.ov-lg.ov-afara>*{width:100%}
.hm-lg>.lg,.tlg>span,.g7-leg>span,.g7-leg>.lg,.ov-lg .pzchips>.pzc,.ip-lg>span{display:flex!important;align-items:center;gap:9px;margin:0!important;padding:0!important;border:0!important;background:none!important;color:#2a2f3a!important;font-weight:500;white-space:normal!important;text-align:left}
.hm-lg>.lg>i,.tlg>span>i,.g7-leg>span>i,.g7-leg>.lg>i,.ip-lg>span>i{flex:0 0 14px!important;width:14px!important;min-width:14px;margin:0!important}
.ov-lg .pzchips>.pzc>b,.pz>.pzchips>.pzc>b{flex:0 0 14px;text-align:center}
.hm-lg>.lg[style*="opacity"]{opacity:1!important;color:#4a4f5c!important}
@media print{.hm-lg,.tlg{break-inside:avoid}}`;
  document.head.appendChild(css);

  /* fără paranteze în legende: textul dintre paranteze dispare, nodurile cu stil nu se ating */
  const PAR = /\s*\([^)]*\)/g;
  function curata(root) {
    (root || document).querySelectorAll(".hm-lg,.tlg,.ov-lg,.g7-leg,.ip-lg").forEach(el => {
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) if (n.nodeValue.includes("(")) n.nodeValue = n.nodeValue.replace(PAR, "");
    });
  }
  let t = 0; const plan = () => { clearTimeout(t); t = setTimeout(() => curata(), 120); };
  new MutationObserver(plan).observe(document.documentElement, { childList: true, subtree: true });
  plan();
  window.CC_LEGENDE = { curata };
})();
