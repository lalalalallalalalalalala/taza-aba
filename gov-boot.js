/* «Для мэрии и государства»: лёгкая регистрация (подписи, иконка, пункты меню). Сам раздел — gov.js/gov.css, грузится лениво. */
"use strict";
const GVB = {
  ru: { gov: "Для мэрии и государства", govSub: "Панель решений, прогноз смога, отчёт и открытые данные", pol: "Меры с доказанной пользой", polSub: "Источники: Всемирный банк, ПРООН, ВОЗ, ЮНИСЕФ", br: "Памятка для акимата", brSub: "Смог в городе на 1 странице: ситуация, меры на завтра и на сезон" },
  ky: { gov: "Мэрия жана мамлекет үчүн", govSub: "Чечим панели, түтүн божомолу, отчёт жана ачык маалымат", pol: "Пайдасы далилденген чаралар", polSub: "Булактар: Дүйнөлүк банк, БУУӨП, ДССУ, ЮНИСЕФ", br: "Акимчилик үчүн эскертме", brSub: "Шаардагы түтүн 1 баракта: абал, эртеңки жана сезондук чаралар" },
  en: { gov: "For city hall & government", govSub: "Decision dashboard, smog forecast, report and open data", pol: "Evidence-based measures", polSub: "Sources: World Bank, UNDP, WHO, UNICEF", br: "Brief for the akimat", brSub: "City smog on one page: situation, measures for tomorrow and the season" },
  
};
const GB = k => (GVB[LANG] || GVB.ru)[k] || GVB.ru[k];
if (typeof NAV_ICO !== "undefined") {
  NAV_ICO.gov = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9.5 12 4l9 5.5"/><path d="M4 21h16M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/></svg>';
  NAV_ICO.govbrief = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 8h7M8.5 11.5h7M8.5 15h4"/></svg>';
  NAV_ICO.govpolicy = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 12h7M9 15.5h7M9 9h3"/></svg>';
}
(function () {
  TAB_OF.gov = "more"; TAB_OF.govpolicy = "more"; TAB_OF.govbrief = "more";
  lazyView("gov", ["gov.css", "gov.js"], () => typeof window.viewGov === "function", el => window.viewGov(el));
  lazyView("govpolicy", ["gov.css", "gov.js"], () => typeof window.viewGovPolicy === "function", el => window.viewGovPolicy(el));
  lazyView("govbrief", ["gov.css", "gov.js"], () => typeof window.viewGovBrief === "function", el => window.viewGovBrief(el));
  const _more = views.more;
  views.more = el => { _more(el); const g = el.querySelector(".more-grid"); if (!g) return;
    const ico = k => (typeof navIco === "function" ? navIco(k) : "");
    g.insertAdjacentHTML("afterbegin", [["#gov", "gov", GB("gov"), GB("govSub")], ["#govbrief", "govbrief", GB("br"), GB("brSub")], ["#govpolicy", "govpolicy", GB("pol"), GB("polSub")]]
      .map(([h, k, a, b]) => `<a href="${h}" class="card more-tile gv-tile"><span class="mt-e">${ico(k)}</span><b>${esc(a)}</b><small>${esc(b)}</small></a>`).join("")); };
  const rc = renderChrome;
  renderChrome = function () { const r = rc.apply(this, arguments);
    document.querySelectorAll('.tabbar a[data-tab="gov"] span').forEach(s => s.textContent = GB("gov"));
    document.querySelectorAll('.tabbar a[data-tab="govpolicy"] span').forEach(s => s.textContent = GB("pol"));
    return r; };
})();
