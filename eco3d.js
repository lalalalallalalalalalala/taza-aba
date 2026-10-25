/* Таза Аба — 3D-навигатор эко-маршрута (v41 → v44-sat, премиум-грейдинг). Грузится лениво из eco.js; MapLibre GL (CSP-сборка, локально в vendor/maplibre),
 * векторные тайлы OpenFreeMap, 3D-здания. Камера от третьего лица, «курс вверх», аватар идёт по маршруту; режим GPS — следование за реальной позицией.
 * v44-sat: режим «Спутник» — снимки Esri World Imagery (с атрибуцией, как в Leaflet-подложке «Спутник»), рельеф AWS Terrain Tiles (terrarium, Mapzen/SRTM),
 * отмывка рельефа, небо/атмосфера/дымка (цвет горизонта зависит от AQI маршрута), полупрозрачные 3D-здания, подписи OpenFreeMap поверх снимка;
 * переключатель «Спутник / Схема», кинематографичный «Облёт» всего маршрута. Слабые устройства: меньше рельеф, maxzoom DEM и pixelRatio. Reduced motion — без облёта-анимации. */
(function () {
  const T3 = {
    ru: { play: "Старт", pause: "Пауза", gps: "GPS", gpsOn: "Слежу за GPS", gpsErr: "GPS недоступен", off: "Вы в {m} м от маршрута", left: "осталось", ahead: "Впереди {d}", close: "Закрыть", sim: "Симуляция", est: "оценка «Дымка»", done: "Маршрут пройден 🎉", speed: "Скорость",
      sat: "Спутник", map: "Схема", fly: "Облёт", flyStop: "Стоп", flyHint: "Облёт маршрута · коснитесь карты, чтобы остановить", layer: "Вид карты", relief: "рельеф ×{x}" },
    ky: { play: "Баштоо", pause: "Тыным", gps: "GPS", gpsOn: "GPS ээрчип жатам", gpsErr: "GPS жеткиликсиз", off: "Маршруттан {m} м алыстадыңыз", left: "калды", ahead: "Алдыда {d}", close: "Жабуу", sim: "Симуляция", est: "«Дымка» баалоосу", done: "Маршрут бүттү 🎉", speed: "Ылдамдык",
      sat: "Спутник", map: "Схема", fly: "Учуп көрүү", flyStop: "Токтотуу", flyHint: "Маршрутту учуп көрүү · токтотуу үчүн картаны басыңыз", layer: "Картанын көрүнүшү", relief: "рельеф ×{x}" },
    en: { play: "Start", pause: "Pause", gps: "GPS", gpsOn: "Following GPS", gpsErr: "GPS unavailable", off: "You are {m} m off the route", left: "left", ahead: "Next {d}", close: "Close", sim: "Simulation", est: "“Dymka” estimate", done: "Route complete 🎉", speed: "Speed",
      sat: "Satellite", map: "Map", fly: "Fly-over", flyStop: "Stop", flyHint: "Route fly-over · tap the map to stop", layer: "Map view", relief: "terrain ×{x}" } };
  const tt = (k, o) => { let s = (T3[LANG] || T3.ru)[k] ?? T3.ru[k]; if (o) for (const [a, b] of Object.entries(o)) s = s.replace("{" + a + "}", b); return s; };
  const RM = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } })();
  const WEAK = (typeof LOWEND !== "undefined" && LOWEND) || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;
  const MOB = (() => { try { return matchMedia("(max-width: 1023px), (pointer: coarse)").matches; } catch (e) { return false; } })();
  const SAT_KEY = "tazaAba.e3sat";
  const ESRI_IMG = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const ESRI_ATTR = 'Imagery &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a> &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community';
  const DEM = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
  const DEM_ATTR = 'Terrain: <a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener">Mapzen / AWS Terrain Tiles</a> (SRTM, GMTED, ETOPO1)';
  const EXAG = WEAK ? 1 : 1.2, DEM_MAX = WEAK ? 12 : 14, SAT_MAX = WEAK ? 18 : 19; /* Esri World Imagery в Бишкеке/Оше есть до z19 — без «мыла» на уровне улиц */
  /* стили новых контролов — здесь, чтобы не трогать eco.css (CSP: style-src 'unsafe-inline' разрешён) */
  if (!document.getElementById("e3-sat-css")) { const st = document.createElement("style"); st.id = "e3-sat-css"; st.textContent = `
.e3-side{display:flex;flex-direction:column;gap:8px;align-items:flex-end;pointer-events:none}
.e3-side>*{pointer-events:auto}
.e3-seg{display:flex;flex-direction:column;gap:3px;padding:3px;border-radius:15px;background:rgba(14,20,30,.78);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(14px);box-shadow:0 10px 30px -14px rgba(0,0,0,.6)}
.e3-seg button,.e3-fly{display:flex;align-items:center;gap:6px;border:0;border-radius:12px;padding:8px 11px;min-height:40px;min-width:44px;font:800 12.5px Manrope,system-ui,sans-serif;color:#eef3f8;background:transparent;cursor:pointer;white-space:nowrap}
.e3-seg button svg,.e3-fly svg{width:17px;height:17px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.e3-seg button[aria-pressed="true"]{background:#eef3f8;color:#0b1218}
.e3-fly{background:rgba(14,20,30,.78);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(14px);border-radius:15px;padding:9px 12px}
.e3-fly.on{background:linear-gradient(135deg,#2f86c4,#4aa3dc);border-color:transparent}
.e3-seg button:focus-visible,.e3-fly:focus-visible{outline:2px solid #8fd0ff;outline-offset:2px}
.e3.sat .e3-hud{background:rgba(10,16,24,.72)}
.e3-cine{position:absolute;left:50%;top:auto;bottom:calc(92px + env(safe-area-inset-bottom));transform:translateX(-50%);padding:8px 14px;border-radius:999px;background:rgba(10,16,24,.66);color:#eef3f8;font:700 12.5px Manrope,system-ui,sans-serif;backdrop-filter:blur(10px);white-space:nowrap;pointer-events:none}
.e3.flying .e3-bot{opacity:.35;transition:opacity .4s}
.e3 .maplibregl-ctrl-attrib{font:500 10.5px Manrope,system-ui,sans-serif}
.e3-vig{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .5s;background:radial-gradient(120% 90% at 50% 58%,rgba(0,0,0,0) 55%,rgba(4,10,18,.42) 100%),linear-gradient(180deg,rgba(255,214,160,.10),rgba(255,236,210,0) 38%,rgba(10,22,36,.16))}
.e3.sat .e3-vig{opacity:1}
.e3-vig::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,196,128,.07),rgba(255,170,90,.05));mix-blend-mode:soft-light}
.e3-relief[hidden]{display:none}.e3-relief{display:block;margin-top:2px;font:600 10px Manrope,sans-serif;opacity:.5}
@media (max-width:600px){.e3-seg button span,.e3-fly span{display:none}.e3-seg button,.e3-fly{padding:8px 10px}.e3-cine{font-size:11.5px;max-width:calc(100% - 32px);white-space:normal;text-align:center}}
@media (prefers-reduced-motion:reduce){.e3.flying .e3-bot{transition:none}}`; document.head.appendChild(st); }
  const IC = { sat: '<svg viewBox="0 0 24 24"><path d="M13 7l4-4 4 4-4 4zM3 17l4-4 4 4-4 4zM9 9l6 6M14.5 14.5a3 3 0 0 0 0-5M17 17a6.5 6.5 0 0 0 0-10"/></svg>', map: '<svg viewBox="0 0 24 24"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/></svg>', fly: '<svg viewBox="0 0 24 24"><path d="M2 16l20-8-8 12-2-5z"/><path d="M12 15l-3 4"/></svg>' };
  let libP = null;
  const lib = () => libP || (libP = new Promise((ok, no) => { const c = document.createElement("link"); c.rel = "stylesheet"; c.href = "vendor/maplibre/maplibre-gl.css"; document.head.appendChild(c);
    const s = document.createElement("script"); s.src = "vendor/maplibre/maplibre-gl-csp.js"; s.onload = () => { maplibregl.setWorkerUrl("vendor/maplibre/maplibre-gl-csp-worker.js"); ok(); }; s.onerror = no; document.head.appendChild(s); }));
  const bearing = (a, b) => { const r = Math.PI / 180, y = Math.sin((b[1] - a[1]) * r) * Math.cos(b[0] * r), x = Math.cos(a[0] * r) * Math.sin(b[0] * r) - Math.sin(a[0] * r) * Math.cos(b[0] * r) * Math.cos((b[1] - a[1]) * r); return (Math.atan2(y, x) / r + 360) % 360; };
  const angD = (a, b) => ((b - a + 540) % 360) - 180;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  /* opts: { sat: true|false (иначе — из localStorage, по умолчанию спутник), fly: true — сразу запустить облёт (кнопка «3D-спутник» на карточке маршрута) } */
  window.eco3dOpen = async function (route, mode, opts) {
    opts = opts || {};
    const dk = document.documentElement.dataset.theme === "dark", S = route.S, G = route.geom, total = route.km, spd0 = { walk: 4.6, bike: 14, car: 30 }[mode] || 4.6;
    let sat = opts.sat != null ? !!opts.sat : localStorage.getItem(SAT_KEY) !== "0";
    const cum = [0]; for (let i = 1; i < G.length; i++) cum.push(cum[i - 1] + ecoKm(G[i - 1], G[i]));
    const w = document.createElement("div"); w.className = "e3" + (sat ? " sat" : ""); w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true");
    w.innerHTML = `<div id="e3map"></div>
      <div class="e3-top"><div class="e3-hud"><div class="e3-next"><i></i><span></span></div><div class="e3-stats"><b class="e3-rem"></b><span class="e3-km"></span></div><div class="e3-prog"><i></i></div><small class="e3-est">${esc(tt("est"))}</small><small class="e3-relief" hidden></small></div>
        <div class="e3-side"><button class="e3-x" aria-label="${esc(tt("close"))}">✕</button>
          <div class="e3-seg" role="group" aria-label="${esc(tt("layer"))}"><button type="button" data-v="sat" title="${esc(tt("sat"))}" aria-label="${esc(tt("sat"))}">${IC.sat}<span>${esc(tt("sat"))}</span></button><button type="button" data-v="map" title="${esc(tt("map"))}" aria-label="${esc(tt("map"))}">${IC.map}<span>${esc(tt("map"))}</span></button></div>
          <button type="button" class="e3-fly" title="${esc(tt("fly"))}" aria-label="${esc(tt("fly"))}">${IC.fly}<span>${esc(tt("fly"))}</span></button></div></div>
      <div class="e3-bot"><button class="e3-play"></button><div class="e3-spd" role="group" aria-label="${esc(tt("speed"))}">${[1, 4, 16].map(x => `<button data-s="${x}">${x}×</button>`).join("")}</div><button class="e3-gps">${esc(tt("gps"))}</button></div>
      <div class="e3-vig" aria-hidden="true"></div><div class="e3-cine" hidden></div><div class="e3-toast" hidden></div>`;
    document.body.appendChild(w); document.documentElement.classList.add("e3-open");
    try { await lib(); } catch (e) { w.remove(); document.documentElement.classList.remove("e3-open"); return toast("3D: MapLibre load error"); }
    const mapEl = w.querySelector("#e3map");
    const pr = Math.min(window.devicePixelRatio || 1, WEAK ? 1.5 : 2);
    const m = new maplibregl.Map({ container: mapEl, style: `https://tiles.openfreemap.org/styles/${dk ? "dark" : "liberty"}`, center: [G[0][1], G[0][0]], zoom: 17, pitch: 62, bearing: bearing(G[0], G[Math.min(5, G.length - 1)]),
      attributionControl: { compact: true }, maxPitch: 80, pixelRatio: pr, fadeDuration: WEAK ? 0 : 300, canvasContextAttributes: { antialias: !WEAK } });
    let pos = 0, playing = false, speed = RM ? 1 : 4, gpsW = null, last = 0, br = m.getBearing(), raf = 0, ready = false, fly = null;
    const at = km => { let i = 1; while (i < cum.length - 1 && cum[i] < km) i++; const k = cum[i] - cum[i - 1] ? (km - cum[i - 1]) / (cum[i] - cum[i - 1]) : 0, a = G[i - 1], b = G[i]; return { ll: [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], i }; };
    const aqiAt = km => { let best = S[0]; for (const s of S) if (Math.abs(s.km - km) < Math.abs(best.km - km)) best = s; return best.a; };
    const av = document.createElement("div"); av.className = "e3-av " + mode; av.innerHTML = `<i class="e3-pulse"></i><span>${ECO_ICON[mode]}</span>`;
    const mk = new maplibregl.Marker({ element: av, rotationAlignment: "viewport", pitchAlignment: "viewport", opacity: "1", opacityWhenCovered: "1" }).setLngLat([G[0][1], G[0][0]]);
    const routeAqi = route.aqi ?? 50;
    /* дымка на горизонте: чем хуже воздух на маршруте, тем желтее/серее и плотнее */
    const hazeK = Math.max(0, Math.min(1, (routeAqi - 30) / 150));
    const mix = (a, b, k) => "#" + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, "0")).join("");
    const SKY_SAT = { "sky-color": dk ? "#2a4766" : "#5d9bd6", "horizon-color": mix([214, 230, 242], [222, 206, 170], hazeK), "fog-color": mix([205, 220, 232], [196, 182, 150], hazeK),
      "sky-horizon-blend": 0.55, "horizon-fog-blend": 0.45 + hazeK * 0.3, "fog-ground-blend": 0.94 - hazeK * 0.08, /* дымка только у горизонта, ближний план без вуали */ "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 10, 1, 13, 0] };
    const SKY_MAP = { "sky-color": dk ? "#0f1a26" : "#b9d6ee", "horizon-color": dk ? "#1d2b38" : "#eef3f7", "fog-color": dk ? "#0b1218" : "#f2f5f8", "sky-horizon-blend": 0.6, "horizon-fog-blend": 0.7, "fog-ground-blend": 0.6, "atmosphere-blend": 0 };
    const saved = {}; let vecLayers = [];
    function applyMode() {
      if (!ready) return; w.classList.toggle("sat", sat);
      w.querySelectorAll("[data-v]").forEach(b => b.setAttribute("aria-pressed", String((b.dataset.v === "sat") === sat)));
      ["e3-rd-sh", "e3-rd", "e3-bo"].forEach(id => m.getLayer(id) && m.setLayoutProperty(id, "visibility", sat ? "visible" : "none"));
      m.setLayoutProperty("e3-sat", "visibility", sat ? "visible" : "none"); m.setLayoutProperty("e3-hs", "visibility", sat ? "visible" : "none");
      for (const l of vecLayers) {
        if (l.type === "symbol") {
          const poi = /^poi|one_way|shield/.test(l.id);
          m.setLayoutProperty(l.id, "visibility", sat && poi ? "none" : (saved[l.id].vis || "visible"));
          if (saved[l.id].tc !== undefined) { m.setPaintProperty(l.id, "text-color", sat ? "#f7f4ee" : saved[l.id].tc); m.setPaintProperty(l.id, "text-halo-color", sat ? "rgba(6,12,20,.86)" : saved[l.id].th); m.setPaintProperty(l.id, "text-halo-width", sat ? 1.5 : saved[l.id].tw); m.setPaintProperty(l.id, "text-halo-blur", sat ? 0.6 : saved[l.id].tb); }
        } else if (l.type === "fill-extrusion") {
          m.setPaintProperty(l.id, "fill-extrusion-color", sat ? "#f2dfc0" : dk ? "#1d2833" : "#e3e7ea"); m.setPaintProperty(l.id, "fill-extrusion-opacity", sat ? 0.36 : 0.8); m.setPaintProperty(l.id, "fill-extrusion-vertical-gradient", true);
        } else m.setLayoutProperty(l.id, "visibility", sat ? "none" : (saved[l.id].vis || "visible"));
      }
      m.setPaintProperty("e3-glow", "line-color", sat ? "#9fe0ff" : "#4aa3dc"); m.setPaintProperty("e3-glow", "line-opacity", sat ? 0.32 : 0.22);
      const W = (a, b) => ["interpolate", ["exponential", 1.6], ["zoom"], 12, a, 17, b], k = sat ? 1.45 : 1; /* на рельефе линия рисуется в текстуру — делаем её толще, чтобы читалась на снимке */
      m.setPaintProperty("e3-glow", "line-width", W(14 * k, 28 * k)); m.setPaintProperty("e3-case", "line-width", W(6.5 * k, 14 * k)); m.setPaintProperty("e3-line", "line-width", W(4 * k, 8 * k)); m.setPaintProperty("e3-done", "line-width", W(4.5 * k, 8.5 * k));
      m.setPaintProperty("e3-case", "line-color", sat ? "#0a121b" : dk ? "#081018" : "#ffffff");
      m.setPaintProperty("e3-done", "line-color", sat ? "rgba(255,255,255,.55)" : dk ? "#3a4651" : "#b8c2cb");
      m.setTerrain(sat ? { source: "e3dem", exaggeration: EXAG } : null);
      m.setSky(sat ? SKY_SAT : SKY_MAP);
      const rl = w.querySelector(".e3-relief"); rl.hidden = !sat; rl.textContent = tt("relief", { x: String(EXAG).replace(".", LANG === "en" ? "." : ",") });
      if (!fly) update(true);
    }
    m.on("load", () => {
      const L0 = m.getStyle().layers.find(l => l.type === "symbol")?.id;
      if (!m.getLayer("building-3d")) m.addLayer({ id: "e3-bld", type: "fill-extrusion", source: "openmaptiles", "source-layer": "building", minzoom: 14, paint: { "fill-extrusion-color": dk ? "#1d2833" : "#dfe5ea", "fill-extrusion-height": ["coalesce", ["get", "render_height"], 8], "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0], "fill-extrusion-opacity": .85 } }, L0);
      vecLayers = m.getStyle().layers.filter(l => l.type !== "raster" || l.id === "natural_earth").filter(l => !/^e3-/.test(l.id) || l.id === "e3-bld");
      vecLayers.forEach(l => { saved[l.id] = { vis: m.getLayoutProperty(l.id, "visibility") }; if (l.type === "symbol" && (l.layout || {})["text-field"]) Object.assign(saved[l.id], { tc: m.getPaintProperty(l.id, "text-color") ?? "#333", th: m.getPaintProperty(l.id, "text-halo-color") ?? "rgba(255,255,255,0)", tw: m.getPaintProperty(l.id, "text-halo-width") ?? 0, tb: m.getPaintProperty(l.id, "text-halo-blur") ?? 0 }); });
      const first = m.getStyle().layers[0]?.id;
      m.addSource("e3-sat", { type: "raster", tiles: [ESRI_IMG], tileSize: 256, maxzoom: SAT_MAX, attribution: ESRI_ATTR });
      m.addSource("e3dem", { type: "raster-dem", tiles: [DEM], tileSize: 256, maxzoom: DEM_MAX, encoding: "terrarium", attribution: DEM_ATTR });
      m.addSource("e3dem-hs", { type: "raster-dem", tiles: [DEM], tileSize: 256, maxzoom: DEM_MAX, encoding: "terrarium" });
      m.addLayer({ id: "e3-sat", type: "raster", source: "e3-sat", paint: { "raster-fade-duration": WEAK ? 0 : 250, "raster-resampling": "linear", "raster-saturation": 0.16, "raster-contrast": 0.2, "raster-brightness-min": 0.035, "raster-brightness-max": dk ? 0.84 : 0.97, "raster-hue-rotate": -3 } }, m.getLayer("background") ? m.getStyle().layers[1]?.id : first);
      m.addLayer({ id: "e3-hs", type: "hillshade", source: "e3dem-hs", paint: { "hillshade-exaggeration": WEAK ? 0.22 : 0.34, "hillshade-shadow-color": "rgba(14,24,40,.42)", "hillshade-highlight-color": "rgba(255,236,206,.16)", "hillshade-accent-color": "rgba(20,30,46,.12)", "hillshade-illumination-direction": 315 } }, L0);
      /* премиальная дорожная сеть поверх снимка (только «Спутник», z ≥ 14): тонкие полупрозрачные линии с мягкой тенью; магистрали — тёплый жёлтый */
      const RF = ["all", ["!=", ["get", "brunnel"], "tunnel"], ["match", ["get", "class"], ["motorway", "trunk", "primary", "secondary", "tertiary", "minor"], true, false]];
      const RW = (a, b) => ["interpolate", ["exponential", 1.5], ["zoom"], 14, ["match", ["get", "class"], ["motorway", "trunk", "primary"], a * 1.6, ["secondary", "tertiary"], a * 1.15, a * 0.6], 18, ["match", ["get", "class"], ["motorway", "trunk", "primary"], b * 1.6, ["secondary", "tertiary"], b * 1.15, b * 0.6]];
      m.addLayer({ id: "e3-rd-sh", type: "line", source: "openmaptiles", "source-layer": "transportation", minzoom: 14, filter: RF, layout: { "line-cap": "round", "line-join": "round", visibility: "none" }, paint: { "line-color": "rgba(4,10,18,.5)", "line-width": RW(2.6, 9), "line-blur": RW(1.4, 4), "line-translate": [0, 1] } }, L0);
      m.addLayer({ id: "e3-rd", type: "line", source: "openmaptiles", "source-layer": "transportation", minzoom: 14, filter: RF, layout: { "line-cap": "round", "line-join": "round", visibility: "none" },
        paint: { "line-color": ["match", ["get", "class"], ["motorway", "trunk", "primary"], "#ffd98a", "#ffffff"], "line-width": RW(1, 4), "line-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0.28, 16, 0.5, 18, 0.58] } }, L0);
      /* чёткие контуры домов на снимке (z ≥ 15): тонкая тёплая обводка по футпринтам — дома читаются даже при сжатом снимке */
      m.addLayer({ id: "e3-bo", type: "line", source: "openmaptiles", "source-layer": "building", minzoom: 15, layout: { visibility: "none" }, paint: { "line-color": "rgba(255,236,204,.62)", "line-width": ["interpolate", ["linear"], ["zoom"], 15, 0.4, 18, 1.1] } }, m.getLayer("building-3d") ? "building-3d" : L0);
      m.addSource("e3r", { type: "geojson", lineMetrics: true, data: { type: "Feature", geometry: { type: "LineString", coordinates: G.map(p => [p[1], p[0]]) } } });
      const stops = []; S.forEach(s => { const f = total ? s.km / total : 0; if (!stops.length || f > stops[stops.length - 2] + 0.004) stops.push(Math.min(1, f), ecoCol(s.a ?? 50)); });
      if (stops[0] !== 0) stops.unshift(0, stops[1]); if (stops[stops.length - 2] < 1) stops.push(1, stops[stops.length - 1]);
      const W = (a, b) => ["interpolate", ["exponential", 1.6], ["zoom"], 12, a, 17, b];
      m.addLayer({ id: "e3-glow", type: "line", source: "e3r", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#4aa3dc", "line-width": W(14, 28), "line-opacity": .22, "line-blur": W(6, 12) } });
      m.addLayer({ id: "e3-case", type: "line", source: "e3r", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": dk ? "#081018" : "#ffffff", "line-width": W(6.5, 14) } });
      m.addLayer({ id: "e3-line", type: "line", source: "e3r", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-width": W(4, 8), "line-gradient": ["interpolate", ["linear"], ["line-progress"], ...stops] } });
      m.addSource("e3d", { type: "geojson", data: { type: "Feature", geometry: { type: "LineString", coordinates: [] } } });
      m.addLayer({ id: "e3-done", type: "line", source: "e3d", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-width": W(4.5, 8.5), "line-color": dk ? "#3a4651" : "#b8c2cb" } });
      /* точки A и B */
      m.addSource("e3ab", { type: "geojson", data: { type: "FeatureCollection", features: [G[0], G[G.length - 1]].map((p, k) => ({ type: "Feature", properties: { k }, geometry: { type: "Point", coordinates: [p[1], p[0]] } })) } });
      m.addLayer({ id: "e3-ab", type: "circle", source: "e3ab", paint: { "circle-radius": W(4, 8), "circle-color": ["match", ["get", "k"], 0, "#2f86c4", "#e5534b"], "circle-stroke-width": 2.5, "circle-stroke-color": "#fff", "circle-pitch-alignment": "map" } });
      ready = true; mk.addTo(m); applyMode();
      if (MOB) setTimeout(() => w.querySelectorAll(".maplibregl-compact-show").forEach(x => { x.classList.remove("maplibregl-compact-show"); x.removeAttribute("open"); }), 50); /* на телефоне атрибуция свёрнута в «ⓘ», чтобы не закрывать кнопки */
      if (opts.fly) setTimeout(startFly, 400);
    });
    const hud = { next: w.querySelector(".e3-next span"), dot: w.querySelector(".e3-next i"), rem: w.querySelector(".e3-rem"), km: w.querySelector(".e3-km"), prog: w.querySelector(".e3-prog i") };
    const showToast = s => { const x = w.querySelector(".e3-toast"); x.textContent = s; x.hidden = false; clearTimeout(x._t); x._t = setTimeout(() => x.hidden = true, 3500); };
    /* в «Спутнике» камера ниже наклонена (58°) и ближе (z≈16.8): при сильном наклоне ближний план берёт тайлы низкого зума и «мылится» */
    const followZoom = () => (mode === "car" ? 16.2 : 17) - (sat ? 0.2 : 0), followPitch = () => sat ? 58 : 62;
    function update(jump) {
      const p = at(pos), ahead = Math.min(total, pos + 0.3), a1 = aqiAt(Math.min(total, pos + 0.15)), look = at(Math.min(total, pos + 0.04)), tb = bearing(p.ll, look.ll.every((v, i) => v === p.ll[i]) ? G[Math.min(G.length - 1, p.i)] : look.ll);
      mk.setLngLat([p.ll[1], p.ll[0]]);
      const tn = performance.now(), dts = update.lt ? Math.min(0.1, (tn - update.lt) / 1000) : 0.016; update.lt = tn; /* сглаживание курса не зависит от FPS (≈0.12 за кадр при 60 fps) */
      if (!fly) { tw++; br = (br + angD(br, tb) * (jump || RM ? 1 : 1 - Math.exp(-dts * 7.7)) + 360) % 360;
        m.jumpTo({ center: [p.ll[1], p.ll[0]], bearing: br, pitch: followPitch(), zoom: followZoom(), padding: { top: mapEl.clientHeight * 0.38, bottom: 0, left: 0, right: 0 } }); }
      const now = performance.now(); if (m.getSource("e3d") && (jump || now - (update.t || 0) > 250)) { update.t = now; m.getSource("e3d").setData({ type: "Feature", geometry: { type: "LineString", coordinates: [...G.slice(0, p.i).map(q => [q[1], q[0]]), [p.ll[1], p.ll[0]]] } }); }
      const remKm = Math.max(0, total - pos), remS = total ? route.dur * remKm / total : 0, Lv = level(a1);
      hud.dot.style.background = ecoCol(a1 ?? 50); hud.next.textContent = `${tt("ahead", { d: ecoFmtD(Math.max(0.05, ahead - pos)) })}: AQI ${a1 ?? "—"} · ${tr(Lv.name)}`;
      hud.rem.textContent = ecoFmtT(remS); hud.km.textContent = `${ecoFmtD(remKm)} ${tt("left")}`; hud.prog.style.width = (pos / total * 100).toFixed(1) + "%";
    }
    /* --- облёт: обзор всего маршрута → полёт вдоль линии (камера выше и впереди аватара) → финальный обзор → назад к аватару.
     * Камера анимируется своим твином через jumpTo, а не easeTo: прерванный easeTo в MapLibre 5 с рельефом оставляет «замороженную» высоту центра (камера уходит под землю). */
    const flyBtn = w.querySelector(".e3-fly"), cine = w.querySelector(".e3-cine");
    const bounds = () => { const b = new maplibregl.LngLatBounds(); G.forEach(p => b.extend([p[1], p[0]])); return b; };
    const overallBr = bearing(G[0], G[G.length - 1]);
    let tw = 0;
    const tween = (to, dur) => new Promise(done => { const id = ++tw, f = { c: m.getCenter(), z: m.getZoom(), p: m.getPitch(), b: m.getBearing(), pt: m.getPadding().top || 0 }, T0 = performance.now();
      const fr = ts => { if (id !== tw || !w.isConnected) return done(false); const k = dur ? Math.max(0, Math.min(1, (ts - T0) / dur)) : 1, e = ease(k);
        m.jumpTo({ center: [f.c.lng + (to.center[0] - f.c.lng) * e, f.c.lat + (to.center[1] - f.c.lat) * e], zoom: f.z + (to.zoom - f.z) * e, pitch: f.p + (to.pitch - f.p) * e, bearing: f.b + angD(f.b, to.bearing) * e, padding: { top: f.pt + ((to.pt || 0) - f.pt) * e, bottom: 0, left: 0, right: 0 } });
        k < 1 ? requestAnimationFrame(fr) : done(true); }; requestAnimationFrame(fr); });
    const wait = ms => new Promise(r => setTimeout(r, ms));
    function overview(dur) { const c = m.cameraForBounds(bounds(), { padding: { top: 150, bottom: 120, left: 40, right: 40 }, bearing: overallBr }); if (!c) return Promise.resolve(true);
      const o = { center: maplibregl.LngLat.convert(c.center).toArray(), zoom: Math.max(WEAK ? 12.5 : 12, Math.min(16, c.zoom + 0.45)), bearing: overallBr, pitch: sat ? 62 : 52 };
      if (dur) return tween(o, dur); tw++; m.jumpTo({ ...o, padding: { top: 0, bottom: 0, left: 0, right: 0 } }); return Promise.resolve(true); }
    const flyP = () => ({ D: Math.max(11, Math.min(26, total * 5)) * 1000, look: Math.max(0.12, Math.min(0.6, total * 0.08)), z: Math.max(15, Math.min(16.4, 16.6 - Math.log2(Math.max(1, total)) * 0.5)) });
    /* кадр облёта по доле пути k∈[0..1] без сглаживания по времени — для пошаговой записи видео/скриншотов (window.__e3.flyAt) */
    const flyAt = k => { const { look, z } = flyP(), s = total * k * 0.98, c = at(s), b = bearing(at(Math.max(0, s - look * 0.5)).ll, at(Math.min(total, s + look)).ll); tw++;
      m.jumpTo({ center: [c.ll[1], c.ll[0]], bearing: b, zoom: z, pitch: sat ? 62 : 64, padding: { top: 0, bottom: 0, left: 0, right: 0 } }); };
    function stopFly(back) { if (!fly) return; cancelAnimationFrame(fly.raf); fly = null; tw++; w.classList.remove("flying"); cine.hidden = true; flyBtn.classList.remove("on"); flyBtn.querySelector("span").textContent = tt("fly"); flyBtn.setAttribute("aria-label", tt("fly"));
      if (back !== false) { const p = at(pos); br = bearing(p.ll, at(Math.min(total, pos + 0.04)).ll);
        RM ? update(true) : tween({ center: [p.ll[1], p.ll[0]], bearing: br, pitch: followPitch(), zoom: followZoom(), pt: mapEl.clientHeight * 0.38 }, 1600); } }
    async function startFly() {
      if (!ready) return; if (fly) return stopFly(); playing = false; setBtn();
      const me = fly = {}; w.classList.add("flying"); flyBtn.classList.add("on"); flyBtn.querySelector("span").textContent = tt("flyStop"); flyBtn.setAttribute("aria-label", tt("flyStop")); cine.textContent = tt("flyHint"); cine.hidden = false;
      if (RM) { overview(0); return; } /* reduced motion: статичный наклонный обзор вместо полёта */
      const { D, look, z } = flyP();
      if (!await overview(2200) || fly !== me) return; await wait(300); if (fly !== me) return;
      let b = bearing(at(0).ll, at(look).ll), lt = 0; const p0 = at(0);
      if (!await tween({ center: [p0.ll[1], p0.ll[0]], zoom: z, pitch: sat ? 62 : 64, bearing: b }, 1800) || fly !== me) return;
      const T0 = performance.now();
      await new Promise(res => { const step = ts => { if (fly !== me || !w.isConnected) return res(); const k = Math.max(0, Math.min(1, (ts - T0) / D)), s = total * 0.98 * (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
          const c = at(s), tb = bearing(c.ll, at(Math.min(total, s + look)).ll), dt = lt ? Math.min(0.1, (ts - lt) / 1000) : 0.016; lt = ts;
          b = (b + angD(b, tb) * Math.min(1, dt * 1.6) + 360) % 360; tw++;
          m.jumpTo({ center: [c.ll[1], c.ll[0]], bearing: b, zoom: z, pitch: sat ? 62 : 64, padding: { top: 0, bottom: 0, left: 0, right: 0 } });
          if (k < 1) me.raf = requestAnimationFrame(step); else res(); }; me.raf = requestAnimationFrame(step); });
      if (fly !== me) return; if (!await overview(2600) || fly !== me) return; await wait(900); if (fly === me) stopFly();
    }
    flyBtn.onclick = () => fly ? stopFly() : startFly();
    ["dragstart", "wheel", "touchstart"].forEach(ev => m.on(ev, e => { if (fly && e.originalEvent) stopFly(false); }));
    w.querySelectorAll("[data-v]").forEach(b => b.onclick = () => { const v = b.dataset.v === "sat"; if (v === sat) return; sat = v; try { localStorage.setItem(SAT_KEY, sat ? "1" : "0"); } catch (e) {} applyMode(); });
    const loop = ts => { if (!w.isConnected) return; if (playing && !gpsW && !fly) { const dt = last ? Math.min(0.1, (ts - last) / 1000) : 0; pos = Math.min(total, pos + spd0 / 3600 * dt * speed * 10); if (pos >= total) { playing = false; setBtn(); showToast(tt("done")); } update(); } last = ts; raf = requestAnimationFrame(loop); };
    const pb = w.querySelector(".e3-play"), setBtn = () => { pb.innerHTML = playing ? `❚❚ ${esc(tt("pause"))}` : `▶ ${esc(tt("play"))}`; pb.classList.toggle("on", playing); w.querySelectorAll("[data-s]").forEach(b => b.classList.toggle("on", +b.dataset.s === speed)); };
    pb.onclick = () => { if (fly) stopFly(); if (pos >= total) pos = 0; playing = !playing; last = 0; setBtn(); };
    w.querySelectorAll("[data-s]").forEach(b => b.onclick = () => { speed = +b.dataset.s; setBtn(); });
    w.querySelector(".e3-gps").onclick = e => { const b = e.currentTarget;
      if (gpsW != null) { navigator.geolocation.clearWatch(gpsW); gpsW = null; b.classList.remove("on"); return; }
      if (!navigator.geolocation) return showToast(tt("gpsErr")); if (fly) stopFly(); playing = false; setBtn(); b.classList.add("on"); showToast(tt("gpsOn"));
      gpsW = navigator.geolocation.watchPosition(p => { const me = [p.coords.latitude, p.coords.longitude]; let bi = 0, bd = 1e9;
        for (let i = 0; i < G.length; i++) { const d = ecoKm(me, G[i]); if (d < bd) { bd = d; bi = i; } } pos = cum[bi]; update(); if (bd > 0.05) showToast(tt("off", { m: Math.round(bd * 1000) })); },
        () => { showToast(tt("gpsErr")); b.classList.remove("on"); gpsW = null; }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }); };
    const close = () => { if (fly) stopFly(false); cancelAnimationFrame(raf); if (gpsW != null) navigator.geolocation.clearWatch(gpsW); m.remove(); w.remove(); document.documentElement.classList.remove("e3-open"); document.removeEventListener("keydown", esc_); };
    const esc_ = e => { if (e.key === "Escape") { if (fly) stopFly(); else close(); } }; document.addEventListener("keydown", esc_);
    w.querySelector(".e3-x").onclick = close; setBtn(); raf = requestAnimationFrame(loop);
    window.__e3 = { setPos: k => { pos = Math.min(total, k); update(true); }, play: () => { playing = true; setBtn(); }, map: m, close, fly: startFly, flyAt, overview, stopFly, setSat: v => { sat = !!v; applyMode(); }, get flying() { return !!fly; } };
  };
})();
