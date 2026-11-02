/* Raport _ Cartea Casei - schema capitolelor (PC31, E1, 24.10.2026).
   Citeste schema_capitole.json (sursa unica: ordinea, grupurile, numerele, esential / informativ, top N, ce se arata la lipsa) si:
   1. da lista celorlalte module: window.RIC_SCHEMA_P (promisiune), RIC_SCHEMA, RIC_NR, RIC_GRUP, RIC_CLASA, RIC_STARE;
   2. reface meniul lateral din schema: grupurile in ordine, fiecare capitol cu numarul lui; capitolul fara date ramane in meniu, gri (3.8);
   3. capitolul esential fara date ramane, cu eticheta \u201ef\u0103r\u0103 registru local\u201d; cel informativ dispare (3.7);
   4. top N pe liste + randul \u201e\u0219i \u00eenc\u0103 k\u201d (3.2), trunchieri (3.1), lead max 240 (3.10), titlul fara coordonate brute (3.9);
   5. sub 600 px meniul se strange intr-un buton \u201ecapitole\u201d (3.12).
   Nu schimba datele; doar aseaza. */
(function () {
  "use strict";
  const $ = s => document.querySelector(s), $$ = (r, s) => [...(s ? r : document).querySelectorAll(s || r)];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const v = (document.currentScript && (document.currentScript.src.match(/[?&]v=(\d+)/) || [])[1]) || Date.now();
  const gD = () => { try { return D; } catch (e) { return null; } };

  /* ---------- 1. schema ---------- */
  window.RIC_SCHEMA_P = fetch("schema_capitole.json?v=" + v).then(r => { if (!r.ok) throw new Error("schema " + r.status); return r.json(); });
  let S = null, CAPS = [], R = { trunchiere: { h1: 48, rand_lista: 110, lead: 240, nota: 160 }, eticheta_lipsa: "f\u0103r\u0103 registru local", si_inca: "\u0219i \u00eenc\u0103 {k}" };
  window.RIC_STARE = {};
  window.RIC_SCHEMA_P.then(s => {
    S = s; CAPS = s.capitole || []; R = Object.assign(R, s.reguli || {});
    window.RIC_SCHEMA = s;
    window.RIC_NR = Object.fromEntries(CAPS.map(c => [c.id, c.nr]));
    window.RIC_GRUP = Object.fromEntries(CAPS.map(c => [c.id, c.grup]));
    window.RIC_CLASA = Object.fromEntries(CAPS.map(c => [c.id, c.clasa]));
    pas();
  }).catch(e => console.warn("schema", e));

  /* ---------- format numere (3.3): ro-RO, 0 zecimale peste 100, 1 sub 100, 2 sub 1; \u201e\u2014\u201d pentru lipsa ---------- */
  window.RIC_FMT = x => { if (x == null || x === "" || Number.isNaN(+x)) return "\u2014"; const n = +x, a = Math.abs(n), d = a >= 100 ? 0 : a >= 1 ? 1 : a === 0 ? 0 : 2;
    return n.toLocaleString("ro-RO", { minimumFractionDigits: 0, maximumFractionDigits: d }); };

  /* ---------- trunchiere pe caractere, cu titlul complet in title ---------- */
  function taie(el, n, propozitie) {
    if (!el || el.dataset.sxTr === String(n)) return;
    const full = el.textContent.replace(/\s+/g, " ").trim();
    if (full.length <= n) { el.dataset.sxTr = String(n); return; }
    let lim = n - 1;
    if (propozitie) { const p = full.slice(0, n).lastIndexOf(". "); if (p > n * 0.5) lim = p + 1; else { const w = full.slice(0, n - 1).lastIndexOf(" "); if (w > n * 0.6) lim = w; } }
    else { const w = full.slice(0, n - 1).lastIndexOf(" "); if (w > n * 0.75) lim = w; }
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let t, acc = 0, gata = false;
    while ((t = w.nextNode())) {
      const s = t.nodeValue.replace(/\s+/g, " ");
      if (gata) { t.nodeValue = ""; continue; }
      if (acc + s.length >= lim) { t.nodeValue = s.slice(0, Math.max(0, lim - acc)).replace(/[\s,;:\u00b7-]+$/, "") + (propozitie && full[lim - 1] === "." ? "" : "\u2026"); gata = true; }
      else acc += s.length;
    }
    if (!el.title) el.title = full;
    el.dataset.sxTr = String(n);
  }

  /* ---------- 3.9 titlul proprietatii, fara coordonate brute ---------- */
  const COORD = /-?\d{1,2}\.\d{3,}\s*,\s*-?\d{1,3}\.\d{3,}/;
  function titluLoc(Dd) {
    const e = String(Dd.eticheta || ""), U = Dd.urbanism || {}, A = U.adresa || {};
    const loc = A.localitate || U.uat || (Dd.seismic || {}).uat || "";
    if (COORD.test(e)) { const st = A.strada ? `parcela \u00b7 ${A.strada}${A.numar ? " " + A.numar : ""}` : "parcela"; return loc ? `${st}, ${loc}` : st; }
    const uat = U.uat || loc;
    return uat && !e.toLowerCase().includes(String(uat).toLowerCase()) ? `${e} \u00b7 ${uat}` : e;
  }
  function titluri() {
    const Dd = gD(); if (!Dd) return;
    const t = titluLoc(Dd), h = $("#name");
    if (h && h.dataset.sxId !== Dd.id + "|" + h.textContent) { if (COORD.test(h.textContent) || h.textContent === Dd.eticheta) { h.textContent = t; h.removeAttribute("data-sx-tr"); } h.title = Dd.eticheta; taie(h, R.trunchiere.h1); h.dataset.sxId = Dd.id + "|" + h.textContent; }
    $$("#prima .p2-k, #prima .p2-in h1").forEach(e => { if (COORD.test(e.textContent)) { const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (COORD.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(COORD, t); } taie(e, e.matches("h1") ? R.trunchiere.h1 : 110); });
  }

  /* ---------- 2. meniul din schema ---------- */
  function css() {
    if ($("#sx-css")) return;
    const s = document.createElement("style"); s.id = "sx-css";
    s.textContent = `
nav#tabs .sx-n{font:600 11px var(--mono);color:var(--muted);min-width:18px;display:inline-block;font-style:normal}
nav#tabs .sx-g>button,nav#tabs .sx-ph{display:flex!important;gap:6px;align-items:baseline}
nav#tabs .sx-off,nav#tabs .sx-g>button.sx-off[hidden]{display:flex!important;opacity:.42;cursor:default;pointer-events:none;filter:grayscale(1)}
nav#tabs .sx-ph{padding:5px 8px;font:600 13px var(--font);color:var(--muted);width:100%;box-sizing:border-box;justify-content:flex-start;text-align:left}
nav#tabs .sx-g>.nl{text-align:left!important;align-self:stretch}
body.generic nav#tabs .sx-off{opacity:1;pointer-events:auto;cursor:pointer;filter:none}
nav#tabs .sx-esen .sx-n::after{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--c-portocaliu,#c86a0a);margin-left:3px;vertical-align:2px}
section.sx-gol{display:none!important}
.sx-peste{display:none!important}body.cl-surse .sx-peste{display:revert!important}body.cl-surse .sx-inca{display:none!important}
.sx-inca,.sx-inca td{font:600 13px var(--font)!important;color:var(--muted)!important;text-align:left!important}
.sx-stub{border:1px dashed var(--line);border-radius:12px;padding:14px 16px;background:var(--panel);font:15px/1.5 var(--font)}
.sx-stub b{display:inline-block;font:700 12px var(--mono);padding:3px 10px;border-radius:99px;background:color-mix(in srgb,var(--c-rosu,#c0392b) 12%,transparent);color:var(--c-rosu,#c0392b);margin-bottom:6px}
#sx-capb{display:none}`;
    document.head.appendChild(s);
  }
  const btn = id => document.querySelector(`nav#tabs [data-t="${id}"]`);
  function meniu() {
    const nav = $("nav#tabs"); if (!nav || !CAPS.length) return;
    css();
    $("#ord-prio")?.remove();
    // butonul "capitole" (sub 600 px)
    if (!$("#sx-capb")) { const b = document.createElement("button"); b.type = "button"; b.id = "sx-capb"; b.textContent = "capitole"; b.setAttribute("aria-expanded", "false");
      b.onclick = () => { const o = nav.classList.toggle("sx-open"); b.setAttribute("aria-expanded", String(o)); }; nav.prepend(b);
      nav.addEventListener("click", e => { if (e.target.closest("[data-t]") && innerWidth < 600) { nav.classList.remove("sx-open"); b.setAttribute("aria-expanded", "false"); } }); }
    if (!nav.dataset.sxClk) { nav.dataset.sxClk = "1"; nav.addEventListener("click", e => { const p = e.target.closest("[data-sx-t]"); if (!p || !document.body.classList.contains("generic")) return;
      document.getElementById("gn-" + p.dataset.sxT)?.scrollIntoView({ behavior: "smooth", block: "start" }); }); }
    const rez = btn("rezumat"); let dupa = rez || $("#sx-capb");
    const grupuri = [...new Set(CAPS.map(c => c.grup))];
    grupuri.forEach(g => {
      let el = nav.querySelector(`.sx-g[data-g="${g}"]`);
      if (!el) { el = document.createElement("div"); el.className = "ng sx-g"; el.dataset.g = g; el.innerHTML = `<span class="nl">${esc(g)}</span>`; }
      if (dupa.nextElementSibling !== el) dupa.after(el);
      dupa = el;
      CAPS.filter(c => c.grup === g).forEach((c, i) => {
        let b = btn(c.id); const ph = nav.querySelector(`[data-sx-t="${c.id}"]`);
        if (b && ph) ph.remove();
        if (!b) { b = ph || document.createElement("span"); b.className = "sx-ph sx-off"; b.dataset.sxT = c.id; b.dataset.sxPh = "1"; }
        if (!b.dataset.sxLbl) { b.dataset.sxLbl = "1"; b.innerHTML = `<i class="sx-n">${String(c.nr).padStart(2, "0")}</i><span>${esc(c.scurt)}</span>`; b.title = c.titlu; }
        b.classList.toggle("sx-esen", c.clasa === "esential");
        const pos = el.children[i + 1]; if (pos !== b) el.insertBefore(b, pos || null);
      });
    });
    // grupurile vechi (din index.html) raman goale: se scot; \u201edespre raport\u201d si instrumentele raman la final
    $$(nav, ":scope > .ng:not(.sx-g):not(#ng-tools)").forEach(g => { if (!g.querySelector("[data-t]")) g.remove(); else nav.appendChild(g); });
    const tools = $("#ng-tools"); if (tools && tools !== nav.lastElementChild) nav.appendChild(tools);
  }

  /* ---------- 3. stare pe capitol: are date / fara registru local / gol ---------- */
  const REG = {};   // fisierele de registru verificate pe proprietate
  async function areFisier(id, f) { const k = id + "/" + f; if (k in REG) return REG[k]; REG[k] = null; try { const r = await fetch(`p/${id}/${f}`, { method: "HEAD" }); REG[k] = r.ok; } catch (e) { REG[k] = false; } return REG[k]; }
  function camp(Dd, p) { let o = Dd; for (const k of p.split(".")) { if (o == null) return undefined; o = o[k]; } return o; }
  const plin = x => x != null && x !== false && !(Array.isArray(x) && !x.length) && !(typeof x === "object" && !Array.isArray(x) && !Object.keys(x).length);
  function faraRegistru(Dd, c) {
    const L = c.registru_local || []; if (!L.length) return false;
    return L.some(r => /\.json$|\.jpg$|\.png$/.test(r) ? REG[Dd.id + "/" + r] === false : !plin(camp(Dd, r)));
  }
  const CONTINUT = ".rc-cap,.hero,.cn-hd,.vh,.verd,.hx-b,.sx-stub,.ax,.cc2-app,p.note,.x-src";
  function continut(sec) { return [...sec.children].some(e => !e.matches(CONTINUT) && e.textContent.trim().length > 0 && getComputedStyle(e).display !== "none" && e.offsetHeight > 0); }
  function stub(sec, c, Dd) {
    if (sec.dataset.sxStub === Dd.id && sec.querySelector(":scope > .sx-stub")) return;
    sec.dataset.sxStub = Dd.id; sec.classList.remove("sx-gol");
    const card = `<div class="sx-stub"><b>${esc(R.eticheta_lipsa)}</b><div>pentru acest UAT nu avem \u00eenc\u0103 datele capitolului \u201e${esc(c.titlu)}\u201d. capitolul r\u0103m\u00e2ne \u00een raport pentru c\u0103 e esen\u021bial; se trece \u0219i \u00een lista \u201ece lipse\u0219te\u201d de la final.</div></div>`;
    // ce exista deja (antetul, randul \u201enu avem \u00eenc\u0103 ...\u201d) ramane; cardul se adauga dedesubt
    if (sec.children.length) sec.insertAdjacentHTML("beforeend", card);
    else sec.innerHTML = `<div class="vh"><h2>${esc(c.titlu)}</h2></div>` + card;
  }
  function stare() {
    const Dd = gD(); if (!Dd || document.body.classList.contains("generic")) return;
    (CAPS.flatMap(c => c.registru_local || []).filter(r => /\.(json|jpg|png)$/.test(r))).forEach(f => areFisier(Dd.id, f));
    CAPS.forEach(c => {
      const b = btn(c.id) || document.querySelector(`nav#tabs [data-sx-t="${c.id}"]`); let sec = document.getElementById(c.id);
      const ascuns = !b || b.dataset.sxPh === "1" || b.hidden || b.style.display === "none";
      let are = !!sec && !ascuns && (sec.dataset.sxStub === Dd.id ? false : continut(sec));
      // capitolele care se construiesc tarziu (capitole_noi, cronologie) au nevoie de cateva secunde: nu se judeca inainte de 6 s de la incarcare
      const tanar = (Date.now() - (window.__sxT0 || 0)) < 6000;
      const st = { are, faraRegistru: faraRegistru(Dd, c), clasa: c.clasa, stub: false };
      if (!are && !tanar) {
        if (c.clasa === "esential") {
          if (!sec && b && b.dataset.sxPh !== "1") { sec = document.createElement("section"); sec.id = c.id; document.querySelector(".wrap").appendChild(sec); }
          if (sec && b && b.dataset.sxPh !== "1") { if (!continut(sec) || sec.dataset.sxStub === Dd.id) { stub(sec, c, Dd); b.hidden = false; st.stub = true; st.faraRegistru = true; } }
        } else if (sec && !ascuns) sec.classList.add("sx-gol");
      } else if (sec) sec.classList.remove("sx-gol");
      if (b) b.classList.toggle("sx-off", !st.are && !st.stub && !tanar);
      window.RIC_STARE[c.id] = st;
    });
    // raportul intreg: capitolele aparute dupa montare intra si ele
    if (document.body.classList.contains("raport-complet") && window.RIC_COMPLET) {
      const lipsa = CAPS.some(c => { const s = document.getElementById(c.id), b = btn(c.id); return s && b && b.dataset.sxPh !== "1" && !b.hidden && b.style.display !== "none" && (!s.classList.contains("in-complet") || !s.querySelector(":scope > .rc-cap")) && !s.classList.contains("sx-gol"); });
      if (lipsa && Date.now() - (window.__sxMont || 0) > 5000) { window.__sxMont = Date.now(); try { RIC_COMPLET.monteaza(); } catch (e) {} }   // cel mult o data la 5 s (monteaza redeseneaza hartile)
    }
  }

  /* ---------- ordinea in pagina = ordinea din schema (la print .wrap e bloc, deci conteaza ordinea din DOM, nu \u201eorder\u201d) ---------- */
  function ordine() {
    const w = document.querySelector(".wrap"); if (!w) return;
    const L = CAPS.map(c => document.getElementById(c.id)).filter(s => s && s.parentElement === w);
    const cur = [...w.children].filter(e => L.includes(e));
    if (cur.every((e, i) => e === L[i])) return;
    const dupa = document.getElementById("rezumat");
    let ref = dupa && dupa.parentElement === w ? dupa : null;
    L.forEach(s => { if (ref) ref.after(s); else w.appendChild(s); ref = s; });
  }

  /* ---------- 4. top N (3.2), trunchieri (3.1), lead (3.10) ---------- */
  function topN() {
    CAPS.forEach(c => { const sec = document.getElementById(c.id); if (!sec || !(c.top || []).length) return;
      c.top.forEach(t => {
        let rows; try { rows = $$(sec, t.sel).filter(r => !r.classList.contains("sx-inca")); } catch (e) { return; }
        if (t.bloc_text) rows = rows.filter(r => (r.parentElement.parentElement || r.parentElement).textContent.toLowerCase().includes(t.bloc_text));   // doar lista care incepe cu textul dat
        const grupe = new Map(); rows.forEach(r => { const p = r.parentElement; if (!grupe.has(p)) grupe.set(p, []); grupe.get(p).push(r); });
        grupe.forEach((L, p) => {
          const k = L.length - t.n, cheie = L.length + "|" + t.n;
          if (p.dataset.sxTop === cheie) return; p.dataset.sxTop = cheie;
          L.forEach((r, i) => r.classList.toggle("sx-peste", i >= t.n));
          [...p.children].filter(x => x.classList.contains("sx-inca")).forEach(x => x.remove());
          if (k <= 0) return;
          const txt = R.si_inca.replace("{k}", (window.RIC_FMT ? RIC_FMT(k) : k)) + " " + t.ce;
          const tag = L[0].tagName, e = document.createElement(tag === "TR" ? "tr" : tag === "LI" ? "li" : "div"); e.className = "sx-inca";
          e.innerHTML = tag === "TR" ? `<td colspan="99">${esc(txt)}</td>` : esc(txt); p.appendChild(e);
        });
      });
    });
  }
  const RANDURI = "#urbis .ub-l > li, #urbis .ub-acte li, .cn-l > div > span, .ulist > li, section .scroll td, #cc2-neg .ng-c li, .ublock li";
  function trunchieri() {
    $$(RANDURI).forEach(e => { if (e.closest(".sx-inca")) return; taie(e, R.trunchiere.rand_lista); });
    $$("section .hero-l, section > div > p.lead:not(.lead-dup), section > p.lead:not(.lead-jos), #prima .p2-sub, .hx-b .hero-l").forEach(e => taie(e, R.trunchiere.lead, true));
  }

  function pas() { try { if (!CAPS.length) return; meniu(); titluri(); stare(); ordine(); topN(); trunchieri(); } catch (e) { console.warn("schema", e); } }
  window.__sxT0 = Date.now();
  let idv = null;
  setInterval(() => { const Dd = gD(); if (Dd && Dd.id !== idv) { idv = Dd.id; window.__sxT0 = Date.now(); } pas(); }, 700);
  window.RIC_SCHEMA_UI = { pas, taie, titluLoc };
})();
