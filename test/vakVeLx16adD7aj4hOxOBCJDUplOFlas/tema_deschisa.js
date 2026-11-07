/* Raportul casei · tema deschisă (v82.6.0, 07.11.2026; cerere Manu după testul pe telefon).
   · Tema e mereu deschisă, fără adaptare la modul întunecat al telefonului (blocurile dark din index.html au fost scoase; aici: color-scheme light).
   · Butoanele plutitoare care erau negre („capitole”, „pagina principală”, bara de cod, „închide raportul”) devin deschise, cu text închis și contur (contrast ≥ 4,5:1).
   · Pe mobil eticheta „← pagina principală” se micșorează, iar la derulare se strânge într-o bulă „←”, ca să nu acopere alte butoane.
   Modul nou, fără a atinge acordeon.js / client.js / hărțile; se aplică peste ele. */
(function () {
  "use strict";
  const css = `
:root{color-scheme:light}
html,body{color-scheme:light}
#cl-home,#ac-cap,#cc-iesi{background:#fffdf8!important;color:#1a1e2a!important;border:1.5px solid #1a1e2a!important;box-shadow:0 4px 14px -6px rgba(26,30,42,.35)!important}
#cl-home:hover,#ac-cap:hover,#cc-iesi:hover{background:#f6f1e7!important}
.cc-cod{background:#f6f1e7!important;box-shadow:0 -4px 18px rgba(26,30,42,.18)!important;border-top:1.5px solid #1a1e2a}
.cc-cod small{color:#1a1e2a!important}
.cc-cod button{background:#1a1e2a!important;color:#fffdf8!important}
#cc-modv{box-shadow:0 2px 8px rgba(26,30,42,.25)!important}
@media (max-width:700px){
  #cl-home{left:10px;bottom:62px;padding:6px 11px;font-size:12px;gap:5px;transition:padding .18s,font-size .18s,width .18s,height .18s}
  #ac-cap{padding:7px 12px;font-size:13px;left:8px;top:8px}
  #cl-home.cl-mic{padding:0;width:34px;height:34px;font-size:0!important;justify-content:center;gap:0}
  #cl-home.cl-mic::before{content:"\\2190";font:700 17px/1 var(--font,sans-serif)}
}`;
  const st = document.createElement("style"); st.id = "tema-deschisa"; st.textContent = css; (document.head || document.documentElement).appendChild(st);
  let mic = false;
  const sync = () => { const b = document.getElementById("cl-home"); if (!b) return; const vrea = scrollY > 90; if (vrea !== mic) { mic = vrea; b.classList.toggle("cl-mic", mic); } };
  addEventListener("scroll", sync, { passive: true }); setInterval(sync, 700);
})();
