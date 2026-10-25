/* Таза Аба — service worker (v64): приложение открывается и без интернета.
 * • Оболочка (HTML/JS/CSS/шрифты/иконки/Leaflet/MapLibre/переводы) — в кэше при установке; обновления: сначала сеть (таймаут 4 с), без сети — кэш.
 * • Тайлы карты, которые вы уже смотрели, — отдельный кэш до ~TILE_MAX штук (старые вытесняются); нет тайла офлайн → пустая клетка.
 * • Данные о воздухе/погоде SW НЕ подменяет: их последние реальные ответы с меткой времени хранит offline.js (IndexedDB). */
const V = "v66", CACHE = "taza-aba-" + V, TILES = "taza-aba-tiles", TILE_MAX = 450;
const SHELL = ["./", "index.html", "manifest.webmanifest", "favicon.ico", "accounts.css", "accounts.js", "ai.js", "app.js", "aqi-premium.css", "aqi-premium.js", "blue.css", "calm-boot.js", "calm-nav.js", "calm.css", "city.css", "config.js", "counter.js", "dark.css", "data.js", "download.css", "download.js", "eco.css", "eco.js", "eco3d.js", "ethno.css", "extra.js", "features.css", "features.js", "forecast.css", "forecast.js", "fullmap.css", "fullmap.js", "gov-boot.js", "gov.css", "gov.js", "hero.css", "hero.js", "history.css", "history.js", "i18n.js", "icons-nav.js", "iosmap.css", "iosmap.js", "kg-places.js", "layout.css", "maarif-world.js", "maarif.css", "maarif.js", "mapstyle.css", "mapstyle.js", "mobile.css", "offline.css", "offline.js", "polish.css", "polish.js", "quick.css", "quick.js", "search.js", "sources.js", "styles.css", "theme.css", "traffic2.css", "traffic2.js", "vendor/fonts/inter-cyrillic-ext-wght-normal.woff2", "vendor/fonts/inter-cyrillic-wght-normal.woff2", "vendor/fonts/inter-latin-ext-wght-normal.woff2", "vendor/fonts/inter-latin-wght-normal.woff2", "vendor/fonts/manrope-cyrillic-ext-wght-normal.woff2", "vendor/fonts/manrope-cyrillic-wght-normal.woff2", "vendor/fonts/manrope-latin-ext-wght-normal.woff2", "vendor/fonts/manrope-latin-wght-normal.woff2", "vendor/leaflet/leaflet.css", "vendor/leaflet/leaflet.js", "vendor/maplibre-gl-leaflet/leaflet-maplibre-gl.js", "vendor/maplibre/maplibre-gl-csp-worker.js", "vendor/maplibre/maplibre-gl-csp.js", "vendor/maplibre/maplibre-gl.css", "vendor/supabase/supabase.js", "icons/apple-touch-icon.png", "icons/favicon-16.png", "icons/favicon-32.png", "icons/favicon-48.png", "icons/favicon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-192.png", "icons/icon-maskable-512.png", "icons/maarif-emblem.png", "icons/maarif-logo-white.png", "icons/maarif-logo.png", "icons/qr-site.svg", "data/clean-places.json", "data/osm/index.json"];
const TILE_RX = /^(server\.arcgisonline\.com|tile\.openstreetmap\.org|[abc]\.tile\.openstreetmap\.org|tiles\.openfreemap\.org|[a-d]\.basemaps\.cartocdn\.com)$/;
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(new Request(u, { cache: "reload" })).catch(() => { })))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== TILES).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const timeout = (p, ms) => new Promise((res, rej) => { const t = setTimeout(() => rej(new Error("timeout")), ms); p.then(r => { clearTimeout(t); res(r); }, e => { clearTimeout(t); rej(e); }); });
const EMPTY_PNG = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="), c => c.charCodeAt(0));
let tileN = 0;
function trimTiles(c) { if (++tileN % 30) return; c.keys().then(ks => { const n = ks.length - TILE_MAX; for (let i = 0; i < n; i++) c.delete(ks[i]); }); }
async function tile(req, u) {
  const c = await caches.open(TILES), key = u.href, hit = await c.match(key);
  const isMeta = u.hostname === "tiles.openfreemap.org" && !/\.(pbf|png|jpg|webp|mvt)$/.test(u.pathname);   // TileJSON/стиль — сначала сеть
  if (hit && !isMeta) {   // уже смотрели: сразу из кэша, тихо обновляем при наличии сети
    if (self.navigator.onLine !== false) fetch(key, { mode: "cors", credentials: "omit" }).then(r => { if (r.ok) c.put(key, r); }).catch(() => { });
    return hit;
  }
  try {
    const r = await fetch(key, { mode: "cors", credentials: "omit" });
    if (r.ok) { c.put(key, r.clone()); trimTiles(c); }
    return r;
  } catch (e) {
    if (hit) return hit;
    try { if (self.navigator.onLine !== false) return await fetch(req); } catch (e2) { }
    return /\.(png|jpg|jpeg|webp)$/.test(u.pathname) || u.hostname === "server.arcgisonline.com" ? new Response(EMPTY_PNG, { headers: { "Content-Type": "image/png" } }) : Response.error();
  }
}
const OFF_HTML = "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'><title>Таза Аба</title><body style='margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font:16px system-ui,sans-serif;text-align:center;background:#0F1216;color:#E3E7EB'><div><h2 style='margin:0 0 8px'>Нет интернета</h2><p style='opacity:.7'>Интернет жок · Offline</p><button onclick='location.reload()' style='margin-top:12px;padding:10px 22px;border:0;border-radius:10px;background:#5AB4E8;color:#06131D;font:600 15px system-ui'>Повторить · Retry</button></div>";
/* сначала сеть; если сеть молчит дольше таймаута, а копия есть — отдаём копию; копии нет — ждём сеть до конца */
async function shell(req, nav) {
  const net = fetch(req).then(r => { if (r.ok && r.type === "basic") { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; });
  net.catch(() => { });
  const cached = () => caches.match(req, { ignoreSearch: true }).then(m => m || (nav ? caches.match("index.html") : null));
  try { return await timeout(net, nav ? 4000 : 8000); }
  catch (e) {
    const m = await cached(); if (m) return m;
    try { return await net; } catch (e2) { return nav ? new Response(OFF_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } }) : Response.error(); }
  }
}
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (TILE_RX.test(u.hostname)) { e.respondWith(tile(e.request, u)); return; }
  if (u.origin !== self.location.origin) return;   // внешние API — напрямую (их кэширует offline.js с меткой времени)
  e.respondWith(shell(e.request, e.request.mode === "navigate"));
});
