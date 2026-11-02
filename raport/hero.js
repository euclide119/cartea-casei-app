/* Raport _ Cartea Casei - antetul capitolului (PC31 sec. 2, E2, 24.10.2026).
   Ecran: banda 21:9, max 400 px; titlul stanga sus (Fraunces); jos-stanga, peste poza, panoul cu 3-4 cifre-cheie (cardurile capitolului), lat cel mult 1/3.
   Sticky doar ultimii 120 px ai benzii: la derulare ramane o bara de titlu cu poza estompata (doar de la 900 px in sus).
   Sub 900 px cifrele trec sub poza; telefon (sub 600 px): poza 4:3, titlul sus, cifrele sub poza pe 2 coloane.
   Print: banda de 60 mm cu titlul si cifrele in panou, break-after: avoid. Stilurile stau in standard.css.
   Pastreaza alegerile din Aspect (poza, fy, inaltimea pana la 400 px, mutarea titlului) si tot ce face estetica.js (antetul .hero.hg).
   Poza lipsa sau stricata -> ilustratia vectoriala a capitolului (ilustratii.js), niciodata gol (3.5). */
(function () {
  "use strict";
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const mic = s => (window.mic ? window.mic(s) : String(s ?? "").toLowerCase());
  const V = (document.currentScript && (document.currentScript.src.match(/[?&]v=(\d+)/) || [])[1]) || Date.now();
  let IX = null;
  fetch("ilu/index.json").then(r => r.json()).then(j => IX = j).catch(() => {});

  /* standard.css: legat o data si mutat la sfarsitul lui <head>, ca sa fie dupa stilurile injectate de module */
  function foaie() {
    let l = document.getElementById("std-css");
    if (!l) { l = document.createElement("link"); l.id = "std-css"; l.rel = "stylesheet"; l.href = "standard.css?v=" + V; }
    if (document.head.lastElementChild !== l) document.head.appendChild(l);
  }

  const schema = () => (window.RIC_SCHEMA && RIC_SCHEMA.capitole) || [];
  const cap = k => schema().find(c => c.id === k);
  const VC = { "arat\u0103 bine": "#1f8a4c", "de verificat": "#c86a0a", "nu arat\u0103 bine": "#c0392b", "informativ": "#2c5c9c" };

  /* 3.3: zecimala cu virgula (0.20 -> 0,20); miile cu punct raman */
  const fmt = t => String(t).replace(/(\d)\.(\d{1,2})(?!\d)/g, "$1,$2").replace(/\s+/g, " ").trim();

  function poza(k) {
    const c = cap(k), al = c && c.poza_alias;
    const a = window.RIC_ASPECT && (RIC_ASPECT.imagine(k) || (al && RIC_ASPECT.imagine(al)));
    if (a) return "ilu/" + String(a).replace(/^ilu\//, "");
    const o = IX && IX._ord && (IX._ord[k] || (al && IX._ord[al]));
    return o && o.ordine && o.ordine.length ? `ilu/g/${o.ordine[0]}.webp` : null;
  }
  const culoare = k => { const c = cap(k), C = (window.ILU && ILU.COL) || {}; return C[k] || (c && C[c.poza_alias]) || "#2c5c9c"; };

  /* capitolele fara antet estetica (capitole_noi: .cn-hd) primesc aceeasi banda */
  function antetNou(sec) {
    if (sec.querySelector(":scope > .hero")) return;
    const c = cap(sec.id); if (!c) return;
    const old = sec.querySelector(":scope > .cn-hd"), h2 = old ? old.querySelector("h2") : sec.querySelector(":scope > .vh > h2, :scope > div > h2");
    // capitolele fara ilustratie in ilustratii.js (cronologie etc.) primesc banda din schema, dupa ce celelalte module au terminat
    const fara = !old && !(h2 && sec.dataset.sxStub) && !(window.ILU && ILU.are && ILU.are(sec.id)) && sec.children.length && (Date.now() - (window.__sxT0 || 0)) > 4000;
    if (!old && !(h2 && sec.dataset.sxStub) && !fara) return;
    const titlu = (h2 && h2.textContent.trim()) || c.titlu, src = poza(sec.id);
    const el = document.createElement("div"); el.className = "hero hg hx"; el.style.setProperty("--c", culoare(sec.id)); el.dataset.pr = "hx|" + src;
    el.innerHTML = `<figure class="hg-ph">${src ? `<img src="${esc(src)}" alt="" loading="lazy">` : ""}<figcaption class="hg-ov"><h2>${esc(mic(titlu))}</h2></figcaption></figure><div class="hg-b"></div>`;
    if (old) old.replaceWith(el); else { if (h2) h2.classList.add("h2-orig"); const rc = sec.querySelector(":scope > .rc-cap"); (rc ? rc : sec).insertAdjacentElement(rc ? "afterend" : "afterbegin", el); }
  }

  /* cardurile capitolului: primele 4 intra in panou */
  function carduri(sec) {
    const c = sec.querySelector(":scope > .cards") || sec.querySelector(":scope > .cn-b > .cn-k");
    return c ? [...c.children].filter(x => x.querySelector("b") && !x.classList.contains("sx-inca")) : [];
  }
  function item(x) {
    const b = x.querySelector("b"), sp = [...x.querySelectorAll("span")].find(s => !s.matches(".tag, .cc2-who") && s.textContent.trim());
    const tag = x.querySelector(".tag");
    let lbl = (sp ? sp.textContent : x.textContent.replace(b.textContent, "")).replace(/\s+/g, " ").trim();
    if (tag && !sp) lbl = lbl.replace(tag.textContent, "").trim();
    if (tag && tag.textContent.trim()) lbl = tag.textContent.trim() + " \u00b7 " + lbl;   // eticheta cardului (ex. \u201eo dat\u0103 la 10 ani\u201d) merge prima
    const full = lbl; if (lbl.length > 70) lbl = lbl.slice(0, 69).replace(/\s+\S*$/, "") + "\u2026";
    return `<div class="hx-i" title="${esc(full)}"><b>${esc(fmt(b.textContent))}</b><span>${esc(lbl)}</span></div>`;
  }
  function panou(sec, H) {
    const fig = H.querySelector(":scope > .hg-ph"); if (!fig) return;
    const src = carduri(sec), L = src.slice(0, 4), st = (window.RIC_STARE || {})[sec.id] || {};
    const vv = (sec.querySelector(":scope > .hx-b .hero-v i") || H.querySelector(".hero-v i"));
    const vt = vv ? vv.textContent.trim().toLowerCase() : "";
    const sig = L.map(x => x.textContent).join("|") + "|" + (st.faraRegistru ? 1 : 0) + "|" + vt;
    let p = fig.querySelector(":scope > .hx-k");
    if (p && p.dataset.sig === sig) return;
    src.forEach((x, i) => x.classList.toggle("hx-in", i < 4));
    const box = src[0] && src[0].parentElement; if (box) box.classList.toggle("hx-in-all", src.length > 0 && src.length <= 4 && [...box.children].every(x => x.classList.contains("hx-in") || !x.textContent.trim()));
    if (!L.length && !st.faraRegistru && !vt) { p && p.remove(); return; }
    if (!p) { p = document.createElement("div"); p.className = "hx-k"; fig.appendChild(p); }
    p.dataset.sig = sig;
    const et = [vt ? `<i class="hx-vd" style="--vc:${VC[vt] || "#2c5c9c"}">${esc(vt)}</i>` : "", st.faraRegistru ? `<i class="hx-reg">${esc(((window.RIC_SCHEMA || {}).reguli || {}).eticheta_lipsa || "f\u0103r\u0103 registru local")}</i>` : ""].join("");
    p.innerHTML = (et ? `<div class="hx-v">${et}</div>` : "") + (L.length ? `<div class="hx-g n${L.length}">${L.map(item).join("")}</div>` : "");
  }

  /* 3.5: poza lipsa -> desenul vectorial */
  function vector(sec, H) {
    const fig = H.querySelector(":scope > .hg-ph"); if (!fig || fig.querySelector(":scope > .hx-svg")) return;
    const img = fig.querySelector(":scope > img");
    const rau = !img || fig.classList.contains("fara") || (img.complete && img.naturalWidth === 0 && img.getAttribute("src"));
    if (!rau || !window.ILU) return;
    const c = cap(sec.id), k = (ILU.are && ILU.are(sec.id)) ? sec.id : (c && c.poza_alias) || sec.id;
    const d = document.createElement("div"); d.className = "hx-svg"; d.innerHTML = ILU.desen(k) || ""; fig.prepend(d); fig.classList.add("cu-svg");
  }

  function aranjeaza(sec) {
    antetNou(sec);
    const H = sec.querySelector(":scope > .hero.hg"); if (!H) return;
    H.classList.add("hx");
    // blocul de sub poza (verdict, lead, miniaturi) iese din banda, ca banda sa poata sta lipita sus
    const b = H.querySelector(":scope > .hg-b");
    if (b) { b.classList.add("hx-b"); $$(sec, ":scope > .hx-b").forEach(x => { if (x !== b) x.remove(); }); H.after(b); }
    else { const bb = sec.querySelector(":scope > .hx-b"); if (bb && bb.previousElementSibling !== H) H.after(bb); }
    // titlul benzii = titlul din schema (acelasi cu meniul si pagina principala)
    const h2 = H.querySelector(".hg-ov h2"), c = cap(sec.id);
    if (h2 && c) { const t = mic(c.titlu); if (h2.textContent !== t) h2.textContent = t; h2.title = t; }
    panou(sec, H); vector(sec, H);
  }

  /* sticky: doar ultimii 120 px ai benzii raman sus; de la 900 px in sus */
  const BARA = 120;
  function lipeste() {
    const lat = innerWidth >= 900, ac = document.getElementById("ac-bar"), top0 = ac && getComputedStyle(ac).position === "sticky" ? ac.offsetHeight : 0;
    $$(document, ".wrap > section > .hero.hx").forEach(H => {
      if (!lat || H.offsetParent === null) { H.style.removeProperty("--hx-top"); H.classList.remove("hx-stuck"); return; }
      const h = H.offsetHeight, t = top0 + Math.min(0, BARA - h);
      H.style.setProperty("--hx-top", t + "px");
      const r = H.getBoundingClientRect(), s = H.parentElement.getBoundingClientRect();
      H.classList.toggle("hx-stuck", r.top <= t + 1 && s.bottom > top0 + BARA + 40 && window.scrollY > 0 && H.parentElement.offsetHeight > h + 200);
    });
  }
  let raf = 0; const pl = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; lipeste(); }); };
  addEventListener("scroll", pl, { passive: true }); addEventListener("resize", pl);

  function toate() { foaie(); $$(document, ".wrap > section[id]").forEach(s => { try { aranjeaza(s); } catch (e) { console.warn("hero", s.id, e); } }); lipeste(); }
  addEventListener("ric-aspect", () => setTimeout(toate, 200));
  addEventListener("beforeprint", () => $$(document, ".hero.hx").forEach(H => H.classList.remove("hx-stuck")));
  foaie(); setInterval(toate, 900); setTimeout(toate, 300);
  window.RIC_HERO = { toate };
})();
