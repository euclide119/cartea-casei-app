/* Cartea Casei - relieful real in 3D (Manu, 23.10.2026): altitudini Terrarium + satelit Esri, din p/<id>/teren3d.json (client_gen/teren3d.py).
   Intra in #alunecari, dupa poza capitolului. Comutator 300 m / 1,5 km, satelit sau panta pe scara de risc, pinul proprietatii.
   Rotire cu mouse sau deget; three.js r128 (cdnjs). Nu modifica alte module. */
(function () {
  "use strict";
  const T3 = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = (v, d) => Number(v).toLocaleString("ro-RO", { maximumFractionDigits: d == null ? 1 : d });
  let st = null, lastId = null, threeP = null;

  function css() {
    if (document.getElementById("t3-css")) return;
    const s = document.createElement("style"); s.id = "t3-css";
    s.textContent = `
#teren3d{margin:12px 0 6px;padding:14px 16px;background:var(--panel);border:1px solid var(--line);border-radius:12px;break-inside:avoid}
#teren3d h3{font:700 18px var(--font);margin:0 0 2px;letter-spacing:-.01em}
#teren3d .t3-sub{font:12.5px var(--font);color:var(--muted);margin:0 0 10px}
#teren3d .t3-bar{display:flex;flex-wrap:wrap;gap:8px 16px;margin:0 0 10px}
#teren3d .t3-grp{display:flex;gap:6px}
#teren3d .t3-grp button{font:500 12.5px var(--font);padding:4px 11px;border-radius:99px;border:1px solid var(--line);background:var(--panel);color:var(--fg);cursor:pointer}
#teren3d .t3-grp button[aria-pressed="true"]{background:var(--fg);color:var(--bg);border-color:var(--fg)}
#teren3d .t3-cv{position:relative;width:100%;aspect-ratio:16/10;border-radius:10px;overflow:hidden;background:#1d2a22;touch-action:pan-y;cursor:grab}
#teren3d .t3-cv canvas{width:100%;height:100%;display:block}
#teren3d .t3-lg{display:flex;flex-wrap:wrap;gap:6px 16px;margin:8px 0 0;font:12px var(--font);color:var(--muted)}
#teren3d .t3-lg i{display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:5px;vertical-align:-1px}
#teren3d .t3-n{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin:10px 0 0}
#teren3d .t3-n div{border-radius:8px;padding:7px 10px;background:color-mix(in srgb,var(--fg) 5%,var(--panel));border:1px solid var(--line)}
#teren3d .t3-n b{display:block;font:700 17px/1.1 var(--mono)} #teren3d .t3-n span{font-size:12px;color:var(--muted)}`;
    document.head.appendChild(s);
  }
  const loadThree = () => threeP || (threeP = window.THREE ? Promise.resolve() : new Promise((ok, no) => { const s = document.createElement("script"); s.src = T3; s.onload = ok; s.onerror = no; document.head.appendChild(s); }));
  const loadImg = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });

  const COL = [[0x1f, 0x8a, 0x4c], [0xe2, 0xb1, 0x00], [0xdc, 0x26, 0x26]];           // verde / galben / rosu
  const clasa = p => p < 5 ? 0 : p < 15 ? 1 : 2;

  function pante(z, n, pas) {                                                         // % pe celula, diferente centrale
    const s = new Float32Array(n * n), g = (i, j) => z[Math.max(0, Math.min(n - 1, j))][Math.max(0, Math.min(n - 1, i))];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const dx = (g(i + 1, j) - g(i - 1, j)) / (2 * pas), dy = (g(i, j + 1) - g(i, j - 1)) / (2 * pas);
      s[j * n + i] = Math.hypot(dx, dy) * 100;
    }
    return s;
  }
  function texPanta(sl, n, sat) {                                                     // canvas: satelit + culoarea riscului, 55 %
    const S = 512, c = document.createElement("canvas"); c.width = c.height = S; const x = c.getContext("2d");
    if (sat) x.drawImage(sat, 0, 0, S, S);
    const im = x.getImageData(0, 0, S, S), d = im.data;
    for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
      const fx = px / (S - 1) * (n - 1), fy = py / (S - 1) * (n - 1), i = Math.min(n - 2, Math.floor(fx)), j = Math.min(n - 2, Math.floor(fy)), u = fx - i, v = fy - j;
      const p = sl[j * n + i] * (1 - u) * (1 - v) + sl[j * n + i + 1] * u * (1 - v) + sl[(j + 1) * n + i] * (1 - u) * v + sl[(j + 1) * n + i + 1] * u * v, k = COL[clasa(p)], o = (py * S + px) * 4;
      d[o] = d[o] * .45 + k[0] * .55; d[o + 1] = d[o + 1] * .45 + k[1] * .55; d[o + 2] = d[o + 2] * .45 + k[2] * .55;
    }
    x.putImageData(im, 0, 0); return c;
  }

  function scena(box, J, sats) {
    const THREE = window.THREE, cv = box.querySelector(".t3-cv");
    const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); r.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    cv.appendChild(r.domElement);
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(38, 1.6, .1, 5000);
    sc.add(new THREE.AmbientLight(0xffffff, 1));
    const S = { r, sc, cam, J, sats, mesh: null, pin: null, mod: "sat", niv: "300", az: .7, el: .75, dist: 1, dirty: true, cv, tex: {} };
    const rot = (dx, dy) => { S.az -= dx * .008; S.el = Math.max(.12, Math.min(1.45, S.el + dy * .006)); S.dirty = true; };
    let dr = null;
    cv.addEventListener("pointerdown", e => { dr = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); cv.style.cursor = "grabbing"; });
    cv.addEventListener("pointermove", e => { if (!dr) return; rot(e.clientX - dr[0], e.clientY - dr[1]); dr = [e.clientX, e.clientY]; });
    const fin = () => { dr = null; cv.style.cursor = "grab"; };
    cv.addEventListener("pointerup", fin); cv.addEventListener("pointercancel", fin);
    cv.addEventListener("wheel", e => { if (!e.shiftKey) return; e.preventDefault(); S.dist = Math.max(.5, Math.min(1.8, S.dist * (e.deltaY > 0 ? 1.08 : .93))); S.dirty = true; }, { passive: false });
    return S;
  }

  function construieste(S) {
    const THREE = window.THREE, N = S.J.niveluri[S.niv], n = N.n, L = N.latura_m;
    if (S.mesh) { S.sc.remove(S.mesh); S.mesh.geometry.dispose(); }
    if (S.pin) S.sc.remove(S.pin);
    const rel = Math.max(.3, N.max - N.min), ex = rel >= 5 ? 1 : 2;             // scara reala (Manu, 24.10): fara exagerare; cel mult x2 cand diferenta de nivel e sub 5 m, ca sa se vada ca e aproape plat
    S.ex = ex; S.L = L;
    const g = new THREE.PlaneGeometry(L, L, n - 1, n - 1), pos = g.attributes.position;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) pos.setZ(j * n + i, (N.z[j][i] - N.min) * ex);
    g.computeVertexNormals();
    const sl = pante(N.z, n, N.pas_m), sat = S.sats[S.niv];
    const key = S.niv + S.mod;
    if (!S.tex[key]) {
      let t;
      if (S.mod === "sat") t = new THREE.Texture(sat);
      else t = new THREE.CanvasTexture(texPanta(sl, n, sat));
      t.anisotropy = 4; t.needsUpdate = true; S.tex[key] = t;
    }
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: S.tex[key] })); m.rotation.x = -Math.PI / 2; S.sc.add(m); S.mesh = m;
    const h0 = (N.alt_pin - N.min) * ex, pin = new THREE.Group(), pr = L * .012;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(pr, pr * 4, 24), new THREE.MeshBasicMaterial({ color: 0xe11d48 })); cone.rotation.x = Math.PI; cone.position.y = pr * 2;
    const ball = new THREE.Mesh(new THREE.SphereGeometry(pr * 1.5, 24, 16), new THREE.MeshBasicMaterial({ color: 0xe11d48 })); ball.position.y = pr * 5.2;
    const ring = new THREE.Mesh(new THREE.RingGeometry(pr * 2.2, pr * 3, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = pr * .2;
    pin.add(cone, ball, ring); pin.position.set(0, h0, 0); S.sc.add(pin); S.pin = pin; S.dirty = true;
    S.dist = 1; S.cen = (N.max - N.min) * ex / 2;
  }

  function reda(S) {
    const w = S.cv.clientWidth, h = S.cv.clientHeight;
    if (!w || !h) return;
    if (S.w !== w || S.h !== h) { S.w = w; S.h = h; S.r.setSize(w, h, false); S.cam.aspect = w / h; S.cam.updateProjectionMatrix(); S.dirty = true; }
    if (!S.dirty) return; S.dirty = false;
    const R = S.L * 1.15 * S.dist, c = S.cam;
    c.position.set(Math.sin(S.az) * Math.cos(S.el) * R, S.cen + Math.sin(S.el) * R, Math.cos(S.az) * Math.cos(S.el) * R);
    c.lookAt(0, S.cen * .6, 0); S.r.render(S.sc, c);
  }

  function legenda(N, S) {
    const pm = N.panta_max_pct;
    return `<div class="t3-n"><div><b>${nf(N.max - N.min)} m</b><span>diferen\u021b\u0103 de nivel \u00een ${S.niv === "300" ? "300 m" : "1,5 km"}</span></div><div><b>${nf(N.alt_pin, 0)} m</b><span>altitudinea propriet\u0103\u021bii</span></div><div><b>${nf(pm)} %</b><span>panta cea mai mare</span></div><div><b>\u00d7${nf(S.ex, 0)}</b><span>exagerarea pe vertical\u0103</span></div></div>`;
  }

  async function monteaza() {
    const Dd = typeof D !== "undefined" ? D : null, sec = document.getElementById("alunecari");
    if (!Dd || !Dd.id || !sec) return;
    let box = document.getElementById("teren3d");
    if (lastId === Dd.id) {
      if (box && sec.contains(box)) { const hero = sec.querySelector(".hero"); if (hero && hero.nextElementSibling !== box) hero.insertAdjacentElement("afterend", box); if (st) reda(st); return; }
      if (!st) return;                                             // fara date pentru locatia asta
    }
    lastId = Dd.id; box?.remove(); st = null;
    let J; try { J = await fetch(`p/${Dd.id}/teren3d.json`).then(r => r.ok ? r.json() : null); } catch (e) { J = null; }
    if (!J || lastId !== Dd.id) return;
    try {
      const [a, b] = await Promise.all([loadImg(`p/${Dd.id}/teren3d_sat_300.jpg`), loadImg(`p/${Dd.id}/teren3d_sat_1500.jpg`)]); await loadThree();
      css(); box = document.createElement("div"); box.id = "teren3d"; box.className = "keep";
      box.innerHTML = `<h3>relieful din jur, \u00een 3D</h3><p class="t3-sub">altitudinea real\u0103 a terenului, cu imaginea din satelit pus\u0103 peste ea. rote\u0219te cu mouse-ul sau cu degetul.</p>
        <div class="t3-bar"><div class="t3-grp" data-g="niv"><button type="button" data-v="300" aria-pressed="true">300 m</button><button type="button" data-v="1500" aria-pressed="false">1,5 km</button></div>
        <div class="t3-grp" data-g="mod"><button type="button" data-v="sat" aria-pressed="true">satelit</button><button type="button" data-v="panta" aria-pressed="false">panta pe scara riscului</button></div></div>
        <div class="t3-cv"></div>
        <div class="t3-lg"><span><i style="background:#1f8a4c"></i>0\u20135 % : risc mic</span><span><i style="background:#e2b100"></i>5\u201315 % : risc mediu</span><span><i style="background:#dc2626"></i>peste 15 % : risc mare</span><span><i style="background:#e11d48;border-radius:99px"></i>proprietatea</span></div><div class="t3-ds"></div>`;
      const hero = sec.querySelector(".hero"); if (hero) hero.insertAdjacentElement("afterend", box); else sec.insertBefore(box, sec.firstChild);
      st = scena(box, J, { "300": a, "1500": b }); construieste(st);
      const ds = box.querySelector(".t3-ds"), up = () => { ds.innerHTML = legenda(J.niveluri[st.niv], st); box.querySelectorAll(".t3-grp").forEach(g => g.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.v === st[g.dataset.g])))); };
      box.addEventListener("click", e => { const bt = e.target.closest(".t3-grp button"); if (!bt) return; st[bt.parentNode.dataset.g] = bt.dataset.v; construieste(st); up(); });
      up();
    } catch (e) { console.warn("t3", e && e.stack || e); box?.remove(); st = null; }
  }
  setInterval(monteaza, 700);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", monteaza); else monteaza();
  (function bucla() { if (st) reda(st); requestAnimationFrame(bucla); })();
})();
