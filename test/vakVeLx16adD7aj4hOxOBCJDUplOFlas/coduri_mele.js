/* Raport · Cartea Casei — „Codurile mele” (v82.20.0, 13.11.2026, cerut de Manu: „vreau sa am in telefonul meu - fiecare cod pt fiecare raport - in acelasi loc”).
   Doar în vederea Admin (jeton Admin valid). Valorile vin decriptate de la funcția raport_carduri_admin (acțiunea coduri_mele, răspuns no-store) și stau DOAR în memorie:
   nu se scriu în localStorage / IndexedDB / Cache API; la închiderea ecranului se șterg. Fiecare cod: ascuns implicit (•••), „arată”, „copiază”, „QR” (QR mare de arătat clientului:
   linkul raportului / cardului / intrării master, sau codul pentru DOM). Codurile nu apar în log. */
(function () {
  "use strict";
  if (window.parent !== window || !window.CC_ADM_P) return;
  const FN = "https://vzrozriarqocscpgfscw.supabase.co/functions/v1/raport_carduri_admin";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const baza = () => location.origin + location.pathname.replace(/[^/]*$/, "");
  let D0 = null, box = null;

  function stil() {
    if (document.getElementById("cm-css")) return;
    const st = document.createElement("style"); st.id = "cm-css";
    st.textContent = `#cc-cm{position:fixed;inset:0;z-index:99990;background:#f6f1e7;color:#1a1e2a;overflow:auto;font:15px/1.45 -apple-system,system-ui,sans-serif;padding:14px 14px 90px}
#cc-cm h2{font:700 22px -apple-system,system-ui,sans-serif;margin:0}#cc-cm h3{font:700 16px -apple-system,system-ui,sans-serif;margin:0 0 6px}
#cc-cm .bx{background:#fffdf8;border:1px solid #cfc7b6;border-radius:12px;padding:12px;margin-top:12px}
#cc-cm .r{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0}#cc-cm .l{flex:1 1 150px;min-width:0;color:#4a5063;font-size:13px}
#cc-cm .v{font:700 17px ui-monospace,Menlo,monospace;letter-spacing:.08em;min-width:110px}
#cc-cm button{font:700 13px -apple-system,system-ui,sans-serif;border:1.5px solid #1a1e2a;border-radius:9px;padding:7px 10px;background:#fff;color:#1a1e2a;min-height:36px}
#cc-cm button.p{background:#1d5fb0;border-color:#1d5fb0;color:#fff}#cc-cm .m{color:#9a2a1f;min-height:18px}
#cc-cm .st{display:inline-block;border-radius:999px;padding:0 8px;font-size:12px;font-weight:700;color:#fff;background:#1d5fb0}
#cc-cm .qr{position:fixed;inset:0;z-index:99995;background:rgba(246,241,231,.98);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:20px;text-align:center}
#cc-cm .qr canvas{width:min(86vw,420px);height:auto;background:#fff;border-radius:10px}#cc-cm .qr .big{font:700 30px ui-monospace,Menlo,monospace;letter-spacing:.12em}`;
    document.head.appendChild(st);
  }
  function rand(l, val, link) {   // un cod: ascuns, arată, copiază, QR
    const id = "cm" + Math.random().toString(36).slice(2, 8);
    if (val == null && !link) return `<div class="r"><span class="l">${esc(l)}</span><span class="v">—</span><span class="l">nu e setat</span></div>`;
    return `<div class="r" data-v="${esc(val || "")}" data-l="${esc(link || "")}" data-id="${id}"><span class="l">${esc(l)}</span><span class="v">${val ? "•••••••" : ""}</span>${val ? `<button data-a="arata">arată</button><button data-a="copiaza">copiază</button>` : ""}<button data-a="qr">QR</button></div>`;
  }
  function qr(text, cod, titlu) {
    const q = document.createElement("div"); q.className = "qr";
    const cv = document.createElement("canvas"); q.appendChild(cv);
    try { const o = window.qrcode(0, "M"); o.addData(text); o.make(); const n = o.getModuleCount(), cell = 8, W = (n + 4) * cell; cv.width = cv.height = W; const g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, W, W); g.fillStyle = "#1a1e2a"; for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (o.isDark(r, k)) g.fillRect((k + 2) * cell, (r + 2) * cell, cell, cell); } catch (e) { q.textContent = "QR indisponibil"; }
    const t = document.createElement("div"); t.innerHTML = `<b>${esc(titlu)}</b>${cod ? `<div class="big">${esc(cod)}</div>` : ""}`; q.appendChild(t);
    const b = document.createElement("button"); b.className = "p"; b.textContent = "Închide QR"; b.onclick = () => q.remove(); q.appendChild(b); box.appendChild(q);
  }
  function leaga() {
    box.querySelectorAll(".r[data-id]").forEach(r => r.addEventListener("click", async ev => {
      const a = ev.target.closest("button") && ev.target.closest("button").dataset.a; if (!a) return;
      const v = r.dataset.v, l = r.dataset.l, lab = r.querySelector(".l").textContent, sp = r.querySelector(".v");
      if (a === "arata") { const on = sp.dataset.on === "1"; sp.textContent = on ? "•••••••" : v; sp.dataset.on = on ? "" : "1"; ev.target.textContent = on ? "arată" : "ascunde"; }
      if (a === "copiaza") { try { await navigator.clipboard.writeText(v); ev.target.textContent = "copiat"; setTimeout(() => { ev.target.textContent = "copiază"; }, 1500); } catch (e) { ev.target.textContent = "nu s-a putut"; } }
      if (a === "qr") qr(l || v, v, lab);
    }));
  }
  function randare(J) {
    const card = c => `<div class="r" data-id="c${esc(c.id)}" data-l="${esc(baza() + "#card=" + c.id)}" data-v=""><span class="l">card ${esc(c.destinatar)} · <span class="st" style="background:${c.stare === "blocat" ? "#9a2a1f" : c.stare === "expirat" ? "#6b6f7d" : c.stare === "legat" ? "#1f6b3d" : "#1d5fb0"}">${esc(c.stare)}</span><br><span style="font-size:12px;color:#6b6f7d">${esc(c.id)}</span></span><button data-a="qr">QR card</button></div>`;
    box.querySelector("#cm-c").innerHTML = `<div class="bx"><h3>Cod master</h3><div class="l">Deschide orice raport și DOM ca utilizator; are aceeași limită ca un om.</div>${rand("cod master", J.master, baza() + "#master")}</div>
<div class="bx"><h3>Coduri globale (valabile la toate rapoartele)</h3>${rand("cod de intrare", J.globale && J.globale.intrare)}${rand("cod DOM", J.globale && J.globale.dom)}</div>
${(J.rapoarte || []).map(r => `<div class="bx"><h3>${esc(r.eticheta)}</h3>${rand("cod de intrare", r.intrare, baza() + "#r=" + r.id)}${rand("cod DOM", r.dom)}${(r.carduri || []).map(card).join("") || `<div class="l">niciun card emis pe acest raport</div>`}</div>`).join("")}`;
    leaga();
  }
  async function deschide() {
    stil(); document.getElementById("cc-cm")?.remove();
    const s = window.CC_ADM; if (!s || !s.token || s.c || s.k || s.pv || s.m) return;
    box = document.createElement("div"); box.id = "cc-cm"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "Codurile mele");
    box.innerHTML = `<div class="r" style="justify-content:space-between"><h2>Codurile mele</h2><button id="cm-x" class="p">Închide</button></div><div class="m" id="cm-m">se încarcă…</div><div id="cm-c"></div>`;
    document.body.appendChild(box);
    const inchide = () => { D0 = null; box && box.remove(); box = null; };
    box.querySelector("#cm-x").onclick = inchide;
    try {
      const r = await fetch(FN, { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "coduri_mele", token: s.token }) });
      const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || "eroare " + r.status);
      D0 = j; box.querySelector("#cm-m").textContent = ""; randare(j);
    } catch (e) { box.querySelector("#cm-m").textContent = e.message; }
    addEventListener("pagehide", inchide, { once: true });
  }
  window.CC_CODURI = deschide;
})();
