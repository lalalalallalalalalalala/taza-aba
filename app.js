/* Таза Аба — прототип для хакатона SolarPunk (Бишкек).
 * Без сборки: чистый JS + Leaflet. Данные о воздухе — Open-Meteo Air Quality API (без ключа).
 * Тексты интерфейса — в i18n.js (ru / ky / en), данные — в data.js.
 */
"use strict";

const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const numLocale = () => (LANG === "en" ? "en-US" : "ru-RU");
const fmt = (n, d = 0) => { let v = Number(n); if (isFinite(v) && Math.abs(v) < 0.5 * 10 ** -d) v = 0; return v.toLocaleString(numLocale(), { maximumFractionDigits: d, minimumFractionDigits: d }); };   // v50: без «-0°»
const som = n => fmt(Math.round(n)) + " " + t("som");
const years = n => t("yearsN", { n: fmt(n, 1) });
/* ISO-дата «2026-10-20» → по локали интерфейса; всё остальное (демо-тексты) — как есть */
const fmtDay = d => { if (!/^\d{4}-\d{2}-\d{2}$/.test(d || "")) return d || ""; const x = new Date(d + "T12:00:00"); return isNaN(x) ? d : x.toLocaleDateString(numLocale(), { day: "numeric", month: "short", year: "numeric" }); };
const byId = id => DISTRICTS.find(d => d.id === id) || DISTRICTS[0];
const dName = d => tr(d.name);
const dLoc = d => tr(d.loc);
/* AQI: null/NaN — «нет данных», а не 0/«Хорошо» (Math.round(null) === 0, а null <= 50 — true) */
const aqiOf = v => (v == null || !Number.isFinite(+v)) ? null : Math.round(+v);
const aqiTxt = v => (v == null ? "—" : v);
const byAqiDesc = (x, y) => (y == null ? -1 : y) - (x == null ? -1 : x);
const NO_LEVEL = { max: Infinity, nodata: true, color: "#8f99a3", grad: "linear-gradient(135deg,#a3adb7,#7d8893 60%,#98a2ac)", emoji: "📡",
  name: { ru: "Нет данных", ky: "Маалымат жок", en: "No data" }, short: { ru: "Нет данных", ky: "Маалымат жок", en: "No data" },
  title: { ru: "Нет данных о воздухе", ky: "Аба тууралуу маалымат жок", en: "No air data right now" },
  text: { ru: "Модель не вернула значение для этой точки. Это не значит, что воздух чистый — обновите позже.", ky: "Модель бул чекит үчүн маани берген жок. Бул аба таза дегенди билдирбейт — кийинчерээк жаңылаңыз.", en: "The model returned no value for this point. That does not mean the air is clean — try again later." },
  tips: { ru: [], ky: [], en: [] } };
const level = aqi => (aqi == null || !Number.isFinite(+aqi)) ? NO_LEVEL : AQI_LEVELS.find(l => aqi <= l.max);

/* ---------------- Город (Бишкек / Нарын) ---------------- */
const CITY_STORE = "tazaAba.city";
let CITY = CITIES[localStorage.getItem(CITY_STORE)] ? localStorage.getItem(CITY_STORE) : "bishkek";
let DISTRICTS, ECO_ROUTES;
const cityObj = () => CITIES[CITY];
/* Подставляется в каждый t(): {city}, {cityGen} (род. падеж), {cityPrep} (предл. падеж / местный). */
function CITY_VARS() { const c = CITIES[CITY]; let pvY = "1 350"; try { pvY = fmt(K.pvYield); } catch (e) { } return { city: tr(c.name), cityGen: tr(c.gen), cityPrep: tr(c.prep), pvY }; }
const inCity = x => (x.city || "bishkek") === CITY;

/* ---------------- Состояние (localStorage) ---------------- */
const STORE_KEY = "tazaAba.v1";
const defaultState = {
  district: "akorgo",
  name: "",                     // имя задаёт пользователь (без демо-профиля)
  house: { area: 100, coal: 5, price: 7000, group: false },
  plan: "insul",
  switched: false,
  joined: {}, customGroups: [],
  alerts: { on: false, district: "akordo", threshold: 150, sent: {} },
  complaints: [],                 // жалобы пользователя
};
let state = load();
function load() {
  try {
    const s = Object.assign(structuredClone(defaultState), JSON.parse(localStorage.getItem(STORE_KEY) || "{}"));
    s.alerts = Object.assign(structuredClone(defaultState.alerts), s.alerts || {});
    if (s.name === "Айбек") { s.name = ""; s.switched = false; }   // миграция со старого демо-профиля
    (s.complaints || []).forEach(c => { if (c.mine && !c.via && !c.sentAt) c.status = 0; });   // «передано» раньше было имитацией
    return s;
  } catch { return structuredClone(defaultState); }
}
/* save() → true/false. При переполнении (QuotaExceededError) — понятный тост, а не тихая потеря данных */
let saveWarnAt = 0;
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); return true; }
  catch (e) {
    console.warn("localStorage:", e && e.name, e && e.message);
    if (Date.now() - saveWarnAt > 30e3 && typeof toast === "function" && typeof Q === "function") { saveWarnAt = Date.now(); setTimeout(() => toast(Q("lsFull")), 0); }
    return false;
  }
}

/* Фото жалоб — в IndexedDB (tazaAba-media/ph), в state только photoId; localStorage больше не забивается base64.
 * Если IndexedDB недоступна — фото остаётся в state, как раньше. */
let phDbP = null;
const phDb = () => phDbP || (phDbP = new Promise((res, rej) => {
  if (typeof indexedDB === "undefined" || !indexedDB) return rej(new Error("no indexedDB"));
  const r = indexedDB.open("tazaAba-media", 1); r.onupgradeneeded = () => r.result.createObjectStore("ph"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
}));
const phTx = (mode, fn) => phDb().then(db => new Promise((res, rej) => { const tx = db.transaction("ph", mode), q = fn(tx.objectStore("ph")); tx.oncomplete = () => res(q && q.result); tx.onerror = tx.onabort = () => rej(tx.error); }));
const PH_MEM = {};
async function phPut(data) { const id = "ph" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); await phTx("readwrite", st => st.put(data, id)); PH_MEM[id] = data; return id; }
const phGet = id => PH_MEM[id] ? Promise.resolve(PH_MEM[id]) : phTx("readonly", st => st.get(id)).then(v => { if (v) PH_MEM[id] = v; return v; });
const phDel = id => { if (!id) return; delete PH_MEM[id]; phTx("readwrite", st => st.delete(id)).catch(() => { }); };
const hasPhoto = c => !!(c && (c.photo || c.photoId));
const phImg = (c, attrs = "") => c.photo ? `<img src="${c.photo}" ${attrs}>` : c.photoId ? `<img data-ph="${esc(c.photoId)}" ${attrs}>` : "";
const phFill = im => { if (im.getAttribute("src")) return; phGet(im.dataset.ph).then(v => { if (v) im.src = v; else im.remove(); }).catch(() => im.remove()); };
new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) { if (n.nodeType !== 1) continue; if (n.matches("img[data-ph]")) phFill(n); else n.querySelectorAll("img[data-ph]").forEach(phFill); } })
  .observe(document.documentElement, { childList: true, subtree: true });
async function phMigrate() {   // старые жалобы: base64 из localStorage → IndexedDB
  const list = (state.complaints || []).filter(c => typeof c.photo === "string" && c.photo.startsWith("data:"));
  if (!list.length) return;
  try { for (const c of list) { c.photoId = await phPut(c.photo); delete c.photo; } save(); } catch (e) { console.warn("photos → IndexedDB:", e && e.message); }
}
setTimeout(() => phMigrate().catch(() => { }), 1500);

/* ---------------- Данные о воздухе ---------------- */
const air = { status: "loading", live: false, updated: null, byDistrict: {}, weather: null };

async function fetchJSON(url, ms = 9000) {
  const ctl = new AbortController();
  const tm = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally { clearTimeout(tm); }
}

/* Один запрос на все районы (списки координат через запятую). Значение — модель CAMS в точке района, БЕЗ поправок
 * (`factor` из data.js используется только в демо-данных). Сетка CAMS ~0,1° (~10 км): районы в одной ячейке получают одинаковый AQI. */
/* одна загрузка «в полёте» на город: повторные вызовы (online, таймер, кнопка) ждут тот же промис */
let airInflight = null, airRetryT = null, airRetryN = 0;
function loadAir() {
  if (airInflight && airInflight.city === CITY) return airInflight.p;
  const city = CITY, p = loadAirImpl().catch(e => console.warn("loadAir:", e.message)).finally(() => { if (airInflight && airInflight.p === p) airInflight = null; });
  airInflight = { city, p }; return p;
}
function scheduleAirRetry() {
  clearTimeout(airRetryT);
  const s = [30, 60, 120, 300][Math.min(airRetryN, 3)]; airRetryN++;
  air.retryAt = Date.now() + s * 1000; air.retryS = s;
  airRetryT = setTimeout(() => { if (air.status !== "ok") loadAir(); }, s * 1000);
}
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout " + ms + " ms")), ms))]);
/* Open-Meteo принимает много координат в одном запросе; режем на пачки (длина URL, размер ответа) и шлём параллельно */
const AQ_Q = `&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide,us_aqi_pm2_5,us_aqi_pm10,us_aqi_nitrogen_dioxide,us_aqi_sulphur_dioxide,us_aqi_ozone,us_aqi_carbon_monoxide&hourly=us_aqi,pm2_5&timezone=auto&forecast_days=4`;
async function fetchAirPts(pts, chunk = 60) {
  const parts = []; for (let i = 0; i < pts.length; i += chunk) parts.push(pts.slice(i, i + chunk));
  const res = await Promise.all(parts.map(pp => fetchJSON(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${pp.map(p => p[0]).join(",")}&longitude=${pp.map(p => p[1]).join(",")}` + AQ_Q, 15000)));
  return res.flatMap(r => Array.isArray(r) ? r : [r]);
}
function mkAirRec(r) {
  /* текущее значение; если модель его не отдала — тот же час из почасового ряда (это то же модельное значение), иначе null = «нет данных» */
  const hi = r.hourly && r.hourly.time ? r.hourly.time.indexOf((r.current.time || "").slice(0, 13) + ":00") : -1;
  const a0 = aqiOf(r.current.us_aqi) ?? (hi >= 0 ? aqiOf(r.hourly.us_aqi[hi]) : null);
  return {
    aqi: a0, pm25: r.current.pm2_5, pm10: r.current.pm10, no2: r.current.nitrogen_dioxide,
    pol: { pm25: [r.current.pm2_5, r.current.us_aqi_pm2_5, "model"], pm10: [r.current.pm10, r.current.us_aqi_pm10, "model"], no2: [r.current.nitrogen_dioxide, r.current.us_aqi_nitrogen_dioxide, "model"],
      so2: [r.current.sulphur_dioxide, r.current.us_aqi_sulphur_dioxide, "model"], o3: [r.current.ozone, r.current.us_aqi_ozone, "model"], co: [r.current.carbon_monoxide, r.current.us_aqi_carbon_monoxide, "model"] },
    time: r.hourly.time, hourly: r.hourly.us_aqi.map(v => v == null ? null : Math.round(v)), currentTime: r.current.time,
    pmH: (r.hourly.pm2_5 || []).map(v => v == null ? null : Math.round(v * 10) / 10),   // v52: PM2.5 каждого часа (модель CAMS)
    src: "model", model: { aqi: a0, pm25: r.current.pm2_5 },
  };
}
/* Контроль качества датчиков Sensor.Community: одиночный датчик, показывающий во много раз больше соседних датчиков
 * (или модели CAMS, если соседей нет), а также насыщенный (PM2.5 ≥ 500), считается сбойным и не участвует в расчётах. */
function sensorQC(list, models) {
  const ok = [], bad = [];
  list.forEach(s => {
    const nb = list.filter(x => x !== s && kmDist(s, x) <= 5).map(x => x.p2);
    let out = s.p2 >= 500;
    if (!out && nb.length >= 2) { const m = median(nb); out = s.p2 > Math.max(3 * m, m + 60); }
    else if (!out && models.length) { let b = null; models.forEach(md => { const k = kmDist(s, md); if (md.pm25 != null && (!b || k < b.k)) b = { k, v: md.pm25 }; }); if (b) out = s.p2 > Math.max(4 * b.v, b.v + 100); }
    (out ? bad : ok).push(s);
  });
  if (bad.length) console.info("Sensor QC: excluded", bad.length, "outlier sensor(s)", bad.map(x => Math.round(x.p2)));
  return { ok, bad };
}
function measuredRec(rec, d, sensors, stations) {
  const nBad = (air.sensorsBad || []).filter(x => kmDist(d, x) <= 2.5).length; if (nBad) rec.sDrop = nBad;
  const s = sensorsNear(sensors, d);
  if (s) {
    Object.assign(rec, { aqi: s.aqi, pm25: s.pm25, pm10: s.pm10 ?? rec.pm10, src: "sensors", nSensors: s.n, sensorAgeMin: s.age });
    rec.pol.pm25 = [s.pm25, s.aqi, "sensors"];
    if (s.pm10 != null) rec.pol.pm10 = [s.pm10, pm10ToAqi(s.pm10), "sensors"];
  }
  if (typeof applyStations === "function") applyStations(rec, d, stations);
  return rec;
}
/* Дальние районы (пригородный пояс) догружаются вторым запросом после основных — чтобы старт не замедлялся */
let farInflight = null;
function loadFarAir() {
  const c = CITIES[CITY], far = c.districts.filter(d => !DISTRICTS.includes(d));
  if (!far.length || farInflight) return farInflight;
  const reqCity = CITY;
  farInflight = fetchAirPts(far.map(d => [d.lat, d.lon])).then(arr => {
    if (CITY !== reqCity) return;
    far.forEach((d, i) => { if (arr[i] && arr[i].current) air.byDistrict[d.id] = measuredRec(mkAirRec(arr[i]), d, air.sensors, air.stations); });
    DISTRICTS = c.districts.filter(d => air.byDistrict[d.id]); c.farLoaded = true; saveAirCache();
    const cur = (location.hash || "#home").slice(1).split("/")[0];
    if (cur === "map" && mapMode === "city" && typeof mapUpdate === "function" && mapUpdate()) return;
    if (["home", "profile", ""].includes(cur)) route(true);
  }).catch(e => console.warn("far districts:", e.message)).finally(() => { farInflight = null; });
  return farInflight;
}
async function loadAirImpl() {
  const reqCity = CITY, cc = cityObj().center;
  const farR = ECO_ROUTES.filter(r => r.far), pts = [...DISTRICTS.map(d => [d.lat, d.lon]), ...farR.map(r => r.path[r.path.length >> 1])];
  const wurl = `https://api.open-meteo.com/v1/forecast?latitude=${cc[0]}&longitude=${cc[1]}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,wind_speed_10m,temperature_925hPa,temperature_900hPa,temperature_850hPa,temperature_800hPa,temperature_700hPa,surface_pressure,boundary_layer_height&forecast_days=2&wind_speed_unit=ms&timezone=auto`;
  try {
    let [arr, w, sensors, stations] = await withTimeout(Promise.all([fetchAirPts(pts), fetchJSON(wurl).catch(() => null), loadSensors(cc).catch(() => []),
      (typeof loadStations === "function" ? loadStations(cc) : Promise.resolve([])).catch(() => [])]), 20000);
    if (CITY !== reqCity) return;
    { const q = sensorQC(sensors || [], DISTRICTS.map((d, i) => ({ lat: d.lat, lon: d.lon, pm25: arr[i] && arr[i].current ? arr[i].current.pm2_5 : null }))); sensors = q.ok; air.sensorsBad = q.bad; }
    DISTRICTS.forEach((d, i) => { air.byDistrict[d.id] = measuredRec(mkAirRec(arr[i]), d, sensors, stations); });
    air.byRoute = {}; farR.forEach((r, j) => { const x = arr[DISTRICTS.length + j]; if (x && x.current) air.byRoute[r.id] = aqiOf(x.current.us_aqi); });
    air.weather = w && w.current ? w.current : null; air.wxH = w && w.hourly ? w.hourly : null;
    air.sensors = sensors || []; air.stations = stations || [];
    air.live = true; air.status = "ok"; air.updated = arr[0].current.time; air.offlineAt = null; air.archive = null; air.errKind = null; airRetryN = 0; clearTimeout(airRetryT);
    saveAirCache();
    setTimeout(loadFarAir, 300);
  } catch (e) {
    if (CITY !== reqCity) return;
    console.warn("Open-Meteo недоступен — последние сохранённые реальные данные или «нет данных»:", e.message);
    useCachedAir();   // никаких синтетических AQI
    // «нет сети» — только если браузер офлайн; иначе сеть есть, а сервис не ответил (таймаут / HTTP-ошибка)
    air.errKind = navigator.onLine === false ? "offline" : "service";
    if (air.errKind === "service") scheduleAirRetry();
  }
  renderChrome();
  // Перерисовываем только экраны, зависящие от данных о воздухе (чтобы не сбить ввод в формах).
  const cur = (location.hash || "#home").slice(1).split("/")[0];
  const advIdle = cur === "advisor" && !(document.getElementById("askIn") || {}).value && typeof adv !== "undefined" && adv.extra.some(m => m.quick);
  if (["home", "map", "routes", "profile", "weather", ""].includes(cur) || !views[cur] || advIdle) route(true);   // v50: + weather (риск смога как на главной)
  if (typeof refreshShareLinks === "function") refreshShareLinks();
  checkAlerts();
}

/* ---------------- Шапка, меню, язык ---------------- */
const TAB_LABEL = { news: "tab_news", home: "tab_home", map: "tab_map", house: "tab_house", advisor: "tab_advisor", more: "tab_more" };
const HOME_LBL = { ru: "Таза Аба — на главную", ky: "Таза Аба — башкы бетке", en: "Taza Aba — home" };
function renderChrome() {
  const b = $("#dataBadge");
  if (air.status === "loading") { b.className = "data-badge"; b.textContent = "…"; }
  else if (air.live) { b.className = "data-badge"; b.innerHTML = `<span class="dot"></span>${t("live")} · Open-Meteo`; }
  else if (air.status === "offline") { b.className = "data-badge demo"; b.innerHTML = `<span class="dot"></span>${Q(air.errKind === "service" ? "svcBadge" : "offline", { t: fmtAt(air.offlineAt) })}`; }
  else if (air.status === "stale") { b.className = "data-badge demo"; b.innerHTML = `<span class="dot"></span>${Q("stBadge")}`; }
  else { b.className = "data-badge demo"; b.innerHTML = `<span class="dot"></span>${Q("nodata")}`; }
  $(".brand-sub").textContent = t("brandSub");
  $(".brand-name").textContent = LANG === "en" ? "Taza Aba" : "Таза Аба";
  document.querySelectorAll(".tabbar a").forEach(a => {
    const sp = $("span", a); if (!sp) return;
    const k = a.dataset.tab;
    if (TAB_LABEL[k]) sp.textContent = t(TAB_LABEL[k]);
    else if (k === "weather") sp.textContent = Q("mWeather");
    else if (k === "history") sp.textContent = Q("hist");
    else if (k === "schools") sp.textContent = typeof MT === "function" ? MT("title") : "Maarif";
    else if (k === "routes") sp.textContent = t("m_routes");
    else if (k === "complaints") sp.textContent = t("m_complaints");
    else if (k === "profile") sp.textContent = t("m_profile");
    else if (k === "alerts") sp.textContent = t("m_alerts");
    else if (k === "cleanair" && typeof FT === "function") sp.textContent = FT("ca");
    else if (k === "traffic" && typeof FT === "function") sp.textContent = FT("tf");
    else if (k === "trees" && typeof FT === "function") sp.textContent = FT("tr");
  });
  document.querySelectorAll("#langSw button").forEach(x => x.classList.toggle("on", x.dataset.lang === LANG));
  document.querySelectorAll(".home-link").forEach(a => a.setAttribute("aria-label", HOME_LBL[LANG] || HOME_LBL.ru));
  renderThemeBtn();
  const cs = $("#citySel");
  cs.innerHTML = CITY_ORDER.map(id => `<option value="${id}" ${id === CITY ? "selected" : ""}>${CITIES[id].emoji} ${tr(CITIES[id].short || CITIES[id].name)}</option>`).join("");
  cs.setAttribute("aria-label", t("cityLbl"));
  const fl = $(".ctry-flag"); if (fl) fl.textContent = "🇰🇬";
  const ks = $("#ctrySel"); if (ks) { ks.innerHTML = ["kg"].map(k => `<option value="${k}" ${k === cityObj().country ? "selected" : ""}>${k === "kg" ? "🇰🇬" : "🇹🇷"} ${ctryName(k)}</option>`).join(""); ks.setAttribute("aria-label", ctryName("lbl")); }
  applySeo();
  document.documentElement.lang = LANG;
  const tb = $("#tabbar"); if (tb) tb.setAttribute("aria-label", { ru: "Навигация", ky: "Навигация", en: "Navigation" }[LANG] || "Навигация");
  renderBanner();
}
/* v36: смена языка без «вспышки». Раньше route() перезапускал CSS-анимацию .view (opacity 0 → 1 + сдвиг 6px),
 * и при первом переходе на KG/TR браузер лениво докачивал шрифтовые подмножества (cyrillic-ext / latin-ext) → FOUT.
 * Теперь: текст перерисовывается на месте без перезапуска анимации, высота фиксируется (нет скачка прокрутки),
 * мягкий cross-fade 150 мс (отключается при prefers-reduced-motion), шрифты для всех языков подгружаются заранее. */
function switchLang(l) {
  if (!l || l === LANG) return;
  const el = $("#view"), y = scrollY;
  el.style.minHeight = el.offsetHeight + "px";
  setLang(l); renderChrome(); route(true, true);
  if (scrollY !== y) window.scrollTo(0, y);
  if (!RED_MOTION && el.animate) { try { el.animate([{ opacity: 0.7 }, { opacity: 1 }], { duration: 150, easing: "ease-out" }); } catch (e) { /* без анимации */ } }
  clearTimeout(switchLang._t); switchLang._t = setTimeout(() => { el.style.minHeight = ""; }, 600);
}
document.querySelectorAll("#langSw button").forEach(x => x.onclick = () => switchLang(x.dataset.lang));
/* логотип → главная (#home, без перезагрузки — работает и на /taza-aba/, и в корне Surge) */
/* в боковом меню логотип — div role="link" (тег <a> внутри .tabbar подхватил бы стили вкладок) */
const goHome = e => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
  e.preventDefault();
  if (location.hash && location.hash !== "#home") { location.hash = "#home"; return; }   // hashchange → route() → вверх страницы
  window.scrollTo({ top: 0, behavior: RED_MOTION ? "auto" : "smooth" });
};
document.querySelectorAll(".home-link").forEach(a => { a.addEventListener("click", goHome);
  if (a.tagName !== "A") a.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") goHome(e); }); });
/* заранее подгрузить подмножества шрифтов (ң ө ү — cyrillic-ext, ğ ş ı İ — latin-ext), чтобы первый переход на KG/TR не мигал */
setTimeout(() => { try { if (document.fonts && document.fonts.load) ["Manrope", "Unbounded"].forEach(f => ["700", "800"].forEach(w => document.fonts.load(`${w} 16px ${f}`, "ңөүҢӨҮğşıİçöüĞŞ").catch(() => {}))); } catch (e) {} }, 1200);
$("#themeBtn").onclick = () => { cycleTheme(); renderChrome(); route(true, true); };
$("#citySel").onchange = e => switchCity(e.target.value);
function switchCity(id) {
  if (id === CITY || !CITIES[id]) return;
  applyCity(id);
  state.house = { ...cityObj().house, group: state.house.group };   // значения калькулятора по умолчанию для города
  save();
  air.status = "loading"; air.live = false; air.byDistrict = {}; air.weather = null;
  banner = null; selRoute = null; draft.lat = draft.lon = null;
  renderChrome(); route(true); toast(t("cityChanged"));
  loadAir();
}
function applyCity(id) {
  CITY = id; localStorage.setItem(CITY_STORE, id);
  const c = CITIES[id];
  DISTRICTS = c.districts.filter(d => !d.far || c.farLoaded || d.id === state.district);
  ECO_ROUTES = c.routes;
  CITY_ORDER.splice(0, CITY_ORDER.length, ...KG_ORDER);
  if (typeof countryAir !== "undefined" && countryAir.ctry !== c.country) { countryAir.status = "idle"; countryAir.byCity = {}; countryAir.ctry = c.country; }
  Object.assign(K, K_BASE, c.k);   // поправки калькулятора (например, COP насоса в морозном Нарыне)
  const D_ALIAS = { bk_chon_aryk_village_lenins: "bk_chon_aryk_village_leninsx" };   // дубль одного села (OSM Q878489) убран
  if (D_ALIAS[state.district]) state.district = D_ALIAS[state.district];
  if (!DISTRICTS.some(d => d.id === state.district)) state.district = c.defaultDistrict;
  if (!DISTRICTS.some(d => d.id === state.alerts.district)) { state.alerts.district = c.alertDistrict; state.alerts.sent = {}; }
}

/* ---------------- Роутер ---------------- */
let map = null;
const views = { home: viewHome2, map: viewMap, house: viewHouse, advisor: el => viewAdvisor2(el), more: viewMore2,
  profile: viewProfile, complaints: el => viewComplaints2(el), routes: el => viewRoutes2(el), news: el => viewNews(el), weather: el => viewNews(el) };
const TAB_OF = { house: "more", profile: "more", complaints: "more", routes: "more", weather: "news", history: "more", schools: "more", cleanair: "more", traffic: "more", trees: "more" };
function route(keepScroll, soft) {
  const [tab, anchor] = (location.hash || "#home").slice(1).split("/");
  const v = views[tab] ? tab : "home";
  if (tab === "group") history.replaceState(null, "", location.pathname + location.search + "#home");   // v54: старый адрес удалённого раздела
  const activeTab = TAB_OF[v] || v;
  const hash = location.hash || "#home";
  document.querySelectorAll(".tabbar a").forEach(a => {
    const href = a.getAttribute("href") || "";
    const sideHit = a.classList.contains("side-only") && (href === hash || href === "#" + v);
    const primaryHit = !a.classList.contains("side-only") && a.dataset.tab === activeTab && !document.querySelector(`.tabbar a.side-only[href="${CSS.escape(hash)}"]`);
    a.classList.toggle("active", sideHit || primaryHit);
  });
  if (map) { try { map.stop(); map.off(); map.remove(); } catch (e) { /* карта уже удалена */ } map = null; }
  const el = $("#view");
  const y = window.scrollY;
  if (!soft) { el.style.animation = "none"; el.offsetHeight; el.style.animation = ""; }
  if (air.status === "loading" && (["home", "routes"].includes(v) || (v === "map" && mapMode !== "country"))) {
    el.innerHTML = `<h1>${t("loading")}</h1><p class="sub">${t("loadingSub")}</p><div class="skeleton"></div>`;
    return;
  }
  if ((air.status === "nodata" || air.status === "stale") && (["home", "routes"].includes(v) || (v === "map" && mapMode !== "country"))) { el.className = "view v-nodata"; return viewNoData(el); }
  el.className = "view v-" + v;
  views[v](el);
  decorate(el);
  if (anchor && document.getElementById(anchor)) document.getElementById(anchor).scrollIntoView();
  else window.scrollTo(0, keepScroll === true ? y : 0);
}
window.addEventListener("hashchange", () => route());
/* v54: удалённый раздел «Вместе» (#group) → главная, без ошибок */
if (/^#group(\/|$)/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search + "#home");

function toast(msg) {
  const tt = $("#toast"); tt.textContent = msg; tt.classList.add("show");
  clearTimeout(toast._t); toast._t = setTimeout(() => tt.classList.remove("show"), 2400);
}
/* список районов: при наличии групп (адм. районы / пригород) — <optgroup>, внутри по алфавиту */
const districtOptions = sel => {
  const opt = d => `<option value="${d.id}" ${d.id === sel ? "selected" : ""}>${esc(dName(d))}</option>`;
  if (!DISTRICTS.some(d => d.grp) || typeof GRP_NAME === "undefined") return DISTRICTS.map(opt).join("");
  const order = [...new Set(DISTRICTS.map(d => d.grp || ""))].sort((a, b) => (GRP_ORDER.indexOf(a) + 99) % 99 - (GRP_ORDER.indexOf(b) + 99) % 99);
  return order.map(g => { const ds = DISTRICTS.filter(d => (d.grp || "") === g).sort((a, b) => dName(a).localeCompare(dName(b), LANG, { numeric: true }));
    return g ? `<optgroup label="${esc(tr(GRP_NAME[g] || { ru: g }))}">${ds.map(opt).join("")}</optgroup>` : ds.map(opt).join(""); }).join("");
};
/* Подложки карты: Схема (OSM) / Спутник (Esri World Imagery) / Гибрид (спутник + подписи и дороги Esri). Все без ключа.
 * Выбор хранится в localStorage; в тёмной теме фильтр затемнения применяется только к схеме (dark.css). */
const BASE_KEY = "tazaAba.basemap";
const BASE_T = { ru: ["Схема", "Спутник", "Гибрид", "Подложка карты"], ky: ["Схема", "Спутник", "Гибрид", "Картанын негизи"], en: ["Map", "Satellite", "Hybrid", "Base map"] };
const ESRI = p => `https://server.arcgisonline.com/ArcGIS/rest/services/${p}/MapServer/tile/{z}/{y}/{x}`;
const ESRI_ATTR = 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community';
/* Производительность карт: canvas-рендерер для кругов/линий, без анимаций на слабых устройствах и при prefers-reduced-motion */
const RED_MOTION = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } })();
const LOWEND = RED_MOTION || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;
const IS_MOB = (() => { try { return matchMedia("(max-width: 1023px), (pointer: coarse)").matches; } catch (e) { return false; } })();
document.documentElement.classList.toggle("lowend", LOWEND);
/* защита от гонки: отложенный колбэк/анимация трогает уже удалённую карту (быстрое переключение разделов) */
if (window.L && L.Map && !L.Map.prototype.__tzGuard) { const gp = L.Map.prototype._getMapPanePos; L.Map.prototype._getMapPanePos = function () { return this._mapPane ? gp.call(this) : L.point(0, 0); }; L.Map.prototype.__tzGuard = true; }
function mkMap(id, o = {}) {
  return L.map(id, Object.assign({ preferCanvas: true, renderer: L.canvas({ padding: 0.3 }), fadeAnimation: !LOWEND, zoomAnimation: !LOWEND, markerZoomAnimation: !LOWEND, inertia: !LOWEND }, o));
}
const idle = (fn, to = 600) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: to }) : setTimeout(fn, 30));
function baseMode() { const v = localStorage.getItem(BASE_KEY); return v === "sat" || v === "hyb" ? v : "osm"; }
function baseTiles(m) {
  const TO = { keepBuffer: 2, updateWhenIdle: IS_MOB, updateWhenZooming: false };
  const osm = () => window.MS_STYLE && typeof msBaseTile === "function" ? msBaseTile() : L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { ...TO, className: "tl-osm", maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' });
  const sat = () => L.tileLayer(ESRI("World_Imagery"), { ...TO, className: "tl-sat", detectRetina: !LOWEND && (window.devicePixelRatio || 1) > 1.4, maxZoom: 18, maxNativeZoom: 18, attribution: ESRI_ATTR });
  const lab = () => [L.tileLayer(ESRI("Reference/World_Transportation"), { ...TO, className: "tl-sat", maxZoom: 18, opacity: 0.85 }), L.tileLayer(ESRI("Reference/World_Boundaries_and_Places"), { ...TO, className: "tl-sat", maxZoom: 18 })];
  let cur = [];
  const apply = mode => {
    cur.forEach(l => m.removeLayer(l));
    cur = mode === "osm" ? [window.iosBaseLayer ? iosBaseLayer(osm) : osm()] : mode === "sat" ? [sat()] : [sat(), ...(window.iosHybLayer ? [iosHybLayer(() => L.layerGroup(lab()))] : lab())]; /* v44-ios: векторная «Схема»/гибрид, фолбэк — растр */
    cur.forEach(l => l.addTo(m));
    const c = m.getContainer(); c.classList.toggle("map-sat", mode !== "osm");
    c.querySelectorAll(".bm-ctl button").forEach(b => b.setAttribute("aria-pressed", b.dataset.bm === mode));
    m.fire("basemode", { mode });
  };
  const Ctl = L.Control.extend({ options: { position: "topright" }, onAdd() {
    const T = BASE_T[LANG] || BASE_T.ru, d = L.DomUtil.create("div", "bm-ctl leaflet-bar");
    d.setAttribute("role", "group"); d.setAttribute("aria-label", T[3]);
    d.innerHTML = ["osm", "sat", "hyb"].map((k, i) => `<button type="button" data-bm="${k}" aria-pressed="false">${T[i]}</button>`).join("");
    L.DomEvent.disableClickPropagation(d); L.DomEvent.disableScrollPropagation(d);
    d.querySelectorAll("button").forEach(b => b.onclick = e => { e.preventDefault(); localStorage.setItem(BASE_KEY, b.dataset.bm); apply(b.dataset.bm); });
    return d; } });
  new Ctl().addTo(m);
  apply(baseMode());
}

/* ---------------- Иконки (inline SVG, stroke = currentColor) ---------------- */
const svg = d => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const ICON = {
  pin: svg('<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>'),
  camera: svg('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
  bike: svg('<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-8h5l3 8M10 8l2 8"/>'),
  spark: svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>'),
  bell: svg('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>'),
  leaf: svg('<path d="M5 19c0-9 6-14 15-15-1 9-6 15-15 15z"/><path d="M5 19l8-8"/>'),
  cal: svg('<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>'),
  clock: svg('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>'),
  globe: svg('<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16"/>'),
  award: svg('<circle cx="12" cy="9" r="5"/><path d="M9 13l-2 7 5-3 5 3-2-7"/>'),
  city: svg('<path d="M4 20V9l5-3v14M9 20V4h7v16M16 20v-9l4 2v7M3 20h18"/>'),
  list: svg('<path d="M9 7h11M9 12h11M9 17h11M4.5 7h.01M4.5 12h.01M4.5 17h.01"/>'),
  bolt: svg('<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>'),
  people: svg('<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M12 20c0-3.3 1.8-6 4-6 3.3 0 6 2.7 6 6"/>'),
};
/* Заголовки секций: эмодзи в начале строки перевода → единая SVG-иконка. */
const H2_ICON = { "🌍": "globe", "🏅": "award", "🏆": "award", "📅": "cal", "⏱": "clock", "🌱": "leaf", "🏙": "city", "📋": "list", "⚡": "bolt", "👥": "people" };
function decorate(root) {
  root.querySelectorAll("h2").forEach(h => {
    if (h.dataset.dec) return;
    const m = h.innerHTML.match(/^\s*([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}])\uFE0F?\s*/u);
    if (!m) return;
    const name = H2_ICON[m[1]] || "leaf";
    h.innerHTML = `<span class="h2i">${ICON[name]}</span>` + h.innerHTML.slice(m[0].length);
    h.dataset.dec = "1";
  });
}
new MutationObserver(() => decorate($("#view"))).observe(document.getElementById("view"), { childList: true, subtree: true });

/* ---------------- 1. Главная ---------------- */
/* v52: почасовой индекс по PM2.5 этого часа (модель CAMS). us_aqi Open-Meteo для PM считается по среднему за прошедшие 24 ч —
 * он сглаживает вечерний пик и не показывает лучший час дня (25.10, Бишкек: PM2.5 10,6 мкг/м³ в 11:00 и 23,4 в 21:00, а us_aqi 50 → 57 монотонно). */
function hAqi(a) {
  if (!a) return [];
  if (a._hA) return a._hA;
  const v = Array.isArray(a.pmH) && a.pmH.some(x => x != null) ? a.pmH.map(x => x == null ? null : pm25ToAqi(x)) : (a.hourly || []);
  try { Object.defineProperty(a, "_hA", { value: v, enumerable: false }); } catch (e) { /* ignore */ }
  return v;
}
/* модельный AQI «сейчас» на той же основе (PM2.5 текущего часа) — для сравнения с датчиками */
const modelNowAqi = r => r && r.model ? (r.model.pm25 != null ? pm25ToAqi(r.model.pm25) : r.model.aqi) : null;
/* пик — самый грязный час (PM2.5 за час); сред. — AQI по среднесуточному PM2.5 (так EPA считает суточный AQI) */
function dailyForecast(data) {
  const days = {}, H = hAqi(data), P = Array.isArray(data.pmH) && data.pmH.some(x => x != null) ? data.pmH : null;
  data.time.forEach((tm, i) => {
    const k = tm.slice(0, 10); const v = H[i];
    if (v != null) { const o = (days[k] = days[k] || { v: [], p: [] }); o.v.push(v); if (P && P[i] != null) o.p.push(P[i]); }
  });
  return Object.entries(days).map(([k, o]) => ({ date: k, max: Math.max(...o.v),
    avg: o.p.length >= 12 ? pm25ToAqi(o.p.reduce((a, b) => a + b, 0) / o.p.length) : Math.round(o.v.reduce((a, b) => a + b, 0) / o.v.length) }));
}

function viewHome(el) {
  const d = byId(state.district);
  const a = air.byDistrict[d.id];
  const Lv = level(a.aqi);
  const pin = Math.min(a.aqi || 0, 300) / 300 * 100;
  const days = dailyForecast(a);
  const today = days[0]?.date;
  const next = days.slice(1, 4);
  const todayIdx = a.time.map((tm, i) => [tm, i]).filter(([tm]) => tm.startsWith(today));
  const nowHour = (a.currentTime || "").slice(0, 13);
  const HA = hAqi(a);
  const maxBar = Math.max(60, ...todayIdx.map(([, i]) => HA[i] || 0));
  // v52: высота столбика — концентрация PM2.5 (мкг/м³, линейно), цвет — уровень AQI этого часа
  const pmBar = Array.isArray(a.pmH) && todayIdx.some(([, i]) => a.pmH[i] != null), pmMaxBar = pmBar ? Math.max(15, ...todayIdx.map(([, i]) => a.pmH[i] || 0)) : 1;
  const worst = todayIdx.reduce((m, [tm, i]) => (HA[i] > (m.v ?? -1) ? { tm, v: HA[i] } : m), {});
  const best = todayIdx.filter(([tm]) => +tm.slice(11, 13) >= 7 && +tm.slice(11, 13) <= 21)
    .reduce((m, [tm, i]) => (HA[i] != null && HA[i] < (m.v ?? 1e9) ? { tm, v: HA[i] } : m), {});
  const w = air.weather;
  const days7 = t("days");

  el.innerHTML = `
    <div class="home-grid"><div class="col">
    <div class="hero lv${AQI_LEVELS.indexOf(Lv)}"><i class="orn-c tl" aria-hidden="true"></i><i class="orn-c br" aria-hidden="true"></i>
      <div class="hero-top">
        <div>
          <div class="district">${ICON.pin} ${esc(dName(d))} · ${tr(DTYPE[d.type])}</div>
          <div class="level">${tr(Lv.name)}</div>
          <div class="hero-title">${tr(Lv.title)}</div>
        </div>
        <div class="gauge" role="img" aria-label="US AQI ${aqiTxt(a.aqi)}"><svg class="g-frame" viewBox="0 0 120 120" aria-hidden="true"><g class="g-rays"><line x1="116.0" y1="60.0" x2="121.0" y2="60.0"/><line x1="115.1" y1="69.7" x2="120.1" y2="70.6"/><line x1="112.6" y1="79.2" x2="117.3" y2="80.9"/><line x1="108.5" y1="88.0" x2="112.8" y2="90.5"/><line x1="102.9" y1="96.0" x2="106.7" y2="99.2"/><line x1="96.0" y1="102.9" x2="99.2" y2="106.7"/><line x1="88.0" y1="108.5" x2="90.5" y2="112.8"/><line x1="79.2" y1="112.6" x2="80.9" y2="117.3"/><line x1="69.7" y1="115.1" x2="70.6" y2="120.1"/><line x1="60.0" y1="116.0" x2="60.0" y2="121.0"/><line x1="50.3" y1="115.1" x2="49.4" y2="120.1"/><line x1="40.8" y1="112.6" x2="39.1" y2="117.3"/><line x1="32.0" y1="108.5" x2="29.5" y2="112.8"/><line x1="24.0" y1="102.9" x2="20.8" y2="106.7"/><line x1="17.1" y1="96.0" x2="13.3" y2="99.2"/><line x1="11.5" y1="88.0" x2="7.2" y2="90.5"/><line x1="7.4" y1="79.2" x2="2.7" y2="80.9"/><line x1="4.9" y1="69.7" x2="-0.1" y2="70.6"/><line x1="4.0" y1="60.0" x2="-1.0" y2="60.0"/><line x1="4.9" y1="50.3" x2="-0.1" y2="49.4"/><line x1="7.4" y1="40.8" x2="2.7" y2="39.1"/><line x1="11.5" y1="32.0" x2="7.2" y2="29.5"/><line x1="17.1" y1="24.0" x2="13.3" y2="20.8"/><line x1="24.0" y1="17.1" x2="20.8" y2="13.3"/><line x1="32.0" y1="11.5" x2="29.5" y2="7.2"/><line x1="40.8" y1="7.4" x2="39.1" y2="2.7"/><line x1="50.3" y1="4.9" x2="49.4" y2="-0.1"/><line x1="60.0" y1="4.0" x2="60.0" y2="-1.0"/><line x1="69.7" y1="4.9" x2="70.6" y2="-0.1"/><line x1="79.2" y1="7.4" x2="80.9" y2="2.7"/><line x1="88.0" y1="11.5" x2="90.5" y2="7.2"/><line x1="96.0" y1="17.1" x2="99.2" y2="13.3"/><line x1="102.9" y1="24.0" x2="106.7" y2="20.8"/><line x1="108.5" y1="32.0" x2="112.8" y2="29.5"/><line x1="112.6" y1="40.8" x2="117.3" y2="39.1"/><line x1="115.1" y1="50.3" x2="120.1" y2="49.4"/></g><circle cx="60" cy="60" r="41" class="g-ring"/><path class="g-cross" d="M30 50q30-14 60 0M30 70q30 14 60 0M50 30q-14 30 0 60M70 30q14 30 0 60"/></svg>
          <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" class="g-bg"/><circle cx="60" cy="60" r="50" class="g-fg" style="stroke-dasharray:${(Math.min(a.aqi || 0, 300) / 300 * 314).toFixed(1)} 314"/></svg>
          <div class="g-val"><b>${aqiTxt(a.aqi)}</b><span>US AQI</span></div>
        </div>
      </div>
      <div class="meta">
        <span>PM2.5 ${fmt(a.pm25, 1)} ${LANG === "en" ? "µg/m³" : "мкг/м³"}</span>
        ${w ? `<span>🌡️ ${fmt(w.temperature_2m, 0)}°C</span><span>💨 ${fmt(w.wind_speed_10m, 1)} ${LANG === "en" ? "m/s" : "м/с"}</span>` : ""}
        ${a.pm10 != null ? `<span>PM10 ${fmt(a.pm10, 0)}</span>` : ""}${a.no2 != null ? `<span>NO₂ ${fmt(a.no2, 0)}</span>` : ""}
        <span>🕒 ${(a.currentTime || "").slice(11, 16)}</span>
      </div>
      <div class="src-line">${srcLabel(a, d)}</div>
      <select id="districtSel" aria-label="${t("district")}">${districtOptions(d.id)}</select>
      ${DISTRICTS.length > 15 && typeof KP === "function" ? `<div class="d-search"><input id="dSearch" type="search" list="dList" autocomplete="off" placeholder="🔎 ${KP("dSearch", { n: DISTRICTS.length })}" aria-label="${KP("dSearch", { n: DISTRICTS.length })}"><datalist id="dList">${DISTRICTS.map(x => `<option value="${esc(dName(x))}">`).join("")}</datalist></div>` : ""}
    </div>

    <div class="card">
      <div class="scale-wrap">
        <div class="scale">${AQI_LEVELS.slice(0, 5).map(l => `<div style="background:${l.color}"></div>`).join("")}</div>
        <div class="scale-pin" style="left:${pin}%;border-color:${Lv.color}"></div>
      </div>
      <div class="scale-labels"><span>0</span><span>50</span><span>100</span><span>150</span><span>200</span><span>300+</span></div>
    </div>

    ${pollutantsHTML(a)}
    <div class="card advice-card">
      <div class="advice">
        <div class="ico">${Lv.emoji}</div>
        <div>
          <span class="chip sun">${t("dayAdvice")}</span>
          <b style="margin-top:6px">${tr(Lv.title)}</b>
          <div class="muted" style="font-weight:600;font-size:14px">${tr(Lv.text)}</div>
          <ul>${tr(Lv.tips).map(x => `<li>${x}</li>`).join("")}</ul>
        </div>
      </div>
    </div>

    </div><div class="col">
    <h2>${t("quick")}</h2>
    <div class="quick">
      <a href="#complaints"><b>${ICON.camera}</b>${t("q_complain")}</a>
      <a href="#routes"><b>${ICON.bike}</b>${t("q_routes")}</a>
      <a href="#advisor"><b>${ICON.spark}</b>${t("q_advisor")}</a>
      <a href="#news"><b>📰</b>${t("q_news")}</a>
      <a href="#profile/alertsCard"><b>${ICON.bell}</b>${t("q_alerts")}</a>
    </div>

    <h2>📅 ${t("forecast3")}</h2>
    <div class="forecast">
      ${next.map((x, i) => {
        const dl = level(x.max); const dt = new Date(x.date + "T12:00");
        const label = i === 0 ? t("tomorrow") : i === 1 ? t("dayAfter") : days7[dt.getDay()] + ", " + dt.getDate();
        return `<div class="fday"><div class="d">${label}</div><div class="v" style="color:${dl.color}">${x.max}</div>
          <span class="l" style="background:${dl.color}22;color:${dl.color}">${tr(dl.short)}</span>
          <div class="small muted" style="margin-top:4px;font-weight:700">${t("avg")} ${x.avg}</div></div>`;
      }).join("")}
    </div>
    <p class="small muted" style="margin:6px 2px 0;font-weight:600">${t("peakNote")} *${tr(AQI_LEVELS[2].name)}.</p>

    <h2>⏱️ ${t("todayHourly")}</h2>
    <div class="card">
      <div class="bars">${todayIdx.map(([tm, i]) => {
        const v0 = HA[i], v = v0 || 0, pv = pmBar ? a.pmH[i] || 0 : 0;
        return `<div title="${tm.slice(11, 16)} — AQI ${aqiTxt(v0)}${a.pmH && a.pmH[i] != null ? " · PM2.5 " + fmt(a.pmH[i], 1) : ""}" class="${tm.startsWith(nowHour) ? "now" : ""}" style="height:${Math.max(6, pmBar ? pv / pmMaxBar * 100 : v / maxBar * 100)}%;background:${level(v0).color}"></div>`;
      }).join("")}</div>
      <div class="bars-x"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span></div>
      <div class="stat-grid" style="margin-top:12px">
        <div class="stat"><div class="k">${t("bestTime")}</div><div class="v">${(best.tm || "").slice(11, 16) || "—"}</div><div class="small muted">AQI ${best.v ?? "—"}${a.pmH && best.tm && a.pmH[a.time.indexOf(best.tm)] != null ? " · PM2.5 " + fmt(a.pmH[a.time.indexOf(best.tm)], 1) : ""}</div></div>
        <div class="stat"><div class="k">${t("peakSmog")}</div><div class="v">${(worst.tm || "").slice(11, 16) || "—"}</div><div class="small muted">AQI ${worst.v ?? "—"}${a.pmH && worst.tm && a.pmH[a.time.indexOf(worst.tm)] != null ? " · PM2.5 " + fmt(a.pmH[a.time.indexOf(worst.tm)], 1) : ""}</div></div>
      </div>
      ${a.pmH ? `<p class="small muted hour-note">ℹ️ ${t("hourNote")}</p>` : ""}
    </div>

    <div class="card tip">
      <div class="row" style="align-items:flex-start">
        <div style="font-size:30px">☀️</div>
        <div>
          <b>${d.coalShare == null && typeof KP === "function" ? KP("coalNA", { in: dLoc(d) }) : t("coalTip", { in: dLoc(d), p: Math.round(d.coalShare * 100) })}</b>
          <div class="small muted" style="font-weight:700;margin:4px 0 10px">${t("coalTipSub")}</div>
          <a href="#house" class="btn sun" style="display:inline-block;text-decoration:none;padding:10px 14px;font-size:14px">${t("calcBtn")}</a>
        </div>
      </div>
    </div>
    </div></div>
    ${footer()}
  `;
  $("#districtSel").onchange = e => { state.district = e.target.value; save(); route(); };
  const ds = $("#dSearch"); if (ds) ds.oninput = () => { const v = ds.value.trim().toLowerCase(), m = v && DISTRICTS.find(x => dName(x).toLowerCase() === v); if (m) { state.district = m.id; save(); route(); } };
}

function footer() {
  const link = `<a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>`;
  return `<div class="foot">${air.live ? t("footLive", { link, t: (air.updated || "").replace("T", " ") }) : t("footDemo")}<br>${t("footProto")}</div>`;
}

/* ---------------- 2. Карта ---------------- */
let mapLayers = { smog: true, complaints: true, routes: false };
const allComplaints = () => state.complaints.filter(inCity);   // v58: только свои настоящие жалобы
const C_EMOJI = { chimney: "🏭", trash: "🔥", dump: "🗑️", car: "🚌", factory: "🏗️" };
function complaintPopup(c) {
  const st = [t("cStatusSent"), t("cStatusFwd"), t("cStatusDone")][c.status || 0];
  return `<b>${C_EMOJI[c.cat] || "⚠️"} ${t("cat_c_" + c.cat)}</b>${c.mine ? ` · <i>${t("cMine")}</i>` : ""}<br>${esc(tr(c.text))}<br>
    ${phImg(c, 'style="width:100%;border-radius:10px;margin-top:6px" alt=""')}<span style="color:#1f7a4d">● ${st}</span> · ${esc(fmtDay(c.date))}`;
}
const complaintIcon = c => L.divIcon({ className: "", html: `<div class="c-pin">${C_EMOJI[c.cat] || "⚠️"}</div>`, iconSize: [30, 30], iconAnchor: [15, 15] });

/* ---------- Карта страны: все города, цвет — текущий AQI в центре города ---------- */
let mapMode = "city";
const countryAir = { status: "idle", live: false, byCity: {}, at: 0 };
async function loadCountryAir() {
  if (countryAir.status === "loading" || (countryAir.status !== "idle" && Date.now() - countryAir.at < 10 * 60e3)) return;
  countryAir.status = "loading";
  const ids = CITY_ORDER, lat = ids.map(id => CITIES[id].center[0]).join(","), lon = ids.map(id => CITIES[id].center[1]).join(",");
  try {
    const res = await fetchJSON(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5&timezone=auto`);
    const arr = Array.isArray(res) ? res : [res];
    ids.forEach((id, i) => { countryAir.byCity[id] = { aqi: aqiOf(arr[i] && arr[i].current && arr[i].current.us_aqi), pm25: arr[i] && arr[i].current ? arr[i].current.pm2_5 : null }; });
    countryAir.live = true; countryAir.status = "ok";
  } catch (e) {
    console.warn("Open-Meteo (страна) недоступен — без выдуманных значений:", e.message);
    countryAir.byCity = {}; countryAir.live = false; countryAir.status = "nodata";
  }
  countryAir.at = Date.now();
  if ((location.hash || "").startsWith("#map") && mapMode === "country") route(true);
}
function viewCountry(el) {
  if (countryAir.status === "idle" || countryAir.status === "loading") {
    el.innerHTML = `<h1>${ctryT("countryTitle")}</h1><p class="sub">${t("loading")}</p><div class="skeleton"></div>`;
    loadCountryAir(); return;
  }
  if (countryAir.status === "nodata") {
    el.innerHTML = `<h1>${ctryT("countryTitle")}</h1><div class="card nodata"><div style="font-size:42px">📡</div><p class="sub">${Q("ctryNd")}</p><button class="btn" id="ndRetry">${Q("retry")}</button> <button class="btn ghost" id="backCity">${t("backToCity")}</button></div>`;
    $("#ndRetry").onclick = () => { countryAir.status = "idle"; route(true); };
    $("#backCity").onclick = () => { mapMode = "city"; route(true); };
    return;
  }
  const list = CITY_ORDER.map(id => ({ id, c: CITIES[id], a: countryAir.byCity[id].aqi })).sort((x, y) => byAqiDesc(x.a, y.a));
  el.innerHTML = `
    <div class="row between" style="align-items:flex-end"><div><h1>${ctryT("countryTitle")}</h1><p class="sub" style="margin-bottom:10px">${t("countrySub")}</p></div></div>
    <div class="map-grid"><div class="map-col">
    <div id="mapEl"></div>
    <div class="toggles"><div class="toggle" id="backCity">${t("backToCity")}</div></div>
    <div class="legend">${AQI_LEVELS.slice(0, 5).map(l => `<span style="background:${l.color}">${tr(l.name)}</span>`).join("")}</div>
    </div><div class="list-col">
    <h2>${t("citiesList")}</h2>
    <div class="card dlist">
      ${list.map(({ id, c, a }) => { const Lv = level(a);
        return `<div class="item" data-city="${id}" style="cursor:pointer"><div class="badge" style="background:${Lv.color}">${aqiTxt(a)}</div>
          <div style="flex:1"><div class="name">${c.emoji} ${tr(c.name)}</div><div class="small muted" style="font-weight:700">${tr(Lv.name)}</div></div>
          <span class="chip">${t("openCity")} →</span></div>`; }).join("")}
    </div></div></div>
    <div class="foot">${countryAir.live ? t("countryNote") : t("countryDemo")}</div>
  `;
  map = mkMap("mapEl", { zoomControl: true, zoomSnap: 0.25 });
  baseTiles(map);
  const M = map;
  const ctB = L.latLngBounds(CITY_ORDER.map(id => CITIES[id].center)).pad(0.06);
  M.fitBounds(ctB, { padding: [8, 8] }); M.setMinZoom(Math.max(2, M.getBoundsZoom(ctB) - 1));
  M.setMaxBounds(ctB.pad(0.6));   // v56: карта страны — только Кыргызстан
  setTimeout(() => { if (map === M && mapMode === "country") { M.invalidateSize(); M.fitBounds(ctB, { padding: [8, 8] }); } }, 350);
  /* пины городов: приоритет — текущий город, затем порядок списка (крупные первыми). При наложении пинов младшие
   * объединяются в старший (бейдж «+n», по нажатию — список городов); подписи, которые пересекаются, скрываются до приближения. */
  const sz = () => (M.getSize().x < 560 ? 26 : 32);
  const cps = CITY_ORDER.map((id, i) => { const c = CITIES[id], a = countryAir.byCity[id].aqi, Lv = level(a), nm = tr(c.short || c.name);
    const mk = L.marker(c.center, { icon: L.divIcon({ className: "", html: `<div class="city-pin ${id === CITY ? "cur" : ""}"><div class="aqi-pin" style="background:${Lv.color}">${aqiTxt(a)}</div><span>${esc(nm)}</span><b class="cp-n" hidden></b></div>`, iconSize: [sz(), sz()], iconAnchor: [sz() / 2, sz() / 2] }), title: `${tr(c.name)} · AQI ${a}`, riseOnHover: true });
    const o = { id, mk, pr: id === CITY ? -1 : i, nm, grp: [] };
    mk.on("click", () => { if (o.grp.length) { L.popup({ className: "cp-pop" }).setLatLng(c.center).setContent([o, ...o.grp].map(x => `<a href="#" data-c="${x.id}">${CITIES[x.id].emoji} ${esc(tr(CITIES[x.id].name))} — ${aqiTxt(countryAir.byCity[x.id].aqi)}</a>`).join("")).openOn(M); } else openCityFromCountry(id); });
    mk.addTo(M); return o; }).sort((x, y) => x.pr - y.pr);
  M.on("popupopen", e => e.popup.getElement()?.querySelectorAll("[data-c]").forEach(a => a.onclick = ev => { ev.preventDefault(); M.closePopup(); openCityFromCountry(a.dataset.c); }));
  const tw = s => s.length * 6.4 + 14, hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const layout = () => { if (M !== map) return; const r = sz() / 2, acc = [], boxes = [];
    cps.forEach(o => { o.grp = []; const p = M.latLngToContainerPoint(CITIES[o.id].center); o.p = p;
      const host = acc.find(h => h.p.distanceTo(p) < r * 1.5);
      if (host) { host.grp.push(o); o.hidden = true; } else { o.hidden = false; acc.push(o); boxes.push({ x: p.x - r, y: p.y - r, w: 2 * r, h: 2 * r }); } });
    const lb = [];
    acc.forEach(o => { const w = tw(o.nm), b = { x: o.p.x - w / 2, y: o.p.y + r + 2, w, h: 16 };
      o.nol = lb.some(x => hit(x, b)) || boxes.some((x, i) => acc[i] !== o && hit(x, b)); if (!o.nol) lb.push(b); });
    cps.forEach(o => { const e = o.mk.getElement(); if (!e) return; e.style.display = o.hidden ? "none" : ""; const cp = e.firstElementChild; cp.classList.toggle("nol", !!o.nol);
      const n = cp.querySelector(".cp-n"); n.hidden = !o.grp.length; n.textContent = "+" + o.grp.length; }); };
  let lt = 0; M.on("zoomend moveend resize", () => { clearTimeout(lt); lt = setTimeout(layout, 60); }); M.whenReady(layout); setTimeout(layout, 80);
  $("#backCity").onclick = () => { mapMode = "city"; route(true); };
  el.querySelectorAll("[data-city]").forEach(x => x.onclick = () => { window.scrollTo(0, 0); openCityFromCountry(x.dataset.city); });
  setTimeout(() => map && map.invalidateSize(), 50);
}
function openCityFromCountry(id) {
  const m = map;
  const go = () => { if (m && m === map) m.stop(); mapMode = "city"; if (id === CITY) route(true); else switchCity(id); };
  if (m) { m.flyTo(CITIES[id].center, 11, { duration: 0.6 }); m.once("moveend", () => setTimeout(go, 50)); setTimeout(() => { if (mapMode === "country" && m === map) go(); }, 1200); } else go();
}

function distListHTML(arr) {
  const r = DISTRICTS.map(d => ({ d, a: air.byDistrict[d.id].aqi })).sort((x, y) => byAqiDesc(x.a, y.a)).map(({ d, a }) => {
    const Lv = level(a);
    return `<div class="item"><div class="badge" style="background:${Lv.color}">${aqiTxt(a)}</div>
      <div style="flex:1"><div class="name">${esc(dName(d))}</div><div class="small muted" style="font-weight:700">${tr(Lv.name)} · ${tr(DTYPE[d.type])}</div></div>
      <div class="small muted" style="font-weight:800">🔥 ${d.coalShare == null ? "—" : Math.round(d.coalShare * 100) + "%"}</div></div>`;
  });
  return arr ? r : r.join("");
}
function viewMap(el) {
  if (mapMode === "country") return viewCountry(el);
  el.innerHTML = `
    <div class="row between" style="align-items:flex-start"><div><h1>${t("mapTitle")}</h1><p class="sub">${t("mapSub")}</p></div>
      <button class="btn ghost country-btn" id="countryBtn">${ctryT("countryBtn")}</button></div>
    <div class="map-grid"><div class="map-col">
    <div id="mapEl"></div>
    <div class="toggles">
      <div class="toggle ${mapLayers.smog ? "on" : ""}" data-layer="smog">${t("layerSmog")}</div>
      <div class="toggle ${mapLayers.complaints ? "on" : ""}" data-layer="complaints">${t("layerComplaints")}</div>
      <div class="toggle ${mapLayers.routes ? "on" : ""}" data-layer="routes">${t("layerRoutes")}</div>
    </div>
    <div class="legend">${AQI_LEVELS.slice(0, 5).map(l => `<span style="background:${l.color}">${tr(l.name)}</span>`).join("")}</div>
    </div><div class="list-col">
    <h2>${t("districtsList")}</h2>
    <div class="card dlist">
      <div class="dl-items"></div>
      <div class="small muted" style="font-weight:700;margin-top:6px">${t("coalShareNote")}</div>
    </div></div></div>
    ${footer()}
  `;
  $("#countryBtn").onclick = () => { mapMode = "country"; route(true); };
  map = mkMap("mapEl", { zoomControl: true, zoomSnap: 0.25 }).setView(cityObj().center, cityObj().zoom || 12);
  baseTiles(map);
  map.fitBounds(L.latLngBounds(DISTRICTS.map(d => [d.lat, d.lon])).pad(CITY === "bishkek" ? 0.04 : 0.3));

  const layers = { smog: L.layerGroup(), complaints: L.layerGroup(), routes: L.layerGroup() };
  // районы: круги-«пятна» (canvas) + метки AQI; кластеры пересчитываются только на zoomend/moveend (с задержкой) и только в видимой области
  const R0 = cityObj().radius || 900, M = map;
  const nn = d => { let m = 1e9; for (const x of DISTRICTS) if (x !== d) m = Math.min(m, kmDist(d, x) * 1000); return m; };
  const pinIcon = (txt, c, sz, cl) => L.divIcon({ className: "", html: `<div class="aqi-pin${cl ? " aqi-cl" : ""}" style="width:${sz}px;height:${sz}px;background:${c}">${txt}</div>`, iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2] });
  const popD = d => { const a = air.byDistrict[d.id], Lv = level(a.aqi); return `<b>${esc(dName(d))}</b>${d.grp && typeof GRP_NAME !== "undefined" ? `<br><small>${esc(tr(GRP_NAME[d.grp]))}</small>` : ""}<br>US AQI: <b style="color:${Lv.color}">${aqiTxt(a.aqi)}</b> — ${tr(Lv.name)}<br>PM2.5: ${fmt(a.pm25, 1)}<br>${t("popupCoal")}: ${d.coalShare == null ? "—" : Math.round(d.coalShare * 100) + "%"}${a.sDrop ? `<br><small style="color:#9a6b12">⚠️ ${({ ru: "датчик рядом исключён как сбойный", ky: "жакынкы датчик бузук катары эсепке алынган жок", en: "a nearby sensor was excluded as faulty" })[LANG] || "датчик рядом исключён как сбойный"}</small>` : ""}`; };
  const MSu = window.MS_STYLE && typeof msSmog === "function" ? msSmog(M, layers.smog, popD) : null, smogT = MSu ? L.layerGroup() : layers.smog;   /* прототипы стилей ?mapstyle= */
  const circ = new Map(), pins = new Map(), pinG = L.layerGroup().addTo(smogT);
  let sat = baseMode() !== "osm";
  const cStyle = d => { const c = level(air.byDistrict[d.id].aqi).color; return { color: sat ? "#fff" : c, weight: sat ? 1.5 : 1, fillColor: c, fillOpacity: sat ? 0.38 : 0.3 }; };
  const syncCircles = () => MSu ? 0 : DISTRICTS.forEach(d => { const o = circ.get(d.id);
    if (o) o.setStyle(cStyle(d)); else circ.set(d.id, L.circle([d.lat, d.lon], { radius: Math.max(250, Math.min(R0, nn(d) * 0.55)), interactive: false, ...cStyle(d) }).addTo(smogT)); });
  syncCircles();
  M.on("basemode", e => { sat = e.mode !== "osm"; circ.forEach((o, id) => { const d = DISTRICTS.find(x => x.id === id); d && o.setStyle(cStyle(d)); }); });
  const drawPins = () => {
    if (M !== map || !M._loaded || MSu) return;
    const many = DISTRICTS.length > 24, z = M.getZoom(), R = many && z < 15 ? 40 : 0, cls = [], vb = M.getBounds().pad(0.2);
    DISTRICTS.filter(d => vb.contains([d.lat, d.lon])).map(d => ({ d, p: M.latLngToLayerPoint([d.lat, d.lon]) })).sort((x, y) => byAqiDesc(air.byDistrict[x.d.id].aqi, air.byDistrict[y.d.id].aqi)).forEach(o => {
      const c = R && cls.find(c => c.p.distanceTo(o.p) < R); if (c) c.m.push(o.d); else cls.push({ p: o.p, m: [o.d] }); });
    const want = new Set();
    cls.forEach(c => {
      if (c.m.length === 1) { const d = c.m[0], a = air.byDistrict[d.id].aqi, k = "d:" + d.id; want.add(k);
        let mk = pins.get(k); if (mk && mk._aqi !== a) { mk.setIcon(pinIcon(aqiTxt(a), level(a).color, 38)); mk._aqi = a; }
        if (!mk) { mk = L.marker([d.lat, d.lon], { icon: pinIcon(aqiTxt(a), level(a).color, 38) }).bindPopup(() => popD(d)); mk._aqi = a; mk._did = d.id; pins.set(k, mk); }
        if (!pinG.hasLayer(mk)) mk.addTo(pinG); return; }
      const v = c.m.map(d => air.byDistrict[d.id].aqi).filter(x => x != null), mx = v.length ? Math.max(...v) : null, Lv = level(mx), ll = L.latLngBounds(c.m.map(d => [d.lat, d.lon])), k = "c:" + mx + ":" + c.m.map(d => d.id).join(","); want.add(k);
      if (!pins.has(k)) pins.set(k, L.marker(ll.getCenter(), { icon: pinIcon(`${aqiTxt(mx)}<small>×${c.m.length}</small>`, Lv.color, 44, 1), title: c.m.map(dName).join(", ") })
        .bindPopup(() => `<b>${c.m.length} · max AQI ${aqiTxt(mx)}</b><br>${c.m.slice(0, 12).map(d => `${esc(dName(d))}: ${aqiTxt(air.byDistrict[d.id].aqi)}`).join("<br>")}${c.m.length > 12 ? "<br>…" : ""}<br><a href="#" class="cl-zoom">🔍 +</a>`)
        .on("popupopen", e => { const z = e.popup.getElement()?.querySelector(".cl-zoom"); if (z) z.onclick = ev => { ev.preventDefault(); M.closePopup(); M.fitBounds(ll.pad(0.3)); }; })
        .on("dblclick", () => M.fitBounds(ll.pad(0.3))));
      const mk = pins.get(k); if (!pinG.hasLayer(mk)) mk.addTo(pinG);
    });
    pinG.eachLayer(l => { for (const [k, v] of pins) if (v === l && !want.has(k)) { pinG.removeLayer(l); if (k[0] === "c") pins.delete(k); break; } });
  };
  let dT = 0; const drawSoon = () => { clearTimeout(dT); dT = setTimeout(drawPins, 120); };
  M.on("zoomend moveend", drawSoon); M.whenReady(drawPins);
  /* обновление данных на месте (догрузка дальних районов) — без пересоздания карты */
  window.mapUpdate = () => { if (M !== map || !document.body.contains(M.getContainer())) return false; syncCircles(); drawPins(); if (MSu) MSu();
    const di = el.querySelector(".dl-items"); if (di) di.innerHTML = distListHTML(); return true; };
  /* фокус на районе (из глобального поиска) */
  window.mapFocus = id => { const d = DISTRICTS.find(x => x.id === id); if (!d || M !== map) return; if (MSu && window.msFocus) return msFocus(d);
    M.flyTo([d.lat, d.lon], Math.max(15, M.getZoom()), { duration: LOWEND ? 0 : 0.6 });
    M.once("moveend", () => { if (M !== map) return; const op = () => { if (M !== map) return; drawPins(); const mk = MSu ? null : pins.get("d:" + id); mk ? mk.openPopup() : L.popup().setLatLng([d.lat, d.lon]).setContent(popD(d)).openOn(M); };
      op(); window.__gsFocus = null; setTimeout(() => { if (M === map && !M.getContainer().querySelector(".leaflet-popup")) op(); }, 700); }); };
  // список районов и второстепенные слои — в свободное время браузера (не мешают первой отрисовке карты)
  { const items = distListHTML(true); let i = 0; const step = () => { const di = el.querySelector(".dl-items"); if (!di || M !== map || i >= items.length) return;
      di.insertAdjacentHTML("beforeend", items.slice(i, i += 25).join("")); idle(step, 400); }; idle(step, 300); }
  idle(() => { if (M !== map) return;
  allComplaints().forEach(c => L.marker([c.lat, c.lon], { icon: complaintIcon(c) }).bindPopup(() => complaintPopup(c), { maxWidth: 220 }).addTo(layers.complaints));
  ECO_ROUTES.forEach(r => L.polyline(r.path, { color: r.color, weight: 6, opacity: 0.9, dashArray: r.mode === "bike" ? "1 10" : null, lineCap: "round" })
    .bindPopup(() => `<b>${tr(r.name)}</b><br>${r.mode === "walk" ? t("rWalk") : t("rBike")} · ${t("rKm", { n: fmt(routeKm(r), 1) })}`).addTo(layers.routes));
  });
  Object.keys(layers).forEach(k => { if (mapLayers[k]) layers[k].addTo(map); });
  el.querySelectorAll(".toggle").forEach(tg => tg.onclick = () => {
    const k = tg.dataset.layer; mapLayers[k] = !mapLayers[k]; tg.classList.toggle("on", mapLayers[k]);
    mapLayers[k] ? layers[k].addTo(map) : map.removeLayer(layers[k]);
  });
  if (typeof stAttach === "function") idle(() => { if (map === M) try { stAttach(el); } catch (e) { console.warn("stations layer:", e); } });
  setTimeout(() => { map && map.invalidateSize(); if (window.__gsFocus && Date.now() - (window.__gsFocusAt || 0) < 20000) mapFocus(window.__gsFocus); else window.__gsFocus = null; }, 60);
}

/* ---------------- 3. Мой дом: калькулятор ----------------
 * ДОПУЩЕНИЯ (упрощённые, прозрачные, для оценки порядка величин):
 *  Уголь: теплота сгорания ≈ 18.8 ГДж/т (≈4500 ккал/кг, типичный уголь Кара-Кече) = 5.2 МВт·ч/т;
 *   КПД печи/котла ≈ 55% → полезное тепло ≈ 2.9 МВт·ч/т; CO₂ ≈ 1.8 т/т (≈95 кг/ГДж);
 *   PM2.5 ≈ 6 кг/т (≈300 г/ГДж, бытовые печи, порядок EMEP/EEA).
 *  Электричество: тариф ≈ 2 сом/кВт·ч (усреднённо, с учётом повышенного тарифа зимой);
 *   выбросы сети ≈ 0.1 кг CO₂/кВт·ч (≈90% выработки КР — ГЭС).
 *  Утепление: ≈1100 сом/м² площади дома, −40% потребности в тепле.
 *  Тепловой насос воздух-вода: 180 000 сом + 1 800 сом/м², COP ≈ 2.7, заменяет 100% угля.
 *  Солнечные панели: площадь/20 кВт (3–10), 48 000 сом/кВт + 60 000 сом за 2 инверторных
 *   кондиционера на обогрев (COP 2.5, закрывают 50% тепла). Выработка 1350 кВт·ч/кВт/год,
 *   30% — в отопительный сезон; летом до 2500 кВт·ч идёт на нужды дома.
 *  Деревья: ≈22 кг CO₂ в год на одно взрослое дерево.
 */
const K = {
  heatPerT: 2.9, co2PerT: 1.8, pmPerT: 6, tariff: 2.0, gridCO2: 0.0001 /* т/кВт·ч */, treeKg: 22,
  insulPerM2: 1100, insulShare: 0.40,
  hpBase: 180000, hpPerM2: 1800, hpCOP: 2.7,
  pvPerKw: 48000, pvSplits: 60000, pvYield: 1350, pvWinter: 0.30, pvSelfUseMax: 2500, splitCOP: 2.5, splitShare: 0.5,
  groupDiscount: 0.20,
};
const K_BASE = { ...K };
function calc(h) {
  const { area, coal, price } = h;
  const disc = 1;
  const heatMWh = coal * K.heatPerT;
  const baseline = { cost: coal * price, co2: coal * K.co2PerT, pm: coal * K.pmPerT };
  const share = h.insulShare ?? K.insulShare;
  const insul = (() => {
    const cost = area * K.insulPerM2 * disc; const coalSaved = coal * share;
    return { id: "insul", cost, coalSaved, save: coalSaved * price, co2: coalSaved * K.co2PerT, pm: coalSaved * K.pmPerT };
  })();
  const pump = (() => {
    const cost = (K.hpBase + K.hpPerM2 * area) * disc; const kwh = heatMWh * 1000 / K.hpCOP;
    return { id: "pump", cost, coalSaved: coal, kwh, save: coal * price - kwh * K.tariff, co2: coal * K.co2PerT - kwh * K.gridCO2, pm: coal * K.pmPerT };
  })();
  const solar = (() => {
    const kw = Math.min(10, Math.max(3, Math.round(area / 20)));
    const cost = (kw * K.pvPerKw + K.pvSplits) * disc; const gen = kw * K.pvYield;
    const coalSaved = coal * K.splitShare;
    const heatKwh = heatMWh * K.splitShare * 1000 / K.splitCOP;
    const gridKwh = Math.max(0, heatKwh - gen * K.pvWinter);
    const summer = Math.min(gen * (1 - K.pvWinter), K.pvSelfUseMax);
    return { id: "solar", kw, cost, coalSaved, save: coalSaved * price - gridKwh * K.tariff + summer * K.tariff,
      co2: coalSaved * K.co2PerT - gridKwh * K.gridCO2 + summer * K.gridCO2, pm: coalSaved * K.pmPerT };
  })();
  const opts = [solar, pump, insul].map(o => ({ ...o, payback: o.save > 0 ? o.cost / o.save : Infinity, trees: o.co2 * 1000 / K.treeKg }));
  return { baseline, opts };
}
const OPT_META = { solar: { icon: "☀️", bg: "#fff3c4" }, pump: { icon: "🌡️", bg: "#dff1fb" }, insul: { icon: "🧱", bg: "#e3f5e8" } };

function viewHouse(el) {
  const h = state.house;
  el.innerHTML = `
    <h1>${t("houseTitle")}</h1>
    <p class="sub">${t("houseSub")}</p>
    <a href="#advisor" class="card adv-cta">${t("advisorCta")} →</a>
    <div class="card">
      <div class="inputs">
        <div class="full"><label for="area">${t("areaLbl")}</label>
          <div class="range-row"><input type="range" id="area" min="30" max="300" step="5" value="${h.area}"><output id="areaO">${h.area} ${t("u_insul")}</output></div></div>
        <div><label for="coal">${t("coalLbl")}</label><input type="number" id="coal" min="0.5" max="30" step="0.5" value="${h.coal}"></div>
        <div><label for="price">${t("priceLbl")}</label><input type="number" id="price" min="1000" max="30000" step="100" value="${h.price}"></div>
      </div>
    </div>
    <div id="results"></div>
    <details class="card how"><summary>${t("howTitle")}</summary><ul>${t("how").map(x => `<li>${x}</li>`).join("")}</ul></details>
  `;
  const upd = () => {
    h.area = +$("#area").value; h.coal = Math.max(0, +$("#coal").value || 0); h.price = Math.max(0, +$("#price").value || 0);
    $("#areaO").textContent = h.area + " " + t("u_insul"); save(); renderResults();
  };
  ["area", "coal", "price"].forEach(id => $("#" + id).addEventListener("input", upd));
  renderResults();
}
function renderResults() {
  const { baseline, opts } = calc(state.house);
  const best = opts.filter(o => isFinite(o.payback)).sort((a, b) => a.payback - b.payback)[0];
  $("#results").innerHTML = `
    <div class="card baseline">
      <div class="row between"><b>${t("nowCoal")}</b><span class="chip" style="background:rgba(255,255,255,.15);color:#fff">${t("perWinter")}</span></div>
      <div class="stat-grid" style="margin-top:10px">
        <div class="stat"><div class="k">${t("spend")}</div><div class="v">${som(baseline.cost)}</div></div>
        <div class="stat"><div class="k">CO₂</div><div class="v">${fmt(baseline.co2, 1)} ${t("t")}</div></div>
        <div class="stat"><div class="k">${t("pmDust")}</div><div class="v">${fmt(baseline.pm, 0)} ${t("kg")}</div></div>
        <div class="stat"><div class="k">${t("likeCar")}</div><div class="v">${years(baseline.co2 / 2.0)}</div></div>
      </div>
      <div class="small" style="color:#e8dccf;margin-top:8px;font-weight:700">${t("likeCarNote")}</div>
    </div>
    <h2>${t("threePaths")}</h2>
    ${opts.map(o => {
      const m = OPT_META[o.id]; const pb = isFinite(o.payback) ? o.payback : 99;
      return `<div class="card opt ${state.plan === o.id ? "chosen" : ""}">
        ${best && best.id === o.id ? `<span class="chip sun best">${t("fastest")}</span>` : ""}
        <div class="head"><div class="ico" style="background:${m.bg}">${m.icon}</div>
          <div><div class="title">${t("o_" + o.id)}</div><div class="desc">${t("d_" + o.id, { kw: o.kw })}</div></div></div>
        <div class="grid">
          <div class="m"><div class="k">${t("cost")}</div><div class="v">${som(o.cost)}</div></div>
          <div class="m"><div class="k">${t("savingsYr")}</div><div class="v" style="color:${o.save > 0 ? "var(--green-700)" : "#c9303a"}">${som(o.save)}</div></div>
          <div class="m"><div class="k">${t("payback")}</div><div class="v">${isFinite(o.payback) ? years(o.payback) : "—"}</div></div>
          <div class="m"><div class="k">${t("lessCoal")}</div><div class="v">${t("tPerYr", { n: fmt(o.coalSaved, 1) })}</div></div>
          <div class="m"><div class="k">${t("lessCO2pm")}</div><div class="v">${fmt(o.co2, 1)} ${t("t")} / ${fmt(o.pm, 0)} ${t("kg")}</div></div>
          <div class="m"><div class="k">${t("likePlant")}</div><div class="v">${t("treesN", { n: fmt(o.trees) })}</div></div>
        </div>
        <div class="payback-bar"><div style="width:${Math.max(5, 100 - pb / 25 * 100)}%"></div></div>
        <button class="btn block ${state.plan === o.id ? "done" : ""}" style="margin-top:12px" data-plan="${o.id}">${state.plan === o.id ? t("myPlan") : t("choosePlan")}</button>
      </div>`;
    }).join("")}
  `;
  document.querySelectorAll("[data-plan]").forEach(b => b.onclick = () => { state.plan = b.dataset.plan; save(); renderResults(); toast(t("planSaved")); });
}

/* v54: «Вместе дешевле» (групповые закупки) удалено — выдуманные данные без сервера. */

/* ---------------- 5. ИИ-советник (правила, без ключа) ----------------
 * Движок: 4 ответа → расчёт через calc() + доп. правила:
 *  - стены: кирпич/шлакоблок теряют больше тепла → утепление даёт 45%, саман 30%, дерево 40%;
 *  - «первый шаг» (чердак+окна): ~450 сом/м², −20% угля;
 *  - комбо утепление+насос: насос под меньшую нагрузку (≈80% цены), электричество только на
 *    оставшееся тепло; комбо утепление+солнце: кондиционеры закрывают 50% оставшегося тепла.
 *  Выбор: из вариантов в рамках бюджета — тот, что убирает больше угля; при равенстве (±10%)
 *  — с более быстрой окупаемостью. Если ничего не влезает — «первый шаг».
 */
const BUDGETS = { bud1: 100000, bud2: 300000, bud3: 600000, bud4: 1500000 };
const WALL_SHARE = { brick: 0.45, block: 0.45, adobe: 0.30, wood: 0.40 };
function advise(ans) {
  const price = state.house.price;
  const h = { area: ans.area, coal: ans.coal, price, group: false, insulShare: WALL_SHARE[ans.wall] };
  const o = Object.fromEntries(calc(h).opts.map(x => [x.id, x]));
  const heatMWh = ans.coal * K.heatPerT, share = WALL_SHARE[ans.wall];
  const mk = (id, cost, coalSaved, kwh, extraSave = 0) => {
    const save = coalSaved * price - kwh * K.tariff + extraSave;
    const co2 = coalSaved * K.co2PerT - kwh * K.gridCO2;
    return { id, cost, coalSaved, save, co2, pm: coalSaved * K.pmPerT, payback: save > 0 ? cost / save : Infinity, trees: co2 * 1000 / K.treeKg, kw: o.solar.kw };
  };
  const partial = mk("partial", ans.area * 450, ans.coal * 0.20, 0);
  const insul = mk("insul", o.insul.cost, o.insul.coalSaved, 0);
  const insulPump = mk("insul_pump", o.insul.cost + 0.8 * o.pump.cost, ans.coal, heatMWh * (1 - share) * 1000 / K.hpCOP);
  const rest = 1 - share;
  const splitKwh = heatMWh * rest * K.splitShare * 1000 / K.splitCOP;
  const gen = o.solar.kw * K.pvYield;
  const insulSolar = mk("insul_solar", o.insul.cost + o.solar.cost, ans.coal * (share + rest * K.splitShare),
    Math.max(0, splitKwh - gen * K.pvWinter), Math.min(gen * (1 - K.pvWinter), K.pvSelfUseMax) * K.tariff);
  const cands = [partial, insul, insulSolar, insulPump].filter(x => x.cost <= BUDGETS[ans.budget] && isFinite(x.payback));
  let rec = partial;
  if (cands.length) {
    const maxCoal = Math.max(...cands.map(x => x.coalSaved));
    rec = cands.filter(x => x.coalSaved >= maxCoal * 0.9).sort((a, b) => a.payback - b.payback)[0];
  }
  return { rec, ans };
}
function recHTML(r) {
  const x = r.rec;
  const why = x.id === "partial" ? t("whyLow", { b: t(r.ans.budget) }) : x.id === "insul" ? t("whyInsul") : x.id === "insul_pump" ? t("whyPump") : t("whySolar");
  return `${t("recIntro", { plan: t("p_" + x.id) })}<br><br>${why} ${t("wn_" + r.ans.wall)}
    <div class="nums">
      <div>${t("n_cost", { v: som(x.cost) })}</div><div>${t("n_save", { v: som(x.save) })}</div>
      <div>${t("n_pay", { v: years(x.payback) })}</div>
      <div>${t("n_coal", { v: fmt(x.coalSaved, 1), p: Math.round(x.coalSaved / r.ans.coal * 100) })}</div>
      <div>${t("n_trees", { v: fmt(x.trees) })}</div>
    </div>
    <b>${t("stepsHdr")}</b><ol>${t("s_" + x.id).map(s => `<li>${s.replace("{kw}", x.kw)}</li>`).join("")}</ol>`;
}
const ADV_STEPS = [
  { key: "area", q: "qArea", opts: [60, 100, 150, 200].map(v => ({ v, l: () => `${v} ${t("u_insul")}` })) },
  { key: "wall", q: "qWall", opts: ["brick", "adobe", "block", "wood"].map(v => ({ v, l: () => t("w_" + v) })) },
  { key: "coal", q: "qCoal", opts: [3, 5, 8, 12].map(v => ({ v, l: () => `${v} ${t("t")}` })) },
  { key: "budget", q: "qBudget", opts: ["bud1", "bud2", "bud3", "bud4"].map(v => ({ v, l: () => t(v) })) },
];
/* Диалог хранится структурой (ключи, а не готовый текст), поэтому переводится при смене языка. */
let adv = { answers: {}, step: 0, extra: [], result: null };
const LLM_STORE = "tazaAba.llm";
const llmCfg = () => { try { return JSON.parse(localStorage.getItem(LLM_STORE) || "{}"); } catch { return {}; } };
const botMsg = html => `<div class="bot-ava"><div class="a">🌻</div><div class="msg bot">${html}</div></div>`;
const meMsg = txt => `<div class="msg me">${esc(txt)}</div>`;

function viewAdvisor(el) {
  const cfg = llmCfg();
  let chat = botMsg(t("advHello"));
  ADV_STEPS.forEach((s, i) => {
    if (i > adv.step) return;
    chat += botMsg(t(s.q));
    if (adv.answers[s.key] != null) chat += meMsg(s.opts.find(o => o.v === adv.answers[s.key]).l());
  });
  if (adv.result) chat += `<div class="bot-ava"><div class="a">🌻</div><div class="msg bot rec">${recHTML(adv.result)}</div></div>`;
  adv.extra.forEach(m => { chat += m.me ? meMsg(m.text) : botMsg(m.key ? t(m.key) : m.html); });
  let chips = "";
  if (!adv.result && adv.step < ADV_STEPS.length) chips = ADV_STEPS[adv.step].opts.map(o => `<button data-ans="${o.v}">${o.l()}</button>`).join("");
  else if (adv.result) chips = `<button class="primary" id="advApply">${t("apply")}</button><button id="advRestart">↺ ${t("restart")}</button>`;
  el.innerHTML = `
    <h1>🤖 ${t("advTitle")}</h1>
    <p class="sub">${t("advSub")}</p>
    <div class="rule-note">${cfg.key ? "🟢 " + t("llmOn") : t("ruleNote")}</div>
    <div class="chat" id="chat">${chat}</div>
    <div class="chips">${chips}</div>
    <form class="ask" id="askForm"><input id="askIn" aria-label="${esc(t("askPh"))}" placeholder="${t("askPh")}" autocomplete="off"><button class="btn" type="submit">→</button></form>
    <details class="card how" id="llmBox"><summary>${t("llmTitle")}</summary>
      <p class="small muted" style="font-weight:700">${t("llmNote")}</p>
      <label for="llmUrl">${t("baseUrl")}</label><input id="llmUrl" value="${esc(cfg.url || "https://api.openai.com/v1")}">
      <label for="llmModel">${t("model")}</label><input id="llmModel" value="${esc(cfg.model || "gpt-4o-mini")}">
      <label for="llmKey">${t("apiKey")}</label><input id="llmKey" type="password" value="${esc(cfg.key || "")}" placeholder="sk-…" autocomplete="off">
      <div class="row" style="margin-top:12px"><button class="btn" id="llmSave" style="flex:1">${t("saveBtn")}</button><button class="btn ghost" id="llmClear" style="flex:1">${t("clearBtn")}</button></div>
    </details>
  `;
  el.querySelectorAll("[data-ans]").forEach(b => b.onclick = () => {
    const s = ADV_STEPS[adv.step];
    adv.answers[s.key] = typeof s.opts[0].v === "number" ? +b.dataset.ans : b.dataset.ans;
    adv.step++;
    if (adv.step >= ADV_STEPS.length) {
      viewAdvisor(el); typing(); scrollChat();
      setTimeout(() => { adv.result = advise(adv.answers); if (location.hash === "#advisor") { viewAdvisor($("#view")); scrollChat(); } }, 700);
      return;
    }
    viewAdvisor(el); scrollChat();
  });
  const ap = $("#advApply"), rs = $("#advRestart");
  if (ap) ap.onclick = () => {
    const r = adv.result;
    state.house = { ...state.house, area: r.ans.area, coal: r.ans.coal };
    state.plan = r.rec.id === "insul_pump" ? "pump" : r.rec.id === "insul_solar" ? "solar" : "insul";
    save(); toast(t("applied")); location.hash = "#house";
  };
  if (rs) rs.onclick = () => { adv = { answers: {}, step: 0, extra: [], result: null }; viewAdvisor(el); };
  $("#askForm").onsubmit = async e => {
    e.preventDefault();
    const q = $("#askIn").value.trim(); if (!q) return;
    adv.extra.push({ me: true, text: q }); viewAdvisor(el); typing(); scrollChat();
    const reply = await answerFree(q);
    adv.extra.push(reply);
    if (location.hash === "#advisor") { viewAdvisor($("#view")); scrollChat(); }
  };
  $("#llmSave").onclick = () => {
    const c = { url: $("#llmUrl").value.trim().replace(/\/$/, ""), model: $("#llmModel").value.trim(), key: $("#llmKey").value.trim() };
    localStorage.setItem(LLM_STORE, JSON.stringify(c)); toast(t("llmSaved")); viewAdvisor(el);
  };
  $("#llmClear").onclick = () => { localStorage.removeItem(LLM_STORE); toast(t("llmSaved")); viewAdvisor(el); };
}
function typing() { const c = $("#chat"); if (c) c.insertAdjacentHTML("beforeend", `<div class="bot-ava"><div class="a">🌻</div><div class="msg bot typing"><span></span><span></span><span></span></div></div>`); }
function scrollChat() { const c = $(".ask"); if (c) c.scrollIntoView({ block: "end" }); }

/* Свободные вопросы: правила по ключевым словам (ru/ky/en); если пользователь сам ввёл ключ —
 * запрос уходит в OpenAI-совместимый /chat/completions по указанному им адресу. */
function ruleAnswer(q) {
  const s = q.toLowerCase();
  if (/кредит|насыя|loan|credit|банк|bank|рассроч/.test(s)) return { key: "a_credit" };
  if (/окуп|актан|payback|pay back|выгод/.test(s)) {
    if (!adv.result) return { key: "a_first" };
    return { html: t("a_pay", { plan: t("p_" + adv.result.rec.id), y: years(adv.result.rec.payback) }) };
  }
  if (/начать|начин|баштоо|башта|start|first|с чего/.test(s)) return { key: "a_start" };
  return { key: "a_fallback" };
}
async function answerFree(q) {
  const cfg = llmCfg();
  if (!cfg.key) { await new Promise(r => setTimeout(r, 500)); return ruleAnswer(q); }
  const langName = { ru: "Russian", ky: "Kyrgyz (Cyrillic)", en: "English" }[LANG];
  const ctx = adv.result ? `User home: ${JSON.stringify(adv.result.ans)}; rule-based recommendation: ${adv.result.rec.id}, cost ${Math.round(adv.result.rec.cost)} som, savings ${Math.round(adv.result.rec.save)} som/yr.` : "No home data yet.";
  try {
    const ctl = new AbortController(); setTimeout(() => ctl.abort(), 20000);
    const r = await fetch(cfg.url + "/chat/completions", {
      method: "POST", signal: ctl.signal,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + cfg.key },
      body: JSON.stringify({ model: cfg.model, temperature: 0.4, max_tokens: 400, messages: [
        { role: "system", content: `You are the Taza Aba advisor helping households in ${tr(cityObj().name)}, Kyrgyzstan quit coal heating (insulation, heat pumps, solar). Answer briefly and practically in ${langName}. Prices in Kyrgyz som. ${ctx}` },
        { role: "user", content: q }] }),
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    return { html: esc(j.choices[0].message.content).replace(/\n/g, "<br>") };
  } catch (e) {
    const fb = ruleAnswer(q);
    return { html: t("llmErr", { e: esc(e.message) }) + "<br>" + (fb.key ? t(fb.key) : fb.html) };
  }
}

/* ---------------- 6. Ещё ---------------- */
function viewMore(el) {
  const items = [
    ["#profile", "🧑‍🌾", "m_profile", "m_profileSub"], ["#complaints", "📸", "m_complaints", "m_complaintsSub"],
    ["#routes", "🚲", "m_routes", "m_routesSub"], ["#profile/alertsCard", "🔔", "m_alerts", "m_alertsSub"],
  ];
  el.innerHTML = `<h1>${t("moreTitle")}</h1><p class="sub">${t("moreSub")}</p>
    ${items.map(([h, e, a, b]) => `<a href="${h}" class="card more-item"><div class="mi">${e}</div><div style="flex:1"><b>${t(a)}</b><div class="small muted" style="font-weight:700">${t(b)}</div></div><span class="muted">›</span></a>`).join("")}
    <div class="foot">${t("footProto")}</div>`;
}

/* ---------------- 7. Профиль + уведомления ---------------- */
function viewProfile(el) {
  const d = byId(state.district);
  const { opts } = calc({ ...state.house });
  const plan = opts.find(o => o.id === state.plan) || opts[2];
  const k = state.switched ? 1 : 0;
  const badges = [
    { e: "🏡", n: t("b1"), on: state.switched },
    { e: "🧮", n: t("b3"), on: !!state.plan }, { e: "🌳", n: t("b4"), on: state.switched && plan.trees >= 100 },
  ];
  const al = state.alerts;
  const tomorrow = tomorrowMax(al.district);
  el.innerHTML = `
    <div class="card pro-head">
      <div class="avatar">🧑‍🌾</div>
      <div style="font-weight:900;font-size:20px">${esc(state.name || t("defaultName"))}</div>
      <div class="muted" style="font-weight:700">📍 ${esc(dName(d))} · ${t("planLbl", { p: t("o_" + plan.id).toLowerCase() })}</div>
    </div>

    <div class="card badge-big ${state.switched ? "" : "locked"}">
      <div class="medal">🏡</div>
      <div style="flex:1">
        <div style="font-weight:900;font-size:19px">${t("badgeName")}</div>
        <div style="font-weight:700;font-size:13px;opacity:.95">${state.switched ? t("badgeOn") : t("badgeOff")}</div>
        <button class="btn ${state.switched ? "ghost" : "sun"}" id="swBtn" style="margin-top:10px;padding:8px 12px;font-size:13px">${state.switched ? t("unmark") : t("mark")}</button>
      </div>
    </div>

    <div class="card" id="alertsCard">
      <div class="row between" style="align-items:flex-start">
        <div><b style="font-size:17px">${t("alertsTitle")}</b><div class="small muted" style="font-weight:700">${t("alertsSub")}</div></div>
        <label class="switch" title="${t("alertsOn")}"><input type="checkbox" id="alOn" ${al.on ? "checked" : ""}><span></span></label>
      </div>
      <div id="permMsg">${permHTML()}</div>
      <div class="inputs" style="margin-top:4px">
        <div><label for="alDist">${t("alertDistrict")}</label><select id="alDist">${districtOptions(al.district)}</select></div>
        <div><label for="alTh">${t("threshold")}</label><select id="alTh">${[50, 100, 150, 200].map(v => `<option value="${v}" ${v === al.threshold ? "selected" : ""}>${v === 50 ? t("th50") : v + " — " + tr(level(v).short).replace("*", "")}</option>`).join("")}</select></div>
      </div>
      ${tomorrow != null ? `<div class="small" style="font-weight:800;margin-top:10px;color:${level(tomorrow).color}">📅 ${t("tomorrowFc", { in: dLoc(byId(al.district)), aqi: tomorrow })}</div>` : ""}
      <button class="btn sun block" id="alTest" style="margin-top:12px">${t("testBtn")}</button>
      <div class="small muted" style="font-weight:700;margin-top:8px">${t("checkNote")}</div>
      ${(() => { const bot = (window.TAZA_CONFIG && TAZA_CONFIG.TELEGRAM_BOT || "").replace(/^@/, "");
        if (!bot) return "";   // v56: без бота блок скрыт (никаких инструкций владельцу)
        const head = `<hr style="border:0;border-top:1px dashed var(--line);margin:14px 0"><b style="font-size:15px">✈️ ${t("tgAlert")}</b><div class="small muted" style="font-weight:700;margin:4px 0 8px">${t("tgAlertSub")}</div>`;
        const start = encodeURIComponent(al.district || state.district);
        return head + `<a class="btn block" id="tgSub" href="https://t.me/${bot}?start=${start}" target="_blank" rel="noopener">${t("tgAlertGo")}</a>
          <div class="small muted" style="font-weight:700;margin-top:6px">${t("tgAlertHint")}</div>`; })()}
    </div>

    <h2>${t("myImpact")}</h2>
    <div class="stat-grid">
      <div class="stat"><div class="k">${t("coalNotBurned")}</div><div class="v">${fmt(plan.coalSaved * k, 1)} ${t("t")}</div></div>
      <div class="stat"><div class="k">${t("lessCO2")}</div><div class="v">${fmt(plan.co2 * k, 1)} ${t("t")}</div></div>
      <div class="stat"><div class="k">${t("lessPM")}</div><div class="v">${fmt(plan.pm * k, 0)} ${t("kg")}</div></div>
      <div class="stat"><div class="k">${t("likeTrees")}</div><div class="v">${fmt(plan.trees * k)}</div></div>
      <div class="stat" style="grid-column:1/-1;background:linear-gradient(135deg,#e1f5fe,#e9f7e6)"><div class="k">${t("familySave")}</div><div class="v">${som(plan.save * k)}</div></div>
    </div>

    <h2>${t("badgesT")}</h2>
    <div class="card badges">${badges.map(b => `<div class="${b.on ? "" : "off"}"><b>${b.e}</b>${b.n}</div>`).join("")}</div>


    <div class="card">
      <label for="pName" style="margin-top:0">${t("nameLbl")}</label><input id="pName" value="${esc(state.name)}">
      <label for="pDist">${t("myDistrict")}</label><select id="pDist">${districtOptions(state.district)}</select>
      <button class="btn ghost block" id="resetBtn" style="margin-top:14px">${t("reset")}</button>
    </div>
    <div class="foot">${t("profileFoot")}</div>
  `;
  $("#swBtn").onclick = () => { state.switched = !state.switched; save(); viewProfile(el); if (state.switched) toast(t("badgeToast")); };
  $("#pName").onchange = e => { state.name = e.target.value.trim() || t("defaultName"); save(); viewProfile(el); };
  $("#pDist").onchange = e => { state.district = e.target.value; save(); viewProfile(el); };
  $("#resetBtn").onclick = () => { localStorage.removeItem(STORE_KEY); phTx("readwrite", st => st.clear()).catch(() => { }); state = load(); viewProfile(el); toast(t("resetToast")); };
  $("#alOn").onchange = async e => {
    state.alerts.on = e.target.checked; save();
    if (state.alerts.on && "Notification" in window && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch (err) { console.warn(err); }
    }
    $("#permMsg").innerHTML = permHTML();
    state.alerts.sent = {}; save(); checkAlerts();
  };
  $("#alDist").onchange = e => { state.alerts.district = e.target.value; state.alerts.sent = {}; save(); viewProfile(el); checkAlerts(); };
  $("#alTh").onchange = e => { state.alerts.threshold = +e.target.value; state.alerts.sent = {}; save(); checkAlerts(); };
  $("#alTest").onclick = async () => {
    if ("Notification" in window && Notification.permission === "default") { try { await Notification.requestPermission(); } catch {} }
    $("#permMsg").innerHTML = permHTML();
    const aqi = Math.max(tomorrowMax(state.alerts.district) ?? 0, state.alerts.threshold);
    fireAlert(state.alerts.district, aqi, true);
  };
}

/* ---------------- Уведомления о смоге (Notification API, без service worker) ---------------- */
function permHTML() {
  if (!state.alerts.on) return "";
  if (!("Notification" in window)) return `<div class="perm bad">${t("permUnsupported")}</div>`;
  if (Notification.permission === "granted") return `<div class="perm">${t("permGranted")}</div>`;
  if (Notification.permission === "denied") return `<div class="perm bad">${t("permDenied")}</div>`;
  return "";
}
function tomorrowMax(districtId) {
  const a = air.byDistrict[districtId]; if (!a) return null;
  const f = dailyForecast(a); return f[1] ? f[1].max : null;
}
let banner = null;  // { district, aqi, test }
function renderBanner() {
  const b = $("#alertBanner");
  if (!banner) { b.classList.add("hidden"); return; }
  const body = (banner.test ? t("testPrefix") : "") + t("alertBody", { in: dLoc(byId(banner.district)), aqi: banner.aqi });
  b.innerHTML = `<span style="font-size:22px">😷</span><div>${t("alertTitle")}<small>${body}</small></div><button class="x" aria-label="×">×</button>`;
  b.classList.remove("hidden");
  $(".x", b).onclick = () => { banner = null; renderBanner(); };
}
function fireAlert(districtId, aqi, test) {
  banner = { district: districtId, aqi, test }; renderBanner();
  const body = (test ? t("testPrefix") : "") + t("alertBody", { in: dLoc(byId(districtId)), aqi });
  if ("Notification" in window && Notification.permission === "granted") {
    try { new Notification(t("alertTitle"), { body, tag: "taza-aba-smog", icon: document.querySelector("link[rel=icon]").href }); }
    catch (e) { console.warn("Notification недоступен в этом браузере, показан баннер:", e.message); }
  }
}
function checkAlerts() {
  const al = state.alerts;
  if (!al.on || air.status === "loading") return;
  const mx = tomorrowMax(al.district);
  if (mx == null || mx < al.threshold) return;
  const key = al.district + ":" + (air.byDistrict[al.district].currentTime || "").slice(0, 10) + ":" + al.threshold;
  if (al.sent[key]) { if (!banner) { banner = { district: al.district, aqi: mx, test: false }; renderBanner(); } return; }
  al.sent[key] = true; save();
  fireAlert(al.district, mx, false);
}
setInterval(() => { loadAir(); }, 30 * 60 * 1000);

/* ---------------- 8. Жалобы ---------------- */
let draft = { cat: "chimney", photo: null, lat: null, lon: null, text: "" };
function resizeImage(file) {   // фото сжимается до 640 px, чтобы поместиться в localStorage
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, 640 / Math.max(img.width, img.height));
        const c = document.createElement("canvas"); c.width = img.width * s; c.height = img.height * s;
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = rej; img.src = fr.result;
    };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
}
function nearestDistrict(lat, lon) {
  return DISTRICTS.reduce((b, d) => { const dd = (d.lat - lat) ** 2 + (d.lon - lon) ** 2; return dd < b.dd ? { d, dd } : b; }, { d: DISTRICTS[0], dd: 1e9 }).d;
}
function viewComplaints(el) {
  const cats = ["chimney", "trash", "dump", "car", "factory"];
  const st = [t("cStatusSent"), t("cStatusFwd"), t("cStatusDone")];
  el.innerHTML = `
    <h1>📸 ${t("cTitle")}</h1>
    <p class="sub">${t("cSub")}</p>
    <div class="card">
      <label class="photo-drop" for="cFile">${draft.photo ? `<img src="${draft.photo}" alt="">` : ""}<span>${draft.photo ? t("cPhotoChange") : t("cPhoto")}</span></label>
      <input type="file" id="cFile" accept="image/*" capture="environment" hidden>
      <label>${t("cCategory")}</label>
      <div class="cat-chips">${cats.map(c => `<button class="${draft.cat === c ? "on" : ""}" data-cat="${c}">${C_EMOJI[c]} ${t("cat_c_" + c)}</button>`).join("")}</div>
      <label for="cText">${t("cDesc")}</label><input id="cText" value="${esc(draft.text)}" placeholder="${t("cDescPh")}">
      <label>${t("cPlace")}</label>
      <div id="cMap" class="mini-map"></div>
      <button class="btn ghost block" id="cGeo" style="margin-top:8px">${t("cGeo")}</button>
      <button class="btn block" id="cSend" style="margin-top:10px">${t("cSubmit")}</button>
    </div>
    <h2>${t("cList")}</h2>
    ${allComplaints().length ? "" : `<div class="card muted c-empty" style="text-align:center;font-weight:700">${Q("cmpEmpty")}</div>`}
    ${allComplaints().map(c => `<div class="card c-item">
      <div class="c-thumb">${hasPhoto(c) ? phImg(c, 'alt=""') : (C_EMOJI[c.cat] || "⚠️")}</div>
      <div style="flex:1;min-width:0"><b>${t("cat_c_" + c.cat)}</b> <span class="chip">${t("cMine")}</span>
        <div class="small" style="font-weight:600;margin:2px 0">${esc(tr(c.text)) || "—"}</div>
        <div class="steps">${st.map((s, i) => `<span class="${i <= (c.status || 0) ? "on" : ""}">${s}</span>`).join("")}</div>
        <div class="small muted" style="font-weight:700;margin-top:4px">📍 ${esc(dName(nearestDistrict(c.lat, c.lon)))} · ${esc(fmtDay(c.date))}${c.mine ? ` · <a href="#" data-del="${c.id}" style="color:#c9303a">${t("cDelete")}</a>` : ""}</div>
      </div></div>`).join("")}
    <div class="foot">${t("cMock")}</div>
  `;
  map = mkMap("cMap", { zoomControl: false }).setView(cityObj().center, cityObj().zoom || 13);
  baseTiles(map);
  let pinM = null;
  const setPin = (lat, lon, fly) => {
    draft.lat = lat; draft.lon = lon;
    if (pinM) pinM.setLatLng([lat, lon]); else pinM = L.marker([lat, lon], { icon: complaintIcon({ cat: draft.cat }) }).addTo(map);
    if (fly) map.setView([lat, lon], 15);
  };
  if (draft.lat != null) setPin(draft.lat, draft.lon);
  map.on("click", e => setPin(e.latlng.lat, e.latlng.lng));
  setTimeout(() => map && map.invalidateSize(), 50);
  $("#cFile").onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { draft.photo = await resizeImage(f); } catch (err) { console.warn(err); }
    draft.text = $("#cText").value; viewComplaints(el);
  };
  el.querySelectorAll("[data-cat]").forEach(b => b.onclick = () => { draft.cat = b.dataset.cat; draft.text = $("#cText").value; const y = scrollY; viewComplaints(el); scrollTo(0, y); });
  $("#cGeo").onclick = () => {
    if (!navigator.geolocation) return toast(t("cGeoErr"));
    navigator.geolocation.getCurrentPosition(p => setPin(p.coords.latitude, p.coords.longitude, true), () => toast(t("cGeoErr")), { timeout: 8000 });
  };
  $("#cSend").onclick = () => {
    if (draft.lat == null) return toast(t("cNoPoint"));
    const c = { id: "u" + Date.now(), city: CITY, mine: true, lat: draft.lat, lon: draft.lon, cat: draft.cat, photo: draft.photo, text: $("#cText").value.trim(), status: 0, date: new Date().toISOString().slice(0, 10) };
    state.complaints.unshift(c); save();
    draft = { cat: "chimney", photo: null, lat: null, lon: null, text: "" };
    toast(t("cSent")); viewComplaints(el);
    // Имитация «передачи в службы»: через 4 секунды статус меняется на «передано».
    setTimeout(() => { const s = state.complaints.find(x => x.id === c.id); if (s) { s.status = 1; save(); } if (location.hash === "#complaints") { const y = scrollY; viewComplaints($("#view")); scrollTo(0, y); } }, 4000);
  };
  el.querySelectorAll("[data-del]").forEach(a => a.onclick = e => { e.preventDefault(); { const g = state.complaints.find(x => x.id === a.dataset.del); if (g) phDel(g.photoId); } state.complaints = state.complaints.filter(x => x.id !== a.dataset.del); save(); viewComplaints(el); });
}

/* ---------------- 9. Эко-маршруты ---------------- */
function haversineKm(a, b) {
  const R = 6371, toR = x => x * Math.PI / 180;
  const dLat = toR(b[0] - a[0]), dLon = toR(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const routeKm = r => r.path.slice(1).reduce((s, p, i) => s + haversineKm(r.path[i], p), 0);
const CAR_KG_PER_KM = 0.17;  // средний легковой автомобиль, кг CO₂ на км
const routeAqi = r => { const v = [...new Set(r.path.map(p => nearestDistrict(p[0], p[1]).id))].map(id => air.byDistrict[id] && air.byDistrict[id].aqi).filter(x => x != null); return v.length ? Math.round(v.reduce((s, x) => s + x, 0) / v.length) : null; };
let selRoute = null;
function viewRoutes(el) {
  const rs = ECO_ROUTES.map(r => ({ r, km: routeKm(r), aqi: routeAqi(r) }));
  const cleanest = rs.slice().sort((a, b) => (a.aqi ?? 1e9) - (b.aqi ?? 1e9))[0].r.id;
  const total = rs.reduce((s, x) => s + x.km * CAR_KG_PER_KM, 0);
  el.innerHTML = `
    <h1>🌳 ${t("rTitle")}</h1>
    <p class="sub">${t("rSub")}</p>
    <div id="rMap" class="mini-map" style="height:300px"></div>
    <div class="card tip" style="margin-top:12px;font-weight:800">🌍 ${t("rTotal", { n: fmt(total, 1) })}</div>
    ${rs.map(({ r, km, aqi }) => {
      const speed = r.mode === "walk" ? 4.5 : 14; const Lv = level(aqi);
      return `<div class="card route ${selRoute === r.id ? "sel" : ""}" data-route="${r.id}">
        <div class="row between"><b style="font-size:16px"><span class="rdot" style="background:${r.color}"></span>${tr(r.name)}</b>${r.id === cleanest ? `<span class="chip">${t("rBest")}</span>` : ""}</div>
        <div class="r-meta"><span>${r.mode === "walk" ? t("rWalk") : t("rBike")}</span><span>📏 ${t("rKm", { n: fmt(km, 1) })}</span><span>⏱️ ${t("rMin", { n: Math.round(km / speed * 60) })}</span>
          <span style="background:${Lv.color}22;color:${Lv.color}">AQI ${aqiTxt(aqi)}</span><span class="g">🌱 ${t("rCO2", { n: fmt(km * CAR_KG_PER_KM, 2) })}</span></div>
        <div class="small muted" style="font-weight:700;margin-top:6px">🚫 ${t("rAvoid", { s: tr(r.avoid) })}</div>
      </div>`;
    }).join("")}
    <div class="foot">${t("rDemo")}</div>
  `;
  map = mkMap("rMap", { zoomControl: false });
  baseTiles(map);
  const lines = {};
  ECO_ROUTES.forEach(r => {
    lines[r.id] = L.polyline(r.path, { color: r.color, weight: selRoute === r.id ? 9 : 6, opacity: selRoute && selRoute !== r.id ? 0.45 : 0.95, lineCap: "round", dashArray: r.mode === "bike" ? "1 11" : null }).addTo(map);
    L.marker(r.path[0], { icon: L.divIcon({ className: "", html: `<div class="r-start" style="background:${r.color}">${r.mode === "walk" ? "🚶" : "🚲"}</div>`, iconSize: [26, 26], iconAnchor: [13, 13] }) }).addTo(map);
  });
  map.fitBounds(selRoute ? lines[selRoute].getBounds().pad(0.3) : L.latLngBounds(ECO_ROUTES.flatMap(r => r.path)).pad(0.08));
  setTimeout(() => map && map.invalidateSize(), 50);
  el.querySelectorAll("[data-route]").forEach(c => c.onclick = () => { selRoute = selRoute === c.dataset.route ? null : c.dataset.route; viewRoutes(el); $("#rMap").scrollIntoView({ block: "center" }); });
}

/* ---------------- Старт ---------------- */
/* Карты часто пересоздаются при смене экрана/языка/города. CSS-анимация зума Leaflet падает,
 * если карту удалить посреди анимации, поэтому отключаем её (flyTo остаётся плавным). */
L.Map.mergeOptions({ zoomAnimation: false, markerZoomAnimation: false });
/* PWA: офлайн-оболочка (данные о воздухе всегда берутся из сети). */
if ("serviceWorker" in navigator && location.protocol !== "file:") window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(e => console.warn("SW:", e.message)));
setLang(LANG);
// v35: ?city=<id> (ссылки со страниц городов /bishkek/ и т. п.) — открыть приложение сразу на этом городе; параметр убираем из адреса,
// чтобы дальнейший выбор города в меню не «откатывался» при перезагрузке.
try { const u = new URL(location.href), qc = u.searchParams.get("city"); if (qc != null) { if (CITIES[qc] && qc !== CITY) { CITY = qc; state.house = { ...CITIES[qc].house, group: state.house.group }; } u.searchParams.delete("city"); history.replaceState(history.state, "", u); } } catch (e) {}
applyCity(CITY);
renderChrome();
route();
loadAir();
maybeOnboard();
