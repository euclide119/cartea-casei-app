/* Raport _ Cartea Casei - „Pașii următori” ca fereastră de capitol separată de „Date fine” (v82.11.0, cerut de Manu 09.11.2026).
   Înainte: blocul #cc-sf (pdf, actele pentru notar și bancă, „am nevoie și de”) stătea deschis sub „Date fine” și se amesteca cu ele.
   Acum: fereastră proprie, închisă, cu aceeași nuanță „click pe mine” ca celelalte (până la primul click), care deschide serviciile.
   Nu modifică meniu_servicii.js: doar clase și un buton peste antetul existent (.cc-pasi). Numărul de capitol din numerotare (admin) se regenerează cu numerotare.py. */
(function () {
  "use strict";
  const st = document.createElement("style"); st.id = "pc-css";
  st.textContent = `#cc-sf.pc{border:1px solid var(--line,#e2e2e2);border-radius:14px;background:#eff3fa;padding:0 16px;margin-top:10px}
#cc-sf.pc.pc-v{background:#fff}
#cc-sf.pc .cc-pasi{margin:0;padding:14px 0}#cc-sf.pc .pc-h{all:unset;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;cursor:pointer;font:800 20px/1.2 var(--font)}
#cc-sf.pc .pc-h::after{content:"+";font:600 26px/1 var(--font)}#cc-sf.pc:not(.pc-inch) .pc-h::after{content:"\\2212"}
#cc-sf.pc.pc-inch iframe,#cc-sf.pc.pc-inch .cc-pasi p,#cc-sf.pc.pc-inch .cc-pasi>span{display:none!important}
#cc-sf.pc .cc-pasi>h2{display:none}#cc-sf.pc iframe{margin-bottom:12px}
@media print{#cc-sf.pc{background:#fff;border:0}}`;
  document.head.appendChild(st);
  function pune() {
    const d = document.getElementById("cc-sf"); if (!d || d.classList.contains("pc")) return;
    const cap = d.querySelector(".cc-pasi"); if (!cap) return;
    d.classList.add("pc", "pc-inch");
    const b = document.createElement("button"); b.type = "button"; b.className = "pc-h"; b.textContent = "Pașii următori"; b.setAttribute("aria-expanded", "false");
    b.onclick = () => { const inch = d.classList.toggle("pc-inch"); d.classList.add("pc-v"); b.setAttribute("aria-expanded", String(!inch)); };
    cap.prepend(b);
    /* apelurile din cod care duc la servicii (lista „capitole”, „pdf și cereri”) deschid fereastra */
    new MutationObserver(() => {}).observe(d, { attributes: true });
    const deschide = () => { if (d.classList.contains("pc-inch")) b.click(); };
    window.CC_PASI = { deschide };
    document.addEventListener("click", e => { if (e.target.closest && e.target.closest("#ac-bar [data-a='pdf'],#ac-lista button[data-i='-1']")) setTimeout(deschide, 50); }, true);
  }
  setInterval(pune, 700);
})();
