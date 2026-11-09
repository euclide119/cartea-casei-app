/* Raport _ Cartea Casei - „Date fine din jurul proprietății” (v82.11.0, 09.11.2026, cerut de Manu).
   Din p/<id>/date_fine_aproape_mostra.json (nivelul ASCUNS, mascat la sursă: valorile sensibile au doar primele 4 caractere) și, la nivelul ARĂTAT,
   din p/<id>/date_fine_aproape.json (Admin, după butonul „Arată”, cod 1357) sau din funcția server `date_fine_livrare` (Client după plată, filtrată pe server:
   persoanele cu sursa_publica ONRC/AC/CU/PUZ; persoanele fără sursă publică, telefoanele din anunțuri și contactele alocate nu ajung la client).
   Valoarea reală NU se află în pagină la nivelul ascuns. Fără CNP. 20 firme, 20 CU, 20 AC, 20 PUZ, investiții declarate pe comună, alte date (densitate).
   Rând gol = motivul scris; „investitii_lipsa” doar la Admin; investiție fără termen: „termen neprecizat”; fiecare rând: sursă, data sursei, încredere. */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = v => Number(v).toLocaleString("ro-RO");
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const ADMIN = () => window.parent === window && ((local && !window.CC_CLIENT) || !!(window.CC_ADM && window.CC_ADM.adm && (!window.CC_ADM.ca_client || window.CC_ADM.n >= 2)));
  const SEC = "date_fine_aproape";
  let arataAdmin = false, facut = null;

  function css() {
    if ($("#dfa-css")) return;
    const s = document.createElement("style"); s.id = "dfa-css";
    s.textContent = `#${SEC} .dfa-x{filter:blur(4px);user-select:none;pointer-events:none}
.dfa-cnt{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 12px}.dfa-cnt span{background:#f1f5f9;border:1px solid #e2e8f0;border-radius:999px;padding:3px 10px;font-size:13px}
#${SEC} h3{margin:16px 0 6px;font-size:16px}#${SEC} .scroll{overflow-x:auto}#${SEC} table{border-collapse:collapse;width:100%;min-width:560px}
#${SEC} td,#${SEC} th{border-bottom:1px solid #eee;padding:5px 6px;text-align:left;vertical-align:top;font-size:13px}#${SEC} th{font-weight:700;color:#3d4354}
.dfa-gol{font:13px/1.5 var(--font);color:#4a5063;background:#f4f6f9;border-radius:8px;padding:8px 10px}
.dfa-adm{display:inline-block;font:600 12px var(--font);background:#e8f5ec;border:1px solid #a9d8b8;border-radius:8px;padding:3px 8px;margin:6px 0}
.dfa-btn{font:700 14px var(--font);padding:10px 14px;border-radius:10px;border:0;background:#1d5fb0;color:#fff;cursor:pointer;margin:6px 6px 6px 0}
.dfa-i{font:700 12px var(--font);width:22px;height:22px;border-radius:50%;border:1px solid #8a6d00;background:#fff3b0;color:#3a2e00;cursor:pointer;margin-left:6px}
.dfa-src{color:#4a5063;font-size:12px}.dfa-inv{font:12px/1.4 var(--font);color:#6b7280;margin-top:8px}`;
    document.head.appendChild(s);
  }
  async function json(u) { try { const r = await fetch(u, { cache: "no-cache" }); return r.ok ? await r.json() : null; } catch (e) { return null; } }

  /* câmp mascat (prefix + umplutură blurată) sau valoare întreagă */
  const m = (o, k) => {
    if (!o) return "";
    const v = o[k]; if (v && typeof v === "object") return v.gol ? `<span class="dfa-src">${esc(v.motiv_gol || "gol")}</span>` : esc(v.valoare ?? "");
    if (v == null || v === "") return o[k + "_m"] ? `<span class="dfa-x">${esc(o[k + "_m"])}</span>` : "";
    return `${esc(v)}${o[k + "_m"] ? `<span class="dfa-x">${esc(o[k + "_m"])}</span>` : ""}`;
  };
  const val = v => v == null ? "" : (typeof v === "object" ? (v.gol || v.valoare === "" ? `<span class="dfa-src">${esc(v.motiv_gol || "necompletat")}</span>` : esc(v.valoare)) : esc(v));
  const dist = r => r.distanta_m != null ? nf(r.distanta_m) + " m" : "—";
  const sursa = r => `<span class="dfa-src">${esc(r.sursa_tip || (r.sursa && /^https?:/.test(r.sursa) ? "primărie" : r.sursa) || "")} · ${esc(String(r.data_sursei || "").slice(0, 10) || "dată necunoscută")} · încredere ${esc(r.incredere || "—")}</span>`;
  const tabel = (titlu, cap, rows, motiv) => `<h3>${titlu} <small>(${rows.length})</small></h3>` + (rows.length ? `<div class="scroll"><table><tr>${cap.map(c => `<th>${c}</th>`).join("")}</tr>${rows.join("")}</table></div>` : `<p class="dfa-gol">${esc(motiv)}</p>`);
  const MOTIV = "Nu avem rânduri pentru această categorie în Banca de Date; pozițiile pe parcelă există doar pentru județul Timiș.";
  const admnm = (r, full) => { const A = r.administratori, L = Array.isArray(A) ? A : []; return L.map(a => full ? `${esc(a.nume)}${a.calitate ? " (" + esc(a.calitate) + ")" : ""}` : m(a, "nume")).join("; ") || `<span class="dfa-src">${esc((A && !Array.isArray(A) && A.motiv_gol) || (r.administratori_n === 0 ? "necunoscuți" : "necompletat în sursă"))}</span>`; };

  function randare(J, nivel) {
    const full = nivel !== "ascuns", adm = ADMIN() && !window.CC_CLIENT;
    const fx = full ? (r, k) => val(r[k]) : m;
    const c = { firme: (J.firme || []).length, cu: (J.cu || []).length, ac: (J.ac || []).length, puz: (J.puz || []).length, investitii: (J.investitii || []).length };
    let h = `<div class="dfa-cnt">${[["firme", "firme"], ["cu", "certificate de urbanism"], ["ac", "autorizații de construire"], ["puz", "PUZ-uri"], ["investitii", "investiții declarate"]].map(([k, t]) => `<span><b>${c[k]}</b> ${t}</span>`).join("")}</div>`;
    h += tabel("Cele mai apropiate firme", ["Firma", "CUI", "Adresa", "Dist.", "Administratori", "Telefon", "Sursă"],
      (J.firme || []).map(r => `<tr><td>${fx(r, "denumire")}</td><td>${fx(r, "cui")}</td><td>${fx(r, "adresa")}</td><td>${dist(r)}</td><td>${admnm(r, full)}</td><td>${fx(r, "telefon")}</td><td>${sursa(r)}</td></tr>`), MOTIV);
    const act = (r, k) => `<tr><td>${esc(r.tip || k)} ${esc(r.numar || r.numar_hcl || "")}/${esc(r.an || "")}</td><td>${fx(r, "adresa") || fx(r, "adresa_cf")}${r.cf || r.cf_m ? ` · CF ${fx(r, "cf")}` : ""}</td><td>${dist(r)}</td><td>${full ? esc(r.stadiu || "") : esc(r.stadiu || "")}</td><td>${r.beneficiar ? (full ? val(r.beneficiar) : m(r, "beneficiar")) : ""}</td><td>${full ? esc(String(r.tip_lucrare || "").slice(0, 120)) : m(r, "tip_lucrare")}</td><td>${sursa(r)}</td></tr>`;
    [["cu", "Cele mai apropiate certificate de urbanism"], ["ac", "Cele mai apropiate autorizații de construire"], ["puz", "Cele mai apropiate PUZ-uri"]].forEach(([k, t]) =>
      h += tabel(t, ["Act", "Adresa / CF", "Dist.", "Stadiu", "Beneficiar", "Lucrare", "Sursă"], (J[k] || []).map(r => act(r, k.toUpperCase())), MOTIV));
    h += tabel("Investiții declarate pe comună", ["Investiția", "Tip sursă", "Valoare", "Termen", "Stadiu", "Sursă"],
      (J.investitii || []).map(r => `<tr><td>${full ? esc(r.titlu) : m(r, "titlu")}</td><td>${esc(r.tip_sursa || "")}</td><td>${full ? val(r.valoare_lei) : ""}</td><td>${(full ? esc(typeof r.termen === "object" ? "" : r.termen) : (r.termen ? esc(r.termen) : "")) || "termen neprecizat"}</td><td>${esc(r.stadiu || "")}</td><td>${sursa(r)}</td></tr>`),
      "Nu avem încă o listă de investiții declarate pentru această comună (se cere de la roboții de colectare).");
    const d = (J.alte || {}).densitate; if (d) h += `<h3>Alte date: câte elemente sunt în jur</h3><p class="dfa-gol">${["AC", "CU", "PUZ", "firme"].filter(k => d[k]).map(k => `${k}: ${["500", "1000", "2000"].map(r => `${nf(d[k][r] ?? 0)} pe ${r} m`).join(", ")}`).join(" · ")}</p>`;
    if (adm && J.investitii_lipsa && J.investitii_lipsa.length) h += `<details class="dfa-inv"><summary>lipsuri de colectare (doar Admin)</summary>${J.investitii_lipsa.map(x => `<p>${esc(typeof x === "string" ? x : JSON.stringify(x))}</p>`).join("")}</details>`;
    else if (J.investitii_lipsa_n && adm) h += `<p class="dfa-inv">${J.investitii_lipsa_n} lipsuri de colectare la investiții (doar Admin).</p>`;
    return h;
  }

  async function porneste() {
    css();
    const Dd = typeof D !== "undefined" ? D : null; if (!Dd || !Dd.id) return;
    const sec = $("#" + SEC); if (!sec) return;
    if (facut === Dd.id + "|" + (arataAdmin ? 1 : 0) + "|" + (window.CC_PLATA ? 1 : 0) && sec.querySelector(".dfa-corp")) return;
    const id = encodeURIComponent(Dd.id), P = `p/${id}/`;
    const mostra = await json(P + "date_fine_aproape_mostra.json");
    if (!mostra) { sec.hidden = true; return; }
    facut = Dd.id + "|" + (arataAdmin ? 1 : 0) + "|" + (window.CC_PLATA ? 1 : 0);
    sec.hidden = false;
    sec.innerHTML = `<div><h2>Date fine din jurul proprietății</h2><p class="lead">Cele mai apropiate 20 de firme, certificate de urbanism, autorizații de construire și PUZ-uri, plus investițiile declarate pe comună. Fiecare rând are sursa, data sursei și gradul de încredere.</p></div><div class="dfa-corp"></div><p class="dfa-src dfa-foot"><a href="gdpr_date_fine.html" target="_blank" rel="noopener">GDPR și folosire date</a></p>`;
    const corp = $(".dfa-corp", sec), adm = ADMIN() && !window.CC_CLIENT;
    if (adm) {
      if (arataAdmin) {
        const J = await json(P + "date_fine_aproape.json");
        corp.innerHTML = `<span class="dfa-adm">🔓 Admin: date complete (cod 1357), nu se publică</span> <button type="button" class="dfa-btn" data-a="ascunde">Ascunde</button>` + (J ? randare(J, "arati_admin") : '<p class="dfa-gol">date_fine_aproape.json lipsește pentru această proprietate.</p>');
        corp.querySelector('[data-a="ascunde"]').onclick = () => { arataAdmin = false; facut = null; porneste(); };
      } else {
        corp.innerHTML = `<span class="dfa-adm">Nivel ascuns (valorile sensibile sunt mascate)</span> <button type="button" class="dfa-btn" data-a="arata">Arată</button>` + randare(mostra, "ascuns");
        corp.querySelector('[data-a="arata"]').onclick = () => { const c = window.prompt("Cod Admin:"); if (c === "1357") { arataAdmin = true; facut = null; porneste(); } };
      }
      return;
    }
    /* Client (și Admin „ca client”): ascuns până după plată */
    const P2 = window.CC_PLATA, st = P2 ? await P2.stare() : { platit: false, configurat: false };
    if (st.platit) {
      const J = await P2.dateLivrate();
      corp.innerHTML = (st.simulat ? '<span class="dfa-adm">simulare plată (test), nu e plată reală</span>' : "") + (J ? randare(J, "aratat_client") : '<p class="dfa-gol">Plata e confirmată, dar datele nu au putut fi încărcate acum. Reîncearcă peste un minut.</p>')
        + `<p class="dfa-src">Date publice (ONRC, actele primăriilor). Nu le retransmite. <a href="gdpr_date_fine.html" target="_blank" rel="noopener">GDPR și folosire date</a></p>`;
      return;
    }
    corp.innerHTML = randare(mostra, "ascuns") + '<div class="dfa-pl"></div>' + "";
    if (P2) P2.montaj($(".dfa-pl", corp), () => { facut = null; porneste(); }, st.configurat);
  }
  setInterval(() => { try { porneste(); } catch (e) { console.warn("date_fine_aproape", e); } }, 1500);
})();
