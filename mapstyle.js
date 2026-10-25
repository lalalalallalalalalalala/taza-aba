/* Стиль карты смога «Дымка» (v37, по умолчанию): мягкая поверхность AQI поверх спокойной серой подложки.
 * ?mapstyle=off — вернуть прежние круги с цифрами (сохраняется), ?mapstyle=a — снова «Дымка». */
window.MS_STYLE = (() => { try { const q = (new URL(location.href).searchParams.get("mapstyle") || "").toLowerCase();
  if (q === "off" || q === "a") localStorage.setItem("tazaAba.mapstyle", q);
  return localStorage.getItem("tazaAba.mapstyle") === "off" ? null : "a"; } catch (e) { return "a"; } })();
const MS_BIN = ["#3DBE8B", "#EDB443", "#F59245", "#E5534B", "#9A5BD0", "#7A2340"];
const msBinI = a => a <= 50 ? 0 : a <= 100 ? 1 : a <= 150 ? 2 : a <= 200 ? 3 : a <= 300 ? 4 : 5;
const msBin = a => a == null ? "#9aa5ad" : MS_BIN[msBinI(a)];
const msBinRGB = a => { const h = msBin(a); return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); };
const msDark = () => document.documentElement.dataset.theme === "dark";
const MS_T = {
  ru: { note: "Оценка: AQI сглажен между районами (модель CAMS + датчики)", lo: "Чище всего", hi: "Грязнее всего", all: "Везде", find: "Найти свой район, микрорайон, жилмассив…", none: "Ничего не найдено", area: "граница примерная" },
  ky: { note: "Баалоо: AQI райондордун ортосунда жылмаланган (CAMS модели + датчиктер)", lo: "Эң таза", hi: "Эң булганыч", all: "Бардык жерде", find: "Районуңузду, кичи районду, конушту табыңыз…", none: "Эч нерсе табылган жок", area: "чеги болжолдуу" },
  en: { note: "Estimate: AQI smoothed between districts (CAMS model + sensors)", lo: "Cleanest", hi: "Most polluted", all: "Everywhere", find: "Find your district or neighbourhood…", none: "Nothing found", area: "approximate boundary" },
  tr: { note: "Tahmin: AQI mahalleler arasında yumuşatıldı (CAMS modeli + sensörler)", lo: "En temiz", hi: "En kirli", all: "Her yerde", find: "Mahallenizi bulun…", none: "Sonuç yok", area: "sınır yaklaşık" } };
const MST = k => (MS_T[LANG] || MS_T.ru)[k];
function msBaseTile() { const k = msDark() ? "Dark" : "Light";
  return L.tileLayer(`https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${k}_Gray_Base/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 18, maxNativeZoom: 16, keepBuffer: 2, className: "tl-ms", attribution: "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors" }); }
function msRefTile() { const k = msDark() ? "Dark" : "Light";
  return L.tileLayer(`https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${k}_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 18, maxNativeZoom: 16, pane: "msRef", className: "tl-ms" }); }
const msPts = () => DISTRICTS.map(d => ({ d, a: air.byDistrict[d.id] && air.byDistrict[d.id].aqi })).filter(p => p.a != null);

/* canvas-слой: перерисовка после движения/зума, анимация зума как у ImageOverlay */
const MsCanvas = L.Layer.extend({
  initialize(draw) { this._draw = draw; },
  onAdd(m) { this._c = L.DomUtil.create("canvas", "ms-cv leaflet-zoom-animated"); this._c.style.pointerEvents = "none"; m.getPane("overlayPane").appendChild(this._c);
    m.on("moveend zoomend resize", this._redraw, this); m.on("zoomanim", this._anim, this); m.on("zoom viewreset", this._reset, this); this._redraw(); },
  onRemove(m) { this._c.remove(); m.off("moveend zoomend resize", this._redraw, this); m.off("zoomanim", this._anim, this); m.off("zoom viewreset", this._reset, this); },
  /* v58: щипок (pinch) на телефоне шлёт «zoom» без zoomanim — растягиваем холст по его географическим границам, как ImageOverlay,
   * иначе «Дымка» оставалась на месте экрана и отрывалась от карты */
  _reset() { const m = this._map; if (!m || !this._b) return; const tl = m.latLngToLayerPoint(this._b.getNorthWest()), br = m.latLngToLayerPoint(this._b.getSouthEast()), c = this._c;
    c.style.transform = ""; L.DomUtil.setPosition(c, tl); c.style.width = (br.x - tl.x) + "px"; c.style.height = (br.y - tl.y) + "px"; },
  _anim(e) { if (!this._b) return; const s = this._map.getZoomScale(e.zoom), o = this._map._latLngBoundsToNewLayerBounds(this._b, e.zoom, e.center).min; L.DomUtil.setTransform(this._c, o, s); },
  _redraw() { const m = this._map; if (!m) return; const sz = m.getSize(), pad = sz.multiplyBy(0.35), tl = m.containerPointToLayerPoint([0, 0]).subtract(pad), w = sz.x + 2 * pad.x, h = sz.y + 2 * pad.y;
    this._b = L.latLngBounds(m.layerPointToLatLng(tl), m.layerPointToLatLng(tl.add([w, h])));
    const c = this._c; c.width = w; c.height = h; c.style.width = w + "px"; c.style.height = h + "px"; L.DomUtil.setPosition(c, tl);
    this._draw(c.getContext("2d"), tl, m, w, h); } });
function msIdw(lat, lon, pts) { let s = 0, w = 0, dmin = 1e9; const k = Math.cos(lat * Math.PI / 180) * 111;
  for (const p of pts) { const dx = (p.d.lon - lon) * k, dy = (p.d.lat - lat) * 111, d2 = dx * dx + dy * dy + 0.04; if (d2 < dmin) dmin = d2; const ww = 1 / (d2 * d2); s += ww * p.a; w += ww; }
  return { v: s / w, dmin: Math.sqrt(dmin) }; }
function msNearest(ll) { let b = null; for (const p of msPts()) { const k = kmDist(p.d, { lat: ll.lat, lon: ll.lng }); if (!b || k < b.k) b = { ...p, k }; } return b; }

/* примерная «зона» района: ячейка Вороного среди соседних районов, обрезанная кругом ~1.6 км (границ районов в данных нет — подписано «граница примерная») */
function msCell(d) { const k = Math.cos(d.lat * Math.PI / 180) * 111, R = 1.6, N = 36; let poly = [];
  for (let i = 0; i < N; i++) { const a = 2 * Math.PI * i / N; poly.push([R * Math.cos(a), R * Math.sin(a)]); }
  const others = DISTRICTS.filter(x => x !== d).map(x => [(x.lon - d.lon) * k, (x.lat - d.lat) * 111]).filter(([x, y]) => x * x + y * y < 4 * R * R);
  for (const [ox, oy] of others) { const mx = ox / 2, my = oy / 2, f = ([x, y]) => (x - mx) * ox + (y - my) * oy, out = [];
    for (let i = 0; i < poly.length; i++) { const A = poly[i], B = poly[(i + 1) % poly.length], fa = f(A), fb = f(B);
      if (fa <= 0) out.push(A); if ((fa <= 0) !== (fb <= 0)) { const t = fa / (fa - fb); out.push([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t]); } }
    poly = out; if (poly.length < 3) break; }
  return poly.map(([x, y]) => [d.lat + y / 111, d.lon + x / k]); }
const msNorm = s => String(s || "").toLowerCase().replace(/ё/g, "е").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/[«»"“”()\-–.,]/g, " ").replace(/\s+/g, " ").trim();
function msSearchUI(M, focus) {
  const cont = M.getContainer(), box = document.createElement("div"); box.className = "ms-find";
  box.innerHTML = `<input type="search" autocomplete="off" spellcheck="false" aria-label="${esc(MST("find"))}" placeholder="${esc(MST("find"))}" role="combobox" aria-expanded="false" aria-controls="msFindL"><ul id="msFindL" role="listbox" hidden></ul>`;
  cont.insertAdjacentElement("beforebegin", box);
  const inp = box.querySelector("input"), ul = box.querySelector("ul"); let res = [], cur = -1;
  const show = () => { const q = msNorm(inp.value); if (!q) { ul.hidden = true; inp.setAttribute("aria-expanded", "false"); return; }
    res = DISTRICTS.map(d => { const ns = Object.values(d.name || {}).map(msNorm), best = Math.min(...ns.map(n => n.startsWith(q) ? 0 : n.split(" ").some(w => w.startsWith(q)) ? 1 : n.includes(q) ? 2 : 9)); return { d, best }; })
      .filter(x => x.best < 9).sort((a, b) => a.best - b.best || dName(a.d).localeCompare(dName(b.d))).slice(0, 8).map(x => x.d); cur = -1;
    ul.innerHTML = res.length ? res.map((d, i) => { const a = air.byDistrict[d.id] && air.byDistrict[d.id].aqi, g = d.grp && typeof GRP_NAME !== "undefined" && GRP_NAME[d.grp] ? tr(GRP_NAME[d.grp]) : "";
      return `<li role="option" data-i="${i}"><i style="background:${msBin(a)}"></i><span>${esc(dName(d))}${g ? `<small>${esc(g)}</small>` : ""}</span><b>${a == null ? "—" : a}</b></li>`; }).join("") : `<li class="none">${esc(MST("none"))}</li>`;
    ul.hidden = false; inp.setAttribute("aria-expanded", "true"); };
  const pick = i => { const d = res[i]; if (!d) return; inp.value = dName(d); ul.hidden = true; inp.blur(); focus(d); };
  inp.addEventListener("input", show); inp.addEventListener("focus", show);
  inp.addEventListener("keydown", e => { const li = ul.querySelectorAll("li[data-i]");
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (!li.length) return; cur = (cur + (e.key === "ArrowDown" ? 1 : -1) + li.length) % li.length; li.forEach((x, j) => x.classList.toggle("on", j === cur)); }
    else if (e.key === "Enter") { e.preventDefault(); pick(cur >= 0 ? cur : 0); } else if (e.key === "Escape") { ul.hidden = true; } });
  ul.addEventListener("mousedown", e => { const li = e.target.closest("li[data-i]"); if (li) { e.preventDefault(); pick(+li.dataset.i); } });
  document.addEventListener("click", e => { if (!box.contains(e.target)) ul.hidden = true; });
}

function msSmog(M, G, popD) {
  const cont = M.getContainer(); cont.classList.add("ms-on", "ms-a");
  if (!M.getPane("msRef")) { const pn = M.createPane("msRef"); pn.style.zIndex = 450; pn.style.pointerEvents = "none"; }
  let ref = null; const syncRef = mode => { if (ref) M.removeLayer(ref); ref = mode === "osm" ? (window.iosRefLayer ? iosRefLayer(M, msRefTile) : msRefTile()).addTo(M) : null; }; syncRef(baseMode()); M.on("basemode", e => syncRef(e.mode));
  if (M.getSize().x < 600) cont.insertAdjacentHTML("afterend", `<div class="ms-note ms-note-out">${esc(MST("note"))} · ▼ ${esc(MST("lo").toLowerCase())} · ▲ ${esc(MST("hi").toLowerCase())}</div>`);
  else { const note = L.control({ position: "bottomleft" }); note.onAdd = () => { const d = L.DomUtil.create("div", "ms-note"); d.textContent = MST("note"); return d; }; note.addTo(M); }
  /* легенда под картой — та же палитра */
  const lg = cont.closest(".map-col") && cont.closest(".map-col").querySelector(".legend");
  if (lg) lg.querySelectorAll("span").forEach((s, i) => { s.style.background = MS_BIN[i]; s.style.color = i === 1 ? "#3b2a00" : "#fff"; });
  const selG = L.layerGroup().addTo(M); let selId = null;
  const select = (d, fly) => { selG.clearLayers(); selId = d.id; const dk = msDark();
    L.polygon(msCell(d), { color: dk ? "#cfe6f5" : "#1d3b53", weight: 1.5, opacity: .75, dashArray: "4 4", fill: true, fillColor: dk ? "#cfe6f5" : "#1d3b53", fillOpacity: .06, interactive: false }).addTo(selG);
    const open = () => { if (M !== map) return; L.popup({ className: "ms-pop", autoPanPadding: [20, 20] }).setLatLng([d.lat, d.lon]).setContent(popD(d) + `<br><small class="ms-pop-n">${esc(MST("note"))}; ${esc(MST("area"))}</small>`).openOn(M); names(); };
    if (fly) { M.flyTo([d.lat, d.lon], Math.max(14, M.getZoom()), { duration: (typeof LOWEND !== "undefined" && LOWEND) ? 0 : 0.7 }); M.once("moveend", open); } else open(); };
  window.msFocus = d => select(d, true);
  M.on("click", e => { if (!G._map) return; const n = msNearest(e.latlng); if (n && n.k < 4) select(n.d, false); });
  msSearchUI(M, d => select(d, true));
  /* бледные названия районов при приближении (без наложений, выбранный — первым) */
  const nameG = L.layerGroup().addTo(G);
  const names = () => { nameG.clearLayers(); if (M !== map || M.getZoom() < 13) return; const b = M.getBounds().pad(0.1), boxes = [], hit = (a, c) => a.x < c.x + c.w && c.x < a.x + a.w && a.y < c.y + c.h && c.y < a.y + a.h;
    const lbl = [...M.getContainer().querySelectorAll(".ms-lbl")].map(e => { const r = e.getBoundingClientRect(), o = M.getContainer().getBoundingClientRect(); return { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height }; });
    DISTRICTS.filter(d => b.contains([d.lat, d.lon])).sort((x, y) => (y.id === selId) - (x.id === selId)).forEach(d => { const p = M.latLngToContainerPoint([d.lat, d.lon]), t = dName(d), w = Math.min(160, t.length * 6.2 + 8), bx = { x: p.x - w / 2, y: p.y + 4, w, h: 15 };
      if (boxes.some(x => hit(x, bx)) || lbl.some(x => hit(x, bx))) return; boxes.push(bx);
      L.marker([d.lat, d.lon], { interactive: false, keyboard: false, icon: L.divIcon({ className: "ms-nm-w", html: `<div class="ms-nm${d.id === selId ? " sel" : ""}">${esc(t)}</div>`, iconSize: [0, 0] }) }).addTo(nameG); }); };
  let nt = 0; M.on("zoomend moveend", () => { clearTimeout(nt); nt = setTimeout(names, 90); });
  const S = (typeof LOWEND !== "undefined" && LOWEND) ? 9 : 6;
  const cv = new MsCanvas((ctx, tl, m, w, h) => { const pts = msPts(); if (!pts.length) return; const gw = Math.ceil(w / S), gh = Math.ceil(h / S), dk = msDark();
    const off = document.createElement("canvas"); off.width = gw; off.height = gh; const oc = off.getContext("2d"), img = oc.createImageData(gw, gh), A = dk ? 195 : 150;
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) { const ll = m.layerPointToLatLng(tl.add([i * S, j * S])), r = msIdw(ll.lat, ll.lng, pts), c = msBinRGB(r.v);
      const al = Math.max(0, Math.min(1, 1 - (r.dmin - 1.2) / 2.5)), k = (j * gw + i) * 4; img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = Math.round(al * A); }
    oc.putImageData(img, 0, 0); ctx.imageSmoothingEnabled = true; ctx.filter = `blur(${Math.round(S * 1.6)}px)`; ctx.drawImage(off, 0, 0, gw * S, gh * S); });
  cv.addTo(G);
  const lblG = L.layerGroup().addTo(G);
  const pill = (p, cls, txt) => { L.circleMarker([p.d.lat, p.d.lon], { radius: 4.5, weight: 2, color: msDark() ? "#0d1620" : "#fff", fillColor: msBin(p.a), fillOpacity: 1 }).bindPopup(() => popD(p.d)).addTo(lblG);
    L.marker([p.d.lat, p.d.lon], { keyboard: false, icon: L.divIcon({ className: "ms-lbl-w", html: `<div class="ms-lbl ${cls}"><i style="background:${msBin(p.a)}"></i><span>${txt}</span> <b>${p.a}</b></div>`, iconSize: [0, 0] }) }).bindPopup(() => popD(p.d)).addTo(lblG); };
  const upd = () => { cv._redraw(); lblG.clearLayers(); const pts = msPts(); if (!pts.length) return; const s = [...pts].sort((x, y) => x.a - y.a), lo = s[0], hi = s[s.length - 1];
    if (hi.a - lo.a < 10) { pill({ d: { lat: cityObj().center[0], lon: cityObj().center[1] }, a: Math.round(median(pts.map(p => p.a))) }, "all", esc(MST("all")) + " ≈"); return; }
    pill(lo, "lo", `<em>${esc(MST("lo"))} · </em>${esc(dName(lo.d))}`); pill(hi, "hi", `<em>${esc(MST("hi"))} · </em>${esc(dName(hi.d))}`); };
  upd(); setTimeout(names, 200);
  return () => { upd(); names(); };
}
const msHomeIcon = () => L.divIcon({ className: "", html: `<div class="ms-home"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11l8-6 8 6v8h-5v-5h-6v5H4z"/></svg></div>`, iconSize: [18, 18], iconAnchor: [9, 9] });
