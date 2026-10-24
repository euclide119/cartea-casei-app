/* Raport \u00een cre\u0219tere \u2014 descrierea paginilor \u201evecin\u0103tate\u201d (date din vecinatate.py, seism.py \u0219i harta.py, \u00een date.json \u0219i harta.json).
   Un singur loc pentru textul, verdictul, cardurile, harta, graficele \u0219i tabelul fiec\u0103rui capitol; \u00eel folosesc at\u00e2t pagina
   interactiv\u0103 (index.html), c\u00e2t \u0219i PDF-ul de print (raport_pdf.html). Necesit\u0103 harta.js (HM) \u00eenc\u0103rcat \u00eenainte.
   def(X, H) \u00eentoarce: lead, verd [g|o|r, text], cards, charts [HTML], table, note. H = harta.json sau null. */
(function () {
  const HM = window.HM, nf = HM.nf, esc = HM.esc;
  const sg = v => (v > 0 ? "+" : "") + nf(v, 1) + "%";
  const lei = v => nf(v || 0) + " lei";
  const C = HM.colors;
  const cap = (t, h) => `<div class="ch"><div class="ch-t">${esc(t)}</div>${h}</div>`;
  /* harta hazardului seismic pe jude\u021b: fiecare UAT colorat dup\u0103 ag (valoarea P100 a celei mai apropiate localit\u0103\u021bi urbane: [IPOTEZ\u0102] pentru comune),
     peste fundalul satelit al jude\u021bului, cu epicentrele cutremurelor reale; se deseneaz\u0103 dup\u0103 ce sose\u0219te teritoriu.json */
  function hartaSeismJudet(lok, id, el) {
    fetch(`p/${id}/teritoriu.json`).then(r => r.ok ? r.json() : null).then(T => { if (!T || !T.judet) return;
      const bb = T.judet.bbox, k = Math.cos((bb[1] + bb[3]) / 2 * Math.PI / 180), W = 600, Hh = Math.round(W * (bb[3] - bb[1]) / ((bb[2] - bb[0]) * k));
      const X = lo => (lo - bb[0]) / (bb[2] - bb[0]) * W, Y = la => (bb[3] - la) / (bb[3] - bb[1]) * Hh;
      const ref = lok.filter(l => l.coord), AG = { 0.1: "#7fc8a9", 0.15: "#b9d96f", 0.2: "#f2c14e", 0.25: "#ee8c3a", 0.3: "#d9534f", 0.35: "#a8325e" };
      const agUat = ring => { let sx = 0, sy = 0; ring.forEach(p => { sx += p[0]; sy += p[1]; }); const cx = sx / ring.length, cy = sy / ring.length;
        let best = null, bd = 1e9; ref.forEach(l => { const d = Math.hypot((l.coord[1] - cx) * k, l.coord[0] - cy); if (d < bd) { bd = d; best = l; } }); return best ? best.ag : null; };
      const path = rings => rings.map(r => "M" + r.map(p => X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1)).join("L") + "Z").join("");
      let s = `<svg viewBox="0 0 ${W} ${Hh}" width="100%" role="img" aria-label="hazardul seismic pe UAT-urile jude\u021bului" style="display:block;border-radius:10px">`;
      s += `<image href="p/${id}/fundal_judet.jpg" x="0" y="0" width="${W}" height="${Hh}" preserveAspectRatio="none"/><rect width="${W}" height="${Hh}" fill="#fff" opacity=".25"/>`;
      T.uats.forEach(u => { const rs = typeof u.r === "string" ? JSON.parse(u.r) : u.r; if (!rs || !rs.length) return; const ag = u.ag != null ? +u.ag : agUat(rs[0]);
        s += `<path d="${path(rs)}" fill="${AG[ag] || "#ccc"}" fill-opacity="${u.siruta == T.uat_curent ? .78 : .5}" stroke="#fff" stroke-width="${u.siruta == T.uat_curent ? 2.4 : .8}"><title>${esc(u.nume)} \u00b7 ag \u2248 ${ag != null ? String(ag).replace(".", ",") + " g" : "\u2014"}</title></path>`; });
      (T.cutremure || []).filter(c => c[2] >= 3 && c[0] >= bb[0] && c[0] <= bb[2] && c[1] >= bb[1] && c[1] <= bb[3]).forEach(c => {
        s += `<circle cx="${X(c[0])}" cy="${Y(c[1])}" r="${(1.5 + Math.max(c[2] - 2.5, 0) * 3.2).toFixed(1)}" fill="#c62828" fill-opacity=".6" stroke="#fff" stroke-width="1"><title>cutremur ${String(c[2]).replace(".", ",")} \u00b7 ${c[3]}</title></circle>`; });
      const [px, py] = [X(T.pin[0]), Y(T.pin[1])];
      s += `<circle cx="${px}" cy="${py}" r="9" fill="#ff3b5c" stroke="#fff" stroke-width="3"/></svg>`;
      const lg = [[0.1, "0,10 g"], [0.15, "0,15 g"], [0.2, "0,20 g"], [0.25, "0,25 g"]].map(([v, t]) => `<span class="pzc" style="cursor:default"><b style="color:${AG[v]}">\u25a0</b> ${t}</span>`).join("") + `<span class="pzc" style="cursor:default"><b style="color:#c62828">\u25cf</b> cutremure de magnitudine 3+</span>`;
      el.innerHTML = `<div class="pzchips">${lg}</div>${s}<p class="nt">Fiecare comun\u0103 sau ora\u0219 e colorat dup\u0103 accelera\u021bia de proiectare ag din P100-1/2013; pentru comunele care nu apar \u00een tabel am luat valoarea celui mai apropiat ora\u0219 [IPOTEZ\u0102]. Punctele ro\u0219ii sunt cutremurele reale din catalogul ROMPLUS.</p>`;
    }).catch(() => {});
  }
  /* etichete l\u00e2ng\u0103 zonele mici, niciodat\u0103 peste ele: se \u00eencearc\u0103 dreapta / st\u00e2nga / sus / jos de contur, f\u0103r\u0103 suprapuneri, cu o linie de leg\u0103tur\u0103.
     items: { b: [x0, y0, x1, y1] (pixeli), t: text, c: culoare }; ocupat: dreptunghiuri de evitat (zonele mici, proprietatea, alte etichete) */
  function langa(items, S, ocupat) {
    const box = (ocupat || []).slice(), out = [], hit = b => box.some(q => b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1]);
    items.forEach(it => { const [x0, y0, x1, y1] = it.b, w = it.t.length * 6 + 8, h = 15, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const cand = [];
      [8, 26, 48].forEach(g => cand.push([x1 + g, cy - h / 2, "start", x1, cy], [x0 - g - w, cy - h / 2, "end", x0, cy], [cx - w / 2, y0 - g - h, "middle", cx, y0], [cx - w / 2, y1 + g, "middle", cx, y1],
        [x1 + g, y0 - g - h, "start", x1, y0], [x0 - g - w, y0 - g - h, "end", x0, y0], [x1 + g, y1 + g, "start", x1, y1], [x0 - g - w, y1 + g, "end", x0, y1]));
      const ok = cand.find(([bx, by]) => { const b = [bx, by, bx + w, by + h]; return bx > 2 && by > 2 && bx + w < S - 2 && by + h < S - 2 && !hit(b); });
      if (!ok) return; const [bx, by, a, lx, ly] = ok; box.push([bx - 2, by - 2, bx + w + 2, by + h + 2]);
      const tx = a === "start" ? bx + 3 : a === "end" ? bx + w - 3 : bx + w / 2, ax = a === "start" ? bx : a === "end" ? bx + w : bx + w / 2, ay = a === "middle" ? (by < ly ? by + h : by) : by + h / 2;
      out.push(`<line x1="${lx.toFixed(1)}" y1="${ly.toFixed(1)}" x2="${ax.toFixed(1)}" y2="${ay.toFixed(1)}" stroke="#1a1a1a" stroke-width="1" opacity=".75"/><text x="${tx.toFixed(1)}" y="${(by + h - 4).toFixed(1)}" font-size="10.5" font-weight="700" text-anchor="${a}" fill="${it.c || "#14301a"}" stroke="#fff" stroke-width="3.4" paint-order="stroke" style="font-family:var(--font);pointer-events:none">${esc(it.t)}</text>`); });
    return out.join("");
  }
  /* cerc de distan\u021b\u0103 \u00een contrast cu orice fundal: linie alb\u0103 lat\u0103 dedesubt, punctat \u00eenchis deasupra */
  const inel = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="3.2"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#1a1a1a" stroke-width="1.3" stroke-dasharray="6 4"/>`;
  /* fereastr\u0103 cu detalii la hover / atingere, pe orice element cu data-tip (text pe r\u00e2nduri desp\u0103r\u021bite de \u201e|\u201d) */
  if (typeof document !== "undefined" && !window.__vtip) { window.__vtip = true;
    const tip = document.createElement("div"); tip.className = "vtip"; tip.hidden = true; document.addEventListener("DOMContentLoaded", () => document.body.appendChild(tip)); if (document.body) document.body.appendChild(tip);
    const st = document.createElement("style"); st.textContent = `.vtip{position:fixed;z-index:50;max-width:280px;background:#1a1a1a;color:#fff;border-radius:10px;padding:9px 12px;font:12.5px/1.4 var(--font);box-shadow:0 8px 24px rgba(0,0,0,.25);pointer-events:none}.vtip b{display:block;font-size:13.5px;margin-bottom:2px}.vtip span{display:block;opacity:.85}[data-tip]{cursor:pointer}`; document.head.appendChild(st);
    const show = (e, el) => { const p = el.getAttribute("data-tip").split("|"); tip.innerHTML = `<b>${esc(p[0])}</b>${p.slice(1).map(x => `<span>${esc(x)}</span>`).join("")}`; tip.hidden = false;
      const x = e.clientX || (e.touches && e.touches[0].clientX) || 0, y = e.clientY || (e.touches && e.touches[0].clientY) || 0; tip.style.left = Math.min(x + 14, innerWidth - 296) + "px"; tip.style.top = Math.max(8, y - tip.offsetHeight - 12) + "px"; };
    document.addEventListener("mouseover", e => { const el = e.target.closest && e.target.closest("[data-tip]"); if (el) show(e, el); else tip.hidden = true; });
    document.addEventListener("mousemove", e => { const el = e.target.closest && e.target.closest("[data-tip]"); if (el && !tip.hidden) show(e, el); });
    document.addEventListener("touchstart", e => { const el = e.target.closest && e.target.closest("[data-tip]"); if (el) show(e, el); else tip.hidden = true; }, { passive: true }); }
  const NR = c => ({ sc: "\u0219coli", gr: "gr\u0103dini\u021be", li: "licee \u0219i universit\u0103\u021bi", mg: "magazine alimentare", mc: "mall-uri", fa: "farmacii", md: "unit\u0103\u021bi medicale", bn: "b\u0103nci \u0219i bancomate", rs: "restaurante \u0219i cafenele", pk: "parcuri \u0219i locuri de joac\u0103", sp: "s\u0103li de sport", tr: "sta\u021bii de transport", cu: "l\u0103ca\u0219uri de cult", ps: "oficii po\u0219tale \u0219i easybox", mo: "monumente", ut: "utilit\u0103\u021bi", pm: "benzin\u0103rii \u0219i pie\u021be" }[c] || c);
  /* fundal satelit al jude\u021bului (teritoriu.py, Timi\u0219: acela\u0219i dreptunghi pentru toate propriet\u0103\u021bile din jude\u021b) */
  const FM = X => X && X.fundal && typeof D !== "undefined" && D && D.id ? `p/${D.id}/${X.fundal}` : "";
  const FJ = () => typeof D !== "undefined" && D && D.id ? { img: `p/${D.id}/fundal_judet.jpg`, bb: [20.26196, 45.19303, 22.55143, 46.18997] } : {};
  const noH = "Harta cartierului nu e generat\u0103 pentru aceast\u0103 proprietate: ruleaz\u0103 raport.py --doar-vecinatate.";

  /* ---------- calculatorul de costuri (portat din DD/calculator_taxe/calc.py; benzile: OMJ 177/C/2024, Anexa 2 pct. I) ---------- */
  const RC = (() => {
    const BENZI = [[20000, v => Math.max(230, .022 * v)], [35000, v => 440 + .019 * (v - 20001)], [65000, v => 725 + .016 * (v - 35001)], [100000, v => 1205 + .015 * (v - 65001)],
      [200000, v => 1705 + .011 * (v - 100001)], [600000, v => 2805 + .009 * (v - 200001)], [Infinity, v => 6405 + .006 * (v - 600001)]];
    const onor = v => BENZI.find(([l]) => v <= l)[1](v);
    const PIZZA = { notar: "#2c5c9c", impozit: "#c84b31", intab: "#16868c", extras: "#e8a33d", agent: "#8e5ea2", credit: "#6b7280" };
    const stare0 = X => ({ pret: (X.exemplu && X.exemplu.pret) || 500000, prima: false, notarTva: true, scurt: (X.exemplu && X.exemplu.detinere || 5) <= 3, agent: false, credit: false });
    function model(st) {
      const p = Math.max(+st.pret || 0, 1000), rows = [];
      let o = onor(p); if (st.prima) o *= .70; o += 25; if (st.notarTva) o *= 1.21;
      rows.push({ k: "notar", label: "Onorariu notar" + (st.notarTva ? ", cu TVA" : ""), v: o, plata: "tu", marca: "HARD DATA" });
      rows.push({ k: "intab", label: "Intabulare (0,15%, min 60 lei)", v: Math.max(60, .0015 * p), plata: "tu", marca: "HARD DATA" });
      rows.push({ k: "extras", label: "Extras CF pentru autentificare", v: 40, plata: "tu", marca: "HARD DATA" });
      if (st.agent) rows.push({ k: "agent", label: "Comision agent: 2% + TVA 21%", v: .02 * p * 1.21, plata: "tu", marca: "ESTIMARE" });
      if (st.credit) rows.push({ k: "credit", label: "Credit ipotecar: evaluare \u0219i analiz\u0103 dosar", v: 1500, plata: "tu", marca: "ESTIMARE" });
      rows.push({ k: "impozit", label: `Impozit pe transfer (${st.scurt ? 3 : 1}%), \u00eel pl\u0103te\u0219te v\u00e2nz\u0103torul`, v: p * (st.scurt ? .03 : .01), plata: "v\u00e2nz\u0103torul", marca: "HARD DATA" });
      const tu = rows.filter(r => r.plata === "tu").reduce((a, r) => a + r.v, 0), vz = rows.filter(r => r.plata !== "tu").reduce((a, r) => a + r.v, 0);
      return { rows, tu, vz, p };
    }
    function iesire(st) {
      const m = model(st), tot = m.tu + m.vz;
      const dn = HM.donut(m.rows.map(r => ({ label: r.label + (r.marca === "ESTIMARE" ? " [estimare]" : ""), v: r.v, color: PIZZA[r.k] })), { pie: true, titlu: "", aria: "costurile tranzac\u021biei", centru: nf(tot) + " lei", centru2: nf(100 * tot / m.p, 1) + "% din pre\u021b", size: 190 });
      return `${dn.replace('class="dn"', 'class="dn keep"')}<dl class="kv rc-kv"><dt>Pl\u0103te\u0219ti tu, pe l\u00e2ng\u0103 pre\u021b</dt><dd>${lei(m.tu)}</dd><dt>Pl\u0103te\u0219te v\u00e2nz\u0103torul</dt><dd>${lei(m.vz)}</dd><dt>Pre\u021b + costurile tale</dt><dd><b>${lei(m.p + m.tu)}</b></dd></dl>`;
    }
    const opt = [["prima", "Prima cas\u0103: \u221230% la onorariul notarial (Anexa 5 OMJ 177/C/2024)"], ["notarTva", "Notarul e pl\u0103titor de TVA (+21% la onorariu)"], ["scurt", "V\u00e2nz\u0103torul a de\u021binut imobilul cel mult 3 ani (impozit 3%, nu 1%)"],
      ["agent", "Cu agent imobiliar: comision 2% + TVA [estimare uzual\u0103]"], ["credit", "Cu credit ipotecar: evaluare \u0219i analiz\u0103 dosar \u2248 1.500 lei [estimare]"]];
    function radacina(st) {
      if (typeof D === "undefined") return `<div class="rc"><div class="rc-out">${iesire(st)}</div><p class="nt">Ipoteze: pre\u021b ${lei(st.pret)}${st.notarTva ? ", notar cu TVA" : ""}${st.scurt ? ", v\u00e2nz\u0103tor cu de\u021binere \u2264 3 ani" : ""}. \u00cen aplica\u021bie po\u021bi schimba pre\u021bul \u0219i bifa ce se aplic\u0103.</p></div>`;
      return `<div class="rc"><div class="rc-in"><label class="rc-p">Pre\u021bul de cump\u0103rare <input type="number" data-rc="pret" min="10000" step="5000" value="${st.pret}"> lei</label>
        <input type="range" data-rc="pret_r" min="20000" max="1500000" step="5000" value="${Math.min(st.pret, 1500000)}" aria-label="Pre\u021b">
        <div class="rc-o">${opt.map(([k, t]) => `<label><input type="checkbox" data-rc="${k}"${st[k] ? " checked" : ""}> ${esc(t)}</label>`).join("")}</div></div><div class="rc-out">${iesire(st)}</div></div>`;
    }
    function citeste(root) { const q = k => root.querySelector(`[data-rc="${k}"]`);
      return { pret: +q("pret").value || 0, prima: q("prima").checked, notarTva: q("notarTva").checked, scurt: q("scurt").checked, agent: q("agent").checked, credit: q("credit").checked }; }
    if (typeof document !== "undefined") {
      if (!document.getElementById("rc-stil")) { const el = document.createElement("style"); el.id = "rc-stil";
        el.textContent = `.rc { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: 16px; align-items: start } .rc-in { display: flex; flex-direction: column; gap: 10px } .rc-p { font: 600 14px var(--font) } .rc-p input { font: 600 15px var(--mono); width: 130px; padding: 4px 8px; border: 1px solid var(--line); border-radius: 6px; background: var(--bg); color: var(--fg) }
          .rc-in input[type=range] { width: 100%; accent-color: var(--accent) } .rc-o { display: flex; flex-direction: column; gap: 6px } .rc-o label { font-size: 13px; display: flex; gap: 8px; align-items: flex-start; cursor: pointer } .rc-o input { margin-top: 3px; accent-color: var(--accent) } .rc-kv { margin-top: 10px }
          @media (max-width: 720px) { .rc { grid-template-columns: 1fr } }`; document.head.appendChild(el); }
      if (!window.__rcInit) { window.__rcInit = true;
        const on = ev => { const t = ev.target, root = t && t.closest && t.closest(".rc"); if (!root || !t.dataset || !t.dataset.rc) return;
          const n = root.querySelector('[data-rc="pret"]'), r = root.querySelector('[data-rc="pret_r"]');
          if (t === r) n.value = r.value; else if (t === n) r.value = Math.min(+n.value || 0, +r.max);
          root.querySelector(".rc-out").innerHTML = iesire(citeste(root)); };
        document.addEventListener("input", on); document.addEventListener("change", on); }
    }
    return { stare0, radacina, model, iesire };
  })();
  window.RIC_COST = RC;

  const VEC = [
    { k: "facilitati", t: "Facilit\u0103\u021bi \u00een proximitate", el: "facilitati", map: "facilitati", qr: "Ce ai la pas \u00een jurul propriet\u0103\u021bii, actualizat, pe site", def: (X, H) => ({
      lead: "Ce ai la pas: cel mai apropiat loc din fiecare categorie, cu distan\u021ba real\u0103 pe jos, pe str\u0103zi. Harta arat\u0103 zonele comerciale \u0219i industriale din jur.",
      verd: [X.scor >= 70 ? "g" : X.scor >= 40 ? "o" : "r", `Scor la pas: ${X.scor}/100.` + (X.categorii.some(c => !c.cel) ? " Unele categorii nu au niciun loc \u00een raz\u0103." : "")],
      cards: [[X.scor + "/100", "scor la pas"], ...X.categorii.filter(c => c.cel).sort((a, b) => a.cel.m - b.cel.m).slice(0, 3).map(c => [c.cel.min + " min", c.cat.toLowerCase() + " \u00b7 " + c.cel.nume])],
      charts: [cap("Minute pe jos p\u00e2n\u0103 la cel mai apropiat loc", HM.bars(X.categorii.map(c => ({ label: c.cat, v: c.cel ? c.cel.min : 0, txt: c.cel ? `${c.cel.min} min \u00b7 ${c.cel.nume}` : "nimic \u00een raz\u0103", color: c.cel ? "var(--accent)" : "var(--line)" })), { max: 40, lw: 175 })),
        ...(H ? [cap("C\u00e2te locuri sunt \u00een 1 km", HM.bars(Object.entries(H.n["1000"]).filter(([c]) => !["ut", "mo"].includes(c)).sort((a, b) => b[1] - a[1]).map(([c, v]) => ({ label: NR(c), v, color: C.PC[c] })), { lw: 150 }))] : [])],
      table: { h: ["Categoria", "Cel mai aproape", "Pe jos", "\u00cen raz\u0103"], r: X.categorii.map(c => [c.cat, c.cel ? c.cel.nume : "\u2014", c.cel ? nf(c.cel.m) + " m \u00b7 " + c.cel.min + " min" : "nimic \u00een " + nf(c.raza) + " m", String(c.nr)]) },
      note: X.sursa + ". " + X.nota }) },
    { k: "transport", t: "Transport \u0219i artere", el: "transport", map: "transport", qr: "Timpii de deplasare de la proprietate, pe site", def: (X, H) => ({
      top: H && H.iso_auto ? cap("Cu ma\u0219ina: unde ajungi \u00een 5, 10 \u0219i 15 minute (f\u0103r\u0103 trafic)", HM.autoMap(H, typeof D !== "undefined" && D && D.id ? `p/${D.id}/` : "")) : "",
      lead: "C\u00e2t faci p\u00e2n\u0103 la locurile importante ale ora\u0219ului, cu ma\u0219ina \u0219i pe jos, ce sta\u021bii ai aproape \u0219i pe ce artere te ajunge. Harta arat\u0103 arterele cu nume, sta\u021biile, tramvaiul \u0219i calea ferat\u0103.",
      verd: ["i", X.destinatii.length ? `Centrul e la ${X.destinatii[0].masina_min} min cu ma\u0219ina; cea mai apropiat\u0103 sta\u021bie, la ${X.statii[0] ? nf(X.statii[0].m) + " m" : "\u2014"}.` : "Destina\u021biile de referin\u021b\u0103 nu sunt \u00eenc\u0103 definite pentru acest ora\u0219."],
      cards: X.destinatii.length ? X.destinatii.map(d => [d.masina_min + " min", d.nume.toLowerCase() + " \u00b7 cu ma\u0219ina, " + nf(d.masina_km, 1) + " km"])
        : X.statii.slice(0, 4).map(s => [nf(s.m) + " m", "sta\u021bia " + s.nume + " \u00b7 " + s.tip]),
      charts: [cap("minute p\u00e2n\u0103 la destina\u021bii: cu ma\u0219ina \u0219i pe jos", (HM.trasee || HM.duo)(X.destinatii.map(d => ({ label: d.scurt || d.nume.replace(/ \(.*\)/, ""), a: d.masina_min, b: d.pe_jos_min, ta: d.masina_min + " min", tb: d.pe_jos_min + " min pe jos" })), { aria: "minute p\u00e2n\u0103 la destina\u021bii, cu ma\u0219ina \u0219i pe jos" })),
        ...(X.statii.length ? [cap("Cele mai apropiate sta\u021bii (\u00een linie dreapt\u0103)", HM.bars(X.statii.map(s => ({ label: s.nume, v: s.m, txt: nf(s.m) + " m", color: "#1d4ed8" })), { lw: 170 }))] : [])],
      table: { h: ["Destina\u021bia", "Cu ma\u0219ina", "Pe jos"], r: X.destinatii.map(d => [d.nume, d.masina_min + " min \u00b7 " + nf(d.masina_km, 1) + " km", d.pe_jos_min + " min \u00b7 " + nf(d.pe_jos_km, 1) + " km"]).concat(X.statii.map(s => ["Sta\u021bie: " + s.nume, s.tip, nf(s.m) + " m"])) },
      note: X.sursa + ". " + X.nota }) },
    { k: "scoli", t: "\u0218coli \u0219i gr\u0103dini\u021be", el: "scoli", map: "scoli", qr: "\u0218colile \u0219i gr\u0103dini\u021bele din jurul propriet\u0103\u021bii, pe site", def: (X, H) => ({
      lead: "Gr\u0103dini\u021bele, \u0219colile \u0219i liceele \u00een 2 km, cu distan\u021ba pe jos. Harta le arat\u0103 cu nume \u0219i cu inele de 5, 10 \u0219i 15 minute de mers pe jos.",
      verd: [X.lista.length ? "g" : "o", X.lista.length ? `${X.nr_gradinite} gr\u0103dini\u021be \u0219i ${X.nr_scoli} \u0219coli printre cele mai apropiate ${X.lista.length} unit\u0103\u021bi.` : "Nicio unitate de \u00eenv\u0103\u021b\u0103m\u00e2nt \u00een 2 km \u00een OpenStreetMap."],
      cards: X.lista.slice(0, 4).map(s => [s.min + " min", s.tip + " \u00b7 " + s.nume]),
      charts: [cap("Minute pe jos p\u00e2n\u0103 la fiecare unitate", HM.bars(X.lista.slice(0, 9).map(s => ({ label: s.nume, v: s.min, txt: s.min + " min", color: s.tip === "gr\u0103dini\u021b\u0103" ? C.PC.gr : s.tip === "\u0219coal\u0103" ? C.PC.sc : C.PC.li })), { lw: 200, max: Math.max(...X.lista.map(s => s.min), 10) }))],
      table: { h: ["Unitatea", "Tip", "Pe jos"], r: X.lista.map(s => [s.nume, s.tip, nf(s.m) + " m \u00b7 " + s.min + " min"]) },
      note: X.sursa + ". " + X.nota }) },
    { k: "populatie", t: "Popula\u021bia zonei", el: "populatie", map: "populatie", qr: "Popula\u021bia \u0219i evolu\u021bia zonei, pe site", def: (X, H) => ({
      lead: `Popula\u021bia UAT-ului ${X.uat} dup\u0103 domiciliu, la 1 ianuarie 2016 \u0219i 2026, comparat\u0103 cu jude\u021bul ${X.judet}. Harta arat\u0103 unde se locuie\u0219te: blocuri \u0219i case.`,
      verd: [X.var >= 0 ? "g" : "o", `${X.uat}: ${sg(X.var)} \u00een 10 ani; jude\u021bul: ${sg(X.judet_var)}.`],
      cards: [[nf(X.p2026), "locuitori \u00een 2026 (domiciliu)"], [nf(X.p2016), "locuitori \u00een 2016"], [sg(X.var), "varia\u021bia 2016 \u2192 2026"], [X.loc_crestere + " / " + X.nr_uat, "locul \u00een jude\u021b dup\u0103 cre\u0219tere"]],
      charts: [cap(`C\u00e2t a crescut popula\u021bia \u00een ${X.judet}, 2016 \u2192 2026`, HM.bars(X.top.map(t => ({ label: t.uat, v: Math.max(t.var, 0), txt: sg(t.var), color: "var(--accent)" })).concat(X.top.some(t => t.uat === X.uat) ? [] : [{ label: X.uat, v: Math.max(X.var, 0), txt: sg(X.var), hi: true, color: "#d9233c" }]), { lw: 120 })),
        ...(H && H.comp.cladiri ? [HM.donut(["b", "c", "r"].map(c => ({ label: C.BL_N[c], v: H.comp.cladiri[c] || 0, color: C.BL[c] })), { titlu: "Locuin\u021bele din 500 m, dup\u0103 amprenta cl\u0103dirilor", aria: "blocuri, case \u0219i locuin\u021be de tip neprecizat \u00een 500 m", centru: "500 m", centru2: "locuin\u021be" })] : [])],
      table: { h: [`UAT-urile din ${X.judet} cu cea mai mare cre\u0219tere`, "2016", "2026", "Varia\u021bie"], r: X.top.map(t => [t.uat, nf(t.p2016), nf(t.p2026), sg(t.var)]) },
      note: X.sursa + ". Popula\u021bia dup\u0103 domiciliu num\u0103r\u0103 oamenii cu buletin \u00een UAT: \u00een ora\u0219ele mari scade, iar \u00een comunele din jur cre\u0219te, pe m\u0103sur\u0103 ce oamenii \u00ee\u0219i mut\u0103 domiciliul." }) },
    { k: "monumente", t: "Monumente \u0219i situri arheologice", el: "monumente", map: null, qr: "Patrimoniul din jurul propriet\u0103\u021bii, pe site", def: (X, H) => {
      if (!X.ran) return { lead: "Monumentele istorice \u0219i siturile arheologice din jur.", verd: ["i", "Capitolul se regenereaz\u0103 pe bazele na\u021bionale (RAN, LMI)."], cards: [], charts: [], note: X.sursa + ". " + X.nota };
      const N = X.densitate.national, cel = [...X.ran.map(r => r.m), ...X.ran_poligoane.map(r => r.m)].sort((a, b) => a - b)[0];
      // densitatea siturilor RAN \u00een 3 km fa\u021b\u0103 de media \u021b\u0103rii (238.397 km\u00b2)
      const asteptat = N.ran_puncte * (Math.PI * 9) / 238397, fact = X.densitate.ran_3km / asteptat;
      const verd = X.in_sit_ran ? ["r", `Proprietatea e \u00een conturul sitului arheologic ${X.in_sit_ran.cod} \u201e${X.in_sit_ran.nume}\u201d: orice construc\u021bie cere de regul\u0103 cercetare arheologic\u0103 preventiv\u0103 \u0219i avizul Direc\u021biei Jude\u021bene pentru Cultur\u0103.`]
        : cel != null && cel <= 250 ? ["o", `Un sit arheologic RAN e la ${nf(cel)} m: la s\u0103p\u0103turi pot ap\u0103rea vestigii; \u00eentreab\u0103 de aviz la certificatul de urbanism.`]
        : ["g", cel != null ? `Proprietatea nu e \u00eentr-un sit arheologic cunoscut; cel mai apropiat sit RAN e la ${nf(cel)} m.` : "Niciun sit arheologic RAN \u00een 3 km."];
      /* harta plan: scar\u0103 radial\u0103 comprimat\u0103 (\u221a), ca siturile apropiate s\u0103 nu se \u00eenghesuie */
      const S = 600, C0 = 300, RMAX = 300, KM = 5000, rr = m => RMAX * Math.min(m, KM) / KM;
      const P = (m, az) => [C0 + Math.sin(az * Math.PI / 180) * rr(m), C0 - Math.cos(az * Math.PI / 180) * rr(m)];
      const PXY = ([x, y]) => { const m = Math.hypot(x, y), az = Math.atan2(x, y) * 180 / Math.PI; return P(m, az); };
      let g = `<svg viewBox="0 0 ${S} ${S}" class="pzmap" role="img" aria-label="Harta patrimoniului \u00een 5 km">`;
      g += FM(X) ? `<image href="${FM(X)}" x="0" y="0" width="${S}" height="${S}" preserveAspectRatio="none"/>` : `<rect width="${S}" height="${S}" fill="var(--pz-bg, #faf8f3)"/>`;
      [[1000, "1 km"], [2000, "2 km"], [3000, "3 km"], [5000, "5 km"]].forEach(([m, t]) => g += inel(C0, C0, rr(m)) + `<text x="${C0 + 4}" y="${C0 - rr(m) + 14}" font-size="11" font-weight="700" fill="#1a1a1a" stroke="#fff" stroke-width="3" paint-order="stroke">${t}</text>`);
      [["N", 0], ["E", 90], ["S", 180], ["V", 270]].forEach(([t, a]) => { const [x, y] = P(KM * 1.17, a); g += `<text x="${x}" y="${y + 4}" font-size="13" font-weight="600" text-anchor="middle" fill="var(--muted)">${t}</text>`; });
      g += `<g class="l-pol">${X.ran_poligoane.map(p => `<polygon points="${p.ring.map(PXY).map(q => q.map(v => v.toFixed(1)).join(",")).join(" ")}" fill="#a0522d" fill-opacity=".26" stroke="#a0522d" stroke-width="1.6" data-tip="${esc("Sit arheologic " + p.nume + "|RAN " + p.cod + " \u00b7 " + nf(p.ha, 1) + " ha|la " + nf(p.m) + " m de proprietate")}"/>`).join("")}</g>`;
      g += `<g class="l-cro">${X.cronica.map(c => { const [x, y] = P(c.m, c.az); return `<circle cx="${x}" cy="${y}" r="4.5" fill="#16868c" stroke="#fff" stroke-width="1.2" data-tip="${esc("S\u0103p\u0103tur\u0103 \u201e" + c.punct + "\u201d|campania din " + c.an + "|la " + nf(c.m) + " m")}"/>`; }).join("")}</g>`;
      g += `<g class="l-cul">${X.culte.map(c => { const [x, y] = P(c.m, c.az); return `<text x="${x}" y="${y + 5}" font-size="14" text-anchor="middle" fill="#6b6b6b">\u271d</text><circle cx="${x}" cy="${y}" r="8" fill="transparent" data-tip="${esc(c.nume + "|" + (c.cult || "l\u0103ca\u0219 de cult") + "|la " + nf(c.m) + " m")}"/>`; }).join("")}</g>`;
      g += `<g class="l-lmi">${X.lmi.map(l => { const [x, y] = P(l.m, l.az); return `<circle cx="${x}" cy="${y}" r="7" fill="#8e24aa" stroke="#fff" stroke-width="2" data-tip="${esc(l.nume + "|monument istoric " + l.cod + "|grupa " + l.grupa + ", valoare " + l.valoare + (l.adresa ? "|" + l.adresa : "") + "|la " + nf(l.m) + " m")}"/>`; }).join("")}</g>`;
      g += `<g class="l-ran">${X.ran.map(r => { const [x, y] = P(r.m, r.az); return `<rect x="${x - 6}" y="${y - 6}" width="12" height="12" transform="rotate(45 ${x} ${y})" fill="#a0522d" stroke="#fff" stroke-width="1.8" data-tip="${esc("Sit arheologic: " + r.nume + "|RAN " + r.cod + "|la " + nf(r.m) + " m de proprietate")}"/>`; }).join("")}</g>`;
      { /* etichete mici pe cele importante: monumentele LMI de valoare A \u0219i cele mai apropiate situri RAN */
        const imp = [...X.lmi.filter(l => l.valoare === "A").slice(0, 3).map(l => ({ m: l.m, az: l.az, t: l.nume, c: "#6a1b7a" })), ...X.lmi.filter(l => l.valoare !== "A").slice(0, 2).map(l => ({ m: l.m, az: l.az, t: l.nume, c: "#6a1b7a" })),
          ...X.ran.slice(0, 3).map(r => ({ m: r.m, az: r.az, t: r.nume, c: "#7a3b17" }))].filter(o => o.m <= KM).map(o => { const [x, y] = P(o.m, o.az); return { b: [x - 7, y - 7, x + 7, y + 7], t: o.t.length > 30 ? o.t.slice(0, 29) + "\u2026" : o.t, c: o.c }; });
        g += `<g class="l-et">${langa(imp, S, [[C0 - 12, C0 - 12, C0 + 12, C0 + 12]])}</g>`; }
      g += `<circle cx="${C0}" cy="${C0}" r="9" fill="#ff3b5c" stroke="#fff" stroke-width="3"/></svg>`;
      const chips = [["ran", "#a0522d", "\u25c6", `situri RAN (${X.ran.length})`], ["pol", "#a0522d", "\u25a2", `contururi de sit (${X.ran_poligoane.length})`], ["lmi", "#8e24aa", "\u25cf", `monumente LMI (${X.lmi.length})`], ["cro", "#16868c", "\u2022", `s\u0103p\u0103turi (${X.cronica.length})`], ["cul", "#6b6b6b", "\u271d", `l\u0103ca\u0219uri de cult (${X.culte.length})`]];
      const harta = `<div class="pz"><div class="pzchips">${chips.map(([k, c, s, t]) => `<button type="button" class="pzc" aria-pressed="true" onclick="this.setAttribute('aria-pressed', this.getAttribute('aria-pressed') !== 'true'); this.closest('.pz').classList.toggle('off-${k}')"><b style="color:${c}">${s}</b> ${esc(t)}</button>`).join("")}</div>${g}<p class="nt">Hart\u0103 la scar\u0103 real\u0103, 10 \u00d7 10 km, cu proprietatea \u00een centru. Treci cu mouse-ul (sau atinge) un semn ca s\u0103 vezi detaliile.</p></div>`;
      /* cronologia s\u0103p\u0103turilor din 5 km */
      const ani = X.cronica.map(c => c.an).filter(Boolean), a0 = ani.length ? Math.min(...ani) : 1990, a1 = 2026, nr = {};
      ani.forEach(a => nr[a] = (nr[a] || 0) + 1);
      const mx = Math.max(1, ...Object.values(nr)), W = 520, Hh = 120, bw = W / (a1 - a0 + 1);
      let t = `<svg viewBox="0 0 ${W} ${Hh + 22}" role="img" aria-label="Campanii de s\u0103p\u0103tur\u0103 pe ani">`;
      for (let a = a0; a <= a1; a++) { const v = nr[a] || 0, h = v / mx * Hh; if (v) t += `<rect x="${(a - a0) * bw + 1}" y="${Hh - h}" width="${Math.max(bw - 2, 2)}" height="${h}" rx="1.5" fill="#16868c"><title>${a}: ${v} campanii</title></rect>`; if (a % 5 === 0) t += `<text x="${(a - a0) * bw + bw / 2}" y="${Hh + 16}" font-size="10.5" text-anchor="middle" fill="var(--muted)">${a}</text>`; }
      t += `</svg>`;
      const lista = X.ran.slice(0, 10).map(r => `<li><a href="${esc(r.link)}" target="_blank" rel="noopener">RAN ${esc(r.cod)}</a> \u00b7 ${esc(r.nume)} \u00b7 <b>${nf(r.m)} m</b></li>`).join("") +
        X.lmi.slice(0, 6).map(l => `<li>LMI <b>${esc(l.cod)}</b> \u00b7 ${esc(l.nume)}${l.adresa ? " \u00b7 " + esc(l.adresa) : ""} \u00b7 <b>${nf(l.m)} m</b></li>`).join("");
      return {
        lead: "Siturile arheologice din Repertoriul Arheologic Na\u021bional, monumentele istorice din Lista Monumentelor Istorice \u0219i s\u0103p\u0103turile din Cronica cercet\u0103rilor arheologice, \u00een jurul propriet\u0103\u021bii. Conteaz\u0103 pentru c\u0103 un sit sau un monument aproape poate cere aviz de la Cultur\u0103 \u0219i cercetare arheologic\u0103 \u00eenainte de construire.",
        verd,
        cards: [[String(X.densitate.ran_3km), "situri arheologice RAN \u00een 3 km"], [cel != null ? nf(cel) + " m" : "\u2014", "p\u00e2n\u0103 la cel mai apropiat sit"], [fact >= 1 ? nf(fact, 1) + "\u00d7" : nf(fact, 1) + "\u00d7", "densitatea siturilor fa\u021b\u0103 de media \u021b\u0103rii"], [String(X.densitate.lmi_5km), "monumente istorice LMI \u00een 5 km"]],
        top: cap("Patrimoniul \u00een 5 km, pe hart\u0103", harta),
        charts: [cap(`S\u0103p\u0103turi arheologice \u00een 5 km, pe ani (${X.cronica.length} campanii)`, X.cronica.length ? t : `<p class="nt">Nicio campanie de s\u0103p\u0103tur\u0103 \u00eenregistrat\u0103 \u00een Cronic\u0103 \u00een 5 km.</p>`),
        ],
        more: [cap("C\u00e2t de bogat\u0103 \u00een situri e zona", HM.bars([{ label: "\u00cen 3 km \u00een jurul propriet\u0103\u021bii", v: X.densitate.ran_3km, txt: X.densitate.ran_3km + " situri", color: "#a0522d" }, { label: "Media \u021b\u0103rii pe aceea\u0219i suprafa\u021b\u0103", v: asteptat, txt: nf(asteptat, 1) + " situri", color: "#b9b5ab" }], { lw: 190 }))],
        extra: `<div class="ex"><b>Cele mai apropiate obiective</b><ul>${lista || "<li>Nimic \u00een raz\u0103.</li>"}</ul></div>` +
          (X.muzee.length ? `<div class="ex"><b>Muzee \u00een apropiere:</b> ${X.muzee.map(m => `${esc(m.nume)} (${nf(m.m / 1000, 1)} km)`).join(" \u00b7 ")}</div>` : ""),
        table: null,
        note: X.sursa + ". " + X.nota };
    } },
    { k: "costuri", t: "Costurile tranzac\u021biei \u0219i impozitul local", el: "costuri", map: null, qr: "Calculeaz\u0103 costurile pentru pre\u021bul t\u0103u, pe site", def: (X, H) => {
      const v = X.vanzare, g = p => (v.find(r => r.ce.startsWith(p)) || {}).lei, a = X.anual;
      const st0 = RC.stare0(X);
      return {
        lead: `C\u00e2t te cost\u0103 tranzac\u021bia pe l\u00e2ng\u0103 pre\u021b \u0219i c\u00e2t pl\u0103te\u0219ti pe an. Schimb\u0103 pre\u021bul \u0219i bifeaz\u0103 ce se aplic\u0103 \u021bie: \u201epizza\u201d se recalculeaz\u0103. Pornim de la un pre\u021b de ${lei(st0.pret)} \u0219i ${X.exemplu.mp} mp.`,
        verd: ["i", `Costuri de tranzac\u021bie \u00een exemplu: ${lei(g("TOTAL costuri"))}; impozit local anual \u00eentre ${lei((a[1] || {}).lei)} \u0219i ${lei((a[2] || {}).lei)}.`],
        cards: [[lei(g("TOTAL onorariu")), "notar, cu TVA"], [lei(g("intabulare")), "intabulare"], [lei(g("impozit pe transfer")), "impozitul v\u00e2nz\u0103torului"], [nf((a[1] || {}).lei || 0) + "\u2013" + nf((a[2] || {}).lei || 0) + " lei", "impozit local pe an"]],
        top: cap("Din ce se compun costurile: ajusteaz\u0103-le", RC.radacina(st0)),
        charts: [],
        table: { h: ["Ce", "Suma", "Temei"], r: v.concat(a).map(r => [r.ce, lei(r.lei), (r.temei || "").split(" \u00b7 ")[0] + (r.marca !== "HARD DATA" ? " [" + r.marca.toLowerCase() + "]" : "")]) },
        note: X.sursa + ". " + X.nota + " Comisionul agentului \u0219i costurile creditului sunt estim\u0103ri uzuale, nu tarife legale; modific\u0103-le \u00een contract." };
    } },
    { k: "seismic", t: "Risc seismic", el: "seismic", map: "seism", qr: "Riscul seismic al zonei, pe site", def: (X, H) => {
      const s = H && H.sis, lok = X.judet_loc || [], cu = X.cutremure, es = X.eshm20, top = cu && cu.puternice && cu.puternice[0];
      const mg = v => String(v).replace(".", ",");
      return {
        lead: `${X.legea212.aplicabila ? `Zona are seismicitate ridicat\u0103 pentru Rom\u00e2nia (ag = ${X.ag_txt} g): prim\u0103ria trebuie s\u0103 inventarieze blocurile cu peste P+3 niveluri construite \u00eenainte de 1978 (Legea 212/2022). ` : `Zona are seismicitate sc\u0103zut\u0103 spre medie (ag = ${X.ag_txt} g, sub pragul de 0,20 g din Legea 212/2022). `}${X.exact ? X.uat : X.uat + " (comun\u0103: valoare din " + X.localitate_tabel + ")"}: accelera\u021bia terenului pentru proiectare ag = ${X.ag_txt} g, perioada de col\u021b Tc = ${nf(X.tc, 1)} s (P100-1/2013, Tabelul A1). Harta arat\u0103 blocurile care pot intra sub Legea 212/2022; graficele, cutremurele reale din ultimii ani.`,
        verd: [X.legea212.aplicabila ? "o" : "g", cu && cu.n ? `Istoric cutremure \u00een zon\u0103: ${nf(cu.n["100"])} \u00een 100 km din ${cu.interval.slice(0, 4)}` + (top ? `; cel mai puternic, ${mg(top.mag)} pe scara Richter, \u00een ${top.data.slice(-4)}, la ${mg(Math.round(top.d))} km.` : ".")
          : X.legea212.aplicabila ? `Seismicitate ridicat\u0103 pentru Rom\u00e2nia (ag = ${X.ag_txt} g): prim\u0103ria inventariaz\u0103 blocurile vechi.` : `Seismicitate sc\u0103zut\u0103 spre medie (ag = ${X.ag_txt} g).`],
        cards: [[X.ag_txt + " g", "accelera\u021bia terenului ag, IMR 225 ani (normativ)"], [nf(X.tc, 1) + " s", "perioada de col\u021b Tc"],
          [X.legea212.aplicabila ? "da" : "nu", "intr\u0103 sub inventarul Legii 212/2022 (ag \u2265 0,20 g)"],
          cu && cu.n ? [nf(cu.n["100"]), `cutremure \u00een 100 km din catalog` + (top ? `; cel mai puternic ${mg(top.mag)} \u00een ${top.data.slice(-4)}` : "")] : [s ? String(s.p3) : "\u2014", "blocuri P+3 sau mai mari \u00een 500 m (OSM)"]],
        top: typeof D !== "undefined" && D && D.id ? (setTimeout(() => { const el = document.querySelector("#seismic .sz-jud"); if (el) hartaSeismJudet(lok, D.id, el); }, 0), cap(`Cutremurele pe hart\u0103: jude\u021bul ${X.judet}, colorat dup\u0103 hazard`, `<div class="sz-jud"></div>`)) : "",
        charts: [cap("Unde ne afl\u0103m pe scala ag a Rom\u00e2niei", HM.gauge(X.ag, { lo: 0.10, hi: 0.40, stops: [[0.10, 0.15, "#7fc8a9"], [0.15, 0.20, "#b9d96f"], [0.20, 0.25, "#f2c14e"], [0.25, 0.30, "#ee8c3a"], [0.30, 0.35, "#d9534f"], [0.35, 0.40, "#a8325e"]], ticks: [[0.10, "0,10"], [0.15, "0,15"], [0.20, "0,20"], [0.25, "0,25"], [0.30, "0,30"], [0.35, "0,35"], [0.40, "0,40 g"]], prag: 0.20, pragTxt: "pragul Legii 212", valTxt: X.ag_txt + " g", aria: "ag pe scala 0,10\u20130,40 g" })),
          ...(cu && cu.puncte && cu.puncte.length ? [cap("Cutremure reale \u00een 100 km (ML \u2265 2,5)", HM.epiMap(cu.puncte, { aria: "epicentrele cutremurelor din 100 km" }))] : [cap(`ag \u00een localit\u0103\u021bile urbane din jude\u021bul ${X.judet}`, HM.regMap(lok, { punct: H ? H.c : null, ...FJ() }))])],
        more: [...(cu && cu.puncte && cu.puncte.length ? [cap(`ag \u00een localit\u0103\u021bile urbane din jude\u021bul ${X.judet}`, HM.regMap(lok, { punct: H ? H.c : null, ...FJ(), aria: "localit\u0103\u021bile urbane din jude\u021b colorate dup\u0103 ag" }))] : []),
          ...(cu && cu.clase ? [cap("C\u00e2te cutremure, pe magnitudine, \u00een 100 km", HM.bars(Object.entries(cu.clase).map(([k, v]) => ({ label: "magnitudine " + k, v, txt: nf(v), color: k === "\u2265 5" ? "#c62828" : k === "4\u20134,9" ? "#ef6c00" : k === "3\u20133,9" ? "#f2b705" : "#7a8aa6" })), { lw: 140, max: Math.max(...Object.values(cu.clase)) }))] : []),
          ...(cu && cu.decenii && Object.keys(cu.decenii).length ? [cap("Cutremure cu magnitudine \u2265 3, pe decenii", HM.bars(Object.entries(cu.decenii).map(([k, v]) => ({ label: k + "\u2013" + (+k + 9), v, txt: nf(v), color: "#ef6c00" })), { lw: 110 }))] : []),
          cap("Acelea\u0219i localit\u0103\u021bi, \u00een ordine", HM.bars(lok.map(l => ({ label: l.loc, v: l.ag, txt: l.ag.toFixed(2).replace(".", ",") + " g", color: C.AGC[l.ag.toFixed(2) * 1] || "#999", hi: l.ref ? true : undefined })), { lw: 120, max: 0.4 }))],
        table: { h: ["Ce \u0219tim", "C\u00e2t", "Surs\u0103"], r: [["ag (IMR 225 ani)", X.ag_txt + " g", "P100-1/2013 Tab. A1"], ["Tc", nf(X.tc, 1) + " s", "P100-1/2013 Tab. A1"], ["Prag Legea 212/2022", "ag \u2265 0,20 g", "art. 3, art. 9 alin. (3)"],
          ...(es ? [["PGA ESHM20, 225 ani (roc\u0103)", mg(es.pga_225) + " g", "EFEHR / ETH Z\u00fcrich"], ["PGA ESHM20, 475 ani (roc\u0103)", mg(es.pga_475) + " g", "EFEHR / ETH Z\u00fcrich"]] : []),
          ...(cu && cu.n ? [["Cutremure \u00een 25 / 50 / 100 km", `${nf(cu.n["25"])} / ${nf(cu.n["50"])} / ${nf(cu.n["100"])}`, "ROMPLUS, INFP"]] : []),
          ...(s ? [["Blocuri \u00een 500 m (OSM)", String(s.blocuri), "OpenStreetMap"], ["Cu niveluri cunoscute, P+3 sau mai mari", String(s.p3), "OpenStreetMap"], ["Anul construc\u021biei cunoscut", `${s.an_cunoscut} din ${s.blocuri}`, "OpenStreetMap"]] : [])] },
        extra: `<div class="ex"><b>Clasele de risc (Legea 212/2022 art. 1 alin. (2)).</b> ${X.clase.map(c => `<b>${esc(c[0])}</b> ${esc(c[1])}`).join(" \u00b7 ")}.</div>` +
          (cu && cu.puternice && cu.puternice.length ? `<div class="ex"><b>Cele mai puternice cutremure \u00een 100 km:</b><ul>${cu.puternice.map(e => `<li>${esc(e.data)} \u00b7 magnitudine ${mg(e.mag)} \u00b7 la ${mg(e.d)} km${e.adanc ? " \u00b7 ad\u00e2ncime " + mg(e.adanc) + " km" : ""}</li>`).join("")}</ul><p class="nt">${esc(cu.sursa)}. ${esc(cu.nota)}</p></div>` : "") +
          (es ? `<div class="ex"><b>Compara\u021bie cu modelul european ESHM20:</b> PGA pe roc\u0103 de referin\u021b\u0103 ${mg(es.pga_225)} g la 225 de ani \u0219i ${mg(es.pga_475)} g la 475 de ani (la 2.475 de ani, ${mg(es.pga_2475)} g). <span class="nt">${esc(es.nota)} ${esc(es.sursa)}.</span></div>` : "") +
          (X.lista_oficiala ? `<div class="ex warn"><b>Lista cl\u0103dirilor cu clas\u0103 de risc:</b> ${esc(X.lista_oficiala)}</div>` : "") +
          `<div class="ex"><b>Ce faci tu, pas cu pas:</b><ol>${X.pasi.map(p => `<li>${esc(p)}</li>`).join("")}</ol></div>` +
          (X.fapte.length ? `<div class="ex"><b>Ce a f\u0103cut prim\u0103ria, din surse publice:</b><ul>${X.fapte.map(f => `<li>${esc(f.data)} \u00b7 ${esc(f.text)} <span class="eti">[${esc(f.eticheta)}]</span> <a href="${esc(f.sursa)}" target="_blank" rel="noopener">surs\u0103</a></li>`).join("")}</ul></div>` : ""),
        note: X.sursa + ". " + X.nota + (s && s.an_cunoscut === 0 ? " \u00cen OpenStreetMap, nicio cl\u0103dire din raza de 500 m nu are anul construc\u021biei: de aceea harta nu poate separa blocurile dinainte de 1978." : "") };
    } },
    { k: "autorizatii", t: "Autoriza\u021bii de construire \u00een jur", el: "autorizatii", map: "autorizatii", qr: "Ce se construie\u0219te pe str\u0103zile din jur, pe site", def: (X, H) => {
      const AC = { casa: "#0ea5e9", colectiv: "#7c3aed", comercial: "#ea580c", anexe: "#a3a3a3", retele: "#16a34a", demolare: "#b91c1c", alte: "#d4d4d8" };
      const NM = X.nume_clase || {};
      if (!X.colectat) return { lead: "Autoriza\u021biile de construire din aceast\u0103 localitate nu sunt \u00eenc\u0103 \u00een baza noastr\u0103.", verd: ["i", X.nota], cards: [], charts: [], note: X.nota };
      const ps = Object.entries(X.pe_strada || {}).sort((a, b) => b[1].n - a[1].n);
      /* rezerv\u0103: c\u00e2nd registrul prim\u0103riei nu d\u0103 str\u0103zile (ex. Bucov\u0103\u021b: fara_strada = toate), lucr\u0103m pe totalurile UAT-ului, din trimestre */
      const clT = {}; Object.values(X.trimestre || {}).forEach(t => Object.entries(t).forEach(([k, n]) => clT[k] = (clT[k] || 0) + n));
      const peUat = !ps.length && Object.keys(clT).length > 0, cl = peUat ? clT : (X.clase || {}), ks = Object.keys(AC).filter(k => cl[k]);
      const anCur = String(new Date().getFullYear()), caseAn = Object.entries(X.trimestre || {}).filter(([q]) => q.startsWith(anCur)).reduce((s, [, t]) => s + (t.casa || 0), 0);
      const qs = Object.keys(X.trimestre || {}).sort(), mxq = Math.max(1, ...qs.map(q => Object.values(X.trimestre[q]).reduce((a, b) => a + b, 0)));
      const W = 460, Hh = 170, bw = (W - 30) / Math.max(qs.length, 1);
      let col = `<svg viewBox="0 0 ${W} ${Hh + 26}" width="100%" role="img" aria-label="autoriza\u021bii pe trimestre" style="display:block">`;
      qs.forEach((q, i) => { let y = Hh; ks.concat(Object.keys(X.trimestre[q]).filter(k => !ks.includes(k))).forEach(k => { const v = X.trimestre[q][k] || 0, h = (Hh - 14) * v / mxq; if (!v) return; y -= h;
        col += `<rect x="${24 + i * bw + 2}" y="${y}" width="${bw - 4}" height="${h}" fill="${AC[k] || "#ccc"}"><title>${esc(q + " \u00b7 " + (NM[k] || k) + ": " + v)}</title></rect>`; });
        const tot = Object.values(X.trimestre[q]).reduce((a, b) => a + b, 0);
        col += `<text x="${24 + i * bw + bw / 2}" y="${y - 3}" text-anchor="middle" font-size="9.5" fill="var(--fg)" style="font-family:var(--mono)">${tot}</text>`;
        if (q.endsWith("T1") || i === 0) col += `<text x="${24 + i * bw + 2}" y="${Hh + 16}" font-size="10" fill="var(--muted)" style="font-family:var(--font)">${q.slice(0, 4)}</text>`; });
      col += `<line x1="22" x2="${W}" y1="${Hh}" y2="${Hh}" stroke="var(--line)"/></svg>`;
      const mari = (cl.colectiv || 0) + (cl.comercial || 0), top = ps[0];
      const pe = ps.filter(([n]) => (H && H.dr || []).some(a => a[1] === n && a[0] <= 4)).length;
      if (peUat) { const mariU = (cl.colectiv || 0) + (cl.comercial || 0);
        return {
          lead: `C\u00e2te autoriza\u021bii de construire a dat prim\u0103ria ${X.uat} \u00een ultimii ${X.ani} ani \u0219i pentru ce. Registrul publicat nu are str\u0103zile, a\u0219a c\u0103 ar\u0103t\u0103m tot UAT-ul, nu doar vecin\u0103tatea.`,
          verd: [caseAn >= 20 || mariU >= 5 ? "o" : "i", `${X.uat} construie\u0219te: ${nf(X.total_perioada)} autoriza\u021bii \u00een ${X.ani} ani, dintre care ${nf(cl.casa || 0)} pentru case (${nf(caseAn)} doar \u00een ${anCur})${mariU ? ` \u0219i ${mariU} pentru cl\u0103diri comerciale sau blocuri` : ""}. Registrul nu spune pe ce str\u0103zi.`],
          cards: [[nf(X.total_perioada), `autoriza\u021bii \u00een tot UAT-ul, ultimii ${X.ani} ani`], [nf(cl.casa || 0), "case \u0219i duplexuri"], [nf(caseAn), `case autorizate \u00een ${anCur}`], [nf(X.total_uat), "autoriza\u021bii \u00een registru, de la \u00eenceput"]],
          charts: [cap(`Autoriza\u021bii pe trimestre, tot UAT-ul ${X.uat}`, col + `<ul class="sk">${ks.map(k => `<li><i style="background:${AC[k]}"></i><span>${esc(NM[k] || k)}</span><b>${nf(cl[k])}</b></li>`).join("")}</ul>`),
            HM.donut(ks.map(k => ({ label: NM[k] || k, v: cl[k], color: AC[k] })), { titlu: "Pentru ce s-au dat", centru: nf(X.total_perioada), centru2: "autoriza\u021bii" })],
          note: X.sursa + ". " + X.nota + ` Din cele ${nf(X.total_perioada)} acte ale perioadei, ${nf(X.fara_strada)} nu au strad\u0103 \u00een registru.`, faraHarta: true };
      }
      return {
        lead: `C\u00e2te autoriza\u021bii de construire a dat prim\u0103ria pe str\u0103zile din jurul propriet\u0103\u021bii \u00een ultimii ${X.ani} ani \u0219i pentru ce: case, blocuri, spa\u021bii comerciale, re\u021bele. Arat\u0103 c\u00e2t de repede se construie\u0219te zona \u0219i ce fel de vecini vin.`,
        verd: [mari >= 5 ? "o" : "i", `${nf(X.in_harta)} autoriza\u021bii pe ${ps.length} str\u0103zi din hart\u0103 \u00een ${X.ani} ani` + (top ? `; cele mai multe pe ${top[0]} (${top[1].n})` : "") + (mari ? `; ${mari} pentru blocuri sau spa\u021bii comerciale, de verificat dac\u0103 sunt aproape` : "; niciun bloc sau spa\u021biu comercial nou pe str\u0103zile din jur") + "."],
        cards: [[nf(X.in_harta), `autoriza\u021bii pe str\u0103zile din hart\u0103 (din ${nf(X.total_perioada)} \u00een tot UAT-ul)`], [nf(cl.casa || 0), "case \u0219i duplexuri"], [nf(mari), "blocuri \u0219i spa\u021bii comerciale"], [X.cu && X.cu.colectat ? nf(Object.values(X.cu.pe_strada).reduce((a, b) => a + b, 0)) : "\u2013", "certificate de urbanism pe acelea\u0219i str\u0103zi (proiecte \u00een preg\u0103tire)"]],
        charts: [cap(`Autoriza\u021bii pe trimestre, tot UAT-ul ${X.uat}`, col + `<ul class="sk">${ks.map(k => `<li><i style="background:${AC[k]}"></i><span>${esc(NM[k] || k)}</span><b>${nf(cl[k])}</b></li>`).join("")}</ul>`),
          cap("Str\u0103zile cu cele mai multe autoriza\u021bii", HM.bars(ps.slice(0, 10).map(([n, x]) => ({ label: n, v: x.n, color: HM.AUTC(x.n), txt: x.n + " \u00b7 " + Object.entries(x.clase).sort((a, b) => b[1] - a[1]).map(([k, v]) => (NM[k] || k).split(" ")[0] + " " + v).slice(0, 2).join(", ") })), { lw: 160, aria: "autoriza\u021bii pe strad\u0103" }))],
        table: { h: ["Nr. AC", "Data", "Strada", "Tip", "Obiectiv"], r: (X.recente || []).slice(0, 15).map(r => [r.nr || "\u2013", r.data.split("-").reverse().join("."), r.strada, NM[r.clasa] || r.clasa, r.obiectiv]) },
        note: X.sursa + ". " + X.nota };
    } },
    { k: "zonare", t: "Zonarea cartierului \u0219i utilit\u0103\u021bi", el: "zonare", map: "zonare", qr: "Zonarea cartierului \u0219i utilit\u0103\u021bile, pe site", def: (X, H) => {
      const cl = H.comp.cladiri, tr = H.comp.teren, arie = H.comp.arie, sumC = Object.values(cl).reduce((a, b) => a + b, 0) || 1;
      const sumZ = Object.values(tr).reduce((a, b) => a + b, 0), fara = Math.max(arie - sumZ, 0), pc = (v, t) => Math.round(100 * v / t);
      const loc = (cl.b || 0) + (cl.c || 0) + (cl.r || 0), ind = cl.i || 0, com = cl.k || 0;
      const dom = [["locuin\u021be", loc], ["cl\u0103diri industriale", ind], ["cl\u0103diri comerciale \u0219i de servicii", com], ["cl\u0103diri publice", cl.p || 0]].sort((a, b) => b[1] - a[1])[0];
      const util = (H.poi.filter(p => p[0] === "ut").length) + H.dr.filter(a => a[0] === 8).length;
      return {
        lead: "Cum e \u00eemp\u0103r\u021bit cartierul \u00een 500 m: cl\u0103diri de locuit (blocuri, case), industriale, comerciale \u0219i de servicii, plus zonele din OpenStreetMap. Utilit\u0103\u021bile din PUZ nu sunt \u00eenc\u0103 extrase; ar\u0103t\u0103m ce are OSM.",
        verd: ["i", `Predomin\u0103 ${dom[0]} (${pc(dom[1], sumC)}% din amprenta cl\u0103dirilor); zon\u0103 industrial\u0103: ${pc(tr.ind || 0, arie)}% \u0219i comercial\u0103: ${pc(tr.com || 0, arie)}% din cerc.`],
        cards: [[pc(loc, sumC) + "%", "locuin\u021be, din amprenta cl\u0103dirilor"], [pc(ind, sumC) + "%", "industrial \u0219i depozite"], [pc(com, sumC) + "%", "comercial \u0219i servicii"], [pc(tr.ind || 0, arie) + "% \u00b7 " + pc(tr.com || 0, arie) + "%", "zon\u0103 industrial\u0103 \u00b7 comercial\u0103, din cercul de 500 m"]],
        charts: [HM.donut(["b", "c", "r", "k", "i", "p", "a", "o"].map(c => ({ label: C.BL_N[c], v: cl[c] || 0, color: C.BL[c] })), { titlu: "Cl\u0103dirile din 500 m, dup\u0103 amprent\u0103", aria: "compozi\u021bia cl\u0103dirilor", centru: nf(sumC / 10000, 1) + " ha", centru2: "cl\u0103dit" }),
          HM.donut([...["res", "com", "ind", "grn", "agr", "apa", "alt"].map(z => ({ label: C.LU_N[z], v: tr[z] || 0, color: C.LU[z] })), { label: "F\u0103r\u0103 zonare \u00een OSM", v: fara, color: "#fafaf6" }], { titlu: "Zonele din 500 m, dup\u0103 suprafa\u021b\u0103", aria: "compozi\u021bia zonelor", centru: nf(arie / 10000, 0) + " ha", centru2: "cerc de 500 m" }),
          ],
        wide: cap("Utilit\u0103\u021bi", `<p class="nt"><b>Din PUZ:</b> nu avem \u00eenc\u0103 re\u021belele de utilit\u0103\u021bi extrase din plan\u0219ele PUZ ale acestui UAT (ap\u0103, canal, gaz, curent). Plan\u0219ele se georeferen\u021biaz\u0103 \u0219i se vectorizeaz\u0103, vezi documente/19_PLANSE_GIS.md.<br><b>Din OSM:</b> ${util ? `${util} obiecte (linii electrice, substa\u021bii, turnuri de ap\u0103) apar pe hart\u0103, dar OSM nu are re\u021belele subterane.` : "niciun obiect de utilit\u0103\u021bi \u00een raz\u0103; OSM nu are re\u021belele subterane."}</p>`),
        table: { h: ["Tip de cl\u0103dire", "Amprent\u0103 m\u00b2", "Pondere"], r: ["b", "c", "r", "k", "i", "p", "a", "o"].filter(c => cl[c]).map(c => [C.BL_N[c], nf(cl[c]), pc(cl[c], sumC) + "%"]) },
        note: H.sursa + ". " + H.nota + ` Tipul \u201elocuin\u021be de tip neprecizat\u201d e dedus din zona reziden\u021bial\u0103 \u00een care st\u0103 cl\u0103direa (${H.deduse} cl\u0103diri); \u201ef\u0103r\u0103 zonare \u00een OSM\u201d e suprafa\u021ba din cerc f\u0103r\u0103 zon\u0103 desenat\u0103.` };
    } },
    { k: "alunecari", t: "Teren \u0219i alunec\u0103ri", el: "alunecari", map: null, qr: "Relieful \u0219i geologia propriet\u0103\u021bii, pe site", def: (X, H) => {
      const p = X.panta_max_pct, G = X.geologie || {};
      const verd = p == null ? ["i", "Relieful nu a putut fi citit pentru acest punct."]
        : p < 5 ? ["g", `Teren plat: panta cea mai mare \u00een jur e de ${nf(p, 1)}%, iar pe 1 km diferen\u021ba de nivel e de ${nf(X.dif_1km_m, 0)} m. Alunec\u0103rile apar de regul\u0103 pe pante, nu pe c\u00e2mpie.`]
        : p < 15 ? ["o", `Pant\u0103 moderat\u0103 (${nf(p, 1)}%): cere studiu geotehnic atent la funda\u021bii \u0219i la scurgerea apei.`]
        : ["r", `Pant\u0103 mare (${nf(p, 1)}%): verific\u0103 harta de risc la alunec\u0103ri a jude\u021bului \u0219i f\u0103 studiu geotehnic \u00eenainte de cump\u0103rare.`];
      // profilul de relief: cele 8 direc\u021bii la 150 m, fa\u021b\u0103 de proprietate
      const R = H && H.rel, dirs = ["N", "NE", "E", "SE", "S", "SV", "V", "NV"], base = X.altitudine;
      const prof = (X.profil || []).map((e, i) => ({ label: "spre " + dirs[i], v: Math.abs(e - base), txt: (e - base >= 0 ? "+" : "\u2212") + nf(Math.abs(e - base), 1) + " m", color: e >= base ? "#8d6e63" : "#4c9f38" }));
      return {
        lead: "Pe ce teren st\u0103 proprietatea \u0219i c\u00e2t de \u00eenclinat e: blocul 3D al terenului pe 1,5 km, cu p\u0103tratul de 300 m al propriet\u0103\u021bii, geologia oficial\u0103 a Institutului Geologic al Rom\u00e2niei \u0219i relieful din modelul european de teren. Riscul de alunecare \u021bine \u00een primul r\u00e2nd de pant\u0103 \u0219i de tipul de roc\u0103.",
        verd,
        cards: [[p != null ? nf(p, 1) + "%" : "\u2014", "panta cea mai mare \u00een 150 m"], ...(H && H.bloc ? (() => { const B = H.bloc, n = B.n, c = (n - 1) / 2, r = Math.round(150 / B.pas), Z = (i, j) => B.z[j * n + i], d = [Z(c, c - r), Z(c + r, c), Z(c, c + r), Z(c - r, c)].map(v => v - Z(c, c));
            return [[`+${nf(Math.max(0, ...d), 1)} / \u2212${nf(Math.abs(Math.min(0, ...d)), 1)} m`, "c\u00e2t urc\u0103 / coboar\u0103 terenul la 150 m, spre N, E, S, V"]]; })()
          : R ? [[`${R.max_urca_m > 0 ? "+" : ""}${nf(R.max_urca_m, 1)} / ${nf(R.max_coboara_m, 1)} m`, "c\u00e2t urc\u0103 / coboar\u0103 terenul la 150 m (300 m dus-\u00eentors)"]] : []), [X.dif_1km_m != null ? nf(X.dif_1km_m, 0) + " m" : "\u2014", "diferen\u021ba de nivel \u00een 1 km"], [X.altitudine != null ? nf(X.altitudine, 0) + " m" : "\u2014", "altitudinea"], [G.cod || "\u2014", "unitatea geologic\u0103 (IGR)"]],
        top: H && H.bloc ? cap("Terenul \u00een 3D: 1,5 km \u00een jur, cu p\u0103tratul de 300 m al propriet\u0103\u021bii", HM.bloc(H.bloc)) : "",
        charts: [cap("Panta, pe scara riscului", HM.gauge(Math.min(p || 0, 30), { lo: 0, hi: 30, stops: [[0, 5, "#b9d96f"], [5, 15, "#f2c14e"], [15, 30, "#d9534f"]], ticks: [[0, "0%"], [5, "5%"], [15, "15%"], [30, "30%"]], valTxt: nf(p || 0, 1) + "%", aria: "panta terenului" })),
          ...(prof.length && !(H && H.bloc) ? [cap("C\u00e2t urc\u0103 sau coboar\u0103 terenul la 150 m, pe direc\u021bii", HM.bars(prof, { lw: 80 }))] : [])],
        extra: G.descriere ? `<div class="ex"><b>Ce e sub proprietate (harta geologic\u0103 1:200.000, foaia ${esc((G.foaie || "").replace("geo_", ""))}):</b> ${esc(G.descriere)} \u00b7 ${esc(G.varsta || "")}</div>` : "",
        note: X.sursa + ". " + X.nota + (R ? " Poligonul de relief: " + R.sursa + ", " + R.data + ". " + R.nota : "") };
    } },
    { k: "arii_protejate", t: "Arii naturale protejate", el: "arii", map: null, qr: "Natura 2000 \u0219i rezerva\u021biile din jur, pe site", def: (X, H) => {
      const TIP = t => /siteOfCommunity|specialAreaOfConservation/.test(t) ? "Natura 2000 \u00b7 sit de importan\u021b\u0103 comunitar\u0103 (ROSCI / ROSAC)" : /specialProtection/.test(t) ? "Natura 2000 \u00b7 protec\u021bia p\u0103s\u0103rilor" : /strictNature|naturalMonument/.test(t) ? "rezerva\u021bie sau monument al naturii" : /Ramsar|wetland/i.test(t) ? "zon\u0103 umed\u0103 Ramsar" : "arie protejat\u0103";
      const L = X.lista, inA = X.in_arie.length;
      const verd = inA ? ["r", `Proprietatea e \u00een aria protejat\u0103 ${X.in_arie[0].cod} \u201e${X.in_arie[0].nume}\u201d: orice proiect cere avizul Agen\u021biei pentru Protec\u021bia Mediului \u0219i poate cere evaluare adecvat\u0103.`]
        : X.cel_mai_aproape != null && X.cel_mai_aproape < 1000 ? ["o", `O arie protejat\u0103 e la ${nf(X.cel_mai_aproape)} m: proiectele mari pot cere evaluare de mediu.`]
        : ["g", X.cel_mai_aproape != null ? `Proprietatea nu e \u00eentr-o arie protejat\u0103; cea mai apropiat\u0103, ${L[0].nume}, e la ${nf(X.cel_mai_aproape / 1000, 1)} km \u2014 bun\u0103 pentru plimb\u0103ri, f\u0103r\u0103 restric\u021bii aici.` : "Nicio arie protejat\u0103 \u00een 25 km."];
      // harta: la scar\u0103 real\u0103, 25 km \u00een jurul propriet\u0103\u021bii, cu fundal topografic Esri c\u00e2nd exist\u0103 (imaginea e exportat\u0103 de mediu.py)
      const S = 600, C0 = 300, RM = 25000, sc = C0 / RM, PXY = ([x, y]) => [C0 + x * sc, C0 - y * sc];
      const base = typeof D !== "undefined" && D && D.id ? `p/${D.id}/` : "";
      const col = t => /specialProtection/.test(t) ? "#1f6fb0" : /siteOfCommunity|specialAreaOfConservation/.test(t) ? "#2e933c" : "#8e5ea2";
      const halo = (x, y, t, f, c) => `<text x="${x}" y="${y}" font-size="${f}" font-weight="600" text-anchor="middle" fill="${c}" stroke="#fff" stroke-width="3" paint-order="stroke" style="font-family:var(--font)">${esc(t)}</text>`;
      let g = `<svg viewBox="0 0 ${S} ${S}" class="pzmap" role="img" aria-label="Ariile protejate \u00een 25 km, la scar\u0103">`;
      g += X.fundal ? `<image href="${base}${esc(X.fundal)}" x="0" y="0" width="${S}" height="${S}" preserveAspectRatio="none"/>` : `<rect width="${S}" height="${S}" fill="var(--pz-bg, #faf8f3)"/>`;
      L.slice().reverse().forEach(a => a.contur.forEach(ring => { g += `<polygon points="${ring.map(PXY).map(q => q.map(v => v.toFixed(1)).join(",")).join(" ")}" fill="${col(a.tip)}" fill-opacity=".38" stroke="${col(a.tip)}" stroke-width="1.8" data-tip="${esc(a.nume + "|" + TIP(a.tip) + "|cod " + a.cod + " \u00b7 " + nf(a.ha) + " ha|la " + nf(a.m / 1000, 1) + " km de proprietate")}"/>`; }));
      [[5000, "5 km"], [10000, "10 km"], [25000, "25 km"]].forEach(([m, t]) => { if (m > RM) return; g += inel(C0, C0, m * sc) + halo(C0 + m * sc * .7071 - 14, C0 + m * sc * .7071 - 2, t, 11, "#1a1a1a"); });
      /* etichete: zonele mici primesc eticheta al\u0103turi, cu linie de leg\u0103tur\u0103; zonele mari, \u00een interior */
      const zone = []; const vazute = new Set();
      L.forEach(a => { if (!a.contur.length || a.m > 24000) return; const ps = a.contur.flat().map(PXY), xs = ps.map(p => p[0]), ys = ps.map(p => p[1]);
        zone.push({ a, b: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] }); });
      const mici = zone.filter(z => (z.b[2] - z.b[0]) < 70 && (z.b[3] - z.b[1]) < 70), ocupat = [[C0 - 12, C0 - 12, C0 + 12, C0 + 12], ...mici.map(z => z.b)];
      const et = [];
      zone.forEach(z => { if (vazute.has(z.a.nume) || vazute.size >= 9) return; vazute.add(z.a.nume);
        if (mici.includes(z)) et.push({ b: z.b, t: z.a.nume, c: col(z.a.tip) === "#8e5ea2" ? "#5a2d7a" : "#14301a" });
        else { const ps = z.a.contur.flat().map(PXY).filter(p => p[0] > 30 && p[0] < S - 30 && p[1] > 20 && p[1] < S - 20); if (!ps.length) return;   // zon\u0103 mare: eticheta l\u00e2ng\u0103 marginea ei cea mai apropiat\u0103 de proprietate
          const q = ps.reduce((m, p) => Math.hypot(p[0] - C0, p[1] - C0) < Math.hypot(m[0] - C0, m[1] - C0) ? p : m); et.push({ b: [q[0] - 3, q[1] - 3, q[0] + 3, q[1] + 3], t: z.a.nume, c: "#14301a" }); } });
      g += langa(et, S, ocupat);
      [["N", C0, 14], ["S", C0, S - 6], ["E", S - 8, C0 + 4], ["V", 8, C0 + 4]].forEach(([t, x, y]) => g += halo(x, y, t, 12, "#222"));
      g += `<circle cx="${C0}" cy="${C0}" r="8" fill="#ff3b5c" stroke="#fff" stroke-width="3"/></svg>`;
      const harta = `<div class="pz"><div class="pzchips"><span class="pzc"><b style="color:#2e933c">\u25a0</b> Natura 2000 \u00b7 habitate</span><span class="pzc"><b style="color:#1f6fb0">\u25a0</b> Natura 2000 \u00b7 p\u0103s\u0103ri</span><span class="pzc"><b style="color:#8e5ea2">\u25a0</b> rezerva\u021bii \u0219i monumente ale naturii</span></div>${g}<p class="nt">Hart\u0103 la scar\u0103 real\u0103, 50 \u00d7 50 km, cu proprietatea \u00een centru. Treci cu mouse-ul (sau atinge) o arie ca s\u0103-i vezi numele \u0219i suprafa\u021ba.</p></div>`;
      return {
        lead: "Siturile Natura 2000, rezerva\u021biile \u0219i monumentele naturii din jurul propriet\u0103\u021bii, din registrul na\u021bional al ariilor protejate. Conteaz\u0103 \u00een dou\u0103 feluri: aproape de ele sunt locuri bune de plimbare, iar \u00een\u0103untrul lor construc\u021bia e strict reglementat\u0103.",
        verd,
        cards: [[inA ? "da" : "nu", "proprietatea e \u00eentr-o arie protejat\u0103"], [X.cel_mai_aproape != null ? nf(X.cel_mai_aproape / 1000, 1) + " km" : "\u2014", "p\u00e2n\u0103 la cea mai apropiat\u0103"], [String(X.n_10km), "arii protejate \u00een 10 km"], [String(X.n_25km), "arii protejate \u00een 25 km"]],
        top: cap("Ariile protejate \u00een 25 km, pe hart\u0103", harta),
        charts: [],
        more: [cap("C\u00e2t de departe sunt", HM.bars(L.slice(0, 8).map(a => ({ label: a.nume, v: a.m / 1000, txt: nf(a.m / 1000, 1) + " km", color: col(a.tip) })), { lw: 170 }))],
        table: { h: ["Aria", "Cod", "Tip", "Suprafa\u021b\u0103", "Distan\u021ba"], r: L.map(a => [a.nume, a.cod, TIP(a.tip), nf(a.ha) + " ha", nf(a.m / 1000, 1) + " km"]) },
        note: X.sursa + ". " + X.nota };
    } },
    { k: "aer", t: "Calitatea aerului", el: "aer", map: null, qr: "Calitatea aerului la proprietate, pe site", def: (X, H) => {
      const M = X.medii_92z, O = X.oms, U = X.ue, s = X.serie_pm25 || [];
      const ok = M.pm2_5 != null && M.pm2_5 <= 10;
      const verd = M.pm2_5 == null ? ["i", "Datele de calitate a aerului nu au putut fi citite."]
        : [M.pm2_5 <= O.pm2_5 ? "g" : M.pm2_5 <= 10 ? "g" : M.pm2_5 <= U.pm2_5 ? "o" : "r", `\u00cen ultimele 3 luni, particulele fine PM2,5 au avut \u00een medie ${nf(M.pm2_5, 1)} \u00b5g/m\u00b3: ${M.pm2_5 <= U.pm2_5 ? "sub" : "peste"} limita anual\u0103 a UE (${U.pm2_5}) \u0219i ${M.pm2_5 <= O.pm2_5 ? "sub" : "peste"} recomandarea OMS (${O.pm2_5}). Iarna valorile cresc.`];
      const rows = [["PM2,5 (particule fine)", "pm2_5"], ["PM10", "pm10"], ["NO\u2082 (trafic)", "nitrogen_dioxide"]].flatMap(([n, k]) => [
        { label: n + " \u00b7 aici", v: M[k], txt: nf(M[k], 1) + " \u00b5g/m\u00b3", color: "#2c5c9c" },
        { label: n + " \u00b7 recomandarea OMS", v: O[k], txt: O[k] + " \u00b5g/m\u00b3", color: "#9aa3b5" }]);
      // seria zilnic\u0103 PM2,5
      const W = 520, Hh = 110, mx = Math.max(20, ...s.map(x => x[1])), bw = W / Math.max(s.length, 1);
      let t = `<svg viewBox="0 0 ${W} ${Hh + 22}" role="img" aria-label="PM2,5 zi cu zi">`;
      t += `<line x1="0" x2="${W}" y1="${Hh - 15 / mx * Hh}" y2="${Hh - 15 / mx * Hh}" stroke="#d9534f" stroke-dasharray="4 3"/><text x="${W - 2}" y="${Hh - 15 / mx * Hh - 4}" font-size="10" text-anchor="end" fill="#d9534f">OMS, media zilnic\u0103: 15</text>`;
      s.forEach(([d, v], i) => { t += `<rect x="${i * bw + .5}" y="${Hh - v / mx * Hh}" width="${Math.max(bw - 1, 1)}" height="${v / mx * Hh}" fill="${v > 15 ? "#d9534f" : "#2c5c9c"}"><title>${d}: ${nf(v, 1)} \u00b5g/m\u00b3</title></rect>`; if (d.endsWith("-01")) t += `<text x="${i * bw}" y="${Hh + 15}" font-size="10" fill="var(--muted)">${d.slice(5, 7)}.${d.slice(0, 4)}</text>`; });
      t += `</svg>`;
      /* bara de context: de la aerul curat de munte la smogul de ora\u0219, cu locul nostru (repere orientative de PM2,5, \u00b5g/m\u00b3) */
      const ctx = (() => { if (M.pm2_5 == null) return ""; const W = 560, x0 = 40, x1 = W - 16, MX = 40, X = v => x0 + (x1 - x0) * Math.min(v, MX) / MX;
        const R = [[3, "munte, p\u0103dure"], [5, "recomandarea OMS"], [10, "ora\u0219 curat"], [15, "ora\u0219 mare"], [25, "limita UE"], [38, "smog de ora\u0219, iarna"]];
        let s = `<svg viewBox="0 0 ${W} 92" width="100%" role="img" aria-label="unde se afl\u0103 aerul de aici, de la aer curat la smog" style="display:block"><defs><linearGradient id="aerg"><stop offset="0" stop-color="#2e933c"/><stop offset=".2" stop-color="#8cc66d"/><stop offset=".38" stop-color="#f2c14e"/><stop offset=".62" stop-color="#ee8c3a"/><stop offset="1" stop-color="#8e1f3f"/></linearGradient></defs>`;
        s += `<rect x="${x0}" y="40" width="${x1 - x0}" height="10" rx="5" fill="url(#aerg)"/>`;
        R.forEach(([v, t], i) => { const x = X(v), y = i % 2 ? 14 : 30; s += `<line x1="${x}" x2="${x}" y1="${y + 3}" y2="40" stroke="var(--muted)" stroke-width=".8"/><text x="${x}" y="${y}" text-anchor="${i === R.length - 1 ? "end" : "middle"}" font-size="10.5" fill="var(--muted)" style="font-family:var(--font)">${esc(t)} \u00b7 ${v}</text>`; });
        const vx = X(M.pm2_5); s += `<circle cx="${vx}" cy="45" r="9" fill="#fff" stroke="var(--fg)" stroke-width="3.5"/><path d="M${vx} 57 l-6 9 h12 z" fill="var(--fg)"/><text x="${vx}" y="84" text-anchor="${vx < 60 ? "start" : "middle"}" font-size="12.5" font-weight="800" fill="var(--fg)" style="font-family:var(--mono)">aici: ${nf(M.pm2_5, 1)}</text></svg>`;
        return s; })();
      /* c\u00e2nd e cel mai \u00eenc\u0103rcat: ora din zi (linie) \u0219i ziua s\u0103pt\u0103m\u00e2nii (bare mici) */
      const po = X.profil_ora_pm25, pz = X.profil_zi_pm25;
      const cand = (() => { if (!po || !po.some(v => v != null)) return ""; const W = 560, Hh = 130, ml = 20, mr = 8, top = 22, vs = po.filter(v => v != null), lo = Math.min(...vs) * .92, hi = Math.max(...vs) * 1.04;
        const X = i => ml + (W - ml - mr - 170) * i / 23, Y = v => top + (Hh - top - 22) * (1 - (v - lo) / (hi - lo));
        const pts = po.map((v, i) => v == null ? null : [X(i), Y(v)]).filter(Boolean), im = po.indexOf(Math.max(...vs)), iM = po.indexOf(Math.min(...vs));
        let s = `<svg viewBox="0 0 ${W} ${Hh}" width="100%" role="img" aria-label="c\u00e2nd e aerul cel mai \u00eenc\u0103rcat" style="display:block">`;
        s += `<path d="M${pts[0][0]} ${Hh - 22} L${pts.map(p => p.map(q => q.toFixed(1)).join(" ")).join(" L")} L${pts[pts.length - 1][0]} ${Hh - 22} Z" fill="#2c5c9c" fill-opacity=".12"/><polyline points="${pts.map(p => p.map(q => q.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="#2c5c9c" stroke-width="2.4" stroke-linejoin="round"/>`;
        [0, 6, 12, 18, 23].forEach(h => s += `<text x="${X(h)}" y="${Hh - 6}" text-anchor="middle" font-size="10" fill="var(--muted)" style="font-family:var(--mono)">${String(h).padStart(2, "0")}:00</text>`);
        s += `<circle cx="${X(im)}" cy="${Y(po[im])}" r="5" fill="#d9534f" stroke="#fff" stroke-width="2"/><text x="${X(im)}" y="${Y(po[im]) - 8}" text-anchor="${im > 18 ? "end" : "middle"}" font-size="11" font-weight="700" fill="#d9534f" style="font-family:var(--font)">cel mai \u00eenc\u0103rcat: ${String(im).padStart(2, "0")}:00 \u00b7 ${nf(po[im], 1)}</text>`;
        s += `<circle cx="${X(iM)}" cy="${Y(po[iM])}" r="5" fill="#2e933c" stroke="#fff" stroke-width="2"/><text x="${X(iM)}" y="${Y(po[iM]) + 18}" text-anchor="middle" font-size="11" font-weight="700" fill="#2e933c" style="font-family:var(--font)">cel mai curat: ${String(iM).padStart(2, "0")}:00 \u00b7 ${nf(po[iM], 1)}</text>`;
        if (pz && pz.some(v => v != null)) { const ZN = ["L", "Ma", "Mi", "J", "V", "S", "D"], zx = W - 160, zmax = Math.max(...pz), zmin = Math.min(...pz);
          pz.forEach((v, i) => { const h = 18 + 52 * (v - zmin) / ((zmax - zmin) || 1), x = zx + i * 22; s += `<rect x="${x}" y="${Hh - 22 - h}" width="14" height="${h}" rx="4" fill="${v === zmax ? "#d9534f" : "#9db7d8"}"/><text x="${x + 7}" y="${Hh - 6}" text-anchor="middle" font-size="10" fill="var(--muted)" style="font-family:var(--font)">${ZN[i]}</text>`; }); }
        return s + `</svg>`; })();
      return {
        top: (ctx ? cap("Aerul de aici, \u00eentre aerul de munte \u0219i smogul de ora\u0219 (PM2,5)", ctx + `<p class="nt">Reperele sunt orientative [IPOTEZ\u0102]: medii tipice de PM2,5, nu m\u0103sur\u0103tori pentru un loc anume.</p>`) : "") + (cand ? cap("C\u00e2nd e aerul cel mai \u00eenc\u0103rcat: ora din zi \u0219i ziua s\u0103pt\u0103m\u00e2nii", cand) : ""),
        lead: "Ce respiri la proprietate: particulele fine (PM2,5 \u0219i PM10), dioxidul de azot de la trafic \u0219i ozonul, din modelul european Copernicus pentru ultimele 3 luni, comparate cu recomand\u0103rile Organiza\u021biei Mondiale a S\u0103n\u0103t\u0103\u021bii \u0219i cu limitele Uniunii Europene.",
        verd,
        cards: [[nf(M.pm2_5, 1), "PM2,5 \u00b5g/m\u00b3, media pe 3 luni"], [nf(M.pm10, 1), "PM10 \u00b5g/m\u00b3"], [nf(M.nitrogen_dioxide, 1), "NO\u2082 \u00b5g/m\u00b3 (trafic)"], [String(X.zile_peste_oms_pm25), "zile cu PM2,5 peste pragul zilnic OMS"]],
        charts: [cap(`PM2,5 zi cu zi (${X.perioada ? X.perioada[0].split("-").reverse().join(".") + " \u2013 " + X.perioada[1].split("-").reverse().join(".") : ""})`, t),
          cap("Media aici fa\u021b\u0103 de recomandarea OMS", HM.bars(rows, { lw: 190 }))],
        note: X.sursa + ". " + X.nota };
    } },
    { k: "zgomot", t: "Zgomot", el: "zgomot", map: null, qr: "Zonele de zgomot din jurul propriet\u0103\u021bii, pe site", def: (X, H) => {
      /* Model v2 (zgomot.py): benzi de zgomot pornite de la drumuri, cale ferat\u0103, aeroport \u0219i s\u0103li de evenimente, atenuate cu distan\u021ba \u0219i de cl\u0103diri/p\u0103duri. ESTIMARE. */
      const S = (X.surse || []).filter(x => x.db != null), G = X.grila || {}, EV = X.evenimente || [], R = X.regional, T = X.nivel_total;
      const base = typeof D !== "undefined" && D && D.id ? `p/${D.id}/` : "";
      const BC = [[45, "#ffec78"], [55, "#f0782a"], [65, "#d63428"], [75, "#5a0a5a"]];
      const dbCol = v => v >= 65 ? "#d63428" : v >= 55 ? "#f0782a" : v >= 45 ? "#f2b84a" : "#9aa3b5";
      const halo = (x, y, t, f, c, a) => `<text x="${x}" y="${y}" font-size="${f}" font-weight="600" text-anchor="${a || "middle"}" fill="${c}" stroke="#fff" stroke-width="3" paint-order="stroke" style="font-family:var(--font)">${esc(t)}</text>`;
      const top = S.slice().sort((a, b) => b.db - a.db), dom = top[0];
      const verd = T == null ? ["i", "Zgomotul nu a putut fi modelat pentru aceast\u0103 proprietate."]
        : T >= 65 ? ["r", `Zgomot estimat ${nf(T)} dB(A) la proprietate, din ${dom.cat}${dom.nume ? " " + dom.nume : ""}: peste ce se consider\u0103 deranjant ziua; verific\u0103 pe teren.`]
        : T >= 55 ? ["o", `Zgomot estimat ${nf(T)} dB(A), \u00een principal de la ${dom.cat}${dom.nume ? " " + dom.nume : ""} (la ${nf(dom.m)} m): peste pragul european de raportare (55 dB).`]
        : T >= 45 ? ["g", `Zgomot estimat ${nf(T)} dB(A): moderat, sub pragul european de raportare (55 dB). Cel mai tare: ${dom.cat}${dom.nume ? " " + dom.nume : ""}, la ${nf(dom.m)} m.`]
        : ["g", `Zgomot estimat ${nf(T)} dB(A): lini\u0219te pentru o zon\u0103 locuit\u0103.`];
      /* ---------- harta local\u0103: fundal satelit + benzi + surse; comutator zi / sear\u0103 de weekend ---------- */
      const W = 600, C0 = W / 2, RM = G.raza || 1500, sc = C0 / RM, P = (x, y) => [C0 + x * sc, C0 - y * sc];
      const sat = H && H.sat && H.sat.detaliu ? base + H.sat.detaliu.fisier : null;
      const hasWk = !!G.fisier_wk;
      const baseMap = `<image href="${sat || ""}" x="0" y="0" width="${W}" height="${W}" preserveAspectRatio="none"/>` + (sat ? "" : "");
      const marker = `<circle cx="${C0}" cy="${C0}" r="8" fill="#ff3b5c" stroke="#fff" stroke-width="3"/>`;
      const inCad = ([x, y]) => Math.abs(x) < RM && Math.abs(y) < RM;
      const rings = [500, 1000].map(m => `<circle cx="${C0}" cy="${C0}" r="${m * sc}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-dasharray="5 4" stroke-width="1.3"/>` + halo(C0 + m * sc * .7071 + 2, C0 + m * sc * .7071 + 10, m + " m", 10, "#333", "start")).join("");
      const comp = [["N", C0, 14], ["S", C0, W - 6], ["E", W - 8, C0 + 4], ["V", 8, C0 + 4]].map(([t, x, y]) => halo(x, y, t, 12, "#222")).join("");
      const evM = EV.filter(e => inCad([e.x, e.y]) || Math.hypot(e.x, e.y) < RM * 1.45).map(e => { const [x, y] = P(e.x, e.y); if (x < 6 || y < 6 || x > W - 6 || y > W - 6) return "";
        return `<g><title>${esc(e.nume + " \u00b7 " + e.tip + " \u00b7 " + nf(e.m) + " m")}</title><circle cx="${x}" cy="${y}" r="7" fill="#5b3aa8" stroke="#fff" stroke-width="2"/><text x="${x}" y="${y + 3.6}" font-size="9.5" text-anchor="middle" fill="#fff">\u266a</text></g>` + halo(x, y - 11, e.nume, 9.5, "#2c1a5c"); }).join("");
      const art = EV.filter(e => e.m < 4000).map(e => { const [x, y] = P(e.x, e.y); return `<circle cx="${x}" cy="${y}" r="${1000 * sc}" fill="none" stroke="#5b3aa8" stroke-width="1.4" stroke-dasharray="2 4"/>`; }).join("");
      const mapZi = `<svg viewBox="0 0 ${W} ${W}" class="pzmap" data-v="zi" role="img" aria-label="Harta zonelor de zgomot, zi">${baseMap}<image href="${base}${esc(G.fisier || "")}" x="0" y="0" width="${W}" height="${W}" preserveAspectRatio="none"/>${rings}${comp}${marker}</svg>`;
      const mapWk = hasWk ? `<svg viewBox="0 0 ${W} ${W}" class="pzmap" data-v="wk" style="display:none" role="img" aria-label="Harta zgomotului de la s\u0103li de evenimente, sear\u0103 de weekend">${baseMap}<image href="${base}${esc(G.fisier_wk)}" x="0" y="0" width="${W}" height="${W}" preserveAspectRatio="none"/>${rings}${art}${evM}${comp}${marker}</svg>` : "";
      const sw = (c, t) => `<span class="pzc" style="cursor:default"><b style="color:${c}">\u25a0</b> ${t}</span>`;
      const legZi = `<div class="pzchips" data-v="zi">${[["#ffec78", "50\u201355"], ["#fabe46", "55\u201360"], ["#f07828", "60\u201365"], ["#d63428", "65\u201370"], ["#96143c", "70\u201375"], ["#5a0a5a", "peste 75"]].map(([c, t]) => sw(c, t + " dB")).join("")}</div>`;
      const legWk = hasWk ? `<div class="pzchips" data-v="wk" style="display:none">${[["#cdbeeb", "45\u201350"], ["#aa8cdc", "50\u201355"], ["#825fc8", "55\u201360"], ["#5f37aa", "60\u201365"], ["#3c1982", "65\u201370"]].map(([c, t]) => sw(c, t + " dB")).join("")}<span class="pzc" style="cursor:default"><b style="color:#5b3aa8">\u25cc</b> artificii: v\u00e2rf peste 85 dB \u00een 1 km</span></div>` : "";
      const tog = hasWk ? `<div class="pzchips"><button type="button" class="pzc zgb" data-m="zi" data-on="1" style="font-weight:700">Zi: trafic, tren, avion</button><button type="button" class="pzc zgb" data-m="wk" style="font-weight:500">Sear\u0103 de weekend: s\u0103li de evenimente</button></div>` : "";
      const ha = G.ha_peste || {};
      const hartaLoc = `<div class="pz zg">${tog}${legZi}${legWk}${mapZi}${mapWk}<p class="nt">Hart\u0103 la scar\u0103 real\u0103, 3 \u00d7 3 km, nord sus, proprietatea \u00een centru. Culoarea arat\u0103 nivelul estimat (media zilei; \u00een varianta de weekend, muzica din seara unui eveniment); zgomotul porne\u0219te de la axul fiec\u0103rui drum \u0219i scade cu distan\u021ba, iar r\u00e2ndurile de case \u0219i p\u0103durile \u00eel taie. [ESTIMARE de model, nu m\u0103sur\u0103toare]</p></div>`;
      /* ---------- graficul 1: nivelul la proprietate, pe surs\u0103 ---------- */
      const rows = top.filter(x => x.db >= 20).slice(0, 7);
      const bw = 440, lw = 165, rh = 24, sx = v => lw + (Math.max(v, 20) - 20) / 60 * (bw - lw - 52);
      let g1 = `<svg viewBox="0 0 ${bw} ${rows.length * rh + 34}" role="img" aria-label="Nivelul de zgomot la proprietate pe surs\u0103">`;
      [[45, "45 \u00b7 noapte"], [55, "55 \u00b7 prag UE"]].forEach(([v, t]) => g1 += `<line x1="${sx(v)}" x2="${sx(v)}" y1="0" y2="${rows.length * rh + 4}" stroke="#d9534f" stroke-dasharray="4 3"/><text x="${sx(v)}" y="${rows.length * rh + 18}" font-size="10" text-anchor="middle" fill="#d9534f">${t}</text>`);
      rows.forEach((x, i) => { const y = i * rh + 3, nm = x.cat + (x.viteza ? ` ${x.viteza} km/h` : "") + (x.nume && x.cat !== "cale ferat\u0103" ? ` \u00b7 ${x.nume}` : "");
        g1 += `<text x="${lw - 6}" y="${y + 14}" font-size="11" text-anchor="end" fill="var(--fg)">${esc(nm.length > 27 ? nm.slice(0, 26) + "\u2026" : nm)}</text><rect x="${lw}" y="${y + 6}" width="${Math.max(sx(x.db) - lw, 2)}" height="9" rx="4.5" fill="${dbCol(x.db)}"><title>${esc(nm)}: ${nf(x.db, 1)} dB la ${nf(x.m)} m; \u00een c\u00e2mp liber ar fi ${nf(x.db_liber, 1)} dB</title></rect>`
          + (x.db_liber - x.db >= 3 ? `<rect x="${sx(x.db)}" y="${y + 6}" width="${Math.max(sx(x.db_liber) - sx(x.db), 0)}" height="9" rx="4.5" fill="none" stroke="#9aa3b5" stroke-dasharray="3 2"/>` : "")
          + `<text x="${Math.max(sx(x.db), lw) + (x.db_liber - x.db >= 3 ? sx(x.db_liber) - sx(x.db) : 0) + 5}" y="${y + 14}" font-size="11" font-weight="600" fill="var(--fg)">${nf(x.db)} dB</text>`; });
      g1 += `</svg>`;
      /* ---------- graficul 2: atenuarea cu distan\u021ba pentru sursa dominant\u0103 (curba modelului) ---------- */
      const L = dom && dom.tip === "L" ? dom : (top.find(x => x.tip === "L") || null);
      let g2 = "";
      if (L && L.l25 != null) {
        const f = d => L.l25 - (d <= 50 ? 10 * Math.log10(d / 25) : 3 + 15 * Math.log10(d / 50)) - .003 * d;
        const w = 520, h = 190, ml = 34, mt = 10, mb = 26, xm = 2000, ymax = 85, ymin = 25, px = d => ml + (d - 25) / (xm - 25) * (w - ml - 10), py = v => mt + (ymax - Math.min(Math.max(v, ymin), ymax)) / (ymax - ymin) * (h - mt - mb);
        let pts = ""; for (let d = 25; d <= xm; d += 25) pts += `${px(d).toFixed(1)},${py(f(d)).toFixed(1)} `;
        g2 = `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Sc\u0103derea zgomotului cu distan\u021ba">`;
        [30, 45, 55, 65, 75].forEach(v => g2 += `<line x1="${ml}" x2="${w - 10}" y1="${py(v)}" y2="${py(v)}" stroke="${v === 55 || v === 45 ? "#d9534f" : "var(--line)"}" ${v === 55 || v === 45 ? 'stroke-dasharray="4 3"' : ""}/><text x="${ml - 4}" y="${py(v) + 3}" font-size="10" text-anchor="end" fill="var(--muted)">${v}</text>`);
        [0, 500, 1000, 1500, 2000].forEach(d => g2 += `<text x="${px(Math.max(d, 25))}" y="${h - 8}" font-size="10" text-anchor="middle" fill="var(--muted)">${d} m</text>`);
        g2 += `<polyline points="${pts}" fill="none" stroke="#2c5c9c" stroke-width="2.4"/>`;
        if (L.m <= xm) g2 += `<line x1="${px(L.m)}" x2="${px(L.m)}" y1="${mt}" y2="${h - mb}" stroke="#ff3b5c" stroke-dasharray="3 3"/><circle cx="${px(L.m)}" cy="${py(L.db_liber)}" r="4.5" fill="#fff" stroke="#2c5c9c" stroke-width="2"/><circle cx="${px(L.m)}" cy="${py(L.db)}" r="5.5" fill="#ff3b5c" stroke="#fff" stroke-width="2"/>${halo(px(L.m) + 8, py(L.db) - 8, `aici ${nf(L.db)} dB`, 11, "#a01030", "start")}`;
        g2 += `</svg>`;
      }
      /* ---------- graficul 3: viteza \u0219i nivelul la 25 m pe tipuri de drum ---------- */
      const rr = []; const vz = new Map();
      S.filter(x => x.l25 != null).forEach(x => { const k = x.cat + "|" + (x.viteza || ""); if (!vz.has(k) || vz.get(k).m > x.m) vz.set(k, x); });
      vz.forEach(x => rr.push({ label: x.cat + (x.viteza ? ` \u00b7 ${x.viteza} km/h` : ""), v: x.l25, txt: nf(x.l25) + " dB", color: dbCol(x.l25 - 10) }));
      rr.sort((a, b) => b.v - a.v);
      const g3 = rr.length ? HM.bars(rr.slice(0, 7), { lw: 190 }) : "";
      /* ---------- graficul 4: c\u00e2t din cei 9 km\u00b2 e peste fiecare prag ---------- */
      const hv = [["50", "#fabe46"], ["55", "#f07828"], ["60", "#d63428"], ["65", "#96143c"]].map(([k, c]) => ({ label: `peste ${k} dB`, v: ha[k] || 0, txt: nf(ha[k] || 0, 0) + " ha", color: c }));
      const g4 = ha["50"] != null ? HM.bars(hv, { lw: 110 }) : "";
      /* ---------- evenimente: distan\u021ba la care se aud muzica \u0219i artificiile ---------- */
      let g5 = "";
      const E5 = EV.slice(0, 5);
      if (E5.length) {
        const w = 440, rh2 = 38, lw2 = 125, sx2 = m => lw2 + Math.min(m, 3500) / 3500 * (w - lw2 - 60);
        g5 = `<svg viewBox="0 0 ${w} ${E5.length * rh2 + 24}" role="img" aria-label="Distan\u021ba p\u00e2n\u0103 la s\u0103lile de evenimente">`;
        [1000, 2000, 3000].forEach(m => g5 += `<line x1="${sx2(m)}" x2="${sx2(m)}" y1="0" y2="${E5.length * rh2}" stroke="var(--line)"/><text x="${sx2(m)}" y="${E5.length * rh2 + 14}" font-size="10" text-anchor="middle" fill="var(--muted)">${m / 1000} km</text>`);
        E5.forEach((e, i) => { const y = i * rh2 + 4, nm = e.nume.length > 19 ? e.nume.slice(0, 18) + "\u2026" : e.nume;
          g5 += `<text x="${lw2 - 6}" y="${y + 15}" font-size="11" text-anchor="end" fill="var(--fg)">${esc(nm)}</text><line x1="${lw2}" x2="${sx2(e.m)}" y1="${y + 11}" y2="${y + 11}" stroke="#5b3aa8" stroke-width="3"/><circle cx="${sx2(e.m)}" cy="${y + 11}" r="6" fill="#5b3aa8"><title>${esc(e.nume + " \u00b7 " + e.tip + " \u00b7 muzic\u0103 " + nf(e.db_muzica) + " dB, artificii " + nf(e.db_artificii) + " dB v\u00e2rf")}</title></circle><text x="${sx2(e.m) + 10}" y="${y + 9}" font-size="10.5" font-weight="600" fill="var(--fg)">${nf(e.m)} m</text><text x="${lw2}" y="${y + 27}" font-size="10" fill="var(--muted)">muzic\u0103 ${nf(e.db_muzica)} dB \u00b7 artificii ${nf(e.db_artificii)} dB v\u00e2rf</text>`; });
        g5 += `</svg>`;
      }
      /* ---------- harta regional\u0103: aeroport, cale ferat\u0103, autostrad\u0103 / centur\u0103 \u00eentre 2\u20133 localit\u0103\u021bi ---------- */
      let reg = "";
      if (R) {
        const WR = 600, CR = WR / 2, scR = CR / R.raza, PR = (x, y) => [CR + x * scR, CR - y * scR];
        const pl = (a, off) => { let s = ""; for (let i = off; i < a.length; i += 2) { const [x, y] = PR(a[i], a[i + 1]); s += `${x.toFixed(1)},${y.toFixed(1)} `; } return s; };
        const stil = { "autostrad\u0103": ["#8b1a1a", 3.2], "centur\u0103": ["#b3261e", 2.8], "drum na\u021bional": ["#d9822b", 2.0], "cale ferat\u0103": ["#111", 1.8, "6 3"], "tramvai": ["#6b7280", 1.4, "2 2"], "pist\u0103": ["#5b3aa8", 5] };
        const linii = (R.linii || []).concat(R.fer || [], R.piste || []);
        const ord = ["tramvai", "drum na\u021bional", "cale ferat\u0103", "centur\u0103", "autostrad\u0103", "pist\u0103"];
        let sv = `<svg viewBox="0 0 ${WR} ${WR}" class="pzmap" role="img" aria-label="Aeroport, cale ferat\u0103 \u0219i autostrad\u0103 \u00een jurul localit\u0103\u021bilor apropiate"><defs><clipPath id="zgc"><rect width="${WR}" height="${WR}"/></clipPath></defs>`;
        sv += `<image href="${base}${esc(R.fundal)}" x="0" y="0" width="${WR}" height="${WR}" preserveAspectRatio="none"/><image href="${base}${esc(R.fisier)}" x="0" y="0" width="${WR}" height="${WR}" preserveAspectRatio="none" opacity=".8"/><g clip-path="url(#zgc)">`;
        ord.forEach(tip => linii.filter(l => l[0] === tip).forEach(l => { const [c, w, da] = stil[tip] || ["#555", 1.5]; sv += `<polyline points="${pl(l, 1)}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="${w + 2.4}" stroke-linejoin="round"/><polyline points="${pl(l, 1)}" fill="none" stroke="${c}" stroke-width="${w}" ${da ? `stroke-dasharray="${da}"` : ""} stroke-linejoin="round"><title>${esc(tip)}</title></polyline>`; }));
        sv += `</g>`;
        [2000, 5000, 10000].filter(m => m < R.raza).forEach(m => sv += `<circle cx="${CR}" cy="${CR}" r="${m * scR}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-dasharray="5 4" stroke-width="1.3"/>` + halo(CR + m * scR * .7071 + 2, CR + m * scR * .7071 + 10, m / 1000 + " km", 10, "#333", "start"));
        const LC = R.localitati || [], mari = LC.filter(x => x.tip !== "village").sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y))[0];
        const alese = [mari, ...LC.filter(x => x !== mari).sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y))].filter(Boolean).slice(0, 3);
        alese.forEach(x => { const [px_, py_] = PR(x.x, x.y); sv += `<circle cx="${px_}" cy="${py_}" r="5" fill="#fff" stroke="#222" stroke-width="2"/>` + halo(px_, py_ - 9, x.nume + " \u00b7 " + nf(Math.hypot(x.x, x.y) / 1000, 1) + " km", 11.5, "#111"); });
        const lab = (tip, text, col) => { const cand = linii.filter(l => l[0] === tip).sort((a, b) => b.length - a.length)[0]; if (!cand) return ""; const n = (cand.length - 1) / 2 | 0, k = 1 + (n >> 1) * 2, [x, y] = PR(cand[k], cand[k + 1]); return x > 20 && y > 20 && x < WR - 20 && y < WR - 12 ? halo(x, y - 6, text, 10.5, col) : ""; };
        sv += lab("pist\u0103", "aeroport", "#3f2a80") + lab("autostrad\u0103", "autostrad\u0103", "#8b1a1a") + lab("centur\u0103", "centur\u0103", "#b3261e") + lab("cale ferat\u0103", "cale ferat\u0103", "#111") + lab("drum na\u021bional", "drum na\u021bional", "#b86a15");
        sv += [["N", CR, 14], ["S", CR, WR - 6], ["E", WR - 8, CR + 4], ["V", 8, CR + 4]].map(([t, x, y]) => halo(x, y, t, 12, "#222")).join("");
        sv += `<circle cx="${CR}" cy="${CR}" r="7" fill="#ff3b5c" stroke="#fff" stroke-width="3"/></svg>`;
        const lg = `<div class="pzchips">${[["#5b3aa8", "pist\u0103 de aeroport"], ["#8b1a1a", "autostrad\u0103 / centur\u0103"], ["#d9822b", "drum na\u021bional"], ["#111", "cale ferat\u0103"]].map(([c, t]) => sw(c, t)).join("")}${sw("#f07828", "zgomot peste 55 dB (f\u0103r\u0103 ecranare)")}</div>`;
        reg = `<div class="pz">${lg}${sv}<p class="nt">Hart\u0103 la scar\u0103 real\u0103, ${R.raza * 2 / 1000} \u00d7 ${R.raza * 2 / 1000} km: localit\u0103\u021bile cele mai apropiate de proprietate, cu aeroportul, calea ferat\u0103 \u0219i \u0219oselele mari. Benzile arat\u0103 unde zgomotul lor trece de 50 dB pe c\u00e2mp deschis, f\u0103r\u0103 cl\u0103diri. [ESTIMARE]</p></div>`;
      }
      const near = EV[0], aer = S.filter(x => x.cat === "aeroport").sort((a, b) => a.m - b.m)[0], fer = S.filter(x => x.cat === "cale ferat\u0103").sort((a, b) => a.m - b.m)[0];
      return {
        lead: "Zonele de zgomot pornesc de la drumuri, calea ferat\u0103, aeroport \u0219i s\u0103li de evenimente \u0219i scad cu distan\u021ba; casele \u0219i p\u0103durile le opresc par\u021bial. Viteza urmeaz\u0103 tipul drumului: 30\u201350 km/h \u00een localitate, 90 \u00een afar\u0103, 110 pe centur\u0103, 130 pe autostrad\u0103.",
        verd,
        cards: [[T != null ? nf(T) + " dB" : "\u2014", "nivel estimat aici, media zilei [estimare]"], [dom ? nf(dom.m) + " m" : "\u2014", dom ? `cea mai tare surs\u0103: ${dom.cat}` : "surs\u0103 dominant\u0103"],
          [near ? nf(near.m) + " m" : "\u2014", near ? `cea mai apropiat\u0103 sal\u0103 de evenimente: ${near.nume}` : "nicio sal\u0103 de evenimente \u00een 3,5 km (OSM)"], [aer ? nf(aer.m / 1000, 1) + " km" : "\u2014", "p\u00e2n\u0103 la pista de aeroport" + (fer ? `; calea ferat\u0103 la ${nf(fer.m)} m` : "")]],
        top: (R ? cap("Aeroport, cale ferat\u0103 \u0219i autostrad\u0103, \u00eentre localit\u0103\u021bile apropiate", reg) : "") + cap("Zonele de zgomot din jurul propriet\u0103\u021bii", hartaLoc),
        charts: [g1 && cap("C\u00e2t zgomot vine de la fiecare surs\u0103 (dB, la proprietate)", g1), g2 && cap(`Cum scade zgomotul cu distan\u021ba: ${L ? L.cat + (L.nume ? " " + L.nume : "") + (L.viteza ? ", " + L.viteza + " km/h" : "") : ""}`, g2), g3 && cap("Nivelul la 25 m de drum, dup\u0103 tipul drumului \u0219i vitez\u0103", g3), g4 && cap("C\u00e2\u021bi hectare din 900 sunt peste fiecare prag", g4), g5 && cap("S\u0103li de evenimente: distan\u021ba \u0219i zgomotul \u00eentr-o sear\u0103 de weekend", g5)].filter(Boolean),
        extra: `<div class="ex"><b>Cum se cite\u0219te:</b> culorile sunt niveluri medii de zi \u00een dB(A) [ESTIMARE de model]. 55 dB e pragul european de raportare (Directiva 2002/49/CE), 45 dB e nivelul de noapte la fa\u021bad\u0103 pentru locuin\u021be (Ordinul MS 119/2014 [de verificat]). Dreptunghiul punctat din primul grafic arat\u0103 c\u00e2t ar fi fost zgomotul \u00een c\u00e2mp liber, f\u0103r\u0103 case \u0219i p\u0103dure. S\u0103lile de evenimente sunt cele marcate \u00een OpenStreetMap; lista poate fi incomplet\u0103, iar muzica (80 dB la 10 m) \u0219i artificiile (105 dB v\u00e2rf la 100 m) sunt ipoteze, mai ales \u00een weekend. Debitele de trafic sunt ipoteze [IPOTEZ\u0102]: ${Object.entries(X.ipoteze?.debit || {}).map(([k, v]) => `${k} ${v.veh_h} veh/h`).join(", ")}; nu avem \u00eenc\u0103 recens\u0103m\u00e2ntul CNAIR.</div>`,
        note: X.sursa + ". " + X.nota };
    } },
  ];

  /* ---------- titlul \u201ede curiozitate\u201d \u0219i c\u00e2ntarul negocierii (ad\u0103ugate peste fiecare capitol) ----------
     Titlul: ton de ziar, dar f\u0103r\u0103 nicio afirma\u021bie care s\u0103 nu stea pe datele capitolului; deschide rezumatul \u0219i trimite la capitol.
     C\u00e2ntarul: risc, intensitate, avantaj \u00een negociere, 0\u201310, fa\u021b\u0103 de v\u00e2nz\u0103tor \u0219i fa\u021b\u0103 de cump\u0103r\u0103tor. Scorurile sunt reguli simple pe verdictul capitolului
     \u0219i pe c\u00e2teva praguri (pant\u0103, ag) [IPOTEZ\u0102]: orienteaz\u0103 negocierea, nu \u00eenlocuiesc o expertiz\u0103. */
  const cl = (x, a = 0, b = 10) => Math.max(a, Math.min(b, Math.round(x)));
  const BAZA = { g: [2, 2, 2], o: [5, 5, 6], r: [8, 8, 8], i: [3, 3, 3] };   // [risc, intensitate, avantaj cump\u0103r\u0103tor] dup\u0103 culoarea verdictului
  function scoruri(V, X, H, c) {
    let [r, i, a] = BAZA[c.verd[0]] || BAZA.i;
    if (V.k === "alunecari" && X.panta_max_pct != null) { const p = X.panta_max_pct; r = cl(p < 2 ? 1 : p < 5 ? 2 : p < 15 ? 5 : 8); i = cl((X.dif_1km_m || 0) / 5, 1); a = cl(r + (p >= 5 ? 1 : 0), 1); }
    if (V.k === "seismic" && X.ag != null) { r = cl((X.ag - 0.08) / 0.03); i = cl(((X.cutremure && X.cutremure.n && X.cutremure.n["100"]) || 0) / 250, 1); a = cl(X.legea212.aplicabila ? r + 1 : r - 1, 1); }
    return { r, i, a };
  }
  /* banda unic\u0103 \u201ecum afecteaz\u0103 valoarea\u201d: o singur\u0103 bar\u0103 ro\u0219u \u2192 portocaliu \u2192 verde, cu un marcaj; f\u0103r\u0103 text de negociere */
  function cantar(V, X, H, c) {
    const s = scoruri(V, X, H, c), ef = Math.max(-1, Math.min(1, (4.5 - s.r) / 4.5)), x = 50 + ef * 46;
    const sem = ef <= -0.35 ? ["#d9534f", "scade valoarea"] : ef < 0.15 ? ["#ee8c3a", "neutru"] : ["#2e933c", "cre\u0219te valoarea"];
    return `<div class="vb" title="${esc("Efect asupra valorii: " + sem[1] + " [IPOTEZ\u0102, din datele capitolului]")}"><b>\u2212</b><span class="vb-t"><i style="left:${x.toFixed(1)}%;background:${sem[0]}"></i></span><b>+</b></div>`;
  }
  const ZIAR = {
    seismic: (X, c) => { const cu = X.cutremure; return cu && cu.n ? `P\u0103m\u00e2ntul s-a clintit de ${nf(cu.n["100"])} de ori \u00een jurul t\u0103u. Ce faci c\u00e2nd afli?` : `C\u00e2t de tare tremur\u0103 p\u0103m\u00e2ntul sub casa pe care o vrei?`; },
    alunecari: (X) => X.panta_max_pct != null && X.panta_max_pct < 5 ? "Terenul pare perfect plat. Ce se ascunde sub el?" : "Panta pe care v\u00e2nz\u0103torul n-a pomenit-o \u00een anun\u021b",
    zgomot: () => "Ce auzi de fapt seara, dup\u0103 ce pleac\u0103 agentul?",
    aer: () => "Aerul din jurul casei: ce respiri, de fapt, \u00een fiecare zi",
    monumente: () => "Vecini cu istoria: ce \u00ee\u021bi interzice un monument de l\u00e2ng\u0103 tine",
    arii_protejate: () => "Natura de l\u00e2ng\u0103 teren: cadou sau interdic\u021bie de construit?",
    autorizatii: () => "Ce se construie\u0219te \u00een jur, f\u0103r\u0103 s\u0103 te \u00eentrebe nimeni",
    costuri: () => "Taxele care nu apar \u00een anun\u021b: c\u00e2t pl\u0103te\u0219ti, de fapt",
    transport: () => "C\u00e2t stai \u00een trafic? Minutele nu mint",
    scoli: () => "\u0218coala copilului: la c\u00e2\u021biva pa\u0219i sau la o or\u0103 distan\u021b\u0103?",
    facilitati: () => "Ce ai la pas: magazinul din col\u021b sau de\u0219ertul de beton?",
    populatie: () => "C\u00e2\u021bi vecini vor fi: ora\u0219ul cre\u0219te pe l\u00e2ng\u0103 tine",
    zonare: () => "Ce poate s\u0103 apar\u0103 l\u00e2ng\u0103 tine: zonarea spune tot"
  };
  const GEN = { r: t => `Aten\u021bie \u00eenainte s\u0103 semnezi: ${t} nu arat\u0103 bine`, o: t => `Ce nu-\u021bi spune anun\u021bul despre ${t}`, g: t => `Ve\u0219ti bune la ${t}. Dar uit\u0103-te \u0219i la restul`, i: t => `${t}: detaliul pe care \u00eel uit\u0103 aproape to\u021bi` };
  VEC.forEach(V => {
    const def = V.def;
    V.def = (X, H) => {
      const c = def(X, H);
      try {
        c.titlu = ((ZIAR[V.k] && ZIAR[V.k](X, c)) || GEN[c.verd[0]](V.t.toLowerCase()));
        c.band = cantar(V, X, H, c);                   // banda de valoare, l\u00e2ng\u0103 titlul capitolului
      } catch (e) { console.warn("c\u00e2ntar", V.k, e); }
      return c;
    };
  });
  if (typeof document !== "undefined" && !window.__zgInit) { window.__zgInit = true;
    document.addEventListener("click", ev => { const b = ev.target && ev.target.closest && ev.target.closest(".zgb"); if (!b) return; const r = b.closest(".zg"), m = b.dataset.m;
      r.querySelectorAll("[data-v]").forEach(e => { e.style.display = e.dataset.v === m ? "" : "none"; }); r.querySelectorAll(".zgb").forEach(x => { x.style.fontWeight = x === b ? 700 : 500; x.style.borderColor = x === b ? "var(--accent)" : ""; }); }); }
  if (typeof document !== "undefined" && !document.getElementById("vb-stil")) { const st = document.createElement("style"); st.id = "vb-stil";
    st.textContent = `.vh{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.vb{display:flex;align-items:center;gap:7px;min-width:190px;flex:0 1 240px;font:600 15px/1 var(--mono);color:var(--muted)}
.vb-t{position:relative;flex:1;height:8px;border-radius:4px;background:linear-gradient(90deg,#d9534f 0%,#ee8c3a 42%,#f2c14e 52%,#7cc47f 70%,#2e933c 100%)}
.vb-t i{position:absolute;top:50%;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);transform:translate(-50%,-50%)}
@media print{.ch,.pz,.pp-g,.pp-t,.hm-box,section .cards,.verd{break-inside:avoid}.ch-t,.hm-t,h2,.vh{break-after:avoid}}
@media (max-width:600px){section .cards{grid-template-columns:1fr 1fr!important;gap:8px!important}section .cards .card{padding:10px!important}section .cards .card b{font-size:19px!important}section .cards .card span{font-size:12px!important}}`;
    document.head.appendChild(st); }
  /* ---------- \u201eprima pagin\u0103\u201d a Rezumatului: titlu mare de ziar, 6 chenare-teaser ordonate dup\u0103 gravitate, banda de valoare ----------
     Regula de prezentare: ochiul prinde \u00eent\u00e2i culoarea, cifra mare \u0219i titlul; textul vine dup\u0103. Titlurile stau pe datele capitolelor. */
  function prima(el, D, HR, go) {
    const ORD = { r: 0, o: 1, g: 3, i: 4 }, COL = { r: "#d9364f", o: "#ef8a2a", g: "#2e933c", i: "#4a6fa5" };
    const L = VEC.filter(V => V.k === "zonare" ? HR : D[V.k]).map(V => { try { const c = V.def(V.k === "zonare" ? {} : D[V.k], HR); return c && c.cards && c.cards.length ? { V, c } : null; } catch (e) { return null; } }).filter(Boolean);
    const F = D.inundatii;
    if (F && F.hazard && F.hazard.hz10) {                // inunda\u021biile sunt capitol separat (index.html): le aducem \u0219i aici, \u00een limbaj simplu
      const z = F.hazard.hz10.dist_m, z1 = F.hazard.hz100 && F.hazard.hz100.dist_m, vd = z === 0 ? "r" : (typeof z === "number" && z <= 100) || z1 === 0 ? "o" : "g";
      const tit = { r: "Casa e \u00een zona pe care apa o acoper\u0103 o dat\u0103 la 10 ani", o: z1 === 0 ? "H\u0103r\u021bile oficiale pun casa \u00een zona de inunda\u021bie \u201eo dat\u0103 la 100 de ani\u201d" : "Zona de inunda\u021bie \u201eo dat\u0103 la 10 ani\u201d \u00eencepe la c\u00e2\u021biva pa\u0219i", g: "Apa n-a ajuns aici \u00een h\u0103r\u021bile oficiale de inunda\u021bii. Dar r\u00e2ul e aproape?" }[vd];
      L.push({ V: { k: "inundatii", t: "Inunda\u021bii" }, c: { verd: [vd], titlu: tit, cards: [[F.rau ? nf(F.rau.dist_m) + " m" : "\u2014", "p\u00e2n\u0103 la " + (F.rau && F.rau.nume || "cel mai apropiat curs de ap\u0103")]],
        band: cantar({ k: "inundatii" }, {}, null, { verd: [vd] }) } });
    }
    if (!L.length) { el.innerHTML = ""; return; }
    const PRI = ["inundatii", "seismic", "zgomot", "alunecari", "autorizatii", "costuri", "arii_protejate", "monumente", "aer", "transport", "scoli", "facilitati", "populatie", "zonare"];
    const pr = k => { const i = PRI.indexOf(k); return i < 0 ? 99 : i; };
    L.sort((a, b) => ((ORD[a.c.verd[0]] ?? 5) - (ORD[b.c.verd[0]] ?? 5)) || (pr(a.V.k) - pr(b.V.k)));   // la aceea\u0219i gravitate, riscurile \u00eenaintea facilit\u0103\u021bilor
    const nr = k => L.filter(x => x.c.verd[0] === k).length, cap0 = L[0];
    const ef = L.reduce((s, x) => s + ({ r: -1, o: -.4, g: .6, i: 0 }[x.c.verd[0]] || 0), 0) / L.length, pos = 50 + Math.max(-1, Math.min(1, ef)) * 46;
    const loc = (D.localizare && (D.localizare.uat || D.localizare.localitate)) || (D.populatie && D.populatie.uat) || "";
    const t = L.slice(0, 6).map(({ V, c }, k) => `<button type="button" class="pp-t" data-go="${V.k}" style="--c:${COL[c.verd[0]] || "#888"}">
      <span class="pp-k">${esc(V.t)}</span><b class="pp-n">${esc(c.cards[0][0])}</b><span class="pp-h">${esc(k === 0 ? c.cards[0][1] : c.titlu || c.verd[1])}</span>${c.band || ""}</button>`).join("");
    el.innerHTML = `<div class="pp"><div class="pp-kick">Raport \u00b7 ${esc(loc)} \u00b7 ${esc(D.eticheta || D.id)}</div>
      <h1 class="pp-h1" data-go="${cap0.V.k}">${esc(cap0.c.titlu || cap0.c.verd[1])}</h1>
      <div class="pp-sub"><span style="--c:${COL.r}">${nr("r")} nu arat\u0103 bine</span><span style="--c:${COL.o}">${nr("o")} de verificat</span><span style="--c:${COL.g}">${nr("g")} arat\u0103 bine</span>
        <span class="pp-vb"><em>valoarea, pe scurt</em><span class="vb"><b>\u2212</b><span class="vb-t"><i style="left:${pos.toFixed(1)}%;background:${ef < -.2 ? COL.r : ef < .2 ? COL.o : COL.g}"></i></span><b>+</b></span></span></div>
      <div class="pp-g">${t}</div></div>`;
    el.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
  }
  if (typeof document !== "undefined" && !document.getElementById("pp-stil")) { const st = document.createElement("style"); st.id = "pp-stil";
    st.textContent = `.pp{margin:0 0 18px}
.pp-kick{font:700 11px/1 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:#d9364f;margin-bottom:8px}
.pp-h1{font:900 clamp(26px,4.2vw,42px)/1.05 var(--font);letter-spacing:-.02em;margin:0 0 12px;cursor:pointer;max-width:24ch}
.pp-h1:hover{text-decoration:underline;text-decoration-color:#d9364f;text-decoration-thickness:3px}
.pp-sub{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;margin-bottom:16px;font-weight:600;font-size:14px}
.pp-sub>span:not(.pp-vb){display:inline-flex;align-items:center;gap:6px}.pp-sub>span:not(.pp-vb)::before{content:"";width:10px;height:10px;border-radius:50%;background:var(--c)}
.pp-vb{display:inline-flex;align-items:center;gap:10px;margin-left:auto}.pp-vb em{font-style:normal;font-size:12px;color:var(--muted);font-weight:500}.pp-vb .vb{flex:none;width:170px;min-width:0}
.pp-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
.pp-t{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;gap:6px;padding:12px 14px 12px;border-radius:12px;background:var(--card,#fff);border:1px solid var(--line);border-top:5px solid var(--c);transition:transform .15s,box-shadow .15s}
.pp-t:hover,.pp-t:focus-visible{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.08)}
.pp-k{font:700 10.5px/1 var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--c)}
.pp-n{font:800 26px/1 var(--mono);color:var(--fg)}
.pp-h{font:600 13.5px/1.3 var(--font);color:var(--fg)}
.pp-t .vb{flex:none;min-width:0;font-size:12px;margin-top:auto;padding-top:4px}.pp-t .vb-t{height:5px}.pp-t .vb-t i{width:11px;height:11px;border-width:2px}
@media (max-width:600px){.pp-g{grid-template-columns:1fr 1fr;gap:8px}.pp-t{padding:9px 10px;gap:4px;border-top-width:4px}.pp-k{font-size:9px;letter-spacing:.06em}.pp-n{font-size:20px}
 .pp-h{font-size:12px;line-height:1.25;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.pp-t .vb b{display:none}.pp-vb{margin-left:0;width:100%}.pp-vb .vb{flex:1;width:auto}.pp-h1{font-size:25px}}`;
    document.head.appendChild(st); }
  window.PRIMA = prima;
  window.VEC = VEC;
})();
