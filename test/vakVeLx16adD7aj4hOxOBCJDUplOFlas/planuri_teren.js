/* Raportul Casei · modul opțional „Cadastru” + „Proprietate” + „Planșe” (planuri_teren.js v1.2.0; v1.0.0 13.11.2026, v1.1.0 20.11.2026: secțiunea „Planșe” din planuri.json › planse; v1.2.0 20.11.2026: listă generică opțională planuri.json › sectiuni [{id, titlu, intro, antet, tabel, format, blocuri, grupuri, nota, admin_privat}] — fiecare devine o filă (Cadastru, Urbanism, Best uses); fiecare parte doar dacă există în date). Blueprintul rămâne neatins: nu face nimic fără p/<id>/planuri.json.
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
.pt-n{font:12.5px/1.5 var(--font);color:var(--muted)}
.pt-cd{border:1px solid #c9ced8;border-radius:12px;padding:10px 12px;background:var(--panel)}.pt-cd>b{display:block;margin-bottom:4px;font:600 14px/1.4 var(--font)}.pt-cd p{margin:5px 0;font:13px/1.5 var(--font)}.pt-cd i{display:block;font-style:normal;color:var(--muted);font-size:11.5px;text-transform:uppercase;letter-spacing:.04em}
.pt-ta td,.pt-ta th{white-space:normal!important}.pt-ta td:first-child{color:inherit}.pt-ta th{font-size:12px}
.pt-bl{border:1px solid #c9ced8;border-radius:12px;padding:10px 12px;background:var(--panel)}.pt-bl h3{margin:0 0 6px}
.pt-f a{display:block}.pt-f .pt-lc{padding:18px 12px;font:13px/1.5 var(--font);color:#3b4252;background:#f4f6fa}`;
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

  /* v1.1.0: planșele trimise pentru raport (PUZ în lucru, prezentări); imaginile „plansa_*” sunt private: se văd după codul DOM, altfel rămâne nota */
  function planse(id, P) {
    const s = fila("planse", P.titlu || "Planșe", "urbanism"); if (!s) return;
    const f = p => `<figure class="pt-f"><a href="p/${esc(id)}/${esc(p.f)}" target="_blank" rel="noopener"><img src="p/${esc(id)}/${esc(p.f)}" alt="${esc(p.t)}" loading="lazy" onerror="this.parentNode.outerHTML='<div class=&quot;pt-lc&quot;>🔒 Planșa se deschide cu codul DOM.</div>'"></a><figcaption><b>${esc(p.t)}</b>${esc(p.d)}</figcaption></figure>`;
    s.innerHTML = `<div class="pt-w"><h2>${esc(P.titlu || "Planșe")}</h2>${P.intro ? `<p class="pt-n">${esc(P.intro)}</p>` : ""}
${(P.grupuri || []).map(g => `<h3>${esc(g.t)}</h3>${(g.p || []).map(f).join("")}`).join("")}</div>`;
  }

  /* v1.2.0: secțiuni generice din planuri.json › sectiuni */
  const figL = (id, p) => `<figure class="pt-f"><a href="p/${esc(id)}/${esc(p.f)}" target="_blank" rel="noopener"><img src="p/${esc(id)}/${esc(p.f)}" alt="${esc(p.t)}" loading="lazy" onerror="this.parentNode.outerHTML='<div class=&quot;pt-lc&quot;>🔒 Imaginea se deschide cu codul DOM.</div>'"></a><figcaption><b>${esc(p.t)}</b>${esc(p.d)}</figcaption></figure>`;
  const tabG = (rows, antet) => `<div class="pt-sc"><table class="pt-t${antet ? " pt-ta" : ""}">${antet ? `<thead><tr>${antet.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead>` : ""}<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  const carduri = (rows, antet) => `<div class="pt-w">${rows.map(r => `<div class="pt-cd"><b>${esc(r[0])}</b>${antet.slice(1).map((h, i) => `<p><i>${esc(h)}</i>${esc(r[i + 1])}</p>`).join("")}</div>`).join("")}</div>`;

  async function privatDom(id) {
    try {
      const r = await fetch(`p/${id}/privat.json`); if (!r.ok) throw 0; const V = await r.json();
      const own = (V.proprietari || []).map(o => [`CF ${o.cf}: ${o.nume}`, `cota ${o.cota}`, o.titlu || ""]);
      const sar = (V.sarcini || []).map(o => [`CF ${o.cf}: sarcină`, "", o.titlu || ""]);
      return `<h3>🔓 Proprietari și drepturi (DOM)</h3>${tabG(own.concat(sar), ["Titular", "Cota", "Act / înscriere"])}<p class="pt-n">Date din extrasul CF, vizibile doar cu codul DOM; nu se publică.</p>`;
    } catch (e) { return `<h3>Proprietari și drepturi</h3><p class="pt-n">🔒 Se deschid cu codul DOM.</p>`; }
  }

  async function sectiune(id, S) {
    if (!S || !S.id || !S.titlu) return;
    const s = fila(S.id, S.titlu, S.dupa || "urbanism"); if (!s) return;
    let h = `<div class="pt-w"><h2>${esc(S.titlu)}</h2>${S.intro ? `<p class="pt-n">${esc(S.intro)}</p>` : ""}`;
    if (S.tabel) h += (S.format === "carduri" && S.antet) ? carduri(S.tabel, S.antet) : tabG(S.tabel, S.antet);
    if (S.nota) h += `<p class="pt-n">${esc(S.nota)}</p>`;
    (S.blocuri || []).forEach(b => {
      h += `<div class="pt-bl"><h3>${esc(b.t)}</h3>${b.text ? `<p class="pt-n">${esc(b.text)}</p>` : ""}${b.tabel ? tabG(b.tabel) : ""}${b.lista ? `<ul class="pt-l">${b.lista.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div>`;
    });
    (S.grupuri || []).forEach(g => { h += `<h3>${esc(g.t)}</h3><div class="pt-g">${(g.p || []).map(p => figL(id, p)).join("")}</div>`; });
    if (S.admin_privat) h += await privatDom(id);
    s.innerHTML = h + "</div>";
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
      if (J.cadastru) cadastru(Dd.id, J.cadastru); if (J.proprietate) await proprietate(Dd.id, J.proprietate); if (J.planse) planse(Dd.id, J.planse);
      for (const S of (J.sectiuni || [])) await sectiune(Dd.id, S);
    } catch (e) { console.warn("planuri_teren", e); }
  }, 700);
})();
