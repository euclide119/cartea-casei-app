/* Raport Master: bara de sus are \u201eRaport juridic\u201d (modelul cu date fictive) \u0219i butonul \u201eRezumat \u00b7 Simplu \u00b7 Complet \u00een paralel\u201d
   (trei cadre ale aceleia\u0219i pagini, ?vm=rezumat|simplu|complet). V1, V2 Atelier, extrasele de \u00eensorire \u0219i notele de subsol au disp\u0103rut (22.10.2026). */
(function () {
  "use strict";
  const VM = new URLSearchParams(location.search).get("vm");
  if (VM) {   // suntem \u00eentr-un cadru al vederii paralele: f\u0103r\u0103 bar\u0103 Master; Mod client se porne\u0219te de pe butonul lui
    if (VM === "client") { let n = 0; const t = setInterval(() => { const b = document.getElementById("bld-client"); if (b) { clearInterval(t); setTimeout(() => b.click(), 800); } else if (++n > 80) clearInterval(t); }, 250); }
    const st = document.createElement("style"); st.textContent = ".wrap>.mbar{display:none!important}"; document.head.appendChild(st);
    return;
  }
  const _V2 = {
    rezumat: ["sinteza", "Ce am g\u0103sit, ce po\u021bi face"], inundatii: ["inund", "Zone inundabile"],
    insorire: ["insor", "Studiu de \u00eensorire"], pv: ["pv", "Poten\u021bial fotovoltaic"], urbanism: ["urban", "Ce permite urbanismul"],
    zonare: ["zonare", "Zonarea cartierului"], facilitati: ["facil", "Facilit\u0103\u021bi \u00een proximitate"],
    transport: ["timpi", "Transport \u0219i timpi de deplasare"], scoli: ["scoli", "\u0218coli \u0219i rezultate"],
    populatie: ["pop", "Popula\u021bia \u0219i portretul zonei"], monumente: ["monum", "Monumente \u0219i situri"],
    seismic: ["seism", "Risc seismic"], autorizatii: ["urban", "Ce permite urbanismul"], alunecari: ["alunec", "Alunec\u0103ri de teren"],
    arii_protejate: ["arii", "Arii naturale protejate"], aer: ["aer", "Calitatea aerului"], zgomot: ["zgomot", "Zgomot"],
    costuri: ["taxe", "Costurile tranzac\u021biei"],
  };
  const EXTRA = {};

  const css = document.createElement("style");
  css.textContent = `
.mbar{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;padding:10px 0 12px;border-bottom:1px solid var(--line);margin-bottom:10px}
.mbar .ml{font:600 11px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-right:4px}
.mbar a{font:600 13px var(--font);padding:5px 11px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--fg);text-decoration:none;white-space:nowrap}
.mbar a[aria-current="page"]{background:var(--fg);color:var(--panel);border-color:var(--fg)}
.mbar a small{font:500 11px var(--mono);color:var(--muted);margin-left:4px}
.mbar a[aria-current="page"] small{color:inherit;opacity:.75}
.mfoot{margin-top:22px;padding-top:10px;border-top:1px dashed var(--line);font-size:12.5px;color:var(--muted);display:flex;flex-wrap:wrap;gap:4px 14px}
.mfoot b{font:600 10.5px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.mfoot a{color:var(--accent)}`;
  document.head.appendChild(css);

  const wrap = document.querySelector(".wrap");
  if (!wrap) return;
  const bar = document.createElement("nav");
  bar.className = "mbar";
  bar.setAttribute("aria-label", "Raport Master");
  bar.innerHTML = `<span class="ml">Raport Master</span>
    <a href="juridic_model.html">Raport juridic<small>date fictive</small></a>
`;
  wrap.insertBefore(bar, wrap.firstChild);

  // vedere paralel\u0103 (cerut 22.10.2026): aceea\u0219i proprietate \u0219i acela\u0219i capitol \u00een Simplu, Complet \u0219i Mod client, una l\u00e2ng\u0103 alta
  const css2 = document.createElement("style");
  css2.textContent = `
.mp-b{font:600 12px var(--font);padding:2px 10px;border-radius:999px;border:1px solid var(--accent);background:var(--accent);color:#fff;cursor:pointer}
#mp{position:fixed;inset:0;z-index:9999;background:var(--bg);display:flex;flex-direction:column}
#mp[hidden]{display:none}
#mp .mpt{display:flex;gap:10px;align-items:center;padding:6px 10px;border-bottom:1px solid var(--line);font:600 13px var(--font)}
#mp .mpt span{color:var(--muted);font-weight:500;font-size:12px}
#mp .mpt button{margin-left:auto;font:600 12px var(--font);padding:3px 12px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--fg);cursor:pointer}
#mp .mpg{flex:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding:6px;min-height:0}
#mp .mpc{display:flex;flex-direction:column;min-height:0;border:1px solid var(--line);border-radius:8px;overflow:hidden}
#mp .mpc b{font:600 12px var(--mono);letter-spacing:.06em;text-transform:uppercase;padding:4px 8px;background:var(--panel);border-bottom:1px solid var(--line)}
#mp iframe{flex:1;width:100%;border:0;min-height:0;background:var(--bg)}
@media (max-width:900px){#mp .mpg{grid-template-columns:1fr;overflow:auto}#mp .mpc{min-height:70vh}}`;
  document.head.appendChild(css2);
  const MOD = [["rezumat", "Rezumat (~3 pagini)"], ["simplu", "Simplu (~9 pagini)"], ["complet", "Complet (~29 pagini)"]];
  function paralel() {
    let o = document.getElementById("mp");
    if (!o) {
      o = document.createElement("div"); o.id = "mp"; o.hidden = true;
      o.innerHTML = `<div class="mpt">Cele 3 moduri \u00een paralel <span>aceea\u0219i proprietate; dac\u0103 schimbi capitolul sau proprietatea \u00een bara de sus, apas\u0103 \u201eRe\u00eencarc\u0103\u201d</span><button type="button" id="mp-r">Re\u00eencarc\u0103</button><button type="button" id="mp-x">\u00cenchide</button></div>
        <div class="mpg">${MOD.map(([k, t]) => `<div class="mpc"><b>${t}</b><iframe data-vm="${k}" title="${t}"></iframe></div>`).join("")}</div>`;
      document.body.appendChild(o);
      o.querySelector("#mp-x").onclick = () => { o.hidden = true; o.querySelectorAll("iframe").forEach(f => f.removeAttribute("src")); };
      o.querySelector("#mp-r").onclick = () => incarca(o);
    }
    o.hidden = false; incarca(o);
  }
  function incarca(o) {
    const h = location.hash;
    o.querySelectorAll("iframe").forEach(f => { f.src = "index.html?vm=" + f.dataset.vm + h; });
  }
})();
