/* Raport · Cartea Casei — harta DOM (v82.18.0, 13.11.2026, cerut de Manu):
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
  const ZMAX = 19;
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
    return { g, pt, randuri: J.randuri || {}, bbox: J.bbox };
  }
  async function incarca() {
    const d = dom(); if (!d) return null;
    if (Pid === d.id && P) return P;
    if (Pload && Pload.id === d.id) return Pload.p;
    const id = d.id, p = (async () => { try { const r = await fetch(`p/${encodeURIComponent(id)}/dom_parcele.json`, { cache: "no-store" }); if (!r.ok) return null; P = pregateste(await r.json()); Pid = id; return P; } catch (e) { return null; } })();
    Pload = { id, p }; return p;
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
      const sc = S.scale(), tz = Math.max(3, Math.min(ZMAX, Math.round(S.z))), n = Math.pow(2, tz), ts = 256 * Math.pow(2, S.z - tz);
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
      for (const inc of ["C", "B", "A"]) {   // toate parcelele cu date, ușor colorate (încrederea C / B mai ștearsă)
        c.beginPath(); let any = false;
        for (const id in P.g) { const o = P.g[id]; if ((o.inc === "A" ? "A" : o.inc === "B" ? "B" : "C") !== inc) continue; if (o.b[2] < vx0 || o.b[0] > vx1 || o.b[3] < vy0 || o.b[1] > vy1) continue; any = true; for (const r of o.rings) trasa(r); }
        if (!any) continue;
        const a = inc === "A" ? .30 : inc === "B" ? .20 : .12; c.fillStyle = `rgba(255,205,60,${a})`; c.fill(); c.strokeStyle = `rgba(255,214,90,${inc === "A" ? .85 : .5})`; c.lineWidth = inc === "A" ? 1 : .8; c.stroke();
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
      const b = document.createElement("button"); b.type = "button"; b.className = "dhm-back"; b.textContent = "înapoi la teren"; b.onclick = () => { M.hl = []; M.label = ""; M.flyTo(M.home.cwx, M.home.cwy, M.home.z); M.dirty = true; };
      const a = document.createElement("div"); a.className = "dhm-atr"; a.textContent = ATRIB;
      const m = document.createElement("div"); m.className = "dhm-msg"; M.msg = m; box.append(b, a, m);
      M.resize(); if (!M._ro && window.ResizeObserver) { M._ro = new ResizeObserver(() => M.resize()); } if (M._ro) { M._ro.disconnect(); M._ro.observe(box); }
    }
    if (M.rid !== d.id) { M.rid = d.id; M.hl = []; M.label = ""; M.home = { cwx: wx(d.lon), cwy: wy(d.lat), z: 15 }; M.cwx = M.home.cwx; M.cwy = M.home.cwy; M.z = 15; M.dirty = true; }
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
    if (!hl.length) return;   // fără poziție: nu se întâmplă nimic pe hartă (rândul are „!”)
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

  async function ensure() {
    const d = dom(); if (!d || d.lat == null) return;
    const sec = $("#date_fine_aproape"); if (!sec || sec.hidden) return;
    const corp = $(".dfa-corp", sec); if (!corp || !(corp.querySelector("details.dfa-sec") || corp.querySelector("table"))) return;
    const p = await incarca(); if (!p) { const b = $(".dhm", corp); if (b) b.remove(); return; }
    monteaza(corp, d);
    sec.querySelectorAll("tr[data-i]").forEach(tr => { if (tr.dataset.np) return; tr.dataset.np = "1"; if (!pozitii(tr.dataset.s, +tr.dataset.i).length) tr.classList.add("dfa-np"); });
  }
  setInterval(() => { try { ensure(); } catch (e) { console.warn("dom_harta", e); } }, 900);
  window.CC_DOM_MAP = { aprinde, get stare() { return M; } };
})();
