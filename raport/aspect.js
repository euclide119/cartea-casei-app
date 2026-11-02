/* Raport _ Cartea Casei - modul ASPECT (Manu, 23.10.2026).
   La fiecare capitol (si in raportul generic) poti: alege poza principala (pagina \u201eAlege pozele": nr capitol x nr poza), schimba inaltimea si latimea pozei,
   pozitia pozei in cadru, marimea textului, si MUTA separat titlul si textul (tragi cu mouse-ul sau cu degetul). Ajustarile se tin in baza artefactului
   (doc setari/aspect), cu rezerva localStorage; Claude le citeste de acolo si le aplica la versiunea urmatoare.
   API: window.RIC_ASPECT = { get(k), set(k, patch, silentios), reset(k), imagine(k), comuta(), alegere(k), pagina() };  window.mic(s) = text cu litere mici (pastreaza siglele).
   Eveniment "ric-aspect" {k, img?} cand trebuie reconstruit un banner sau un card. */
(function () {
  "use strict";
  const K = "ric-aspect", KON = "ric-aspect-on";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const $ = s => document.querySelector(s);
  let A = {}, db = null, on = false, tSave = null, IX = null;
  try { A = JSON.parse(localStorage.getItem(K) || "{}") || {}; } catch (e) {}
  try { on = localStorage.getItem(KON) === "1"; } catch (e) {}

  /* litere mici peste tot (cerut de Manu); siglele raman cu majuscule */
  const SIGLE = /\b(puz|pug|pud|anevar|ancpi|uat|cf|ran|lmi|rlu|cu|ac)\b/g;
  window.mic = s => String(s ?? "").toLowerCase().replace(/\b(puz|pug|pud|anevar|ancpi|uat|ran|lmi|rlu|pot|cut|ocpi|tva|cf)\b/g, m => m.toUpperCase());

  /* capitolele, numerotate ca in schema_capitole.json (schema.js); 0 = coperta; dupa ultimul capitol = elemente din capitole */
  let CAPN = [["rezumat", 0, "coperta raportului"]];
  if (window.RIC_SCHEMA_P) window.RIC_SCHEMA_P.then(S => { const L = (S.capitole || []).map(c => [c.id, c.nr, c.titlu]), n = L.length;
    CAPN = [["rezumat", 0, "coperta raportului"], ...L, ["retrageri", n + 1, "retragerile (\u00een urbanism)"], ["urbis", n + 2, "ce se mi\u0219c\u0103 \u00een zon\u0103 (\u00een urbanism)"], ["surse", n + 3, "surse"]]; }).catch(() => {});

  const get = k => A[k] || {};
  const dispatch = (k, extra) => window.dispatchEvent(new CustomEvent("ric-aspect", { detail: Object.assign({ k }, extra || {}) }));
  function salveaza() {
    try { localStorage.setItem(K, JSON.stringify(A)); } catch (e) {}
    clearTimeout(tSave); tSave = setTimeout(async () => { if (!db) return;
      try { await db.doc("setari/aspect").set({ aspect: A, actualizat: Date.now() }); } catch (e) {} }, 700);
  }
  function set(k, patch, silentios) {
    const imgSchimbat = patch && Object.prototype.hasOwnProperty.call(patch, "img");
    A[k] = Object.assign({}, A[k], patch, { t: Date.now() }); salveaza();
    if (!silentios) dispatch(k, { img: imgSchimbat });
  }
  function reset(k) { delete A[k]; salveaza(); dispatch(k, { img: true }); document.querySelectorAll(`[data-k="${k}"]`).forEach(e => e.style.transform = ""); }
  const imagine = k => (A[k] && A[k].img) || null;

  /* ---------- stil pe element ---------- */
  function stil(el, a, esteCard, parit) {
    const p = (n, v) => v == null ? el.style.removeProperty(n) : el.style.setProperty(n, v);
    p("--hh", a.h != null ? a.h + "px" : null); el.classList.toggle("cu-hh", a.h != null);
    p("--hw", a.w != null ? a.w + "%" : null); el.classList.toggle("cu-hw", a.w != null);
    p("--fy", a.fy != null ? a.fy + "%" : null); p("--fs", a.fs != null ? String(a.fs / 100) : null);
    p("--tx", a.tx != null ? a.tx + "%" : null); p("--ty", a.ty != null ? a.ty + "%" : null); el.classList.toggle("mv", a.tx != null && a.ty != null);
    p("--iw", a.iw != null ? a.iw + "%" : null);
    if (esteCard) el.classList.toggle("fl", a.fl != null ? !!a.fl : !!parit);
  }
  /* mutare libera (deplasare in px) pentru titlu si text: chei ht = titlu, pt = text, bt = blocul de text al bannerului */
  function deplasari(el, k) {
    const a = get(k);
    [["ht", "[data-mv=ht]"], ["pt", "[data-mv=pt]"], ["bt", "[data-mv=bt]"]].forEach(([key, sel]) => { const t = el.matches(sel) ? el : el.querySelector(sel); if (!t) return;
      const v = a[key]; t.style.transform = v ? `translate(${v.x}px,${v.y}px)` : ""; t.classList.toggle("mvd", !!v); t.style.position = v ? "relative" : ""; t.style.zIndex = v ? "3" : ""; });
  }
  function trageLiber(t, k, key) {
    if (t.dataset.drag) return; t.dataset.drag = "1";
    t.addEventListener("pointerdown", e => { if (!on || e.button > 0) return; if (e.target.closest("select,button,a,input,textarea")) return;
      const v0 = get(k)[key] || { x: 0, y: 0 }, sx = e.clientX, sy = e.clientY; t.setPointerCapture(e.pointerId); e.preventDefault(); e.stopPropagation();
      const muta = ev => { const x = Math.round(v0.x + ev.clientX - sx), y = Math.round(v0.y + ev.clientY - sy); set(k, { [key]: { x, y } }, true); deplasari(t, k); };
      const gata = () => { t.removeEventListener("pointermove", muta); t.removeEventListener("pointerup", gata); t.removeEventListener("pointercancel", gata); };
      t.addEventListener("pointermove", muta); t.addEventListener("pointerup", gata); t.addEventListener("pointercancel", gata); });
  }

  function css() {
    if ($("#ax-css")) return;
    const s = document.createElement("style"); s.id = "ax-css";
    s.textContent = `
/* ---- litere mici in interfata raportului ---- */
nav#tabs,nav#tabs *,.brand,.brand *,.rc-cap,#ng-tools,#ng-tools *,.hg-th,.hg-h,.ax,.ax *,#ax-bar,#ax-bar *,.pp-k,.pp-kick,.rv,.rv *,#rv-p,#rv-p *{text-transform:lowercase!important}
/* ---- aplicarea ajustarilor ---- */
.hero.hg.cu-hh .hg-ph{aspect-ratio:auto;max-height:none;height:var(--hh)}
.hero.hg.cu-hw .hg-ph{width:var(--hw);margin-inline:auto;border-radius:12px}
.hero.hg .hg-ph img{object-position:50% var(--fy,50%)}
.hero.hg .hg-ov h2{font-size:calc(clamp(26px,3.6vw,40px)*var(--fs,1))}
.hero.hg .hg-b.mvd{background:rgba(255,255,255,.9);border-radius:12px;box-shadow:0 10px 30px -12px rgba(0,0,0,.45);max-width:62%;padding:10px 14px}
.gn-t h2.mvd,.gn-t p.mvd,.gn-tx h1.mvd,.gn-tx p.mvd{text-shadow:0 1px 10px rgba(0,0,0,.25)}
.hero.hg.mv .hg-ov{inset:auto;left:var(--tx);top:var(--ty);transform:translate(-50%,-50%);width:max-content;max-width:80%;padding:14px 20px;border-radius:12px;background:rgba(10,14,24,.5);backdrop-filter:blur(2px)}
.gn-cov.cu-hh{aspect-ratio:auto;max-height:none;height:var(--hh)}
.gn-cov.cu-hw{width:var(--hw);margin-inline:auto}
.gn-cov img{object-position:50% var(--fy,50%)}
.gn-cov h1{font-size:calc(clamp(30px,4.6vw,52px)*var(--fs,1))}
.gn-cov.mv .gn-tx{position:absolute;left:var(--tx);top:var(--ty);transform:translate(-50%,-50%);max-width:72%}
.gn-c{grid-template-columns:var(--iw,57%) minmax(0,1fr)!important}
.gn-c.fl{grid-template-columns:minmax(0,1fr) var(--iw,57%)!important}.gn-c.fl .gn-i{order:2}
.gn-i img{object-position:50% var(--fy,50%)}
.gn-c .gn-t h2{font-size:calc(clamp(22px,2.4vw,30px)*var(--fs,1))}
/* ---- modul Aspect: comenzi ---- */
.ax{display:none}
body.aspect .ax{display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;padding:8px 12px;font:12px var(--font);background:color-mix(in srgb,#2c5c9c 7%,var(--panel));border-top:1px dashed color-mix(in srgb,#2c5c9c 40%,transparent)}
.ax b{font:700 10.5px var(--mono);letter-spacing:.08em;color:#2c5c9c}
.ax label{display:inline-flex;align-items:center;gap:6px;color:var(--muted)}
.ax input[type=range]{width:100px;accent-color:#2c5c9c}
.ax button{font:600 12px var(--font);padding:3px 10px;border-radius:99px;border:1px solid var(--line);background:var(--panel);color:var(--fg);cursor:pointer}
.ax .ax-h{font-size:11.5px;color:var(--muted);margin-left:auto}
body.aspect .hero.hg .hg-ov,body.aspect .gn-cov .gn-tx,body.aspect [data-mv]{cursor:move;touch-action:none;user-select:none}
body.aspect .hero.hg .hg-ov,body.aspect .gn-cov .gn-tx{outline:2px dashed rgba(255,255,255,.7);outline-offset:4px}
body.aspect [data-mv]:not(.hg-ov):not(.gn-tx){outline:2px dashed #2c5c9c;outline-offset:3px}
body.aspect .hero.hg .hg-ov *,body.aspect .gn-cov .gn-tx *{pointer-events:none}
body.aspect .gn-cov .gn-tx .gn-go,body.aspect .gn-cov .gn-tx .gn-go *{pointer-events:auto}
#ax-bar{display:none}
body.aspect #ax-bar{display:flex;position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:9500;gap:10px;align-items:center;padding:8px 14px;border-radius:99px;background:#1a1e2a;color:#fff;font:12.5px var(--font);box-shadow:0 10px 30px -10px rgba(0,0,0,.5)}
#ax-bar button{font:700 12px var(--font);padding:4px 12px;border-radius:99px;border:0;background:#ffb52e;color:#1a1e2a;cursor:pointer}
#ax-bar button.sec{background:rgba(255,255,255,.14);color:#fff}
/* ---- alegerea pozelor ---- */
#ax-pick{position:fixed;inset:0;z-index:9600;background:rgba(6,14,28,.78);display:none;align-items:center;justify-content:center;padding:18px}
#ax-pick.on{display:flex}
#ax-pick .ap{background:var(--panel);color:var(--fg);border-radius:16px;max-width:1100px;width:100%;max-height:calc(100dvh - 36px);display:flex;flex-direction:column;overflow:hidden}
#ax-pick header{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line);font:700 15px var(--font)}
#ax-pick header span{font:500 12px var(--font);color:var(--muted)}
#ax-pick header button{margin-left:auto;font:600 13px var(--font);padding:5px 14px;border-radius:99px;border:1px solid var(--line);background:var(--panel);color:var(--fg);cursor:pointer}
#ax-pick .bd{overflow:auto;padding:14px}
.ax-gr{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px}
.ax-gr button{padding:0;border:3px solid transparent;border-radius:10px;overflow:hidden;background:#ddd;cursor:pointer;position:relative;aspect-ratio:3/2}
.ax-gr button.on{border-color:#2c5c9c;box-shadow:0 0 0 2px #2c5c9c}.ax-gr img{width:100%;height:100%;object-fit:cover;display:block}
.ax-gr .nr{position:absolute;left:5px;top:5px;font:700 13px var(--mono);color:#fff;background:rgba(10,14,24,.78);padding:2px 8px;border-radius:99px}
.ax-gr .ft{position:absolute;right:5px;bottom:5px;font:600 10px var(--mono);color:#fff;background:rgba(31,138,76,.9);padding:1px 7px;border-radius:99px}
.ax-gr .st{position:absolute;right:5px;top:5px;font:700 12px var(--mono);color:#fff;background:#2c5c9c;padding:1px 7px;border-radius:99px}
.ax-cap{margin:22px 0 8px;font:800 18px var(--font);letter-spacing:-.01em}.ax-cap:first-child{margin-top:0}
.ax-cap small{font:500 12px var(--font);color:var(--muted);margin-left:8px}
.ax-more{margin:10px 0 0}.ax-more summary{cursor:pointer;font:600 12.5px var(--font);color:#2c5c9c}
#ax-page{position:fixed;inset:0;z-index:9550;background:var(--bg);overflow:auto;padding:0 0 60px;display:none}
#ax-page.on{display:block}
#ax-page .ph{position:sticky;top:0;z-index:2;background:var(--bg);border-bottom:1px solid var(--line);padding:12px 20px;display:flex;gap:14px;align-items:center;flex-wrap:wrap;font:700 16px var(--font)}
#ax-page .ph span{font:500 12.5px var(--font);color:var(--muted)}
#ax-page .ph button{margin-left:auto;font:700 13px var(--font);padding:6px 16px;border-radius:99px;border:0;background:#1a1e2a;color:#fff;cursor:pointer}
#ax-page .bd{max-width:1300px;margin:0 auto;padding:18px 20px}
@media print{.ax,#ax-bar,#ax-pick,#ax-page{display:none!important}}`;
    document.head.appendChild(s);
  }

  /* ---------- comenzile unui element ---------- */
  function slider(lbl, p, min, max, step) { return `<label>${lbl}<input type="range" data-p="${p}" min="${min}" max="${max}" step="${step || 1}"></label>`; }
  function comenzi(tip, k) {
    const ax = document.createElement("div"); ax.className = "ax"; ax.dataset.k = k; ax.dataset.tip = tip;
    ax.innerHTML = `<b>aspect</b>` +
      (tip === "card" ? slider("l\u0103\u021bime poz\u0103", "iw", 30, 75) + slider("poz\u0103 \u00een cadru", "fy", 0, 100) + slider("m\u0103rime titlu", "fs", 70, 170, 5) + `<button type="button" data-a="flip">\u21c4 poza st\u00e2nga/dreapta</button>`
        : slider("\u00een\u0103l\u021bime", "h", 160, 700, 10) + slider("l\u0103\u021bime", "w", 40, 100, 5) + slider("poz\u0103 \u00een cadru", "fy", 0, 100) + slider("m\u0103rime titlu", "fs", 70, 170, 5)) +
      `<button type="button" data-a="pick">alege poza</button><button type="button" data-a="rst">reseteaz\u0103</button>` +
      `<span class="ax-h">${tip === "card" ? "trage titlul \u0219i textul ca s\u0103 le mu\u021bi." : "trage titlul de pe poz\u0103 \u0219i textul de dedesubt ca s\u0103 le mu\u021bi."}</span>`;
    return ax;
  }
  function init(ax, el, tip) {
    const a = get(ax.dataset.k);
    ax.querySelectorAll("input[data-p]").forEach(i => { const p = i.dataset.p;
      let v = a[p]; if (v == null) { v = p === "h" ? Math.round((tip === "cover" ? el.getBoundingClientRect().height : (el.querySelector(".hg-ph")?.getBoundingClientRect().height)) || 380) : p === "fy" ? 50 : p === "fs" ? 100 : p === "w" ? 100 : 57; }
      i.value = v;
      i.oninput = () => { set(ax.dataset.k, { [p]: +i.value }, true); stil(el, get(ax.dataset.k), tip === "card", el.dataset.df === "1"); };
    });
    ax.onclick = e => { const b = e.target.closest("button[data-a]"); if (!b) return; const k = ax.dataset.k, f = b.dataset.a;
      if (f === "pick") alegere(k); else if (f === "rst") reset(k);
      else if (f === "flip") { set(k, { fl: !el.classList.contains("fl") }, true); stil(el, get(k), true, el.dataset.df === "1"); } };
  }

  function aplica() {
    document.querySelectorAll("section > .hero.hg").forEach(el => { const k = el.closest("section").id; el.dataset.k = k; stil(el, get(k), false);
      const ov = el.querySelector(".hg-ov"), bt = el.querySelector(".hg-b"); if (bt && !bt.dataset.mv) { bt.dataset.mv = "bt"; }
      if (!el.querySelector(":scope > .ax")) { const ax = comenzi("hero", k); el.appendChild(ax); init(ax, el, "hero"); }
      trageOverlay(el, ".hg-ov", ".hg-ph", k); if (bt) trageLiber(bt, k, "bt"); deplasari(el, k); });
    document.querySelectorAll("#generic .gn-cov").forEach(el => { el.dataset.k = "rezumat"; stil(el, get("rezumat"), false);
      let ax = el.nextElementSibling; if (!ax || !ax.classList.contains("ax")) { ax = comenzi("cover", "rezumat"); el.after(ax); init(ax, el, "cover"); }
      trageOverlay(el, ".gn-tx", null, "rezumat");
      const h = el.querySelector("h1"), p = el.querySelector(".gn-tx > p"); if (h) { h.dataset.mv = "ht"; trageLiber(h, "rezumat", "ht"); } if (p) { p.dataset.mv = "pt"; trageLiber(p, "rezumat", "pt"); } deplasari(el, "rezumat"); });
    document.querySelectorAll("#generic .gn-c").forEach(el => { const k = el.id.replace(/^gn-/, ""); el.dataset.k = k; stil(el, get(k), true, el.dataset.df === "1");
      let ax = el.nextElementSibling; if (!ax || !ax.classList.contains("ax")) { ax = comenzi("card", k); el.after(ax); init(ax, el, "card"); }
      const h = el.querySelector(".gn-t h2"), p = el.querySelector(".gn-t p"); if (h) { h.dataset.mv = "ht"; trageLiber(h, k, "ht"); } if (p) { p.dataset.mv = "pt"; trageLiber(p, k, "pt"); } deplasari(el, k); });
  }

  /* titlul de pe poza: pozitie in % in cadru */
  function trageOverlay(el, selTxt, selCadru, k) {
    const tx = el.querySelector(selTxt); if (!tx || tx.dataset.drag) return; tx.dataset.drag = "1";
    tx.addEventListener("pointerdown", e => { if (!on || e.button > 0) return; if (e.target.closest("select,button,a,input")) return;
      if (e.target.closest("[data-mv]") && e.target.closest("[data-mv]") !== tx) return;
      const cadru = selCadru ? el.querySelector(selCadru) : el, r = cadru.getBoundingClientRect(); tx.setPointerCapture(e.pointerId); e.preventDefault();
      const muta = ev => { const x = Math.max(8, Math.min(92, (ev.clientX - r.left) / r.width * 100)), y = Math.max(8, Math.min(92, (ev.clientY - r.top) / r.height * 100));
        set(k, { tx: Math.round(x), ty: Math.round(y) }, true); stil(el, get(k), false); };
      const gata = () => { tx.removeEventListener("pointermove", muta); tx.removeEventListener("pointerup", gata); tx.removeEventListener("pointercancel", gata); };
      tx.addEventListener("pointermove", muta); tx.addEventListener("pointerup", gata); tx.addEventListener("pointercancel", gata); muta(e); });
  }

  /* ---------- alegerea pozelor: numerotate pe capitol (nr capitol x nr poza) ---------- */
  function lista(k) {
    if (!IX) return { relevante: [], rest: [] };
    const o = (IX._ord || {})[k]; const T = {}; (IX._toate || []).forEach(x => { T[x.n] = x; });
    if (!o) return { relevante: [], rest: (IX._toate || []).map((x, i) => Object.assign({ pos: i + 1 }, x)) };
    const L = o.ordine.map((n, i) => Object.assign({ pos: i + 1 }, T[n]));
    return { relevante: L.slice(0, o.potrivite), rest: L.slice(o.potrivite) };
  }
  const butoane = (L, cur, k) => L.map(x => `<button type="button" data-k="${esc(k)}" data-f="${esc(x.f)}" class="${x.f === cur ? "on" : ""}" title="poza ${x.pos}${x.real ? " \u00b7 foto realist\u0103" : " \u00b7 ilustra\u021bie"}"><img src="ilu/${esc(x.t)}" alt="" loading="lazy"><span class="nr">${x.pos}</span>${x.real ? '<span class="ft">foto</span>' : ""}${x.f === cur ? '<span class="st">\u2605</span>' : ""}</button>`).join("");
  function curentaImg(k) {
    const i = imagine(k); if (i) return i;
    const v = (window.RIC_ASPECT_VARIANTA && RIC_ASPECT_VARIANTA(k)) || ""; if (v) return v;
    return ((IX && IX[k] && IX[k][0]) || {}).f || "";
  }
  function alegeLa(b) { set(b.dataset.k, { img: b.dataset.f }); }
  function alegere(k) {
    let p = $("#ax-pick"); if (!p) { p = document.createElement("div"); p.id = "ax-pick"; document.body.appendChild(p);
      p.addEventListener("click", e => { if (e.target === p || e.target.closest("[data-x]")) p.classList.remove("on"); }); document.addEventListener("keydown", e => { if (e.key === "Escape") p.classList.remove("on"); }); }
    const cn = CAPN.find(c => c[0] === k) || [k, "", k], { relevante, rest } = lista(k), cur = curentaImg(k);
    p.innerHTML = `<div class="ap"><header>${esc(mic("capitolul " + cn[1] + " \u00b7 " + cn[2]))} <span>numerele sunt pozi\u021biile din acest capitol: spune-mi \u201ecapitol ${cn[1]}, poza N\u201d</span><button type="button" data-x>\u00eenchide</button></header><div class="bd">` +
      `<div class="ax-cap">potrivite capitolului<small>${relevante.length} poze \u00b7 foto realist\u0103 primele</small></div><div class="ax-gr">${butoane(relevante, cur, k)}</div>` +
      `<details class="ax-more" ${rest.length && !relevante.length ? "open" : ""}><summary>toate celelalte poze (${rest.length})</summary><div class="ax-gr" style="margin-top:10px">${butoane(rest, cur, k)}</div></details></div></div>`;
    p.querySelectorAll(".ax-gr button").forEach(b => b.onclick = () => { alegeLa(b); p.classList.remove("on"); });
    p.classList.add("on");
  }
  /* pagina cu toate capitolele si pozele lor, ca sa alegi dintr-o privire */
  function pagina() {
    let g = $("#ax-page"); if (!g) { g = document.createElement("div"); g.id = "ax-page"; document.body.appendChild(g); document.addEventListener("keydown", e => { if (e.key === "Escape") g.classList.remove("on"); }); }
    g.innerHTML = `<div class="ph">alege pozele principale <span>capitol \u00d7 poz\u0103 \u00b7 \u2605 = aleasa acum \u00b7 \u201efoto\u201d = realist\u0103 \u00b7 se salveaz\u0103 la clic \u0219i r\u0103m\u00e2ne</span><button type="button" id="ax-px">gata</button></div><div class="bd">` +
      CAPN.map(c => { const k = c[0], { relevante, rest } = lista(k), cur = curentaImg(k);
        return `<div class="ax-cap" id="axc-${k}">capitolul ${c[1] === 0 ? "\u2014" : c[1]} \u00b7 ${esc(mic(c[2]))}<small>${relevante.length} potrivite din ${relevante.length + rest.length}</small></div><div class="ax-gr">${butoane(relevante, cur, k)}</div>` +
          (rest.length ? `<details class="ax-more"><summary>toate celelalte poze (${rest.length}), numerotate mai departe</summary><div class="ax-gr" style="margin-top:10px">${butoane(rest, cur, k)}</div></details>` : ""); }).join("") + `</div>`;
    g.querySelectorAll(".ax-gr button").forEach(b => b.onclick = () => { alegeLa(b);
      g.querySelectorAll(`.ax-gr button[data-k="${b.dataset.k}"]`).forEach(x => { x.classList.toggle("on", x === b); x.querySelector(".st")?.remove(); }); const s = document.createElement("span"); s.className = "st"; s.textContent = "\u2605"; b.appendChild(s); });
    $("#ax-px").onclick = () => g.classList.remove("on"); g.classList.add("on");
  }

  function bara() {
    if ($("#ax-bar")) return;
    const b = document.createElement("div"); b.id = "ax-bar";
    b.innerHTML = `<span>modul aspect: alege poze, trage titlul \u0219i textul, ajusteaz\u0103 dimensiunile \u2014 se salveaz\u0103 singur</span><button type="button" id="ax-al" class="sec">alege pozele</button><button type="button" id="ax-cp" class="sec">copiaz\u0103 ajust\u0103rile</button><button type="button" id="ax-off">gata</button>`;
    document.body.appendChild(b);
    $("#ax-off").onclick = () => comuta(false); $("#ax-al").onclick = pagina;
    $("#ax-cp").onclick = async () => { try { await navigator.clipboard.writeText(JSON.stringify(A, null, 1)); $("#ax-cp").textContent = "copiat"; } catch (e) { $("#ax-cp").textContent = "blocat"; } setTimeout(() => { $("#ax-cp").textContent = "copiaz\u0103 ajust\u0103rile"; }, 1600); };
  }
  function comuta(v) {
    on = v === undefined ? !on : v; try { localStorage.setItem(KON, on ? "1" : "0"); } catch (e) {}
    document.body.classList.toggle("aspect", on); if (on) { bara(); aplica(); }
    document.querySelectorAll("#mn-asp").forEach(b => b.setAttribute("aria-pressed", String(on)));
  }

  async function porneste() {
    css();
    try { const r = await fetch("ilu/index.json", { cache: "no-cache" }); if (r.ok) IX = await r.json(); } catch (e) {}
    try { db = window.claude ? await window.claude.use("db") : null; } catch (e) { db = null; }
    if (db) { try { const s = await db.doc("setari/aspect").get(); if (s && s.exists) { const d = (s.data() || {}).aspect || {};
      for (const k in d) if (!A[k] || (d[k].t || 0) >= (A[k].t || 0)) A[k] = d[k]; try { localStorage.setItem(K, JSON.stringify(A)); } catch (e) {} Object.keys(A).forEach(k => dispatch(k, { img: true })); } } catch (e) {} }
    document.body.classList.toggle("aspect", on); if (on) bara();
    setInterval(aplica, 800); aplica();
  }
  window.RIC_ASPECT = { get, set, reset, imagine, comuta, alegere, pagina, on: () => on, capitole: () => CAPN };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", porneste); else porneste();
})();
