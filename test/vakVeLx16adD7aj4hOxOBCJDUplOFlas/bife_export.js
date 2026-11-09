/* Raportul Casei · modul opțional „bife” (bife_export.js v1.0.0, 09.11.2026). Blueprintul rămâne neatins: modulul se încarcă DOAR cu flagul bife=1 (sau sel=<cod>) și nu schimbă nimic fără el.
   Ce face: (1) bife pe fiecare element al raportului (strat suprapus, fără să mute nimic din pagină), (2) bifele rămân (localStorage „bife:<id raport>”),
   (3) PDF doar cu ce e bifat (refolosește pdf_export.js), (4) „Aplicație”: instantaneu pe server (funcția raport_selectie) + link + QR; link-ul cu sel=<cod> deschide raportul doar cu elementele alese, fără bife.
   Ce este „un element” (vezi CONTINUARE_2026-11-09_bife_export.md): figură/grafic (svg, canvas, img ≥150 px, figure, .hm, .hm-box, .pz, .tpan, .g7-map, .ch) · card/fereastră (.cards > *, .box, .rc, .g7-puz, .hero, .verd, .cc-scor, .g7-k, .g7-sint, .cr-e) · bloc de text (p, ul/ol, tabel, rând de text cu ≥3 cuvinte) · subsecțiune cu titlu (h2/h3/h4 = capul unui grup: bifa lui comută tot grupul până la următorul titlu).
   Capitolul „Date fine” și orice conținut privat/cu persoane NU au bife și nu intră în export. */
(function () {
  "use strict";
  if (window.parent !== window) return;
  const lg = (k, v) => { try { return v === undefined ? localStorage.getItem(k) : (v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v)); } catch (e) { return null; } };
  const ss = k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
  const hp = (() => { try { return new URLSearchParams((location.hash || "").replace(/^#/, "")); } catch (e) { return new URLSearchParams(""); } })();
  const sq = new URLSearchParams(location.search);
  const SEL = (hp.get("sel") || sq.get("sel") || ss("cc-sel") || "").match(/^[a-z0-9]{10}$/) ? (hp.get("sel") || sq.get("sel") || ss("cc-sel")) : "";
  const BIFE = !SEL && (hp.get("bife") === "1" || sq.get("bife") === "1" || lg("cc-bife") === "1");
  if (!BIFE && !SEL) return;
  if (hp.get("bife") === "1" || sq.get("bife") === "1") lg("cc-bife", "1");
  /* Manu, 09.11.2026: stratul de bife e valabil DOAR pentru Centura Sud / Plopi; la orice alt raport modulul nu face nimic */
  const PERMISE = ["cf_441155_timisoara"];
  const FN = "https://vzrozriarqocscpgfscw.supabase.co/functions/v1/raport_selectie";
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const A = () => window.CC_ACORDEON;
  const ID = () => { try { return (typeof D !== "undefined" && D && D.id) || ""; } catch (e) { return ""; } };

  /* ---------- reguli de element ---------- */
  const FIGC = ".hm,.hm-box,figure,.pz,.tpan,.g7-map,.ch";
  const CARD = ".bal,.box,.rc,.g7-puz,.hero,.verd,.cc-scor,.g7-k,.g7-sint";
  const SARI = "script,style,.rc-cap,.ac-pr,.ov,.ac-ct,.ac-mai,.bf-ignora,#cl-final,[class*=priv],[id*=priv],[class*=persoan],.g7-code,button,input,select,summary,nav";
  const cuv = el => (el.textContent || "").trim().split(/\s+/).filter(Boolean).length;
  const viz = el => el.classList.contains("bf-ascuns") || el.getClientRects().length > 0;
  const hash = s => { let h = 5381; s = String(s); for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  const semn = el => {
    if (el.matches("ul,ol")) return hash("L" + (el.getAttribute("aria-label") || "") + ((el.textContent || "").trim().slice(0, 12)));   // listele se încarcă pe parcurs: semnătura nu depinde de tot textul
    const t = (el.getAttribute("aria-label") || "") + "|" + (el.matches("img") ? (el.getAttribute("src") || "").split("/").pop().split("?")[0] : "") + "|" + (el.textContent || "").replace(/[^A-Za-zĂÂÎȘȚăâîșțŞŢşţ]+/g, "").slice(0, 40);   // doar litere: cifrele, orele și datele se schimbă (ora însoririi, contoare), titlurile nu
    return hash(t);
  };
  let EL = [], GR = [], CAPSV = [];   // elemente, grupuri (titluri), capitole
  function scaneaza() {
    const C = A().caps(), els = [], grs = [], capv = [];
    C.forEach((c, ci) => {
      if (c.privat || c.el.classList.contains("ac-gol")) return;
      const cap = { ci, t: c.t, el: c.el, els: [] }; capv.push(cap);
      const ord = new Map();
      c.s.forEach(id => {
        const s = document.getElementById(id); if (!s || s.hidden || s.dataset.acAre !== "1") return;
        let grp = null;
        const adauga = (el, tip) => {
          /* ordinalul numără doar elementele cu aceeași semnătură (aceeași secțiune, tag și hash): un element nou inserat mai sus nu mută cheile celorlalte */
          const sg = semn(el), k0 = [ci, id, el.tagName.toLowerCase(), sg].join("|"), n = ord.get(k0) || 0; ord.set(k0, n + 1);
          const e = { el, tip, ci, sid: id, key: `c${ci}|${id}|${el.tagName.toLowerCase()}|${n}|${sg}`, alt: `c${ci}|${id}|${el.tagName.toLowerCase()}|${sg}`, grp };
          if (grp) grp.m.push(e); els.push(e); cap.els.push(e);
        };
        const umbla = p => {
          [...p.children].forEach(c1 => {
            if (!viz(c1) || c1.matches(SARI)) return;
            if (c1.matches("h2,h3,h4")) { if ((c1.textContent || "").trim().length < 3) return; grp = { el: c1, m: [], ci, sid: id, nivel: +c1.tagName[1] }; grs.push(grp); cap.grs = (cap.grs || []).concat([grp]); return; }
            if (c1.matches(".cards")) { [...c1.children].forEach(x => { if (viz(x) && !x.matches(SARI) && cuv(x) + x.querySelectorAll("svg,img,canvas").length > 0) adauga(x, "card"); }); return; }
            if (c1.matches(".cr-l")) { $$(":scope > .cr-e", c1).forEach(x => { if (viz(x)) adauga(x, "card"); }); return; }
            if (c1.matches(CARD)) { adauga(c1, "card"); return; }
            if (c1.matches(FIGC) || c1.matches("svg,canvas") || (c1.matches("img") && (c1.classList.contains("bf-ascuns") || c1.getBoundingClientRect().width >= 150))) { if (c1.getBoundingClientRect().width >= 80 || c1.classList.contains("bf-ascuns")) adauga(c1, "fig"); return; }
            /* o grilă de carduri (copii cu aceeași clasă, fiecare cu text): fiecare copil e o fereastră */
            { const cl = x => String(x.className.baseVal ?? x.className).replace(/\b(ac-n2b?|bf-off|bf-ascuns)\b/g, "").replace(/\s+/g, " ").trim(), kids = [...c1.children].filter(x => viz(x) && !x.matches(SARI));
              if (kids.length >= 2 && !c1.matches("ul,ol,table,tbody,.scroll") && kids.every(k => k.tagName === kids[0].tagName && cl(k) && cl(k) === cl(kids[0]) && cuv(k) >= 3)) { kids.forEach(k => adauga(k, "card")); return; } }
            if (c1.querySelector(FIGC + ",svg[role=img],canvas,.cards,.box,.rc,.hero,img")) { umbla(c1); return; }
            if (c1.matches("table,.scroll,ul,ol,p") || cuv(c1) >= 3) {
              if (c1.matches("table,.scroll,ul,ol,p") || c1.children.length < 2 || [...c1.children].every(x => /^(SPAN|B|I|EM|SMALL|A|STRONG|LABEL|BR)$/.test(x.tagName))) { if (cuv(c1) >= 1 || c1.querySelector("img,svg")) adauga(c1, "txt"); return; }
              umbla(c1); return;
            }
          });
        };
        umbla(s);
      });
      cap.grs = (cap.grs || []).filter(g => g.m.length > 0);
    });
    EL = els; GR = els.length ? [...new Set(els.map(e => e.grp).filter(Boolean))] : []; CAPSV = capv.filter(c => c.els.length);
    { const live = new Set([...els.map(e => e.el), ...els.map(e => e.grp && e.grp.el).filter(Boolean), ...capv.map(c => c.el)]);
      $$(".bf-off,.bf-ascuns").forEach(x => { if (!live.has(x) && x.id !== "cl-final") x.classList.remove("bf-off", "bf-ascuns"); }); }   // structura s-a așezat altfel: fără clase rămase pe elemente care nu mai sunt ferestre
    $$("[data-bfk]").forEach(x => x.removeAttribute("data-bfk"));   // fără urme de la scanări anterioare (structura se poate așeza în timp)
    EL.forEach(e => { e.el.dataset.bfk = e.key; });
    GR.forEach(g => { g.el.dataset.bfk = "g|" + g.sid + "|" + hash((g.el.textContent || "").trim().slice(0, 80)); });
  }

  /* ---------- stare: lista celor debifate (implicit totul bifat) ---------- */
  const SK = () => "bife:" + ID();
  let OFF = new Set(), VZ = new Set();   // VZ = cheile văzute la ultima salvare: un element nou (apărut târziu) urmează capitolul lui (dacă tot ce se știa din capitol e debifat, e debifat și el)
  const incarca = () => { try { const j = JSON.parse(lg(SK()) || "null"); OFF = new Set((j && j.off) || []); VZ = new Set((j && j.vz) || []); } catch (e) { OFF = new Set(); VZ = new Set(); } };
  const salveaza = () => { lg(SK(), JSON.stringify({ v: 1, off: [...OFF], vz: EL.map(e => e.key) })); };
  const gasit = e => OFF.has(e.key) ? true : false;
  /* cheie care nu se mai găsește: ignorată; dacă s-a mutat doar ordinalul și semnătura (capitol, secțiune, tag, hash) e unică, se potrivește pe ea */
  function reconciliaza() {
    const un = new Map(); EL.forEach(e => un.set(e.alt, (un.get(e.alt) || 0) + 1));
    const alt = new Map(); [...OFF].forEach(k => { const m = k.split("|"); if (m.length === 5) { const a = m[0] + "|" + m[1] + "|" + m[2] + "|" + m[4]; alt.set(a, (alt.get(a) || 0) + 1); } });
    EL.forEach(e => { e.fb = false; e.off = OFF.has(e.key) || (un.get(e.alt) === 1 && alt.get(e.alt) === 1 && [...OFF].some(k => { const m = k.split("|"); return m.length === 5 && m[0] + "|" + m[1] + "|" + m[2] + "|" + m[4] === e.alt; })); });
    noi();
  }
  function noi() {
    if (!VZ.size) return;
    const per = new Map();
    EL.forEach(e => { if (VZ.has(e.key) || e.fb) { const o = per.get(e.ci) || { n: 0, on: 0 }; o.n++; if (!e.off) o.on++; per.set(e.ci, o); } });
    EL.forEach(e => { if (!VZ.has(e.key) && !e.fb) { const o = per.get(e.ci); if (o && o.n && !o.on) e.off = true; } });
  }
  const pornit = e => !e.off;
  const n1 = () => EL.filter(pornit).length;
  const capN = cap => { const t = cap.els.length, b = cap.els.filter(pornit).length; return { t, b }; };
  const grupB = g => g.m.some(pornit);
  function aplica() {   // estompare (bife) sau ascundere (instantaneu)
    const ascunde = !!SEL;
    EL.forEach(e => { e.el.classList.toggle("bf-off", !ascunde && !!e.off); e.el.classList.toggle("bf-ascuns", ascunde && !!e.off); });
    GR.forEach(g => { const on = grupB(g); g.el.classList.toggle("bf-off", !ascunde && !on); g.el.classList.toggle("bf-ascuns", ascunde && !on); });
    if (ascunde) CAPSV.forEach(c => c.el.classList.toggle("bf-ascuns", !c.els.some(pornit)));
  }
  const persista = () => { OFF = new Set(EL.filter(e => e.off).map(e => e.key)); salveaza(); };
  function poate(on, lista) { lista.forEach(e => { e.off = !on; }); persista(); aplica(); strat(); }

  /* ---------- stil ---------- */
  function css() {
    if ($("#bf-css")) return;
    const s = document.createElement("style"); s.id = "bf-css";
    s.textContent = `
.bf-off{opacity:.3!important;transition:opacity .15s}
.bf-ascuns,html body .wrap .bf-ascuns.bf-ascuns.bf-ascuns,html body .wrap section.ac-s .bf-ascuns.bf-ascuns.bf-ascuns{display:none!important}
#bf-layer{position:absolute;left:0;top:0;width:100%;height:0;z-index:8000;pointer-events:none}
body.bf-exp #bf-layer,body.cc-pdf #bf-layer,body.bf-exp #bf-bar,body.cc-pdf #bf-bar{display:none!important}
.bf-cb{all:unset;box-sizing:border-box;position:absolute;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;pointer-events:auto;touch-action:manipulation}
.bf-cb i{display:block;width:26px;height:26px;border-radius:7px;border:2.5px solid #1a1e2a;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.28);color:#fff;font:800 18px/21px -apple-system,system-ui,sans-serif;text-align:center;font-style:normal}
.bf-cb[aria-checked="true"] i{background:#1d5fb0;border-color:#174f94}.bf-cb[aria-checked="true"] i::after{content:"\\2713"}
.bf-cb[aria-checked="mixed"] i{background:#fff;color:#1d5fb0}.bf-cb[aria-checked="mixed"] i::after{content:"\\2212"}
.bf-cb:focus-visible i{outline:3px solid #b86a00;outline-offset:2px}
.bf-cb.cap i{width:30px;height:30px;font-size:21px;line-height:25px}
#bf-bar{position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:9600;display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;background:#fffdf8;color:#1a1e2a;border:1.5px solid #1a1e2a;border-radius:14px;padding:8px 10px;font:600 13px -apple-system,system-ui,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.22)}
#bf-bar b{font-weight:800}#bf-n{flex:1 0 100%;text-align:center}
#bf-bar button{font:700 13px -apple-system,system-ui,sans-serif;min-height:44px;padding:0 12px;border-radius:10px;border:1.5px solid #1a1e2a;background:#fff;color:#1a1e2a;cursor:pointer}
#bf-bar button.p{background:#1d5fb0;border-color:#174f94;color:#fff}
#bf-bar button:disabled{opacity:.5}
body.bf .wrap{padding-bottom:150px!important}
body.bf #ac-mod,body.bf #ac-cap,body.bf #ac-lista,body.bf .ac-mai,body.bf .ac-t::after{display:none!important}
body.bf .ac-h{cursor:default}
body.bf-sel #ac-mod,body.bf-sel #ac-cap,body.bf-sel #ac-lista,body.bf-sel .ac-mai,body.bf-sel .ac-t::after,body.bf-sel #cl-final{display:none!important}
body.bf-sel .ac-h{cursor:default}
#bf-ov{position:fixed;inset:0;z-index:99990;background:rgba(20,22,30,.72);display:flex;align-items:center;justify-content:center;padding:16px}
#bf-ov>div{background:#fffdf8;color:#1a1e2a;border-radius:16px;padding:18px;max-width:380px;width:100%;text-align:center;font:15px/1.45 -apple-system,system-ui,sans-serif}
#bf-ov input{width:100%;box-sizing:border-box;font:600 13px ui-monospace,Menlo,monospace;padding:10px;border:1.5px solid #1a1e2a;border-radius:8px;background:#fff;color:#1a1e2a}
#bf-ov button{margin:8px 4px 0;min-height:44px;padding:0 14px;border-radius:10px;border:1.5px solid #1a1e2a;background:#fff;color:#1a1e2a;font:700 14px -apple-system,system-ui,sans-serif}
#bf-ov button.p{background:#1d5fb0;border-color:#174f94;color:#fff}`;
    document.head.appendChild(s);
  }

  /* ---------- stratul cu căsuțe (în afara paginii; nu mută nimic) ---------- */
  const CB = new Map();   // obiect → buton
  function cb(obj, tip) {
    let b = CB.get(obj);
    if (!b) {
      b = document.createElement("button"); b.type = "button"; b.className = "bf-cb" + (tip === "cap" ? " cap" : ""); b.setAttribute("role", "checkbox"); b.innerHTML = "<i></i>";
      b.setAttribute("aria-label", tip === "cap" ? "bifează tot capitolul" : tip === "grp" ? "bifează subsecțiunea" : "bifează elementul");
      b.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); const l = tip === "cap" ? obj.els : tip === "grp" ? obj.m : [obj]; poate(!l.every(pornit), l); };
      $("#bf-layer").appendChild(b); CB.set(obj, b);
    }
    return b;
  }
  function strat() {
    if (SEL) return;
    let L = $("#bf-layer"); if (!L) { L = document.createElement("div"); L.id = "bf-layer"; document.body.appendChild(L); }
    const sx = scrollX, sy = scrollY, vis = new Set();
    const pune = (obj, tip, el, dx, dy) => {
      if (!el.isConnected || !el.getClientRects().length) return;
      const r = el.getBoundingClientRect(); if (r.width < 8 || r.height < 8) return;
      const b = cb(obj, tip); vis.add(obj);
      const l = tip === "cap" ? obj.els : tip === "grp" ? obj.m : [obj], on = l.filter(pornit).length;
      b.setAttribute("aria-checked", on === l.length ? "true" : on === 0 ? "false" : "mixed");
      b.style.left = Math.round(Math.min(r.right, innerWidth) + sx - 46 + dx) + "px"; b.style.top = Math.round(r.top + sy + 2 + dy) + "px";
    };
    CAPSV.forEach(cap => pune(cap, "cap", cap.el.querySelector(".ac-h") || cap.el, 0, 0));
    EL.forEach(e => pune(e, "el", e.el, 0, 0));
    GR.forEach(g => { if (g.m.length) pune(g, "grp", g.el, 0, 0); });
    CB.forEach((b, o) => { if (!vis.has(o)) { b.remove(); CB.delete(o); } });
    bara();
  }
  function bara() {
    let b = $("#bf-bar");
    if (!b) {
      b = document.createElement("div"); b.id = "bf-bar"; b.className = "bf-ignora"; b.setAttribute("role", "toolbar");
      b.innerHTML = `<span id="bf-n"></span><button type="button" data-a="tot">bifează tot</button><button type="button" data-a="nimic">debifează tot</button><button type="button" data-a="pdf" class="p">PDF</button><button type="button" data-a="app" class="p">Aplicație</button>`;
      document.body.appendChild(b);
      b.onclick = e => { const x = e.target.closest("button"); if (!x) return; const a = x.dataset.a; if (a === "tot") poate(true, EL); else if (a === "nimic") poate(false, EL); else if (a === "pdf") exportPdf(x); else if (a === "app") exportApp(x); };
    }
    $("#bf-n").innerHTML = `<b>${n1()}</b> din <b>${EL.length}</b> elemente`;
    b.style.bottom = $("#cc-tt-bar") ? "calc(64px + env(safe-area-inset-bottom))" : "";
  }

  /* ---------- export PDF doar cu ce e bifat ---------- */
  function ecran(t, butoane) {
    let o = $("#bf-ov"); if (!o) { o = document.createElement("div"); o.id = "bf-ov"; o.innerHTML = "<div></div>"; document.body.appendChild(o); }
    const d = o.firstChild; d.innerHTML = t; (butoane || []).forEach(([txt, f, p]) => { const x = document.createElement("button"); x.type = "button"; x.textContent = txt; if (p) x.className = "p"; x.onclick = f; d.appendChild(x); }); return o;
  }
  const inchide = () => $("#bf-ov")?.remove();
  async function exportPdf(btn) {
    const cap = CAPSV.filter(c => c.els.some(pornit));
    if (!cap.length) { ecran("Nu e bifat niciun element.", [["închide", inchide]]); return; }
    const a = A(); if (!window.CC_PDF || !a) { ecran("PDF-ul nu e disponibil în această versiune.", [["închide", inchide]]); return; }
    const idx = cap.map(c => c.ci).sort((x, y) => x - y), orig = a.pentruPdf, scos = [], sect = new Set();
    btn.disabled = true;
    document.body.classList.add("bf-exp");
    EL.forEach(e => e.el.classList.remove("bf-off")); GR.forEach(g => g.el.classList.remove("bf-off"));
    EL.forEach(e => e.el.classList.toggle("bf-ascuns", !!e.off)); GR.forEach(g => g.el.classList.toggle("bf-ascuns", !grupB(g)));
    const fin = $("#cl-final"); if (fin) fin.classList.add("bf-ascuns");
    window.CC_PDF_BIFE = true;
    a.pentruPdf = i => {   // același calcul ca înainte, apoi nivelul 2 bifat devine vizibil; secțiunile cu elemente bifate
      try { orig(i); } catch (e) {}
      const c = a.caps()[i], S = c.s.map(id => document.getElementById(id)).filter(s => s && !s.hidden && s.dataset.acAre === "1" && EL.some(e => e.el && s.contains(e.el) && pornit(e)));
      S.forEach(s => { s.classList.add("ac-lung"); sect.add(s); $$(".ac-n2", s).forEach(x => { scos.push(x); x.classList.remove("ac-n2"); }); });
      return S;
    };
    try { await window.CC_PDF.capitole(idx, `raport-${ID() || "proprietate"}-selectie.pdf`); }
    finally {
      a.pentruPdf = orig; window.CC_PDF_BIFE = false;
      scos.forEach(x => x.classList.add("ac-n2")); sect.forEach(s => s.classList.remove("ac-lung"));
      document.body.classList.remove("bf-exp"); if (fin) fin.classList.remove("bf-ascuns");
      aplica(); mentine(); strat(); btn.disabled = false;
    }
  }

  /* ---------- export ca aplicație: instantaneu pe server ---------- */
  async function exportApp(btn) {
    const chei = EL.filter(pornit).map(e => e.key);
    if (!chei.length) { ecran("Nu e bifat niciun element.", [["închide", inchide]]); return; }
    const s = window.CC_ADM;
    if (!s || !s.token) { ecran("Instantaneul se salvează cu sesiunea Admin. Deschide raportul cu QR-ul Admin.", [["închide", inchide]]); return; }
    btn.disabled = true; ecran("Salvez selecția…");
    try {
      const r = await fetch(FN, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "salveaza", token: s.token, raport_id: ID(), chei }) });
      const j = await r.json();
      if (!r.ok || !j.ok) { ecran("Nu s-a putut salva: " + (j.error || "eroare"), [["închide", inchide]]); return; }
      const link = location.origin + location.pathname.replace(/[^/]*$/, "") + "#r=" + ID() + "&sel=" + j.cod;
      let qr = ""; try { const q = window.qrcode(0, "M"); q.addData(link); q.make(); qr = q.createSvgTag({ scalable: true, margin: 2 }); } catch (e) {}
      const o = ecran(`<b>Aplicația cu selecția ta e gata</b> (${j.n} elemente, cod ${j.cod}).<div id="bf-q" style="width:200px;margin:10px auto;background:#fff">${qr}</div><input readonly value="${link}" aria-label="link" id="bf-l"><div style="font-size:13px;color:#4a5063;margin-top:8px">Se deschide doar pe dispozitivele unde ai deja sesiunea. Valabil 90 de zile.</div>`,
        [["copiază linkul", () => { const i = $("#bf-l"); i.select(); try { navigator.clipboard.writeText(link); } catch (e) { document.execCommand("copy"); } }, true], ["închide", inchide]]);
      const sv = $("#bf-q svg"); if (sv) { sv.style.width = "100%"; sv.style.height = "auto"; }
      window.BIFE_ULTIM = { cod: j.cod, link, n: j.n };
    } catch (e) { ecran("Nu s-a putut salva (fără internet?).", [["închide", inchide]]); }
    finally { btn.disabled = false; }
  }

  /* ---------- pornire ---------- */
  let pregatit = false, t1 = 0, memo = "";
  function mentine() {   // în modul bife se arată tot, ca la „mai mult”, pentru toate capitolele; fără să atingă logica din acordeon.js
    const a = A(); if (!a) return;
    if (!$("body.ac")) return;
    const m = $('#ac-mod button[data-m="Raport"]'); if (m && m.getAttribute("aria-pressed") !== "true" && !a.__bifeRaport) { a.__bifeRaport = 1; m.click(); }
    a.caps().forEach(c => { if (c.privat || c.el.classList.contains("ac-gol")) return; c.s.forEach(id => { const s = document.getElementById(id); if (s && s.dataset.acAre === "1") { if (!s.classList.contains("ac-lung") && !c.mai.dataset.on) s.classList.add("ac-lung"); if (stab < 4 && window.CC_LENES) { try { window.CC_LENES.arata(s); } catch (e) {} } } }); });
  }
  /* conținutul se construiește la derulare (încărcare întârziată): o singură trecere rapidă prin pagină, la început, ca structura (și cheile) să fie aceeași indiferent cât a derulat omul */
  let baleiat = 0;
  async function baleiaza() {
    baleiat = 1; const y0 = scrollY, h = () => document.documentElement.scrollHeight;
    try { for (let y = 0; y < h(); y += Math.round(innerHeight * .8)) { scrollTo(0, y); await new Promise(r => setTimeout(r, 140)); } await new Promise(r => setTimeout(r, 400)); } catch (e) {}
    scrollTo(0, y0); baleiat = 2; stab = 0; lastN = -1;
  }
  let SELD = null, SELP = false;
  async function incarcaSel() {
    if (SELP) return; SELP = true;
    try {
      const r = await fetch(FN, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "citeste", cod: SEL }) });
      const j = await r.json();
      if (!r.ok || !j.ok || (ID() && j.raport_id !== ID())) { ecran("Selecția nu mai e valabilă.", [["închide", inchide]]); return; }
      SELD = { set: new Set(j.chei || []), alt: new Set((j.chei || []).map(k => { const m = k.split("|"); return m[0] + "|" + m[1] + "|" + m[2] + "|" + m[4]; })) };
    } catch (e) { SELP = false; ecran("Nu s-a putut încărca selecția (fără internet?).", [["închide", inchide]]); }
  }
  function aplicaSel() {
    if (!SELD) return;
    const un = new Map(); EL.forEach(e => un.set(e.alt, (un.get(e.alt) || 0) + 1));
    EL.forEach(e => { e.off = !(SELD.set.has(e.key) || (un.get(e.alt) === 1 && SELD.alt.has(e.alt))); });
    aplica(); window.BIFE_SEL = { cod: SEL, n: EL.filter(pornit).length, N: EL.length, stabil: stab >= 6 };
  }
  let sig = "", lastN = -1, stab = 0;
  let pas = function () {
    const a = A(); if (!a || !a.oprit() || !ID() || !PERMISE.includes(ID())) return;
    if (document.body.classList.contains("cc-pdf") || document.body.classList.contains("bf-exp")) return;
    css(); document.body.classList.add(SEL ? "bf-sel" : "bf");
    mentine();
    if (SEL) incarcaSel();
    if (baleiat === 1) return;
    scaneaza();
    if (baleiat === 0 && stab >= 2) { baleiaza(); return; }
    if (EL.length !== lastN) { lastN = EL.length; stab = 0; } else stab++;
    if (!pregatit) { pregatit = true; incarca(); }
    if (SEL) { aplicaSel(); return; }
    reconciliaza();
    if (stab < 6) return;   // structura capitolelor se așază pe parcurs: bifele apar abia când numărul elementelor nu s-a mai schimbat ~9 s
    const s2 = EL.map(e => e.key + (e.off ? 0 : 1)).join(";");
    aplica(); if (s2 !== sig) { sig = s2; }
    strat();
  };
  /* fără sesiune sau fără raport complet modulul nu face nimic; se reface la fiecare schimbare de aspect */
  document.addEventListener("click", e => { if (!SEL && !BIFE) return; if (e.target.closest && e.target.closest(".ac-h") && document.body.classList.contains("bf")) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  document.addEventListener("click", e => { if (SEL && e.target.closest && e.target.closest(".ac-h")) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  const pas0 = pas; pas = function () { try { pas0(); } catch (e) { window.BIFE_ERR = String(e && e.stack || e).slice(0, 400); console.warn("bife", e); } };
  /* setTimeout în lanț, nu setInterval: v81_start.js oprește toate setInterval-urile pornite la încărcare după ce pagina s-a așezat */
  const bucla = () => { pas(); setTimeout(bucla, 1500); }; setTimeout(bucla, 1500);
  let rf = 0; const rfa = () => { cancelAnimationFrame(rf); rf = requestAnimationFrame(() => { if (BIFE && pregatit && !document.body.classList.contains("bf-exp")) strat(); }); };
  addEventListener("resize", rfa); addEventListener("load", rfa);
  try { new ResizeObserver(rfa).observe(document.documentElement); } catch (e) {}
  window.CC_BIFE = { versiune: "1.0.0", stabil: () => stab >= 6, elemente: () => EL.map(e => ({ key: e.key, tip: e.tip, ci: e.ci, bifat: pornit(e), text: (e.el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60) })), capitole: () => CAPSV.map(c => ({ ci: c.ci, t: c.t, n: c.els.length })), scaneaza: () => { scaneaza(); incarca(); reconciliaza(); aplica(); strat(); return EL.length; }, seteaza: (keys, on) => { const s = new Set(keys); poate(on, EL.filter(e => s.has(e.key))); }, pdf: () => exportPdf($("#bf-bar [data-a=pdf]")), app: () => exportApp($("#bf-bar [data-a=app]")) };
})();
