/* Cartea Casei ? ?nsorire: elementele de prezentare din extrasul ??nsorire CF 41878? (21.10.2026, cerut de Manu):
   ceasul cu starea zi / amurg / noapte, bara celor 24 de ore colorat?, orele de zi ?i de noapte pe luna aleas?, preseturile 21 dec / 20 mar / 21 iun,
   butoanele ?Mi?c? ora? ?i ?Mi?c? lunile?, graficul zi / noapte pe tot anul ?i pragul de 1,5 h de soare direct la 21 decembrie.
   Se monteaz? singur ?n #insorire, dup? coloanele cu cifre; se actualizeaz? c?nd se schimb? luna sau ora (?nvele?te renderSun din index.html).
   Calcul astronomic (SunCalc, ca ?n pagin?): f?r? umbrele cl?dirilor reale. Nu modific? nimic din capitolul existent. */
(function () {
  const sec = document.getElementById("insorire");
  if (!sec || typeof renderSun !== "function" || typeof dayInfo !== "function") return;
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const hh = m => { const h = Math.floor(m / 60), mi = Math.round(m % 60); return `${h} h ${String(mi).padStart(2, "0")} min`; };
  const COL = { zi: "#ffd24d", amurg: "#e0805a", noapte: "#1e2850" };

  function css() {
    if (document.getElementById("ip-css")) return;
    const s = document.createElement("style"); s.id = "ip-css";
    s.textContent = `
#ip{display:flex;flex-direction:column;gap:12px}
.ip-card{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:10px;min-width:0}
.ip-h{font:600 11px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.ip-top{display:flex;flex-wrap:wrap;gap:12px 18px;align-items:center}
.ip-clock{display:flex;align-items:center;gap:10px}
.ip-clock b{font:700 28px/1 var(--mono);letter-spacing:-.02em}
.ip-st{font:600 12px var(--font);padding:3px 10px;border-radius:99px;color:#fff}
.ip-ch{display:flex;flex-wrap:wrap;gap:6px}
.ip-ch button{font:500 12.5px var(--font);padding:4px 10px;border-radius:99px;border:1px solid var(--line);background:var(--panel);color:var(--fg);cursor:pointer}
.ip-ch button[aria-pressed="true"]{background:var(--fg);color:var(--bg);border-color:var(--fg)}
.ip-24{display:flex;height:30px;border-radius:6px;overflow:hidden;border:1px solid var(--line);position:relative}
.ip-24 i{display:block;height:100%}
.ip-24 u{position:absolute;top:-2px;bottom:-2px;width:2px;background:#fff;box-shadow:0 0 0 1.5px #1a1e2a;text-decoration:none}
.ip-tk{display:flex;justify-content:space-between;font:11px var(--mono);color:var(--muted)}
.ip-n{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px}
.ip-n div{border-radius:8px;padding:8px 10px;background:color-mix(in srgb,var(--c) 14%,var(--panel));border:1px solid color-mix(in srgb,var(--c) 40%,transparent)}
.ip-n b{display:block;font:700 18px/1.1 var(--mono)} .ip-n span{font-size:12px;color:var(--muted)}
.ip-yr{width:100%;height:auto;display:block}
.ip-lg{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12px;color:var(--muted)} .ip-lg i{display:inline-block;width:11px;height:11px;border-radius:2px;margin-right:5px;vertical-align:-1px}
.ip-v{font-size:13.5px;padding:8px 10px;border-radius:8px;background:color-mix(in srgb,var(--summer) 22%,transparent)}`;
    document.head.appendChild(s);
  }

  function ziNoapte(luna) {            // minute cu soarele peste orizont / \u00een amurg civil / \u00een noapte, pe ziua de 21 a lunii
    let zi = 0, am = 0, segs = [];
    for (let t = 0; t < 1440; t += 5) { const a = sunAt(luna, t).alt / RAD, c = a > -0.833 ? "zi" : a > -6 ? "amurg" : "noapte";
      if (c === "zi") zi += 5; else if (c === "amurg") am += 5; segs.push(c); }
    return { zi, am, noapte: 1440 - zi - am, segs };
  }

  function montaj() {
    css();
    let box = document.getElementById("ip"); if (box) return box;
    box = document.createElement("div"); box.id = "ip"; box.className = "keep";
    const ancora = sec.querySelector(".two") || sec.lastElementChild;
    ancora.after(box); return box;
  }

  let joc = null;                       // anima\u021bia activ\u0103: "ora" sau "luna"
  function opre\u0219te() { if (joc) { clearInterval(joc.t); joc = null; } }

  function deseneaza() {
    if (!D) return;
    const box = montaj(), L = month, z = ziNoapte(L), di = dayInfo(L);
    const stare = hour * 60 + 30;
    const a = sunAt(L, hour * 60).alt / RAD, st = a > -0.833 ? "zi" : a > -6 ? "amurg" : "noapte";
    const nume = { zi: "zi", amurg: "amurg", noapte: "noapte" }[st];
    // bara celor 24 de ore: segmente de 5 minute, grupate pe stare
    let bar = "", i = 0; while (i < z.segs.length) { let j = i; while (j < z.segs.length && z.segs[j] === z.segs[i]) j++;
      bar += `<i style="width:${100 * (j - i) / z.segs.length}%;background:${COL[z.segs[i]]}" title="${z.segs[i]} ${hm(i * 5)}\u2013${hm(j * 5)}"></i>`; i = j; }
    const cursor = `<u style="left:${100 * stare / 1440}%" title="ora aleas\u0103"></u>`;
    const preset = [["21 dec", 11], ["20 mar", 2], ["21 iun", 5]].map(([t, m]) => `<button type="button" data-m="${m}" aria-pressed="${L === m}">${t}</button>`).join("");
    // grafic pe tot anul: zi \u0219i noapte, \u00een ore, pe luna 21
    const W = 640, Ht = 200, L0 = 30, R0 = 8, T0 = 14, B0 = 168, bw = (W - L0 - R0) / 12;
    let g = "";
    [0, 6, 12, 18, 24].forEach(h => { const y = B0 - (B0 - T0) * h / 24; g += `<line x1="${L0}" x2="${W - R0}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width=".8"/><text x="${L0 - 5}" y="${y + 4}" font-size="10.5" fill="var(--muted)" text-anchor="end">${h}</text>`; });
    for (let m = 0; m < 12; m++) { const zm = ziNoapte(m), zi = zm.zi / 60, am = zm.am / 60, no = zm.noapte / 60, x = L0 + m * bw + 4, w = bw - 8;
      const yz = B0 - (B0 - T0) * zi / 24, ya = yz - (B0 - T0) * am / 24;
      g += `<rect x="${x}" y="${yz}" width="${w}" height="${B0 - yz}" fill="${COL.zi}" opacity="${m === L ? 1 : .75}"/><rect x="${x}" y="${ya}" width="${w}" height="${yz - ya}" fill="${COL.amurg}" opacity="${m === L ? 1 : .75}"/><rect x="${x}" y="${T0}" width="${w}" height="${ya - T0}" fill="${COL.noapte}" opacity="${m === L ? 1 : .8}"/>`;
      g += `<text x="${x + w / 2}" y="${B0 + 14}" font-size="11" fill="${m === L ? "var(--fg)" : "var(--muted)"}" text-anchor="middle" font-weight="${m === L ? 700 : 400}">${LUNI[m]}</text>`;
      g += `<text x="${x + w / 2}" y="${yz + 12}" font-size="9.5" fill="#2a2200" text-anchor="middle">${nf(zi, 1)}</text>`; }
    const dec = ziNoapte(11), dec15 = dec.zi >= 90;
    box.innerHTML = `<div class="ip-card"><div class="ip-h">Ziua \u0219i noaptea \u00b7 ${esc(LUNI_L[L])}, ziua de 21</div>
      <div class="ip-top"><div class="ip-clock"><b>${String(hour).padStart(2, "0")}:00</b><span class="ip-st" style="background:${COL[st] === COL.zi ? "#c98a00" : COL[st]}">${nume}</span></div>
        <div class="ip-ch" role="group" aria-label="Zile de referin\u021b\u0103">${preset}<button type="button" data-p="ora" aria-pressed="${joc && joc.k === "ora"}">\u25b6 Mi\u0219c\u0103 ora</button><button type="button" data-p="luna" aria-pressed="${joc && joc.k === "luna"}">\u25b6 Mi\u0219c\u0103 lunile</button></div></div>
      <div><div class="ip-24" role="img" aria-label="Cele 24 de ore, colorate pe zi, amurg \u0219i noapte">${bar}${cursor}</div><div class="ip-tk"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div></div>
      <div class="ip-n">
        <div style="--c:#c98a00"><b>${hh(z.zi)}</b><span>ore de zi (soarele peste orizont)</span></div>
        <div style="--c:#e0805a"><b>${hh(z.am)}</b><span>amurg civil (diminea\u021ba \u0219i seara)</span></div>
        <div style="--c:#1e2850"><b>${hh(z.noapte)}</b><span>ore de noapte</span></div>
        <div style="--c:#6b7280"><b>${hm(di.rise)} \u00b7 ${hm(di.set)}</b><span>r\u0103s\u0103rit \u00b7 apus</span></div></div>
      <div class="ip-lg"><span><i style="background:${COL.zi}"></i>zi</span><span><i style="background:${COL.amurg}"></i>amurg civil (soarele sub orizont, p\u00e2n\u0103 la \u22126\u00b0)</span><span><i style="background:${COL.noapte}"></i>noapte</span></div></div>
      <div class="ip-card"><div class="ip-h">Zi, amurg \u0219i noapte pe tot anul \u00b7 ziua de 21 a fiec\u0103rei luni (ore)</div>
      <svg class="ip-yr" viewBox="0 0 ${W} ${Ht}" role="img" aria-label="Orele de zi, amurg \u0219i noapte pe luni">${g}</svg>
      <div class="ip-v"><b>Soare direct la 21 decembrie:</b> f\u0103r\u0103 obstacole, soarele st\u0103 peste orizont ${hh(dec.zi)} (r\u0103s\u0103rit ${hm(dayInfo(11).rise)}, apus ${hm(dayInfo(11).set)}). Norma de igien\u0103 cere cel pu\u021bin 1,5 h de soare direct \u00een camerele de locuit la solsti\u021biul de iarn\u0103 (Ordinul MS 119/2014; valoarea e de confirmat \u00een textul \u00een vigoare) ${dec15 ? "\u2014 limita se poate atinge doar dac\u0103 nu exist\u0103 cl\u0103diri sau copaci care umbresc" : ""}. Umbrele cl\u0103dirilor reale nu sunt incluse.</div></div>`;
    box.querySelectorAll("button[data-m]").forEach(b => b.onclick = () => { opre\u0219te(); month = +b.dataset.m; renderSun(); });
    box.querySelectorAll("button[data-p]").forEach(b => b.onclick = () => { const k = b.dataset.p; if (joc && joc.k === k) { opre\u0219te(); deseneaza(); return; } opre\u0219te();
      joc = { k, t: setInterval(() => { if (k === "ora") { hour = (hour + 1) % 24; } else { month = ORDINE[(ORDINE.indexOf(month) + 1) % 12]; } renderSun(); }, k === "ora" ? 450 : 900) }; deseneaza(); });
  }

  const orig = renderSun;
  renderSun = function () { orig(); try { deseneaza(); } catch (e) { console.warn("insorire_plus", e); } };
  window.IP = { deseneaza };
  const t0 = setInterval(() => { try { if (D && sec) { clearInterval(t0); deseneaza(); } } catch (e) {} }, 400);
  setTimeout(() => clearInterval(t0), 20000);
})();
