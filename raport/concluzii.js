/* Raport în creștere — „Concluzii pe elemente" și „Urbanism pe scurt", în Rezumat.
   Pentru fiecare element al raportului: o concluzie scrisă, cu nivel (mic / moderat / mare / informativ) și fapta din care vine.
   Pragurile sunt ale noastre (reguli simple, publicate mai jos); nivelul de „risc" e un calificativ de discuție, nu o evaluare tehnică și nu o concluzie juridică.
   Citește doar D (proprietatea curentă) și HR nu e necesar. Nu folosește .cards/.note/.scroll/table (ascunse în „Simplu"); blocurile au clasa keep. */
(function () {
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = (v, d = 0) => (v == null || !isFinite(v)) ? "—" : Number(v).toLocaleString("ro-RO", { minimumFractionDigits: d, maximumFractionDigits: d });
  const km = m => m >= 1000 ? nf(m / 1000, 1) + " km" : nf(m) + " m";
  const Dd = () => (typeof D !== "undefined" ? D : null);
  let last = null;
  const LITIGIU = u => { const t = String(u?.litigii || ""); return !/^\s*(niciun|nimic|nu\b)/i.test(t) && /dosar|recurs|anulare|sentin|suspend/i.test(t); };
  const AN = u => (String(u?.an || "").match(/\d{4}/) || [""])[0];
  const NIV = { mic: ["risc mic", "var(--ok)"], mod: ["risc moderat", "var(--hz100)"], mare: ["risc mare", "var(--hz10)"], info: ["de știut", "#2c5c9c"], lipsa: ["fără date", "var(--muted)"] };

  function css() {
    const s = document.createElement("style"); s.id = "cc-css";
    s.textContent = `
#concluzii{display:flex;flex-direction:column;gap:10px}
.cc-sec{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:6px;min-width:0}
.cc-sec h3{margin:0 0 4px}
.cc-r{display:grid;grid-template-columns:128px 112px minmax(0,1fr);gap:4px 10px;align-items:baseline;border-top:1px solid var(--line);padding:7px 0;font-size:13.5px;cursor:pointer}
.cc-r:first-of-type{border-top:0}
.cc-r b{font-weight:600}
.cc-n{font:600 11px var(--mono);text-transform:uppercase;letter-spacing:.03em;padding:2px 8px;border-radius:99px;text-align:center;background:color-mix(in srgb,var(--c) 15%,transparent);color:var(--c)}
.cc-r span.ct{color:var(--fg)} .cc-r small{display:block;color:var(--muted);font-size:12px}
.cc-u{margin:0;padding-left:18px;display:grid;gap:5px;font-size:13.5px}
.cc-lg{font-size:12px;color:var(--muted);margin:0}
@media (max-width:640px){.cc-r{grid-template-columns:1fr auto}.cc-r span.ct{grid-column:1/-1}}`;
    document.head.appendChild(s);
  }

  function elemente(D) {
    const R = [], add = (id, nume, niv, txt, fapt) => R.push({ id, nume, niv, txt, fapt });
    /* inundații */
    const F = D.inundatii || {}, H = F.hazard || {}, z10 = H.hz10?.dist_m, z100 = H.hz100?.dist_m, f100 = F.ciclu2_punct?.disponibil ? F.ciclu2_punct.scenarii?.F?.["100"]?.adancime_m : undefined;
    if (typeof f100 === "number") add("inundatii", "Inundații", "mare", `Risc mare de inundație: la o viitură de 100 de ani apa ajunge aici la ${nf(f100, 2)} m.`, "ANAR, ciclul II");
    else if (z10 === 0) add("inundatii", "Inundații", "mare", "Risc mare de inundație: punctul e în zona inundabilă de 10 ani.", "ANAR");
    else if (z100 === 0) add("inundatii", "Inundații", "mod", "Risc moderat de inundație: punctul e în zona de 100 de ani.", "ANAR");
    else if (typeof z10 === "number" && z10 <= 100) add("inundatii", "Inundații", "mod", `Risc moderat-mic de inundație: zona de 10 ani e la ≈ ${nf(z10)} m, dar punctul nu e în zonă${f100 === "uscat" ? " și harta ciclului II îl arată uscat la 100 de ani" : ""}.`, "ANAR");
    else if (z10 !== undefined) add("inundatii", "Inundații", "mic", `Risc mic de inundație: nicio zonă de hazard în apropiere${typeof z10 === "number" ? " (cea mai aproape la " + km(z10) + ")" : ""}.`, "ANAR");
    /* seism */
    const S = D.seismic;
    if (S) add("seismic", "Seism", S.ag >= 0.25 ? "mare" : "mod", `Risc seismic ${S.ag >= 0.25 ? "mare" : "moderat"} pentru zonă (ag = ${S.ag_txt} g); pentru casa ta contează anul construcției și dacă a fost expertizată.`, "P100-1, zonare");
    /* teren */
    const G = D.alunecari;
    if (G) { const p = G.panta_max_pct ?? 0; add("alunecari", "Alunecări de teren", p > 15 ? "mare" : p > 5 ? "mod" : "mic", `Risc ${p > 15 ? "mare" : p > 5 ? "moderat" : "mic"} de alunecări: teren ${p <= 2 ? "plat" : "înclinat"}, panta maximă ${nf(p, 1)}%.`, "relief Copernicus, harta geologică IGR"); }
    /* zgomot */
    const Z = D.zgomot?.surse || [];
    if (Z.length) {
      const nivel = x => { const c = x.cat || ""; if (/aerop/i.test(c)) return x.m <= 2500 ? 2 : x.m <= 6000 ? 1 : 0; if (/autostrad|național/i.test(c)) return x.m <= 300 ? 2 : x.m <= 800 ? 1 : 0; if (/cale ferat/i.test(c)) return x.m <= 200 ? 2 : x.m <= 500 ? 1 : 0; return 0; };
      const sc = Z.map(x => ({ x, n: nivel(x) })).sort((a, b) => b.n - a.n || a.x.m - b.x.m), top = sc[0], lv = top.n;
      const nm = x => `${x.cat}${x.nume && !/^[\d\/\s]+$/.test(x.nume) ? " „" + x.nume + "”" : ""} la ${km(x.m)}`;
      const apr = Z.filter(x => /aerop/i.test(x.cat)).sort((a, b) => a.m - b.m)[0];
      add("zgomot", "Zgomot", ["mic", "mod", "mare"][lv], lv ? `Risc ${lv === 2 ? "mare" : "moderat"} de zgomot: ${nm(top.x)}.` : `Risc mic de zgomot: nicio sursă mare aproape${apr ? "; aeroportul e la " + km(apr.m) : ""}.`, "distanțe OSM; nu sunt niveluri măsurate");
    }
    /* aer */
    const A = D.aer?.medii_92z;
    if (A && A.pm2_5 != null) { const o = D.aer.oms?.pm2_5 ?? 5, u = D.aer.ue?.pm2_5 ?? 25;
      add("aer", "Aer", A.pm2_5 > u ? "mare" : A.pm2_5 > o * 2 ? "mod" : "mic", `Aer ${A.pm2_5 > u ? "peste limita UE" : A.pm2_5 > o * 2 ? "peste ghidul OMS, dar sub limita UE" : "aproape de ghidul OMS"}: PM2,5 ${nf(A.pm2_5, 1)} µg/m³ în ultimele 3 luni (OMS ${nf(o)}, UE ${nf(u)}).`, "CAMS / Open-Meteo"); }
    /* arheologie și patrimoniu */
    const M = D.monumente;
    if (M) { const d = M.densitate || {}, ran3 = d.ran_3km ?? 0, ran1 = d.ran_1km ?? 0, arh = (M.lista || []).filter(x => /arheolog/i.test(x.tip)).sort((a, b) => a.m - b.m)[0];
      const niv = M.in_sit_ran || M.zona_protectie ? "mare" : (ran1 >= 2 || ran3 >= 15 || (arh && arh.m <= 1500)) ? "mod" : "mic";
      add("monumente", "Arheologie și patrimoniu", niv, `Risc ${niv === "mare" ? "mare" : niv === "mod" ? "moderat" : "mic"} de a găsi vestigii arheologice la săparea fundației: ${nf(ran3)} situri în Repertoriul Arheologic în 3 km${arh ? ", cel mai apropiat LMI „" + arh.nume + "” la " + km(arh.m) : ""}${M.zona_protectie ? "; punctul e în zonă de protecție" : ""}.`, "RAN, LMI"); }
    /* arii protejate */
    const AP = D.arii_protejate;
    if (AP) { const l = (AP.lista || []).slice().sort((a, b) => a.m - b.m).filter((x, i, a) => a.findIndex(y => y.nume === x.nume) === i), a1 = l[0], a2 = l[1];
      add("arii_protejate", "Arii protejate", AP.in_arie?.length ? "mare" : a1 && a1.m < 1000 ? "mod" : "mic", AP.in_arie?.length ? "Proprietatea e într-o arie naturală protejată: construirea cere avize în plus." : a1 ? `Risc mic de restricții de mediu: nicio arie protejată pe parcelă; cea mai aproape e ${a1.nume} la ${km(a1.m)}${a2 ? ", apoi " + a2.nume + " la " + km(a2.m) : ""}.` : "Nicio arie protejată în apropiere.", "Natura 2000, ANANP"); }
    /* urbanism */
    const U = D.urbanism?.pug;
    if (U?.gasit) { const lit = LITIGIU(U), vechi = Number(AN(U)) && Number(AN(U)) <= 2010, nou = /ini[tț]iat|achizi|revizuire|2040/i.test(U.pug_nou || "");
      const niv = lit ? "mod" : (vechi || nou) ? "mod" : "mic";
      add("urbanism", "Reguli de construire", niv, `${niv === "mic" ? "Risc mic" : "Risc moderat"} de schimbare a regulilor: PUG din ${AN(U)}${lit ? ", în litigiu" : ""}${nou ? ", cu un PUG nou în pregătire" : ""}. Regulile parcelei se confirmă numai prin certificat de urbanism.`, "fișe PUG Fabrica"); }
    /* autorizații */
    const AU = D.autorizatii;
    if (AU?.colectat && AU.total_perioada) { const cl = AU.clase || {}, tri = AU.trimestre || {}, casa = Object.values(tri).reduce((s, q) => s + (q.casa || 0), 0) || cl.casa || 0;
      add("autorizatii", "Construcții în jur", "info", `${nf(AU.total_perioada)} autorizații de construire în ${AU.ani} ani în ${AU.uat}${casa ? ", din care " + nf(casa) + " pentru case și duplexuri" : ""}.`, "registrul primăriei"); }
    /* populație */
    const P = D.populatie;
    if (P && typeof P.var === "number") add("populatie", "Populație", "info", `${P.uat}: ${P.var >= 0 ? "+" : ""}${nf(P.var, 1)}% în 10 ani (județul ${nf(P.judet_var || 0, 1)}%): ${P.var > 15 ? "zonă care crește repede" : P.var > 0 ? "creștere lentă" : "scădere"}.`, "INS");
    return R;
  }

  function urbanism(D) {
    const L = [], U = D.urbanism, P = U?.pug, A = D.autorizatii, AP = D.arii_protejate;
    if (P?.gasit) L.push(`<b>PUG în vigoare din ${esc(AN(P))}</b>${LITIGIU(P) ? ", în litigiu" : ""}${P.pug_nou ? "; PUG nou: " + esc(String(P.pug_nou).slice(0, 90).replace(/[\s;:,(/]+[^\s;:,(/]*$/, "")) : ""}.`);
    else if (U) L.push("<b>PUG necunoscut</b> pentru această localitate: regulile se află din certificatul de urbanism.");
    if (A?.colectat && A.total_perioada) {
      const nm = A.nume_clase || {}, cl = {}; Object.values(A.trimestre || {}).forEach(q => Object.entries(q).forEach(([k, v]) => { cl[k] = (cl[k] || 0) + v; }));
      const top = Object.entries(Object.keys(A.clase || {}).length ? A.clase : cl).filter(([k]) => !/anexe|retele|alte/.test(k)).sort((a, b) => (b[1].n ?? b[1]) - (a[1].n ?? a[1])).slice(0, 2).map(([k]) => nm[k] || k);
      L.push(`<b>Zonă în care se construiește:</b> ${nf(A.total_perioada)} autorizații în ${A.ani} ani în UAT${top.length ? "; preponderent " + esc(top.join(" și ")) : ""}.`);
      const t = Object.keys(A.trimestre || {}).sort(); const ultim = t.slice(-4), prec = t.slice(-8, -4);
      const cnt = ks => ks.reduce((s, k) => s + (A.trimestre[k].casa || 0), 0), a = cnt(ultim), b = cnt(prec);
      if (a || b) L.push(`<b>Case și duplexuri:</b> ${nf(a)} autorizații în ultimele 4 trimestre${prec.length ? ", față de " + nf(b) + " în cele 4 dinainte" : ""}.`);
    }
    const pz = U?.acte?.puz;
    if (pz?.colectat) L.push(pz.potrivite ? `<b>PUZ-uri apropiate:</b> ${nf(pz.potrivite)} pe aceeași stradă sau pe parcelele din jur${pz.lista?.[0] ? "; cel mai recent: " + esc(pz.lista[0].denumire) + " (" + esc(pz.lista[0].data) + ")" : ""}.` : `<b>PUZ-uri apropiate:</b> niciunul pe aceeași stradă; ${nf(pz.total_uat)} în tot UAT-ul.`);
    return { L, ind: null };
  }

  function randare() {
    const d = Dd(); if (!d) return;
    const rez = document.getElementById("rezumat"); if (!rez) return;
    let box = document.getElementById("concluzii");
    if (!box) { box = document.createElement("div"); box.id = "concluzii"; const semafor = document.getElementById("semafor"); (semafor && semafor.parentNode === rez) ? semafor.after(box) : rez.prepend(box); }
    const R = elemente(d), U = urbanism(d);
    const arii = (d.arii_protejate?.lista || []).slice().sort((a, b) => a.m - b.m).filter((x, i, a) => a.findIndex(y => y.nume === x.nume) === i).slice(0, 2);
    const rec = arii.length ? `<b>Natură și recreere în jur:</b> ${arii.map(a => esc(a.nume) + " la " + km(a.m)).join("; ")}.` : "";
    box.innerHTML = `<div class="cc-sec keep"><h3>Concluzii pe elemente</h3>${R.map(r => `<div class="cc-r" data-go="${esc(r.id)}" style="--c:${NIV[r.niv][1]}" tabindex="0" title="deschide capitolul"><b>${esc(r.nume)}</b><span class="cc-n">${NIV[r.niv][0]}</span><span class="ct">${esc(r.txt)}<small>${esc(r.fapt)}</small></span></div>`).join("")}
      <p class="cc-lg">Reguli simple, ale noastre: inundații după zonele ANAR; alunecări după pantă (peste 5% moderat, peste 15% mare); zgomot după distanța până la aeroport (sub 2,5 km mare, sub 6 km moderat), drum național (sub 300 m mare, sub 800 m moderat) și cale ferată; arheologie după siturile din 3 km. „Risc” e un calificativ de discuție, nu o evaluare tehnică și nu o concluzie juridică.</p></div>
      <div class="cc-sec keep"><h3>Urbanism pe scurt</h3><ul class="cc-u">${[...U.L, rec].filter(Boolean).map(x => `<li>${x}</li>`).join("")}</ul></div>`;
    box.querySelectorAll("[data-go]").forEach(e => { const go = () => { try { window.showTab(e.dataset.go); scrollTo({ top: 0 }); } catch (er) {} }; e.onclick = go; e.onkeydown = ev => ev.key === "Enter" && go(); });
    last = d.id;
  }

  function porneste() {
    css();
    setInterval(() => { try { const d = Dd(); if (d && (d.id !== last || !document.getElementById("concluzii")?.children.length)) randare(); } catch (e) { console.warn("concluzii", e); } }, 900);
  }
  window.RIC_CONCLUZII = { elemente, urbanism };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", porneste); else porneste();
})();
