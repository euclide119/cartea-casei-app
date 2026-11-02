/* Raport \u00een cre\u0219tere \u2014 motorul de hart\u0103 \u0219i de grafice (OpenStreetMap, desenat de noi; f\u0103r\u0103 imagini externe).
   Folosit de pagina interactiv\u0103 (index.html) \u0219i de PDF (raport_pdf.html). Datele vin din harta.json (harta.py).
   HM.mount(el, H, preset)  \u2192 hart\u0103 interactiv\u0103: straturi care se pot opri, etichete, atingere/hover pe puncte
   HM.paint(canvas, H, preset, opt) \u2192 desen fix (PDF)      HM.legend(preset, H) \u2192 HTML al legendei
   HM.donut / HM.bars / HM.stack / HM.gauge / HM.regMap \u2192 grafice SVG (culori din variabilele CSS ale paginii)  */
(function () {
  const RAD = Math.PI / 180;
  const nf = (v, d = 0) => Number(v).toLocaleString("ro-RO", { minimumFractionDigits: d, maximumFractionDigits: d });
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- culori (hart\u0103 cu fundal deschis, fix\u0103 \u00een ambele teme) ---------- */
  const BG = "#f2f0e9";
  const LU = { res: "#f4ebd8", com: "#f3c8bd", ind: "#d8d0ea", grn: "#d2e8c3", agr: "#eaefcf", apa: "#b7d7f0", alt: "#e5e4df" };
  const LU_N = { res: "Zon\u0103 reziden\u021bial\u0103", com: "Zon\u0103 comercial\u0103", ind: "Zon\u0103 industrial\u0103", grn: "Verde, parcuri", agr: "Agricol", apa: "Ap\u0103", alt: "Alte zone" };
  const BL = { b: "#c84b31", c: "#e8a33d", r: "#edc88a", i: "#7a62a6", k: "#16868c", p: "#2c5c9c", a: "#b9b5ab", o: "#cdc9bf" };
  const BL_N = { b: "Blocuri", c: "Case", r: "Locuin\u021be (tip neprecizat)", i: "Industrial, depozite", k: "Comercial, servicii", p: "Public (\u0219coli, spitale, cult)", a: "Anexe, garaje", o: "Altele (f\u0103r\u0103 tip \u00een OSM)" };
  const PC = { sc: "#e4572e", gr: "#f3a712", li: "#b5338a", mg: "#2e933c", mc: "#0b7a75", fa: "#d62839", md: "#d62839", bn: "#3a6ea5", rs: "#a8763e", pk: "#4c9f38", sp: "#6f4e9c", tr: "#1d4ed8", cu: "#7d7d7d", ps: "#996515", mo: "#8e24aa", ut: "#546e7a", pm: "#8d6e63" };
  const PG = { sc: "\u0218", gr: "G", li: "L", mg: "M", mc: "C", fa: "F", md: "+", bn: "B", rs: "R", pk: "P", sp: "S", tr: "T", cu: "\u2020", ps: "@", mo: "\u25c6", ut: "\u26a1", pm: "\u25aa" };
  const PN = { sc: "\u0218coal\u0103", gr: "Gr\u0103dini\u021b\u0103", li: "Liceu, colegiu, universitate", mg: "Magazin alimentar", mc: "Mall, centru comercial", fa: "Farmacie", md: "Medic, spital", bn: "Banc\u0103, bancomat", rs: "Restaurant, cafenea", pk: "Parc, loc de joac\u0103", sp: "Sport", tr: "Sta\u021bie de transport", cu: "L\u0103ca\u0219 de cult", ps: "Po\u0219t\u0103, easybox", mo: "Monument, sit arheologic", ut: "Utilit\u0103\u021bi (substa\u021bie, turn de ap\u0103)", pm: "Benzin\u0103rie, pia\u021b\u0103" };
  const RD = [["#f0a43c", 6.4, "Magistral\u0103, drum principal"], ["#f6cf66", 5, "Drum secundar"], ["#ffffff", 3.8, "Drum ter\u021biar"], ["#ffffff", 2.6, "Strad\u0103"], ["#ffffff", 1.4, "Alee, serviciu"]];
  const AGC = { 0.10: "#7fc8a9", 0.15: "#b9d96f", 0.20: "#f2c14e", 0.25: "#ee8c3a", 0.30: "#d9534f", 0.35: "#a8325e", 0.40: "#6b2d8f" };
  const SEIS = { rosu: "#d62839", portocaliu: "#f08a24", verde: "#3d9a5b", gri: "#c9c5bb" };

  /* ---------- preset\u0103ri pe capitol ---------- */
  const COM = ["mg", "mc", "fa", "bn", "rs", "ps", "pm"];
  const P = {
    complet: { v: 1000, lu: 1, bld: "class", roads: "all", labels: 6, poi: ["sc", "gr", "li", "mg", "mc", "fa", "md", "tr", "pk"], rings: 1, titlu: "Cartierul pe scurt" },
    facilitati: { v: 1000, lu: "soft", comFocus: 1, bld: "gray", roads: "all", labels: 3, poi: [...COM, "md", "pk", "sp"], rings: 1, titlu: "Magazine, farmacii, servicii \u0219i zone comerciale" },
    transport: { v: 1500, base: "harta", lu: "soft", bld: "gray", roads: "arterii", labels: 12, poi: ["tr"], rail: 1, rings: 0, titlu: "Artere, sta\u021bii \u0219i linii de transport" },
    scoli: { v: 1500, lu: "soft", bld: "gray", roads: "all", labels: 2, poi: ["sc", "gr", "li"], poiLabels: 1, rings: 1, titlu: "\u0218coli, gr\u0103dini\u021be \u0219i licee" },
    populatie: { v: 900, lu: "off", bld: "class", only: ["b", "c", "r"], roads: "all", labels: 3, poi: ["sc", "gr", "pk", "md"], rings: 0, titlu: "Unde locuiesc oamenii: blocuri \u0219i case" },
    zonare: { v: 900, lu: 1, bld: "class", roads: "all", labels: 5, poi: ["ut"], util: 1, rings: 0, titlu: "Zonarea cartierului \u0219i utilit\u0103\u021bi" },
    monumente: { v: 1000, lu: "soft", bld: "gray", roads: "all", labels: 4, poi: ["mo", "cu"], prot: 100, rings: 0, titlu: "Monumente \u0219i zone de protec\u021bie" },
    autorizatii: { v: 900, lu: "soft", bld: "gray", roads: "all", aut: 1, labels: 4, poi: [], rings: 0, titlu: "Autoriza\u021bii de construire pe strad\u0103: ultimele 12 luni (alege anul)" },
    relief: { v: 1250, lu: "soft", bld: "gray", roads: "all", labels: 3, poi: [], rings: 0, relief: 1, titlu: "Poligonul de relief: p\u00e2n\u0103 unde ajungi pe jos, dup\u0103 c\u00e2t urc\u0103 sau coboar\u0103 terenul" },
    seism: { v: 800, hpdf: 0.38, lu: "soft", bld: "seism", roads: "all", labels: 3, poi: [], rings: 0, titlu: "Blocuri care pot intra sub Legea 212/2022" }
  };

  /* autorizatiile pe ani (Manu, 23.10): harta porneste pe ultimele 12 luni; in varianta electronica se trece intre ani */
  const autOK = () => { const A = CTX.aut; if (!A || !A.pe_strada_an) return false; const n = Object.keys(A.pe_strada).length; return n && Object.keys(A.pe_strada_an).length >= .5 * n; };
  let AUT_AN = "12"; const autAn = () => autOK() ? AUT_AN : "toti";
  /* contextul propriet\u0103\u021bii: imaginile din satelit (harta.json \u2192 sat) \u0219i autoriza\u021biile pe strad\u0103 (date.json \u2192 autorizatii) */
  const CTX = { sat: {}, aut: null, subs: new Set() };
  function setContext(o) {
    CTX.aut = o.aut || null; CTX.sat = {};
    /* Sentinel-2 \u201erecent\u201d (10 m) scos la cererea lui Manu, 20.10.2026: rezolu\u021bia nu ajut\u0103 la nivel de cartier */
    ["detaliu"].forEach(k => { const m = o.sat && o.sat[k]; if (!m || !o.urls || !o.urls[k]) return;
      const img = new Image(); img.onload = () => CTX.subs.forEach(f => f()); img.src = o.urls[k]; CTX.sat[k] = { img, meta: m }; });
  }
  const AUTC = n => n >= 11 ? "#b91c1c" : n >= 6 ? "#ea580c" : n >= 3 ? "#f59e0b" : "#facc15";
  const view = (cnv, H, preset) => {
    const w = cnv.width, h = cnv.height, v = preset.v || 1000, s = Math.min(w, h) / (2 * v);
    return { w, h, s, v, X: x => w / 2 + x * s, Y: y => h / 2 - y * s };
  };
  const path = (ctx, a, i0, V) => { for (let i = i0; i < a.length; i += 2) { const x = V.X(a[i]), y = V.Y(a[i + 1]); i === i0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } };
  const inView = (a, i0, v) => { for (let i = i0; i < a.length; i += 2) if (Math.abs(a[i]) < v * 1.35 && Math.abs(a[i + 1]) < v * 1.35) return true; return false; };

  /* ---------- desenul ---------- */
  function paint(cnv, H, preset, opt) {
    opt = opt || {};
    const ctx = cnv.getContext("2d"), V = view(cnv, H, preset), px = V.w / 800;   // px = factor de scar\u0103 al elementelor, fa\u021b\u0103 de o hart\u0103 de 800 px
    const off = opt.off || {};
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = BG; ctx.fillRect(0, 0, V.w, V.h);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    const base = opt.base || (CTX.sat.detaliu ? "detaliu" : "harta"), S = base !== "harta" && CTX.sat[base];
    const pe = !!(S && S.img.complete && S.img.naturalWidth);   // pe satelit: zonele \u0219i cl\u0103dirile se deseneaz\u0103 transparent, ca s\u0103 se vad\u0103 imaginea
    if (pe) { const R = S.meta.raza; ctx.filter = "saturate(1.3) contrast(1.06) brightness(1.04)"; ctx.drawImage(S.img, V.X(-R), V.Y(R), V.X(R) - V.X(-R), V.Y(-R) - V.Y(R)); ctx.filter = "none"; }   // fara voal alb (Manu, 23.10): satelitul in culori vii

    // zone
    if (preset.lu !== "off" && !off.lu) {
      const soft = preset.lu === "soft";
      const ord = ["agr", "alt", "res", "grn", "com", "ind", "apa"];
      ord.forEach(z => H.lu.forEach(a => { if (a[0] !== z || !inView(a, 1, V.v)) return;
        let col = LU[z], alpha = 1;
        if (soft) { if (preset.comFocus && (z === "com" || z === "ind")) { col = LU[z]; } else { alpha = z === "apa" || z === "grn" ? .7 : .35; } }
        if (pe) alpha = (preset.comFocus && (z === "com" || z === "ind")) || preset.lu === 1 ? .42 : 0;
        ctx.globalAlpha = alpha; ctx.fillStyle = col; ctx.beginPath(); path(ctx, a, 1, V); ctx.closePath(); if (alpha) ctx.fill(); ctx.globalAlpha = 1;
        if (pe && alpha) { ctx.strokeStyle = col; ctx.lineWidth = 1.6 * px; ctx.stroke(); }
        if (preset.comFocus && (z === "com" || z === "ind")) { ctx.strokeStyle = z === "com" ? "#d97a66" : "#8d79bd"; ctx.lineWidth = 1.2 * px; ctx.setLineDash([5 * px, 3 * px]); ctx.stroke(); ctx.setLineDash([]); } }));
    }
    // cl\u0103diri
    if (preset.bld !== "off" && !off.cl) {
      const mode = preset.bld;
      H.cl.forEach((a, idx) => {
        if (!inView(a, 1, V.v)) return;
        let col = BL[a[0]] || BL.o;
        if (preset.only && !preset.only.includes(a[0])) col = "#d9d6cd";
        if (mode === "gray") col = (preset.comFocus && (a[0] === "k" || a[0] === "i")) ? BL[a[0]] : "#d4d1c7";
        if (mode === "seism") {
          const nv = H.niv && H.niv[idx], an = H.an && H.an[idx];
          if (a[0] === "b" && nv >= 4) col = an == null ? SEIS.portocaliu : an < 1978 ? SEIS.rosu : SEIS.verde;
          else if (a[0] === "b") col = "#e9b4a6";
          else if (a[0] === "p") col = "#9db7d8";
          else col = "#d4d1c7";
        }
        const gri = col === "#d4d1c7" || col === "#d9d6cd";
        if (pe && gri) return;                                              // pe satelit, cl\u0103dirile neeviden\u021biate se v\u0103d din imagine
        ctx.globalAlpha = pe ? .78 : 1; ctx.fillStyle = col; ctx.beginPath(); path(ctx, a, 1, V); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
        ctx.strokeStyle = pe ? "rgba(255,255,255,.75)" : "rgba(60,50,40,.28)"; ctx.lineWidth = (pe ? .9 : .6) * px; ctx.stroke();
      });
    }
    // drumuri
    const roadsMode = preset.roads;
    if (roadsMode !== "off" && !off.dr) {
      const show = c => roadsMode === "arterii" ? c <= 2 : true;
      const draw = (ord, fn) => ord.forEach(c => H.dr.forEach(a => { if (a[0] !== c || !show(c) || !inView(a, 2, V.v)) return; fn(a); }));
      if (pe) ctx.globalAlpha = .8;
      [4, 3, 2, 1, 0].forEach(c => H.dr.forEach(a => { if (a[0] !== c || !show(c) || !inView(a, 2, V.v) || (pe && c >= 3)) return;
        const [col, w] = RD[c]; ctx.beginPath(); path(ctx, a, 2, V); ctx.strokeStyle = "#9a948a"; ctx.lineWidth = (w + 1.8) * px * (roadsMode === "arterii" && c <= 2 ? 1.1 : 1); ctx.stroke(); }));
      [4, 3, 2, 1, 0].forEach(c => H.dr.forEach(a => { if (a[0] !== c || !show(c) || !inView(a, 2, V.v) || (pe && c >= 3)) return;
        const [col, w] = RD[c]; ctx.beginPath(); path(ctx, a, 2, V); ctx.strokeStyle = col; ctx.lineWidth = w * px * (roadsMode === "arterii" && c <= 2 ? 1.1 : 1); ctx.stroke(); }));
      ctx.globalAlpha = 1;
      // autoriza\u021biile de construire, pe strad\u0103: strada colorat\u0103 dup\u0103 num\u0103rul de AC din ultimii 3 ani
      if (preset.aut && CTX.aut && CTX.aut.pe_strada && !off.aut) {
        const ps = CTX.aut.pe_strada, an = autAn(), PA = CTX.aut.pe_strada_an || {}, U12 = CTX.aut.ultim12 || {};
        const val = k => an === "toti" ? ps[k] : an === "12" ? (U12[k] ? { n: U12[k] } : null) : (PA[k] && PA[k][an] ? { n: PA[k][an] } : null);
        H.dr.forEach(a => { const x = val(a[1]); if (!x || !inView(a, 2, V.v)) return;
          ctx.beginPath(); path(ctx, a, 2, V); ctx.strokeStyle = "rgba(0,0,0,.55)"; ctx.lineWidth = 8.5 * px; ctx.stroke();
          ctx.strokeStyle = AUTC(x.n); ctx.lineWidth = 6 * px; ctx.stroke(); });
      }
      // r\u00e2uri, cale ferat\u0103, tramvai, linii electrice
      H.dr.forEach(a => { if (a[0] < 5 || !inView(a, 2, V.v)) return;
        if (a[0] === 7) { ctx.beginPath(); path(ctx, a, 2, V); ctx.strokeStyle = "#5aa7e0"; ctx.lineWidth = 2.6 * px; ctx.stroke(); }
        if (a[0] === 5 && (preset.rail || roadsMode === "all")) { ctx.beginPath(); path(ctx, a, 2, V); ctx.strokeStyle = "#555"; ctx.lineWidth = 2.2 * px; ctx.stroke(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1 * px; ctx.setLineDash([6 * px, 6 * px]); ctx.stroke(); ctx.setLineDash([]); }
        if (a[0] === 6 && (preset.rail || roadsMode === "all")) { ctx.beginPath(); path(ctx, a, 2, V); ctx.strokeStyle = "#b5338a"; ctx.lineWidth = 2.4 * px; ctx.setLineDash([2 * px, 3 * px]); ctx.stroke(); ctx.setLineDash([]); }
        if (a[0] === 8 && preset.util && !off.ut) { ctx.beginPath(); path(ctx, a, 2, V); ctx.strokeStyle = "#e07b00"; ctx.lineWidth = 1.6 * px; ctx.setLineDash([1 * px, 4 * px]); ctx.stroke(); ctx.setLineDash([]); } });
    }
    // zone de protec\u021bie \u00een jurul monumentelor
    if (preset.prot) H.poi.forEach(p => { if (p[0] !== "mo") return; ctx.beginPath(); ctx.arc(V.X(p[1]), V.Y(p[2]), preset.prot * V.s, 0, 2 * Math.PI); ctx.fillStyle = "rgba(142,36,170,.12)"; ctx.fill(); ctx.setLineDash([6 * px, 4 * px]); ctx.strokeStyle = "#8e24aa"; ctx.lineWidth = 1.4 * px; ctx.stroke(); ctx.setLineDash([]); });
    // \u021binta: inele de mers pe jos (\u00een linie dreapt\u0103, 80 m pe minut)
    if (preset.rings && !off.rings && H.iso) {    // izocrone reale pe str\u0103zi (izocrone.py, Valhalla/OSM): mai lungi pe str\u0103zile directe, mai scurte printre intersec\u021bii \u0219i cl\u0103diri
      [["15", "rgba(123,63,228,.06)"], ["10", "rgba(242,153,0,.08)"], ["5", "rgba(15,157,88,.12)"]].forEach(([m, fill]) => { const a = H.iso[m]; if (!a || a.length < 6) return;
        ctx.beginPath(); { const n = a.length / 2, Q = i => [V.X(a[(i % n) * 2]), V.Y(a[(i % n) * 2 + 1])];     // contur rotunjit: curbe p\u0103tratice prin mijloacele laturilor
          let [mx, my] = [(Q(0)[0] + Q(1)[0]) / 2, (Q(0)[1] + Q(1)[1]) / 2]; ctx.moveTo(mx, my);
          for (let i = 1; i <= n; i++) { const p = Q(i), q = Q(i + 1); ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); } }
        ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
        const IS = { "5": ["#0f9d58", 2.4, []], "10": ["#f29900", 2.0, [8 * px, 5 * px]], "15": ["#7b3fe4", 1.8, [1.5 * px, 3 * px]] }[m]; ctx.lineCap = "round"; ctx.strokeStyle = "#fff"; ctx.lineWidth = (IS[1] + 2) * px; ctx.setLineDash([]); ctx.globalAlpha = .7; ctx.stroke(); ctx.globalAlpha = 1; ctx.strokeStyle = IS[0]; ctx.lineWidth = IS[1] * px; ctx.setLineDash(IS[2]); ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = "butt";
        let ty = Infinity, tx = 0; for (let i = 0; i < a.length; i += 2) if (-a[i + 1] < ty) { ty = -a[i + 1]; tx = a[i]; }     // punctul cel mai de sus al zonei
        label(ctx, m + " min pe jos", V.X(tx), V.Y(-ty) - 3 * px, 11 * px, true, { "5": "#0b7a44", "10": "#b86f00", "15": "#5b2db0" }[m]); });
    } else if (preset.rings && !off.rings) [[400, 5], [800, 10], [1200, 15]].forEach(([r, m]) => { if (r * V.s > Math.min(V.w, V.h) / 2.05) return;
      ctx.beginPath(); ctx.arc(V.X(0), V.Y(0), r * V.s, 0, 2 * Math.PI); ctx.strokeStyle = "rgba(20,20,30,.55)"; ctx.lineWidth = 1.2 * px; ctx.setLineDash([7 * px, 5 * px]); ctx.stroke(); ctx.setLineDash([]);
      label(ctx, m + " min pe jos", V.X(0), V.Y(0) - r * V.s - 3 * px, 11 * px, true, "#222"); });
    // poligonul de relief (teren.py): cercul de 900 m pe plat (punctat) \u0219i zona real\u0103, deformat\u0103 de pant\u0103; la 150 m, punctele colorate arat\u0103 c\u00e2t urc\u0103 (maro) sau coboar\u0103 (verde) terenul
    if (preset.relief && H.rel && H.rel.poli) {
      const R = H.rel, a = R.poli, n = a.length / 2, Q = i => [V.X(a[(i % n) * 2]), V.Y(a[(i % n) * 2 + 1])];
      ctx.beginPath(); ctx.arc(V.X(0), V.Y(0), 900 * V.s, 0, 2 * Math.PI); ctx.strokeStyle = "rgba(20,20,30,.55)"; ctx.lineWidth = 1.2 * px; ctx.setLineDash([7 * px, 5 * px]); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); { let [mx, my] = [(Q(0)[0] + Q(1)[0]) / 2, (Q(0)[1] + Q(1)[1]) / 2]; ctx.moveTo(mx, my);
        for (let i = 1; i <= n; i++) { const p = Q(i), q = Q(i + 1); ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); } }
      ctx.closePath(); ctx.fillStyle = "rgba(255,179,0,.18)"; ctx.fill(); ctx.strokeStyle = "#ffb300"; ctx.lineWidth = 3 * px; ctx.stroke();
      ctx.beginPath(); ctx.arc(V.X(0), V.Y(0), 150 * V.s, 0, 2 * Math.PI); ctx.strokeStyle = "rgba(20,20,30,.35)"; ctx.lineWidth = 1 * px; ctx.stroke();
      R.p150.forEach(([x, y, dz], i) => { const cx = V.X(x), cy = V.Y(y); ctx.beginPath(); ctx.arc(cx, cy, 4.2 * px, 0, 2 * Math.PI); ctx.fillStyle = dz > 0.4 ? "#8d6e63" : dz < -0.4 ? "#4c9f38" : "#9a9a9a"; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.2 * px; ctx.stroke();
        if (i % 2 === 0) label(ctx, (dz > 0 ? "+" : dz < 0 ? "\u2212" : "") + nf(Math.abs(dz), 1) + " m", V.X(x * 1.9), V.Y(y * 1.9), 9.5 * px, true, "#333"); });
      label(ctx, "900 m pe plat", V.X(0), V.Y(0) - 900 * V.s - 4 * px, 10.5 * px, true, "#222");
    }
    // etichete de str\u0103zi (arterii)
    const boxes = [];
    if (preset.labels && roadsMode !== "off" && !off.dr) {
      const byName = {};
      H.dr.forEach(a => { if (a[0] > 3 || !a[1]) return; const L = len(a); if (L > 0 && inView(a, 2, V.v)) { const o = byName[a[1]]; if (!o || L > o.L) byName[a[1]] = { a, L, c: a[0] }; } });
      Object.entries(byName).sort((x, y) => x[1].c - y[1].c || y[1].L - x[1].L).slice(0, preset.labels * 2).forEach(([name, o]) => {
        if (boxes.length >= preset.labels * 2 || o.c > (roadsMode === "arterii" ? 2 : 3)) return;
        const m = mid(o.a); const f = 10.5 * px; ctx.font = `600 ${f}px "Instrument Sans", sans-serif`;
        const tw = ctx.measureText(name).width; if (tw > o.L * V.s * 0.9) return;
        const cx = V.X(m.x), cy = V.Y(m.y); if (cx < 20 || cy < 20 || cx > V.w - 20 || cy > V.h - 20) return;
        let ang = -Math.atan2((m.y2 - m.y1) * 1, (m.x2 - m.x1) * 1); if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
        const bb = [cx - tw / 2, cy - f, tw, f * 2]; if (boxes.some(b => hit(b, bb))) return; boxes.push(bb);
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineWidth = 3.4 * px; ctx.strokeStyle = "rgba(255,255,255,.92)"; ctx.strokeText(name, 0, 0); ctx.fillStyle = "#3a3630"; ctx.fillText(name, 0, 0); ctx.restore(); });
    }
    // puncte de interes
    const cats = (preset.poi || []).filter(c => !(off.poi && off.poi[c]));
    const hits = [];
    const sorted = H.poi.filter(p => cats.includes(p[0]) && Math.abs(p[1]) < V.v * 1.05 && Math.abs(p[2]) < V.v * 1.05).sort((a, b) => Math.hypot(b[1], b[2]) - Math.hypot(a[1], a[2]));
    sorted.forEach(p => {
      const x = V.X(p[1]), y = V.Y(p[2]), r = (p[0] === "tr" ? 6.4 : 8.6) * px;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fillStyle = PC[p[0]]; ctx.fill(); ctx.lineWidth = 1.8 * px; ctx.strokeStyle = "#fff"; ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = `700 ${(p[0] === "tr" ? 7.6 : 10) * px}px "Instrument Sans", sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(PG[p[0]], x, y + .4 * px);
      hits.push({ x, y, r: Math.max(r, 11), p });
    });
    if (preset.poiLabels) sorted.filter(p => p[3]).slice(-14).reverse().forEach(p => {
      const f = 10 * px; ctx.font = `600 ${f}px "Instrument Sans", sans-serif`; const t = p[3].length > 26 ? p[3].slice(0, 25) + "\u2026" : p[3];
      const x = V.X(p[1]) + 11 * px, y = V.Y(p[2]), w = ctx.measureText(t).width, bb = [x, y - f, w, f * 2]; if (x + w > V.w - 4 || boxes.some(b => hit(b, bb))) return; boxes.push(bb);
      label(ctx, t, x + w / 2, y, f, false, "#222"); });
    // proprietatea
    const cx = V.X(0), cy = V.Y(0);
    ctx.beginPath(); ctx.arc(cx, cy, 15 * px, 0, 2 * Math.PI); ctx.fillStyle = "rgba(217,35,60,.18)"; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, 7.5 * px, 0, 2 * Math.PI); ctx.fillStyle = "#d9233c"; ctx.fill(); ctx.lineWidth = 2.6 * px; ctx.strokeStyle = "#fff"; ctx.stroke();
    // data imaginii \u0219i, c\u00e2nd imaginea detaliat\u0103 e veche, inser\u021bia cu imaginea recent\u0103
    if (pe) {
      const m = S.meta, f = 10.5 * px, t = (base === "recent" ? "Sentinel-2 \u00b7 " : "Satelit \u00b7 ") + (m.data || "dat\u0103 necunoscut\u0103") + (m.rez_m ? ` \u00b7 ${String(m.rez_m).replace(".", ",")} m/pixel` : "");
      ctx.font = `600 ${f}px "Instrument Sans", sans-serif`; const tw = ctx.measureText(t).width, vechi = base === "detaliu" && m.vechi;
      ctx.fillStyle = "rgba(20,22,30,.78)"; ctx.fillRect(10 * px, 10 * px, tw + 16 * px + (vechi ? 132 * px : 0), f * 2.1);
      ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(t, 18 * px, 10 * px + f * 1.05);
      if (vechi) { ctx.fillStyle = "#fca5a5"; ctx.fillText("\u00b7 mai veche de 3 ani", 18 * px + tw + 8 * px, 10 * px + f * 1.05); }
      const R2 = CTX.sat.recent;
      if ((opt.inset || vechi) && base === "detaliu" && R2 && R2.img.complete && R2.img.naturalWidth && opt.inset !== false) {
        const w = Math.round(V.w * .26), x0 = V.w - w - 12 * px, y0 = V.h - w - 30 * px, Rr = R2.meta.raza, vv = Math.min(V.v, Rr), sc = R2.img.naturalWidth / (2 * Rr);
        const sx = (Rr - vv) * sc, sw = 2 * vv * sc;
        ctx.fillStyle = "#fff"; ctx.fillRect(x0 - 3 * px, y0 - 3 * px, w + 6 * px, w + 22 * px);
        ctx.drawImage(R2.img, sx, sx, sw, sw, x0, y0, w, w);
        ctx.beginPath(); ctx.arc(x0 + w / 2, y0 + w / 2, 4 * px, 0, 2 * Math.PI); ctx.fillStyle = "#d9233c"; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5 * px; ctx.stroke();
        ctx.fillStyle = "#1a1e2a"; ctx.font = `600 ${9.5 * px}px "Instrument Sans", sans-serif`; ctx.textAlign = "center"; ctx.fillText(`Acum: Sentinel-2, ${R2.meta.data}, 10 m`, x0 + w / 2, y0 + w + 10 * px);
      }
    }
    // nord \u0219i scar\u0103
    ctx.save(); ctx.translate(V.w - 26 * px, 28 * px); ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.beginPath(); ctx.arc(0, 0, 17 * px, 0, 2 * Math.PI); ctx.fill(); ctx.fillStyle = "#222"; ctx.beginPath(); ctx.moveTo(0, -12 * px); ctx.lineTo(5 * px, 4 * px); ctx.lineTo(0, 1 * px); ctx.lineTo(-5 * px, 4 * px); ctx.closePath(); ctx.fill(); ctx.font = `700 ${9 * px}px sans-serif`; ctx.textAlign = "center"; ctx.fillText("N", 0, 14 * px); ctx.restore();
    const sc = V.v > 1100 ? 500 : V.v > 600 ? 200 : 100, sw = sc * V.s, sx = 14 * px, sy = V.h - 16 * px;
    ctx.fillStyle = "rgba(255,255,255,.88)"; ctx.fillRect(sx - 6 * px, sy - 16 * px, sw + 52 * px, 24 * px); ctx.fillStyle = "#222"; ctx.fillRect(sx, sy - 2 * px, sw, 3 * px); ctx.fillRect(sx, sy - 7 * px, 1.5 * px, 8 * px); ctx.fillRect(sx + sw - 1.5 * px, sy - 7 * px, 1.5 * px, 8 * px);
    ctx.font = `600 ${10 * px}px "IBM Plex Mono", monospace`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(sc + " m", sx + sw + 6 * px, sy - 3 * px);
    cnv._hits = hits; cnv._V = V;
    return hits;
  }
  const len = a => { let L = 0; for (let i = 4; i < a.length; i += 2) L += Math.hypot(a[i] - a[i - 2], a[i + 1] - a[i - 1]); return L; };
  function mid(a) { const tot = len(a); let acc = 0; for (let i = 4; i < a.length; i += 2) { const d = Math.hypot(a[i] - a[i - 2], a[i + 1] - a[i - 1]); if (acc + d >= tot / 2) { const t = (tot / 2 - acc) / (d || 1); return { x: a[i - 2] + (a[i] - a[i - 2]) * t, y: a[i - 1] + (a[i + 1] - a[i - 1]) * t, x1: a[i - 2], y1: a[i - 1], x2: a[i], y2: a[i + 1] }; } acc += d; } return { x: a[2], y: a[3], x1: a[2], y1: a[3], x2: a[4], y2: a[5] }; }
  const hit = (a, b) => a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];
  function label(ctx, t, x, y, f, bold, col) { ctx.font = `${bold ? 700 : 600} ${f}px "Instrument Sans", sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineWidth = f * .34; ctx.strokeStyle = "rgba(255,255,255,.93)"; ctx.strokeText(t, x, y); ctx.fillStyle = col; ctx.fillText(t, x, y); }

  /* ---------- legenda ---------- */
  function legend(preset, H) {
    const sw = (c, t, sq) => `<span class="lg"><i style="background:${c};${sq ? "border-radius:50%" : ""}"></i>${esc(t)}</span>`;
    const out = [];
    if (preset.bld === "seism") out.push(sw(SEIS.rosu, "bloc P+3 sau mai mare, construit \u00eenainte de 1978"), sw(SEIS.portocaliu, "bloc P+3 sau mai mare, an necunoscut"), sw(SEIS.verde, "bloc P+3 sau mai mare, din 1978 sau mai nou"), sw("#e9b4a6", "bloc cu niveluri necunoscute"), sw("#9db7d8", "cl\u0103dire public\u0103"));
    else if (preset.bld === "class") BL_ORD.filter(c => !preset.only || preset.only.includes(c)).forEach(c => { if (H.comp.cladiri[c] > 0 || H.cl.some(a => a[0] === c)) out.push(sw(BL[c], BL_N[c])); });
    else if (preset.comFocus) out.push(sw(LU.com, "zon\u0103 comercial\u0103 (OSM)"), sw(LU.ind, "zon\u0103 industrial\u0103 (OSM)"));
    if (preset.lu === 1) ["res", "com", "ind", "grn", "apa"].forEach(z => { if (H.lu.some(a => a[0] === z) && !(preset.bld === "class" && ["res"].includes(z))) out.push(sw(LU[z], LU_N[z])); });
    (preset.poi || []).forEach(c => { if (H.poi.some(p => p[0] === c)) out.push(sw(PC[c], PN[c], 1)); });
    if (preset.rings) out.push(H && H.iso ? `<span class="lg"><i style="border:2px solid #0f9d58;background:rgba(15,157,88,.12);border-radius:8px"></i>5 min pe jos</span><span class="lg"><i style="border:2px dashed #f29900;background:rgba(242,153,0,.08);border-radius:8px"></i>10 min</span><span class="lg"><i style="border:2px dotted #7b3fe4;background:rgba(123,63,228,.06);border-radius:8px"></i>15 min, pe str\u0103zile reale</span>`
      : `<span class="lg"><i style="border:1.5px dashed #333;background:none;border-radius:50%"></i>5 / 10 / 15 minute pe jos, \u00een linie dreapt\u0103</span>`);
    if (preset.relief) out.push(`<span class="lg"><i style="border:2px solid #ffb300;background:rgba(255,179,0,.25);border-radius:8px"></i>p\u00e2n\u0103 unde ajungi pe jos, dup\u0103 relief (func\u021bia Tobler)</span>`, `<span class="lg"><i style="border:1.5px dashed #333;background:none;border-radius:50%"></i>acela\u0219i timp pe teren plat (900 m)</span>`, sw("#8d6e63", "teren care urc\u0103 la 150 m", 1), sw("#4c9f38", "teren care coboar\u0103 la 150 m", 1), sw("#9a9a9a", "practic plat (sub 0,4 m)", 1));
    if (preset.prot) out.push(`<span class="lg"><i style="border:1.5px dashed #8e24aa;background:rgba(142,36,170,.15);border-radius:50%"></i>zon\u0103 de protec\u021bie de ${preset.prot} m</span>`);
    if (preset.util) out.push(`<span class="lg"><i style="border-top:2px dotted #e07b00;background:none;height:0"></i>linie electric\u0103 (OSM)</span>`);
    if (preset.roads !== "off") out.push(`<span class="lg"><i style="background:${RD[0][0]}"></i>drum principal</span>`, `<span class="lg"><i style="background:${RD[1][0]}"></i>drum secundar</span>`);
    if (preset.rail || preset.roads === "all") out.push(`<span class="lg"><i style="background:repeating-linear-gradient(90deg,#555 0 5px,#fff 5px 9px);height:4px"></i>cale ferat\u0103</span>`);
    if (preset.rail) out.push(`<span class="lg"><i style="border-top:2px dotted #b5338a;background:none;height:0"></i>tramvai</span>`);
    if (preset.aut) [[1, "1\u20132"], [3, "3\u20135"], [6, "6\u201310"], [11, "11 sau mai multe"]].forEach(([n, t]) => out.push(`<span class="lg"><i style="background:${AUTC(n)};height:5px"></i>${t} autoriza\u021bii pe strad\u0103</span>`));
    out.push(`<span class="lg"><i style="background:#d9233c;border:2px solid #fff;box-shadow:0 0 0 1px #d9233c;border-radius:50%"></i>proprietatea</span>`);
    const at = [CTX.sat.detaliu && `satelit ${CTX.sat.detaliu.meta.atribuire} (${CTX.sat.detaliu.meta.data || "?"})`, CTX.sat.recent && `${CTX.sat.recent.meta.atribuire} (${CTX.sat.recent.meta.data})`].filter(Boolean);
    if (at.length) out.push(`<span class="lg" style="opacity:.8">\u00a9 OpenStreetMap \u00b7 ${esc(at.join(" \u00b7 "))}</span>`);
    return out.join("");
  }
  const BL_ORD = ["b", "c", "r", "k", "i", "p", "a", "o"];

  /* ---------- hart\u0103 interactiv\u0103 ---------- */
  function mount(el, H, name, opt) {
    opt = opt || {}; const preset = P[name]; if (!preset) return;
    const off = { poi: {} }, wrap = document.createElement("div"); wrap.className = "hm";
    wrap.innerHTML = `<div class="hm-t">${esc(opt.titlu || preset.titlu)}</div><div class="hm-box"><canvas class="hm-c" role="img" aria-label="${esc(preset.titlu)}"></canvas><div class="hm-tip" hidden></div></div><div class="hm-ch"></div><div class="hm-lg"></div><div class="hm-src">${esc(H.sursa)} ${esc(H.nota)}</div>`;
    el.appendChild(wrap);
    const cnv = wrap.querySelector("canvas"), tip = wrap.querySelector(".hm-tip"), chips = wrap.querySelector(".hm-ch"), lg = wrap.querySelector(".hm-lg");
    let base = preset.base || (CTX.sat.detaliu ? "detaliu" : "harta");
    const bases = [["harta", "Hart\u0103"], ...(CTX.sat.detaliu ? [["detaliu", `Satelit ${CTX.sat.detaliu.meta.data || ""}${CTX.sat.detaliu.meta.vechi ? " (veche)" : ""}`]] : []), ...(CTX.sat.recent ? [["recent", `Satelit recent ${CTX.sat.recent.meta.data}`]] : [])];
    const toggles = [...(preset.aut && CTX.aut ? [["aut", "Autoriza\u021bii", true]] : []), ["lu", "Zone", preset.lu !== "off"], ["cl", "Cl\u0103diri", preset.bld !== "off"], ["dr", "Drumuri", preset.roads !== "off"], ...(preset.rings ? [["rings", "Inele de mers pe jos", true]] : [])];
    const html = [];
    toggles.forEach(([k, t, on]) => { if (on) html.push(`<button type="button" class="hm-chip" aria-pressed="true" data-k="${k}">${t}</button>`); });
    (preset.poi || []).forEach(c => { if (H.poi.some(p => p[0] === c)) html.push(`<button type="button" class="hm-chip" aria-pressed="true" data-p="${c}"><i style="background:${PC[c]}"></i>${PN[c]}</button>`); });
    const aniAut = preset.aut && autOK() ? [["12", "ultimele 12 luni"], ...(CTX.aut.ani_lista || []).slice().reverse().map(y => [y, y]), ["toti", "to\u021bi anii"]] : [];
    chips.innerHTML = (aniAut.length ? `<span class="hm-base" role="group" aria-label="anul">${aniAut.map(([k, t]) => `<button type="button" class="hm-chip" data-an="${k}" aria-pressed="${k === AUT_AN}">${esc(t)}</button>`).join("")}</span><span style="width:8px"></span>` : "") + (bases.length > 1 ? `<span class="hm-base" role="group" aria-label="Fundal">${bases.map(([k, t]) => `<button type="button" class="hm-chip" data-b="${k}" aria-pressed="${k === base}">${esc(t)}</button>`).join("")}</span><span style="width:8px"></span>` : "") + html.join("");
    lg.innerHTML = legend(preset, H);
    let hits = [];
    const redraw = () => { const r = cnv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2); if (!r.width) return; cnv.width = Math.round(r.width * d); cnv.height = Math.round(r.width * d * (preset.h || 0.78)); cnv.style.height = Math.round(r.width * (preset.h || 0.78)) + "px"; hits = paint(cnv, H, preset, { off, base }); };
    chips.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.an) { AUT_AN = b.dataset.an; chips.querySelectorAll("[data-an]").forEach(x => x.setAttribute("aria-pressed", x.dataset.an === AUT_AN)); redraw(); return; }
      if (b.dataset.b) { base = b.dataset.b; chips.querySelectorAll("[data-b]").forEach(x => x.setAttribute("aria-pressed", x.dataset.b === base)); redraw(); return; }
      const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on);
      if (b.dataset.k) off[b.dataset.k] = !on; else off.poi[b.dataset.p] = !on; redraw(); });
    const find = e => { const r = cnv.getBoundingClientRect(), k = cnv.width / r.width, x = (e.clientX - r.left) * k, y = (e.clientY - r.top) * k; let best = null, bd = 1e9; hits.forEach(h => { const d = Math.hypot(h.x - x, h.y - y); if (d < h.r * 1.5 && d < bd) { bd = d; best = h; } }); return best && { h: best, px: (best.x / k), py: (best.y / k) }; };
    const show = e => { const f = find(e); if (!f) { tip.hidden = true; return; } const p = f.h.p, dist = Math.round(Math.hypot(p[1], p[2]));
      tip.innerHTML = `<b>${esc(p[3] || PN[p[0]])}</b><span>${esc(PN[p[0]])} \u00b7 ${nf(dist)} m \u00een linie dreapt\u0103 \u00b7 \u2248 ${Math.max(1, Math.round(dist / 80))} min pe jos</span>`; tip.hidden = false;
      const w = wrap.querySelector(".hm-box").clientWidth; tip.style.left = Math.min(Math.max(f.px - 90, 4), w - 190) + "px"; tip.style.top = Math.max(f.py - 62, 4) + "px"; };
    cnv.addEventListener("pointermove", show); cnv.addEventListener("click", show); cnv.addEventListener("pointerleave", () => { tip.hidden = true; });
    new ResizeObserver(redraw).observe(cnv); CTX.subs.add(redraw); redraw();
    return { redraw, canvas: cnv };
  }

  /* ---------- grafice SVG ---------- */
  function bars(rows, o) {
    o = o || {}; const W = 460, lw = o.lw || 150, rw = 74, rh = 25, H = rows.length * rh + 10, mx = o.max || Math.max(...rows.map(r => r.v), 1);
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(o.aria || "grafic")}" style="display:block">`;
    rows.forEach((r, i) => { const y = 5 + i * rh, w = Math.max(2, (W - lw - rw) * r.v / mx);
      s += `<text x="${lw - 8}" y="${y + 15}" text-anchor="end" font-size="12.5" fill="var(--fg)" font-weight="${r.hi ? 700 : 400}" style="font-family:var(--font)">${esc(r.label.length > Math.floor(lw / 6.4) ? r.label.slice(0, Math.floor(lw / 6.4) - 1) + "\u2026" : r.label)}</text>` +
        `<rect x="${lw}" y="${y + 6}" width="${W - lw - rw}" height="9" rx="4.5" fill="var(--fg)" opacity=".06"/><rect x="${lw}" y="${y + 6}" width="${w}" height="9" rx="4.5" fill="${r.color || o.color || "var(--accent)"}" opacity="${r.hi === false ? .45 : 1}"/>` +
        `<text x="${lw + w + 8}" y="${y + 15}" font-size="12" font-weight="700" fill="var(--fg)" style="font-family:var(--mono)">${esc(r.txt != null ? (String(r.txt).length > 26 ? String(r.txt).slice(0, 25) + "\u2026" : r.txt) : nf(r.v))}</text>`; });
    return s + "</svg>";
  }
  /* grafic pereche: pentru fiecare destina\u021bie, dou\u0103 bare sub\u021biri (ma\u0219in\u0103 \u0219i pe jos), cu pictograme */
  /* traseele spre destinatii, jucaus (Manu, 23.10): un drum subtire pentru fiecare destinatie; masinuta sta la minutele cu masina,
     omuletul la minutele pe jos, pe aceeasi scara de minute; casa la stanga, steguletul destinatiei la dreapta */
  function trasee(rows, o) {
    o = o || {}; const W = 640, L = 150, R = 54, rh = 66, H = rows.length * rh + 34, mx = Math.max(...rows.map(r => r.b || 0), ...rows.map(r => r.a || 0), 1), X = m => L + (W - L - R) * Math.min(m, mx) / mx;
    const car = (x, y, c) => `<g transform="translate(${x.toFixed(1)},${y})"><path d="M-13 2v-5q0-2 2-3l3-5q1-2 4-2h8q3 0 4 2l3 5q2 1 2 3v5z" fill="${c}"/><path d="M-6 -9h4v-4h-1q-2 0-3 4zM1 -9h5q-1-4-3-4h-2z" fill="#fff" opacity=".85"/><circle cx="-7" cy="3" r="3.2" fill="#1a1a1a"/><circle cx="7" cy="3" r="3.2" fill="#1a1a1a"/><circle cx="-7" cy="3" r="1.2" fill="#ddd"/><circle cx="7" cy="3" r="1.2" fill="#ddd"/></g>`;
    const om = (x, y, c) => `<g transform="translate(${x.toFixed(1)},${y})" stroke="${c}" stroke-width="2.6" stroke-linecap="round" fill="none"><circle cx="1" cy="-17" r="3.6" fill="${c}" stroke="none"/><path d="M1 -12l-1 9M0 -3l-5 8M0 -3l5 7M0 -10l-6 4M0 -10l6 3"/></g>`;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(o.aria || "minute p\u00e2n\u0103 la destina\u021bii")}" style="display:block">`;
    for (let m = 0; m <= mx; m += mx > 90 ? 30 : mx > 40 ? 15 : 10) s += `<line x1="${X(m)}" x2="${X(m)}" y1="16" y2="${H - 8}" stroke="var(--line)" stroke-dasharray="2 4"/><text x="${X(m)}" y="11" font-size="10" text-anchor="middle" fill="var(--muted)" style="font-family:var(--mono)">${m} min</text>`;
    rows.forEach((r, i) => { const y = 34 + i * rh, ya = y + 16;
      s += `<text x="${L - 34}" y="${ya - 2}" text-anchor="end" font-size="13" font-weight="700" fill="var(--fg)" style="font-family:var(--font)">${esc(r.label.length > 18 ? r.label.slice(0, 17) + "\u2026" : r.label)}</text>`;
      s += `<g transform="translate(${L - 20},${ya + 2})"><path d="M-9 0v-9l9-7 9 7v9z" fill="#c86a0a"/><rect x="-3" y="-6" width="6" height="6" fill="#fff"/></g>`;
      s += `<path d="M${L} ${ya + 3}H${W - R + 8}" stroke="#cfd5dd" stroke-width="7" stroke-linecap="round"/><path d="M${L} ${ya + 3}H${W - R + 8}" stroke="#fff" stroke-width="1" stroke-dasharray="6 6"/>`;
      s += `<g transform="translate(${W - R + 14},${ya + 4})"><path d="M0 0v-24" stroke="#1a1a1a" stroke-width="1.6"/><path d="M0 -24h13l-4 4 4 4h-13z" fill="#d6342c"/></g>`;
      if (r.a != null) s += car(X(r.a), ya - 4, o.ca || "#2f6fd6") + `<text x="${X(r.a).toFixed(1)}" y="${ya - 18}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${o.ca || "#2f6fd6"}" style="font-family:var(--font)">${esc(r.ta)}</text>`;
      if (r.b != null) s += om(X(r.b), ya + 24, o.cb || "#e8870a") + `<text x="${X(r.b).toFixed(1)}" y="${ya + 40}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${o.cb || "#e8870a"}" style="font-family:var(--font)">${esc(r.tb)}</text>`; });
    return s + "</svg>";
  }
  function duo(rows, o) {
    o = o || {}; const W = 460, lw = o.lw || 120, rw = 62, rh = 40, H = rows.length * rh + 22, mx = o.max || Math.max(...rows.flatMap(r => [r.a, r.b]), 1), cA = o.ca || "#1d4ed8", cB = o.cb || "#f59e0b";
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(o.aria || "minute p\u00e2n\u0103 la destina\u021bii")}" style="display:block">`;
    s += `<text x="${lw}" y="11" font-size="10.5" fill="${cA}" font-weight="700" style="font-family:var(--font)">\u25cf ${esc(o.la || "ma\u0219in\u0103")}</text><text x="${lw + (o.dx || 70)}" y="11" font-size="10.5" fill="${cB}" font-weight="700" style="font-family:var(--font)">\u25cf ${esc(o.lb || "pe jos")}</text>`;
    rows.forEach((r, i) => { const y = 20 + i * rh, wa = Math.max(3, (W - lw - rw) * r.a / mx), wb = Math.max(3, (W - lw - rw) * r.b / mx);
      s += `<text x="${lw - 10}" y="${y + 17}" text-anchor="end" font-size="12.5" font-weight="600" fill="var(--fg)" style="font-family:var(--font)">${esc(r.label.length > 19 ? r.label.slice(0, 18) + "\u2026" : r.label)}</text>` +
        `<rect x="${lw}" y="${y + 4}" width="${W - lw - rw}" height="10" rx="5" fill="var(--fg)" opacity=".05"/><rect x="${lw}" y="${y + 4}" width="${wa}" height="10" rx="5" fill="${cA}"/><text x="${lw + wa + 7}" y="${y + 13}" font-size="11.5" font-weight="700" fill="${cA}" style="font-family:var(--mono)">${esc(r.ta)}</text>` +
        `<rect x="${lw}" y="${y + 18}" width="${W - lw - rw}" height="10" rx="5" fill="var(--fg)" opacity=".05"/><rect x="${lw}" y="${y + 18}" width="${wb}" height="10" rx="5" fill="${cB}"/><text x="${lw + wb + 7}" y="${y + 27}" font-size="11.5" font-weight="700" fill="${cB}" style="font-family:var(--mono)">${esc(r.tb)}</text>`; });
    return s + "</svg>";
  }
  /* blocul de relief 3D: p\u0103tratul de 1,5 km ca un paralelipiped v\u0103zut din sud-vest, suprafa\u021ba ridicat\u0103 dup\u0103 altitudine (exagerat\u0103),
     cu p\u0103tratul de 300 m (150 m \u00een fiecare direc\u021bie) conturat pe suprafa\u021b\u0103. B = { n, pas, z: r\u00e2nduri de la nord la sud, metri fa\u021b\u0103 de proprietate } */
  function bloc(B, o) {
    o = o || {}; let n = B.n; const L = (n - 1) * B.pas / 2, B0 = B;   // B0: datele brute, pentru cifrele de la 150 m (acelea\u0219i ca \u00een card)
    let z = B.z.slice();
    for (let k = 0; k < 2; k++) z = z.map((v, q) => { const j = Math.floor(q / n), i = q % n; let s = 0, c = 0;    // netezire u\u0219oar\u0103: DEM-ul are pas de 1 m pe vertical\u0103
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const jj = j + dj, ii = i + di; if (jj >= 0 && jj < n && ii >= 0 && ii < n) { s += z[jj * n + ii]; c++; } } return s / c; });
    { const m = 2 * n - 1, u = new Array(m * m);                         // dubl\u0103m rezolu\u021bia (interpolare biliniar\u0103): suprafa\u021b\u0103 mai fin\u0103
      for (let j = 0; j < m; j++) for (let i = 0; i < m; i++) { const i0 = i >> 1, j0 = j >> 1, i1 = Math.min(i0 + (i & 1), n - 1), j1 = Math.min(j0 + (j & 1), n - 1);
        u[j * m + i] = (z[j0 * n + i0] + z[j0 * n + i1] + z[j1 * n + i0] + z[j1 * n + i1]) / 4; }
      z = u; B = { ...B, n: m, pas: B.pas / 2 }; n = m; }
    const n2 = B.n; const Z = (i, j) => z[j * n2 + i], zmin = Math.min(...z), zmax = Math.max(...z), rg = Math.max(zmax - zmin, 0.5);
    const E = Math.max(1, Math.min(25, Math.round(0.07 * 2 * L / rg))), W = 560, c = Math.cos(Math.PI / 6), sn = Math.sin(Math.PI / 6), k = (W - 40) / (4 * L * c);
    const top = 14, base = zmin - Math.max(rg * 0.7, 2), Hh = Math.round(top + 4 * L * sn * k + (zmax - base) * E * k + 34);
    const P = (x, y, h) => [W / 2 + (x - y) * c * k, top + (4 * L - (x + y)) * sn * k - (h - zmax) * E * k];   // x spre est, y spre nord, de la col\u021bul SV
    const X = i => i * B.pas, Y = j => (n - 1 - j) * B.pas;
    const col = h => { const t = (h - zmin) / rg, a = [[0, [86, 160, 102]], [.5, [196, 186, 112]], [1, [156, 104, 72]]];
      let q = 0; while (q < a.length - 2 && t > a[q + 1][0]) q++; const [t0, c0] = a[q], [t1, c1] = a[q + 1], u = Math.max(0, Math.min(1, (t - t0) / (t1 - t0)));
      return c0.map((v, m) => v + (c1[m] - v) * u); };
    const f = p => p.map(v => v.toFixed(1)).join(",");
    let s = `<svg viewBox="0 0 ${W} ${Hh}" width="100%" role="img" aria-label="${esc(o.aria || "blocul de relief 3D, 1,5 \u00d7 1,5 km")}" style="display:block"><defs><marker id="bn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--fg)"/></marker></defs>`;
    // pere\u021bii din fa\u021b\u0103 (sud \u0219i vest), ca un paralelipiped
    const ws = [], ww = [];
    for (let i = 0; i < n; i++) ws.push(P(X(i), 0, Z(i, n - 1)));
    for (let j = n - 1; j >= 0; j--) ww.push(P(0, Y(j), Z(0, j)));
    s += `<polygon points="${[...ws, P(X(n - 1), 0, base), P(0, 0, base)].map(f).join(" ")}" fill="#8a7a66"/>`;
    s += `<polygon points="${[...ww.reverse(), P(0, 0, base), P(0, Y(0), base)].map(f).join(" ")}" fill="#a8977f"/>`;
    // straturi pe pere\u021bi (benzi orizontale, ca \u00eentr-o sec\u021biune geologic\u0103)
    [0.33, 0.66].forEach(t => { const h = base + (zmin - base) * t; s += `<polyline points="${[P(0, Y(0), h), P(0, 0, h), P(X(n - 1), 0, h)].map(f).join(" ")}" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1"/>`; });
    // suprafa\u021ba: celule desenate din spate \u00een fa\u021b\u0103, umbrite dup\u0103 pant\u0103 (lumin\u0103 din nord-vest)
    const cells = [];
    for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) cells.push([i, j, X(i) + Y(j + 1)]);
    cells.sort((a, b) => b[2] - a[2]);
    cells.forEach(([i, j]) => { const a = Z(i, j), b = Z(i + 1, j), d = Z(i, j + 1), e = Z(i + 1, j + 1), m = (a + b + d + e) / 4;
      const gx = ((b + e) - (a + d)) / 2 / B.pas * E, gy = ((a + b) - (d + e)) / 2 / B.pas * E, sh = Math.max(.72, Math.min(1.18, 1 + (-gx * .7 + gy * .7) * 1.6));
      const cc = col(m).map(v => Math.round(Math.min(255, v * sh)));
      const pts = [P(X(i), Y(j), a), P(X(i + 1), Y(j), b), P(X(i + 1), Y(j + 1), e), P(X(i), Y(j + 1), d)];
      s += `<polygon points="${pts.map(f).join(" ")}" fill="rgb(${cc})" stroke="rgb(${cc})" stroke-width=".6"/>`; });
    // curbele de nivel la 1 m (doar marcate prin contur sub\u021bire pe muchia sudic\u0103 ar fi prea mult): p\u0103tratul de 300 m pe suprafa\u021b\u0103
    const ic = (n - 1) / 2, r = Math.round(150 / B.pas), sq = [];
    for (let i = ic - r; i <= ic + r; i++) sq.push([i, ic - r]); for (let j = ic - r; j <= ic + r; j++) sq.push([ic + r, j]);
    for (let i = ic + r; i >= ic - r; i--) sq.push([i, ic + r]); for (let j = ic + r; j >= ic - r; j--) sq.push([ic - r, j]);
    s += `<polygon points="${sq.map(([i, j]) => f(P(X(i), Y(j), Z(i, j)))).join(" ")}" fill="#ff3b5c" fill-opacity=".14" stroke="#ff3b5c" stroke-width="2"/>`;
    // diferen\u021bele la 150 m, pe cele 4 laturi
    const c0 = (B0.n - 1) / 2, r0 = Math.round(150 / B0.pas), Zb = (i, j) => B0.z[j * B0.n + i], H0 = { N: Zb(c0, c0 - r0), E: Zb(c0 + r0, c0), S: Zb(c0, c0 + r0), V: Zb(c0 - r0, c0) };
    [["N", ic, ic - r, -1, -1], ["E", ic + r, ic, 1, -1], ["S", ic, ic + r, 1, 1], ["V", ic - r, ic, -1, 1]].forEach(([t, i, j, ox, oy]) => { const h = H0[t] - Zb(c0, c0), [px, py] = P(X(i), Y(j), Z(i, j)), tx = px + ox * 22, ty = py + oy * 16 + 4;
      s += `<line x1="${px}" y1="${py}" x2="${tx - ox * 4}" y2="${ty - 4}" stroke="#1a1a1a" stroke-width=".8" opacity=".5"/><circle cx="${px}" cy="${py}" r="3.2" fill="#fff" stroke="#ff3b5c" stroke-width="1.6"/><text x="${tx}" y="${ty}" text-anchor="${ox < 0 ? "end" : "start"}" font-size="15" font-weight="700" fill="#1a1a1a" stroke="#fff" stroke-width="3" paint-order="stroke" style="font-family:var(--mono)">${t} ${Math.abs(h) < 0.05 ? "\u00b1" : h > 0 ? "+" : "\u2212"}${Math.abs(h).toFixed(1).replace(".", ",")} m</text>`; });
    // proprietatea: \u021b\u0103ru\u0219
    const [cx, cy] = P(X(ic), Y(ic), Z(ic, ic));
    s += `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 44}" stroke="#1a1a1a" stroke-width="1.6"/><circle cx="${cx}" cy="${cy - 48}" r="6.5" fill="#ff3b5c" stroke="#fff" stroke-width="2"/><ellipse cx="${cx}" cy="${cy}" rx="5" ry="2.4" fill="#1a1a1a" opacity=".5"/>`;
    // nordul, scara \u0219i exagerarea
    { const a1 = 70, b1 = 64, a2 = a1 - 34 * c, b2 = b1 - 34 * sn; s += `<line x1="${a1}" y1="${b1}" x2="${a2}" y2="${b2}" stroke="var(--fg)" stroke-width="1.4" marker-end="url(#bn)"/><text x="${a2 - 6}" y="${b2 - 2}" text-anchor="end" font-size="12" font-weight="700" fill="var(--fg)" style="font-family:var(--font)">N</text>`; }
    s += `<text x="16" y="${Hh - 12}" font-size="13" fill="var(--muted)" style="font-family:var(--font)">1,5 \u00d7 1,5 km \u00b7 p\u0103tratul ro\u0219u: 300 \u00d7 300 m \u00b7 \u00een\u0103l\u021bimi exagerate de ${E}\u00d7 \u00b7 diferen\u021b\u0103 total\u0103 ${rg.toFixed(1).replace(".", ",")} m</text>`;
    return s + "</svg>";
  }
  /* izocronele cu ma\u0219ina (izocrone.py, Valhalla auto, f\u0103r\u0103 trafic): hart\u0103 SVG la scar\u0103 real\u0103 pe fundal stradal, 5 / 10 continuu, 15 punctat */
  function autoMap(H, base, o) {
    o = o || {}; const A = H && H.iso_auto, M = H && H.iso_auto_meta; if (!A || !M) return "";
    const S = 600, R = M.raza_fundal_m, sc = S / 2 / R, P = (x, y) => [S / 2 + x * sc, S / 2 - y * sc];
    const lin = a => { const n = a.length / 2, Q = i => P(a[(i % n) * 2], a[(i % n) * 2 + 1]); let m = Q(0).map((v, k) => (v + Q(1)[k]) / 2), d = `M${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
      for (let i = 1; i <= n; i++) { const p = Q(i), q = Q(i + 1); d += `Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${((p[0] + q[0]) / 2).toFixed(1)} ${((p[1] + q[1]) / 2).toFixed(1)}`; } return d + "Z"; };
    const ST = { "15": ["#7b3fe4", .05, "", 1.3], "10": ["#e8870a", .07, "", 1.3], "5": ["#0f9d58", .1, "", 1.4] };
    // fundal: harta plan OSM, luminoasa (Manu, 23.10); drumurile auto (A, DN, DJ, centuri, DC) colorate dupa zona de timp in care sunt
    const inP = (x, y, a) => { let c = false; for (let i = 0, j = a.length - 2; i < a.length; j = i, i += 2) { const xi = a[i], yi = a[i + 1], xj = a[j], yj = a[j + 1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
    const banda = (x, y) => (A["5"] && inP(x, y, A["5"])) ? "5" : (A["10"] && inP(x, y, A["10"])) ? "10" : (A["15"] && inP(x, y, A["15"])) ? "15" : null;
    const LW = { A: 2.6, N: 2.1, J: 1.6, C: 1.2, c: 1 };
    let s = `<svg viewBox="0 0 ${S} ${S}" width="100%" role="img" aria-label="unde ajungi cu ma\u0219ina \u00een 5, 10 \u0219i 15 minute" style="display:block;border-radius:10px">`;
    s += `<image href="${esc(base + (M.fundal_osm || M.fundal))}" x="0" y="0" width="${S}" height="${S}" preserveAspectRatio="none"${M.fundal_osm ? ` style="filter:saturate(.85) brightness(1.03)"` : ""}/>`;
    ["15", "10", "5"].forEach(m => { const a = A[m]; if (!a || a.length < 6) return; const [c, f] = ST[m]; s += `<path d="${lin(a)}" fill="${c}" fill-opacity="${f}" stroke="none"/>`; });
    if (H.drum_auto) { let g = ""; H.drum_auto.forEach(d => { const cls = d[0], p = d.slice(2); for (let i = 0; i + 3 < p.length; i += 2) { const mx = (p[i] + p[i + 2]) / 2, my = (p[i + 1] + p[i + 3]) / 2, b = banda(mx, my); if (!b) continue;
        const [x1, y1] = P(p[i], p[i + 1]), [x2, y2] = P(p[i + 2], p[i + 3]); g += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${ST[b][0]}" stroke-width="${LW[cls] || 1}"/>`; } });
      s += `<g stroke-linecap="round" opacity=".95">${g}</g>`; }
    ["15", "10", "5"].forEach(m => { const a = A[m]; if (!a || a.length < 6) return; const [c, , da, w] = ST[m];
      s += `<path d="${lin(a)}" fill="none" stroke="#fff" stroke-width="${w + 2}" stroke-opacity=".85"/><path d="${lin(a)}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" ${da ? `stroke-dasharray="${da}"` : ""}/>`; });
    ["15", "10", "5"].forEach(m => { const a = A[m]; if (!a) return; let ty = -1e9, tx = 0; for (let i = 0; i < a.length; i += 2) if (a[i + 1] > ty) { ty = a[i + 1]; tx = a[i]; }
      const [x, y] = P(tx, ty); s += `<text x="${x.toFixed(1)}" y="${(y - 6).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="${ST[m][0]}" stroke="#fff" stroke-width="3.5" paint-order="stroke" style="font-family:var(--font)">${m} min</text>`; });
    const km = R >= 5000 ? 5000 : 2000, lx = 16, ly = S - 18;
    s += `<rect x="${lx}" y="${ly - 4}" width="${km * sc}" height="5" fill="#1a1a1a"/><text x="${lx}" y="${ly - 9}" font-size="11" font-weight="700" fill="#1a1a1a" stroke="#fff" stroke-width="3" paint-order="stroke" style="font-family:var(--font)">${km / 1000} km</text>`;
    s += `<text x="${S - 14}" y="22" text-anchor="end" font-size="13" font-weight="800" fill="#1a1a1a" stroke="#fff" stroke-width="3" paint-order="stroke" style="font-family:var(--font)">N \u2191</text>`;
    s += `<circle cx="${S / 2}" cy="${S / 2}" r="8" fill="#ff3b5c" stroke="#fff" stroke-width="3"/></svg>`;
    const ar = M.aria_m2 || {}, sq = v => v != null ? nf(v / 1e6, 1).replace(".", ",") + " km\u00b2" : "\u2014";
    const lg = ["5", "10", "15"].map(m => `<span class="pzc" style="cursor:default"><b style="color:${ST[m][0]}">\u2501</b> ${m} min \u00b7 ${sq(ar[m])}</span>`).join("");
    return `<div class="pz"><div class="pzchips">${lg}</div>${s}<p class="nt">${esc(M.nota)} ${esc(M.sursa)}, ${esc(M.data)}.</p></div>`;
  }
  function donut(items, o) {
    o = o || {}; const tot = items.reduce((a, b) => a + b.v, 0) || 1, R = 72, r = o.pie ? 0 : 54, cx = 80, cy = 80; let a0 = -Math.PI / 2, s = `<svg viewBox="0 0 160 160" width="${o.size || 150}" height="${o.size || 150}" role="img" aria-label="${esc(o.aria || "compozi\u021bie")}">`;
    items.filter(i => i.v > 0).forEach(i => { const a1 = a0 + 2 * Math.PI * i.v / tot, big = a1 - a0 > Math.PI ? 1 : 0;
      if (i.v / tot > .9995) s += o.pie ? `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${i.color}"/>` : `<circle cx="${cx}" cy="${cy}" r="${(R + r) / 2}" fill="none" stroke="${i.color}" stroke-width="${R - r}"/>`;
      else s += `<path d="M${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)} A${R} ${R} 0 ${big} 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)} L${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} A${r} ${r} 0 ${big} 0 ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} Z" fill="${i.color}" stroke="var(--card, #fff)" stroke-width="2.5" stroke-linejoin="round"/>`; a0 = a1; });
    if (!o.pie) s += `<text x="${cx}" y="${cy - 1}" text-anchor="middle" font-size="16" font-weight="700" fill="var(--fg)" style="font-family:var(--mono)">${esc(o.centru || "")}</text><text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="9.5" fill="var(--muted)" style="font-family:var(--font)">${esc(o.centru2 || "")}</text></svg>`;
    const list = items.filter(i => i.v > 0).sort((a, b) => b.v - a.v).map(i => `<li><i style="background:${i.color}"></i><span>${esc(i.label)}</span><b>${nf(100 * i.v / tot, 0)}%</b></li>`).join("");
    return `<div class="dn"><div class="dn-t">${esc(o.titlu || "")}</div><div class="dn-b">${s}<ul>${list}</ul></div></div>`;
  }
  function stack(items, o) {
    o = o || {}; const tot = items.reduce((a, b) => a + b.v, 0) || 1, W = 460, G = 3, n = items.filter(i => i.v > 0).length; let x = 0, s = `<svg viewBox="0 0 ${W} 30" width="100%" role="img" aria-label="${esc(o.aria || "defalcare")}" style="display:block">`;
    items.filter(i => i.v > 0).forEach((i, k) => { const w = (W - G * (n - 1)) * i.v / tot; s += `<rect x="${x}" y="4" width="${Math.max(w, 2)}" height="22" rx="6" fill="${i.color}"/>`; if (w > 48) s += `<text x="${x + w / 2}" y="19.5" text-anchor="middle" font-size="11" fill="#fff" font-weight="700" style="font-family:var(--mono)">${nf(100 * i.v / tot, 0)}%</text>`; x += w + G; });
    s += "</svg>"; return s + `<ul class="sk">${items.map(i => `<li><i style="background:${i.color}"></i><span>${esc(i.label)}</span><b>${esc(i.txt != null ? i.txt : nf(i.v) + " lei")}</b></li>`).join("")}</ul>`;
  }
  function gauge(val, o) {
    o = o || {}; const lo = o.lo, hi = o.hi, W = 460, x = v => 20 + (W - 40) * (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo);
    let s = `<svg viewBox="0 0 ${W} ${o.prag != null ? 84 : 70}" width="100%" role="img" aria-label="${esc(o.aria || "scal\u0103")}" style="display:block">`;
    const st = o.stops || [];
    st.forEach(([a, b, c], k) => { s += `<rect x="${x(a) + (k ? 1.5 : 0)}" y="34" width="${Math.max(x(b) - x(a) - (k ? 1.5 : 0) - (k < st.length - 1 ? 1.5 : 0), 1)}" height="8" rx="4" fill="${c}"/>`; });
    (o.ticks || []).forEach(([v, t]) => { s += `<text x="${x(v)}" y="58" text-anchor="middle" font-size="10.5" fill="var(--muted)" style="font-family:var(--mono)">${esc(t)}</text>`; });
    if (o.prag != null) s += `<line x1="${x(o.prag)}" x2="${x(o.prag)}" y1="28" y2="48" stroke="var(--fg)" stroke-width="1.2" stroke-dasharray="2 2"/><text x="${x(o.prag)}" y="78" text-anchor="middle" font-size="10.5" fill="var(--fg)" font-weight="600" style="font-family:var(--font)">${esc(o.pragTxt || "prag")}</text>`;
    const vx = x(val), tx = esc(o.valTxt || val), tw = String(o.valTxt || val).length * 7.4 + 14, bx = Math.max(2, Math.min(W - tw - 2, vx - tw / 2));
    s += `<rect x="${bx}" y="2" width="${tw}" height="20" rx="10" fill="var(--fg)"/><text x="${bx + tw / 2}" y="16" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--bg, #fff)" style="font-family:var(--mono)">${tx}</text>`;
    s += `<circle cx="${vx}" cy="38" r="8" fill="#fff" stroke="var(--fg)" stroke-width="3"/></svg>`; return s;
  }
  function regMap(loc, o) {
    o = o || {}; const pts = loc.filter(l => l.coord); if (pts.length < 2) return "";
    const bb = o.img && o.bb;      // cu fundal: harta acoper\u0103 exact dreptunghiul imaginii (aceea\u0219i corec\u021bie cos(lat) ca teritoriu.py)
    const W = bb ? 560 : 460, la = pts.map(p => p.coord[0]), lo = pts.map(p => p.coord[1]), mnla = bb ? bb[1] : Math.min(...la), mxla = bb ? bb[3] : Math.max(...la), mnlo = bb ? bb[0] : Math.min(...lo), mxlo = bb ? bb[2] : Math.max(...lo), k = Math.cos((mnla + mxla) / 2 * RAD);
    const Hh = bb ? Math.round(W * (mxla - mnla) / ((mxlo - mnlo) * k)) : 260;
    const sx = bb ? W / ((mxlo - mnlo) * k) : (W - 130) / ((mxlo - mnlo) * k || 1), sy = bb ? Hh / (mxla - mnla) : (Hh - 60) / ((mxla - mnla) || 1), sc = Math.min(sx, sy), ox = bb ? 0 : 65 + ((W - 130) - (mxlo - mnlo) * k * sc) / 2, oy = bb ? 0 : 30 + ((Hh - 60) - (mxla - mnla) * sc) / 2;
    const X = v => ox + (v - mnlo) * k * sc, Y = v => oy + (mxla - v) * sc;
    let s = `<svg viewBox="0 0 ${W} ${Hh}" width="100%" role="img" aria-label="${esc(o.aria || "harta localit\u0103\u021bilor urbane din jude\u021b, colorate dup\u0103 ag")}" style="display:block"><rect x="0" y="0" width="${W}" height="${Hh}" rx="8" fill="${BG}"/>${bb ? `<image href="${esc(o.img)}" x="0" y="0" width="${W}" height="${Hh}" preserveAspectRatio="none"/><rect width="${W}" height="${Hh}" fill="#fff" opacity=".18"/>` : ""}`;
    const placed = [];
    pts.slice().sort((a, b) => b.ag - a.ag).forEach(p => { const x = X(p.coord[1]), y = Y(p.coord[0]), c = AGC[p.ag.toFixed(2) * 1] || "#999", r = 6.5 + (p.ag - .1) * 22;
      s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${p.ref ? "#111" : "#fff"}" stroke-width="${p.ref ? 2.4 : 1.4}" opacity=".96"/>`;
      const w = p.loc.length * 5.6, cand = [[x, y - r - 5, "middle"], [x, y + r + 12, "middle"], [x + r + 4, y + 3.5, "start"], [x - r - 4, y + 3.5, "end"]];
      const box = ([tx, ty, a]) => [a === "middle" ? tx - w / 2 : a === "start" ? tx : tx - w, ty - 10, w, 13];
      const ok = cand.find(c2 => { const b = box(c2); return b[0] > 0 && b[0] + b[2] < W && b[1] > 0 && b[1] + b[3] < Hh && !placed.some(q => b[0] < q[0] + q[2] && b[0] + b[2] > q[0] && b[1] < q[1] + q[3] && b[1] + b[3] > q[1]); }) || cand[0];
      placed.push(box(ok));
      s += `<text x="${ok[0]}" y="${ok[1]}" text-anchor="${ok[2]}" font-size="10.5" fill="#222" font-weight="${p.ref ? 700 : 400}" stroke="${BG}" stroke-width="3" paint-order="stroke" style="font-family:var(--font)">${esc(p.loc)} ${p.ag.toFixed(2).replace(".", ",")}</text>`; });
    if (o.punct) s += `<circle cx="${X(o.punct[1])}" cy="${Y(o.punct[0])}" r="9" fill="none" stroke="#d9233c" stroke-width="2.2"/><circle cx="${X(o.punct[1])}" cy="${Y(o.punct[0])}" r="3.2" fill="#d9233c"/>`;
    return s + `</svg>`;
  }
  /* hart\u0103 a epicentrelor: puncte [x_km, y_km, magnitudine, an] fa\u021b\u0103 de proprietate, \u00een 100 km */
  function epiMap(pts, o) {
    o = o || {}; const W = 460, Hh = 300, cx = W / 2, cy = Hh / 2 + 4, R = 100, sc = (Hh / 2 - 14) / R;
    const col = m => m >= 5 ? "#c62828" : m >= 4 ? "#ef6c00" : m >= 3 ? "#f2b705" : "#7a8aa6";
    let s = `<svg viewBox="0 0 ${W} ${Hh}" width="100%" role="img" aria-label="${esc(o.aria || "epicentrele cutremurelor din 100 km")}" style="display:block"><rect x="0" y="0" width="${W}" height="${Hh}" rx="8" fill="${BG}"/>`;
    [25, 50, 100].forEach(r => { s += `<circle cx="${cx}" cy="${cy}" r="${r * sc}" fill="none" stroke="#9a948a" stroke-width="1" stroke-dasharray="4 4"/><text x="${cx + r * sc * 0.72 + 3}" y="${cy - r * sc * 0.72 - 3}" font-size="10" fill="#555" style="font-family:var(--mono)">${r} km</text>`; });
    pts.slice().sort((a, b) => a[2] - b[2]).forEach(p => { const x = cx + p[0] * sc, y = cy - p[1] * sc, r = 1.6 + Math.max(p[2] - 2, 0) * 2.6;
      s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${col(p[2])}" fill-opacity=".62" stroke="${col(p[2])}" stroke-width=".8"/>`; });
    pts.filter(p => p[2] >= 5).slice(0, 4).forEach(p => { const x = cx + p[0] * sc, y = cy - p[1] * sc;
      s += `<text x="${x + 8}" y="${y + 3}" font-size="10" font-weight="700" fill="#222" stroke="${BG}" stroke-width="3" paint-order="stroke" style="font-family:var(--font)">${String(p[2]).replace(".", ",")} \u00b7 ${p[3]}</text>`; });
    s += `<circle cx="${cx}" cy="${cy}" r="7" fill="#d9233c" stroke="#fff" stroke-width="2.2"/>`;
    [["\u2265 5", "#c62828"], ["4\u20134,9", "#ef6c00"], ["3\u20133,9", "#f2b705"], ["2,5\u20132,9", "#7a8aa6"]].forEach(([t, c], i) => { s += `<circle cx="${14}" cy="${Hh - 16 - i * 15}" r="4.5" fill="${c}" fill-opacity=".7"/><text x="24" y="${Hh - 12 - i * 15}" font-size="10" fill="#333" style="font-family:var(--font)">${t}</text>`; });
    return s + `<text x="${W - 8}" y="14" text-anchor="end" font-size="10" fill="#555" style="font-family:var(--font)">N \u2191</text></svg>`;
  }
  window.HM = { P, paint, legend, mount, setContext, CTX, AUTC, bars, donut, stack, gauge, regMap, epiMap, duo, trasee, bloc, autoMap, nf, esc, colors: { LU, BL, PC, AGC, SEIS, LU_N, BL_N, PN } };
})();
