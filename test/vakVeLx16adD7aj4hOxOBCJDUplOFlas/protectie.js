/* Raport _ Cartea Casei - protecție la copiere (v80.0, cerută de Manu 02.11.2026). Doar pe linkul client.
   Imaginile și hărțile nu se descarcă (fără clic dreapta, fără tragere), captura de ecran e îngreunată, iar singurul export e „Tipărește în PDF”, cu datele minime.
   Din v82.10.0 nu mai există nicio excepție: butonul „Descarcă imaginea satelit” (cc-dlsat) a fost scos, la cererea lui Manu (09.11.2026); se montează doar protecția. Limită sinceră: o captură făcută cu telefonul sau cu altă cameră nu se poate opri dintr-o pagină web. */
(function () {
  "use strict";
  if (!window.CC_CLIENT) return;
  const st = document.createElement("style"); st.id = "cc-prot-css";
  st.textContent = `html.cc-client img,html.cc-client canvas,html.cc-client svg{-webkit-user-drag:none;user-drag:none;-webkit-touch-callout:none}
html.cc-client body{-webkit-user-select:none;user-select:none}html.cc-client input,html.cc-client textarea{-webkit-user-select:text;user-select:text}
html.cc-ascuns body{visibility:hidden!important}
.cc-dlsat{display:inline-flex;margin:8px 0;font:700 13px var(--font);padding:9px 14px;border-radius:10px;background:#1a1e2a;color:#fff!important;text-decoration:none}
@media print{html.cc-client .cc-dlsat,html.cc-client nav,html.cc-client #cc-iesi,html.cc-client .cc-cod,html.cc-client .h79-ctl,html.cc-client #ip-ctl,html.cc-client .hm-ch,html.cc-client .g7-ch,html.cc-client .g7-btn{display:none!important}}`;
  document.head.appendChild(st);
  const permis = e => e.target && e.target.closest && e.target.closest("input,textarea,[data-dl-ok]");
  addEventListener("contextmenu", e => { if (!permis(e)) e.preventDefault(); });
  addEventListener("dragstart", e => e.preventDefault());
  addEventListener("copy", e => { if (!permis(e)) e.preventDefault(); });
  addEventListener("keydown", e => {
    const k = (e.key || "").toLowerCase(), m = e.ctrlKey || e.metaKey;
    if ((m && (k === "s" || k === "u")) || (m && e.shiftKey && (k === "s" || k === "3" || k === "4" || k === "5" || k === "i" || k === "c")) || k === "f12") e.preventDefault();
  });
  const ascunde = ms => { document.documentElement.classList.add("cc-ascuns"); setTimeout(() => document.documentElement.classList.remove("cc-ascuns"), ms); };
  addEventListener("keyup", e => { if (e.key === "PrintScreen") { try { navigator.clipboard.writeText(" "); } catch (x) {} ascunde(1600); } });
  document.addEventListener("visibilitychange", () => { document.documentElement.classList.toggle("cc-ascuns", document.hidden); });
  /* v82.10.0: scos doar montarea butonului „Descarcă imaginea satelit (fără straturi)” (setInterval care crea <a class="cc-dlsat">); regula CSS .cc-dlsat și excepția data-dl-ok rămân, nefolosite. */
})();
