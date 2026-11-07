/* Raportul Casei v81 - actele clientului în mapa proprietății (REGULI_V81_PAS2 §10, 03.11.2026). Fișierele stau doar pe dispozitivul clientului (IndexedDB) și nu pleacă nicăieri.
   Limite spuse pe ecran: se pierd dacă se golește browserul și nu se văd pe alt dispozitiv. Semnătura electronică și păstrarea între dispozitive cer aplicația. */
(function () {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const baza = () => new Promise((ok, no) => { const r = indexedDB.open("cc-mapa-fisiere", 1); r.onupgradeneeded = () => r.result.createObjectStore("acte", { keyPath: "id" }); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
  const tx = async (mod, f) => { const d = await baza(); return new Promise((ok, no) => { const t = d.transaction("acte", mod), q = f(t.objectStore("acte")); t.oncomplete = () => ok(q && q.result); t.onerror = () => no(t.error); if (q) q.onsuccess = () => { if (mod === "readonly") ok(q.result); }; }); };
  const toate = async rid => ((await tx("readonly", s => s.getAll())) || []).filter(a => a.rid === rid).sort((a, b) => a.ord - b.ord);
  const pune = a => tx("readwrite", s => s.put(a));
  const scoate = id => tx("readwrite", s => s.delete(id));
  async function monteaza(root, rid) {
    if (root.querySelector("#mf")) return;
    const c = document.createElement("div"); c.className = "cutie"; c.id = "mf";
    c.innerHTML = `<h2>actele tale</h2><p class="mut" style="margin:0;font-size:14px">atașează, ordonează și păstrează actele aici. rămân doar pe acest dispozitiv: nu le primim noi și se pierd dacă golești browserul.</p>
      <label class="btn lat" style="text-align:center;cursor:pointer">atașează acte<input type="file" id="mf-in" multiple accept="application/pdf,image/*" hidden></label><div class="lista" id="mf-l"></div><button class="btn alb lat" id="mf-tr" hidden>trimite ce ai bifat</button><p id="mf-m" class="mut" style="margin:0"></p>`;
    (root.querySelector(".ecran") || root).appendChild(c);
    const L = c.querySelector("#mf-l"), M = c.querySelector("#mf-m"), TR = c.querySelector("#mf-tr");
    async function arata() {
      const A = await toate(rid);
      L.innerHTML = A.length ? A.map((a, i) => `<div class="r" data-id="${esc(a.id)}" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><input type="checkbox" class="mf-s" aria-label="alege" style="width:22px;height:22px"><input type="text" class="mf-n" value="${esc(a.nume)}" aria-label="numele actului" style="flex:1;min-width:120px"><button class="btn alb mic mf-sus" ${i ? "" : "disabled"} aria-label="mai sus">↑</button><button class="btn alb mic mf-jos" ${i < A.length - 1 ? "" : "disabled"} aria-label="mai jos">↓</button><button class="btn alb mic mf-de">deschide</button><button class="btn alb mic mf-sc">scoate</button></div>`).join("") : `<p class="mut" style="margin:0;font-size:14px">niciun act încă.</p>`;
      TR.hidden = !A.length || !navigator.canShare;
    }
    c.querySelector("#mf-in").onchange = async e => { const a0 = await toate(rid); let o = a0.length ? a0[a0.length - 1].ord + 1 : 0;
      try { for (const f of e.target.files) await pune({ id: rid + ":" + Date.now() + ":" + Math.random().toString(36).slice(2, 8), rid, nume: f.name, tip: f.type, ord: o++, fisier: f }); M.textContent = ""; } catch (x) { M.textContent = "actul nu s-a putut păstra pe acest dispozitiv."; }
      e.target.value = ""; arata(); };
    L.addEventListener("click", async e => { const r = e.target.closest("[data-id]"); if (!r) return; const A = await toate(rid), i = A.findIndex(a => a.id === r.dataset.id), a = A[i]; if (!a) return;
      if (e.target.closest(".mf-sus,.mf-jos")) { const b = A[i + (e.target.closest(".mf-sus") ? -1 : 1)]; if (!b) return; const t = a.ord; a.ord = b.ord; b.ord = t; await pune(a); await pune(b); arata(); }
      else if (e.target.closest(".mf-de")) window.open(URL.createObjectURL(a.fisier), "_blank");
      else if (e.target.closest(".mf-sc")) { await scoate(a.id); arata(); } });
    L.addEventListener("change", async e => { if (!e.target.matches(".mf-n")) return; const A = await toate(rid), a = A.find(x => x.id === e.target.closest("[data-id]").dataset.id); if (a) { a.nume = e.target.value.trim() || a.nume; await pune(a); } });
    TR.onclick = async () => { const A = await toate(rid), id = [...L.querySelectorAll(".mf-s:checked")].map(x => x.closest("[data-id]").dataset.id), f = A.filter(a => id.includes(a.id)).map(a => new File([a.fisier], a.nume, { type: a.tip })); if (!f.length) { M.textContent = "bifează întâi ce vrei să trimiți."; return; } if (navigator.canShare({ files: f })) navigator.share({ files: f }).catch(() => {}); else M.textContent = "dispozitivul nu poate trimite direct aceste fișiere."; };
    arata();
  }
  window.CC_MAPA_F = { monteaza, toate };
})();
