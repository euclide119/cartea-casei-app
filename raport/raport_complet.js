/* Raport \u00een cre\u0219tere \u2014 \u201eRezumat\u201d = raportul \u00eentreg, exportabil \u00een PDF (cerut de Manu, 21.10.2026).
   Fila Rezumat afi\u0219eaz\u0103, dup\u0103 semafor \u0219i h\u0103r\u021bile de teritoriu, TOATE capitolele propriet\u0103\u021bii, unul sub altul, \u00een ordinea din bara lateral\u0103,
   cu con\u021binutul complet (ca \u00een \u201eComplet\u201d). Sus: bara \u201eExport\u0103 PDF\u201d \u2014 butonul de tip\u0103rire a paginii (Salveaz\u0103 ca PDF, A4, c\u00e2te un capitol pe pagin\u0103)
   \u0219i linkul c\u0103tre PDF-ul preg\u0103tit (p/<id>/raport.pdf), c\u00e2nd exist\u0103.
   Capitolele din bara lateral\u0103 r\u0103m\u00e2n pagini separate: un clic pe ele din modul \u201eraport \u00eentreg\u201d deruleaz\u0103 la capitol.
   Se leag\u0103 de index.html prin: window.showTab (\u00eenvelit aici), D (proprietatea curent\u0103), nav#tabs, sec\u021biunile #<capitol>. Nu atinge #rezumat \u00een afar\u0103 de bara de sus. */
(function () {
  const NU = new Set(["rezumat", "builder", "surse", "stare"]);
  const orig = window.showTab;
  if (typeof orig !== "function") return;
  let intreg = false, eraSimplu = false;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pid = () => { try { return D.id; } catch (e) { return null; } };

  function css() {
    if ($("#rc-css")) return;
    const s = document.createElement("style"); s.id = "rc-css";
    s.textContent = `
#rc-bar{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px 14px}
#rc-bar b{font:600 14px var(--font)} #rc-bar .note{margin:0}
#rc-bar button,#rc-bar a.rc-btn{font:600 13px var(--font);padding:6px 12px;border-radius:8px;border:1px solid var(--fg);background:var(--fg);color:var(--bg);cursor:pointer;text-decoration:none}
#rc-bar a.rc-btn.sec{background:var(--panel);color:var(--fg);border-color:var(--line)}
body.raport-complet section.in-complet{padding-top:18px;border-top:2px solid var(--line)}
body.raport-complet section.in-complet:hover{border-top-color:var(--accent)}
.rc-cap{font:600 11px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--accent)}
@page{size:A4;margin:12mm}
@media print{
 *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
 body{background:#fff!important}
 .mbar,.brand,.wrap>nav#tabs,#rc-bar,#ui-mod,.bld-bar,.hm-ch,.sr-link,.mfoot,.hm-tip,#builder,#surse,#stare,.bar.months,.bar.hours{display:none!important}
 .wrap{display:block!important;max-width:none!important;padding:0!important}
 .wrap>header{display:block;border:0;padding:0}
 section{gap:10px!important}
 section.in-complet{border-top:0!important;padding-top:0!important}
 body.n-complet section.in-complet{break-before:page}
 body.n-simplu.raport-complet #negociere,body.n-simplu.raport-complet #evaluare,body.n-rezumat.raport-complet #negociere,body.n-rezumat.raport-complet #evaluare{display:none!important}
 /* Rezumat (~3 pagini) si Simplu (~9 pagini), 23.10: grila pe doua coloane, fiecare capitol un chenar compact, nerupt intre pagini */
 body.n-simplu.raport-complet .wrap,body.n-rezumat.raport-complet .wrap{display:grid!important;grid-template-columns:1fr 1fr!important;gap:4mm 5mm;align-items:start}
 body.n-simplu.raport-complet .wrap>*,body.n-rezumat.raport-complet .wrap>*{grid-column:1/-1}
 body.n-simplu.raport-complet .wrap>section.in-complet,body.n-rezumat.raport-complet .wrap>section.in-complet{grid-column:auto;break-inside:avoid;page-break-inside:avoid;padding:0!important;gap:5px!important;font-size:10.5px;min-width:0}
 body.n-simplu.raport-complet section.in-complet>.rc-cap,body.n-rezumat.raport-complet section.in-complet>.rc-cap{font-size:9px}
 body.n-simplu.raport-complet section.in-complet .hero,body.n-rezumat.raport-complet section.in-complet .hero{grid-template-columns:84px minmax(0,1fr)!important;gap:10px;padding:6px 10px 6px 6px;border-radius:10px}
 body.n-simplu.raport-complet section.in-complet .hero .ilu,body.n-rezumat.raport-complet section.in-complet .hero .ilu{width:84px;border-radius:8px;box-shadow:none}
 body.n-simplu.raport-complet section.in-complet .hero .hero-ph,body.n-rezumat.raport-complet section.in-complet .hero .hero-ph{width:84px;aspect-ratio:10/7}
 body.n-simplu.raport-complet section.in-complet .hero h2,body.n-rezumat.raport-complet section.in-complet .hero h2{font-size:15px!important}
 body.n-simplu.raport-complet section.in-complet .hero-k,body.n-rezumat.raport-complet section.in-complet .hero-k{font-size:9px}
 body.n-simplu.raport-complet section.in-complet .hero-v,body.n-rezumat.raport-complet section.in-complet .hero-v{font-size:10.5px;gap:5px}
 body.n-simplu.raport-complet section.in-complet .hero-v i,body.n-rezumat.raport-complet section.in-complet .hero-v i{font-size:8.5px;padding:2px 6px}
 body.n-simplu.raport-complet section.in-complet .hero-l,body.n-rezumat.raport-complet section.in-complet .hero-l,body.n-simplu.raport-complet section.in-complet .hero-c,body.n-rezumat.raport-complet section.in-complet .hero-c{display:none}
 body.n-simplu.raport-complet section.in-complet>.vh,body.n-rezumat.raport-complet section.in-complet>.vh,body.n-simplu.raport-complet section.in-complet>.verd,body.n-rezumat.raport-complet section.in-complet>.verd{display:none!important}
 body.n-simplu.raport-complet section.in-complet .cards,body.n-rezumat.raport-complet section.in-complet .cards{display:grid!important;grid-template-columns:1fr 1fr!important;gap:4px!important}
 body.n-simplu.raport-complet section.in-complet .card,body.n-rezumat.raport-complet section.in-complet .card{padding:5px 7px;gap:1px;border-radius:7px}
 body.n-simplu.raport-complet section.in-complet .card b,body.n-rezumat.raport-complet section.in-complet .card b{font-size:14px}
 body.n-simplu.raport-complet section.in-complet .card span,body.n-rezumat.raport-complet section.in-complet .card span{font-size:9.5px;line-height:1.25}
 body.n-simplu.raport-complet section.in-complet .card .tag,body.n-rezumat.raport-complet section.in-complet .card .tag{font-size:8px;padding:1px 5px;margin:0}
 /* Rezumat: doar antet + 4 cifre */
 body.n-rezumat.raport-complet section.in-complet>*{display:none!important}
 body.n-rezumat.raport-complet section.in-complet>.rc-cap,body.n-rezumat.raport-complet section.in-complet>.hero{display:grid!important}
 body.n-rezumat.raport-complet section.in-complet>.rc-cap{display:block!important}
 body.n-rezumat.raport-complet section.in-complet>.cards{display:grid!important}
 body.n-rezumat.raport-complet section.in-complet>.cards>.card:nth-child(n+5){display:none!important}
 body.n-rezumat.raport-complet #rezumat>#sumhart,body.n-rezumat.raport-complet #rezumat>#sumauto,body.n-rezumat.raport-complet #rezumat>#concluzii,body.n-rezumat.raport-complet #rezumat>#sumcards,body.n-rezumat.raport-complet #rezumat>#istoric,body.n-rezumat.raport-complet #rezumat>#ter,body.n-rezumat.raport-complet #rezumat>p.note{display:none!important}
 /* Simplu: antet + 4 cifre + o harta (sau desenul retragerilor / soarele), fara text */
 body.n-simplu.raport-complet section.in-complet>*{display:none!important}
 body.n-simplu.raport-complet section.in-complet>.rc-cap{display:block!important}
 body.n-simplu.raport-complet section.in-complet>.hero,body.n-simplu.raport-complet section.in-complet>.cards{display:grid!important}
 body.n-simplu.raport-complet section.in-complet>.cards>.card:nth-child(n+5){display:none!important}
 body.n-simplu.raport-complet section.in-complet>.hmh,body.n-simplu.raport-complet section.in-complet>.pz,body.n-simplu.raport-complet section.in-complet>.ch:first-of-type,body.n-simplu.raport-complet #urbanism>#retrageri,body.n-simplu.raport-complet #insorire>.box,body.n-simplu.raport-complet #inundatii>.two,body.n-simplu.raport-complet #pv>svg,body.n-simplu.raport-complet #zonare>.pz,body.n-simplu.raport-complet section.in-complet>.hm{display:block!important}
 body.n-simplu.raport-complet section.in-complet .hmh .hm-ch,body.n-simplu.raport-complet section.in-complet .hmh .hm-src,body.n-simplu.raport-complet section.in-complet .hmh .hm-lg,body.n-simplu.raport-complet section.in-complet .hm-t,body.n-simplu.raport-complet section.in-complet .pz .nt,body.n-simplu.raport-complet section.in-complet .pz .pzchips{display:none!important}
 body.n-simplu.raport-complet section.in-complet .hm-box{height:58mm;overflow:hidden;display:flex;align-items:center;border-radius:8px}
 body.n-simplu.raport-complet section.in-complet .hm-box .hm-c{width:100%;height:auto}
 body.n-simplu.raport-complet section.in-complet .pz{max-height:58mm;overflow:hidden;border-radius:8px}
 body.n-simplu.raport-complet #inundatii>.two{display:grid!important;grid-template-columns:1fr 1fr;gap:4px}
 body.n-simplu.raport-complet #inundatii>.two figcaption{display:none}
 body.n-simplu.raport-complet #insorire>.box{max-height:58mm;aspect-ratio:auto;overflow:hidden}
 body.n-simplu.raport-complet #insorire>.box canvas{width:100%;height:auto;margin-top:-18%}
 body.n-simplu.raport-complet #retrageri{padding:6px 8px}body.n-simplu.raport-complet #retrageri h3{font-size:12px}body.n-simplu.raport-complet #retrageri .rt-sub,body.n-simplu.raport-complet #retrageri .rt-l{display:none}
 body.n-simplu.raport-complet #rezumat>#sumauto,body.n-simplu.raport-complet #rezumat>#sumcards,body.n-simplu.raport-complet #rezumat>#istoric,body.n-simplu.raport-complet #rezumat>#ter,body.n-simplu.raport-complet #rezumat>p.note{display:none!important}
 body.n-simplu.raport-complet #sumhart .hm-box{max-height:95mm;overflow:hidden}
 body.n-simplu.raport-complet #semafor,body.n-rezumat.raport-complet #semafor{font-size:10px}
 body.n-simplu.raport-complet .wrap>*,body.n-rezumat.raport-complet .wrap>*{grid-row:auto!important}
 body.n-simplu.raport-complet .wrap>.mbar,body.n-rezumat.raport-complet .wrap>.mbar{order:-10}body.n-simplu.raport-complet .wrap>.brand,body.n-rezumat.raport-complet .wrap>.brand{order:-9}body.n-simplu.raport-complet .wrap>header,body.n-rezumat.raport-complet .wrap>header{order:-8}body.n-simplu.raport-complet .wrap>nav#tabs,body.n-rezumat.raport-complet .wrap>nav#tabs{order:-7}body.n-simplu.raport-complet .wrap>#rezumat,body.n-rezumat.raport-complet .wrap>#rezumat{order:-6}
 body.n-complet.raport-complet section.in-complet .fisa{font-size:9.5px}
 .hm-box,figure,.card,.ch,.verd,.fisa,table,.ublock,.st-box{break-inside:avoid}
 .fisa{font-size:11px}
}`;
    document.head.appendChild(s);
  }

  function capitole() {
    return [...document.querySelectorAll("nav#tabs [data-t]")].map(b => b.dataset.t)
      .filter(t => !NU.has(t) && document.getElementById(t) && !document.querySelector(`nav [data-t="${t}"]`).hidden && document.querySelector(`nav [data-t="${t}"]`).style.display !== "none");
  }

  async function barPdf(n) {
    const rez = $("#rezumat"); if (!rez) return;
    let bar = $("#rc-bar");
    if (!bar) { bar = document.createElement("div"); bar.id = "rc-bar"; rez.insertBefore(bar, rez.firstChild); }
    const id = pid(), url = id ? `p/${id}/raport.pdf` : null;
    let are = false;
    if (url) { try { const r = await fetch(url, { method: "HEAD" }); are = r.ok; } catch (e) { are = false; } }
    bar.innerHTML = `<b>Raportul \u00eentreg</b><span class="note">${n} capitole, de la rezumat la costuri, \u00een ordinea din bara lateral\u0103.</span>
      <button type="button" id="rc-print">Export\u0103 PDF (tip\u0103re\u0219te pagina)</button>
      ${are ? `<a class="rc-btn sec" href="${esc(url)}" download>Descarc\u0103 PDF-ul preg\u0103tit</a>` : ""}
      <span class="note" id="rc-msg">\u00cen fereastra de tip\u0103rire alege \u201eSalveaz\u0103 ca PDF\u201d, h\u00e2rtie A4; fiecare capitol \u00eencepe pe pagin\u0103 nou\u0103.</span>`;
    $("#rc-print").onclick = () => { try { window.print(); } catch (e) { $("#rc-msg").textContent = "Browserul a blocat tip\u0103rirea din pagin\u0103: folose\u0219te Cmd+P (Ctrl+P)."; } };
  }

  function monteaza() {
    css();
    intreg = true;
    document.body.classList.add("raport-complet");
    const lista = capitole(), rez = $("#rezumat");
    if (rez) rez.style.order = "0";
    lista.forEach((t, i) => { const s = document.getElementById(t); s.hidden = false; s.classList.add("in-complet"); s.style.order = String(10 + i);
      if (!s.querySelector(":scope > .rc-cap")) { const c = document.createElement("div"); c.className = "rc-cap"; const gr = (document.querySelector(`nav#tabs [data-t="${t}"]`)?.closest(".ng")?.querySelector(".nl")?.textContent || "").trim(); c.textContent = `capitolul ${(window.RIC_NR && RIC_NR[t]) || i + 1}${(window.RIC_GRUP && RIC_GRUP[t]) ? " \u00b7 " + RIC_GRUP[t].toLowerCase() : (gr ? " \u00b7 " + gr.toLowerCase() : "")}`; s.insertBefore(c, s.firstChild); } });
    barPdf(lista.length);
    try { if (typeof resize === "function") resize(); } catch (e) {}
    window.dispatchEvent(new Event("resize"));      // h\u0103r\u021bile \u0219i canvasul de \u00eensorire se redeseneaz\u0103 la l\u0103\u021bimea real\u0103
    setTimeout(() => window.dispatchEvent(new Event("resize")), 400);
  }
  function demonteaza() {
    if (!intreg) return;
    intreg = false;
    document.body.classList.remove("raport-complet");
    document.querySelectorAll("section.in-complet").forEach(s => { s.classList.remove("in-complet"); s.style.order = ""; s.querySelector(":scope > .rc-cap")?.remove(); });
    const rez = $("#rezumat"); if (rez) rez.style.order = "";
  }

  window.showTab = function (t) {
    demonteaza();
    orig(t);
    let ajuns; try { ajuns = curTab; } catch (e) { ajuns = t; }
    if (ajuns === "rezumat" && !document.body.classList.contains("revizie")) monteaza();   // in Revizie, capitolele raman separate (cerut 23.10)
  };

  // \u00een raportul \u00eentreg, un clic pe un capitol din bara lateral\u0103 deruleaz\u0103 la el (nu schimb\u0103 pagina)
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("nav#tabs [data-t]");
    if (!b || !intreg) return;
    const t = b.dataset.t, s = document.getElementById(t);
    if (NU.has(t) || !s || !s.classList.contains("in-complet")) return;
    e.preventDefault(); e.stopImmediatePropagation();
    s.scrollIntoView({ behavior: "smooth", block: "start" });
  }, true);

  // dac\u0103 pagina s-a deschis deja pe Rezumat, intr\u0103 \u00een raportul \u00eentreg dup\u0103 \u00eenc\u0103rcarea propriet\u0103\u021bii
  const t0 = setInterval(() => { try { if (D && typeof curTab !== "undefined" && curTab === "rezumat" && !intreg && $("#semafor") && !document.body.classList.contains("revizie")) { clearInterval(t0); window.showTab("rezumat"); } } catch (e) {} }, 500);
  setTimeout(() => clearInterval(t0), 30000);
  window.RIC_COMPLET = { monteaza, demonteaza };
})();
