/* Raportul Casei · modul opțional „Cadastru” + „Proprietate” (planuri_teren.js v1.0.0, 13.11.2026). Blueprintul rămâne neatins: nu face nimic fără p/<id>/planuri.json.
   Cerința lui Manu (13.11.2026): capitol cadastral și capitol proprietate, cu planurile trimise de el folosite cu prioritate acolo unde le indică.
   Datele publice nu au nume de persoane; proprietarii apar doar în Admin local (privat.json). Secțiunile intră în capitolul „Ce poți construi”, înaintea urbanismului. */
(function () {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = (v, d = 0) => Number(v).toLocaleString("ro-RO", { maximumFractionDigits: d, minimumFractionDigits: d });
  let cur = null;
  const st = document.createElement("style"); st.id = "pt-css";
  st.textContent = `
.pt-w{display:flex;flex-direction:column;gap:14px}
.pt-w h2{margin:0 0 4px;font-family:"Fraunces",Georgia,serif}.pt-w h3{margin:6px 0 2px;font-size:16px}
.pt-t{width:100%;border-collapse:collapse;font:13px/1.45 var(--font);background:var(--panel);border:1px solid #c9ced8;border-radius:12px;overflow:hidden}
.pt-t th,.pt-t td{padding:7px 10px;border-top:1px solid var(--line);text-align:left;vertical-align:top}.pt-t thead th{border-top:0;background:#eef1f6}
.pt-t td:first-child{color:var(--muted);white-space:nowrap}
.pt-sc{overflow-x:auto;max-width:100%}
.pt-f{margin:0;border:1px solid #c9ced8;border-radius:12px;background:#fff;overflow:hidden}
.pt-w .pt-f img{display:block;width:100%!important;height:auto!important;max-height:none!important;aspect-ratio:auto!important;object-fit:contain!important;position:static!important}
.pt-f figcaption{padding:8px 12px;font:12.5px/1.45 var(--font);color:#3b4252}.pt-f figcaption b{display:block;color:#1b2230}
.pt-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}
.pt-l{margin:0;padding-left:18px;font:13px/1.6 var(--font)}
.pt-n{font:12.5px/1.5 var(--font);color:var(--muted)}`;
  document.head.appendChild(st);

  function fila(k, titlu, dupa) {
    const ref = document.querySelector(`nav#tabs [data-t="${dupa}"]`);
    if (ref && !document.querySelector(`nav [data-t="${k}"]`)) { const b = document.createElement("button"); b.setAttribute("role", "tab"); b.dataset.t = k; b.textContent = titlu; b.onclick = () => window.showTab(k); ref.before(b); }
    if (!document.getElementById(k)) { const s = document.createElement("section"); s.id = k; s.hidden = true; document.querySelector(".wrap")?.appendChild(s); }
    try { EL[k] = k; EL_INV[k] = k; } catch (e) {}
    return document.getElementById(k);
  }
  const fig = (id, p) => p ? `<figure class="pt-f"><img src="p/${esc(id)}/${esc(p.f)}" alt="${esc(p.t)}"><figcaption><b>${esc(p.t)}</b>${esc(p.d)}</figcaption></figure>` : "";
  const tab = rows => `<div class="pt-sc"><table class="pt-t"><tbody>${rows.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join("")}</tbody></table></div>`;

  function cadastru(id, C) {
    const s = fila("cadastru", "Cadastru", "urbanism"); if (!s) return;
    const I = C.imobile, U = C.unit;
    const cols = ["CF", "Nr. cadastral", "CF vechi", "Nr. cadastral vechi", "Tarla / parcelă", "Nr. topo", "Suprafață (act)", "Suprafață măsurată pe plan", "Folosință", "Laturi (m)"];
    const val = m => [m.cf, m.nc, m.cf_vechi, m.nc_vechi, `${m.tarla} / ${m.parcela}`, m.topo, nf(m.suprafata_mp) + " mp", nf(m.suprafata_masurata_mp, 1) + " mp", `${m.folosinta}, extravilan`, m.segmente_m.map(x => nf(x, 3)).join(" · ")];
    s.innerHTML = `<div class="pt-w"><h2>Cadastru</h2>
<p class="pt-n">Terenul unit: ${nf(U.suprafata_mp)} mp în acte (${nf(U.suprafata_masurata_mp, 1)} mp pe plan), două fâșii lipite de câte ≈ 18,8 m, împreună ≈ ${nf(U.latime_m, 1)} × ${nf(U.lungime_m, 1)} m.</p>
<div class="pt-sc"><table class="pt-t"><thead><tr><th></th>${I.map(m => `<th>CF ${esc(m.cf)}</th>`).join("")}</tr></thead><tbody>${cols.map((c, k) => `<tr><td>${esc(c)}</td>${I.map(m => `<td>${esc(val(m)[k])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
<h3>Vecinătăți</h3>${tab(C.vecini)}
<h3>Planuri cadastrale</h3>${fig(id, C.planuri[0])}<div class="pt-g">${C.planuri.slice(1).map(p => fig(id, p)).join("")}</div></div>`;
  }

  async function proprietate(id, P) {
    const s = fila("proprietate", "Proprietate", "urbanism"); if (!s) return;
    const Z = P.puz_vecin;
    let adm = "";
    const admin = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && !/[?&]client=1/.test(location.search);
    if (admin) { try { const r = await fetch(`p/${id}/privat.json`); if (r.ok) { const V = await r.json(); adm = `<p class="pt-n">🔓 admin (local, nu se publică): ${(V.proprietari || []).map(o => `CF ${esc(o.cf)}: ${esc(o.nume)} (${esc(o.cota)}, ${esc(o.avertisment)})`).join(" · ")}${V.proprietari_actuali_declarati ? ` · declarați actuali: ${esc(V.proprietari_actuali_declarati.nume)} (${esc(V.proprietari_actuali_declarati.nota)})` : ""}</p>`; } } catch (e) {} }
    s.innerHTML = `<div class="pt-w"><h2>Proprietate</h2>
${tab(P.situatie)}${adm}
<h3>Parcelare: simulare pe teren</h3>${fig(id, P.lotizare)}
<h3>PUZ-ul vecin, lipit la nord</h3>${fig(id, Z)}
<div class="pt-g"><div>${tab(Z.bilant.map(b => [b[0], `${nf(b[1])} mp · ${nf(b[2], 2)} %`]))}</div><div>${tab(Z.indicatori)}<p class="pt-n">${esc(Z.loturi)}.</p></div></div>
<h3>PUG</h3>${fig(id, P.pug)}
<h3>Ce lipsește din dosar</h3><ul class="pt-l">${P.lipsa.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
  }

  setInterval(async () => {
    try {
      const Dd = typeof D !== "undefined" ? D : null; if (!Dd || !Dd.id || cur === Dd.id || !document.querySelector('nav#tabs [data-t="urbanism"]')) return;
      cur = Dd.id;
      const r = await fetch(`p/${Dd.id}/planuri.json`); if (!r.ok) return;
      const J = await r.json(); if (!J || !J.activ) return;
      cadastru(Dd.id, J.cadastru); await proprietate(Dd.id, J.proprietate);
    } catch (e) { console.warn("planuri_teren", e); }
  }, 700);
})();
