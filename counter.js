/* Счётчик посещений «Таза Аба»: Abacus (https://abacus.jasoncameron.dev) — бесплатно, без регистрации, CORS.
 * visitors — +1 при первом визите с устройства (флаг в localStorage), opens — +1 при каждой загрузке.
 * Не считаем: роботов (navigator.webdriver, боты по UA), Windows-exe (Neutralino), file://, localhost (там только чтение).
 * Запросы только в сеть (cache: "no-store"; sw.js не трогает чужие домены). Ошибка API — блок просто скрыт. */
"use strict";
(function () {
  const NS = "taza-aba-zusenbaev7", API = "https://abacus.jasoncameron.dev";
  const T = { ru: "Посетителей: {v} · Открытий: {o}", ky: "Келгендер: {v} · Ачылыштар: {o}", en: "Visitors: {v} · Opens: {o}" };
  const isExe = typeof window.NL_OS !== "undefined" || typeof window.Neutralino !== "undefined" || /Neutralino/i.test(navigator.userAgent);
  const isBot = navigator.webdriver === true || /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview/i.test(navigator.userAgent);
  const isWeb = /^https?:$/.test(location.protocol), isLocal = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname);
  const skipAll = isExe || !isWeb;
  const readOnly = isBot || isLocal;
  const st = { v: null, o: null };
  const nf = n => { try { return Number(n).toLocaleString(typeof numLocale === "function" ? numLocale() : "ru-RU"); } catch (e) { return String(n); } };
  function render() {
    const ok = st.v != null && st.o != null;
    const lang = (typeof LANG !== "undefined" && T[LANG]) ? LANG : "ru";
    const txt = ok ? T[lang].replace("{v}", nf(st.v)).replace("{o}", nf(st.o)) : "";
    document.querySelectorAll("[data-visits]").forEach(el => { el.textContent = txt; el.hidden = !ok; });
  }
  window.visitCountRender = render;
  /* Скрытая страница статистики: только по секретному адресу #stats-<ключ>, нигде не связана. */
  const SK = "stats-u42blvecbl";
  if (typeof views !== "undefined") views[SK] = el => {
    let m = document.querySelector('meta[name="robots"]'); if (!m) { m = document.createElement("meta"); m.name = "robots"; document.head.appendChild(m); } m.content = "noindex,nofollow";
    el.innerHTML = `<h1>📊 Статистика</h1><p class="sub">Видно только по этой ссылке. Источник: Abacus (${NS}).</p>
      <div class="card"><p style="font-size:20px;font-weight:800" data-visits hidden></p><p class="small muted" id="stNo">Загрузка…</p>
      <p class="small muted">«Посетители» — уникальные устройства (первый визит), «Открытия» — каждая загрузка сайта. Роботы, Windows-приложение и localhost не считаются.</p></div>`;
    Promise.all([call("get", "visitors"), call("get", "opens")]).then(([v, o]) => { if (v != null) st.v = v; if (o != null) st.o = o; render(); const n = document.getElementById("stNo"); if (n) n.textContent = st.v == null ? "API недоступен" : new Date().toLocaleString(); });
  };
  async function call(kind, key) {
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 8000);
    try { const r = await fetch(`${API}/${kind}/${NS}/${key}`, { cache: "no-store", mode: "cors", credentials: "omit", signal: ctl.signal });
      if (!r.ok) return null; const j = await r.json(); return typeof j.value === "number" ? j.value : null; }
    catch (e) { return null; } finally { clearTimeout(tm); }
  }
  async function run() {
    if (skipAll) return;
    let first = false;
    try { first = !localStorage.getItem("tazaAba.visited"); } catch (e) { }
    const vKind = !readOnly && first ? "hit" : "get", oKind = readOnly ? "get" : "hit";
    const [v, o] = await Promise.all([call(vKind, "visitors"), call(oKind, "opens")]);
    if (vKind === "hit" && v != null) { try { localStorage.setItem("tazaAba.visited", "1"); } catch (e) { } }
    st.v = v; st.o = o; render();
  }
  function goat() {
    const code = (window.TAZA_CONFIG && TAZA_CONFIG.GOATCOUNTER || "").trim();
    if (!code || skipAll || isBot) return;
    const url = /^https?:\/\//.test(code) ? code : `https://${code}.goatcounter.com/count`;
    const s = document.createElement("script"); s.async = true; s.src = "https://gc.zgo.at/count.js"; s.dataset.goatcounter = url; document.head.appendChild(s);
  }
  // перерисовка при смене языка/раздела
  if (typeof renderChrome === "function") { const rc = renderChrome; renderChrome = function () { const r = rc.apply(this, arguments); render(); return r; }; }
  const start = () => { run(); goat(); };
  if (document.readyState === "complete") start(); else window.addEventListener("load", start);
})();
