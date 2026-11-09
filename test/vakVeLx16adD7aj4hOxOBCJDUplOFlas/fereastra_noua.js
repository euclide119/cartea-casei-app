/* Raport _ Cartea Casei - nuanța „click pe mine” (v82.10.1, cerută de Manu 09.11.2026).
   Orice fereastră închisă și neatinsă (capitolele din acordeon, ferestrele din interiorul capitolului) are fundalul într-o nuanță albastru-papirus foarte deschis (ΔL ≈ 4 %),
   până la primul click; după click revine la culoarea obișnuită și rămâne așa pentru restul vizitei (clasa fn-v, în memorie, fără localStorage).
   Fără text în plus și fără animație (deci și prefers-reduced-motion e respectat). Contrastul textului #1a1e2a pe #eff3fa: > 14:1. */
(function () {
  const st = document.createElement("style"); st.id = "fn-css";
  st.textContent = `.ac-card:not(.ac-des):not(.ac-gol):not(.ac-pv):not(.fn-v),.ac-subh:not(.on):not(.fn-v){background:#eff3fa!important}
@media print{.ac-card,.ac-subh{background:#fff!important}}`;
  document.head.appendChild(st);
  const marcheaza = e => { const el = e.target && e.target.closest && e.target.closest(".ac-card,.ac-subh"); if (el) el.classList.add("fn-v"); };
  document.addEventListener("click", marcheaza, true);
  document.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") marcheaza(e); }, true);
  /* deschiderile făcute din cod (lista „capitole”, adresa #…) contează ca atingere */
  setInterval(() => { document.querySelectorAll(".ac-card.ac-des:not(.fn-v),.ac-subh.on:not(.fn-v)").forEach(e => e.classList.add("fn-v")); }, 500);
})();
