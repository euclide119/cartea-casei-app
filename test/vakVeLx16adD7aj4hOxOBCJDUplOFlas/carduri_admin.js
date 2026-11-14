/* Raportul casei · „Evidență QR” (v82.15.0, 13.11.2026, cerut de Manu 12.11.2026). Modul separat, doar în aplicația de test, doar pentru Admin.
   Butonul „Evidență QR” apare în bara Admin numai dacă funcția raport_carduri_admin acceptă jetonul Admin (sesiunea de client sau de card nu îl vede).
   Tabel: destinatar, rapoarte, emis, expiră, stare, prima logare, ultima intrare, intrări, refuzuri; click pe rând = jurnalul cardului.
   Acțiuni (cu confirmare): Blochează, Reactivează, Resetează dispozitivul, Generează QR nou (destinatar, rapoarte bifate din catalog, zile) → card cu QR, cele două coduri, 🔒 lângă codul DOM, PNG și PDF.
   Nimic nu se șterge: fiecare acțiune schimbă starea și scrie în jurnal (raport_carduri_jurnal). */
(function () {
  "use strict";
  if (window.parent !== window || !window.CC_ADM_P) return;
  const FN = "https://vzrozriarqocscpgfscw.supabase.co/functions/v1/raport_carduri_admin";
  let COD_INTRARE = "", COD_DOM = "";   // v82.21.1: valorile nu mai sunt în aplicație; vin de la server (coduri_mele, doar Admin) și stau doar în memorie
  const esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const zi = s => s ? new Date(s).toLocaleString("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
  const STARE = { activ: ["activ", "#1d5fb0"], legat: ["legat", "#1f6b3d"], blocat: ["blocat", "#9a2a1f"], expirat: ["expirat", "#6b6f7d"] };
  const baza = () => location.origin + location.pathname.replace(/[^/]*$/, "");
  /* v82.23.1: nu mai există nume hardcodate: eticheta vine mereu din catalog (raport_admin_cat) */
  let S = null, CAT = [];
  const api = async (actiune, b) => { const r = await fetch(FN, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune, token: S.token, ...(b || {}) }) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || "eroare " + r.status); return j; };

  window.CC_ADM_P.then(async s => {
    if (!s || !s.token || !(s.m || (s.adm && !s.c && !s.g && !s.k))) return;   // jetonul Admin sau (v82.29.0, cerere Manu 14.11) jetonul master
    S = s;
    try { await api("verifica"); } catch (e) { return; }
    const mk = () => { const b = document.getElementById("cc-tt-bar"); if (!b) return setTimeout(mk, 400); if (document.getElementById("cc-qr-btn")) return;
      const x = document.createElement("button"); x.id = "cc-qr-btn"; x.type = "button"; x.textContent = "Evidență QR";
      x.style.cssText = "font:700 12px -apple-system,system-ui,sans-serif;border:0;border-radius:8px;padding:6px 9px;background:#1d5fb0;color:#fff;white-space:nowrap";
      x.onclick = panou; b.insertBefore(x, b.querySelector("#cc-tt-v")); };
    if (s.m) {   // v82.29.0 (Manu, 14.11: „pe pagina principală un mic cerculeț cu un QR code, în dreapta sus e suficient”): masterul deschide Evidența QR din cerculețul din dreapta sus
      const c = document.createElement("button"); c.id = "cc-qr-cerc"; c.type = "button"; c.title = "Coduri QR și accese"; c.setAttribute("aria-label", "Coduri QR și accese");
      c.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm9-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h3v2h-3v-2zm-4 4h2v2h-2v-2zm4 0h3v4h-2v-2h-1v-2zm-2 2h2v2h-2v-2z"/></svg>';
      c.style.cssText = "position:fixed;right:12px;top:10px;z-index:9001;width:40px;height:40px;border-radius:50%;border:1.5px solid #1a1e2a;background:#fffdf8;color:#1a1e2a;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 6px rgba(0,0,0,.18);cursor:pointer;padding:0";
      c.onclick = panou; document.body.appendChild(c);
    } else mk();
  });

  function stil() {
    if (document.getElementById("cc-qr-st")) return;
    const st = document.createElement("style"); st.id = "cc-qr-st";
    st.textContent = `#cc-qr{position:fixed;inset:0;z-index:99995;background:#f6f1e7;color:#1a1e2a;overflow:auto;font:14px/1.45 -apple-system,system-ui,sans-serif;padding:calc(14px + env(safe-area-inset-top)) 14px calc(30px + env(safe-area-inset-bottom))}
#cc-qr h2{font:700 20px -apple-system,system-ui,sans-serif;margin:0}#cc-qr .r{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
#cc-qr button{font:700 13px -apple-system,system-ui,sans-serif;border:1.5px solid #1a1e2a;border-radius:9px;padding:7px 11px;background:#fffdf8;color:#1a1e2a;cursor:pointer}
#cc-qr button.p{background:#1d5fb0;border-color:#1d5fb0;color:#fff}#cc-qr button.x{border-color:#9a2a1f;color:#9a2a1f}
#cc-qr .t{width:100%;margin-top:12px;background:#fffdf8;border:1px solid #cfc7b6;border-radius:10px}
#cc-qr .cc{border-bottom:1px solid #e4dccb;padding:8px 10px}#cc-qr .cc:last-child{border-bottom:0}#cc-qr .cr{display:flex;align-items:center;gap:8px}#cc-qr .cn{flex:1;min-width:0}#cc-qr .cn b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#cc-qr .cs{display:block;font-size:12px;color:#6b6f7d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#cc-qr .ce{font-size:12px;color:#4a5063;min-width:2.8em;text-align:right}#cc-qr .cr button{padding:5px 9px;min-width:34px}#cc-qr .cr button[data-a=i]{border-radius:50%;width:30px;height:30px;padding:0;font-style:italic;font-family:Georgia,serif}#cc-qr .cr button.on{background:#1a1e2a;color:#fff}#cc-qr .cd{padding:8px 0 2px;font-size:13px}#cc-qr .cg{display:grid;grid-template-columns:auto 1fr;gap:3px 12px;margin:6px 0 8px}#cc-qr .cg span:nth-child(odd){color:#6b6f7d}
#cc-qr table{border-collapse:collapse;width:100%;min-width:860px}#cc-qr th,#cc-qr td{padding:7px 8px;border-bottom:1px solid #e4dccb;text-align:left;vertical-align:top}
#cc-qr th{font-size:12px;color:#4a5063;font-weight:700}#cc-qr tr.c{cursor:pointer}#cc-qr tr.c:hover{background:#f1ead9}
#cc-qr .st{display:inline-block;border-radius:999px;padding:1px 8px;color:#fff;font-weight:700;font-size:12px}
#cc-qr .bx{background:#fffdf8;border:1px solid #cfc7b6;border-radius:12px;padding:14px;margin-top:12px}
#cc-qr input[type=text],#cc-qr input[type=number]{font:600 15px -apple-system,system-ui,sans-serif;padding:8px 10px;border:1.5px solid #8a90a3;border-radius:9px;background:#fff;color:#1a1e2a}
#cc-qr td,#cc-qr th,#cc-qr input,#cc-qr label{font-family:-apple-system,system-ui,sans-serif}
#cc-qr label.b{display:flex;gap:8px;align-items:flex-start;padding:4px 0}#cc-qr .m{color:#9a2a1f;min-height:18px}`;
    document.head.appendChild(st);
  }

  async function panou() {
    stil(); document.getElementById("cc-qr")?.remove();
    const d = document.createElement("div"); d.id = "cc-qr"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "Evidență QR");
    d.innerHTML = `<div class="r" style="justify-content:space-between"><h2>Evidență QR</h2><div class="r"><button class="p" id="cq-nou">Generează QR nou</button><button id="cq-x">Închide</button></div></div><div class="m" id="cq-m"></div><div id="cq-c"></div><div class="t" id="cq-t">se încarcă…</div>`;
    document.body.appendChild(d);
    d.querySelector("#cq-x").onclick = () => d.remove();
    d.querySelector("#cq-nou").onclick = formular;
    await tabel();
  }
  const msg = t => { const m = document.getElementById("cq-m"); if (m) m.textContent = t || ""; };

  async function tabel() {
    const t = document.getElementById("cq-t"); if (!t) return;
    let j; try { j = await api("lista"); } catch (e) { t.textContent = e.message; return; }
    CAT = (j.catalog || []); const et = Object.fromEntries(CAT.map(c => [c.id, c.eticheta || c.id]));
    const scurt = id => { const s = et[id] || id + " (nepublicat)"; return s.split(" · ")[0] + (s.includes("CF ") ? " · " + (s.match(/CF [^·]+/) || [""])[0].trim() : ""); };
    /* v82.29.1 (Manu, 14.11: „codurile QR – istoric – mai compact; detaliile multe doar la atingerea butonului i; în rest minime în meniu”): un rând scurt pe card
       (destinatar, stare, expiră, „i”, „QR”); tot restul (notă, raport, emis, prima logare, ultima intrare, intrări, refuzuri, sesiuni, instalat, acțiuni) stă sub „i”. */
    const cur = c => {
      const st = STARE[c.stare] || [c.stare, "#555"], rap = c.rapoarte || [], r0 = rap[0] ? scurt(rap[0]) : "", plus = rap.length > 1 ? ` +${rap.length - 1}` : "";
      const exp = c.expira_la ? new Date(c.expira_la).toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit" }) : "—";
      return `<div class="cc" data-id="${esc(c.id)}"><div class="cr"><div class="cn"><b>${esc(c.destinatar)}</b><span class="cs">${esc(r0)}${plus}</span></div><span class="st" style="background:${st[1]}">${st[0]}</span><span class="ce">${exp}</span><button type="button" data-a="i" aria-label="detalii" aria-expanded="false">i</button><button type="button" data-a="arata" aria-label="QR">QR</button></div>
        <div class="cd" hidden>${c.nota ? `<div>${esc(c.nota)}</div>` : ""}<div class="cg"><span>id</span><span>${esc(c.id)}</span><span>rapoarte</span><span>${(rap).map(r => esc(scurt(r))).join("<br>") || "—"}</span><span>emis</span><span>${zi(c.emis_la)}</span><span>expiră</span><span>${zi(c.expira_la)}</span><span>prima logare</span><span>${zi(c.prima_logare)}</span><span>ultima intrare</span><span>${zi(c.ultima_intrare)}</span><span>intrări / refuzuri</span><span>${c.intrari || 0} / ${c.refuzuri || 0}</span><span>sesiuni</span><span>${c.sesiuni || 0} · ${c.minute || 0} min · ${c.instalat ? "instalat" + (c.probabil_dezinstalat ? " (probabil dezinstalat)" : "") : "neinstalat"}</span>${c.ua_scurt ? `<span>dispozitiv</span><span>${esc(c.ua_scurt)}</span>` : ""}${c.blocat_automat ? `<span>blocat automat</span><span>${zi(c.blocat_automat)}</span>` : ""}</div>
        <div class="r">${c.stare === "blocat" || c.stare === "expirat" ? `<button data-a="reactiveaza">Reactivează</button>` : `<button class="x" data-a="blocheaza">Blochează</button>`}${c.legat_dispozitiv ? `<button data-a="reseteaza">Resetează dispozitivul</button>` : ""}<button data-a="sesiuni">Sesiuni</button><button data-a="jurnal">Jurnal</button><button data-a="previz">Vezi ca acest card</button></div></div></div>`;
    };
    t.innerHTML = (j.alerta_rosie ? `<div style="background:#9a2a1f;color:#fff;font-weight:700;padding:8px 12px;border-radius:8px;margin-bottom:8px">⚠ Limita umană depășită de master / Admin de ${(j.alerte || []).length} ori în ultimele 10 minute (cererile au fost încetinite, nu blocate): ${esc((j.alerte || [])[0] && (j.alerte || [])[0].detaliu || "")}</div>` : "") + ((j.carduri || []).map(cur).join("") || `<div style="padding:12px">Niciun card încă.</div>`);
    t.onclick = async ev => {
      const b = ev.target.closest("button"); if (!b) return; const card = b.closest(".cc"); if (!card) return;
      const id = card.dataset.id, c = (j.carduri || []).find(x => x.id === id), a = b.dataset.a;
      if (a === "i") { const d = card.querySelector(".cd"); d.hidden = !d.hidden; b.setAttribute("aria-expanded", String(!d.hidden)); b.classList.toggle("on", !d.hidden); return; }
      if (a === "arata") return arata(c);
      if (a === "sesiuni") return sesiuni(c);
      if (a === "jurnal") return jurnal(c);
      if (a === "previz") {   // „vezi ca QR X”: jeton de previzualizare (fără legare, fără intrare numărată, fără limită); revii la Admin din bandă
        if (!confirm(`Previzualizezi cardul „${c.destinatar}”? Vezi exact ce vede el; cardul nu se leagă și nu se numără intrare.`)) return;
        try { msg("se deschide previzualizarea…"); const r = await window.CC_PREVIZ(id); if (r && r.error) msg(r.error); } catch (e) { msg(e.message); } return;
      }
      if (a) {
        const txt = { blocheaza: `Blochezi cardul „${c.destinatar}”? Telefonul lui pierde accesul în cel mult câteva secunde.`, reactiveaza: `Reactivezi cardul „${c.destinatar}”?`, reseteaza: `Resetezi dispozitivul cardului „${c.destinatar}”? Următorul telefon care intră cu codul îl leagă din nou.` }[a];
        if (!confirm(txt)) return;
        try { await api(a, { card: id }); msg(""); } catch (e) { msg(e.message); } return tabel();
      }
    };
  }

  /* v82.19.0: sesiunile unui card (minute, instalat sau nu, previzualizările Admin marcate) și, la click pe sesiune, capitolele / subcapitolele deschise și secundele pe fiecare */
  async function sesiuni(c) {
    const box = document.getElementById("cq-c"); box.innerHTML = `<div class="bx">se încarcă sesiunile…</div>`;
    try { const j = await api("sesiuni", { card: c.id }), L = j.sesiuni || [];
      box.innerHTML = `<div class="bx"><div class="r" style="justify-content:space-between"><b>Sesiuni · ${esc(c.destinatar)}</b><button id="cq-sx">Ascunde</button></div><div class="m" style="color:#4a5063">Click pe o sesiune: capitolele și subcapitolele deschise, cu timpul pe fiecare.</div><div class="t"><table style="min-width:620px"><thead><tr><th>Început</th><th>Tip</th><th>Minute</th><th>Instalat</th><th>Dispozitiv</th><th>Ultimul raport</th></tr></thead><tbody>${L.map(r => `<tr class="c" data-s="${esc(r.id)}"><td>${zi(r.pornit_la)}</td><td>${r.tip === "previzualizare" ? "previzualizare Admin" : esc(r.tip)}</td><td>${Math.round((r.durata_s || 0) / 60)}</td><td>${r.instalat ? "da" : "nu"}</td><td>${esc(r.ua_scurt || "")}</td><td>${esc(r.raport_id || "")}</td></tr>`).join("") || `<tr><td colspan="6">Nicio sesiune încă.</td></tr>`}</tbody></table></div><div id="cq-ev"></div></div>`;
      box.querySelector("#cq-sx").onclick = () => { box.innerHTML = ""; };
      box.querySelectorAll("tr.c").forEach(tr => tr.onclick = async () => {
        const ev = box.querySelector("#cq-ev"); ev.innerHTML = "se încarcă…";
        try { const e = await api("evenimente", { sesiune: tr.dataset.s });
          ev.innerHTML = `<div class="t"><table style="min-width:560px"><thead><tr><th>Moment</th><th>Tip</th><th>Capitol</th><th>Subcapitol</th><th>Secunde</th></tr></thead><tbody>${(e.evenimente || []).map(x => `<tr><td>${zi(x.moment)}</td><td>${esc(x.tip)}</td><td>${esc(x.capitol || "")}</td><td>${esc(x.subcapitol || "")}</td><td>${x.secunde == null ? "" : x.secunde}</td></tr>`).join("") || `<tr><td colspan="5">Nicio înregistrare de capitol în această sesiune.</td></tr>`}</tbody></table></div>`;
        } catch (er) { ev.textContent = er.message; }
      });
      box.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) { box.innerHTML = `<div class="bx m">${esc(e.message)}</div>`; }
  }

  async function jurnal(c) {
    const box = document.getElementById("cq-c"); box.innerHTML = `<div class="bx">se încarcă jurnalul…</div>`;
    try { const j = await api("jurnal", { card: c.id });
      box.innerHTML = `<div class="bx"><div class="r" style="justify-content:space-between"><b>Jurnal · ${esc(c.destinatar)}</b><button id="cq-jx">Ascunde</button></div><div class="t"><table style="min-width:560px"><thead><tr><th>Moment</th><th>Eveniment</th><th>Dispozitiv</th><th>IP (hash)</th><th>Detaliu</th></tr></thead><tbody>${(j.jurnal || []).map(r => `<tr><td>${zi(r.moment)}</td><td><b>${esc(r.eveniment)}</b></td><td>${esc(r.ua_scurt || "")}</td><td style="font:12px ui-monospace,Menlo,monospace">${esc((r.ip_hash || "").slice(0, 8))}</td><td>${esc(r.detaliu || "")}</td></tr>`).join("")}</tbody></table></div></div>`;
      box.querySelector("#cq-jx").onclick = () => { box.innerHTML = ""; };
      box.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) { box.innerHTML = `<div class="bx m">${esc(e.message)}</div>`; }
  }

  function formular() {
    const box = document.getElementById("cq-c");
    box.innerHTML = `<div class="bx"><b>Generează QR nou</b><div style="margin-top:10px;display:grid;gap:10px"><input type="text" id="cq-d" placeholder="destinatar" maxlength="120"><input type="text" id="cq-n" placeholder="notă (opțional)" maxlength="300"><div><b style="font-size:13px">Rapoarte</b>${CAT.map(c => `<label class="b"><input type="checkbox" value="${esc(c.id)}"> <span>${esc(c.eticheta || c.id)}</span></label>`).join("")}</div><label class="r">Valabil <input type="number" id="cq-z" value="30" min="1" max="365" style="width:5em"> zile</label><div><b style="font-size:13px">Acces</b><label class="b"><input type="radio" name="cq-ac" value="complet" checked> <span>complet (cu Depth of Market)</span></label><label class="b"><input type="radio" name="cq-ac" value="partial"> <span>parțial: fără Depth of Market</span></label></div><div id="cq-domb"><b style="font-size:13px">Cod DOM pe rapoartele bifate</b><label class="b"><input type="radio" name="cq-dc" value="pastreaza" checked> <span>păstrează codul existent</span></label><label class="b"><input type="radio" name="cq-dc" value="aleator"> <span>cod nou aleator</span></label><label class="b"><input type="radio" name="cq-dc" value="ales"> <span>cod ales: </span><input type="text" id="cq-dv" inputmode="numeric" maxlength="12" placeholder="ex. 8549" style="width:7em"></label></div><div class="r"><button class="p" id="cq-g">Generează</button><button id="cq-gx">Renunță</button></div><div class="m" id="cq-gm"></div></div></div>`;
    box.querySelector("#cq-gx").onclick = () => { box.innerHTML = ""; };
    box.querySelector("#cq-g").onclick = async () => {
      const dest = box.querySelector("#cq-d").value.trim(), rap = [...box.querySelectorAll("input[type=checkbox]:checked")].map(x => x.value), zile = Number(box.querySelector("#cq-z").value) || 30, m = box.querySelector("#cq-gm");
      if (dest.length < 2) { m.textContent = "scrie destinatarul"; return; } if (!rap.length) { m.textContent = "bifează cel puțin un raport"; return; }
      const ac = (box.querySelector("input[name=cq-ac]:checked") || {}).value || "complet", dc = (box.querySelector("input[name=cq-dc]:checked") || {}).value || "pastreaza";
      let cod = dc === "ales" ? box.querySelector("#cq-dv").value.replace(/[^0-9A-Za-z]/g, "") : dc === "aleator" ? String(100000 + crypto.getRandomValues(new Uint32Array(1))[0] % 900000) : "";
      if (ac === "complet" && dc === "ales" && cod.length < 4) { m.textContent = "codul ales are cel puțin 4 caractere"; return; }
      const schimb = ac === "complet" && cod ? `\nCodul DOM ${cod} înlocuiește codul DOM de pe: ${rap.join(", ")} (toate cardurile acestor rapoarte primesc același cod DOM).` : "";
      if (!confirm(`Generezi un card pentru „${dest}” cu ${rap.length} rapoarte, valabil ${zile} zile, acces ${ac === "complet" ? "complet" : "parțial (fără DOM)"}?${schimb}`)) return;
      try {
        if (ac === "complet" && cod) for (const r of rap) await api("coduri_seteaza", { tip: "dom", raport_id: r, cod, eticheta: "cod DOM · " + ((CAT.find(c => c.id === r) || {}).eticheta || r) });
        const j = await api("genereaza", { destinatar: dest, nota: (box.querySelector("#cq-n").value.trim() + (ac === "partial" ? " · acces parțial (fără DOM)" : "")).trim(), rapoarte: rap, zile });
        j.card._acces = ac; j.card._dom = ac === "partial" ? null : (cod || undefined); await tabel(); arata(j.card);
      } catch (e) { m.textContent = e.message; }
    };
  }

  /* cardul: canvas A6 vertical (1240×1754) desenat din QR-ul generat local (qrcode-generator, deja încărcat de pagină) */
  function desen(c) {
    const url = baza() + "#card=" + c.id, q = window.qrcode(0, "M"); q.addData(url); q.make();
    const W = 1240, H = 1754, cv = document.createElement("canvas"); cv.width = W; cv.height = H; const g = cv.getContext("2d");
    g.fillStyle = "#f4efe4"; g.fillRect(0, 0, W, H); g.fillStyle = "#1a1e2a"; g.textBaseline = "top";
    const F = (n, b) => `${b ? 700 : 400} ${n}px -apple-system, Helvetica, Arial, sans-serif`;
    g.font = F(74, 1); g.fillText("Raportul casei", 70, 64); g.font = F(38, 1); g.fillText("pentru: " + c.destinatar, 70, 156);
    const n = q.getModuleCount(), Q = 560, cell = Q / (n + 4), x0 = (W - Q) / 2, y0 = 226;
    g.fillStyle = "#fff"; g.fillRect(x0, y0, Q, Q); g.fillStyle = "#1a1e2a";
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) g.fillRect(Math.floor(x0 + (k + 2) * cell), Math.floor(y0 + (r + 2) * cell), Math.ceil(cell), Math.ceil(cell));
    let y = y0 + Q + 40; g.textAlign = "center"; g.font = F(56, 1); g.fillText("Cod de intrare: " + COD_INTRARE, W / 2, y); y += 78;
    g.font = F(48, 1); g.fillText(c._dom === null ? "Acces parțial: fără Depth of Market" : "🔒 Cod DOM: " + (c._dom || COD_DOM), W / 2, y); y += 64;   // v82.29.0: cod ales / aleator pe card sau acces parțial
    g.font = F(30); g.fillStyle = "#5b6275"; g.fillText("Depth of Market – Level 2", W / 2, y); y += 62;
    g.textAlign = "left"; g.fillStyle = "#1d5fb0"; g.font = F(38, 1); g.fillText("Rapoartele de pe card", 70, y); y += 54;
    const et = Object.fromEntries(CAT.map(x => [x.id, x.eticheta || x.id])); g.fillStyle = "#1a1e2a"; g.font = F(28);
    c.rapoarte.forEach(r => { let s = et[r] || r; if (s.length > 70) s = s.slice(0, 69) + "…"; g.fillText("• " + s, 70, y); y += 40; });
    y += 24; g.fillStyle = "#1d5fb0"; g.font = F(38, 1); g.fillText("Instalează raportul pe ecranul telefonului", 70, y); y += 56; g.fillStyle = "#1a1e2a"; g.font = F(28);
    ["Android: scanează cu aparatul foto, deschide în Chrome, „Instalează aplicația”.", "iPhone: scanează cu aparatul foto, deschide în Safari, Partajează →", "„Adaugă pe ecranul principal”, apoi scrie codul în aplicația de pe ecran.", "Cardul se activează pe un singur telefon: primul care intră cu codul."].forEach(t => { g.fillText(t, 70, y); y += 40; });
    g.fillStyle = "#5b6275"; g.fillText(`Valabil până la ${new Date(c.expira_la).toLocaleDateString("ro-RO")} · card ${c.id.slice(0, 4)}…`, 70, H - 94);
    return { cv, url };
  }
  const descarca = (href, nume) => { const a = document.createElement("a"); a.href = href; a.download = nume; document.body.appendChild(a); a.click(); a.remove(); };
  const jspdf = () => window.jspdf ? Promise.resolve() : new Promise((ok, no) => { const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  async function arata(c) {
    const box = document.getElementById("cq-c"); if (!window.qrcode) { box.innerHTML = `<div class="bx m">generatorul QR nu s-a încărcat; reîncarcă pagina</div>`; return; }
    try { const j = await api("coduri_mele"); COD_INTRARE = (j.globale && j.globale.intrare) || ""; COD_DOM = (j.globale && j.globale.dom) || ""; } catch (e) { /* cardul se desenează fără coduri dacă serverul nu răspunde */ }
    const { cv, url } = desen(c), png = cv.toDataURL("image/png");
    box.innerHTML = `<div class="bx"><div class="r" style="justify-content:space-between"><b>Card · ${esc(c.destinatar)}</b><button id="cq-ax">Ascunde</button></div><img src="${png}" alt="cardul QR" style="display:block;width:100%;max-width:420px;margin:12px auto;border:1px solid #cfc7b6;border-radius:8px"><div class="r" style="justify-content:center"><button class="p" id="cq-png">Descarcă PNG</button><button class="p" id="cq-pdf">Descarcă PDF</button><button id="cq-cp">Copiază linkul</button></div><div class="m" id="cq-am" style="text-align:center"></div></div>`;
    box.querySelector("#cq-ax").onclick = () => { box.innerHTML = ""; };
    box.querySelector("#cq-png").onclick = () => descarca(png, `card_${c.id}.png`);
    box.querySelector("#cq-pdf").onclick = async () => { try { await jspdf(); const doc = new window.jspdf.jsPDF({ unit: "mm", format: "a5", compress: true }); doc.addImage(png, "PNG", 0, 0, 148, 210); doc.save(`card_${c.id}.pdf`); } catch (e) { box.querySelector("#cq-am").textContent = "PDF indisponibil (fără internet?)"; } };
    box.querySelector("#cq-cp").onclick = () => { try { navigator.clipboard.writeText(url).then(() => { box.querySelector("#cq-am").textContent = "linkul e copiat"; }); } catch (e) {} };
    box.scrollIntoView({ behavior: "smooth", block: "start" });
  }
})();
