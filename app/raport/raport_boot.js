/* cartea casei · pornirea raportului interactiv în aplicație (rulează primul, în pagina raportului).
   Varianta pentru client: fără surse, fără moduri de lucru; în aplicație se vede doar capitolul ales (îl alege aplicația, din afară).
   Datele proprietății (p/<id>/…) vin prin service worker-ul aplicației, doar cu cont; aici nu există date. */
(function () {
  try { localStorage.setItem("ric-surse", "0"); localStorage.setItem("ric-aspect-on", "0"); localStorage.setItem("ric-revizie", "0"); } catch (e) {}
  if (window.parent === window) return;  // deschis direct, nu din aplicație
  document.documentElement.classList.add("cc-app");
  const s = document.createElement("style"); s.id = "cc-app-css";
  s.textContent = `
html.cc-app nav#tabs,html.cc-app .brand,html.cc-app header,html.cc-app #ac-bar,html.cc-app #cl-home,html.cc-app #sx-capb,html.cc-app footer,html.cc-app #where,html.cc-app #ng-tools,html.cc-app .x-src{display:none!important}
html.cc-app[data-k] .wrap>section:not(.cc-on),html.cc-app[data-k] #cl-final:not(.cc-on){display:none!important}
html.cc-app[data-k] .wrap>section.cc-on,html.cc-app[data-k] #cl-final.cc-on{display:flex!important}
html.cc-app body{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
html.cc-app .wrap{padding-bottom:110px!important}
#cc-fil{position:fixed;right:8px;bottom:6px;font:600 10px system-ui;color:rgba(26,30,42,.28);pointer-events:none;z-index:99999}
#cc-next{margin:28px 0 0;padding:18px;border-radius:16px;background:#1a1e2a;color:#fff;font:600 15px system-ui;display:flex;justify-content:space-between;align-items:center;gap:12px;cursor:pointer}
#cc-next small{display:block;opacity:.7;font-weight:500}`;
  (document.head || document.documentElement).appendChild(s);
  addEventListener("contextmenu", e => e.preventDefault());
})();
