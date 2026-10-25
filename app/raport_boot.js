/* cartea casei · pornirea raportului interactiv în aplicație (rulează primul, în pagina raportului).
   Varianta pentru client = registrul COMERCIAL: prezentarea, nu munca de căutare. Fără surse, fără etichete de lucru
   (fără registru local, [estimare], [ipoteză], trimiteri la acte), fără capitole goale; ce lipsește îl știm doar noi (evidența internă) și apare
   în disclaimerul de la finalul pdf-ului. În aplicație se vede doar capitolul ales (îl alege aplicația, din afară).
   Datele proprietății (p/<id>/…) vin prin service worker-ul aplicației, doar cu cont; aici nu există date. */
(function () {
  try { localStorage.setItem("ric-surse", "0"); localStorage.setItem("ric-aspect-on", "0"); localStorage.setItem("ric-revizie", "0"); } catch (e) {}
  if (window.parent === window) return;  // deschis direct, nu din aplicație
  document.documentElement.classList.add("cc-app");
  const s = document.createElement("style"); s.id = "cc-app-css";
  s.textContent = `
html.cc-app nav#tabs,html.cc-app .brand,html.cc-app header,html.cc-app #ac-bar,html.cc-app #cl-home,html.cc-app #sx-capb,html.cc-app footer,html.cc-app #where,html.cc-app #ng-tools,html.cc-app .x-src{display:none!important}
html.cc-app .hx-reg,html.cc-app .sx-stub,html.cc-app .eti{display:none!important}
html.cc-app[data-k] .wrap>section:not(.cc-on),html.cc-app[data-k] #cl-final:not(.cc-on){display:none!important}
html.cc-app[data-k] .wrap>section.cc-on,html.cc-app[data-k] #cl-final.cc-on{display:flex!important}
html.cc-app body{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
html.cc-app .wrap{padding-bottom:40px!important}
/* citire pe telefon: butoane late, text mai mare */
html.cc-app .hm-chip,html.cc-app .pzc,html.cc-app .tind,html.cc-app .tb,html.cc-app .hm-base .hm-chip{min-height:40px;padding:8px 13px!important;font-size:13px!important}
html.cc-app .ist-th button{min-height:56px}
html.cc-app nav .ng button{min-height:40px}
html.cc-app .seg{min-height:44px}
html.cc-app .bar{padding-block:4px}
html.cc-app td,html.cc-app th{font-size:12.5px}
#cc-next{margin:28px 0 0;padding:18px;border-radius:16px;background:#1a1e2a;color:#fff;font:600 15px system-ui;display:flex;justify-content:space-between;align-items:center;gap:12px;cursor:pointer}
#cc-next small{display:block;opacity:.7;font-weight:500}`;
  (document.head || document.documentElement).appendChild(s);
  addEventListener("contextmenu", e => e.preventDefault());

  /* ---- registrul comercial: același filtru ca la randarea statică (randeaza_capitole.py) ---- */
  const CURATA = [
    [/\s*\[(?:IPOTEZ[ĂA]|ESTIMARE[^\]]*|estimare|de verificat|V|D|E)\]/gi, ""],
    [/\s*\([^()]*\b(?:Directiva|Ordinul|Legea|HG|OUG|Ordin)\b[^()]*\)/g, ""],
    [/;?\s*nu avem încă recensământul CNAIR\.?/g, "."],
    [/^temei lipsă$/, "de confirmat"]
  ];
  window.__ccCurata = function (root) {
    if (!root) return;
    const d = root.ownerDocument || document;
    const w = d.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) {
      if (n.parentElement && n.parentElement.closest("script,style,textarea,input")) continue;
      let t = n.nodeValue, o = t;
      CURATA.forEach(([r, x]) => { t = t.replace(r, x); });
      if (t !== o) n.nodeValue = t;
    }
    // text prea mic pe telefon (HTML, nu SVG: acolo mărimea depinde de scara desenului)
    root.querySelectorAll("*").forEach(e => {
      if (e.closest("svg,.hours,.months") || !e.childNodes.length) return;
      if (![...e.childNodes].some(c => c.nodeType === 3 && c.nodeValue.trim())) return;
      const f = parseFloat(getComputedStyle(e).fontSize);
      if (f && f < 12.5) e.style.setProperty("font-size", "12.5px", "important");
    });
  };
})();
