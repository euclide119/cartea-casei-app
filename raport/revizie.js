/* Raport _ Cartea Casei - modul Revizie (Manu, 23.10.2026): raportul se citeste pe capitole, nu ca PDF; la fiecare element
   (antet, cifre, harta, poza, grafic, desen, text, tabel, surse) o bara cu: OK / De imbunatatit / Incearca alta varianta + sugestie scrisa.
   Jos, panoul cu totalurile si butonul "Da toate cerintele in lucru": scrie lista in baza artefactului (colectia cereri), de unde o citeste Claude.
   Starea pe proprietate: db revizii/<id> (shared), cu rezerva localStorage cand pagina ruleaza fara baza. Nu se tipareste. */
(function () {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const $ = s => document.querySelector(s);
  const NU = new Set(["builder", "surse", "stare"]);
  let db = null, on = false, pid = null, R = {}, unsub = null, tSave = null;
  try { on = localStorage.getItem("ric-revizie") === "1"; } catch (e) {}

  /* ce e un element, in ordinea in care apare; tip -> [eticheta, a treia optiune] */
  const TIP = { antet: ["Antet / ilustra\u021bie", "Alt\u0103 imagine"], cifre: ["Cifre", "Alte cifre"], harta: ["Hart\u0103", "\u00cencearc\u0103 alt\u0103 hart\u0103"], poza: ["Poz\u0103", "Alt\u0103 poz\u0103"],
    grafic: ["Grafic", "Alt tip de grafic"], desen: ["Desen", "Alt desen"], text: ["Text", "Rescrie"], tabel: ["Tabel", "Alt\u0103 prezentare"], verdict: ["Verdict", "Alt verdict"], surse: ["Surse", "Alt\u0103 prezentare"], bloc: ["Bloc", "Alt\u0103 variant\u0103"] };
  const SEL = [[":scope > .hero", "antet"], [":scope > .verd", "verdict"], [":scope > .cards", "cifre"], [":scope > .hmh", "harta"], [":scope > .hm", "harta"], [":scope > .pz", "harta"],
    [":scope > .box", "harta"], [":scope > .two", "poza"], [":scope > #ip", "grafic"], [":scope > svg", "grafic"], [":scope > .charts > .ch", "grafic"], [":scope > .ch", "grafic"],
    [":scope > #retrageri", "desen"], [":scope > #urbis", "harta"], [":scope > #ind-box", "tabel"], [":scope > .ublock", "tabel"], [":scope > .scroll", "tabel"], [":scope > #fpunct", "tabel"],
    [":scope > .ex", "text"], [":scope > p.lead", "text"], [":scope > div > p.lead", "text"], [":scope > .fisa", "surse"],
    [":scope > #prima", "cifre"], [":scope > #sumhart", "harta"], [":scope > #sumauto", "harta"], [":scope > #semafor", "verdict"], [":scope > #concluzii", "text"], [":scope > #istoric", "poza"], [":scope > #ter", "harta"]];
  const ST = { ok: ["OK", "#1f8a4c"], imb: ["De \u00eembun\u0103t\u0103\u021bit", "#ef8a2a"], alt: ["", "#7a4ea3"] };

  function css() {
    if ($("#rv-css")) return;
    const s = document.createElement("style"); s.id = "rv-css";
    s.textContent = `
.rv{display:none}
body.revizie .rv{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin:-8px 0 4px;padding:6px 10px;border:1px dashed var(--line);border-radius:10px;background:color-mix(in srgb,var(--panel) 85%,#f4f0ff);font:12.5px var(--font)}
body.revizie .rv.s-ok{border-color:#1f8a4c;border-style:solid;background:color-mix(in srgb,#1f8a4c 7%,var(--panel))}
body.revizie .rv.s-imb{border-color:#ef8a2a;border-style:solid;background:color-mix(in srgb,#ef8a2a 8%,var(--panel))}
body.revizie .rv.s-alt{border-color:#7a4ea3;border-style:solid;background:color-mix(in srgb,#7a4ea3 8%,var(--panel))}
.rv .rv-k{font:700 10.5px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-right:2px}
.rv button{font:600 12px var(--font);padding:3px 10px;border-radius:99px;border:1px solid var(--line);background:var(--panel);color:var(--fg);cursor:pointer}
.rv button[aria-pressed="true"]{color:#fff;border-color:var(--c);background:var(--c)}
.rv .rv-n{flex:1 1 100%;display:none}
.rv.s-imb .rv-n,.rv.s-alt .rv-n,.rv.cu-nota .rv-n{display:block}
.rv textarea{width:100%;box-sizing:border-box;min-height:38px;font:13px/1.4 var(--font);padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--fg);resize:vertical}
.rv .rv-t{font:11px var(--mono);color:var(--muted);margin-left:auto}
body.revizie [data-rv]{outline:2px dashed transparent;outline-offset:3px;transition:outline-color .15s;border-radius:6px}
body.revizie [data-rv].rv-hi{outline-color:#7a4ea3}
#rv-p{display:none}
body.revizie #rv-p{display:flex;position:fixed;box-sizing:border-box;right:16px;bottom:16px;z-index:9000;flex-direction:column;gap:8px;width:280px;max-width:calc(100vw - 32px);padding:12px 14px;border-radius:14px;background:var(--panel);border:1px solid var(--line);box-shadow:0 14px 34px -12px rgba(0,0,0,.35);font:13px var(--font)}
#rv-p b.t{font:700 14px var(--font);padding-right:30px}
body.revizie #rv-p.mic{width:auto;padding:6px}
#rv-p .g{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;text-align:center}
#rv-p .g div{border-radius:8px;padding:5px 2px;background:color-mix(in srgb,var(--c) 10%,var(--panel))}
#rv-p .g b{display:block;font:700 18px var(--mono);color:var(--c)}#rv-p .g span{font-size:10.5px;color:var(--muted)}
#rv-p .bar{height:6px;border-radius:3px;background:var(--line);overflow:hidden}#rv-p .bar i{display:block;height:100%;background:#1f8a4c}
#rv-p button{font:700 13px var(--font);padding:8px 12px;border-radius:10px;border:0;background:#1a1e2a;color:#fff;cursor:pointer}
#rv-p button.sec{background:var(--panel);color:var(--fg);border:1px solid var(--line);font-weight:600}
#rv-p button:disabled{opacity:.45;cursor:default}
#rv-p .m{font-size:12px;color:var(--muted);margin:0}
#rv-p .x{display:flex;gap:6px}#rv-p .x button{flex:1}
body.revizie nav#tabs [data-t] .rv-b{margin-left:auto;font:700 10px var(--mono);padding:0 5px;border-radius:99px;color:#fff;background:#9aa1b5}
body.revizie nav#tabs [data-t] .rv-b.gata{background:#1f8a4c}
nav#tabs [data-t] .rv-b{display:none}body.revizie nav#tabs [data-t] .rv-b{display:inline-block}
body.revizie nav#tabs [data-t]{display:flex!important;align-items:center;gap:6px}
#ui-mod button[data-rvb][aria-pressed="true"]{background:#7a4ea3;color:#fff;border-color:#7a4ea3}
@media print{.rv,#rv-p{display:none!important}}`;
    document.head.appendChild(s);
  }

  const cheie = () => "ric-revizie-" + pid;
  async function incarca() {
    R = {};
    try { const t = localStorage.getItem(cheie()); if (t) R = JSON.parse(t) || {}; } catch (e) {}
    if (unsub) { try { unsub(); } catch (e) {} unsub = null; }
    if (db) {
      try { const s = await db.doc("revizii/" + pid).get(); if (s && s.exists) R = Object.assign(R, (s.data() || {}).el || {}); } catch (e) {}
      try { unsub = db.doc("revizii/" + pid).onSnapshot(s => { if (s && s.exists) { const el = (s.data() || {}).el || {}; let sch = false;
        for (const k in el) if (!R[k] || (el[k].t || 0) > (R[k].t || 0)) { R[k] = el[k]; sch = true; } if (sch) { reface(); panou(); } } }); } catch (e) {}
    }
    reface(); panou();
  }
  function salveaza() {
    try { localStorage.setItem(cheie(), JSON.stringify(R)); } catch (e) {}
    clearTimeout(tSave); tSave = setTimeout(async () => {
      if (!db) return;
      try { await db.doc("revizii/" + pid).set({ proprietate: pid, eticheta: (typeof D !== "undefined" && D && D.eticheta) || pid, el: R, actualizat: Date.now() }); } catch (e) { msg("Nu s-a putut salva \u00een baz\u0103; r\u0103m\u00e2ne \u00een acest browser."); }
    }, 600);
    panou();
  }

  /* ---------- elementele unui capitol ---------- */
  function capitole() { return [...document.querySelectorAll(".wrap > section[id]")].filter(s => !NU.has(s.id)); }
  function titluCap(sec) { return (sec.querySelector(":scope > .hero h2, :scope > .vh h2, :scope > div > h2, :scope > h2")?.textContent || sec.id).trim(); }
  function elemente(sec) {
    const out = [], vazut = new Set(), nr = {};
    SEL.forEach(([q, tip]) => sec.querySelectorAll(q).forEach(el => { if (vazut.has(el) || el.classList.contains("rv") || el.classList.contains("rc-cap")) return;
      if (el.matches("p.lead") && !el.textContent.trim()) return; vazut.add(el); out.push([el, tip]); }));
    out.sort((a, b) => a[0].compareDocumentPosition(b[0]) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
    return out.map(([el, tip]) => { nr[tip] = (nr[tip] || 0) + 1; return { el, tip, id: `${sec.id}:${tip}:${nr[tip]}`, et: eticheta(el, tip, nr[tip]) }; });
  }
  function eticheta(el, tip, n) {
    const t = tip === "antet" ? "" : (el.querySelector(".ch-t, .hm-t, .tt, h3, figcaption, .ub-t")?.textContent || "").trim();
    return `${TIP[tip][0]}${n > 1 ? " " + n : ""}${t ? " \u00b7 " + t.slice(0, 70) : ""}`;
  }

  function bara(e, sec) {
    const r = R[e.id] || {}, cls = "rv" + (r.s ? " s-" + r.s : "") + (r.n ? " cu-nota" : "");
    const d = document.createElement("div"); d.className = cls; d.dataset.for = e.id;
    d.innerHTML = `<span class="rv-k">${esc(e.et)}</span>` +
      [["ok", ST.ok[0]], ["imb", ST.imb[0]], ["alt", TIP[e.tip][1]]].map(([k, t]) => `<button type="button" data-s="${k}" style="--c:${ST[k][1]}" aria-pressed="${r.s === k}">${k === "ok" ? "\u2713 " : k === "imb" ? "\u270e " : "\u21bb "}${esc(t)}</button>`).join("") +
      `<button type="button" data-s="nota" title="Scrie o sugestie">💬 Sugestie</button>${r.trimis ? `<span class="rv-t">\u00een lucru din ${new Date(r.trimis).toLocaleDateString("ro-RO")}</span>` : ""}` +
      `<div class="rv-n"><textarea placeholder="Ce anume s\u0103 schimb\u0103m la acest element? (ex.: harta mai mare, alt fundal, arat\u0103 \u0219i \u0219colile, textul mai scurt)">${esc(r.n || "")}</textarea></div>`;
    d.addEventListener("click", ev => { const b = ev.target.closest("button[data-s]"); if (!b) return; const k = b.dataset.s;
      if (k === "nota") { d.classList.toggle("cu-nota"); d.querySelector("textarea").focus(); return; }
      const cur = R[e.id] || {}; const s2 = cur.s === k ? null : k;
      R[e.id] = Object.assign({}, cur, { s: s2, tip: e.tip, cap: sec.id, capitol: titluCap(sec), et: e.et, t: Date.now() }); if (!s2 && !cur.n) delete R[e.id];
      d.className = "rv" + (s2 ? " s-" + s2 : "") + ((R[e.id] && R[e.id].n) ? " cu-nota" : "");
      d.querySelectorAll("button[data-s]").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.s === s2)));
      if (s2 && s2 !== "ok") d.querySelector("textarea").focus(); salveaza(); });
    const ta = d.querySelector("textarea");
    ta.addEventListener("input", () => { const cur = R[e.id] || {}; R[e.id] = Object.assign({}, cur, { n: ta.value.trim(), tip: e.tip, cap: sec.id, capitol: titluCap(sec), et: e.et, t: Date.now() });
      if (!R[e.id].s && !R[e.id].n) delete R[e.id]; salveaza(); });
    d.addEventListener("mouseenter", () => e.el.classList.add("rv-hi")); d.addEventListener("mouseleave", () => e.el.classList.remove("rv-hi"));
    return d;
  }

  function reface() {
    if (!on) return;
    capitole().forEach(sec => {
      if (sec.hidden && !sec.classList.contains("in-complet")) return;
      elemente(sec).forEach(e => {
        e.el.dataset.rv = e.id;
        let nx = e.el.nextElementSibling;
        if (nx && nx.classList.contains("rv") && nx.dataset.for === e.id) { if (!nx.contains(document.activeElement)) { const nb = bara(e, sec); nx.replaceWith(nb); } return; }
        e.el.insertAdjacentElement("afterend", bara(e, sec));
      });
    });
    insigne();
  }
  function curata() { document.querySelectorAll(".rv").forEach(x => x.remove()); document.querySelectorAll("[data-rv]").forEach(x => x.removeAttribute("data-rv")); }

  function insigne() {
    document.querySelectorAll("nav#tabs [data-t]").forEach(b => { const k = b.dataset.t; if (NU.has(k)) return;
      const sec = document.getElementById(k); if (!sec) return;
      const ids = Object.keys(R).filter(x => x.startsWith(k + ":") && R[x].s), tot = sec.querySelectorAll(".rv").length || ids.length;
      let i = b.querySelector(".rv-b"); if (!i) { i = document.createElement("span"); i.className = "rv-b"; b.appendChild(i); }
      i.textContent = tot ? `${ids.length}/${tot}` : ""; i.classList.toggle("gata", tot > 0 && ids.length >= tot); });
  }

  /* ---------- panoul si trimiterea ---------- */
  function deTrimis() { return Object.entries(R).filter(([, r]) => !r.trimis && ((r.s && r.s !== "ok") || r.n)); }
  function panou() {
    if (!on) return;
    let p = $("#rv-p"); if (!p) { p = document.createElement("div"); p.id = "rv-p"; document.body.appendChild(p); }
    const v = Object.values(R), n = s => v.filter(r => r.s === s).length, tot = document.querySelectorAll(".rv").length, rev = v.filter(r => r.s).length, dt = deTrimis().length;
    if (p.classList.contains("mic")) { p.innerHTML = `<button type="button" class="sec" id="rv-mx">Revizie \u00b7 ${deTrimis().length} cerin\u021be \u25b4</button>`; $("#rv-mx").onclick = () => { p.classList.remove("mic"); panou(); }; return; }
    p.innerHTML = `<button type="button" class="sec" id="rv-mn" title="Restr\u00e2nge" style="position:absolute;top:8px;right:8px;padding:0 8px">\u25be</button><b class="t">Revizie \u00b7 ${esc((typeof D !== "undefined" && D && D.eticheta) || pid || "")}</b>
      <div class="g"><div style="--c:#1f8a4c"><b>${n("ok")}</b><span>OK</span></div><div style="--c:#ef8a2a"><b>${n("imb")}</b><span>de \u00eembun\u0103t\u0103\u021bit</span></div><div style="--c:#7a4ea3"><b>${n("alt")}</b><span>alt\u0103 variant\u0103</span></div><div style="--c:#2c5c9c"><b>${v.filter(r => r.n).length}</b><span>sugestii</span></div></div>
      <div class="bar" title="elemente revizuite"><i style="width:${tot ? Math.min(100, rev / tot * 100) : 0}%"></i></div>
      <p class="m">${rev} din ${tot || "\u2014"} elemente vizibile revizuite${dt ? ` \u00b7 <b>${dt}</b> cerin\u021be noi` : ""}.</p>
      <button type="button" id="rv-go" ${dt ? "" : "disabled"}>D\u0103 toate cerin\u021bele \u00een lucru (${dt})</button>
      <div class="x"><button type="button" class="sec" id="rv-cp">Copiaz\u0103 lista</button><button type="button" class="sec" id="rv-nx">Urm\u0103torul nerevizuit</button></div>
      <p class="m" id="rv-msg"></p>`;
    $("#rv-mn").onclick = () => { p.classList.add("mic"); panou(); };
    $("#rv-go").onclick = trimite; $("#rv-cp").onclick = copiaza; $("#rv-nx").onclick = urmator;
  }
  const msg = t => { const m = $("#rv-msg"); if (m) m.innerHTML = t; };
  function text(L) {
    const g = {}; L.forEach(([id, r]) => (g[r.capitol || r.cap] = g[r.capitol || r.cap] || []).push(r));
    return `Cerin\u021be de revizie \u00b7 ${(typeof D !== "undefined" && D && D.eticheta) || pid} \u00b7 ${new Date().toLocaleString("ro-RO")}\n` +
      Object.entries(g).map(([c, rs]) => `\n## ${c}\n` + rs.map(r => `- [${r.s === "imb" ? "de \u00eembun\u0103t\u0103\u021bit" : r.s === "alt" ? TIP[r.tip]?.[1] || "alt\u0103 variant\u0103" : "sugestie"}] ${r.et}${r.n ? ": " + r.n : ""}`).join("\n")).join("\n");
  }
  async function trimite() {
    const L = deTrimis(); if (!L.length) return;
    const b = $("#rv-go"); b.disabled = true; b.textContent = "Trimit\u2026";
    const lot = { proprietate: pid, eticheta: (typeof D !== "undefined" && D && D.eticheta) || pid, creat: Date.now(), stare: "trimis", n: L.length,
      cerinte: L.map(([id, r]) => ({ id, capitol: r.capitol || r.cap, element: r.et, tip: r.tip, stare: r.s || "sugestie", sugestie: r.n || "" })), text: text(L) };
    let ok = false;
    if (db) { try { await db.collection("cereri").add(lot); ok = true; } catch (e) { ok = false; } }
    const t = Date.now(); L.forEach(([id]) => { R[id] = Object.assign({}, R[id], { trimis: t }); });
    salveaza(); reface();
    if (ok) msg(`<b>${L.length} cerin\u021be trimise \u00een lucru.</b> Spune-i lui Claude \u201eia cerin\u021bele de revizie\u201d.`);
    else { try { await navigator.clipboard.writeText(lot.text); } catch (e) {} msg(`Baza nu e disponibil\u0103 aici: lista a fost copiat\u0103 \u00een clipboard. Lipe\u0219te-o \u00een conversa\u021bia cu Claude.`); }
  }
  async function copiaza() {
    const L = Object.entries(R).filter(([, r]) => (r.s && r.s !== "ok") || r.n); if (!L.length) { msg("Nu ai cerin\u021be de copiat."); return; }
    try { await navigator.clipboard.writeText(text(L)); msg("Lista e \u00een clipboard."); } catch (e) { msg("Browserul a blocat copierea."); }
  }
  function urmator() {
    const x = [...document.querySelectorAll(".rv")].find(d => !(R[d.dataset.for] && R[d.dataset.for].s));
    if (!x) { msg("Toate elementele vizibile sunt revizuite."); return; }
    const sec = x.closest("section"); if (sec && sec.hidden && typeof showTab === "function") showTab(sec.id);
    setTimeout(() => { const t = document.querySelector(`[data-rv="${CSS.escape(x.dataset.for)}"]`) || x; t.scrollIntoView({ behavior: "smooth", block: "center" }); }, 60);
  }

  /* ---------- comutatorul ---------- */
  function buton() {
    const g = $("#ui-mod"); if (!g || g.querySelector("[data-rvb]")) return;
    const b = document.createElement("button"); b.type = "button"; b.className = "bld-btn"; b.dataset.rvb = "1"; b.textContent = "Revizie"; b.title = "Bife \u0219i sugestii pe fiecare element";
    b.setAttribute("aria-pressed", String(on));
    b.onclick = () => { on = !on; try { localStorage.setItem("ric-revizie", on ? "1" : "0"); } catch (e) {} aplica(); };
    g.appendChild(b);
  }
  function aplica() {
    document.body.classList.toggle("revizie", on);
    $("#ui-mod [data-rvb]")?.setAttribute("aria-pressed", String(on));
    try { if (typeof showTab === "function" && typeof curTab !== "undefined") window.showTab(curTab); } catch (e) {}   // Revizie: un capitol pe ecran, nu raportul intreg
    if (on) { reface(); panou(); } else { curata(); $("#rv-p")?.remove(); }
  }

  async function porneste() {
    css();
    try { db = window.claude ? await window.claude.use("db") : null; } catch (e) { db = null; }
    setInterval(() => {
      buton();
      const id = (typeof D !== "undefined" && D) ? D.id : null;
      if (id && id !== pid) { pid = id; curata(); incarca(); }
      if (on && document.body.classList.contains("raport-complet") && window.RIC_COMPLET) { try { RIC_COMPLET.demonteaza(); window.showTab(typeof curTab !== "undefined" ? curTab : "rezumat"); } catch (e) {} }
      if (on && pid && id === pid && !document.activeElement?.closest?.(".rv")) { reface(); }
    }, 1500);
    aplica();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", porneste); else porneste();
  window.RIC_REVIZIE = { stare: () => R };
})();
