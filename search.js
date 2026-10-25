/* Таза Аба — глобальный поиск районов/жилмассивов/городов (Кыргызстан) и поведение мобильной шапки.
 * Индекс строится один раз (лениво при первом открытии): названия на KG/RU/EN/TR → латинский «скелет»
 * (без регистра и диакритики, кириллица↔латиница, ж/dzh/c→j, ш/ş→sh …). Запрос пробуется как есть и в
 * «перепутанной раскладке» (fr-jhlj → ак-ордо), допускаются 1–2 опечатки (Дамерау–Левенштейн). */
"use strict";
const GS_T = {
  ru: { ph: "Поиск района или города", btn: "Поиск", none: "Ничего не найдено", hint: "↑↓ — выбор · Enter — открыть · Esc — закрыть", city: "город", close: "Закрыть", more: "Язык и тема" },
  ky: { ph: "Район же шаарды издөө", btn: "Издөө", none: "Эч нерсе табылган жок", hint: "↑↓ — тандоо · Enter — ачуу · Esc — жабуу", city: "шаар", close: "Жабуу", more: "Тил жана тема" },
  en: { ph: "Search a district or city", btn: "Search", none: "Nothing found", hint: "↑↓ — select · Enter — open · Esc — close", city: "city", close: "Close", more: "Language & theme" },
  
};
const GT = k => (GS_T[LANG] || GS_T.ru)[k] ?? GS_T.ru[k];
const GS_CYR = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "j", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", ң: "n", о: "o", ө: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f", х: "h", ц: "ts", ч: "\u0002", ш: "\u0001", щ: "\u0001", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya", і: "i", ә: "a", ғ: "g", қ: "k", ұ: "u", һ: "h" };
function gsSkel(s) {
  s = String(s || "").toLowerCase().replace(/ı/g, "y").replace(/ş/g, "\u0001").replace(/ç/g, "\u0002").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  s = s.replace(/[а-яёңөүіәғқұһ]/g, c => GS_CYR[c] ?? c);
  s = s.replace(/sh/g, "\u0001").replace(/ch/g, "\u0002").replace(/dzh|dj|zh/g, "j").replace(/kh/g, "h").replace(/x/g, "h").replace(/q/g, "k").replace(/w/g, "v").replace(/c/g, "j").replace(/yo/g, "e").replace(/ts/g, "c");
  return s.replace(/\u0001/g, "s").replace(/\u0002/g, "c").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}
const GS_EN = "`qwertyuiop[]asdfghjkl;'zxcvbnm,.", GS_RU = "ёйцукенгшщзхъфывапролджэячсмитьбю";
const gsSwap = (s, a, b) => [...s.toLowerCase()].map(c => { const i = a.indexOf(c); return i >= 0 ? b[i] : c; }).join("");
function gsDist(a, b, max) {   // Дамерау–Левенштейн (OSA) с ранним выходом
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let p2 = null, p = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) { const c = [i]; let mn = i;
    for (let j = 1; j <= b.length; j++) { let v = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (p2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, p2[j - 2] + 1); c[j] = v; if (v < mn) mn = v; }
    if (mn > max) return max + 1; p2 = p; p = c; }
  return p[b.length];
}
let GS_IDX = null;
function gsBuild() {
  GS_IDX = [];
  const add = (cid, did, nm) => { const names = [...new Set(Object.values(nm || {}).filter(Boolean))]; const keys = [...new Set(names.map(gsSkel))].filter(Boolean);
    GS_IDX.push({ cid, did, nm, keys, toks: keys.flatMap(k => k.split(" ")), flat: keys.map(k => k.replace(/ /g, "")) }); };
  const ids = [...new Set([...(typeof KG_ORDER !== "undefined" ? KG_ORDER : []), ...Object.keys(CITIES)])];
  ids.forEach(cid => { const c = CITIES[cid]; if (!c) return; add(cid, null, { ...c.name, tr2: c.trName });
    (c.districts || []).forEach(d => add(cid, d.id, d.name)); });
}
function gsSearch(q) {
  if (!GS_IDX) gsBuild();
  const vs = [...new Set([q, gsSwap(q, GS_EN, GS_RU), gsSwap(q, GS_RU, GS_EN)].map(gsSkel))].filter(v => v.length >= 1);
  if (!vs.length) return [];
  const out = [];
  for (const e of GS_IDX) {
    let sc = 0;
    for (const v of vs) { const vf = v.replace(/ /g, ""), max = vf.length >= 7 ? 2 : vf.length >= 4 ? 1 : 0;
      for (const f of e.flat) { if (f === vf) sc = Math.max(sc, 120); else if (f.startsWith(vf)) sc = Math.max(sc, 100 - Math.min(20, f.length - vf.length)); else if (vf.length >= 2 && f.includes(vf)) sc = Math.max(sc, 62); }
      if (sc < 80) for (const tk of e.toks) if (tk.startsWith(vf)) sc = Math.max(sc, 84);
      if (sc < 60 && max) for (const f of e.flat) { const d = Math.min(gsDist(vf, f.slice(0, vf.length), max), gsDist(vf, f, max)); if (d <= max) sc = Math.max(sc, 50 - d * 12); }
      if (sc < 60 && max) for (const tk of e.toks) if (tk.length >= 3) { const d = gsDist(vf, tk.slice(0, vf.length), max); if (d <= max) sc = Math.max(sc, 46 - d * 12); } }
    if (sc) out.push({ e, sc: sc + (e.did ? 0 : 6) + (e.cid === CITY ? 3 : 0) });
  }
  return out.sort((a, b) => b.sc - a.sc || (a.e.did ? 1 : 0) - (b.e.did ? 1 : 0)).slice(0, 40).map(x => x.e);
}
const gsNm = nm => (nm && (nm[LANG] || nm.ru || nm.en)) || "";
function gsAqi(e) {
  if (e.did) { const r = e.cid === CITY && air.byDistrict && air.byDistrict[e.did]; return r && r.aqi != null ? r.aqi : null; }
  const r = typeof countryAir !== "undefined" && countryAir.byCity && countryAir.byCity[e.cid]; return r && r.aqi != null ? r.aqi : (e.cid === CITY && air.byDistrict[state.district] ? null : null);
}
let gsRes = [], gsSel = 0, gsT = 0, gsLast = null;
function gsOpen() {
  let ov = document.getElementById("gsOv");
  if (!ov) { ov = document.createElement("div"); ov.id = "gsOv"; ov.className = "gs-ov"; ov.hidden = true;
    ov.innerHTML = `<div class="gs-box" role="dialog" aria-modal="true"><div class="gs-in"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>
      <input id="gsQ" type="search" autocomplete="off" spellcheck="false" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="gsList"><button class="gs-x" type="button">✕</button></div>
      <ul id="gsList" class="gs-list" role="listbox"></ul><div class="gs-hint small muted"></div></div>`;
    document.body.appendChild(ov);
    ov.addEventListener("click", e => { if (e.target === ov) gsClose(); });
    ov.querySelector(".gs-x").onclick = gsClose;
    const q = ov.querySelector("#gsQ");
    q.addEventListener("input", () => { clearTimeout(gsT); gsT = setTimeout(gsRender, 90); });
    q.addEventListener("keydown", e => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (!gsRes.length) return; gsSel = (gsSel + (e.key === "ArrowDown" ? 1 : -1) + gsRes.length) % gsRes.length; gsMark(); }
      else if (e.key === "Enter") { e.preventDefault(); clearTimeout(gsT); if (q.value.trim() && gsLast !== q.value) gsRender(); if (gsRes[gsSel]) gsPick(gsRes[gsSel]); }
      else if (e.key === "Escape") { e.preventDefault(); gsClose(); } });
    ov.querySelector("#gsList").addEventListener("click", e => { const li = e.target.closest("[data-i]"); if (li) gsPick(gsRes[+li.dataset.i]); });
  }
  const q = ov.querySelector("#gsQ"); q.placeholder = GT("ph"); q.setAttribute("aria-label", GT("ph")); ov.querySelector(".gs-x").setAttribute("aria-label", GT("close")); ov.querySelector(".gs-hint").textContent = GT("hint");
  ov.hidden = false; document.documentElement.classList.add("gs-open"); q.value = ""; gsRender(); setTimeout(() => q.focus(), 20);
}
function gsClose() { const ov = document.getElementById("gsOv"); if (ov) ov.hidden = true; document.documentElement.classList.remove("gs-open"); const b = document.getElementById("gsBtn"); if (b && !IS_MOB) b.focus(); }
function gsRender() {
  const q = document.getElementById("gsQ"), ul = document.getElementById("gsList"); if (!q || !ul) return;
  const v = q.value.trim(); gsLast = q.value;
  gsRes = v ? gsSearch(v) : [CITY, ...CITY_ORDER.filter(x => x !== CITY)].slice(0, 12).map(cid => (GS_IDX || (gsBuild(), GS_IDX)).find(e => e.cid === cid && !e.did)).filter(Boolean);
  gsSel = 0;
  ul.innerHTML = gsRes.length ? gsRes.map((e, i) => { const c = CITIES[e.cid], a = gsAqi(e), Lv = a != null ? level(a) : null;
    return `<li id="gs-o${i}" role="option" data-i="${i}" aria-selected="${i === 0}"><span class="gs-ic" aria-hidden="true">${e.did ? "📍" : c.emoji || "🏙️"}</span>
      <span class="gs-tx"><b>${esc(e.did ? gsNm(e.nm) : tr(c.name))}</b><small>${e.did ? esc(tr(c.name)) + " · " : GT("city") + " · "}🇰🇬</small></span>
      ${Lv ? `<span class="gs-aqi" style="background:${Lv.color}">${a}</span>` : ""}</li>`; }).join("") : `<li class="gs-none">${GT("none")}</li>`;
  gsMark();
}
function gsMark() { const ul = document.getElementById("gsList"), q = document.getElementById("gsQ"); if (!ul) return;
  ul.querySelectorAll("[data-i]").forEach(li => { const on = +li.dataset.i === gsSel; li.setAttribute("aria-selected", on); li.classList.toggle("on", on); if (on) { li.scrollIntoView({ block: "nearest" }); q.setAttribute("aria-activedescendant", li.id); } }); }
function gsPick(e) {
  if (!e) return; gsClose();
  if (e.did) { state.district = e.did; save(); window.__gsFocus = e.did; window.__gsFocusAt = Date.now(); }
  mapMode = "city";
  if (location.hash.split("/")[0] !== "#map") history.replaceState(null, "", "#map");
  if (e.cid !== CITY) switchCity(e.cid); else { const c = CITIES[CITY]; if (e.did && !DISTRICTS.some(d => d.id === e.did)) { applyCity(CITY); } route(true); }
}
/* шапка: кнопка поиска, «⋯» (язык/тема на мобильном), скрытие при прокрутке вниз */
function gsChrome() {
  const b = document.getElementById("gsBtn"); if (b) { b.setAttribute("aria-label", GT("btn")); b.title = GT("ph") + " (Ctrl+K)"; const ph = b.querySelector(".gs-ph"); if (ph) ph.textContent = GT("ph"); }
  const m = document.getElementById("hdrMore"); if (m) { m.setAttribute("aria-label", GT("more")); m.title = GT("more"); }
}
(function () {
  const b = document.getElementById("gsBtn"); if (b) b.onclick = gsOpen;
  const tb = document.querySelector(".topbar"), more = document.getElementById("hdrMore");
  if (more && tb) more.onclick = e => { e.stopPropagation(); const o = !tb.classList.contains("more-open"); tb.classList.toggle("more-open", o); more.setAttribute("aria-expanded", o); tb.classList.remove("hide"); };
  document.addEventListener("click", e => { if (tb && tb.classList.contains("more-open") && !e.target.closest("#hdrRight,#hdrMore")) { tb.classList.remove("more-open"); more && more.setAttribute("aria-expanded", "false"); } });
  document.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); gsOpen(); }
    else if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement?.tagName || "") && !document.activeElement?.isContentEditable) { e.preventDefault(); gsOpen(); } });
  if (typeof renderChrome === "function") { const rc = renderChrome; renderChrome = function () { const r = rc.apply(this, arguments); gsChrome(); GS_IDX = null; return r; }; }
  gsChrome();
  // скрытие шапки при прокрутке вниз (только мобильный макет), rAF + passive
  let lastY = scrollY, tick = false;
  const mq = matchMedia("(max-width: 1023px)");
  addEventListener("scroll", () => { if (tick) return; tick = true; requestAnimationFrame(() => { tick = false; if (!tb) return;
    const y = scrollY, dy = y - lastY;
    if (!mq.matches || y < 72 || tb.classList.contains("more-open") || document.documentElement.classList.contains("gs-open")) tb.classList.remove("hide");
    else if (dy > 6) tb.classList.add("hide"); else if (dy < -6) tb.classList.remove("hide");
    if (Math.abs(dy) > 6 || y < 72) lastY = y; }); }, { passive: true });
  tb && tb.addEventListener("focusin", () => tb.classList.remove("hide"));
})();
