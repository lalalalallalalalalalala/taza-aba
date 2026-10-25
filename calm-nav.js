/* Таза Аба · v54: заголовки групп в боковом меню ПК + всплывающие подсказки, 4 языка. Порядок задаёт calm.css (order), DOM не переставляется — нижняя панель на телефоне не меняется. */
"use strict";
(function () {
  const G = {
    main: { ru: "Главное", ky: "Негизги", en: "Main" },
    tools: { ru: "Инструменты", ky: "Куралдар", en: "Tools" },
    data: { ru: "Данные", ky: "Маалымат", en: "Data" },
    community: { ru: "Сообщество", ky: "Коомчулук", en: "Community" },
    account: { ru: "Аккаунт", ky: "Аккаунт", en: "Account" }
  };
  const lang = () => { const l = (document.documentElement.lang || "ru").slice(0, 2); return G.main[l] ? l : "ru"; };
  function paint() {
    const nav = document.getElementById("tabbar"); if (!nav) return;
    const l = lang();
    Object.keys(G).forEach(k => {
      let h = nav.querySelector(`.nav-grp[data-g="${k}"]`);
      if (!h) { h = document.createElement("div"); h.className = "nav-grp"; h.dataset.g = k; h.setAttribute("aria-hidden", "true"); nav.appendChild(h); }
      if (h.textContent !== G[k][l]) h.textContent = G[k][l];
    });
    nav.querySelectorAll("a").forEach(a => { const s = a.querySelector("span"); const t = s && s.textContent.trim(); if (t && a.title !== t) a.title = t; });
  }
  paint();
  new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  document.addEventListener("DOMContentLoaded", paint); window.addEventListener("load", paint);
})();
