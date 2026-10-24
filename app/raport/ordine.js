/* Raport în creștere — ordinea capitolelor în bara laterală, după interes (decizia lui Manu, 21.10.2026):
   Rezumat, Urbanism, Estimare valoare, Inundații, Autorizații, Monumente, apoi restul, în grupurile lor.
   Cele 5 capitole prioritare merg într-un grup „Cele mai importante”, imediat după Rezumat; nu se adaugă, nu se șterge nimic (rămân 19 capitole + Stare date).
   „Raportul întreg” (raport_complet.js) citește ordinea din bară, deci o urmează automat. Idempotent; sondează pentru că Estimare valoare își adaugă butonul după încărcare. */
(function () {
  const PRIO = ["urbanism", "evaluare", "inundatii", "autorizatii", "monumente"];
  function aplica() {
    const nav = document.getElementById("tabs"); if (!nav) return;
    const btn = t => nav.querySelector(`[data-t="${t}"]`);
    if (!PRIO.every(btn)) return;                       // așteaptă ca toate să existe (evaluare apare mai târziu)
    let g = document.getElementById("ord-prio");
    if (!g) {
      g = document.createElement("div"); g.className = "ng"; g.id = "ord-prio";
      g.innerHTML = `<span class="nl">Cele mai importante</span>`;
      const rez = btn("rezumat"); rez.after(g);
    }
    PRIO.forEach((t, i) => { const b = btn(t); if (b.parentNode !== g || g.children[i + 1] !== b) g.appendChild(b); });
    nav.querySelectorAll(".ng").forEach(x => { if (x === g) return; const vis = [...x.querySelectorAll("button")].some(b => !b.hidden); x.style.display = vis ? "" : "none"; });
  }
  setInterval(() => { try { aplica(); } catch (e) { console.warn("ordine", e); } }, 700);
})();
