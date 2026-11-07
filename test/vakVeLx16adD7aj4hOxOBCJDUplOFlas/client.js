/* Raport _ Cartea Casei - varianta pentru client (Manu, 23.10.2026, runda \u201eraport centrat, f\u0103r\u0103 surse\u201d).
   1. a\u0219ezare: meniul lateral porne\u0219te de sus (nu de sub prima pagin\u0103), raportul e centrat; concluziile \u0219i nota juridic\u0103 merg o singur\u0103 dat\u0103 la final;
   2. buton \u201eacas\u0103\u201d mereu vizibil + Esc: \u00eenchide orice fereastr\u0103 (alege pozele, revizie, aspect, vedere paralel\u0103) \u0219i duce la pagina principal\u0103;
      modurile Aspect / Revizie nu mai pornesc singure la redeschidere (de acolo venea \u201er\u0103m\u00e2ne blocat\u201d);
   3. sursele, notele, \u201ecum se cite\u0219te\u201d lungi \u0219i codurile QR nu apar la client; le vezi cu \u201earat\u0103 sursele (intern)\u201d din Instrumente;
      capitolele \u201esurse\u201d \u0219i \u201estarea datelor\u201d nu apar la client;
   4. poza capitolului: din 24.10.2026 banda 21:9 din hero.js + standard.css (PC31, E2). */
(function () {
  "use strict";
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const KS = "ric-surse";
  let surse = false;
  try { surse = localStorage.getItem(KS) === "1"; } catch (e) {}
  // modurile de lucru nu se mai restaureaza la deschidere
  try { localStorage.setItem("ric-aspect-on", "0"); localStorage.setItem("ric-revizie", "0"); } catch (e) {}

  const s = document.createElement("style"); s.id = "cl-css";
  /* grila, antetul capitolului (banda + panou) si print: in standard.css + hero.js (PC31, E2, 24.10.2026); aici raman doar regulile variantei client */
  s.textContent = `
.wrap>#rezumat{order:-1}
.wrap>#cl-final{order:990}.wrap>footer{order:999}
#cl-final{display:flex;flex-direction:column;gap:14px}
#cl-final>h2{font:800 26px var(--font);margin:6px 0 0;letter-spacing:-.02em}
#cl-home{position:fixed;left:14px;bottom:14px;z-index:100000;display:inline-flex;align-items:center;gap:8px;padding:9px 15px;border-radius:99px;border:0;background:#1a1e2a;color:#fff;font:700 13px var(--font);box-shadow:0 8px 24px -8px rgba(0,0,0,.5);cursor:pointer;text-transform:lowercase}
#cl-home:hover{background:#2c3446}
body:not(.cl-surse) .x-src,body:not(.cl-surse) nav [data-t="surse"],body:not(.cl-surse) nav [data-t="stare"],body:not(.cl-surse) section#surse,body:not(.cl-surse) section#stare{display:none!important}
.x-qr,#rep-foot-g .qr,#rep-foot-p .qr,[class*="qr"] canvas,[class*="qr"]>img{display:none!important}
#rezumat *,#cl-final *{text-transform:none!important}
@media print{#cl-home{display:none}}`;
  document.head.appendChild(s);
  if (!document.getElementById("cl-font")) { const l = document.createElement("link"); l.id = "cl-font"; l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap"; document.head.appendChild(l); }

  /* ---------- 3. surse / note: se marcheaza, nu se sterg ---------- */
  const RE = /^\s*(surs[a\u0103e](\s|:|$)|sursele|toate cele \d+ surse|date:|calculatorul dd|not[a\u0103](\s|:|$)|fundal:)/i;
  const CUM = /^\s*cum se cite/i;
  /* ce se sterge din texte, la client: trimiteri la hotarari, firme, furnizori de date */
  const CURATA = [/\s*[\u00b7,;]?\s*\bHCL\s*[\d_/.]+[^\u00b7;,)]*/g, /\s*[\u00b7,;]?\s*\bS\.?\s?C\.?\s+[^\u00b7;]*?S\.?\s?R\.?\s?L\.?/gi, /\s*Fundal:\s*satelit Esri\.?/g, /\s*\((IGR|OSM|INS|ANAR|Esri|OpenStreetMap)\)/g,
    /\s*\(proiectant[^)]*\)/gi, /\s*\(Eurostat[^)]*\)/g, /\bharta ANAR\b/g, /\s*\u00b7\s*satelit Esri[^\u00b7]*/g];
  function curata(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { if (n.parentElement && n.parentElement.closest("script,style,title,textarea,#rep-foot-p,#rep-foot-g")) continue;
      let t = n.nodeValue, o = t; CURATA.forEach(r => t = t.replace(r, "")); if (t !== o) n.nodeValue = t; }
  }
  function marcheaza() {
    $$("section p.note, section p.nt, section p.fs, section .fisa, section p.ev-s, section p.ev-p, section details, section .hero-c, section .hg-cr, section .hm-src, section .ub-n, section .attr, #cl-final p.cc-lg, #cl-final small").forEach(e => {
      if (e.classList.contains("x-src")) return;
      const t = e.textContent.trim(); if (CUM.test(t)) return;
      if (e.matches(".fisa, .hero-c, .hg-cr, .hm-src, .attr, p.note, p.nt, p.ev-s, #cl-final p.cc-lg, #cl-final small") || RE.test(t) || (e.tagName === "DETAILS" && /^(not[a\u0103]|surs)/i.test(t))) e.classList.add("x-src");
    });
    $$("section span.lg").forEach(e => { if (/\u00a9|openstreetmap|esri/i.test(e.textContent)) e.classList.add("x-src"); });
    $$("section .ev-sec").forEach(e => { if (/^\s*surse/i.test(e.querySelector("h3")?.textContent || "")) e.classList.add("x-src"); });
    $$("section a[href*='eurostat'], section a[href*='agerpres']").forEach(e => e.classList.add("x-src"));
    $$("section a").forEach(e => { if (/^\s*surs/i.test(e.textContent)) e.classList.add("x-src"); });
    $$("section b, section strong").forEach(e => { if (/^\s*surs[a\u0103e]\s*:?\s*$/i.test(e.textContent) && e.parentElement && !e.parentElement.matches("section")) e.parentElement.classList.add("x-src"); });
    $$("section [class*='qr'], #ter .tqr, footer [class*='qr']").forEach(e => e.classList.add("x-qr"));
    if (!surse) document.querySelectorAll(".wrap > section, #cl-final").forEach(curata);
    /* rezumatul: totul cu litere mici (siglele raman), inclusiv etichetele */
    if (window.mic) document.querySelectorAll("#rezumat, #cl-final").forEach(r => { const w = document.createTreeWalker(r, NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) { if (n.parentElement && n.parentElement.closest("script,style,title,textarea,input,select,option,svg")) continue; const t = n.nodeValue, m = window.mic(t); if (m !== t && /[A-Z\u0102\u00c2\u00ce\u0218\u021a]/.test(t)) n.nodeValue = m; } });
  }

  /* ---------- 1. concluziile + nota juridica o singura data, la final ---------- */
  function final() {
    const w = $(".wrap"); if (!w || typeof D === "undefined" || !D) return;
    let f = $("#cl-final"); if (!f) { f = document.createElement("div"); f.id = "cl-final"; f.innerHTML = `<h2>rezumat \u0219i concluzii</h2>`; w.appendChild(f); }
    ["#semafor", "#concluzii"].forEach(q => { const e = $("#rezumat > " + q); if (e) f.appendChild(e); });
    f.hidden = !f.querySelector("#semafor, #concluzii");
  }

  /* ---------- 2. acasa ---------- */
  function inchide() {
    $$("#ax-page.on, #ax-pick").forEach(e => { e.classList.remove("on"); if (e.id === "ax-pick") e.style.display = "none"; });
    $("#mp")?.remove();
    document.body.classList.remove("aspect", "revizie");
    try { localStorage.setItem("ric-aspect-on", "0"); localStorage.setItem("ric-revizie", "0"); } catch (e) {}
  }
  function acasa() { inchide(); if (location.hash || location.search) { location.href = location.pathname; } else window.scrollTo({ top: 0, behavior: "smooth" }); }
  function buton() {
    if ($("#cl-home")) return;
    const b = document.createElement("button"); b.id = "cl-home"; b.type = "button"; b.title = "pagina principal\u0103 (Esc)";
    b.innerHTML = "\u2190 pagina principal\u0103"; b.onclick = acasa; document.body.appendChild(b);
    document.addEventListener("keydown", e => { if (e.key === "Escape") inchide(); });
  }

  function comutaSurse(v) { surse = v === undefined ? !surse : v; try { localStorage.setItem(KS, surse ? "1" : "0"); } catch (e) {} document.body.classList.toggle("cl-surse", surse);
    const b = $("#mn-src"); if (b) b.textContent = surse ? "ascunde sursele (intern)" : "arat\u0103 sursele (intern)"; }
  function meniu() {
    const g = $("#ng-tools"); if (!g || $("#mn-src")) return;
    const b = document.createElement("button"); b.id = "mn-src"; b.type = "button"; b.onclick = () => comutaSurse(); g.appendChild(b); comutaSurse(surse);
  }

  function pas() { try { marcheaza(); final(); buton(); meniu(); } catch (e) { console.warn("client", e); } }
  document.body.classList.toggle("cl-surse", surse);
  setInterval(pas, 1200); pas();
  window.RIC_CLIENT = { acasa, inchide, comutaSurse };
})();
