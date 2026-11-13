/* v82.22.0 (13.11.2026, cerut de Manu): „harta trebuie să aibă și cadastralul în fundal, parcelele cu informații peste; aprinsă = are AC/CU/PUZ; bulină = firmă; bulină roșie = anunț de vânzare;
   investiții recente/prezente/viitoare; cronologie la cerere în fereastră; limită 350 m.” Date: dom_parcele.json › v2 (fundal ≤350 m, acte pe parcelă, firme, anunțuri, investiții); atingere = fereastră cu datele, „Cronologie” = acte pe ani, valabile/expirate (regula din harta mare).
   Raport · Cartea Casei — harta DOM (v82.18.0, 13.11.2026, cerut de Manu):
   „pt DOM - as vrea sa avem in partea de sus a ecranului o harta satelit cu cadastral - si cu fiecare parcela despre care avem date usor colorata luminata.
    iar pe partea de jos sa avem scrool al liniilor - si pe fiecare linie dam cu degetul, ca si un click (nu la scrool simplu) - as vrea sa se aprinda pe harta
    cf-ul la care avem referinta in zona - sau chiar si adresa. iar daca adresa e in afara ariei - sa se poata sa fuga fereastra inspre acea parcela.”
   Date: p/<id>/dom_parcele.json (nc = contururi, adrese = puncte, randuri[sec][i] = parcelele rândului, bbox, incredere A/B/C), privat (nivel 2, pentru card: marcat și numărat).
   Fundal: Sentinel-2 cloudless 2022 (EOX, CC BY 4.0), plăci încărcate live, fără stocare offline; CC_DOM_TILE poate fi schimbat (ex. ortofoto ANCPI). Canvas 2D, fără bibliotecă.
   Sus: harta (lipită sub antet cât derulezi lista); jos: lista DOM. O atingere SCURTĂ pe un rând (< 300 ms, < 8 px) aprinde parcela; derularea nu aprinde nimic. */
(function () {
  "use strict";
  if (window.parent !== window) return;
  const $ = (s, r) => (r || document).querySelector(s);
  /* fundal: (1) ortofoto ANCPI: nu răspunde din browser (eterra = „acces restricționat”, geoportal fără răspuns, verificat 13.11.2026); (2) Esri World Imagery, plăci vizualizate live (fără descărcare, fără stocare, fără cache în service worker);
     (3) Sentinel-2 cloudless (EOX, CC BY 4.0) doar ca rezervă la zoom mic, când placa Esri lipsește. CC_DOM_TILE poate înlocui primarul. */
  const TILE = window.CC_DOM_TILE || "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const TILE2 = "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2022_3857/default/g/{z}/{y}/{x}.jpg";
  const ZMAX = 19, ZTILE = 18;   // la z19 Esri trimite o placă „Map data not yet available” (200 OK, aceeași în G7 și Bucovăț): plăcile se cer până la z18, peste el se mărește placa z18
  const ATRIB = "Esri, Maxar, Earthstar Geographics (imagini live) · Sentinel-2 cloudless 2022 © EOX / Copernicus (rezervă) · contururi: baza de date proprie";
  const wx = lon => (lon + 180) / 360, wy = lat => { const r = lat * Math.PI / 180; return (1 - Math.asinh(Math.tan(r)) / Math.PI) / 2; };
  const dom = () => typeof D !== "undefined" && D && D.id ? D : null;
  let P = null, Pid = null, Pload = null, M = null;

  function css() {
    if ($("#dhm-css")) return;
    const s = document.createElement("style"); s.id = "dhm-css";
    s.textContent = `.dhm{position:sticky;top:56px;z-index:6;height:min(45vh,420px);min-height:220px;margin:0 0 10px;border-radius:12px;overflow:hidden;background:#1c2230;box-shadow:0 2px 10px rgba(0,0,0,.25)}
.dhm canvas{display:block;width:100%;height:100%;touch-action:none;cursor:grab}
.dhm .dhm-back{position:absolute;right:8px;top:8px;min-height:40px;padding:0 12px;border-radius:20px;border:0;background:rgba(255,255,255,.95);color:#1a1e2a;font:700 13px var(--font,system-ui);box-shadow:0 1px 6px rgba(0,0,0,.3);cursor:pointer}
.dhm .dhm-atr{position:absolute;left:6px;bottom:4px;right:60px;font:10px/1.2 system-ui;color:#fff;text-shadow:0 0 3px #000;pointer-events:none}
.dhm .dhm-msg{position:absolute;left:50%;top:10px;transform:translateX(-50%);max-width:80%;background:rgba(26,30,42,.92);color:#fff;font:600 12px system-ui;padding:6px 10px;border-radius:12px;pointer-events:none;opacity:0;transition:opacity .2s}
.dhm .dhm-msg.on{opacity:1}
.dhm .dhm-leg{position:absolute;left:8px;top:8px;max-width:200px;background:rgba(255,255,255,.96);color:#1a1e2a;border-radius:10px;font:12px/1.35 system-ui;box-shadow:0 1px 6px rgba(0,0,0,.3)}
.dhm .dhm-leg summary{cursor:pointer;padding:7px 10px;font-weight:700;min-height:20px;list-style:none}
.dhm .dhm-leg summary::-webkit-details-marker{display:none}
.dhm .dhm-leg div{padding:0 10px 8px;display:flex;align-items:center;gap:7px;margin-top:3px}
.dhm .dhm-leg i{display:inline-block;flex:none;width:14px;height:14px;border-radius:3px;box-sizing:border-box}
.dhm .dhm-fis{position:absolute;left:8px;right:8px;bottom:22px;max-height:62%;overflow:auto;background:#fff;color:#1a1e2a;border-radius:12px;padding:10px 12px 12px;font:13px/1.4 system-ui;box-shadow:0 2px 14px rgba(0,0,0,.4);z-index:3}
.dhm .dhm-fis h4{margin:0 26px 4px 0;font:700 14px system-ui}
.dhm .dhm-fis .x{position:absolute;right:6px;top:4px;width:36px;height:36px;border:0;background:none;font-size:22px;cursor:pointer;color:#1a1e2a}
.dhm .dhm-fis .s{color:#4a5160;font-size:12px}
.dhm .dhm-fis ul{margin:4px 0 6px;padding-left:16px}
.dhm .dhm-fis .ok{color:#17693a;font-weight:700}.dhm .dhm-fis .ex{color:#7a3b2e;font-weight:700}
.dhm .dhm-fis button.cr{margin-top:6px;min-height:40px;padding:0 16px;border-radius:20px;border:0;background:#1f4fd8;color:#fff;font:700 13px system-ui;cursor:pointer}
.dhm-cr{position:fixed;inset:0;z-index:1000;background:rgba(15,18,28,.55);display:flex;align-items:flex-end;justify-content:center}
.dhm-cr .w{background:#fff;color:#1a1e2a;width:min(760px,100%);max-height:92vh;overflow:auto;border-radius:16px 16px 0 0;padding:14px 14px 22px;font:14px/1.4 system-ui}
.dhm-cr h3{margin:0 40px 2px 0;font:700 17px system-ui}.dhm-cr .x{position:sticky;float:right;top:0;width:40px;height:40px;border:0;background:#eef0f4;border-radius:20px;font-size:22px;cursor:pointer;color:#1a1e2a}
.dhm-cr .f{display:flex;gap:6px;margin:10px 0}.dhm-cr .f button{min-height:38px;padding:0 12px;border-radius:19px;border:1px solid #c5cad6;background:#fff;color:#1a1e2a;font:600 13px system-ui;cursor:pointer}.dhm-cr .f button.on{background:#1a1e2a;color:#fff;border-color:#1a1e2a}
.dhm-cr h5{margin:14px 0 4px;font:700 13px system-ui;color:#4a5160;border-bottom:1px solid #e1e4ec}
.dhm-cr .r{padding:7px 0;border-bottom:1px solid #eef0f4}.dhm-cr .r b.t{display:inline-block;min-width:34px;text-align:center;border-radius:6px;padding:1px 6px;color:#fff;font-size:12px;margin-right:6px}
.dhm-cr .tr{position:relative;height:8px;background:#eef0f4;border-radius:4px;margin:5px 0 2px}.dhm-cr .tr i{position:absolute;top:0;bottom:0;border-radius:4px}.dhm-cr .tr u{position:absolute;top:-3px;bottom:-3px;width:2px;background:#d92d20}
.dhm-cr .ok{color:#17693a;font-weight:700}.dhm-cr .ex{color:#7a3b2e;font-weight:700}.dhm-cr .n{font-size:12px;color:#4a5160;margin-top:12px}
#date_fine_aproape tr[data-i]{cursor:pointer;-webkit-tap-highlight-color:rgba(255,160,0,.25)}
#date_fine_aproape tr.dfa-on{background:#fff3d6}
#date_fine_aproape tr.dfa-np td:first-child::after,#date_fine_aproape tr:not([data-i]) td:first-child::after{content:" !";color:#a37b00;font-weight:700;font-size:11px}`;
    document.head.appendChild(s);
  }

  /* ---------- date ---------- */
  function pregateste(J) {   // contururi în coordonate mondiale [0..1], bbox și centroid pe parcelă
    const g = {};
    for (const id of Object.keys(J.nc || {})) {
      const o = J.nc[id], ge = o && o.geom; if (!ge) continue;
      const polys = ge.type === "Polygon" ? [ge.coordinates] : ge.type === "MultiPolygon" ? ge.coordinates : [];
      const rings = []; let x0 = 9, y0 = 9, x1 = -9, y1 = -9;
      for (const pg of polys) for (const ring of pg) { const r = ring.map(c => [wx(c[0]), wy(c[1])]); rings.push(r); for (const q of r) { if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; } }
      if (rings.length) g[id] = { rings, b: [x0, y0, x1, y1], c: [(x0 + x1) / 2, (y0 + y1) / 2], inc: o.incredere || "A" };
    }
    const pt = {};
    for (const k of Object.keys(J.adrese || {})) { const v = J.adrese[k]; if (Array.isArray(v)) pt[k.replace(/^nc:/, "")] = [wx(v[0]), wy(v[1])]; }
    return { g, pt, randuri: J.randuri || {}, bbox: J.bbox, v2: pregateste2(J.v2) };
  }
  /* v82.22.0: cadastru de fundal (≤ 350 m), acte pe parcelă, firme, anunțuri, investiții — toate cu distanța la teren; harta le taie la raza aleasă */
  function inel(ge) {
    const polys = ge.type === "Polygon" ? [ge.coordinates] : ge.type === "MultiPolygon" ? ge.coordinates : [], rings = []; let x0 = 9, y0 = 9, x1 = -9, y1 = -9;
    for (const pg of polys) for (const ring of pg) { const r = ring.map(c => [wx(c[0]), wy(c[1])]); rings.push(r); for (const q of r) { if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; } }
    return rings.length ? { rings, b: [x0, y0, x1, y1], c: [(x0 + x1) / 2, (y0 + y1) / 2] } : null;
  }
  function pregateste2(V) {
    if (!V || !V.fundal) return null;
    const f = {}; for (const k of Object.keys(V.fundal)) { const o = inel(V.fundal[k]); if (o) { o.dm = (V.dm || {})[k]; o.acte = (V.acte || {})[k] || []; o.puz = (V.puz || {})[k] || []; o.firme = []; o.anunturi = []; o.inv = []; f[k] = o; } }
    const pun = a => ({ ...a, w: [wx(a.p[0]), wy(a.p[1])] });
    const firme = (V.firme || []).map(pun), anunturi = (V.anunturi || []).map(pun);
    for (const x of firme) if (x.nc && f[x.nc]) f[x.nc].firme.push(x);
    for (const x of anunturi) if (x.nc && f[x.nc]) f[x.nc].anunturi.push(x);
    const investitii = (V.investitii || []).map(x => { const g = x.g, w = g.type === "Point" ? [wx(g.coordinates[0]), wy(g.coordinates[1])] : null, lns = g.type === "LineString" ? [g.coordinates] : g.type === "MultiLineString" ? g.coordinates : null, ln = lns ? lns.map(l => l.map(c => [wx(c[0]), wy(c[1])])) : null; return { ...x, w, ln }; });
    return { f, firme, anunturi, investitii, centru: V.centru, raza: V.raza_max_m || 350, r0: V.r0 || 0, reguli: V.reguli, data: V.data, stat: V.stat };
  }
  const RAZA = () => Math.max(0, Math.min(350, window.__dfaRaza == null ? 119 : Number(window.__dfaRaza)));   // aceeași rază ca în liste (cursor 0–350 m)
  const mW = lat => 40075016.686 * Math.cos(lat * Math.PI / 180);   // metri pe unitatea de lume
  const inPoly = (rings, x, y) => { let c = false; for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const a = r[i], b = r[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  const esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const dmy = s => { const p = String(s || "").slice(0, 10).split("-"); return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : String(s || ""); };
  const ESTE_ACT = a => a.t === "AC" || a.t === "CU";
  async function incarca() {
    const d = dom(); if (!d) return null;
    if (Pid === d.id && P) return P;
    if (Pload && Pload.id === d.id) return Pload.p;
    const id = d.id, p = (async () => { try { const r = await fetch(`p/${encodeURIComponent(id)}/dom_parcele.json`, { cache: "no-store" }); if (!r.ok) return null; P = pregateste(await r.json()); Pid = id; return P; } catch (e) { return null; } })();
    Pload = { id, p }; return p;
  }


  /* ---------- desen v2: fundal cadastral, parcele aprinse, buline, investiții; totul tăiat la cercul razei ---------- */
  const COL_INV = { recent: "#6b7280", prezent: "#7c3aed", viitor: "#2563eb" };
  function cerc(S) { const d = dom(), V = P.v2, R = RAZA(), re = R + (V.r0 || 0), tp = S.toScr(wx(d.lon), wy(d.lat)); return { R, re, tp, rp: Math.max(re / mW(d.lat) * S.scale(), 2) }; }
  const vizib = (o, v) => !(o.b[2] < v[0] || o.b[0] > v[2] || o.b[3] < v[1] || o.b[1] > v[3]);
  const lit = f => f.acte.length > 0 || f.puz.length > 0;
  function drawV2(S, c, trasa, v) {
    const V = P.v2, K = cerc(S);
    c.save(); c.beginPath(); c.rect(0, 0, S.W, S.H); c.arc(K.tp[0], K.tp[1], K.rp, 0, 7); c.fillStyle = "rgba(18,22,32,.66)"; c.fill("evenodd"); c.restore();   // în afara razei: satelitul se întunecă, fără date
    c.save(); c.beginPath(); c.arc(K.tp[0], K.tp[1], K.rp, 0, 7); c.clip();
    const keys = Object.keys(V.f).filter(k => { const f = V.f[k]; return (f.dm == null || f.dm <= K.R) && vizib(f, v); });
    c.beginPath(); for (const k of keys) for (const r of V.f[k].rings) trasa(r); c.strokeStyle = "rgba(255,255,255,.6)"; c.lineWidth = .7; c.stroke();   // cadastrul din fundal: linii subțiri
    c.beginPath(); let any = false; for (const k of keys) if (lit(V.f[k])) { any = true; for (const r of V.f[k].rings) trasa(r); }
    if (any) { c.fillStyle = "rgba(255,205,60,.40)"; c.fill(); c.strokeStyle = "rgba(255,214,90,.95)"; c.lineWidth = 1.3; c.stroke(); }   // parcelă aprinsă = are AC, CU sau PUZ
    const z = S.z;   // investiții: linie sau punct aproximativ
    for (const x of V.investitii) {
      if (x.dm != null && x.dm > K.R) continue; const col = COL_INV[x.grup] || "#2563eb";
      if (x.ln) { c.beginPath(); x.ln.forEach(l => l.forEach((q, i) => { const p = S.toScr(q[0], q[1]); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); })); c.lineJoin = c.lineCap = "round"; c.strokeStyle = "#fff"; c.lineWidth = 6; c.stroke(); c.strokeStyle = col; c.lineWidth = 3.5; c.setLineDash(x.grup === "viitor" ? [8, 6] : []); c.stroke(); c.setLineDash([]); }
      else if (x.w) { const p = S.toScr(x.w[0], x.w[1]); c.beginPath(); c.moveTo(p[0], p[1] - 9); c.lineTo(p[0] + 9, p[1]); c.lineTo(p[0], p[1] + 9); c.lineTo(p[0] - 9, p[1]); c.closePath(); c.fillStyle = col; c.globalAlpha = .75; c.fill(); c.globalAlpha = 1; c.setLineDash([3, 3]); c.strokeStyle = "#fff"; c.lineWidth = 1.6; c.stroke(); c.setLineDash([]); }
    }
    const dot = (w, dx, dy, fill, stroke) => { const p = S.toScr(w[0], w[1]); c.beginPath(); c.arc(p[0] + dx, p[1] + dy, 4.2, 0, 7); c.fillStyle = fill; c.fill(); c.lineWidth = 1.6; c.strokeStyle = stroke; c.stroke(); };
    for (const x of V.firme) if (x.d <= K.R) dot(x.w, 6, -6, "#eef0f4", "#1a1e2a");   // firmă: bulină mică, culoare neutră
    for (const x of V.anunturi) if (x.dist <= K.R) dot(x.w, -6, -6, "#e5192d", "#fff");   // anunț de vânzare: bulină mică roșie
    c.restore();
    c.beginPath(); c.arc(K.tp[0], K.tp[1], K.rp, 0, 7); c.setLineDash([7, 5]); c.strokeStyle = "rgba(255,255,255,.95)"; c.lineWidth = 1.8; c.stroke(); c.setLineDash([]);
  }

  /* ---------- hartă ---------- */
  function creeaza(box, d) {
    const cv = document.createElement("canvas"), cx = cv.getContext("2d");
    const S = { cv, cx, cwx: wx(d.lon), cwy: wy(d.lat), z: 15, dpr: Math.min(window.devicePixelRatio || 1, 2), W: 300, H: 300, hl: [], img: new Map(), dirty: true, fly: null, home: { cwx: wx(d.lon), cwy: wy(d.lat), z: 15 } };
    S.resize = () => { const r = box.getBoundingClientRect(); if (!r.width) return; S.W = r.width; S.H = r.height; cv.width = Math.round(r.width * S.dpr); cv.height = Math.round(r.height * S.dpr); S.dirty = true; };
    S.scale = () => 256 * Math.pow(2, S.z);
    S.toScr = (a, b) => [(a - S.cwx) * S.scale() + S.W / 2, (b - S.cwy) * S.scale() + S.H / 2];
    S.tile = (z, x, y, T) => {
      const n = Math.pow(2, z); if (y < 0 || y >= n) return null; x = ((x % n) + n) % n;
      const u = (T || TILE).replace("{z}", z).replace("{y}", y).replace("{x}", x); let im = S.img.get(u);
      if (!im) { im = new Image(); im.crossOrigin = "anonymous"; im.onload = () => { im._ok = 1; S.dirty = true; }; im.onerror = () => { im._err = 1; }; im.src = u; S.img.set(u, im); if (S.img.size > 400) { const k = S.img.keys().next().value; S.img.delete(k); } }
      return im;
    };
    S.draw = () => {
      S.dirty = false; const c = S.cx, W = S.W, H = S.H; c.setTransform(S.dpr, 0, 0, S.dpr, 0, 0); c.fillStyle = "#1c2230"; c.fillRect(0, 0, W, H);
      const sc = S.scale(), tz = Math.max(3, Math.min(ZTILE, Math.round(S.z))), n = Math.pow(2, tz), ts = 256 * Math.pow(2, S.z - tz);
      const x0 = Math.floor((S.cwx - W / 2 / sc) * n), x1 = Math.floor((S.cwx + W / 2 / sc) * n), y0 = Math.floor((S.cwy - H / 2 / sc) * n), y1 = Math.floor((S.cwy + H / 2 / sc) * n);
      for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
        const p = S.toScr(x / n, y / n);   // placa de la zoomul cerut; dacă lipsește (încă se încarcă / nu există la acest zoom), se desenează placa-părinte mărită
        for (let k = 0; k <= 6 && tz - k >= 3; k++) {
          const f = Math.pow(2, k), px = Math.floor(x / f), py = Math.floor(y / f); let im = S.tile(tz - k, px, py); if (im && im._err && tz - k <= 15) im = S.tile(tz - k, px, py, TILE2);
          if (!im || !im._ok) continue;
          if (k === 0) c.drawImage(im, p[0], p[1], ts + .5, ts + .5); else { const sw = 256 / f; c.drawImage(im, (x - px * f) * sw, (y - py * f) * sw, sw, sw, p[0], p[1], ts + .5, ts + .5); }
          break;
        }
      }
      if (!P) return;
      const vx0 = S.cwx - W / 2 / sc, vx1 = S.cwx + W / 2 / sc, vy0 = S.cwy - H / 2 / sc, vy1 = S.cwy + H / 2 / sc;
      const trasa = (ring, o) => { for (let i = 0; i < ring.length; i++) { const p = S.toScr(ring[i][0], ring[i][1]); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } c.closePath(); };
      if (P.v2) drawV2(S, c, trasa, [vx0, vy0, vx1, vy1]); else {
      for (const inc of ["C", "B", "A"]) {   // toate parcelele cu date, ușor colorate (încrederea C / B mai ștearsă)
        c.beginPath(); let any = false;
        for (const id in P.g) { const o = P.g[id]; if ((o.inc === "A" ? "A" : o.inc === "B" ? "B" : "C") !== inc) continue; if (o.b[2] < vx0 || o.b[0] > vx1 || o.b[3] < vy0 || o.b[1] > vy1) continue; any = true; for (const r of o.rings) trasa(r); }
        if (!any) continue;
        const a = inc === "A" ? .30 : inc === "B" ? .20 : .12; c.fillStyle = `rgba(255,205,60,${a})`; c.fill(); c.strokeStyle = `rgba(255,214,90,${inc === "A" ? .85 : .5})`; c.lineWidth = inc === "A" ? 1 : .8; c.stroke();
      }
      }
      const h = S.home, tp = S.toScr(wx(dom().lon), wy(dom().lat));   // terenul raportului
      c.beginPath(); c.arc(tp[0], tp[1], 9, 0, 7); c.strokeStyle = "#ff3b30"; c.lineWidth = 3; c.stroke(); c.beginPath(); c.arc(tp[0], tp[1], 3, 0, 7); c.fillStyle = "#ff3b30"; c.fill();
      for (const hl of S.hl) {   // parcela aprinsă: contur alb + portocaliu, umplere puternică
        if (hl.rings) { c.beginPath(); for (const r of hl.rings) trasa(r); c.fillStyle = "rgba(255,140,0,.5)"; c.fill(); c.lineJoin = "round"; c.strokeStyle = "#fff"; c.lineWidth = 5; c.stroke(); c.strokeStyle = "#ff8c00"; c.lineWidth = 2.5; c.stroke(); }
        else if (hl.pt) { const p = S.toScr(hl.pt[0], hl.pt[1]); c.beginPath(); c.arc(p[0], p[1], 13, 0, 7); c.setLineDash([5, 4]); c.strokeStyle = "#fff"; c.lineWidth = 4; c.stroke(); c.strokeStyle = "#ff8c00"; c.lineWidth = 2; c.stroke(); c.setLineDash([]); c.beginPath(); c.arc(p[0], p[1], 4, 0, 7); c.fillStyle = "#ff8c00"; c.fill(); }
      }
      if (S.label) {   // etichetă scurtă lângă prima parcelă aprinsă
        const hl = S.hl[0]; const cc = hl && (hl.c || hl.pt); if (cc) {
          const p = S.toScr(cc[0], cc[1]); c.font = "700 12px system-ui"; const t = S.label, w = Math.min(c.measureText(t).width + 14, W - 12), x = Math.max(6, Math.min(W - w - 6, p[0] - w / 2)), y = Math.max(6, p[1] - 38);
          c.fillStyle = "rgba(26,30,42,.94)"; c.beginPath(); c.roundRect ? c.roundRect(x, y, w, 24, 8) : c.rect(x, y, w, 24); c.fill(); c.fillStyle = "#fff"; c.textBaseline = "middle"; c.fillText(t.length > 46 ? t.slice(0, 45) + "…" : t, x + 7, y + 12);
        }
      }
    };
    S.loop = () => { if (S.fly) { const t = Math.min(1, (performance.now() - S.fly.t0) / S.fly.d), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; S.cwx = S.fly.a[0] + (S.fly.b[0] - S.fly.a[0]) * e; S.cwy = S.fly.a[1] + (S.fly.b[1] - S.fly.a[1]) * e; S.z = S.fly.a[2] + (S.fly.b[2] - S.fly.a[2]) * e; S.dirty = true; if (t >= 1) S.fly = null; } if (S.dirty && S.W) S.draw(); requestAnimationFrame(S.loop); };
    S.flyTo = (cwx, cwy, z) => { const dx = Math.abs(cwx - S.cwx) * S.scale(), dy = Math.abs(cwy - S.cwy) * S.scale(); S.fly = { t0: performance.now(), d: Math.min(1400, 450 + Math.hypot(dx, dy) * .12), a: [S.cwx, S.cwy, S.z], b: [cwx, cwy, Math.max(3, Math.min(ZMAX, z))] }; };
    // pan / pinch / roată
    const pts = new Map(); let last = null;
    cv.addEventListener("pointerdown", e => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); S.fly = null; last = null; });
    cv.addEventListener("pointermove", e => {
      if (!pts.has(e.pointerId)) return; const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 1) { const sc = S.scale(); S.cwx -= (e.clientX - prev[0]) / sc; S.cwy -= (e.clientY - prev[1]) / sc; S.dirty = true; }
      else if (pts.size === 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (last) { S.z = Math.max(3, Math.min(ZMAX, S.z + Math.log2(d / last))); S.dirty = true; } last = d; }
    });
    const up = e => { pts.delete(e.pointerId); last = null; };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    cv.addEventListener("wheel", e => { e.preventDefault(); S.fly = null; S.z = Math.max(3, Math.min(ZMAX, S.z - e.deltaY * .0015)); S.dirty = true; }, { passive: false });
    cv.addEventListener("dblclick", e => { S.z = Math.min(ZMAX, S.z + 1); S.dirty = true; });
    S.mesaj = t => { const m = S.msg; if (!m) return; m.textContent = t; m.classList.add("on"); clearTimeout(S._mt); S._mt = setTimeout(() => m.classList.remove("on"), 1800); };
    return S;
  }

  function monteaza(corp, d) {
    css();
    let box = $(".dhm", corp);
    if (!box) { box = document.createElement("div"); box.className = "dhm"; corp.insertBefore(box, corp.firstChild); }
    if (!M) { M = creeaza(box, { lat: d.lat, lon: d.lon }); requestAnimationFrame(M.loop); }
    if (M.cv.parentNode !== box) {
      box.innerHTML = ""; box.appendChild(M.cv);
      const b = document.createElement("button"); b.type = "button"; b.className = "dhm-back"; b.textContent = "înapoi la teren"; b.onclick = () => { M.hl = []; M.label = ""; const w = $(".dhm-fis", box); if (w) w.remove(); incadreaza(M, dom(), true); };
      const a = document.createElement("div"); a.className = "dhm-atr"; a.textContent = ATRIB;
      const m = document.createElement("div"); m.className = "dhm-msg"; M.msg = m; box.append(b, a, m);
      legenda(box);
      if (!M._tap) { M._tap = 1; let d0 = null; M.cv.addEventListener("pointerdown", e => { d0 = { x: e.clientX, y: e.clientY, t: performance.now() }; }); M.cv.addEventListener("pointerup", e => { const q = d0; d0 = null; if (q && Math.hypot(e.clientX - q.x, e.clientY - q.y) < 8 && performance.now() - q.t < 300) tapHarta(M, e, box); }); }
      M.resize(); if (!M._ro && window.ResizeObserver) { M._ro = new ResizeObserver(() => M.resize()); } if (M._ro) { M._ro.disconnect(); M._ro.observe(box); }
    }
    if (M.rid !== d.id) { M.rid = d.id; M.hl = []; M.label = ""; M.home = { cwx: wx(d.lon), cwy: wy(d.lat), z: 15 }; M.cwx = M.home.cwx; M.cwy = M.home.cwy; M.z = 15; M.dirty = true; M._rz = null; }
  }

  /* ---------- rânduri ---------- */
  function pozitii(s, i) {
    if (!P) return [];
    const ids = (P.randuri[s] || [])[i] || [], out = [];
    for (const id of ids.slice(0, 8)) { const k = String(id).replace(/^nc:/, ""); if (P.g[k]) out.push({ rings: P.g[k].rings, c: P.g[k].c, b: P.g[k].b, nc: k }); else if (P.pt[k]) out.push({ pt: P.pt[k], nc: k }); }
    return out;
  }
  function eticheta(tr, hl) {
    const t = [...tr.querySelectorAll("td")].slice(0, 2).map(x => x.innerText.replace(/\s+/g, " ").trim()).filter(Boolean).join(" · ");
    const nc = hl.map(h => h.nc).slice(0, 2).join(", "), aprox = hl.every(h => h.pt);
    return (t.slice(0, 30) + (nc ? " · NC " + nc : "") + (aprox ? " · aproximativ" : "")).trim();
  }
  function aprinde(tr) {
    if (!M || !P) return;
    document.querySelectorAll("#date_fine_aproape tr.dfa-on").forEach(x => x.classList.remove("dfa-on"));
    const s = tr.dataset.s, i = +tr.dataset.i, hl = pozitii(s, i);
    if (!hl.length) return;
    if (P.v2 && hl.every(h => { const f = P.v2.f[h.nc]; return !f || (f.dm != null && f.dm > RAZA()); })) { M.mesaj(`parcela e în afara razei de ${RAZA()} m — mărește raza`); return; }   // fără poziție: nu se întâmplă nimic pe hartă (rândul are „!”)
    tr.classList.add("dfa-on"); M.hl = hl; M.label = eticheta(tr, hl); M.dirty = true;
    let x0 = 9, y0 = 9, x1 = -9, y1 = -9;
    for (const h of hl) { const b = h.b || [h.pt[0], h.pt[1], h.pt[0], h.pt[1]]; x0 = Math.min(x0, b[0]); y0 = Math.min(y0, b[1]); x1 = Math.max(x1, b[2]); y1 = Math.max(y1, b[3]); }
    const sc = M.scale(), a = M.toScr(x0, y0), b = M.toScr(x1, y1), m = 50;
    const vizibil = a[0] > m && a[1] > m + 30 && b[0] < M.W - m && b[1] < M.H - m && (b[0] - a[0]) < M.W * .8 && (b[1] - a[1]) < M.H * .7;
    if (vizibil && Math.max(b[0] - a[0], b[1] - a[1]) >= 60) return;   // e în vedere și destul de mare: doar se aprinde; parcela mică se apropie până la zoom de stradă
    const w = Math.max(x1 - x0, 1e-7), h2 = Math.max(y1 - y0, 1e-7);
    const zf = Math.log2(Math.min((M.W - 2 * m) / w, (M.H - 2 * m - 30) / h2) / 256);
    M.flyTo((x0 + x1) / 2, (y0 + y1) / 2, Math.max(14, Math.min(ZMAX - .5, zf)));
  }
  /* o atingere scurtă (< 300 ms, < 8 px) pe un rând aprinde parcela; derularea nu aprinde nimic */
  let T = null;
  document.addEventListener("pointerdown", e => { const tr = e.target.closest && e.target.closest("#date_fine_aproape tr[data-i]"); T = tr ? { tr, x: e.clientX, y: e.clientY, t: performance.now(), mv: false } : null; }, true);
  document.addEventListener("pointermove", e => { if (T && Math.hypot(e.clientX - T.x, e.clientY - T.y) > 8) T.mv = true; }, true);
  document.addEventListener("pointercancel", () => { T = null; }, true);   // la derulare pe touch browserul anulează gestul
  document.addEventListener("pointerup", e => { const t = T; T = null; if (t && !t.mv && performance.now() - t.t < 300) aprinde(t.tr); }, true);
  document.addEventListener("scroll", () => { if (T) T.mv = true; }, true);


  /* ---------- atingere pe hartă: fereastră scurtă cu datele parcelei + „Cronologie” la cerere ---------- */
  const mk = a => a.ds ? " (din sursă)" : "†";   // termen din lista primăriei sau calculat
  const stAct = a => a.st === "valabil" ? `<span class="ok">valabil până la ${dmy(a.sf)}${mk(a)}</span>` : a.st === "expirat" ? `<span class="ex">expirat la ${dmy(a.sf)}${mk(a)}</span>` : "";
  const banii = a => a.pret ? `${Number(a.pret).toLocaleString("ro-RO")} ${a.mon || ""}${a.mp ? " · " + a.mp + " mp" : ""}${a.eur_mp ? " · " + a.eur_mp + " €/mp" : ""}` : "preț nespecificat";
  function fisa(box, sel) {
    const V = P.v2; let h = "", k = sel.k, f = k && V.f[k];
    if (f) {
      const ac = f.acte.filter(a => a.t === "AC").length, cu = f.acte.filter(a => a.t === "CU").length;
      h += `<h4>Parcela NC ${esc(k)}</h4><div class="s">${f.dm != null ? "la " + f.dm + " m de teren · " : ""}AC ${ac} · CU ${cu} · PUZ ${f.puz.length}${f.firme.length ? " · firme " + f.firme.length : ""}${f.anunturi.length ? " · anunțuri " + f.anunturi.length : ""}</div>`;
      if (f.acte.length) h += "<ul>" + f.acte.slice(0, 4).map(a => `<li><b>${esc(a.t)} ${esc(a.n)}</b> · ${dmy(a.d)} · ${stAct(a)}<br>${esc(a.o || "—")}${a.b ? " · <i>" + esc(a.b) + "</i>" : ""}</li>`).join("") + (f.acte.length > 4 ? `<li class="s">+${f.acte.length - 4} în Cronologie</li>` : "") + "</ul>";
      if (f.puz.length) h += "<ul>" + f.puz.map(z => `<li><b>PUZ</b> HCL ${esc(z.h || "")} · ${dmy(z.d)} · ${esc(z.s || "")}<br>${esc(z.o)}</li>`).join("") + "</ul>";
    } else h += `<h4>${esc(sel.titlu || "Obiect pe hartă")}</h4>`;
    const fir = sel.firma ? [sel.firma] : f ? f.firme : [], anu = sel.anunt ? [sel.anunt] : f ? f.anunturi : [];
    if (fir.length) h += "<div><b>Firme</b></div><ul>" + fir.map(x => `<li>${esc(x.n)} · CAEN ${esc(x.c || "—")} · ${esc(x.st || "")}<br><span class="s">${esc(x.ad || "")} · la ${x.d} m</span></li>`).join("") + "</ul>";
    if (anu.length) h += "<div><b>Anunțuri de vânzare</b></div><ul>" + anu.map(x => `<li>${esc(banii(x))}<br><span class="s">${esc(x.t)} · ${dmy(x.d)}${x.aprox ? " · poziție aproximativă (~100 m)" : ""}${x.u ? ' · <a href="' + esc(x.u) + '" target="_blank" rel="noopener">anunț</a>' : ""}</span></li>`).join("") + "</ul>";
    if (sel.inv) { const x = sel.inv; h += `<div class="s">${esc(x.grup)} · ${esc(x.st || "")}${x.aprox ? " · poziție aproximativă (sat)" : (x.loc && /^OSM/.test(x.loc) ? " · traseu din OpenStreetMap" : "")}${x.loc ? " · " + esc(x.loc) : ""}${x.val ? " · " + esc(x.val) + " lei" : ""}${x.d ? " · " + dmy(x.d) : ""}</div><div>${esc(x.t)}</div>${x.u ? '<div class="s"><a href="' + esc(x.u) + '" target="_blank" rel="noopener">sursa</a></div>' : ""}`; }
    if (f && (f.acte.length || f.puz.length)) h += `<button type="button" class="cr">Cronologie</button>`;
    let w = $(".dhm-fis", box); if (!w) { w = document.createElement("div"); w.className = "dhm-fis"; box.appendChild(w); }
    w.innerHTML = `<button type="button" class="x" aria-label="Închide">×</button>` + h;
    w.querySelector(".x").onclick = () => { w.remove(); M.hl = []; M.label = ""; M.dirty = true; };
    const cb = w.querySelector(".cr"); if (cb) cb.onclick = () => cronologie(k);
  }
  function cronologie(k) {
    const V = P.v2, f = V.f[k]; if (!f) return;
    const dd = s => Date.parse(s) || 0, azi = dd(V.data || "2026-11-13"), toate = f.acte.concat(f.puz.map(z => ({ t: "PUZ", d: String(z.d || "").slice(0, 10), n: z.h || "", o: z.o, st: "", sf: null })));
    let a0 = Math.min(azi, ...toate.map(a => dd(a.d)).filter(Boolean)), a1 = Math.max(azi, ...toate.map(a => dd(a.sf || a.d)).filter(Boolean)); const span = Math.max(a1 - a0, 1);
    const tc = { AC: "#1f8a4c", CU: "#1f4fd8", PUZ: "#7a4fc4" }, nv = f.acte.filter(a => a.st === "valabil").length, ne = f.acte.filter(a => a.st === "expirat").length;
    const ov = document.createElement("div"); ov.className = "dhm-cr"; let mod = "toate";
    const rand = a => { const p0 = (dd(a.d) - a0) / span * 100, p1 = a.sf ? (dd(a.sf) - a0) / span * 100 : p0 + 1.2, col = a.st === "expirat" ? "#9aa1ad" : (tc[a.t] || "#1f8a4c");
      return `<div class="r"><b class="t" style="background:${tc[a.t] || "#555"}">${esc(a.t)}</b><b>${esc(a.n)}</b> · ${dmy(a.d)} · ${a.t === "PUZ" ? "aprobat" : stAct(a)}<div>${esc(a.o || "—")}${a.b ? " · <i>" + esc(a.b) + "</i>" : ""}</div><div class="tr"><i style="left:${p0.toFixed(2)}%;width:${Math.max(1.2, p1 - p0).toFixed(2)}%;background:${col}"></i><u style="left:${((azi - a0) / span * 100).toFixed(2)}%" title="azi"></u></div></div>`; };
    const desen = () => {
      const L = toate.filter(a => mod === "toate" || (mod === "valabile" && a.st === "valabil") || (mod === "expirate" && a.st === "expirat")).sort((x, y) => dd(y.d) - dd(x.d)), ani = {}; for (const a of L) (ani[String(a.d).slice(0, 4)] = ani[String(a.d).slice(0, 4)] || []).push(a);
      ov.querySelector(".w").innerHTML = `<button type="button" class="x" aria-label="Închide">×</button><h3>Cronologie · NC ${esc(k)}</h3><div class="s" style="color:#4a5160;font-size:12px">${f.dm != null ? "la " + f.dm + " m de teren · " : ""}${nv} valabile · ${ne} expirate · ${f.puz.length} PUZ · linia roșie = azi</div>
        <div class="f">${[["toate", "Toate " + toate.length], ["valabile", "Valabile " + nv], ["expirate", "Expirate " + ne]].map(([m, t]) => `<button type="button" data-m="${m}" class="${m === mod ? "on" : ""}">${t}</button>`).join("")}</div>
        ${Object.keys(ani).sort().reverse().map(y => `<h5>${y} · ${ani[y].length} ${ani[y].length === 1 ? "act" : "acte"}</h5>` + ani[y].map(rand).join("")).join("") || '<p class="s">Niciun act în această categorie.</p>'}
        <div class="n">${esc(V.reguli || "")} † = termen calculat, nu din sursă; „din sursă” = termenul din lista primăriei.</div>`;
      ov.querySelector(".x").onclick = () => ov.remove(); ov.querySelectorAll(".f button").forEach(b => b.onclick = () => { mod = b.dataset.m; desen(); });
    };
    ov.innerHTML = '<div class="w"></div>'; ov.addEventListener("click", e => { if (e.target === ov) ov.remove(); }); desen(); document.body.appendChild(ov);
  }
  function distSeg(px, py, a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy, t = l ? Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / l)) : 0; return Math.hypot(px - a[0] - t * dx, py - a[1] - t * dy); }
  function tapHarta(S, e, box) {
    if (!P || !P.v2) return; const V = P.v2, K = cerc(S), r = S.cv.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top, sc = S.scale(), wxp = S.cwx + (sx - S.W / 2) / sc, wyp = S.cwy + (sy - S.H / 2) / sc;
    if (Math.hypot(sx - K.tp[0], sy - K.tp[1]) > K.rp) { S.mesaj(`în afara razei de ${K.R} m`); return; }
    const near = (w, dx, dy) => { const p = S.toScr(w[0], w[1]); return Math.hypot(sx - p[0] - dx, sy - p[1] - dy) <= 14; };
    let sel = null;
    for (const x of V.anunturi) if (!sel && x.dist <= K.R && near(x.w, -6, -6)) sel = { k: x.nc, anunt: x, titlu: "Anunț de vânzare" };
    for (const x of V.firme) if (!sel && x.d <= K.R && near(x.w, 6, -6)) sel = { k: x.nc, firma: x, titlu: "Firmă" };
    for (const x of V.investitii) { if (sel || (x.dm != null && x.dm > K.R)) continue; if (x.w && near(x.w, 0, 0)) sel = { inv: x, titlu: "Investiție" }; else if (x.ln) { for (const l of x.ln) { for (let i = 1; i < l.length; i++) { const a = S.toScr(l[i - 1][0], l[i - 1][1]), b = S.toScr(l[i][0], l[i][1]); if (distSeg(sx, sy, a, b) <= 12) { sel = { inv: x, titlu: "Investiție" }; break; } } if (sel) break; } } }
    if (!sel) for (const k of Object.keys(V.f)) { const f = V.f[k]; if ((f.dm == null || f.dm <= K.R) && wxp >= f.b[0] && wxp <= f.b[2] && wyp >= f.b[1] && wyp <= f.b[3] && inPoly(f.rings, wxp, wyp)) { sel = { k }; break; } }
    if (!sel) return;
    const f = sel.k && V.f[sel.k]; M.hl = f ? [{ rings: f.rings, c: f.c, b: f.b, nc: sel.k }] : []; M.label = ""; M.dirty = true; fisa(box, sel);
  }
  function legenda(box) {
    if ($(".dhm-leg", box)) return; const d = document.createElement("details"); d.className = "dhm-leg";
    d.innerHTML = `<summary>Legendă</summary><div><i style="background:rgba(255,205,60,.55);border:1.5px solid #ffd65a"></i>parcelă cu AC, CU sau PUZ</div><div><i style="border:1px solid #fff;background:#445"></i>cadastru (fundal)</div><div><i style="background:#eef0f4;border:2px solid #1a1e2a;border-radius:50%;width:10px;height:10px"></i>firmă</div><div><i style="background:#e5192d;border:2px solid #fff;border-radius:50%;width:10px;height:10px"></i>anunț de vânzare</div><div><i style="background:#7c3aed;height:5px;margin:4px 0"></i>investiție (linie; ◆ = aproximativ)</div><div style="font-size:11px;color:#4a5160">Atinge o parcelă pentru date; „Cronologie” din fereastra ei.</div>`;
    box.appendChild(d);
  }
  function incadreaza(S, d, anim) {
    const re = RAZA() + (P && P.v2 ? P.v2.r0 || 0 : 0), rw = re / mW(d.lat), sc = .46 * Math.min(S.W, S.H) / rw, z = Math.max(13, Math.min(ZMAX - .3, Math.log2(sc / 256)));
    S.home = { cwx: wx(d.lon), cwy: wy(d.lat), z }; S._rz = RAZA(); if (anim) S.flyTo(S.home.cwx, S.home.cwy, z); else { S.cwx = S.home.cwx; S.cwy = S.home.cwy; S.z = z; } S.dirty = true;
  }

  async function ensure() {
    const d = dom(); if (!d || d.lat == null) return;
    const sec = $("#date_fine_aproape"); if (!sec || sec.hidden) return;
    const corp = $(".dfa-corp", sec); if (!corp || !(corp.querySelector("details.dfa-sec") || corp.querySelector("table"))) return;
    const p = await incarca(); if (!p) { const b = $(".dhm", corp); if (b) b.remove(); return; }
    monteaza(corp, d);
    if (P.v2 && M.W > 10 && M._rz !== RAZA()) incadreaza(M, d, M._rz != null);   // cursorul 0–350 m schimbă cercul hărții
    sec.querySelectorAll("tr[data-i]").forEach(tr => { if (tr.dataset.np) return; tr.dataset.np = "1"; if (!pozitii(tr.dataset.s, +tr.dataset.i).length) tr.classList.add("dfa-np"); });
  }
  setInterval(() => { try { ensure(); } catch (e) { console.warn("dom_harta", e); } }, 900);
  window.CC_DOM_MAP = { aprinde, get stare() { return M; } };
})();
