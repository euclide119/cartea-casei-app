/* Raport în creștere — capitolul „Estimare de valoare și randament".
   Date: p/<id>/piata.json (anunțuri de vânzare din jurul proprietății, piata.py) și piata_istoric.json (serii publice cu sursă: indice de prețuri, chirii, costuri).
   Metode: (1) comparabile cu ajustări, (2) cost de înlocuire, (3) piață (aceleași comparabile, pe zonă), (4) cea mai bună utilizare (valoare reziduală a terenului),
   (5) ROI, randament și apreciere în timp, (6) istoric pe ani, (7) randamente pe tipuri de imobile în localitate.
   Nu e evaluare ANEVAR (termen rezervat, OG 24/2011): rezultatul e „interval de preț estimat din comparabile". Prețurile din anunțuri sunt prețuri CERUTE.
   Fiecare cifră are o etichetă: V verificat cu sursă · D dedus din date · E estimare / ipoteză editabilă. Nu folosește .cards/.note/.scroll (ascunse în „Simplu"); tabelele au clasa sr-t. */
(function () {
  try { EL.evaluare = "evaluare"; EL_INV.evaluare = "evaluare"; } catch (e) {}   // înainte ca index.html să citească hash-ul
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = (v, d = 0) => (v == null || !isFinite(v)) ? "—" : Number(v).toLocaleString("ro-RO", { minimumFractionDigits: d, maximumFractionDigits: d });
  const eur = v => v == null || !isFinite(v) ? "—" : nf(Math.round(v / 100) * 100) + " €";
  const eur0 = v => v == null || !isFinite(v) ? "—" : nf(Math.round(v)) + " €";
  const pct = (v, d = 1) => v == null || !isFinite(v) ? "—" : nf(v * 100, d) + "%";
  let P = null, H = null, last = null, S = null, tmo = null;
  const TIPURI = { casa: "Casă", duplex: "Duplex (jumătate)", apartament: "Apartament", teren: "Teren" };

  /* ---------- parametri (editabili); toate sunt ipoteze E dacă nu au sursă ---------- */
  const DEF = { tip: "casa", mp: 120, teren: 500, an: 2018, camere: 4, zona: "", cerut: "", chirie: "",
    neg: 5, expo: null, vacanta: 5, mentenanta: 1.0, impozit_cl: 0.1, asig: 0.1, credit_cost: 1, tva: "nu", excl: [], cost_vanzare: 4, orizont: 10, ltv: 0,
    cost_constr: 700, indirecte: 12, durata: 70, marja_dev: 15, pot: 30, nivele: 2, imp_chirie: 8, teren_adaos: 60 };
  const Dd = () => (typeof D !== "undefined" ? D : null);
  const key = () => "ric-ev-" + (Dd() && Dd().id);
  /* limite urbanistice din „Ce poți construi aici” (indicatori.py → D.indicatori_urbanistici): POT, niveluri și parcela minimă devin plafonul scenariilor de utilizare.
     Se folosește valoarea cea mai prudentă (minimul intervalului) și numai din treapta 1–3 (PUG, regulament, lege); estimările din vecini nu limitează. Utilizatorul le poate edita. */
  function limiteRLU() {
    const R = Dd()?.indicatori_urbanistici?.indicatori, o = {}; if (!R) return o;
    const g = id => R.find(r => r.id === id), src = [];
    const pot = g("pot"); if (pot && pot.treapta >= 1 && pot.treapta <= 3 && pot.interval?.min) { o.pot = pot.interval.min; src.push(`POT ${o.pot}% (${pot.sursa.split(";")[0]})`); }
    const rg = g("regim"), m = rg && rg.treapta >= 1 && rg.treapta <= 3 && /P\s*\+\s*(\d)/.exec(rg.valoare || ""); if (m) { o.nivele = +m[1] + 1; src.push(`${o.nivele} niveluri (${rg.sursa.split(";")[0]})`); }
    const pc = g("parcela"); if (pc && pc.treapta >= 1 && pc.treapta <= 3 && pc.interval?.min) { o.parcela_min = pc.interval.min; src.push(`parcelă min. ${o.parcela_min} mp`); }
    if (src.length) o.src_limite = src.join("; ");
    return o;
  }
  function incarca() { S = Object.assign({}, DEF, limiteRLU()); try { Object.assign(S, JSON.parse(localStorage.getItem(key()) || "{}")); } catch (e) {} }
  function salveaza() { try { localStorage.setItem(key(), JSON.stringify(S)); } catch (e) {} }

  function css() {
    const s = document.createElement("style"); s.id = "ev-css";
    s.textContent = `
#evaluare .ev-sec{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:10px;min-width:0}
#evaluare .ev-sec h3{margin:0}
#evaluare .ev-in{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px}
#evaluare .ev-in label{display:flex;flex-direction:column;gap:2px;font-size:12px;color:var(--muted)}
#evaluare .ev-in input,#evaluare .ev-in select{font:500 14px var(--mono);padding:6px 8px;border:1px solid var(--line);border-radius:7px;background:var(--bg);color:var(--fg);min-width:0}
#evaluare .ev-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px}
#evaluare .ev-k>div{border:1px solid var(--line);border-radius:9px;padding:10px 12px;display:flex;flex-direction:column;gap:2px}
#evaluare .ev-k b{font:600 20px/1.15 var(--mono);letter-spacing:-.02em} #evaluare .ev-k span{font-size:12.5px;color:var(--muted)}
#evaluare .ev-k .m{background:color-mix(in srgb,var(--summer) 22%,var(--panel))}
#evaluare .ev-p{font-size:13.5px;margin:0} #evaluare .ev-s{font-size:12px;color:var(--muted);margin:0}
#evaluare .ev-e{font:600 10.5px var(--mono);padding:0 5px;border-radius:4px;background:color-mix(in srgb,var(--fg) 10%,transparent);margin-left:4px;color:var(--muted)}
#evaluare .ev-w{overflow-x:auto}
#evaluare table.sr-t td.l,#evaluare table.sr-t th.l{text-align:left}
#evaluare .ev-par{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px 10px}
#evaluare .ev-par label{font-size:12px;color:var(--muted);display:flex;flex-direction:column;gap:2px}
#evaluare .ev-par input{font:500 13px var(--mono);padding:4px 6px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--fg)}
#evaluare .ev-ok{color:var(--ok)} #evaluare .ev-no{color:var(--hz10)} #evaluare .ev-ma{color:var(--hz100)}
#evaluare svg.ev-g{width:100%;height:auto}
#evaluare .ev-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr));gap:12px}
#evaluare .ev-bar{position:relative;height:46px;margin:26px 8px 4px} #evaluare .ev-bg{position:absolute;inset:14px 0 14px;border-radius:99px}
#evaluare .ev-bar i{position:absolute;top:0;bottom:0;width:0;border-left:2px solid var(--fg)} #evaluare .ev-bar i span{position:absolute;top:-22px;left:0;transform:translateX(-50%);font:600 11px var(--mono);white-space:nowrap;background:var(--panel);padding:1px 4px;border-radius:4px}
#evaluare .ev-bar .ev-mk{border-left:1px dashed var(--muted);top:8px;bottom:8px} #evaluare .ev-bar .ev-mk span{top:34px;font-weight:500;color:var(--muted)}
#evaluare .ev-bar .ev-me{border-left:2px solid var(--fg);top:10px;bottom:10px} #evaluare .ev-bar .ev-me span{top:36px}
#evaluare .ev-bar .ev-pr{border-left:3px solid #1a1e2a;top:2px;bottom:2px} #evaluare .ev-bar .ev-pr span{background:var(--fg);color:var(--bg);top:-24px}
#evaluare .ev-lbl{position:relative;height:18px;margin:30px 8px 0;font-size:12px;color:var(--muted)} #evaluare .ev-lbl span{position:absolute;transform:translateX(-50%);white-space:nowrap}
#evaluare .ev-bar2{position:relative;height:34px;margin:22px 10px 8px} #evaluare .ev-seg{display:flex;gap:1px;height:16px;margin-top:6px;border-radius:99px;overflow:hidden} #evaluare .ev-seg b{flex:1}
#evaluare .ev-bar2 i{position:absolute;top:0;width:0;border-left:2px solid var(--fg);height:28px} #evaluare .ev-bar2 .ev-t{border-left:1px dashed var(--muted);top:8px;height:22px} #evaluare .ev-bar2 .ev-t span{position:absolute;top:24px;left:0;transform:translateX(-50%);font:500 10.5px/1.2 var(--mono);color:var(--muted);text-align:center;white-space:nowrap}
#evaluare .ev-bar2 .ev-pr{border-left:3px solid var(--fg);top:-2px;height:36px} #evaluare .ev-bar2 .ev-pr span{position:absolute;top:-20px;left:0;transform:translateX(-50%);background:var(--fg);color:var(--bg);font:600 11px var(--mono);padding:1px 5px;border-radius:4px;white-space:nowrap}
#evaluare details summary{cursor:pointer;font-size:13px;color:var(--muted)}`;
    document.head.appendChild(s);
  }

  /* ---------- statistică ---------- */
  const med = a => { const v = a.filter(isFinite).sort((x, y) => x - y); if (!v.length) return null; const m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
  const qnt = (a, p) => { const v = a.filter(isFinite).sort((x, y) => x - y); if (!v.length) return null; const k = (v.length - 1) * p, f = Math.floor(k); return v[f] + (v[Math.min(f + 1, v.length - 1)] - v[f]) * (k - f); };
  function ols(x, y) { const n = x.length; if (n < 8) return null; const mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n;
    let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; } return sxx ? sxy / sxx : null; }
  const clip = (v, a, b) => Math.min(b, Math.max(a, v));
  const landE = () => { const T = P?.stats?.teren; if (!T) return null; const z = T.zone?.find(z => z.zona === S.zona); return z ? z.med : T.med; };

  const ck = c => c.url || [c.zona, c.mp, c.p].join("|");

  /* ---------- 1. comparabile cu ajustări ---------- */
  function comparabile() {
    const all = (P?.comps?.[S.tip] || []).filter(c => !(S.excl || []).includes(ck(c))); if (all.length < 8) return null;
    const lnmp = all.map(c => Math.log(c.mp)), lne = all.map(c => Math.log(c.e));
    const b = clip(ols(lnmp, lne) ?? -0.15, -0.5, 0);                    // elasticitatea €/mp față de suprafață
    const ca = all.filter(c => c.an && c.an >= 1950); const g = ca.length >= 25 ? clip(ols(ca.map(c => c.an), ca.map(c => Math.log(c.e))) ?? 0, -0.005, 0.03) : null;
    const lE = landE(), hasLand = (S.tip === "casa" || S.tip === "duplex") && S.teren && lE;
    const dom = S.tip === "teren" ? [0.4, 2.5] : [0.6, 1.7];
    let pool = all.filter(c => c.mp >= S.mp * dom[0] && c.mp <= S.mp * dom[1]);
    const scor = c => Math.abs(Math.log(c.mp / S.mp)) + (S.zona && c.zona !== S.zona ? 0.35 : 0) + (S.an && c.an ? Math.min(Math.abs(c.an - S.an) / 40, 0.6) : 0) + (S.teren && c.teren ? Math.min(Math.abs(Math.log(c.teren / S.teren)) * 0.3, 0.5) : 0);
    pool.sort((a, c) => scor(a) - scor(c)); pool = pool.slice(0, 15); if (pool.length < 5) return { n: pool.length, b, g };
    const neg = S.neg / 100;
    const rows = pool.map(c => { let e = c.e * Math.pow(c.mp / S.mp, b);
      const aj = { dim: Math.pow(c.mp / S.mp, b) - 1, an: 0, teren: 0 };
      if (g != null && S.an && c.an) { const f = Math.pow(1 + g, S.an - c.an); aj.an = f - 1; e *= f; }
      let p = e * S.mp;
      if (hasLand && c.teren) { const d = (S.teren - c.teren) * lE * S.teren_adaos / 100; aj.teren = d / (c.e * c.mp); p += d; }
      return { c, e_adj: p / S.mp, p_adj: p * (1 - neg), aj }; });
    const ps = rows.map(r => r.p_adj);
    return { n: rows.length, b, g, rows, p_med: med(ps), p25: qnt(ps, .25), p75: qnt(ps, .75), e_med: med(rows.map(r => r.e_adj)), hasLand, lE };
  }

  /* ---------- 2. cost de înlocuire ---------- */
  function cost() {
    if (S.tip === "teren" || S.tip === "apartament") return null;
    const lE = landE(), age = S.an ? Math.max(0, 2026 - S.an) : null, dep = age == null ? null : clip(age / S.durata, 0, 0.7);
    const nou = S.mp * S.cost_constr * (1 + S.indirecte / 100);
    const cl = dep == null ? null : nou * (1 - dep);
    const teren = S.tip === "apartament" ? 0 : (S.teren && lE ? S.teren * lE : null);
    return { nou, dep, age, cl, teren, total: cl != null && (teren != null || S.tip === "apartament") ? cl + (teren || 0) : null, lE };
  }

  /* ---------- 3. cea mai bună utilizare: valoarea reziduală a terenului ---------- */
  function cmbu() {
    const T = P?.stats; if (!T || !S.teren || S.tip === "apartament") return null;
    const nou = tip => { const c = (P.comps[tip] || []).filter(x => x.an && x.an >= 2021); const v = c.length >= 6 ? c : (P.comps[tip] || []); return v.length >= 6 ? med(v.map(x => x.e)) : null; };
    const opt = [];
    const add = (nume, unit, mpu, tip, minParcela) => { const e = nou(tip); if (e == null) return;
      const parcele = Math.max(1, Math.floor(S.teren / Math.max(minParcela, S.parcela_min || 0))); const nu = Math.min(unit, parcele);
      const aria_max = S.teren * S.pot / 100 * S.nivele, mp_tot = Math.min(nu * mpu, aria_max);
      if (mp_tot < 40) return;
      const gdv = mp_tot * e * (1 - S.neg / 100), c = mp_tot * S.cost_constr * (1 + S.indirecte / 100), prof = gdv * S.marja_dev / 100;
      const rez = gdv - c - prof; opt.push({ nume, nu, mp_tot, e, gdv, c, prof, rez, rez_mp: rez / S.teren, limitat: mp_tot < nu * mpu }); };
    add("o casă individuală", 1, 130, "casa", 300);
    add("duplex (2 unități)", 2, 110, "duplex", 250);
    if (S.teren >= 900) add("două case individuale", 2, 130, "casa", 400);
    const lE = landE(); opt.forEach(o => o.vs_teren = lE ? o.rez_mp / lE : null);
    const best = opt.slice().sort((a, b) => b.rez - a.rez)[0];
    return { opt, best, lE };
  }

  /* costuri de achiziție: notar + OCPI din capitolul Costuri (calculator DD, procent din baza de calcul), plus credit dacă e cazul */
  function costAch() {
    const V = Dd()?.costuri?.vanzare, f = t => V?.find(x => x.ce.startsWith(t))?.lei, baza = f("bază de calcul");
    let notar = f("TOTAL onorariu notarial"), ocpi = (f("intabulare") || 0) + (f("extras CF") || 0), din = true;
    if (!baza || !notar) din = false;
    const pn = din ? notar / baza * 100 : 1.5, po = din ? ocpi / baza * 100 : 0, pc = S.ltv > 0 ? S.ltv / 100 * S.credit_cost : 0;
    return { notar: pn, ocpi: po, credit: pc, total: pn + po + pc, din };
  }

  /* ---------- 4. ROI, randament, apreciere ---------- */
  function cagr(serie, ani) { if (!serie) return null; const p = serie.slice().sort((a, b) => a.an - b.an), last = p[p.length - 1]; const old = p.find(x => x.an === last.an - ani) || null;
    if (!old) return null; return Math.pow(last.v / old.v, 1 / ani) - 1; }
  function irr(cf) { let lo = -0.9, hi = 1; const f = r => cf.reduce((s, c, i) => s + c / Math.pow(1 + r, i), 0); if (f(lo) * f(hi) > 0) return null;
    for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; f(lo) * f(m) <= 0 ? hi = m : lo = m; } return (lo + hi) / 2; }
  function roi(valoare, serie) {
    const stm = H?.serie_tm?.puncte, gL = stm && stm.length > 2 ? Math.pow(stm[stm.length - 1].v / stm[0].v, 1 / (stm[stm.length - 1].an - stm[0].an)) - 1 : null, nL = stm ? stm[stm.length - 1].an - stm[0].an : null;
    const g5 = cagr(serie, 5), g10 = cagr(serie, 10), g19 = gL, gs = [g5, g10, g19].filter(x => x != null);
    const P0 = +S.cerut || valoare; if (!P0) return null;
    const chirie = +S.chirie || (S.tip === "apartament" && H?.chirie_apt_lunara?.[String(Math.min(S.camere, 3))] && S.camere >= 1 && S.camere <= 3 ? H.chirie_apt_lunara[String(S.camere)] : null);
    const sc = gs.length ? [["prudent", 0.5 * Math.min(...gs)], ["de bază", med(gs)], ["optimist", Math.max(...gs)]] : [["de bază", 0.03]];
    const n = S.orizont, buy = P0 * (1 + costAch().total / 100);
    const rows = sc.map(([nume, g]) => {
      const cf = [-buy]; let cum = 0, rent = chirie ? chirie * 12 : 0, V = P0;
      for (let y = 1; y <= n; y++) { V = P0 * Math.pow(1 + g, y);
        const brut = rent * (1 - S.vacanta / 100), cheltuieli = V * (S.mentenanta + S.impozit_cl + S.asig) / 100, impozit = brut * S.imp_chirie / 100;
        const net = brut - cheltuieli - impozit; cum += net; cf.push(net + (y === n ? V * (1 - S.cost_vanzare / 100) : 0)); rent *= 1 + Math.max(0, g - 0.01); }
      const Vn = P0 * Math.pow(1 + g, n), total = cf.slice(1).reduce((a, b) => a + b, 0) - buy;
      return { nume, g, Vn, cum, total, roi: total / buy, irr: irr(cf), cf };
    });
    const brut1 = chirie ? chirie * 12 / P0 : null, net1 = chirie ? (chirie * 12 * (1 - S.vacanta / 100) * (1 - S.imp_chirie / 100) - P0 * (S.mentenanta + S.impozit_cl + S.asig) / 100) / P0 : null;
    return { P0, chirie, brut1, net1, rows, g5, g10, g19, nL, n };
  }

  /* ---------- grafice SVG ---------- */
  function linii(serii, W, Hh, fmtY) {
    const xs = serii.flatMap(s => s.p.map(p => p[0])), ys = serii.flatMap(s => s.p.map(p => p[1])); if (!xs.length) return "";
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = 0, y1 = Math.max(...ys) * 1.08, L = 44, R = 12, T = 12, B = 24;
    const X = x => L + (x - x0) / (x1 - x0 || 1) * (W - L - R), Y = y => Hh - B - (y - y0) / (y1 - y0 || 1) * (Hh - B - T);
    let g = ""; for (let i = 0; i <= 4; i++) { const v = y1 * i / 4; g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="${L - 4}" y="${Y(v) + 4}" font-size="10" fill="var(--muted)" text-anchor="end">${fmtY(v)}</text>`; }
    const step = Math.ceil((x1 - x0) / 8); for (let x = x0; x <= x1; x += step) g += `<text x="${X(x)}" y="${Hh - 6}" font-size="10" fill="var(--muted)" text-anchor="middle">${x}</text>`;
    serii.forEach(s => { g += `<polyline fill="none" stroke="${s.c}" stroke-width="2" ${s.dash ? 'stroke-dasharray="5 4"' : ""} points="${s.p.map(p => X(p[0]) + "," + Y(p[1])).join(" ")}"/>`; });
    const leg = serii.map((s, i) => `<g transform="translate(${L + 6 + i * 150},${T + 4})"><rect width="12" height="3" y="3" fill="${s.c}"/><text x="16" y="9" font-size="10.5" fill="var(--fg)">${esc(s.n)}</text></g>`).join("");
    return `<svg class="ev-g" viewBox="0 0 ${W} ${Hh}" role="img">${g}${leg}</svg>`;
  }

  /* ---------- date generice: teren și imobil la cheie (nou, finalizat) ---------- */
  function generice() {
    const T = P?.stats?.teren, out = { teren: T ? { n: T.n, med: T.med, p25: T.p25, p75: T.p75, zone: T.zone || [] } : null, cheie: [] };
    for (const k of ["casa", "duplex", "apartament"]) {
      const c = (P?.comps?.[k] || []), nou = c.filter(x => x.an && x.an >= 2021);
      if (c.length < 6) continue;
      const a = nou.length >= 6 ? nou : null;
      out.cheie.push({ tip: k, n: c.length, med: med(c.map(x => x.e)), nou: a ? { n: a.length, med: med(a.map(x => x.e)), p25: qnt(a.map(x => x.e), .25), p75: qnt(a.map(x => x.e), .75) } : null });
    }
    return out;
  }

  /* ---------- bara verde–roșu pe prețul pe mp, poziționată pe percentilă (5 trepte, încredere separată, „date insuficiente") ---------- */
  const pctl = (arr, v) => { const a = arr.filter(isFinite); return a.length ? 100 * a.filter(x => x < v).length / a.length : null; };
  const N_MIN = 10;
  const TREPTE = [[10, "foarte jos: află de ce", "ev-ma"], [25, "bun", "ev-ok"], [75, "corect, la piață", "ev-ma"], [90, "ridicat", "ev-ma"], [101, "scump", "ev-no"]];
  function grupuri() {
    const all = (P?.comps?.[S.tip] || []).filter(c => !(S.excl || []).includes(ck(c)) && (S.tip === "teren" ? (c.mp >= S.mp * 0.4 && c.mp <= S.mp * 2.5) : (c.mp >= S.mp * 0.6 && c.mp <= S.mp * 1.7)));
    const G = [], nou = all.filter(c => c.an && c.an >= 2021), vechi = all.filter(c => c.an && c.an < 2021), subjNou = S.an && S.an >= 2021 && S.tip !== "teren";
    if (S.tip !== "teren") { G.push({ n: "Imobile noi (din 2021)", c: nou, nou: true }); G.push({ n: "Imobile existente (înainte de 2021)", c: vechi }); }
    const toate = { n: "Toate anunțurile comparabile", c: all };
    const prim = G.find(g => !!g.nou === !!subjNou && g.c.length >= N_MIN) || toate;
    return [prim, ...(prim === toate ? [] : [toate])];
  }
  const incredere = (n, e) => { if (n < N_MIN) return null; let l = n >= 60 ? 2 : n >= 25 ? 1 : 0; const disp = (qnt(e, .75) - qnt(e, .25)) / qnt(e, .5); if (disp > 0.45) l = Math.max(0, l - 1); return { nivel: ["Mică", "Medie", "Mare"][l], disp }; };
  function barePret(C) {
    const tvaF = S.tva === "da" ? 1.21 : 1, cerutMp = (+S.cerut || 0) / tvaF / S.mp || null, G = grupuri();
    let prim = null;
    const html = G.map((g, gi) => { const e = g.c.map(c => c.e), inc = incredere(e.length, e);
      if (!inc) return `<div class="ev-b2"><p class="ev-p"><b>${esc(g.n)}</b> · ${nf(e.length)} anunțuri</p><p class="ev-p ev-ma"><b>Date insuficiente</b> (sub ${N_MIN} anunțuri comparabile): nu afișăm bară, ca să nu dăm un verdict fără bază.</p></div>`;
      const q = p => qnt(e, p), pc = cerutMp ? pctl(e, cerutMp) : null, tr = pc == null ? null : TREPTE.find(t => pc <= t[0]);
      if (gi === 0) prim = { pctl: pc, med: q(.5), n: e.length, grup: g.n, media: e.reduce((a, b) => a + b, 0) / e.length, inc, trepta: tr && tr[1], q25: q(.25), q75: q(.75) };
      const seg = Array.from({ length: 34 }, (_, i) => { const t = i / 33, col = t < .5 ? `color-mix(in srgb, #1f8a4c ${100 - t * 200}%, #e9c43a)` : `color-mix(in srgb, #e9c43a ${100 - (t - .5) * 200}%, #d6342c)`; return `<b style="background:${col}"></b>`; }).join("");
      return `<div class="ev-b2"><p class="ev-p"><b>${esc(g.n)}</b> · ${nf(e.length)} anunțuri · preț pe mp · încredere <b>${inc.nivel}</b></p><div class="ev-bar2"><div class="ev-seg">${seg}</div>` +
        [10, 25, 50, 75, 90].map(t => `<i class="ev-t" style="left:${t}%"><span>P${t}<br>${nf(q(t / 100))}</span></i>`).join("") +
        (pc != null ? `<i class="ev-pr" style="left:${clip(pc, 0, 100)}%"><span>cerut ${nf(cerutMp)} €/mp${tvaF > 1 ? " fără TVA" : ""}</span></i>` : "") + `</div>` +
        `<p class="ev-p" style="margin-top:34px">${pc == null ? "Scrie prețul cerut în fișă ca să-l vezi pe bară." : `Verdict: <b class="${tr[2]}">P${Math.round(pc)} · ${tr[1]}</b>: ${nf(Math.round(pc))}% dintre anunțurile comparabile au prețul pe mp mai mic decât ${nf(cerutMp)} €/mp.`}</p>` +
        (inc.disp > 0.45 ? `<p class="ev-s ev-ma">Piață eterogenă (intervalul 25–75% e larg, ${nf(inc.disp * 100)}% din mediană): compară cu proprietăți mai apropiate, bifează sau debifează comparabilele din tabel.</p>` : "") + `</div>`; }).join("");
    return { html, pctl: prim?.pctl ?? null, prim, cerutMp };
  }
  function bara(C) {
    const B = barePret(C); window.__EV_BARA = B; if (!B.html) return "";
    const e_adj = C?.e_med ? C.e_med * (1 - S.neg / 100) : null, hpi = H?.indice?.puncte, tm = H?.serie_tm?.puncte;
    const yoy = hpi && hpi.length > 1 ? hpi[hpi.length - 1].v / hpi[hpi.length - 2].v - 1 : null, tmy = tm && tm.length > 1 ? tm[tm.length - 1].v / tm[tm.length - 2].v - 1 : null;
    let de = "";
    if (B.prim && B.pctl != null) { const L = (window.RIC_NEG ? RIC_NEG.parghii(Dd()) : []).filter(x => x.tema !== "Prețul cerut față de piață");
      const sus = B.pctl > 75, jos = B.pctl <= 25, lst = L.filter(x => sus ? x.dir === "s" : x.dir === "j").slice(0, 4);
      if ((sus || jos) && lst.length) de = `<p class="ev-p"><b>${sus ? "De ce poate fi scump, ce susține prețul" : "De ce poate fi ieftin, ce trebuie verificat"}:</b></p><ul class="ev-p" style="margin:0;padding-left:18px">${lst.map(x => `<li><b>${esc(x.tema)}:</b> ${esc(x.fapt)}</li>`).join("")}</ul>`;
      else if (sus || jos) de = `<p class="ev-s">Prețul iese din zona „corect”, dar datele raportului nu dau încă un motiv clar (risc, utilități, urbanism). Întreabă vânzătorul.</p>`; }
    const dtext = "Storia, OLX, Publi24, colectate de Fabrica, instantaneu " + (((P?.sursa || "").match(/instantaneu ([\d.]+)/) || [])[1] || "—");
    return `<div class="ev-sec keep"><h3>Cât de bun e prețul pe mp ${E("D")}</h3>${B.html}${de}
      <div class="ev-k"><div><span>Media zonei (${B.prim ? esc(B.prim.grup.toLowerCase()) : "—"})</span><b>${B.prim ? nf(B.prim.media) + " €/mp" : "—"}</b><span>medie simplă ${E("D")}</span></div>
        <div><span>Mediana comparabilelor ajustate</span><b>${e_adj ? nf(e_adj) + " €/mp" : "—"}</b><span>cu reducere de negociere ${S.neg}% ${E("E")}</span></div>
        <div><span>Trend</span><b>${yoy == null ? "—" : (yoy >= 0 ? "+" : "") + pct(yoy)}</b><span>indice național ${hpi ? hpi[hpi.length - 2].an + "→" + hpi[hpi.length - 1].an : ""} ${E("V")}${tmy == null ? "" : `; apartamente Timișoara ${tm[tm.length - 2].an}→${tm[tm.length - 1].an}: ${(tmy >= 0 ? "+" : "") + pct(tmy)} ${E("E")}`}</span></div></div>
      <p class="ev-s"><b>Estimare din anunțuri, nu evaluare ANEVAR.</b> Ancora: prețuri cerute în anunțuri active din ${esc(P.uat)} și zonele apropiate, ${esc(dtext)}; n = ${B.prim ? nf(B.prim.n) : 0}. Reper de tranzacție (grila notarială) nu e încă integrat în raport ${E("lipsă")}.</p>
      <details><summary>Cum se citește bara: praguri, încredere, limite</summary><p class="ev-s">Bara e pe percentilă (câte anunțuri comparabile sunt mai ieftine) și pe preț pe mp, nu pe preț total. Praguri: sub P10 „foarte jos: află de ce”; P10–P25 „bun”; P25–P75 „corect”; P75–P90 „ridicat”; peste P90 „scump”. Încrederea (separat de verdict): Mică sub 25 de anunțuri sau cu dispersie mare, Medie 25–59, Mare 60 sau mai multe; sub ${N_MIN} anunțuri nu afișăm bară. Imobilele noi și cele existente sunt separate; anunțurile de nou pot include TVA 21% fără s-o spună, de aceea poți marca „TVA în prețul cerut” în fișă. Zilele pe piață și scăderile de preț nu sunt în date încă (avem un instantaneu, nu o serie); ele ar apărea sub bară, nu în culoarea verdictului. Trendul pe semestre pentru Timiș lipsește: cere colectarea periodică a anunțurilor; până atunci folosim indicele național și punctele disparate din istoric. Culoarea nu poartă singură sensul: verdictul e scris.</p></details></div>`;
  }

  /* ---------- randare ---------- */
  const inp = (k, lbl, tip = "number", extra = "") => `<label>${lbl}<input data-k="${k}" type="${tip}" value="${esc(S[k])}" ${extra}></label>`;
  const par = (k, lbl) => `<label>${lbl}<input data-k="${k}" type="number" step="any" value="${esc(S[k])}"></label>`;
  const E = t => `<span class="ev-e">${t}</span>`;

  function randare(refocus) {
    const sec = document.getElementById("evaluare"); if (!sec || !Dd() || !P) return;
    const C = comparabile(), K = cost(), U = cmbu(), serie = H?.indice?.puncte?.map(p => ({ an: +p.an, v: +p.v })) || null;
    const valM = C?.p_med ?? null, R = roi(valM || K?.total || U?.best?.rez, serie);
    window.__EV = { S, C, P, H, R, v: Date.now() };   // pentru pret_piata.js (graficul in stilul carVertical)
    const zone = [...new Set((P.stats?.[S.tip]?.zone || []).map(z => z.zona))];
    const st = P.stats?.[S.tip];
    let h = `<div><h2>Estimare de valoare și randament</h2><p class="lead">Interval de preț estimat din comparabile, cost de înlocuire, cea mai bună utilizare și calcul de randament în timp, pentru ${esc(P.uat)}. Nu e evaluare ANEVAR și nu e concluzie juridică. Raportul nu cunoaște încă datele clădirii: completează fișa de mai jos, rezultatele se recalculează pe loc.</p></div>`;
    h += `<div class="ev-sec"><h3>Fișa proprietății ${E("introduse de tine")}</h3><div class="ev-in">
      <label>Tip<select data-k="tip">${Object.entries(TIPURI).map(([k, v]) => `<option value="${k}" ${S.tip === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
      ${inp("mp", S.tip === "teren" ? "Suprafață teren (mp)" : "Suprafață utilă (mp)")}
      ${S.tip === "teren" || S.tip === "apartament" ? "" : inp("teren", "Teren (mp)")}
      ${S.tip === "teren" ? "" : inp("an", "An construcție")}
      ${inp("camere", "Camere")}
      <label>Zonă<select data-k="zona"><option value="">toată localitatea</option>${zone.map(z => `<option ${S.zona === z ? "selected" : ""}>${esc(z)}</option>`).join("")}</select></label>
      ${inp("cerut", "Preț cerut / de achiziție (€, opțional)")}<label>TVA în prețul cerut<select data-k="tva"><option value="nu" ${S.tva === "nu" ? "selected" : ""}>nu / imobil existent</option><option value="da" ${S.tva === "da" ? "selected" : ""}>da, 21% (imobil nou)</option></select></label>${inp("chirie", "Chirie lunară (€, opțional)")}</div>
      <p class="ev-s">Valorile de pornire sunt un exemplu, nu datele proprietății tale. ${st ? `În ${esc(P.uat)}: ${nf(st.n)} anunțuri de tipul ales, mediană ${nf(st.med)} €/mp (interval 25–75%: ${nf(st.p25)}–${nf(st.p75)}).` : "Nu avem destule anunțuri de acest tip."}</p></div>`;

    /* rezumat */
    const t = [];
    if (C?.p_med) t.push(["Comparabile (piață)", C.p_med, `${eur(C.p25)} – ${eur(C.p75)}`, C.n + " comparabile ajustate"]);
    if (K?.total) t.push(["Cost de înlocuire", K.total, "construcție minus uzură + teren", ""]);
    if (U?.best && S.tip !== "teren") t.push(["Cea mai bună utilizare", U.best.rez, "valoarea reziduală a terenului", U.best.nume]);
    if (S.tip === "teren" && C?.p_med) t.length = 0, t.push(["Comparabile teren", C.p_med, `${eur(C.p25)} – ${eur(C.p75)}`, C.n + " comparabile"]);
    h += `<div class="ev-sec"><h3>Rezultate pe metode</h3>` + (t.length ? `<div class="ev-k">${t.map(([n, v, s, x], i) => `<div class="${i === 0 ? "m" : ""}"><span>${esc(n)}</span><b>${eur(v)}</b><span>${esc(s)}${x ? " · " + esc(x) : ""}</span></div>`).join("")}</div>` : `<p class="ev-p">Nu avem destule date pentru tipul și suprafața alese.</p>`) +
      `<p class="ev-s">Cum se alege: piața (comparabilele) e referința pentru prețul de discuție; costul de înlocuire e un plafon pentru construcții noi și un reper pentru clădiri uzate; cea mai bună utilizare arată dacă terenul valorează mai mult prin altă folosire. Dacă metodele diferă mult, cauza e în datele clădirii, nu în calcul.${S.tip === "apartament" ? " Pentru apartamente în bloc, costul de înlocuire și cea mai bună utilizare nu se aplică: contează comparabilele și chiria." : ""}</p></div>`;

    h += bara(C);
    const G = generice();
    h += `<div class="ev-sec keep"><h3>Date generice de piață în ${esc(P.uat)}</h3><div class="ev-k">${G.teren ? `<div><span>Teren: preț cerut pe mp (${nf(G.teren.n)} anunțuri)</span><b>${nf(G.teren.med)} €/mp</b><span>interval 25–75%: ${nf(G.teren.p25)}–${nf(G.teren.p75)} €/mp</span></div>` : ""}` +
      G.cheie.map(c => `<div><span>${TIPURI[c.tip]} la cheie, nou (din 2021)</span><b>${c.nou ? nf(c.nou.med) + " €/mp" : "—"}</b><span>${c.nou ? `${nf(c.nou.n)} anunțuri; interval ${nf(c.nou.p25)}–${nf(c.nou.p75)} €/mp` : "prea puține anunțuri noi"} · toate: ${nf(c.med)} €/mp</span></div>`).join("") + `</div>
      <p class="ev-s">Terenul include și loturi mari, cu preț pe mp mai mic. „La cheie” = imobil finalizat; costul de a-l construi singur e 450–800 €/mp (surse în Estimare, ipoteză E), fără teren. Prețuri cerute, nu de tranzacție.${G.teren?.zone?.length ? " Teren pe zone: " + G.teren.zone.slice(0, 5).map(z => `${esc(z.zona)} ${nf(z.med)} €/mp`).join(", ") + "." : ""}</p></div>`;
    /* comparabile */
    if (C?.rows) {
      h += `<div class="ev-sec"><h3>1. Comparabile cu ajustări</h3><p class="ev-p">Primele ${C.rows.length} anunțuri cele mai apropiate de fișa ta (mărime, zonă, vechime, teren), cu preț ajustat. Reducere de negociere aplicată: ${S.neg}% ${E("E")}.</p>
        <div class="ev-w"><table class="sr-t"><thead><tr><th title="bifat = inclus în calcul">✓</th><th class="l">Zonă</th><th>mp</th><th>An</th><th>Teren</th><th>Preț cerut</th><th>€/mp</th><th>Ajust. mărime</th><th>Ajust. an</th><th>Ajust. teren</th><th>Preț ajustat</th></tr></thead><tbody>` +
        C.rows.map(r => `<tr><td><input type="checkbox" checked data-ex="${esc(ck(r.c))}" aria-label="inclus în calcul"></td><td class="l">${r.c.url ? `<a href="${esc(r.c.url)}" target="_blank" rel="noopener">${esc(r.c.zona)}</a>` : esc(r.c.zona)}</td><td>${nf(r.c.mp)}</td><td>${r.c.an || "—"}</td><td>${r.c.teren ? nf(r.c.teren) : "—"}</td><td>${eur0(r.c.p)}</td><td>${nf(r.c.e)}</td><td>${pct(r.aj.dim)}</td><td>${r.aj.an ? pct(r.aj.an) : "—"}</td><td>${r.aj.teren ? pct(r.aj.teren) : "—"}</td><td><b>${eur(r.p_adj)}</b></td></tr>`).join("") +
        `</tbody></table></div>${(S.excl || []).length ? `<details><summary>${S.excl.length} comparabile excluse de tine (bifează ca să le readuci)</summary>${(P.comps[S.tip] || []).filter(c => S.excl.includes(ck(c))).map(c => `<p class="ev-s"><label><input type="checkbox" data-in="${esc(ck(c))}"> ${esc(c.zona)} · ${nf(c.mp)} mp · ${eur0(c.p)} · ${nf(c.e)} €/mp</label></p>`).join("")}</details>` : ""}<p class="ev-s">Debifează un anunț care nu seamănă cu proprietatea (alt standard, alt teren): calculul și bara se refac fără el, iar în locul lui intră următorul cel mai apropiat. Elasticitatea €/mp față de mărime, calculată din ${nf(P.comps[S.tip].length)} anunțuri: ${nf(C.b, 2)} ${E("D")}. Ajustare de vechime: ${C.g == null ? "nu avem destule anunțuri cu an" : pct(C.g, 2) + " pe an de construcție " + "(din anunțuri)"} ${E(C.g == null ? "—" : "D")}. ${C.hasLand ? `Teren suplimentar: ${S.teren_adaos}% din ${nf(C.lE)} €/mp ${E("E")}.` : ""} Mediană ajustată: ${eur(C.p_med)}; intervalul 25–75%: ${eur(C.p25)} – ${eur(C.p75)}.</p></div>`;
    } else h += `<div class="ev-sec"><h3>1. Comparabile cu ajustări</h3><p class="ev-p">Prea puține anunțuri comparabile (${C?.n ?? 0}) pentru tipul și suprafața alese.</p></div>`;

    /* cost de înlocuire */
    if (K) h += `<div class="ev-sec"><h3>2. Cost de înlocuire</h3><div class="ev-k"><div><span>Cost nou (${nf(S.cost_constr)} €/mp + ${S.indirecte}% costuri indirecte)</span><b>${eur(K.nou)}</b></div>
      <div><span>Uzură fizică (${K.age == null ? "—" : K.age + " ani din " + S.durata})</span><b>${pct(K.dep, 0)}</b></div><div><span>Construcție după uzură</span><b>${eur(K.cl)}</b></div>
      <div><span>Teren (${S.teren ? nf(S.teren) + " mp × " + nf(K.lE) + " €/mp" : "fără suprafață"})</span><b>${eur(K.teren)}</b></div><div class="m"><span>Total cost de înlocuire</span><b>${eur(K.total)}</b></div></div>
      <p class="ev-s">Uzura e liniară și limitată la 70% ${E("E")}; nu include uzura funcțională sau de localizare. Costul de construcție e o ipoteză editabilă: ${H?.cost_constructie ? esc(H.cost_constructie.nota || "") : "fără sursă încă; pune devizul tău"}.</p></div>`;

    /* cea mai bună utilizare */
    if (U) { const flags = [];
      const DD = Dd(), A = DD.arii_protejate, F = DD.inundatii, M = DD.monumente, urb = DD.urbanism?.pug;
      flags.push(["Permis legal", urb?.gasit ? "ma" : "ma", urb?.gasit ? `PUG ${urb.an}; verifică în certificatul de urbanism POT, CUT și regimul de înălțime ale parcelei` : "PUG necunoscut: obține certificatul de urbanism"]);
      flags.push(["Restricții de mediu și patrimoniu", (A?.in_arie?.length || M?.zona_protectie) ? "no" : "ok", (A?.in_arie?.length || M?.zona_protectie) ? "arie protejată sau zonă de protecție: avize în plus" : "nicio arie protejată și nicio zonă de protecție în punct"]);
      const fl = F?.hazard?.hz100?.dist_m === 0 || typeof F?.ciclu2_punct?.scenarii?.F?.["100"]?.adancime_m === "number";
      flags.push(["Fizic posibil: inundații", fl ? "no" : "ok", fl ? "punctul e în zonă inundabilă (vezi capitolul Inundații)" : "punctul nu e în zonă inundabilă de 100 de ani"]);
      flags.push(["Fizic posibil: teren", (DD.alunecari?.panta_max_pct ?? 0) > 15 ? "ma" : "ok", `pantă maximă ${nf(DD.alunecari?.panta_max_pct, 1)}%`]);
      h += `<div class="ev-sec"><h3>3. Cea mai bună utilizare</h3><p class="ev-p">Patru teste: permis legal, posibil fizic, fezabil financiar, maxim productiv. Primele două vin din celelalte capitole ale raportului; ultimele două sunt calculul de mai jos (valoarea reziduală a terenului: valoare finală minus construcție minus profit de ${S.marja_dev}% ${E("E")}).</p>
        <ul class="ev-p" style="margin:0;padding-left:18px">${flags.map(([n, c, x]) => `<li><b class="ev-${c}">${esc(n)}:</b> ${esc(x)}</li>`).join("")}</ul>` +
        (U.opt.length ? `<div class="ev-w"><table class="sr-t"><thead><tr><th class="l">Variantă</th><th>Unități</th><th>mp construiți</th><th>€/mp nou</th><th>Valoare finală</th><th>Cost construcție</th><th>Profit</th><th>Valoare teren (reziduală)</th><th>€/mp teren</th><th>față de piața terenului</th></tr></thead><tbody>` +
          U.opt.map(o => `<tr><td class="l">${o === U.best ? "<b>" : ""}${esc(o.nume)}${o === U.best ? " ← maxim</b>" : ""}</td><td>${o.nu}</td><td>${nf(o.mp_tot)}${o.limitat ? "*" : ""}</td><td>${nf(o.e)}</td><td>${eur(o.gdv)}</td><td>${eur(o.c)}</td><td>${eur(o.prof)}</td><td>${eur(o.rez)}</td><td>${nf(o.rez_mp)}</td><td>${o.vs_teren == null ? "—" : nf(o.vs_teren, 2) + "×"}</td></tr>`).join("") + `</tbody></table></div>
          <p class="ev-s">Piața terenului în zonă: ${nf(U.lE)} €/mp. O valoare reziduală peste piața terenului înseamnă că dezvoltarea e fezabilă financiar. * = limitat de POT ${S.pot}% și ${S.nivele} niveluri ${E("E")}${S.src_limite ? `; limite din regulament/lege: ${esc(S.src_limite)} ${E("V")}` : "; nicio limită oficială găsită, valori orientative"}. Prețurile €/mp nou vin din anunțurile de construcții din 2021 încoace, unde sunt.</p>` : `<p class="ev-p">Nu avem destule anunțuri noi pentru variantele de dezvoltare.</p>`) + `</div>`; }

    /* ROI */
    if (R) h += `<div class="ev-sec"><h3>4. ROI, randament și apreciere în timp</h3><div class="ev-k">
      <div><span>Preț de pornire ${S.cerut ? "(cerut)" : "(estimat)"}</span><b>${eur(R.P0)}</b></div>
      <div><span>Chirie lunară ${S.chirie ? "" : "(" + (R.chirie ? "din piață" : "lipsă") + ")"}</span><b>${R.chirie ? eur0(R.chirie) : "—"}</b></div>
      <div><span>Randament brut</span><b>${pct(R.brut1)}</b></div><div><span>Randament net inițial</span><b>${pct(R.net1)}</b></div>
      <div><span>Chirie lunară la care randamentul brut ajunge la 5%</span><b>${eur0(R.P0 * 0.05 / 12)}</b></div><div><span>Chirie lunară la care randamentul net ajunge la 5%</span><b>${eur0((0.05 + (S.mentenanta + S.impozit_cl + S.asig) / 100) * R.P0 / (12 * (1 - S.vacanta / 100) * (1 - S.imp_chirie / 100)))}</b></div></div>
      ${R.chirie ? "" : `<p class="ev-p ev-ma">Nu avem chirii pentru ${esc(P.uat)} în datele noastre: scrie chiria în fișă ca să vezi randamentul. Fără chirie, rezultatul de mai jos e doar aprecierea.</p>`}
      <div class="ev-w"><table class="sr-t"><thead><tr><th class="l">Scenariu apreciere</th><th>pe an</th><th>Valoare după ${R.n} ani</th><th>Chirii nete cumulate</th><th>Câștig total</th><th>ROI total</th><th>IRR pe an</th></tr></thead><tbody>${R.rows.map(r => `<tr><td class="l">${esc(r.nume)}</td><td>${pct(r.g)}</td><td>${eur(r.Vn)}</td><td>${eur(r.cum)}</td><td>${eur(r.total)}</td><td>${pct(r.roi, 0)}</td><td>${pct(r.irr)}</td></tr>`).join("")}</tbody></table></div>
      ${R.rows.length > 1 ? linii(R.rows.map((r, i) => ({ n: r.nume, c: ["#8a8f9c", "#b86e00", "#1f8a4c"][i], p: [[0, R.P0], ...Array.from({ length: R.n }, (_, y) => [y + 1, R.P0 * Math.pow(1 + r.g, y + 1)])] })), 680, 220, v => nf(v / 1000) + "k") : ""}
      <p class="ev-s">Aprecierea vine din seria istorică de mai jos: ${R.g5 != null ? "5 ani " + pct(R.g5) + " pe an" : "5 ani: lipsă"}, ${R.g10 != null ? "10 ani " + pct(R.g10) + " pe an" : "10 ani: lipsă"}, ${R.g19 != null ? "lung (" + R.nL + " ani, apartamente Timișoara, estimare) " + pct(R.g19) + " pe an" : "lung: lipsă"}. Cele 5 și 10 ani vin din indicele național Eurostat (locuințe, valoare verificată); cel lung din puncte disparate pentru Timișoara. Prudent = jumătate din cea mai mică; bază = mediana; optimist = cea mai mare. Chiria de pornire: ${R.chirie && !S.chirie ? "mediana Storia iunie 2026 pentru apartamente cu 1–3 camere în Timișoara" : S.chirie ? "cea introdusă de tine" : "lipsește"}; impozit efectiv pe chirii ${S.imp_chirie}% (Codul fiscal art. 64 și 84), plus CASS peste prag, care nu e inclus. Trecutul nu garantează viitorul. Costuri de achiziție ${nf(costAch().total, 2)}% (notar ${nf(costAch().notar, 2)}% + OCPI ${nf(costAch().ocpi, 2)}%${costAch().credit ? " + credit " + nf(costAch().credit, 2) + "%" : ""}; ${costAch().din ? "din capitolul Costuri" : "ipoteză"} ${costAch().din ? E("D") : E("E")}; impozitul pe transfer de 1% îl reține notarul din partea vânzătorului) și de vânzare ${S.cost_vanzare}% ${E("E")}; vezi capitolul Costuri pentru calculul exact.</p></div>`;

    /* istoric */
    if (serie && serie.length > 2) {
      const base = valM || R?.P0 || 0, last = serie[serie.length - 1];
      h += `<div class="ev-sec"><h3>5. Istoricul valorii în ultimii ani</h3><p class="ev-p">${esc(H.indice.titlu)} (${esc(H.indice.sursa)}). Valoarea proprietății în trecut e reconstituită din indice: valoare azi × indice(an) / indice(azi). E o estimare ${E("D")}, nu un istoric de tranzacții: prețurile reale la care s-a vândut imobilul se văd în extrasul de CF și în actele notariale.</p>` +
        linii([{ n: "Indice (bază 100 = " + serie[0].an + ")", c: "#2c5c9c", p: serie.map(x => [x.an, x.v / serie[0].v * 100]) }], 680, 220, v => nf(v)) +
        (base ? `<div class="ev-w"><table class="sr-t"><thead><tr><th class="l">An</th>${serie.map(x => `<th>${x.an}</th>`).join("")}</tr></thead><tbody><tr><td class="l">Indice</td>${serie.map(x => `<td>${nf(x.v, 0)}</td>`).join("")}</tr><tr><td class="l">Valoare reconstituită</td>${serie.map(x => `<td>${nf(Math.round(base * x.v / last.v / 1000))}k</td>`).join("")}</tr></tbody></table></div>` : "") +
        (H.serie_tm ? `<div class="ev-w"><table class="sr-t"><thead><tr><th class="l">${esc(H.serie_tm.titlu)}</th>${H.serie_tm.puncte.map(x => `<th>${x.an}</th>`).join("")}</tr></thead><tbody><tr><td class="l">€/mp ${E(H.serie_tm.eticheta)}</td>${H.serie_tm.puncte.map(x => `<td>${nf(x.v)}${x.e === "D" ? "*" : ""}</td>`).join("")}</tr></tbody></table></div><p class="ev-s">${esc(H.serie_tm.nota)} * = dedus, nu măsurat.</p>` : "") + `<p class="ev-s">Sursă: ${esc(H.indice.sursa)}${H.indice.url ? `, <a href="${esc(H.indice.url)}" target="_blank" rel="noopener">${esc(H.indice.url)}</a>` : ""}. ${esc(H.indice.nota || "")}</p></div>`;
    } else h += `<div class="ev-sec"><h3>5. Istoricul valorii în ultimii ani</h3><p class="ev-p">Seria istorică de prețuri nu e încă încărcată; fără ea nu putem calcula aprecierea pe 5, 10 și 19 ani.</p></div>`;

    /* randamente pe tipuri */
    const tipuri = ["teren", "apartament", "casa", "duplex"].filter(k => P.stats?.[k]);
    h += `<div class="ev-sec"><h3>6. Randamente pe tipuri de imobile în ${esc(P.uat)}</h3><div class="ev-w"><table class="sr-t"><thead><tr><th class="l">Tip</th><th>Anunțuri</th><th>Preț mediu cerut</th><th>€/mp (mediană)</th><th>Chirie lunară tipică</th><th>Randament brut</th><th>Apreciere 5 ani</th><th>Apreciere 10 ani</th></tr></thead><tbody>` +
      tipuri.map(k => { const s = P.stats[k], ca = k === "apartament" ? H?.chirie_apt_lunara : null, rb = k === "apartament" ? H?.randament_brut?.apartament ?? null : null, loc = k !== "teren";
        return `<tr><td class="l">${TIPURI[k]}</td><td>${nf(s.n)}</td><td>${eur(s.pret_med)}</td><td>${nf(s.med)}</td><td>${ca ? "300–500 €/lună (1–3 cam.)" : k === "teren" ? "fără chirie" : "lipsă"}</td><td>${k === "teren" ? "0%" : rb != null ? pct(rb) : "lipsă"}</td><td>${loc && cagr(serie, 5) != null ? pct(cagr(serie, 5)) : "lipsă"}</td><td>${loc && cagr(serie, 10) != null ? pct(cagr(serie, 10)) : "lipsă"}</td></tr>`; }).join("") +
      `</tbody></table></div><p class="ev-s">Prețurile sunt cerute (anunțuri, ${esc(P.data)}). Chiriile și randamentul brut pentru apartamente vin din Storia și Imo360 (Timișoara, 2026); pentru case și duplexuri nu am găsit chirii cu sursă în zona periurbană; „lipsă” înseamnă că nu avem date, nu zero. Terenul nu dă chirie, doar apreciere. Apreciere: o singură serie, indicele național al prețurilor locuințelor, aplicat tuturor tipurilor de locuințe; pentru teren nu avem serie istorică.</p></div>`;

    /* surse și limite */
    h += `<div class="ev-sec"><h3>Surse și limite</h3><ul class="ev-p" style="margin:0;padding-left:18px">
      <li><b>Comparabile:</b> ${esc(P.sursa)}. Un anunț nu e o vânzare: diferența dintre preț cerut și preț plătit se vede doar în acte. ${E("D")}</li>
      <li><b>Serii istorice, chirii, costuri:</b> ${H ? esc(H.sursa_generala || "vezi tabelul de surse din fila Surse") : "încă neîncărcate"}.</li>
      <li><b>Evaluare:</b> „evaluare” e termen rezervat evaluatorilor autorizați ANEVAR (OG 24/2011). Aici: interval de preț estimat din comparabile, pentru discuție. Pentru bancă sau instanță, cere raport de evaluare.</li>
      <li><b>Ce nu știm:</b> starea reală a clădirii, finisajele, utilitățile din incintă, sarcinile din CF, chiriile efective. Fiecare mută valoarea.</li></ul>
      <details><summary>Ipoteze editabile (E)</summary><div class="ev-par">${[par("neg", "Reducere negociere, %"), par("teren_adaos", "Teren suplimentar, % din €/mp"), par("cost_constr", "Cost construcție, €/mp"), par("indirecte", "Costuri indirecte, %"), par("durata", "Durata de viață, ani"), par("marja_dev", "Profit dezvoltator, %"), par("pot", "POT, %"), par("nivele", "Niveluri"), par("vacanta", "Vacanță chirie, %"), par("mentenanta", "Mentenanță, % valoare/an"), par("impozit_cl", "Impozit clădire, % valoare/an"), par("asig", "Asigurare, % valoare/an"), par("imp_chirie", "Impozit efectiv pe chirii, %"), par("ltv", "Credit, % din preț"), par("credit_cost", "Costuri credit, % din credit"), par("cost_vanzare", "Cost vânzare, %"), par("orizont", "Orizont, ani")].join("")}</div></details></div>`;
    window.RIC_EV_PRET = { cerut: +S.cerut || null, estimare: valM ? Math.round(valM) : null, trepta: window.__EV_BARA?.prim?.trepta ?? null, inc: window.__EV_BARA?.prim?.inc?.nivel ?? null, pctl: window.__EV_BARA?.pctl ?? null, mediana_mp: window.__EV_BARA?.prim?.med ?? null, cerut_mp: window.__EV_BARA?.cerutMp ?? null };
    sec.innerHTML = h;
    sec.querySelectorAll("[data-ex]").forEach(el => { el.onchange = () => { S.excl = [...(S.excl || []), el.dataset.ex]; salveaza(); randare(); }; });
    sec.querySelectorAll("[data-in]").forEach(el => { el.onchange = () => { S.excl = (S.excl || []).filter(k => k !== el.dataset.in); salveaza(); randare(); }; });
    sec.querySelectorAll("[data-k]").forEach(el => { el.onchange = () => { const k = el.dataset.k; S[k] = el.type === "number" ? (el.value === "" ? "" : +el.value) : el.value; if (k === "tip") { S.zona = ""; if (S.tip === "teren") S.mp = Math.max(S.mp, 500); } salveaza(); randare(); }; });
  }

  async function incarcaDate() {
    P = null; last = Dd().id;
    try { const r = await fetch(`p/${Dd().id}/piata.json`); if (r.ok) P = await r.json(); } catch (e) {}
    if (H === null) { try { const r = await fetch("piata_istoric.json"); H = r.ok ? await r.json() : {}; } catch (e) { H = {}; } }
    incarca();
    const sec = document.getElementById("evaluare"); if (!sec) return;
    if (!P) { sec.innerHTML = `<div><h2>Estimare de valoare și randament</h2><p class="lead">Nu avem încă anunțuri colectate pentru această localitate.</p></div>`; return; }
    randare();
  }

  function montaj() {
    const grup = [...document.querySelectorAll("nav .ng")].find(g => g.querySelector('[data-t="negociere"]')) || [...document.querySelectorAll("nav .ng")].find(g => g.querySelector('[data-t="surse"]'));
    if (grup && !document.querySelector('nav [data-t="evaluare"]')) {
      const b = document.createElement("button"); b.setAttribute("role", "tab"); b.dataset.t = "evaluare"; b.textContent = "Estimare valoare";
      b.onclick = () => window.showTab("evaluare");
      if (grup.querySelector('[data-t="negociere"]')) grup.insertBefore(b, grup.querySelector('[data-t="negociere"]')); else grup.appendChild(b);
    }
    if (!document.getElementById("evaluare")) { const s = document.createElement("section"); s.id = "evaluare"; s.hidden = true; document.querySelector(".wrap").appendChild(s); }
    try { EL.evaluare = "evaluare"; EL_INV.evaluare = "evaluare"; } catch (e) {}
  }

  let h0Tried = false;
  function deepLink(k) {   // linkul #<id>.<k> poate fi citit de index.html înainte să existe fila; îl reluăm când proprietatea e încărcată
    const h = (window.__H0 || "").replace(/^#/, ""); if (h0Tried || !h.endsWith("." + k) || typeof D === "undefined" || !D) return; h0Tried = true;
    const id = h.slice(0, -(k.length + 1)); if (id !== D.id) location.hash = "#" + h; else if (typeof curTab !== "undefined" && curTab !== k) window.showTab(k);
  }
  function porneste() {
    css(); montaj();
    setInterval(() => { try { montaj(); deepLink('evaluare'); if (Dd() && Dd().id !== last) { last = Dd().id; incarcaDate(); } } catch (e) { console.warn("evaluare", e); } }, 900);
  }
  window.RIC_EV = { comparabile, cost, cmbu, roi };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", porneste); else porneste();
})();
