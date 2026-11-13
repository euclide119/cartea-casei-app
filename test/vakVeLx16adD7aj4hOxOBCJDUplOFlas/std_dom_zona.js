/* v82.16.0 (13.11.2026) — împărțirea STANDARD / DOM pentru actele de urbanism pe stradă, anunțuri și vecinătăți (regula generală din BLUEPRINT §17 undecies).
   STANDARD (gratuit, p/<id>/): acte_std.json (stradă × tip × an × obiect generic), anunturi_std.json (tip, mp, preț, €/mp, zonă, numele sursei ca text; fără link, contact, poziție exactă).
   DOM (după cod, privat/): anunturi_500m.json + anunturi_500m_privat.json (poziție exactă, link, nume, telefon), privat.json (proprietari, vecini cu nume).
   Parcelele cu g7.json (G7) își au harta în g7.js (zona_std.json la standard, zona.json după cod) și anunțurile în g7_privat; aici nu se dublează. */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = v => Number(v).toLocaleString("ro-RO");
  const json = async u => { try { const r = await fetch(u, { cache: "no-cache" }); return r.ok ? await r.json() : null; } catch (e) { return null; } };
  const niv = async () => window.CC_NIVEL_P ? await window.CC_NIVEL_P : (window.parent !== window ? 1 : 2);
  let facut = null;

  function css() {
    if ($("#sdz-css")) return;
    const s = document.createElement("style"); s.id = "sdz-css";
    s.textContent = `.sdz h2{margin:0 0 6px}.sdz .lead{color:#4a5063;margin:0 0 10px}.sdz .scroll{overflow-x:auto}
.sdz table{border-collapse:collapse;width:100%;min-width:520px}.sdz td,.sdz th{border-bottom:1px solid #eee;padding:5px 6px;text-align:left;vertical-align:top;font-size:13px}.sdz th{font-weight:700;color:#3d4354}
.sdz .k{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 12px}.sdz .k span{background:#f1f5f9;border:1px solid #e2e8f0;border-radius:999px;padding:3px 10px;font-size:13px}
.sdz .nt{font:13px/1.5 var(--font);color:#4a5063;background:#f4f6f9;border-radius:8px;padding:8px 10px;margin:8px 0}.sdz svg{width:100%;height:auto;border:1px solid #e2e8f0;border-radius:10px;background:#f7f9fb}
.sdz a{color:#1d5fb0}`;
    document.head.appendChild(s);
  }
  const sec = (id, h) => { const e = document.getElementById(id); if (!e) return null; e.classList.add("sdz"); e.hidden = false; e.innerHTML = h; return e; };
  const ascunde = id => { const e = document.getElementById(id); if (e) { e.hidden = true; e.innerHTML = ""; } };
  const tab = (cap, rows) => `<div class="scroll"><table><tr>${cap.map(c => `<th>${c}</th>`).join("")}</tr>${rows.join("")}</table></div>`;
  const eur = a => a.pret ? `${nf(Math.round(a.pret))} ${esc(a.moneda || "")}` : "—";

  /* STANDARD: acte AC / CU / PUZ pe stradă (generic) */
  function acteStd(A) {
    const T = A.pe_tip || {}, R = (A.rows || []).slice(0, 40);
    return `<h2>Autorizații, certificate și PUZ pe stradă</h2><p class="lead">Ce s-a autorizat în zonă, la nivel de stradă: tip act, an și obiect. Numele beneficiarilor, numerele cadastrale și poziția pe parcelă sunt în DOM.</p>
      <div class="k"><span><b>${nf(A.total || 0)}</b> acte în total</span>${Object.keys(T).map(k => `<span><b>${nf(T[k])}</b> ${esc(k)}</span>`).join("")}</div>
      ${tab(["Stradă / zonă", "Act", "An", "Obiect", "Număr"], R.map(r => `<tr><td>${esc(r.strada)}</td><td>${esc(r.tip)}</td><td>${esc(r.an)}</td><td>${esc(r.obiect)}</td><td>${nf(r.n)}</td></tr>`))}`;
  }

  /* STANDARD: anunțuri generice (sursa ca text, fără link, contact, poziție exactă) */
  function anunturiStd(N) {
    const L = (N.anunturi || []).slice().sort((x, y) => (x.dist || 0) - (y.dist || 0)), st = N.stat || {};
    const por = {}; L.forEach(a => por[a.sursa] = (por[a.sursa] || 0) + 1);
    return `<h2>Anunțuri din zonă</h2><p class="lead">Oferte de vânzare din jur, în formă generică: tip, suprafață, preț și zona aproximativă. Linkul, contactul și poziția exactă sunt în DOM.</p>
      <div class="k"><span><b>${nf(st.n || L.length)}</b> anunțuri</span>${st.eur_mp_median ? `<span><b>${nf(st.eur_mp_median)} €/mp</b> mediană teren</span>` : ""}${Object.keys(por).map(k => `<span>${esc(k)}: ${nf(por[k])}</span>`).join("")}</div>
      ${tab(["Tip", "Suprafață", "Preț", "€/mp", "Zona", "Sursa", "Distanță"], L.slice(0, 40).map(a => `<tr><td>${esc(a.tip)}</td><td>${a.mp ? nf(Math.round(a.mp)) + " mp" : "—"}</td><td>${eur(a)}</td><td>${a.eur_mp ? nf(Math.round(a.eur_mp)) : "—"}</td><td>${esc(a.zona)}</td><td>${esc(a.sursa)}</td><td>≈ ${nf(a.dist || 0)} m</td></tr>`))}`;
  }

  /* DOM: anunțuri complete (poziție exactă, link, contact) + hartă cu punctele exacte */
  function anunturiDom(N, V, pin) {
    const pv = {}; ((V && V.anunturi) || []).forEach(x => pv[x.id_anunt] = x);
    const L = (N.anunturi || []).filter(a => a.lat && a.lon).sort((x, y) => (x.dist_m || 0) - (y.dist_m || 0));
    let hartaSvg = "";
    if (pin && L.length) {
      const k = Math.cos(pin[0] * Math.PI / 180), W = 700, R = Math.max(...L.map(a => Math.hypot((a.lon - pin[1]) * k, a.lat - pin[0]))) * 1.08 || 0.01;
      const X = lo => W / 2 + (lo - pin[1]) * k / R * (W / 2), Y = la => W / 2 - (la - pin[0]) / R * (W / 2);
      hartaSvg = `<svg viewBox="0 0 ${W} ${W}" role="img" aria-label="anunțurile din zonă, poziție exactă"><circle cx="${W / 2}" cy="${W / 2}" r="${W / 2 - 2}" fill="none" stroke="#cbd5e1"/>` +
        L.map((a, i) => `<circle cx="${X(a.lon).toFixed(1)}" cy="${Y(a.lat).toFixed(1)}" r="7" fill="#c2185b" fill-opacity=".8" stroke="#fff" stroke-width="2"><title>${esc((a.tip_teren || "teren") + " · " + (a.mp || "?") + " mp · " + eur(a))}</title></circle>`).join("") +
        `<circle cx="${W / 2}" cy="${W / 2}" r="9" fill="#ff2a2a" stroke="#fff" stroke-width="3"/></svg>`;
    }
    const rows = L.map(a => { const p = pv[a.id_anunt] || {}, tel = (p.tel || []).join(", ");
      return `<tr><td>${a.url ? `<a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.titlu || "anunț")}</a>` : esc(a.titlu || "")}</td><td>${a.mp ? nf(Math.round(a.mp)) + " mp" : "—"}</td><td>${eur(a)}</td><td>${a.eur_mp ? nf(Math.round(a.eur_mp)) : "—"}</td><td>${esc(a.strada || "")}</td><td>${esc(p.nume || "")}${tel ? "<br>" + esc(tel) : ""}</td><td>${esc(a.portal || "")}</td><td>${nf(a.dist_m || 0)} m<br><small>${a.lat.toFixed(5)}, ${a.lon.toFixed(5)}</small></td></tr>`; });
    return `<h2>Anunțuri complete (DOM)</h2><p class="lead">Poziția exactă, linkul direct, numele și contactul vânzătorului.</p>${hartaSvg}<div class="k"><span><b>${nf(L.length)}</b> anunțuri în ${nf(N.raza_m || 500)} m</span></div>
      ${tab(["Anunț", "Suprafață", "Preț", "€/mp", "Stradă", "Contact", "Sursă", "Poziție"], rows)}`;
  }

  /* DOM: vecinătăți cu nume: proprietari, vecini, beneficiari de pe parcelele apropiate */
  function vecinatatiDom(V, J) {
    let h = `<h2>Vecinătăți (DOM)</h2><p class="lead">Cine deține, cine se învecinează și cine a luat acte pe parcelele din jur.</p>`;
    const P = (V && V.proprietari) || [];
    if (P.length) h += `<h3>Proprietari</h3>` + tab(["CF", "Nume", "Cotă"], P.map(p => `<tr><td>${esc(p.cf)}</td><td>${esc(p.nume)}</td><td>${esc(p.cota || "")}</td></tr>`));
    const Ve = (V && V.vecini) || {}, vk = Object.keys(Ve).filter(k => Ve[k]);
    if (vk.length) h += `<h3>Vecini</h3>` + tab(["Direcție", "Vecin"], vk.map(k => `<tr><td>${esc(k)}</td><td>${esc(Ve[k])}</td></tr>`));
    const cfc = r => { const l = String(r.nc || r.cf || "").split(/[;,\s]+/).filter(Boolean); return l.slice(0, 3).join(", ") + (l.length > 3 ? ` +${l.length - 3}` : ""); };
    const B = [...((J && J.cu) || []), ...((J && J.ac) || []), ...((J && J.puz) || [])].filter(r => r.distanta_m != null && r.distanta_m <= 150).sort((x, y) => x.distanta_m - y.distanta_m).slice(0, 30)
      .map(r => { const v = r.beneficiar, t = v && typeof v === "object" ? v.valoare : v; return { r, t }; });
    if (B.length) h += `<h3>Beneficiari pe parcele la cel mult 150 m</h3>` + tab(["Act", "Beneficiar", "Parcela (NC / CF)", "Distanță"], B.map(({ r, t }) => `<tr><td>${esc(r.tip || "PUZ")} ${esc(r.numar || r.numar_hcl || "")}${r.an ? "/" + esc(r.an) : ""}</td><td>${t ? esc(t) : "nedeclarat"}</td><td>${esc(cfc(r) || r.adresa_cf || "")}</td><td>${nf(r.distanta_m)} m</td></tr>`));
    return P.length || vk.length || B.length ? h : "";
  }

  async function porneste() {
    const Dd = typeof D !== "undefined" ? D : null; if (!Dd || !Dd.id) return;
    const N = await niv(), cheie = Dd.id + "|" + (N >= 2 ? 2 : 1); if (facut === cheie) return; facut = cheie;
    css();
    const P = `p/${encodeURIComponent(Dd.id)}/`, esteG7 = !!(await json(P + "g7.json"));
    const [A, Sn] = await Promise.all([esteG7 ? null : json(P + "acte_std.json"), esteG7 ? null : json(P + "anunturi_std.json")]);
    A && A.total ? sec("acte_zona", acteStd(A)) : ascunde("acte_zona");
    Sn && (Sn.anunturi || []).length ? sec("anunturi_zona", anunturiStd(Sn)) : ascunde("anunturi_zona");
    if (N < 2) { ascunde("anunturi_dom"); ascunde("vecinatati_dom"); window.CC_ACORDEON && window.CC_ACORDEON.reia && window.CC_ACORDEON.reia(8000); return; }
    const [An, Ap, V, J] = await Promise.all([json(P + "anunturi_500m.json"), json(P + "anunturi_500m_privat.json"), json(P + "privat.json"), json(P + "date_fine_aproape.json")]);
    const pin = (J && J.proprietate && J.proprietate.lat != null) ? [J.proprietate.lat, J.proprietate.lon] : null;
    An && (An.anunturi || []).length ? sec("anunturi_dom", anunturiDom(An, Ap, pin)) : ascunde("anunturi_dom");
    const vh = esteG7 ? "" : vecinatatiDom(V, J); vh ? sec("vecinatati_dom", vh) : ascunde("vecinatati_dom");
    window.CC_ACORDEON && window.CC_ACORDEON.reia && window.CC_ACORDEON.reia(8000);
  }
  setInterval(() => { try { porneste(); } catch (e) { console.warn("std_dom_zona", e); } }, 1500);
})();
