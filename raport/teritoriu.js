/* Raport în creștere — hărțile de teritoriu din Rezumat (date din teritoriu.py → p/<id>/teritoriu.json).
   TER.mount(el, T, D, link)  → pagina interactivă: UAT (grila de populație, situri, monumente + bara „rază”),
                                județ (indicator la alegere + clasament), hazard pe județ (inundații, râuri, arii, cutremure + bara „anul”),
                                plus cardul cu codul QR spre raport.
   TER.pdf(el, T, link)        → aceleași trei hărți, statice, pe o pagină A4.
   SVG desenat de noi, proiecție echidistantă cu corecția cos(latitudine) — corectă la scara unui județ. */
(function () {
  /* hărți pe toată lățimea paginii, cu cifrele dedesubt (cerut de Manu: „mai mult loc pentru hartă”); stil propriu, ca să nu depindem de index.html */
  if (typeof document !== "undefined" && !document.getElementById("ter-stil")) {
    const st = document.createElement("style"); st.id = "ter-stil";
    st.textContent = `.tpan { grid-template-columns: minmax(0, 1fr) !important }
      .tpan .tmap-w .tsvg { width: 100% }
      .tpan .tside { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 6px 28px; align-items: start; border-top: 1px solid var(--line); padding-top: 10px }
      .tpan .tside .tsl, .tpan .tside input[type=range], .tpan .tside .tsep { grid-column: 1 / -1 }
      .tpan .tside .tsep { display: none }
      .tpan .tside .kv { align-self: start }
      .ist .ist-img { aspect-ratio: 16 / 10 }
      .ist { grid-template-columns: minmax(0, 1fr) !important }
      .ist .tside { display: flex; flex-direction: column }
      .ist .ist-th { grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)) }`;
    document.head.appendChild(st);
  }
  const nf = (v, d = 0) => Number(v).toLocaleString("ro-RO", { minimumFractionDigits: d, maximumFractionDigits: d });
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ART = "https://claude.ai/artifact/9WVsRTiNLNNjB7jMQT9CCE";

  function proj(bb, W, pad = 10) {
    const k = Math.cos((bb[1] + bb[3]) / 2 * Math.PI / 180), w = (bb[2] - bb[0]) * k, h = bb[3] - bb[1];
    const s = (W - 2 * pad) / w, H = Math.round(h * s + 2 * pad);
    return { W, H, s, k, P: ([x, y]) => [pad + (x - bb[0]) * k * s, pad + (bb[3] - y) * s] };
  }
  const path = (rs, P) => rs.map(r => "M" + r.map(p => P(p).map(v => v.toFixed(1)).join(",")).join("L") + "Z").join("");
  const pin = ([x, y], r = 7) => `<circle cx="${x}" cy="${y}" r="${r + 3}" fill="#fff" opacity=".9"/><circle cx="${x}" cy="${y}" r="${r}" fill="#ff3b5c" stroke="#fff" stroke-width="2"/>`;
  const bgImg = (T, cheie, bb, P, op = 1) => { const f = T.fundal && T.fundal[cheie]; if (!f) return "";
    const [x0, y0] = P([bb[0], bb[3]]), [x1, y1] = P([bb[2], bb[1]]);
    return `<image href="${esc((T.pref || "") + f)}" x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${(x1 - x0).toFixed(1)}" height="${(y1 - y0).toFixed(1)}" preserveAspectRatio="none" opacity="${op}"/>`; };
  const km = (a, b) => Math.hypot((a[0] - b[0]) * 111.32 * Math.cos(a[1] * Math.PI / 180), (a[1] - b[1]) * 110.574);

  /* ---------- scale de culoare ---------- */
  const SEQ = ["#f1eef6", "#d4b9da", "#c994c7", "#df65b0", "#dd1c77", "#980043"];
  const step = (v, br, cols) => { for (let i = 0; i < br.length; i++) if (v < br[i]) return cols[i]; return cols[cols.length - 1]; };
  const POPC = v => step(v, [100, 500, 1000, 2500, 5000], ["#fde7c7", "#fcc68a", "#f9a04e", "#ef7128", "#d4471a", "#9b2a0e"]);
  const IND = {
    p2026: { t: "Populația 2026", u: "locuitori", col: v => step(v, [2000, 4000, 8000, 15000, 40000], SEQ), leg: [["< 2.000", SEQ[0]], ["2–4 mii", SEQ[1]], ["4–8 mii", SEQ[2]], ["8–15 mii", SEQ[3]], ["15–40 mii", SEQ[4]], ["> 40 mii", SEQ[5]]], f: v => nf(v) },
    var: { t: "Evoluția populației 2016–2026", u: "%", col: v => step(v, [-10, -3, 0, 5, 20], ["#b2182b", "#ef8a62", "#fddbc7", "#d1e5f0", "#67a9cf", "#2166ac"]), leg: [["scade > 10%", "#b2182b"], ["−10…−3%", "#ef8a62"], ["−3…0%", "#fddbc7"], ["0…5%", "#d1e5f0"], ["5…20%", "#67a9cf"], ["crește > 20%", "#2166ac"]], f: v => (v > 0 ? "+" : "") + nf(v, 1) + "%" },
    ag: { t: "Accelerația seismică ag (P100)", u: "g", col: v => ({ 0.1: "#7fc8a9", 0.15: "#b9d96f", 0.2: "#f2c14e", 0.25: "#ee8c3a", 0.3: "#d9534f" }[v] || "#999"), leg: [["0,10 g", "#7fc8a9"], ["0,15 g", "#b9d96f"], ["0,20 g", "#f2c14e"], ["0,25 g", "#ee8c3a"], ["fără valoare (comună)", "#e9e7e1"]], f: v => nf(v, 2) + " g" },
    pug_an: { t: "Anul PUG-ului în vigoare", u: "", col: v => step(v, [2000, 2010, 2020], ["#d9534f", "#ee8c3a", "#b9d96f", "#3d9a5b"]), leg: [["înainte de 2000", "#d9534f"], ["2000–2009", "#ee8c3a"], ["2010–2019", "#b9d96f"], ["din 2020", "#3d9a5b"], ["nu avem fișa", "#e9e7e1"]], f: v => String(v) },
    ran: { t: "Situri arheologice RAN", u: "situri", col: v => step(v, [1, 5, 10, 20, 40], ["#f6eee6", "#e3c9ae", "#c99a6b", "#a0522d", "#7a3a1c", "#4d230f"]), leg: [["0", "#f6eee6"], ["1–4", "#e3c9ae"], ["5–9", "#c99a6b"], ["10–19", "#a0522d"], ["20–39", "#7a3a1c"], ["40+", "#4d230f"]], f: v => nf(v) },
    lmi: { t: "Monumente istorice LMI", u: "monumente", col: v => step(v, [1, 3, 6, 15, 40], ["#f3eef7", "#d8c4e6", "#b48dd0", "#8e5cb5", "#6a3393", "#45185f"]), leg: [["0", "#f3eef7"], ["1–2", "#d8c4e6"], ["3–5", "#b48dd0"], ["6–14", "#8e5cb5"], ["15–39", "#6a3393"], ["40+", "#45185f"]], f: v => nf(v) },
  };
  const GOL = "#e9e7e1";

  /* ---------- harta 1: proprietatea în UAT ---------- */
  function hartaUAT(T, W, raza, baza = "uat_strazi") {
    const U = T.uat, pr = proj(U.bbox, W), P = pr.P, areBaza = baza !== "fara" && T.fundal && T.fundal[baza];
    const dlon = 1 / (111.32 * Math.cos(T.pin[1] * Math.PI / 180)), dlat = 1 / 110.574;     // 1 km în grade
    let s = `<svg viewBox="0 0 ${W} ${pr.H}" class="tmap" role="img" aria-label="Proprietatea în UAT ${esc(U.nume)}">`;
    s += areBaza ? bgImg(T, baza, U.bbox, P) + `<path d="M0,0H${W}V${pr.H}H0Z${path(U.r, P)}" fill="#fff" fill-opacity=".55" fill-rule="evenodd"/>` : `<path d="${path(U.r, P)}" fill="#f4f1ea" stroke="none"/>`;
    s += `<g class="l-pop">${U.grila.map(c => { const [x0, y0] = P([c[0] - dlon / 2, c[1] + dlat / 2]), [x1, y1] = P([c[0] + dlon / 2, c[1] - dlat / 2]);
      return `<rect x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${(x1 - x0).toFixed(1)}" height="${(y1 - y0).toFixed(1)}" fill="${POPC(c[2])}" opacity="${areBaza ? .55 : .85}"><title>${nf(c[2])} locuitori în acest pătrat de 1 km²</title></rect>`; }).join("")}</g>`;
    s += `<path d="${path(U.r, P)}" fill="none" stroke="#1a1e2a" stroke-width="2"/>`;
    s += `<g class="l-lmi">${U.lmi.map(m => { const [x, y] = P(m); return `<circle cx="${x}" cy="${y}" r="3.6" fill="#8e24aa" stroke="#fff" stroke-width=".8"><title>${esc(m[3] + " · " + m[2])}</title></circle>`; }).join("")}</g>`;
    s += `<g class="l-ran">${U.ran.map(m => { const [x, y] = P(m); return `<rect x="${x - 3.5}" y="${y - 3.5}" width="7" height="7" transform="rotate(45 ${x} ${y})" fill="#a0522d" stroke="#fff" stroke-width=".8"><title>${esc("RAN " + m[3] + " · " + m[2])}</title></rect>`; }).join("")}</g>`;
    const [px, py] = P(T.pin), rpx = raza / km(T.pin, [T.pin[0] + dlon, T.pin[1]]) * (P([T.pin[0] + dlon, T.pin[1]])[0] - px);
    s += `<circle class="t-raza" cx="${px}" cy="${py}" r="${rpx.toFixed(1)}" fill="#ff3b5c" fill-opacity=".07" stroke="#ff3b5c" stroke-width="1.6" stroke-dasharray="5 4"/>`;
    s += pin([px, py], 6) + `</svg>`;
    return s;
  }
  function statsRaza(T, raza) {
    const U = T.uat, inR = p => km(T.pin, p) <= raza;
    return { pop: U.grila.filter(inR).reduce((a, c) => a + c[2], 0), ran: U.ran.filter(inR).length, lmi: U.lmi.filter(inR).length };
  }

  /* ---------- harta 2: proprietatea în județ ---------- */
  function hartaJudet(T, W, ind) {
    const pr = proj(T.judet.bbox, W), P = pr.P, I = IND[ind];
    let s = `<svg viewBox="0 0 ${W} ${pr.H}" class="tmap" role="img" aria-label="Proprietatea în județul ${esc(T.judet.nume)}">`;
    s += bgImg(T, "judet", T.judet.bbox, P, .9);
    T.uats.forEach(u => { const v = u[ind], c = v == null ? GOL : I.col(v), cur = u.siruta === T.uat_curent;
      s += `<path d="${path(u.r, P)}" fill="${c}" fill-opacity="${T.fundal && T.fundal.judet ? .78 : 1}" stroke="${cur ? "#1a1e2a" : "#fff"}" stroke-width="${cur ? 2.4 : .7}"><title>${esc(u.nume)} · ${esc(I.t)}: ${v == null ? "fără date" : esc(I.f(v))}</title></path>`; });
    const cu = T.uats.find(u => u.siruta === T.uat_curent);
    if (cu) s += `<path d="${path(cu.r, P)}" fill="none" stroke="#1a1e2a" stroke-width="2.6"/>`;
    s += pin(P(T.pin), 6) + `</svg>`;
    return s;
  }
  function clasament(T, ind) {
    const I = IND[ind], L = T.uats.filter(u => u[ind] != null).sort((a, b) => b[ind] - a[ind]), cu = L.findIndex(u => u.siruta === T.uat_curent);
    const top = L.slice(0, 8); if (cu >= 8) top.push(L[cu]);
    const mx = Math.max(...L.map(u => Math.abs(u[ind])), 1);
    return `<div class="tcl">${top.map(u => { const i = L.indexOf(u), c = u.siruta === T.uat_curent;
      return `<div class="tclr${c ? " cur" : ""}"><span>${i + 1}. ${esc(u.nume)}</span><i style="width:${Math.max(2, Math.abs(u[ind]) / mx * 100)}%;background:${I.col(u[ind])}"></i><b>${esc(I.f(u[ind]))}</b></div>`; }).join("")}</div>` +
      (cu >= 0 ? `<p class="nt">${esc(L[cu].nume)} e pe locul <b>${cu + 1}</b> din ${L.length} UAT-uri cu date.</p>` : `<p class="nt">UAT-ul proprietății nu are valoare pentru acest indicator.</p>`);
  }

  /* ---------- harta 3: hazardurile județului ---------- */
  function hartaHazard(T, W, an) {
    const bb = T.hazard.bbox, pr = proj(bb, W, 0), P = pr.P;
    let s = `<svg viewBox="0 0 ${W} ${pr.H}" class="tmap" role="img" aria-label="Hazardurile județului ${esc(T.judet.nume)}">`;
    s += T.fundal && T.fundal.judet ? bgImg(T, "judet", T.judet.bbox, P, .55) : `<path d="${path(T.judet.r, P)}" fill="#f4f1ea" stroke="none"/>`;
    s += `<g class="l-arii">${T.arii.map(a => `<path d="${path(a.r, P)}" fill="#2e933c" fill-opacity=".22" stroke="#2e933c" stroke-width=".7"><title>${esc(a.cod + " · " + a.nume)}</title></path>`).join("")}</g>`;
    s += `<image class="l-inund" href="${esc(T.hazard.imgUrl || T.hazard.img)}" x="0" y="0" width="${W}" height="${pr.H}" preserveAspectRatio="none"/>`;
    s += T.uats.map(u => `<path d="${path(u.r, P)}" fill="none" stroke="#8a8578" stroke-width=".5"/>`).join("");
    s += `<path d="${path(T.judet.r, P)}" fill="none" stroke="#1a1e2a" stroke-width="1.6"/>`;
    const ev = T.cutremure.filter(e => e[3] <= an && e[0] >= bb[0] && e[0] <= bb[2] && e[1] >= bb[1] && e[1] <= bb[3]);
    s += `<g class="l-cut">${ev.map(e => { const [x, y] = P(e), r = 1.2 + Math.pow(e[2] - 1.8, 1.6) * 1.6; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#6b2d8f" fill-opacity="${e[2] >= 4 ? .75 : .35}" stroke="#fff" stroke-width=".4"><title>${e[3]} · magnitudine ${nf(e[2], 1)}</title></circle>`; }).join("")}</g>`;
    s += pin(P(T.pin), 6) + `</svg>`;
    return { svg: s, n: ev.length, max: ev.reduce((m, e) => e[2] > m[2] ? e : m, [0, 0, 0, 0]) };
  }

  const legPop = `<div class="tlg">${[["< 100", POPC(50)], ["100–500", POPC(300)], ["500–1.000", POPC(700)], ["1–2,5 mii", POPC(2000)], ["2,5–5 mii", POPC(4000)], ["> 5 mii", POPC(9000)]].map(([t, c]) => `<span><i style="background:${c}"></i>${t}</span>`).join("")}</div>`;
  const legInd = ind => `<div class="tlg">${IND[ind].leg.map(([t, c]) => `<span><i style="background:${c}"></i>${t}</span>`).join("")}</div>`;
  const legHaz = `<div class="tlg"><span><i style="background:#dc2626"></i>inundabil o dată la 10 ani</span><span><i style="background:#f58220"></i>100 de ani</span><span><i style="background:#facc15"></i>500–1000 de ani</span><span><i style="background:#008cff"></i>râuri, lacuri</span><span><i style="background:#2e933c;opacity:.5"></i>arii protejate</span><span><i style="background:#6b2d8f;border-radius:50%"></i>cutremure (mărimea = magnitudinea)</span></div>`;
  const chip = (cls, t, on = true) => `<button type="button" class="pzc" aria-pressed="${on}" data-off="${cls}">${t}</button>`;
  const ANI = T => { const a = T.cutremure.map(e => e[3]).filter(x => x >= 1900); return [Math.min(...a), Math.max(...a)]; };

  /* ---------- pagina interactivă ---------- */
  function mount(el, T, D) {
    if (!T) { el.innerHTML = ""; return; }
    el.classList.add("keep");                                  // rămâne vizibil și în modul „Simplu” (interfata.js)
    T.hazard.imgUrl = `p/${D.id}/${T.hazard.img}`; T.pref = `p/${D.id}/`;
    const link = `${ART}#${D.id}`, U = T.uats.find(u => u.siruta === T.uat_curent) || {};
    const [a0, a1] = ANI(T);
    el.innerHTML = `
      <div class="tqr"><div class="tqr-c"></div><div><b>Raportul acestei proprietăți, oricând, pe telefon</b><p class="nt">Scanează codul sau deschide linkul. Hărțile și datele se actualizează pe același link.</p><a href="${esc(link)}" target="_blank" rel="noopener">${esc(link)}</a></div></div>
      <div class="tpan" id="tUAT"><div class="tmap-w"><div class="tt">Proprietatea în ${esc(T.uat.nume)}</div><div class="pzchips"><span class="tbase">${[["uat_strazi", "Străzi"], ["uat_satelit", "Satelit"], ["fara", "Fără fundal"]].map(([k, t], i) => `<button type="button" class="pzc tb" aria-pressed="${i === 0}" data-b="${k}">${t}</button>`).join("")}</span>${chip("pop", "populația pe 1 km²")}${chip("ran", "situri arheologice")}${chip("lmi", "monumente")}</div><div class="tsvg"></div>${legPop}</div>
        <div class="tside"><div class="tsl"><label for="tRaza">Raza în jurul proprietății</label><output id="tRazaO"></output></div><input type="range" id="tRaza" min="0.5" max="5" step="0.5" value="1.5">
          <dl class="kv" id="tRazaS"></dl><div class="tsep"></div>
          <dl class="kv"><dt>Populația UAT 2026</dt><dd>${U.p2026 ? nf(U.p2026) : "—"}</dd><dt>Față de 2016</dt><dd>${U.var != null ? IND.var.f(U.var) : "—"}</dd><dt>Suprafața</dt><dd>${nf(U.km2 || 0)} km²</dd><dt>Densitatea</dt><dd>${U.p2026 && U.km2 ? nf(U.p2026 / U.km2) + " loc./km²" : "—"}</dd><dt>Situri RAN în UAT</dt><dd>${nf(U.ran || 0)}</dd><dt>Monumente LMI în UAT</dt><dd>${nf(U.lmi || 0)}</dd></dl></div></div>
      <div class="tpan" id="tJUD"><div class="tmap-w"><div class="tt">Proprietatea în județul ${esc(T.judet.nume)}</div><div class="pzchips">${Object.entries(IND).map(([k, v], i) => `<button type="button" class="pzc tind" aria-pressed="${i === 1}" data-ind="${k}">${esc(v.t.replace(/ \(.*\)/, ""))}</button>`).join("")}</div><div class="tsvg"></div><div class="tleg"></div></div>
        <div class="tside"><div class="tt2"></div><div class="tcls"></div></div></div>
      <div class="tpan" id="tHAZ"><div class="tmap-w"><div class="tt">Hazardurile județului ${esc(T.judet.nume)}</div><div class="pzchips">${chip("inund", "inundații și râuri")}${chip("arii", "arii protejate")}${chip("cut", "cutremure")}</div><div class="tsvg"></div>${legHaz}</div>
        <div class="tside"><div class="tsl"><label for="tAn">Cutremure până în anul</label><output id="tAnO"></output></div><input type="range" id="tAn" min="${a0}" max="${a1}" step="1" value="${a1}"><dl class="kv" id="tAnS"></dl><div class="tsep"></div><dl class="kv" id="tHazS"></dl></div></div>
      <p class="note"><b>Surse:</b> ${esc(Object.values(T.surse).join(" · "))}; calculat ${esc(T.data)}.</p>`;
    // QR
    try { const q = qrcode(0, "M"); q.addData(link); q.make(); el.querySelector(".tqr-c").innerHTML = q.createSvgTag({ cellSize: 3, margin: 1, scalable: true }); } catch (e) {}
    // straturi pornite / oprite
    el.querySelectorAll("[data-off]").forEach(b => b.onclick = () => { const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on); b.closest(".tpan").classList.toggle("off-" + b.dataset.off, !on); });
    // UAT + rază
    const uatSvg = el.querySelector("#tUAT .tsvg"), rz = el.querySelector("#tRaza");
    let baza = "uat_strazi";
    el.querySelectorAll(".tb").forEach(b => b.onclick = () => { baza = b.dataset.b; el.querySelectorAll(".tb").forEach(x => x.setAttribute("aria-pressed", x === b)); drawU(); });
    const drawU = () => { const r = +rz.value; uatSvg.innerHTML = hartaUAT(T, 640, r, baza); el.querySelector("#tRazaO").textContent = nf(r, 1) + " km";
      const st = statsRaza(T, r); el.querySelector("#tRazaS").innerHTML = `<dt>Oameni în rază</dt><dd>${nf(st.pop)}</dd><dt>Situri arheologice</dt><dd>${st.ran}</dd><dt>Monumente istorice</dt><dd>${st.lmi}</dd>`; };
    rz.oninput = drawU; drawU();
    // județ + indicator
    let ind = "var";
    const drawJ = () => { el.querySelector("#tJUD .tsvg").innerHTML = hartaJudet(T, 640, ind); el.querySelector("#tJUD .tleg").innerHTML = legInd(ind);
      el.querySelector("#tJUD .tt2").innerHTML = `<b>${esc(IND[ind].t)}</b>`; el.querySelector("#tJUD .tcls").innerHTML = clasament(T, ind);
      el.querySelectorAll("#tJUD .tind").forEach(b => b.setAttribute("aria-pressed", b.dataset.ind === ind)); };
    el.querySelectorAll("#tJUD .tind").forEach(b => b.onclick = () => { ind = b.dataset.ind; drawJ(); }); drawJ();
    // hazard + an
    const an = el.querySelector("#tAn"), F = D.inundatii, S = D.seismic;
    const drawH = () => { const h = hartaHazard(T, 640, +an.value); el.querySelector("#tHAZ .tsvg").innerHTML = h.svg; el.querySelector("#tAnO").textContent = an.value;
      el.querySelector("#tAnS").innerHTML = `<dt>Cutremure în zona județului, 1962–${an.value}</dt><dd>${nf(h.n)}</dd><dt>Cel mai puternic</dt><dd>${h.max[2] ? "M " + nf(h.max[2], 1) + " (" + h.max[3] + ")" : "—"}</dd>`; };
    an.oninput = drawH; drawH();
    el.querySelector("#tHazS").innerHTML = `<dt>Cel mai apropiat râu</dt><dd>${F?.rau ? esc(F.rau.nume) + ", " + nf(F.rau.dist_m) + " m" : "—"}</dd>` +
      `<dt>Zonă inundabilă (10 ani)</dt><dd>${F ? (F.hazard.hz10.dist_m === 0 ? "în zonă" : typeof F.hazard.hz10.dist_m === "number" ? "≈ " + nf(F.hazard.hz10.dist_m) + " m" : "peste 5 km") : "—"}</dd>` +
      `<dt>ag seismic (P100)</dt><dd>${S?.ag_txt ? S.ag_txt + " g" : "—"}</dd><dt>Arie protejată</dt><dd>${D.arii_protejate?.cel_mai_aproape != null ? nf(D.arii_protejate.cel_mai_aproape / 1000, 1) + " km" : "—"}</dd>`;
  }

  /* ---------- pagina din PDF ---------- */
  function pdf(el, T, link) {
    if (!T) return;
    const [, a1] = ANI(T), U = T.uats.find(u => u.siruta === T.uat_curent) || {}, st = statsRaza(T, 1.5);
    el.innerHTML = `<div class="tpg">
      <div><div class="tt">În ${esc(T.uat.nume)} · populația pe 1 km², situri, monumente</div>${hartaUAT(T, 640, 1.5)}${legPop}
        <p class="nt">În 1,5 km: ${nf(st.pop)} de oameni, ${st.ran} situri arheologice, ${st.lmi} monumente. UAT: ${U.p2026 ? nf(U.p2026) : "—"} locuitori în 2026 (${U.var != null ? IND.var.f(U.var) : "—"} față de 2016).</p></div>
      <div><div class="tt">În județul ${esc(T.judet.nume)} · evoluția populației 2016–2026</div>${hartaJudet(T, 640, "var")}${legInd("var")}</div>
      <div class="w2"><div class="tt">Hazardurile județului · inundații, râuri, arii protejate, cutremure 1962–${a1}</div>${hartaHazard(T, 900, a1).svg}${legHaz}</div></div>`;
  }

  /* ---------- semaforul din capul Rezumatului: verdictul sugerat al fiecărui capitol (verdict.js), pe culori ---------- */
  function semafor(el, D, HR, go) {
    const RV = window.RIC_VERDICT; if (!RV || !el) return;
    el.classList.add("keep");
    const ord = ["rau", "verificat", "neconcl", "bine", "info"], gr = {};
    RV.CAP.forEach(([k, t]) => { if (!document.querySelector(`nav [data-t="${k}"]`) || document.querySelector(`nav [data-t="${k}"]`).hidden) return;
      const [v, m] = RV.sugerat(k, D, HR); (gr[v] = gr[v] || []).push([k, t, m]); });
    const TIT = { rau: "Nu arată bine", verificat: "De verificat înainte de semnare", neconcl: "Neconcludent: datele publice nu ajung", bine: "Arată bine", info: "Informativ" };
    el.innerHTML = `<div class="sem-n">${ord.filter(v => gr[v]).map(v => `<div style="--c:${RV.VER[v][1]}"><b>${gr[v].length}</b><span>${esc(RV.VER[v][0])}</span></div>`).join("")}</div>` +
      `<div class="sem-g">${ord.filter(v => gr[v] && v !== "info").map(v => `<div class="sem-c" style="--c:${RV.VER[v][1]}"><div class="sem-t">${esc(TIT[v])}</div>${gr[v].map(([k, t, m]) =>
        `<button type="button" class="sem-r" data-go="${k}"><b>${esc(t)}</b><span>${esc(m)}</span></button>`).join("")}</div>`).join("")}</div>`;
    el.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
  }

  /* ---------- istoricul satelit (istoric.py → istoric.json + istoric/*.jpg, din Esri Wayback) ---------- */
  function istoric(el, H, D) {
    if (!el) return;
    const L = (H && H.imagini) || [];
    if (L.length < 2) { el.innerHTML = ""; return; }
    el.classList.add("keep");
    const pref = `p/${D.id}/`, ro = d => d.split("-").reverse().join(".");
    el.innerHTML = `<div class="tpan ist"><div class="tmap-w"><div class="tt">Cum s-a schimbat zona: ${esc(L[0].data.slice(0, 4))} – ${esc(L[L.length - 1].data.slice(0, 4))}</div>
        <div class="ist-img"><img alt="" class="ist-a"><img alt="" class="ist-b"><span class="ist-d"></span></div>
        <div class="tsl"><label for="tIst">Trage pe ani</label><output id="tIstO"></output></div>
        <input type="range" id="tIst" min="0" max="${(L.length - 1) * 10}" step="1" value="${(L.length - 1) * 10}">
        <div class="ist-ax">${L.map(x => `<span>${esc(x.data.slice(0, 4))}</span>`).join("")}</div></div>
      <div class="tside"><button type="button" class="pzc" id="tIstP">▶ Rulează anii</button>
        <div class="ist-th">${L.map((x, i) => `<button type="button" data-i="${i}"><img src="${esc(pref + x.fisier)}" alt="${esc(ro(x.data))}" loading="lazy"><span>${esc(ro(x.data))}</span></button>`).join("")}</div>
        <p class="nt">${L.length} imagini distincte din arhiva Esri, ${nf(H.latura_m / 1000, 1)} × ${nf(H.latura_m / 1000, 1)} km în jurul proprietății (punctul roșu). Între două date, bara le suprapune treptat, ca să vezi ce s-a construit.</p>
        <p class="nt"><b>Sursă:</b> ${esc(H.sursa)}; verificat ${esc(H.data)}.</p></div></div>`;
    const a = el.querySelector(".ist-a"), b = el.querySelector(".ist-b"), r = el.querySelector("#tIst"), lab = el.querySelector(".ist-d");
    L.forEach(x => { const im = new Image(); im.src = pref + x.fisier; });            // preîncărcare
    const show = () => { const v = +r.value / 10, i = Math.floor(v), f = v - i, j = Math.min(i + 1, L.length - 1);
      a.src = pref + L[i].fisier; b.src = pref + L[j].fisier; b.style.opacity = j === i ? 0 : f;
      const x = f >= .5 ? L[j] : L[i];
      lab.textContent = `${ro(x.data)} · ${x.rez_m ? String(x.rez_m).replace(".", ",") + " m/pixel" : ""} · ${x.senzor || ""} (${x.furnizor || "Esri"})`;
      el.querySelector("#tIstO").textContent = x.data.slice(0, 4);
      el.querySelectorAll(".ist-th button").forEach((t, k) => t.classList.toggle("on", L[k] === x)); };
    r.oninput = show; show();
    el.querySelectorAll(".ist-th button").forEach(t => t.onclick = () => { r.value = +t.dataset.i * 10; show(); });
    let tm = null; const pb = el.querySelector("#tIstP");
    pb.onclick = () => { if (tm) { clearInterval(tm); tm = null; pb.textContent = "▶ Rulează anii"; return; }
      if (+r.value >= +r.max) r.value = 0; pb.textContent = "❚❚ Oprește";
      tm = setInterval(() => { r.value = Math.min(+r.value + 1, +r.max); show(); if (+r.value >= +r.max) { clearInterval(tm); tm = null; pb.textContent = "▶ Rulează anii"; } }, 90); };
  }

  window.TER = { mount, pdf, IND, semafor, istoric };
})();
