/* Cartea Casei — datele private mascate (Manu, 07.11.2026, v82.2.0).
   Se colectează tot (nume, firme, adrese, telefoane, CF) în p/<id>/privat.json, care rămâne pe Drive.
   Client: pagina citește doar p/<id>/privat_mostra.json, mascat LA SURSĂ de date_fine.py (primele 4 caractere + umplutură „x”);
   umplutura se blurează aici, iar clientul vede că datele există: contoarele („674 contacte, 944 firme …”).
   Admin (localhost, fără ?client=1): se citește privat.json și se arată complet, fără blur.
   Se aplică doar când mostra are „contoare” (formatul nou); G7 (mostra veche, fără contoare) rămâne neschimbat. */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const local = /^(localhost|127\.0\.0\.1|192\.168\.|10\.)/.test(location.hostname);
  const ADMIN = () => window.parent === window && ((local && !window.CC_CLIENT) || !!(window.CC_ADM && window.CC_ADM.adm && (!window.CC_ADM.ca_client || window.CC_ADM.n >= 2)));   // v82.4.0: nivelul 2 (jeton Admin) sau local
  const N = 12;
  const ETI = { anunturi: "anunțuri", contacte: "contacte", firme: "firme", persoane: "persoane", acte: "acte AC/CU", cf_nc: "CF / nr. cadastral" };

  function css() {
    if ($("#msk-css")) return;
    const s = document.createElement("style"); s.id = "msk-css";
    s.textContent = `.msk{font-size:14px}.msk .msk-x{filter:blur(4px);user-select:none;pointer-events:none}
.msk-cnt{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 12px}.msk-cnt span{background:#f1f5f9;border:1px solid #e2e8f0;border-radius:999px;padding:3px 10px;font-size:13px}
.msk-cnt b{font-variant-numeric:tabular-nums}.msk h4{margin:14px 0 6px;font-size:15px}.msk table{border-collapse:collapse;width:100%;min-width:520px}
.msk td,.msk th{border-bottom:1px solid #eee;padding:5px 6px;text-align:left;vertical-align:top}.msk .scroll{overflow-x:auto}
.msk-pin{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0;padding:10px 12px;border:1.5px solid #1a1e2a;border-radius:10px;background:#fffdf8;color:#1a1e2a}.msk-pin input{font:700 16px var(--mono,monospace);letter-spacing:.2em;width:7.5em;padding:8px 10px;border:1px solid #8a90a3;border-radius:8px;background:#fff;color:#1a1e2a}.msk-pin button{font:700 14px var(--font,sans-serif);border:0;border-radius:8px;padding:9px 14px;background:#1a1e2a;color:#fffdf8}.msk-pin small{flex-basis:100%;color:#3d4456;min-height:14px}.msk-adm{display:inline-block;background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;padding:2px 8px;font-size:12px;margin-bottom:6px}`;
    document.head.appendChild(s);
  }

  /* câmp mascat: prefixul vizibil + umplutura blurată (textul complet nu există în fișierul clientului) */
  const m = (o, k) => o ? `${esc(o[k])}${o[k + "_m"] ? `<span class="msk-x">${esc(o[k + "_m"])}</span>` : ""}` : "";
  const t = (cap, rows) => rows.length ? `<h4>${cap}</h4><div class="scroll"><table>${rows.join("")}</table></div>` : "";

  function contoare(c) {
    return `<div class="msk-cnt">${Object.keys(ETI).filter(k => c[k] != null).map(k => `<span><b>${Number(c[k]).toLocaleString("ro-RO")}</b> ${ETI[k]}</span>`).join("")}</div>`;
  }

  const pinForm = () => window.CC_ADM && window.CC_ADM.adm && window.CC_ADM.ca_client && window.CC_ADM.n < 2 ? `<div class="msk-pin"><label for="msk-pin">cod date fine</label><input id="msk-pin" inputmode="numeric" autocomplete="off" maxlength="12" placeholder="····" aria-label="cod date fine"><button type="button" id="msk-pin-go">Deschide</button><small id="msk-pin-m">cu codul, datele fine se deschid complete</small></div>` : "";
  function client(j) {
    const c = j.contoare || {};
    return pinForm() + `<p>Pentru această proprietate există date fine: ${esc(c.contacte ?? 0)} contacte, ${esc(c.firme ?? 0)} firme, ${esc(c.persoane ?? 0)} persoane, ${esc(c.acte ?? 0)} acte în zonă. Se văd primele caractere; restul se deschide la comandă.</p>`
      + contoare(c)
      + t("Firme din zonă", (j.firme || []).slice(0, N).map(f => `<tr><td>${m(f, "denumire")}</td><td>${m(f, "telefon")}</td><td>${m(f, "adresa_text")}</td></tr>`))
      + t("Persoane", (j.persoane || []).slice(0, N).map(p => `<tr><td>${m(p, "nume")}</td><td>${esc(p.rol)}</td><td>${esc(p.n)}</td></tr>`))
      + t("Acte AC/CU în jur", (j.acte || []).slice(0, N).map(a => `<tr><td>${esc(a.tip)} ${esc(a.an)}</td><td>${m(a, "beneficiar")}</td><td>CF ${m(a, "nr_cf")}</td><td>${esc(a.obiect)}</td><td>${a.dist != null ? esc(a.dist) + " m" : "în sat"}</td></tr>`))
      + t("Anunțuri", (j.randuri || []).slice(0, N).map(r => `<tr><td>${m(r, "titlu")}</td><td>${esc(r.pret)}</td><td>${m(r, "nume")}</td><td>${m(r, "tel")}</td></tr>`));
  }

  function admin(V) {
    const c = V.contoare || {}, L = 40;
    return `<span class="msk-adm">🔓 admin (${local ? "local" : "test, jeton Admin"}): date complete din privat.json — nu se publică</span>` + contoare(c)
      + t("Firme din zonă", (V.firme || []).slice(0, L).map(f => `<tr><td>${esc(f.denumire)}</td><td>${esc(f.telefon || "—")}</td><td>${esc(f.adresa_text)}</td><td>${f.web ? esc(f.web) : ""}</td></tr>`))
      + t("Persoane", (V.persoane || []).slice(0, L).map(p => `<tr><td>${esc(p.nume)}</td><td>${esc(p.rol)}</td><td>${esc(p.n)}</td><td>${esc((p.firme || []).filter(Boolean).slice(0, 3).join(", "))}</td></tr>`))
      + t("Acte AC/CU în jur", (V.acte || []).slice(0, L).map(a => `<tr><td>${esc(a.tip)} ${esc(a.nr)}/${esc(a.an)}</td><td>${esc(a.beneficiar)}</td><td>CF ${esc(a.nr_cf || "—")} · NC ${esc(a.nc || "—")}</td><td>${esc(a.obiect)}</td><td>${a.dist != null ? esc(a.dist) + " m" : "în sat"}</td></tr>`))
      + t("Anunțuri", (V.anunturi || []).slice(0, L).map(a => `<tr><td>${a.url ? `<a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.titlu)}</a>` : esc(a.titlu)}</td><td>${esc(a.pret)}</td><td>${esc(a.vanzator || "—")}</td><td>${esc((a.telefoane || []).join(", ") || "—")}</td><td>${esc(a.dist)} m</td></tr>`));
  }

  async function json(u) { try { const r = await fetch(u, { cache: "no-cache" }); return r.ok ? await r.json() : null; } catch (e) { return null; } }

  let facut = null, ultim = null;
  async function porneste() {
    if (ultim && !ultim.isConnected) { facut = null; ultim = null; }   // v82.4.0: acordeonul a refăcut DOM-ul cât s-a adus privat.json prin funcție: se redesenează
    const Dd = typeof D !== "undefined" ? D : null; if (!Dd || !Dd.id || facut === Dd.id) return;
    let pr = $(".ac-pr"); if (!pr && !document.body.classList.contains("ac-gata") && Date.now() - T0 < 20000) return;
    facut = Dd.id;
    const P = `p/${encodeURIComponent(Dd.id)}/`;
    const j = await json(P + "privat_mostra.json"); if (!j || !j.contoare) return;   // mostra veche (G7) sau lipsă: nu ating nimic
    css();
    const V = ADMIN() ? await json(P + "privat.json") : null;
    pr = $(".ac-pr") || pr;   // nodul poate fi altul după așteptare
    let box = pr; if (!box) { box = document.createElement("section"); box.id = "cc-privat-msk"; box.innerHTML = "<h2>🔒 Date fine</h2>"; ($(".wrap") || document.body).appendChild(box); }
    const btn = box.querySelector(".ac-pr-btn");
    const div = document.createElement("div"); div.className = "msk"; div.innerHTML = V && V.contoare ? admin(V) : client(j);
    box.innerHTML = ""; box.appendChild(div); if (btn && !V) box.appendChild(btn);
    box.dataset.msk = V ? "admin" : "client"; ultim = box;
    const go = box.querySelector("#msk-pin-go"); if (go) { const inp = box.querySelector("#msk-pin"), m = box.querySelector("#msk-pin-m");
      const trimite = async () => { const pin = inp.value.trim(); if (!pin) { m.textContent = "scrie codul"; return; } go.disabled = true; m.textContent = "se verifică…";
        try { const r = await fetch(window.CC_STARE ? window.CC_STARE.FN : "https://vzrozriarqocscpgfscw.supabase.co/functions/v1/raport_cod", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "privat", token: window.CC_ADM.token, pin }) }), j2 = await r.json();
          if (!r.ok) { m.textContent = j2.error || "cod greșit"; go.disabled = false; return; }
          window.CC_ADM.n = 2; if (window.CC_ADM_SALVEAZA) await window.CC_ADM_SALVEAZA(window.CC_ADM); location.reload();
        } catch (e) { m.textContent = "nu s-a putut verifica; încearcă din nou"; go.disabled = false; } };
      go.onclick = trimite; inp.onkeydown = e => { if (e.key === "Enter") trimite(); }; }
  }
  const T0 = Date.now();
  setInterval(() => { porneste().catch(e => console.warn("mascare", e)); }, 900);
})();
