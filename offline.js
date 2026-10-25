/* Таза Аба — работа без интернета (v64).
 * 1) Последние РЕАЛЬНЫЕ ответы API (Open-Meteo, Sensor.Community, прогнозные коэффициенты, новости) сохраняются в IndexedDB
 *    с временем загрузки. Без сети отдаём их же, а сверху — честная плашка «Нет интернета · данные от 12:40».
 *    Ничего не выдумываем: нет сохранённого ответа → запрос завершается ошибкой, раздел показывает «нет данных».
 * 2) Главный запрос AQI по районам сюда не попадает — у него свой кэш с подписью (quick.js: saveAirCache/useCachedAir).
 * 3) Когда связь возвращается — тихо обновляем данные. */
(function () {
  "use strict";
  const HOSTS = /^(api\.open-meteo\.com|air-quality-api\.open-meteo\.com|data\.sensor\.community|raw\.githubusercontent\.com|api\.waqi\.info|www\.airnowapi\.org|api\.openaq\.org)$/;
  const SKIP = /us_aqi_pm2_5/;                      // главный запрос по районам (AQ_Q) — у него собственный кэш с меткой времени
  const LONG = /past_days=(?:[4-9]|\d\d)|coeffs\.json/; // история и коэффициенты меняются медленно
  const MAX_AGE = 24 * 3600e3, MAX_AGE_LONG = 7 * 864e5, MAX_N = 80;
  const own = u => u.hostname === "zusenbaev7-cmd.github.io" && /^\/taza-aba\/(forecast|news)\//.test(u.pathname);
  const norm = u => { const x = new URL(u.href); ["t", "startDate", "endDate", "_"].forEach(k => x.searchParams.delete(k)); return x.href; };
  let dbP = null;
  const db = () => dbP || (dbP = new Promise((res, rej) => { try { const r = indexedDB.open("tazaAba-offline", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("r"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }));
  const tx = (mode, fn) => db().then(d => new Promise((res, rej) => { const t = d.transaction("r", mode), s = t.objectStore("r"); const q = fn(s); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }));
  const put = (k, v) => tx("readwrite", s => s.put(v, k)).then(prune).catch(() => { });
  const get = k => tx("readonly", s => s.get(k)).catch(() => null);
  let pruneN = 0;
  function prune() { if (++pruneN % 10) return; return db().then(d => new Promise(res => { const t = d.transaction("r", "readwrite"), s = t.objectStore("r"), all = [];
    s.openCursor().onsuccess = e => { const c = e.target.result; if (c) { all.push([c.key, c.value.at]); c.continue(); } else { all.sort((a, b) => b[1] - a[1]); all.slice(MAX_N).forEach(([k]) => s.delete(k)); } };
    t.oncomplete = res; t.onerror = res; })).catch(() => { }); }

  const ST = window.TZOFF = { staleAt: 0, hits: 0 };
  const nf = window.fetch.bind(window);
  window.fetch = function (input, init) {
    let u; try { u = new URL(typeof input === "string" ? input : input.url, location.href); } catch (e) { return nf(input, init); }
    const method = ((init && init.method) || (typeof input !== "string" && input.method) || "GET").toUpperCase();
    if (method !== "GET" || !(HOSTS.test(u.hostname) || own(u)) || SKIP.test(u.search)) return nf(input, init);
    const key = norm(u), maxAge = LONG.test(u.href) ? MAX_AGE_LONG : MAX_AGE;
    const fromCache = err => get(key).then(c => {
      if (!c || Date.now() - c.at > maxAge) throw err;
      ST.hits++; if (!ST.staleAt || c.at < ST.staleAt) ST.staleAt = c.at; schedBar();
      return new Response(c.body, { status: 200, headers: { "Content-Type": c.ct || "application/json", "X-Taza-Cached-At": String(c.at) } });
    });
    if (navigator.onLine === false) return fromCache(new TypeError("offline"));
    return nf(input, init).then(r => {
      if (r.ok) r.clone().text().then(body => { if (body.length < 4e6) put(key, { at: Date.now(), body, ct: r.headers.get("Content-Type") }); }).catch(() => { });
      return r;
    }, err => (err && err.name === "AbortError" && navigator.onLine !== false) ? Promise.reject(err) : fromCache(err));
  };

  /* ---------- плашка ---------- */
  const TX = {
    ru: { off: "Нет интернета · данные от {t}", offNo: "Нет интернета · сохранённых данных нет", back: "Связь восстановлена — обновляем данные", svc: "Источник данных недоступен · данные от {t}" },
    ky: { off: "Интернет жок · {t} маалыматы", offNo: "Интернет жок · сакталган маалымат жок", back: "Байланыш калыбына келди — маалымат жаңыртылууда", svc: "Маалымат булагы жеткиликсиз · {t} маалыматы" },
    en: { off: "Offline · data from {t}", offNo: "Offline · no saved data", back: "Back online — refreshing data", svc: "Data source unavailable · data from {t}" }
  };
  const L = () => { try { return TX[LANG] ? LANG : "ru"; } catch (e) { return "ru"; } };
  const T = (k, v) => String(TX[L()][k]).replace("{t}", v || "");
  const when = ms => typeof fmtAt === "function" ? fmtAt(ms) : new Date(ms).toLocaleString();
  let barT = 0, backT = 0;
  function schedBar() { clearTimeout(barT); barT = setTimeout(bar, 60); }
  function bar() {
    if (!document.body) return;
    let el = document.getElementById("offBar"), a = null;
    try { a = air; } catch (e) { }
    const off = navigator.onLine === false;
    const at = a && a.offlineAt && !a.live ? a.offlineAt : ST.staleAt;
    const svc = !off && a && a.status === "offline" && a.errKind === "service";
    let txt = "", cls = "";
    if (backT) { txt = T("back"); cls = " ok"; }
    else if (off) txt = at ? T("off", when(at)) : T("offNo");
    else if (svc && at) txt = T("svc", when(at));
    document.documentElement.classList.toggle("is-offline", off);
    if (!txt) { if (el) el.hidden = true; return; }
    if (!el) { el = document.createElement("div"); el.id = "offBar"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite");
      const h = document.querySelector("header.topbar"); if (h && h.parentNode) h.parentNode.insertBefore(el, h.nextSibling); else document.body.prepend(el); }
    el.hidden = false; if (el.dataset.t === txt + cls) return; el.dataset.t = txt + cls;
    el.className = "off-bar" + cls; el.innerHTML = `<span class="off-dot" aria-hidden="true"></span><span></span>`; el.lastChild.textContent = txt;
  }
  ST.bar = schedBar;
  addEventListener("offline", schedBar);
  addEventListener("online", () => {
    ST.staleAt = 0; ST.hits = 0;
    backT = setTimeout(() => { backT = 0; schedBar(); }, 3500); schedBar();
    setTimeout(() => {
      try { if (typeof loadAir === "function") loadAir(); } catch (e) { }
      try { if (typeof loadWeather === "function") loadWeather(true).then(() => { const v = (location.hash || "#home").slice(1).split("/")[0]; if (typeof route === "function" && ["weather", "news"].includes(v)) route(true); }).catch(() => { }); } catch (e) { }
    }, 800);
  });
  setInterval(schedBar, 5000);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedBar); else schedBar();
})();
