/* mobil_coloana.js — v82.24.0 (SUPER REGULĂ Manu, 13.11.2026: „raportul se deschide, se ajustează și se dă clientului DOAR în format mobil”).
   Pe ecran lat (desktop) raportul apare ca pe telefon: o coloană centrată de 430 px, cu aceeași interfață ca pe telefon.
   Cum: lățimea văzută de pagină devine 430 (window.innerWidth), regulile @media de lățime se evaluează ca pe telefon (inclusiv cele injectate de module),
   iar barele fixe (position:fixed pe toată lățimea) se strâng în coloană. Pe telefon (≤ 520 px) și la imprimare nu face nimic. ?desktop=1 oprește emularea (doar pentru depanare).
   Element înghețat: html.cc-mobil (elemente_inghetate_raport.json, id „coloana-mobil”). */
(() => {
  const W = 430, real = window.innerWidth;
  if (window.__ccMobil || real <= 520 || /[?&]desktop=1/.test(location.search)) return;
  window.__ccMobil = true; window.__ccReal = real;
  document.documentElement.classList.add("cc-mobil");
  try { Object.defineProperty(window, "innerWidth", { configurable: true, get: () => W }); } catch (e) { /* rămâne lățimea reală */ }
  /* 1) @media de lățime evaluate ca la 430 px */
  const val = (cond) => {   // true dacă o condiție de lățime e adevărată la 430
    const re = /\((min|max)-width:\s*([\d.]+)px\)/g; let m, t = true, any = false;
    while ((m = re.exec(cond))) { any = true; const n = parseFloat(m[2]); if (m[1] === "min" ? W < n : W > n) t = false; }
    return any ? t : null;
  };
  const trateaza = (sheet) => {
    let reguli; try { reguli = sheet.cssRules; } catch (e) { return; }
    for (const r of Array.from(reguli || [])) {
      if (r.type === CSSRule.MEDIA_RULE) {
        const txt = r.media.mediaText;
        if (/print|prefers-|display-mode|orientation|hover|pointer/.test(txt) || r.__ccm) continue;
        const v = val(txt); if (v === null) continue;
        r.__ccm = 1; r.media.mediaText = v ? "all" : "not all";
      }
    }
  };
  const toate = () => { for (const s of Array.from(document.styleSheets)) trateaza(s); };
  /* 2) coloana + barele fixe */
  const st = document.createElement("style"); st.id = "cc-mobil-css";
  st.textContent = `html.cc-mobil{background:#d9d4c7}
html.cc-mobil body{max-width:${W}px;margin:0 auto!important;min-height:100vh;box-shadow:0 0 0 1px #c9c3b3,0 8px 40px rgba(0,0,0,.18);overflow-x:hidden;position:relative}
html.cc-mobil #cc-splash,html.cc-mobil #cc-tt-scan{left:max(0px,calc(50% - ${W / 2}px))!important;right:auto!important;width:min(${W}px,100%)!important}
html.cc-mobil .cc-m-fix{left:max(0px,calc(50% - ${W / 2}px))!important;right:auto!important;width:min(${W}px,100%)!important;max-width:${W}px!important;box-sizing:border-box}
@media print{html.cc-mobil body{max-width:none;box-shadow:none}}`;
  (document.head || document.documentElement).appendChild(st);
  const fixe = () => {
    const colL = (window.__ccReal - W) / 2;
    for (const e of document.body ? document.body.querySelectorAll("*") : []) {
      if (e.classList.contains("cc-m-fix") || e.dataset.ccm) continue;
      const cs = getComputedStyle(e); if (cs.position !== "fixed") continue;
      const r = e.getBoundingClientRect();
      if (r.width > W + 8 || (cs.left === "0px" && cs.right === "0px")) { e.classList.add("cc-m-fix"); continue; }
      if (r.width === 0) continue;
      /* element fix mic ancorat de marginea ecranului: îl mutăm în marginea coloanei */
      if (cs.right !== "auto" && r.right > colL + W + 1) { e.style.setProperty("right", `calc(50% - ${W / 2}px + ${parseFloat(cs.right) || 0}px)`, "important"); e.dataset.ccm = "1"; }
      else if (cs.left !== "auto" && r.left < colL - 1) { e.style.setProperty("left", `calc(50% - ${W / 2}px + ${parseFloat(cs.left) || 0}px)`, "important"); e.dataset.ccm = "1"; }
    }
  };
  let t = 0; const programeaza = () => { if (t) return; t = setTimeout(() => { t = 0; toate(); fixe(); }, 120); };
  /* lățimea REALĂ a ferestrei (nu innerWidth, care e suprascris): sub 520 px emularea se oprește singură (telefon, fereastră îngustată) */
  const rw = () => document.documentElement.clientWidth || real;
  const comuta = () => document.documentElement.classList.toggle("cc-mobil", rw() > 520);
  addEventListener("resize", comuta); comuta();
  toate(); document.addEventListener("DOMContentLoaded", programeaza);
  new MutationObserver(programeaza).observe(document, { childList: true, subtree: true });
  window.addEventListener("load", () => { programeaza(); setTimeout(programeaza, 800); setTimeout(programeaza, 2500); });
})();
