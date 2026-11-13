/* Raport · Cartea Casei — componenta DOM standard (v82.23.0, 13.11.2026, cerut de Manu: „de ce la dom avem discrepante si la cum cerem codul si la cum le bluram sau nu; daca vrem sa standardizam, nu ar trebui sa fie afisate la fel?”).
   Aceeași rețetă în toate capitolele DOM: înainte de cod = titlul capitolului (🔒) + o previzualizare estompată uniform (blur 5 px, înălțime 120 px, fără selecție / click) + același buton „Am cod / Comandă DOM”, în același loc, sub titlu;
   după cod (CC_ADM.n ≥ 2, un singur cod deblochează tot) = conținutul deschis peste tot deodată. Datele de sub previzualizare sunt deja mascate de modulele lor (mascare.js, g7.js, roi.js): estomparea e doar prezentare, nu protecție.
   Capitolul „Depth of Market” propriu-zis (#date_fine_aproape) își păstrează lacătul din plata.js (același buton, aceleași texte) și nu se estompează. Regula e generală, pentru toate rapoartele. */
(function () {
  "use strict";
  if (window.parent !== window) return;
  const IDS = ["g7_sinteza", "g7_cu", "g7_privat", "anunturi_dom", "vecinatati_dom", "g7_juridic", "g7_extras", "g7_istoric", "g7_tehnic", "g7_utilitati", "g7_pug", "proiecte", "g7_proiecte", "evaluare", "g7_preturi", "roi", "g7_comercial", "g7_afis"];
  const css = document.createElement("style"); css.id = "dl-css";
  css.textContent = `section.dl-l>*:not(h2):not(.dl-bar){filter:blur(5px);max-height:120px;overflow:hidden;pointer-events:none;user-select:none;-webkit-user-select:none}
section.dl-l>h2{margin-bottom:6px}.dl-bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:4px 0 8px;padding:8px 10px;border-radius:10px;background:#fff3e0;color:#7c2d12;font:600 13px/1.3 system-ui}
.dl-bar button{all:unset;cursor:pointer;padding:9px 16px;border-radius:999px;background:#9a3412;color:#fff;font:700 13px system-ui}`;
  document.head.appendChild(css);
  const nivel = () => window.CC_ADM && window.CC_ADM.n != null ? window.CC_ADM.n : (window.__dlN != null ? window.__dlN : 2);
  if (window.CC_NIVEL_P && !window.CC_ADM) window.CC_NIVEL_P.then(n => { window.__dlN = n; }).catch(() => {});
  function deschide() {   // același loc de cod pentru toate: lacătul din capitolul DOM
    const h = [...document.querySelectorAll("button.ac-h")].find(x => /Depth of Market/.test(x.textContent)); if (h && h.getAttribute("aria-expanded") !== "true") h.click();
    setTimeout(() => { const t = document.querySelector("#date_fine_aproape .pl") || document.querySelector("#date_fine_aproape") || h; if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); }, 450);
  }
  function aplica() {
    const blocat = nivel() < 2;
    for (const id of IDS) {
      const s = document.getElementById(id); if (!s || s.hidden) continue;
      const are = s.classList.contains("dl-l");
      if (blocat && !are && s.textContent.trim().length > 40) {
        s.classList.add("dl-l");
        const bar = document.createElement("div"); bar.className = "dl-bar"; bar.innerHTML = '<span>🔒 Se deschide cu codul DOM.</span><button type="button">Am cod / Comandă DOM</button>';
        bar.querySelector("button").onclick = deschide;
        const h = s.querySelector("h2"); h ? h.after(bar) : s.prepend(bar);
      } else if (!blocat && are) { s.classList.remove("dl-l"); s.querySelectorAll(":scope>.dl-bar").forEach(x => x.remove()); }
    }
  }
  setInterval(() => { try { aplica(); } catch (e) { console.warn("dom_lacat", e); } }, 1500);
  window.CC_DOM_LACAT = { aplica, deschide };
})();
