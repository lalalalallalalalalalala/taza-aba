/* v41: полноэкранные карты «Дымка» (#map) и «Пробки» (#traffic).
 * Карта — от края до края (минус шапка и навигация), всё остальное (время, легенда, карточки, заметки, список районов) —
 * в стеклянной «пилюле» внизу слева, которая раскрывается в панель. Поиск района — плавающая пилюля сверху.
 * ?fullmap=0 — прежняя раскладка (сохраняется), ?fullmap=1 — снова полноэкранная. */
"use strict";
window.FM_ON = (() => { try { const q = new URL(location.href).searchParams.get("fullmap");
  if (q === "0") localStorage.setItem("tazaAba.fullmap", "0"); if (q === "1") localStorage.removeItem("tazaAba.fullmap");
  return localStorage.getItem("tazaAba.fullmap") !== "0"; } catch (e) { return true; } })();
const FM_T = {
  ru: { open: "Слои, легенда и время", close: "Свернуть", est: "оценка · модель", smog: "Карта смога", traffic: "Пробки", aqi: "AQI", panel: "Панель карты" },
  ky: { open: "Катмарлар, легенда жана убакыт", close: "Жыйноо", est: "баалоо · модель", smog: "Түтүн картасы", traffic: "Тыгындар", aqi: "AQI", panel: "Карта панели" },
  en: { open: "Layers, legend and time", close: "Collapse", est: "estimate · model", smog: "Smog map", traffic: "Traffic", aqi: "AQI", panel: "Map panel" } };
const FMT = k => (FM_T[LANG] || FM_T.ru)[k];
const FM_IC = {
  smog: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h11a3 3 0 1 0-3-3"/><path d="M3 13h15a3 3 0 1 1-3 3"/><path d="M5 17h6"/></svg>',
  traffic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="2.5" width="8" height="19" rx="3"/><circle cx="12" cy="7" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="17" r="1.6"/></svg>' };
function fmLayout() {
  const host = document.querySelector(".fm-host"); if (!host) return;
  if (window.scrollY) window.scrollTo(0, 0);
  const tbE = document.getElementById("tabbar"), topE = document.querySelector(".topbar"), ab = document.getElementById("alertBanner");
  const tb = tbE ? tbE.getBoundingClientRect() : { width: 0, height: 0, right: 0, top: innerHeight }, vert = tb.height > tb.width;
  let T = topE ? Math.max(0, topE.getBoundingClientRect().bottom) : 0;
  if (ab && !ab.classList.contains("hidden") && ab.offsetHeight) T = Math.max(T, ab.getBoundingClientRect().bottom);
  const r = document.documentElement.style;
  r.setProperty("--fm-t", Math.round(T) + "px"); r.setProperty("--fm-l", Math.round(vert ? Math.max(0, tb.right) : 0) + "px");
  r.setProperty("--fm-b", Math.round(vert ? 0 : Math.max(0, innerHeight - tb.top)) + "px");
  if (typeof map !== "undefined" && map && map._mapPane) map.invalidateSize({ pan: false });
}
function fmApply(el, kind) {
  if (!window.FM_ON || typeof map === "undefined" || !map) return;
  const mc = el.querySelector(kind === "smog" ? "#mapEl" : "#tfMap"); if (!mc || mc.closest(".fm-host")) return;
  const M = map;
  el.querySelectorAll(":scope > .fm-host").forEach(x => x.remove());
  document.documentElement.classList.add("fm-on"); el.classList.add("fm-view");
  const host = document.createElement("div"); host.className = "fm-host fm-" + kind;
  const panel = document.createElement("div"); panel.className = "fm-panel"; panel.id = "fmPanel"; panel.setAttribute("role", "region"); panel.setAttribute("aria-label", FMT("panel"));
  panel.innerHTML = `<div class="fm-ph"><b>${esc(FMT(kind))}</b><button type="button" class="fm-x" aria-label="${esc(FMT("close"))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button></div><div class="fm-pb"></div>`;
  const body = panel.querySelector(".fm-pb");
  const chip = document.createElement("button"); chip.type = "button"; chip.className = "fm-chip"; chip.setAttribute("aria-expanded", "false"); chip.setAttribute("aria-controls", "fmPanel");
  chip.setAttribute("aria-label", FMT("open"));
  chip.innerHTML = `<span class="fm-ic">${FM_IC[kind]}</span><span class="fm-cv"><b class="fm-v">…</b><small class="fm-est">${esc(FMT("est"))}</small></span><svg class="fm-car" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>`;
  /* поиск района — плавающая пилюля (только у «Дымки»: msSearchUI) */
  const find = el.querySelector(".ms-find");
  host.appendChild(mc);
  if (find) { find.classList.add("fm-search"); host.appendChild(find); }
  /* заметка «Оценка…» (контрол Leaflet) — в панель, внизу слева теперь пилюля */
  const note = mc.querySelector(".leaflet-bottom.leaflet-left .ms-note"); if (note) { const w = note.closest(".leaflet-control") || note; body.appendChild(w); w.classList.add("fm-note"); }
  if (kind === "traffic") { const tc = document.createElement("div"); tc.className = "fm-tfe"; body.appendChild(tc); M._tfeHost = tc;
    const old = mc.querySelector(".tfe-card"); if (old) { tc.appendChild(old); old.classList.add("tfe-card-in"); } }
  [...el.childNodes].forEach(n => { if (n !== host) body.appendChild(n); });
  host.append(chip, panel); el.appendChild(host);
  /* значение на пилюле */
  const v = chip.querySelector(".fm-v");
  if (kind === "smog") { const upd = () => { if (!chip.isConnected) return clearInterval(iv);
      const a = (typeof DISTRICTS !== "undefined" ? DISTRICTS : []).map(d => air.byDistrict && air.byDistrict[d.id] && air.byDistrict[d.id].aqi).filter(x => x != null);
      if (!a.length) { v.textContent = FMT("smog"); return; } const md = Math.round(median(a)), Lv = level(md);
      v.innerHTML = `<i class="fm-dot" style="background:${typeof msBin === "function" ? msBin(md) : Lv.color}"></i>${FMT("aqi")} ${md} · ${esc(tr(Lv.name))}`; };
    const iv = setInterval(upd, 30000); upd(); }
  else { v.textContent = FMT("traffic");
    M.on("tfescore", e => { if (!chip.isConnected) return; v.innerHTML = `<i class="fm-dot" style="background:${tfCol(Math.min(0.95, (e.sc - 1) / 9 * 0.85 + 0.05))}"></i>${String(e.h).padStart(2, "0")}:00 · ${e.sc}/10 <span class="fm-tr">${e.tr}</span>`;
      chip.setAttribute("aria-label", `${FMT("open")}: ${String(e.h).padStart(2, "0")}:00, ${e.sc}/10, ${e.lvl}`); }); }
  /* раскрытие / сворачивание */
  panel.inert = true;
  const open = () => { panel.inert = false; panel.classList.add("open"); host.classList.add("fm-open"); chip.setAttribute("aria-expanded", "true"); setTimeout(() => { const x = panel.querySelector(".fm-x"); if (x) x.focus({ preventScroll: true }); }, 30); };
  const close = (focus = true) => { panel.classList.remove("open"); host.classList.remove("fm-open"); panel.inert = true; chip.setAttribute("aria-expanded", "false"); if (focus) chip.focus({ preventScroll: true }); };
  chip.onclick = () => panel.classList.contains("open") ? close() : open();
  panel.querySelector(".fm-x").onclick = () => close();
  panel.addEventListener("keydown", e => { if (e.key === "Escape") { e.stopPropagation(); close(); } });
  [chip, panel].forEach(x => { L.DomEvent.disableClickPropagation(x); L.DomEvent.disableScrollPropagation(x); });
  if (find) { L.DomEvent.disableClickPropagation(find); L.DomEvent.disableScrollPropagation(find); }
  /* выбор района из панели (traffic: #tfD) — свернуть, чтобы было видно карту на телефоне */
  const sel = body.querySelector("#tfD"); if (sel && innerWidth < 700) sel.addEventListener("change", () => close(false));
  fmLayout(); requestAnimationFrame(fmLayout); setTimeout(fmLayout, 250);
  if (window.ResizeObserver) { const ro = new ResizeObserver(() => { if (!host.isConnected) return ro.disconnect(); if (M._mapPane) M.invalidateSize({ pan: false }); }); ro.observe(host); }
}
(function () {
  const wrap = (k, kind) => { const f = views[k]; if (typeof f !== "function") return; views[k] = function (el) { const r = f.apply(this, arguments); try { fmApply(el, kind); } catch (e) { console.warn("fullmap:", e); } return r; }; };
  wrap("map", "smog"); wrap("traffic", "traffic");
  addEventListener("resize", () => { clearTimeout(fmLayout._t); fmLayout._t = setTimeout(fmLayout, 80); });
  addEventListener("orientationchange", () => setTimeout(fmLayout, 300));
  const vw = document.getElementById("view");
  if (vw && window.MutationObserver) new MutationObserver(() => { if (!vw.querySelector(".fm-host")) { document.documentElement.classList.remove("fm-on"); vw.classList.remove("fm-view"); } }).observe(vw, { childList: true });
})();
