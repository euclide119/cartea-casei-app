/* Raport _ Cartea Casei - \u201epre\u021bul de pia\u021b\u0103 \u00een timp\u201d, \u00een stilul raportului carVertical (Manu, 23.10.2026):
   bara cu pre\u021bul mic / median / mare, criteriile, graficul pe ani cu linia pre\u021bului estimat, benzile Bollinger (medie mobil\u0103 3 ani \u00b1 2 abateri standard),
   zona \u201epre\u021buri din trecut\u201d, linia \u201eazi\u201d, conul de scenarii p\u00e2n\u0103 \u00een 2033 \u0219i, la mouse (sau deget), fi\u0219a cu cifrele anului.
   Date: window.__EV (evaluare.js: fi\u0219a S, comparabilele C, anun\u021burile P, seriile H). Seria e estimare (E): puncte Timi\u0219oara (apartamente) + indicele na\u021bional Eurostat.
   Intr\u0103 \u00een #evaluare, dup\u0103 fi\u0219a propriet\u0103\u021bii. Nu e evaluare ANEVAR. */
(function () {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = v => v == null || !isFinite(v) ? "\u2014" : Number(Math.round(v)).toLocaleString("ro-RO");
  const eur = v => v == null || !isFinite(v) ? "\u2014" : nf(Math.round(v / 500) * 500) + " \u20ac";
  const k = v => (v >= 1e6 ? (v / 1e6).toFixed(2).replace(".", ",") + " mil" : Math.round(v / 1000) + " K");
  const pc = v => (v >= 0 ? "+" : "") + (v * 100).toFixed(1).replace(".", ",") + "%";
  const ANI_PROIECTIE = 7, AZI = new Date().getFullYear();
  let sig = null;

  function css() {
    if (document.getElementById("pp-css")) return;
    const s = document.createElement("style"); s.id = "pp-css";
    s.textContent = `
#pret-piata{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px 20px;display:flex;flex-direction:column;gap:14px;break-inside:avoid;text-transform:none}
#pret-piata h3{font:800 20px var(--font);margin:0;letter-spacing:-.01em}
#pret-piata .pp-s{font:13px/1.5 var(--font);color:var(--muted);margin:0}
#pret-piata .pp-bar{position:relative;padding:44px 0 8px}
#pret-piata .pp-l{position:absolute;top:0;transform:translateX(-50%);text-align:center;font:12.5px/1.3 var(--font);color:var(--muted);white-space:nowrap}
#pret-piata .pp-l b{display:block;font:700 14px var(--font);color:var(--fg)}
#pret-piata .pp-l.m{top:-6px}#pret-piata .pp-l.m b{background:#111;color:#fff;border-radius:6px;padding:4px 9px;margin-top:3px;font-size:15px}
#pret-piata .pp-l.st{transform:none}#pret-piata .pp-l.dr{transform:translateX(-100%)}
#pret-piata .pp-g{height:4px;border-radius:3px;background:linear-gradient(90deg,#e9c43a,#7cc36a 35%,#1f8a4c 50%,#7cc36a 65%,#e9c43a 80%,#d6342c)}
#pret-piata .pp-mk{position:absolute;bottom:3px;width:12px;height:12px;transform:translateX(-50%) rotate(45deg);border-radius:2px}
#pret-piata .pp-ce{position:absolute;bottom:-26px;transform:translateX(-50%);font:600 11.5px var(--font);background:#e7f5ea;color:#1f6b3a;border:1px solid #9fd3ae;border-radius:6px;padding:2px 7px;white-space:nowrap}
#pret-piata .pp-cr{display:flex;flex-wrap:wrap;gap:6px}
#pret-piata .pp-cr span{font:12px var(--font);background:var(--bg,#f4f4f2);border:1px solid var(--line);border-radius:6px;padding:3px 8px;color:var(--muted)}
#pret-piata .pp-cr b{color:var(--fg)}
#pret-piata .pp-ch{position:relative;border:1px solid var(--line);border-radius:10px;overflow:hidden;touch-action:pan-y}
#pret-piata .pp-ch svg{width:100%;height:auto;display:block}
#pret-piata .pp-tip{position:absolute;pointer-events:none;background:#fff;color:#111;border:1px solid #dcdcdc;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,.14);padding:8px 11px;font:12.5px/1.45 var(--font);min-width:170px;opacity:0;transition:opacity .12s}
#pret-piata .pp-tip b{font-size:15px}#pret-piata .pp-tip .d{color:#2f6fd6}#pret-piata .pp-tip .g{color:#666}
#pret-piata .pp-leg{display:flex;flex-wrap:wrap;gap:6px 18px;font:12.5px var(--font);color:var(--fg)}
#pret-piata .pp-leg i{display:inline-block;vertical-align:-2px;margin-right:6px}
#pret-piata .pp-inf{display:grid;gap:0;border:1px solid var(--line);border-radius:10px;overflow:hidden}
#pret-piata .pp-inf>div{padding:11px 14px;border-top:1px solid var(--line);font:13px/1.5 var(--font)}
#pret-piata .pp-inf>div:first-child{border-top:0}#pret-piata .pp-inf b{display:block;font-size:14px}
#pret-piata .pp-nt{font:12.5px/1.5 var(--font);background:var(--bg,#f4f4f2);border-radius:8px;padding:9px 12px;margin:0}
@media print{#pret-piata .pp-tip{display:none}}`;
    document.head.appendChild(s);
  }

  /* indicele pe ani: punctele Timi\u0219oarei (interpolate) \u0219i, \u00eenainte de primul punct, indicele na\u021bional \u00eenl\u0103n\u021buit */
  function indice(H) {
    const tm = (H?.serie_tm?.puncte || []).filter(p => p.an >= 2009).map(p => [+p.an, +p.v]).sort((a, b) => a[0] - b[0]);
    const nat = Object.fromEntries((H?.indice?.puncte || []).map(p => [+p.an, +p.v]));
    if (tm.length < 2) return null;
    const I = {}, a0 = tm[0][0], a1 = tm[tm.length - 1][0];
    for (let i = 0; i < tm.length - 1; i++) { const [x0, y0] = tm[i], [x1, y1] = tm[i + 1]; for (let y = x0; y <= x1; y++) I[y] = y0 * Math.pow(y1 / y0, (y - x0) / (x1 - x0)); }
    for (let y = a0 - 1; y >= 2009; y--) if (nat[y] && nat[a0]) I[y] = I[a0] * nat[y] / nat[a0];
    return { I, ultim: a1 };
  }
  const medie = a => a.reduce((x, y) => x + y, 0) / a.length;
  const sd = a => { const m = medie(a); return Math.sqrt(medie(a.map(x => (x - m) * (x - m)))); };
  const cagr = (I, ani, ultim) => I[ultim - ani] ? Math.pow(I[ultim] / I[ultim - ani], 1 / ani) - 1 : null;

  function serie(EV) {
    const { C, H } = EV, X = indice(H); if (!X || !C?.p_med) return null;
    const { I, ultim } = X, V0 = C.p_med, ani = Object.keys(I).map(Number).sort((a, b) => a - b);
    const pts = ani.map(y => ({ an: y, v: V0 * I[y] / I[ultim], trecut: y < ultim }));
    pts.forEach((p, i) => { if (i < 2) return; const w = pts.slice(i - 2, i + 1).map(x => x.v), m = medie(w), s = sd(w); p.sma = m; p.sus = m + 2 * s; p.jos = m - 2 * s; });
    const g5 = cagr(I, 5, ultim), g10 = cagr(I, Math.min(10, ultim - ani[0]), ultim), gs = [g5, g10].filter(x => x != null);
    const gB = gs.length ? medie(gs) : 0.03, gP = gs.length ? 0.5 * Math.min(...gs) : 0.01, gO = gs.length ? Math.max(...gs) : 0.05;
    for (let n = 1; n <= ANI_PROIECTIE; n++) pts.push({ an: ultim + n, v: V0 * Math.pow(1 + gB, n), sus: V0 * Math.pow(1 + gO, n), jos: V0 * Math.pow(1 + gP, n), viitor: true });
    const azi = pts.find(p => p.an === ultim); azi.sus2 = C.p75; azi.jos2 = C.p25;
    return { pts, ultim, V0, gB, gP, gO, g5 };
  }

  function grafic(Z, cerut) {
    const W = 760, Hh = 330, L = 14, R = 62, T = 16, B = 52, P = Z.pts, y0 = P[0].an, y1 = P[P.length - 1].an;
    const vals = P.flatMap(p => [p.v, p.sus, p.jos, p.sus2, p.jos2].filter(x => x != null && isFinite(x))).concat(cerut ? [cerut] : []);
    const lo = Math.min(...vals) * 0.9, hi = Math.max(...vals) * 1.05;
    const X = y => L + (y - y0) / (y1 - y0) * (W - L - R), Y = v => T + (1 - (v - lo) / (hi - lo)) * (Hh - T - B);
    let s = `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="pre\u021bul estimat pe ani">`;
    s += `<rect x="${L}" y="${T}" width="${X(Z.ultim) - L}" height="${Hh - T - B}" fill="rgba(0,0,0,.035)"/>`;
    for (let i = 0; i <= 6; i++) { const v = lo + (hi - lo) * i / 6, y = Y(v); s += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-dasharray="2 4"/><text x="${W - R + 8}" y="${y + 4}" font-size="11" fill="var(--muted)" font-family="Instrument Sans,sans-serif">${k(v)}</text>`; }
    // benzile Bollinger (trecut) + conul de scenarii (viitor), ca o singura banda
    const bz = P.filter(p => p.sus != null);
    const sus = bz.map(p => `${X(p.an).toFixed(1)},${Y(p.sus).toFixed(1)}`), jos = bz.slice().reverse().map(p => `${X(p.an).toFixed(1)},${Y(p.jos).toFixed(1)}`);
    s += `<polygon points="${sus.concat(jos).join(" ")}" fill="rgba(47,111,214,.10)"/>`;
    s += `<polyline points="${sus.join(" ")}" fill="none" stroke="#2f6fd6" stroke-width="1.2" stroke-dasharray="5 4" opacity=".75"/><polyline points="${bz.map(p => `${X(p.an).toFixed(1)},${Y(p.jos).toFixed(1)}`).join(" ")}" fill="none" stroke="#2f6fd6" stroke-width="1.2" stroke-dasharray="5 4" opacity=".75"/>`;
    const tr = P.filter(p => !p.viitor), vi = P.filter(p => p.an >= Z.ultim);
    s += `<polyline points="${tr.map(p => `${X(p.an).toFixed(1)},${Y(p.v).toFixed(1)}`).join(" ")}" fill="none" stroke="#2f6fd6" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<polyline points="${vi.map(p => `${X(p.an).toFixed(1)},${Y(p.v).toFixed(1)}`).join(" ")}" fill="none" stroke="#2f6fd6" stroke-width="3" stroke-dasharray="1 0" opacity=".55" stroke-linejoin="round"/>`;
    P.forEach(p => { s += `<circle cx="${X(p.an).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="${p.an === Z.ultim ? 6 : 4}" fill="#fff" stroke="#2f6fd6" stroke-width="2.4"/>`; });
    s += `<line x1="${X(Z.ultim)}" x2="${X(Z.ultim)}" y1="${T}" y2="${Hh - B}" stroke="#2f6fd6" stroke-dasharray="4 4"/>`;
    if (cerut) { const cx = X(Z.ultim) - 18, cy = Y(cerut); s += `<g><rect x="${cx - 11}" y="${cy - 11}" width="22" height="22" rx="5" fill="#bfe6c8" stroke="#3a9a5a"/><path d="M${cx - 5} ${cy + 1}l5-6h5v5l-6 5z" fill="none" stroke="#1f6b3a" stroke-width="1.6"/><circle cx="${cx + 2.5}" cy="${cy - 2.5}" r="1.2" fill="#1f6b3a"/><title>pre\u021bul cerut: ${nf(cerut)} \u20ac</title></g>`; }
    s += `<g><rect x="${L + 8}" y="${T + 8}" width="104" height="22" rx="6" fill="#fff" stroke="var(--line)"/><text x="${L + 60}" y="${T + 23}" font-size="11" text-anchor="middle" fill="#333" font-family="Instrument Sans,sans-serif">pre\u021buri din trecut</text></g>`;
    P.forEach(p => { if ((p.an - y0) % 2 && p.an !== Z.ultim && p.an !== y1) return; s += `<text transform="translate(${X(p.an).toFixed(1)},${Hh - B + 12}) rotate(-90)" font-size="11" text-anchor="end" dominant-baseline="middle" fill="${p.an === Z.ultim ? "#2f6fd6" : "var(--muted)"}" font-weight="${p.an === Z.ultim ? 700 : 400}" font-family="IBM Plex Mono,monospace">${p.an}</text>`; });
    s += `<line class="pp-gd" x1="0" x2="0" y1="${T}" y2="${Hh - B}" stroke="#111" stroke-width="1" opacity="0"/><circle class="pp-pt" r="7" fill="#2f6fd6" stroke="#fff" stroke-width="2.5" opacity="0"/>`;
    s += `<rect class="pp-hit" x="${L}" y="${T}" width="${W - L - R}" height="${Hh - T - B}" fill="transparent"/>`;
    return { svg: s + `</svg>`, X, Y, W, Hh };
  }

  function tooltip(box, Z, G) {
    const svg = box.querySelector("svg"), tip = box.querySelector(".pp-tip"), gd = svg.querySelector(".pp-gd"), pt = svg.querySelector(".pp-pt");
    const arata = ev => {
      const r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * G.W;
      let p = Z.pts[0]; Z.pts.forEach(q => { if (Math.abs(G.X(q.an) - x) < Math.abs(G.X(p.an) - x)) p = q; });
      const cx = G.X(p.an), cy = G.Y(p.v);
      gd.setAttribute("x1", cx); gd.setAttribute("x2", cx); gd.setAttribute("opacity", ".25"); pt.setAttribute("cx", cx); pt.setAttribute("cy", cy); pt.setAttribute("opacity", "1");
      const rows = [];
      if (p.an === Z.ultim) rows.push(`<span class="g">\u2197 anun\u021buri, 75%</span> ${eur(Z.pts.find(q => q.an === Z.ultim).sus2)}`, `<span class="g">\u2198 anun\u021buri, 25%</span> ${eur(Z.pts.find(q => q.an === Z.ultim).jos2)}`);
      else if (p.viitor) rows.push(`<span class="g">\u2197 scenariu optimist</span> ${eur(p.sus)}`, `<span class="g">\u2198 scenariu prudent</span> ${eur(p.jos)}`);
      else if (p.sus != null) rows.push(`<span class="g">\u2197 banda de sus</span> ${eur(p.sus)}`, `<span class="g">\u2198 banda de jos</span> ${eur(p.jos)}`, `<span class="g">medie mobil\u0103 3 ani</span> ${eur(p.sma)}`);
      tip.innerHTML = `<div class="d">\u25cf ${p.viitor ? "pre\u021b estimat (proiec\u021bie)" : p.an === Z.ultim ? "pre\u021bul de pia\u021b\u0103, azi" : "pre\u021b estimat \u00een trecut"} \u00b7 ${p.an}</div><b>${eur(p.v)}</b><div>${rows.join("<br>")}</div>`;
      const bw = box.getBoundingClientRect(), px = cx / G.W * r.width, py = cy / G.Hh * r.height;
      tip.style.left = Math.min(Math.max(8, px + 14), bw.width - tip.offsetWidth - 8) + "px"; tip.style.top = Math.max(6, py - tip.offsetHeight / 2) + "px"; tip.style.opacity = 1;
    };
    const ascunde = () => { tip.style.opacity = 0; gd.setAttribute("opacity", "0"); pt.setAttribute("opacity", "0"); };
    svg.addEventListener("pointermove", arata); svg.addEventListener("pointerdown", arata); svg.addEventListener("pointerleave", ascunde);
  }

  function randeaza(EV) {
    const sec = document.getElementById("evaluare"); if (!sec) return;
    const Z = serie(EV); document.getElementById("pret-piata")?.remove(); if (!Z) return;
    css();
    const { S, C, P } = EV, cerut = +S.cerut || null, mic = window.mic || (x => x);
    const a = C.p25, m = C.p_med, b = C.p75, span = (b - a) || m * .2, s0 = a - span * .6, s1 = b + span * .6, pos = v => Math.max(0, Math.min(100, (v - s0) / (s1 - s0) * 100));
    const G = grafic(Z, cerut), dt = ((P?.sursa || "").match(/instantaneu ([\d.]+)/) || [])[1] || "";
    const dupa7 = Z.V0 * Math.pow(1 + Z.gB, ANI_PROIECTIE);
    const box = document.createElement("div"); box.id = "pret-piata"; box.className = "keep";
    box.innerHTML = `<div><h3>pre\u021bul de pia\u021b\u0103</h3><p class="pp-s">pornind de la anun\u021burile comparabile de azi \u0219i de la cum s-au mi\u0219cat pre\u021burile \u00een ultimii ani, am estimat cum s-a modificat pre\u021bul unei propriet\u0103\u021bi ca aceasta \u00een timp. graficul arat\u0103 o perioad\u0103 limitat\u0103 \u0219i nu reflect\u0103 istoria acestei case anume.</p></div>
      <div class="pp-bar"><div class="pp-l st" style="left:0">pre\u021b mic (25%)<b>${eur(a)}</b></div><div class="pp-l m" style="left:${Math.max(22, Math.min(78, pos(m)))}%">pre\u021bul median<b>${eur(m)}</b></div><div class="pp-l dr" style="left:100%">pre\u021b mare (75%)<b>${eur(b)}</b></div>
        <div class="pp-g"></div><i class="pp-mk" style="left:${pos(a)}%;background:#e9c43a"></i><i class="pp-mk" style="left:${pos(m)}%;background:#1f8a4c"></i><i class="pp-mk" style="left:${pos(b)}%;background:#d6342c"></i>
        ${cerut ? `<span class="pp-ce" style="left:${pos(cerut)}%">pre\u021bul cerut ${eur(cerut)}</span>` : ""}</div>
      <div><p class="pp-s" style="margin:${cerut ? "18px" : "0"} 0 6px">criterii pentru estimarea pre\u021bului de pia\u021b\u0103:</p><div class="pp-cr">
        <span>tip: <b>${esc(mic(({ casa: "cas\u0103", duplex: "duplex", apartament: "apartament", teren: "teren" })[S.tip] || S.tip))}</b></span><span>suprafa\u021b\u0103: <b>${nf(S.mp)} mp</b></span>${S.tip !== "teren" && S.an ? `<span>an: <b>${esc(S.an)}</b></span>` : ""}
        <span>localitate: <b>${esc(mic(P?.uat || ""))}</b></span>${S.zona ? `<span>zon\u0103: <b>${esc(mic(S.zona))}</b></span>` : ""}<span>comparabile: <b>${nf(C.n)}</b></span>${dt ? `<span>anun\u021buri din: <b>${esc(dt)}</b></span>` : ""}</div></div>
      <div class="pp-ch">${G.svg}<div class="pp-tip"></div></div>
      <div class="pp-leg"><span><i style="width:22px;height:3px;background:#2f6fd6;border-radius:2px"></i>pre\u021bul estimat</span><span><i style="width:18px;height:12px;border:1px dashed #2f6fd6;background:rgba(47,111,214,.1)"></i>benzi Bollinger (medie 3 ani \u00b1 2 abateri) \u00b7 dup\u0103 azi: scenarii</span>${cerut ? `<span><i style="width:14px;height:14px;background:#bfe6c8;border:1px solid #3a9a5a;border-radius:4px"></i>pre\u021bul cerut</span>` : ""}</div>
      <div class="pp-inf">
        <div><b>tendin\u021ba pre\u021bului</b>${Z.g5 != null ? `\u00een ultimii 5 ani, pre\u021burile au crescut \u00een medie cu ${pc(Z.g5)} pe an. ` : ""}dac\u0103 ritmul mediu se p\u0103streaz\u0103, \u00een ${ANI_PROIECTIE} ani o proprietate ca aceasta ar putea ajunge la circa ${eur(dupa7)} (\u00eentre ${eur(Z.V0 * Math.pow(1 + Z.gP, ANI_PROIECTIE))} \u0219i ${eur(Z.V0 * Math.pow(1 + Z.gO, ANI_PROIECTIE))}).</div>
        <div><b>pre\u021bul cerut fa\u021b\u0103 de pia\u021b\u0103</b>${cerut ? (cerut > b ? `pre\u021bul cerut e peste pre\u021bul mare al comparabilelor (${eur(b)}): ai argumente de negociere.` : cerut < a ? `pre\u021bul cerut e sub pre\u021bul mic al comparabilelor (${eur(a)}): afl\u0103 de ce, \u00eenainte de avans.` : `pre\u021bul cerut e \u00een intervalul obi\u0219nuit al comparabilelor (${eur(a)} \u2013 ${eur(b)}).`) : `scrie pre\u021bul cerut \u00een fi\u0219a de mai sus ca s\u0103-l vezi pe bar\u0103 \u0219i pe grafic.`}</div>
        <div><b>c\u00e2t de sigure sunt cifrele</b>${nf(C.n)} anun\u021buri comparabile, ajustate pentru suprafa\u021b\u0103 \u0219i negociere; seria \u00een timp e estimat\u0103 din reperele publice pentru ora\u0219 \u0219i din indicele na\u021bional al pre\u021burilor locuin\u021belor.</div></div>
      <p class="pp-nt"><b>not\u0103:</b> pre\u021burile din anun\u021buri sunt pre\u021buri cerute, nu pre\u021buri de tranzac\u021bie. estimarea nu este evaluare ANEVAR; pre\u021bul real depinde de starea casei, de acte \u0219i de pia\u021b\u0103 la momentul v\u00e2nz\u0103rii.</p>`;
    const fisa = sec.querySelector(":scope > .ev-sec") || sec.querySelector(":scope > div");
    if (fisa) fisa.insertAdjacentElement("afterend", box); else sec.appendChild(box);
    tooltip(box.querySelector(".pp-ch"), Z, G);
  }

  setInterval(() => {
    const EV = window.__EV, sec = document.getElementById("evaluare"); if (!EV || !sec || !sec.firstElementChild) return;
    const s = EV.v + "|" + (typeof D !== "undefined" && D ? D.id : "");
    if (s === sig && document.getElementById("pret-piata")) return;
    sig = s; try { randeaza(EV); } catch (e) { console.warn("pret_piata", e); }
  }, 900);
  window.RIC_PRET = { serie };
})();
