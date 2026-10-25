/* Витрина «Таза Аба» на главной (v40: по умолчанию; ?hero=0 — выключить, сохраняется; ?hero=1 — включить).
 * Сумеречное небо над горами Ала-Тоо, слой смога, карточка ИИ-помощника: сводка только из живых данных AQI
 * (без данных — только подсказки, открывающие настоящего советника), док разделов. Только CSS/SVG, без видео. */
window.HERO_ON = (() => { try { const q = new URL(location.href).searchParams.get("hero");   // v40: включена по умолчанию; ?hero=0 — выключить (сохраняется), ?hero=1 — снова включить
  if (q === "1") localStorage.removeItem("tazaAba.hero"); if (q === "0") localStorage.setItem("tazaAba.hero", "0");
  return localStorage.getItem("tazaAba.hero") !== "0"; } catch (e) { return true; } })();
const HR_T = {
  ru: { tag: "ИИ-помощник о воздухе", q1: c => `Какой воздух сейчас в ${c}?`, a1: (c, a, lv, n, t) => `Сейчас AQI ${a} — «${lv}». Это медиана по ${n} районам: модель CAMS + датчики. ${t}`,
    q2: "А где чище всего?", a2: (lo, la, hi, ha) => `Чище всего — ${lo} (AQI ${la}). Хуже всего — ${hi} (AQI ${ha}). Подробно — на карте «Дымка».`,
    ph: "Спросите о воздухе…", demo: "демо", live: "живые данные", dock: { map: "Карта смога", advisor: "ИИ-советник", gov: "Для мэрии", alerts: "Уведомления", history: "Архив", news: "Новости", complaints: "Жалобы" }, h: "Чистый воздух начинается с данных", s: "Живой AQI по районам, прогноз смога и советы — бесплатно для каждого." },
  ky: { tag: "Аба боюнча ИИ-жардамчы", q1: c => `${c} азыр аба кандай?`, a1: (c, a, lv, n, t) => `Азыр AQI ${a} — «${lv}». Бул ${n} райондун медианасы: CAMS модели + датчиктер. ${t}`,
    q2: "Эң таза жер кайда?", a2: (lo, la, hi, ha) => `Эң таза — ${lo} (AQI ${la}). Эң начар — ${hi} (AQI ${ha}). Толугураак — «Дымка» картасында.`,
    ph: "Аба жөнүндө сураңыз…", demo: "демо", live: "жандуу маалымат", dock: { map: "Түтүн картасы", advisor: "ИИ-кеңешчи", gov: "Мэрия үчүн", alerts: "Билдирмелер", history: "Архив", news: "Жаңылыктар", complaints: "Даттануулар" }, h: "Таза аба маалыматтан башталат", s: "Райондор боюнча жандуу AQI, түтүн болжолу жана кеңештер — баарына акысыз." },
  en: { tag: "AI air assistant", q1: c => `What's the air like in ${c} right now?`, a1: (c, a, lv, n, t) => `Right now AQI is ${a} — “${lv}”. That's the median of ${n} districts: CAMS model + sensors. ${t}`,
    q2: "Where is it cleanest?", a2: (lo, la, hi, ha) => `Cleanest: ${lo} (AQI ${la}). Worst: ${hi} (AQI ${ha}). Details on the smog map.`,
    ph: "Ask about the air…", demo: "demo", live: "live data", dock: { map: "Smog map", advisor: "AI advisor", gov: "For the city hall", alerts: "Alerts", history: "Archive", news: "News", complaints: "Reports" }, h: "Clean air starts with data", s: "Live AQI by district, smog forecast and advice — free for everyone." } };
const HT = () => HR_T[LANG] || HR_T.ru;
const HR_GOV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18M4 10h16M12 3l8 5H4z"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/></svg>';
function hrData() {   // v58: только живые данные; без них — ничего не выдумываем
  const pts = (typeof DISTRICTS !== "undefined" ? DISTRICTS : []).map(d => ({ d, a: air.byDistrict && air.byDistrict[d.id] && air.byDistrict[d.id].aqi })).filter(p => p.a != null);
  const live = air.status === "ok" && pts.length > 0, c = cityObj(), T = HT();
  const city = LANG === "ru" || LANG === "ky" ? tr(c.prep || c.name) : tr(c.name);
  if (!live) return { live };
  const md = Math.round(median(pts.map(p => p.a))), Lv = level(md), s = [...pts].sort((x, y) => x.a - y.a);
  return { live, md, a1: T.a1(city, md, tr(Lv.name), pts.length, tr(Lv.text)), a2: pts.length > 1 ? T.a2(dName(s[0].d), s[0].a, dName(s[s.length - 1].d), s[s.length - 1].a) : "" };
}
const HR_Q = ["walk", "windows", "mask", "coal"];
function hrStars(n, w, h, seed) { let s = seed, r = () => (s = (s * 9301 + 49297) % 233280) / 233280; const o = [];
  for (let i = 0; i < n; i++) o.push(`${Math.round(r() * w)}px ${Math.round(r() * h)}px 0 ${r() < .15 ? 1 : 0}px rgba(255,255,255,${(0.35 + r() * 0.6).toFixed(2)})`); return o.join(","); }
function heroHTML() {
  const T = HT(), D = hrData(), ico = k => (typeof navIco === "function" ? navIco(k) : "");
  const dock = [["#map", "map", ico("map")], ["#advisor", "advisor", ico("advisor")], ["#gov", "gov", HR_GOV], ["#profile/alertsCard", "alerts", ico("alerts")], ["#history", "history", ico("history")], ["#news", "news", ico("news")], ["#complaints", "complaints", ico("complaints")]];
  const smog = D.live ? msBinRGB2(D.md) : "237,180,67";
  return `<section class="hr" aria-label="${esc(T.tag)}" style="--smog:${smog}">
    <div class="hr-sky" aria-hidden="true"><i class="hr-st a" style="box-shadow:${hrStars(70, 1400, 260, 7)}"></i><i class="hr-st b" style="box-shadow:${hrStars(40, 1400, 220, 31)}"></i>
      <svg class="hr-mt" viewBox="0 0 1200 260" preserveAspectRatio="none">
        <defs><linearGradient id="hrM1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a6b9c"/><stop offset="1" stop-color="#2a3360"/></linearGradient>
          <linearGradient id="hrM2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3566"/><stop offset="1" stop-color="#141a3a"/></linearGradient></defs>
        <path fill="url(#hrM1)" d="M0 150 L70 120 L130 135 L210 70 L260 100 L320 55 L380 95 L450 60 L520 105 L600 40 L660 85 L730 60 L800 100 L880 50 L950 95 L1020 70 L1100 110 L1200 80 L1200 260 L0 260Z"/>
        <path fill="#e9eefb" opacity=".85" d="M190 86 L210 70 L228 84 L216 82 L206 90Z M300 68 L320 55 L340 70 L326 68 L314 75Z M430 72 L450 60 L468 74 L455 71 L446 78Z M578 54 L600 40 L622 56 L608 53 L598 61Z M860 62 L880 50 L900 64 L887 61 L876 68Z"/>
        <path fill="url(#hrM2)" d="M0 200 L90 165 L170 185 L260 150 L350 180 L440 155 L530 190 L640 160 L740 190 L840 165 L930 190 L1040 160 L1120 185 L1200 170 L1200 260 L0 260Z"/>
        <g class="hr-lights" fill="#ffd9a0">${Array.from({ length: 46 }, (_, i) => `<circle cx="${(i * 26.3 + (i % 3) * 7) % 1200}" cy="${226 + (i * 13) % 26}" r="${i % 4 ? 1.1 : 1.6}"/>`).join("")}</g>
      </svg><i class="hr-smog"></i><i class="hr-smog b"></i></div>
    <div class="hr-head"><span class="hr-pill"><img src="icons/favicon.svg" alt="" width="16" height="16"> ${esc(T.tag)} · ${D.live ? `<b class="live">${esc(T.live)}${air.updated ? " · " + esc(String(air.updated).slice(11, 16)) : ""}</b>` : ""}</span></div>
    <div class="hr-card" aria-live="off">
      ${D.live ? `<div class="hr-msgs"><div class="hr-a on">${esc(D.a1)}${D.a2 ? " " + esc(D.a2) : ""}</div></div>` : ""}
      <div class="hr-chips">${HR_Q.map(k => `<a href="#advisor" class="hr-chip" data-hq="${k}">${esc(typeof A === "function" ? A("q_" + k) : k)}</a>`).join("")}</div>
      <a class="hr-in" href="#advisor"><span class="hr-ph">${esc(T.ph)}</span><b class="hr-send" aria-hidden="true">↑</b></a>
    </div>
    <nav class="hr-dock">${dock.map(([h, k, s]) => `<a href="${h}" class="hr-di" aria-label="${esc(T.dock[k])}" data-tip="${esc(T.dock[k])}">${s}</a>`).join("")}</nav>
  </section>`;
}
const msBinRGB2 = a => (typeof msBinRGB === "function" ? msBinRGB(a) : [237, 180, 67]).join(",");
/* v58: подсказки открывают настоящего советника и задают вопрос (кнопка быстрого вопроса в разделе «Советник») */
function heroAnim(sec) {
  sec.querySelectorAll("[data-hq]").forEach(a => a.addEventListener("click", () => {
    const q = a.dataset.hq; let n = 0;
    const tryAsk = () => { const b = document.querySelector(`#view [data-q="${q}"]`); if (b) b.click(); else if (++n < 30) setTimeout(tryAsk, 150); };
    setTimeout(tryAsk, 200);
  }));
}
function heroMount(el) {
  if (!HERO_ON || el.querySelector(".hr")) return;
  document.documentElement.classList.add("hero-on");
  /* всегда ПОСЛЕ главной карточки AQI (она — первое, что видно), до второстепенных блоков */
  const h = el.querySelector(".hero"), html = heroHTML();
  if (h) h.insertAdjacentHTML("afterend", html); else el.insertAdjacentHTML("beforeend", html);
  heroAnim(el.querySelector(".hr"));
}
if (typeof views !== "undefined" && HERO_ON) { const _h = views.home; views.home = el => { _h(el); try { heroMount(el); } catch (e) { console.warn("hero:", e); } }; }
if (HERO_ON) { const v = document.getElementById("view"); if (v && v.classList.contains("v-home")) try { heroMount(v); } catch (e) {} }
