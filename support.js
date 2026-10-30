/* v88-proposal: «Поддержать проект» (#support). Только настоящие способы помочь и настоящие ссылки.
 * Блок пожертвований показывается, только если в config.js заполнен TAZA_CONFIG.SUPPORT; пустой = блока нет (никаких образцов жителям). */
"use strict";
const SP_URL = "https://lalalalallalalalalalala.github.io/taza-aba/", SP_REPO = "https://github.com/lalalalallalalalalalala/taza-aba";
const SP_T = {
  ru: { menu: "Поддержать проект", menuSub: "Как помочь «Таза Аба»: рассказать, сообщить об ошибке, поставить датчик", foot: "Поддержать проект",
    title: "Поддержать «Таза Аба»", lede: "«Таза Аба» показывает, чем дышит ваш район, и предупреждает о вечернем смоге. Приложение делает независимый автор, а не компания или госорган. Больше всего проекту помогают люди, которые им пользуются и рассказывают о нём другим.",
    f1: "Бесплатно", f2: "Без рекламы", f3: "Без регистрации", f4: "Открытые данные и код",
    help: "Как помочь", shareH: "Расскажите знакомым", shareP: "Чем больше людей знает о вечернем смоге, тем больше семей закрывает окна вовремя. Отправьте ссылку в семейный или домовой чат.",
    shareNative: "Поделиться", wa: "WhatsApp", tg: "Telegram", copy: "Скопировать ссылку", copied: "Ссылка скопирована", copyFail: "Не удалось скопировать — выделите ссылку вручную",
    qrH: "QR-код на сайт", qrP: "Для объявления в подъезде, школе или поликлинике. Открывает главную страницу.", qrDl: "Скачать QR (SVG)",
    shareText: "Таза Аба — качество воздуха и прогноз смога по районам Бишкека и городов Кыргызстана. Бесплатно, без рекламы:",
    appH: "Установите приложение", appP: "Оно открывается в одно касание и показывает последние данные даже без интернета.", appBtn: "Скачать приложение",
    bugH: "Сообщите об ошибке или предложите идею", bugP: "Неверная цифра, непонятный текст, не работает кнопка — напишите об этом. Обращения открыты на GitHub, нужен бесплатный аккаунт.", bugBtn: "Написать на GitHub", bugAll: "Все обращения",
    bugTitle: "", bugBody: "Что случилось или что предлагаете:\n\nГород и раздел приложения:\n\nТелефон или компьютер, браузер:\n",
    mail: "Почта проекта", tgCh: "Telegram проекта",
    senH: "Поставьте датчик воздуха", senP: "Там, где рядом есть датчик жителей Sensor.Community, приложение показывает настоящее измерение, а не только модель. Датчик собирают своими руками и вешают на балкон; нужны розетка и Wi-Fi. Его данные сразу попадают в открытую сеть и в «Таза Аба».",
    senGuide: "Инструкция по сборке", senMap: "Карта датчиков",
    senCov: "{city}: районов, где рядом сейчас есть измерение, — {c} из {n}. Дальше всего от датчика:", senNone: "{city}: сейчас рядом нет ни одного открытого датчика — все районы ({n}) показывают только модель CAMS. Ваш датчик здесь будет первым.", senMore: "Карта покрытия", km: "{v} км",
    kyH: "Помогите с кыргызским переводом", kyP: "Если в кыргызской версии фраза звучит неестественно или есть ошибка, пришлите, как правильно. Переключить язык — кнопка KG вверху.", kyBtn: "Предложить исправление",
    kyTitle: "Перевод на кыргызский: ", kyBody: "Где (раздел, экран):\n\nСейчас написано:\n\nКак правильно:\n",
    govH: "Расскажите акимату, школе или газете", govP: "Для акимата и мэрии есть памятка на одну страницу A4, для районной газеты — лист A5 на кыргызском и русском. Их можно распечатать или отправить в PDF.", govA4: "Памятка A4", govA5: "Лист A5 для газеты", govOpen: "Открытые данные",
    codeH: "Код и архив данных открыты", codeP: "Ежедневный архив качества воздуха по городам лежит на GitHub в CSV. Если вы разработчик или исследователь, можно пользоваться данными и предлагать улучшения.", codeRepo: "Репозиторий", codeArch: "Архив CSV",
    donH: "Поддержать деньгами", donP: "Поддержка добровольная и ни на что в приложении не влияет: всё остаётся бесплатным для всех.", donBtn: "Поддержать", donVia: "Поддержать на {n}", ext: "откроется в новой вкладке" },
  ky: { menu: "Долбоорду колдоо", menuSub: "«Таза Абага» кантип жардам берүү: айтуу, ката жөнүндө жазуу, датчик коюу", foot: "Долбоорду колдоо",
    title: "«Таза Абаны» колдоо", lede: "«Таза Аба» районуңуздун абасын көрсөтөт жана кечки түтүн жөнүндө эскертет. Тиркемени компания же мамлекеттик орган эмес, көз карандысыз автор жасайт. Долбоорго эң көп жардам — аны колдонгон жана башкаларга айткан адамдар.",
    f1: "Акысыз", f2: "Жарнамасыз", f3: "Каттоосуз", f4: "Ачык маалымат жана код",
    help: "Кантип жардам берүү", shareH: "Тааныштарыңызга айтыңыз", shareP: "Кечки түтүн жөнүндө канчалык көп адам билсе, ошончолук көп үй-бүлө терезесин өз убагында жабат. Шилтемени үй-бүлөлүк же үйдүн чатына жөнөтүңүз.",
    shareNative: "Бөлүшүү", wa: "WhatsApp", tg: "Telegram", copy: "Шилтемени көчүрүү", copied: "Шилтеме көчүрүлдү", copyFail: "Көчүрүү болбоду — шилтемени колу менен белгилеңиз",
    qrH: "Сайтка QR-код", qrP: "Подъезддеги, мектептеги же ооруканадагы жарыя үчүн. Башкы баракты ачат.", qrDl: "QR жүктөө (SVG)",
    shareText: "Таза Аба — Бишкектин райондору жана Кыргызстандын шаарлары боюнча абанын сапаты жана түтүн божомолу. Акысыз, жарнамасыз:",
    appH: "Тиркемени орнотуңуз", appP: "Бир басуу менен ачылат жана интернет жок болсо да акыркы маалыматты көрсөтөт.", appBtn: "Тиркемени жүктөө",
    bugH: "Ката жөнүндө жазыңыз же идея сунуштаңыз", bugP: "Туура эмес сан, түшүнүксүз текст, баскыч иштебейт — бул тууралуу жазыңыз. Кайрылуулар GitHubда ачык, акысыз аккаунт керек.", bugBtn: "GitHubга жазуу", bugAll: "Бардык кайрылуулар",
    bugTitle: "", bugBody: "Эмне болду же эмне сунуштайсыз:\n\nШаар жана тиркеменин бөлүмү:\n\nТелефон же компьютер, браузер:\n",
    mail: "Долбоордун почтасы", tgCh: "Долбоордун Telegramы",
    senH: "Аба датчигин коюңуз", senP: "Жанында Sensor.Community тургундарынын датчиги бар жерде тиркеме моделди гана эмес, чыныгы өлчөөнү көрсөтөт. Датчикти өзүңүз чогултуп, балконго илесиз; розетка жана Wi-Fi керек. Анын маалыматы дароо ачык тармакка жана «Таза Абага» түшөт.",
    senGuide: "Чогултуу нускамасы", senMap: "Датчиктердин картасы",
    senCov: "{city}: азыр жанында өлчөө {n} райондун {c} районунда бар. Датчиктен эң алыс:", senNone: "{city}: азыр жанында бир да ачык датчик жок — бардык {n} район CAMS моделин гана көрсөтөт. Сиздин датчик бул жерде биринчи болот.", senMore: "Камтуу картасы", km: "{v} км",
    kyH: "Кыргызча котормого жардам бериңиз", kyP: "Кыргызча версияда сүйлөм табигый эмес угулса же ката болсо, кантип туура экенин жибериңиз. Тилди которуу — жогорудагы KG баскычы.", kyBtn: "Оңдоону сунуштоо",
    kyTitle: "Кыргызча котормо: ", kyBody: "Кайда (бөлүм, экран):\n\nАзыр жазылганы:\n\nКантип туура:\n",
    govH: "Акимчиликке, мектепке же гезитке айтыңыз", govP: "Акимчилик жана мэрия үчүн A4 форматында бир барактык эскертме, райондук гезит үчүн кыргызча жана орусча A5 барак бар. Аларды басып чыгарууга же PDF кылып жөнөтүүгө болот.", govA4: "A4 эскертме", govA5: "Гезит үчүн A5 барак", govOpen: "Ачык маалымат",
    codeH: "Код жана маалымат архиви ачык", codeP: "Шаарлар боюнча абанын сапатынын күнүмдүк архиви GitHubда CSV түрүндө жатат. Иштеп чыгуучу же изилдөөчү болсоңуз, маалыматты колдонуп, жакшыртууларды сунуштай аласыз.", codeRepo: "Репозиторий", codeArch: "CSV архиви",
    donH: "Акча менен колдоо", donP: "Колдоо ыктыярдуу жана тиркемеге эч таасир этпейт: баары баарына акысыз бойдон калат.", donBtn: "Колдоо", donVia: "{n} аркылуу колдоо", ext: "жаңы өтмөктө ачылат" },
  en: { menu: "Support the project", menuSub: "How to help Taza Aba: share it, report a bug, set up a sensor", foot: "Support the project",
    title: "Support Taza Aba", lede: "Taza Aba shows what your district is breathing and warns about evening smog. It is built by an independent creator, not a company or a government body. What helps the project most is people who use it and tell others about it.",
    f1: "Free", f2: "No ads", f3: "No sign-up", f4: "Open data and code",
    help: "How to help", shareH: "Tell people you know", shareP: "The more people know about evening smog, the more families close their windows in time. Send the link to your family or building chat.",
    shareNative: "Share", wa: "WhatsApp", tg: "Telegram", copy: "Copy link", copied: "Link copied", copyFail: "Couldn't copy — select the link manually",
    qrH: "QR code to the site", qrP: "For a notice in your building, school or clinic. Opens the home page.", qrDl: "Download QR (SVG)",
    shareText: "Taza Aba — air quality and smog forecast by district for Bishkek and cities of Kyrgyzstan. Free, no ads:",
    appH: "Install the app", appP: "It opens in one tap and shows the latest data even without internet.", appBtn: "Download the app",
    bugH: "Report a bug or suggest an idea", bugP: "A wrong number, unclear text, a button that doesn't work — let us know. Issues are public on GitHub; a free account is needed.", bugBtn: "Write on GitHub", bugAll: "All issues",
    bugTitle: "", bugBody: "What happened or what do you suggest:\n\nCity and section of the app:\n\nPhone or computer, browser:\n",
    mail: "Project email", tgCh: "Project Telegram",
    senH: "Set up an air sensor", senP: "Where a Sensor.Community citizen sensor is nearby, the app shows a real measurement, not just the model. You build the sensor yourself and hang it on a balcony; it needs a power socket and Wi-Fi. Its data goes straight to the open network and into Taza Aba.",
    senGuide: "Build guide", senMap: "Sensor map",
    senCov: "{city}: {c} of {n} districts have a measurement nearby right now. Farthest from a sensor:", senNone: "{city}: there is no open sensor nearby right now — all {n} districts show only the CAMS model. Your sensor would be the first here.", senMore: "Coverage map", km: "{v} km",
    kyH: "Help with the Kyrgyz translation", kyP: "If a phrase in the Kyrgyz version sounds unnatural or has a mistake, send the correct wording. Switch language with the KG button at the top.", kyBtn: "Suggest a correction",
    kyTitle: "Kyrgyz translation: ", kyBody: "Where (section, screen):\n\nCurrent text:\n\nCorrect text:\n",
    govH: "Tell your akimat, school or newspaper", govP: "There is a one-page A4 brief for the akimat and city hall, and an A5 sheet in Kyrgyz and Russian for district newspapers. Print them or send them as PDF.", govA4: "A4 brief", govA5: "A5 newspaper sheet", govOpen: "Open data",
    codeH: "The code and data archive are open", codeP: "A daily air-quality archive for each city is on GitHub as CSV. If you are a developer or researcher, you can use the data and suggest improvements.", codeRepo: "Repository", codeArch: "CSV archive",
    donH: "Support with money", donP: "Donations are voluntary and change nothing in the app: everything stays free for everyone.", donBtn: "Support", donVia: "Support on {n}", ext: "opens in a new tab" } };
const SPT = (k, o) => { let s = (SP_T[LANG] || SP_T.ru)[k] ?? SP_T.ru[k]; if (o) for (const [a, b] of Object.entries(o)) s = s.split("{" + a + "}").join(b); return s; };
const SP_I = (p) => `<svg class="sp-i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${p}</svg>`;
const SP_IC = {
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
  phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
  msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M13 8H7M17 12H7"/>',
  radio: '<circle cx="12" cy="12" r="2"/><path d="M4.93 19.07a10 10 0 0 1 0-14.14M7.76 16.24a6 6 0 0 1 0-8.49M16.24 7.76a6 6 0 0 1 0 8.49M19.07 4.93a10 10 0 0 1 0 14.14"/>',
  lang: '<path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>',
  landmark: '<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l8 5H4z"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  copy: '<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  dl: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>' };
const spE = encodeURIComponent;
const spExt = (href, label, cls = "sp-btn2") => `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)}${SP_I(SP_IC.ext)}<span class="sr-only"> (${esc(SPT("ext"))})</span></a>`;
const spIssue = (title, body) => `${SP_REPO}/issues/new?title=${spE(title)}&body=${spE(body)}`;
async function spCopy(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (e) {
    try { const ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); return ok; } catch (_) { return false; } } }
/* живая строка покрытия датчиками — те же данные, что слой «Покрытие датчиками» на карте и карточка в #gov */
function spCoverage() {
  try { if (typeof covData !== "function" || !air || air.status === "loading") return "";
    const D = covData(); if (!D.n) return ""; const city = tr(cityObj().name);
    if (!D.c) return `<p class="sp-cov">${esc(SPT("senNone", { city, n: D.n }))}</p>`;
    if (!D.un.length) return "";
    const far = D.un.filter(x => x.km != null).slice(0, 3).map(x => `<li><span>${esc(dName(x.d))}</span><b>${esc(SPT("km", { v: fmt(x.km, 1) }))}</b></li>`).join("");
    return `<div class="sp-cov"><p>${esc(SPT("senCov", { city, c: D.c, n: D.n }))}</p>${far ? `<ul>${far}</ul>` : ""}<a href="#map" class="sp-lnk" data-sp-cov>${esc(SPT("senMore"))}</a></div>`;
  } catch (e) { return ""; } }
/* поддержка деньгами: только одна ссылка https из config.js (без имён, телефонов и номеров кошельков); пусто = блока нет */
function spDonate() {
  const S = (window.TAZA_CONFIG && TAZA_CONFIG.SUPPORT) || {};
  const val = k => (typeof S[k] === "string" ? S[k].trim() : "");
  const link = val("link"); if (!/^https:\/\/[^\s]+$/.test(link)) return "";
  const note = val("note_" + LANG) || val("note_ru");
  return `<section class="card sp-don" aria-labelledby="spDonH"><div class="sp-h"><span class="sp-ic">${SP_I(SP_IC.wallet)}</span><h2 id="spDonH">${esc(SPT("donH"))}</h2></div>
    <p>${esc(SPT("donP"))}</p>${note ? `<p class="sp-note">${esc(note)}</p>` : ""}
    <div class="sp-row">${spExt(link, val("linkName") ? SPT("donVia", { n: val("linkName") }) : SPT("donBtn"), "sp-btn")}</div></section>`;
}
function viewSupport(el) {
  const C = window.TAZA_CONFIG || {}, url = SP_URL, txt = SPT("shareText");
  const senLang = LANG === "en" ? "en" : "ru";
  const contacts = [C.PROJECT_EMAIL ? `<a class="sp-btn2" href="mailto:${esc(C.PROJECT_EMAIL)}">${esc(SPT("mail"))}</a>` : "", C.PROJECT_TG ? spExt("https://t.me/" + String(C.PROJECT_TG).replace(/^@/, ""), SPT("tgCh")) : ""].join("");
  const card = (ic, id, h, p, body, cls = "") => `<section class="card sp-card ${cls}" aria-labelledby="${id}"><div class="sp-h"><span class="sp-ic">${SP_I(SP_IC[ic])}</span><h2 id="${id}">${esc(h)}</h2></div><p>${esc(p)}</p>${body}</section>`;
  el.innerHTML = `<div class="sp">
    <header class="sp-hero"><h1>${esc(SPT("title"))}</h1><p class="sp-lede">${esc(SPT("lede"))}</p>
      <ul class="sp-facts">${["f1", "f2", "f3", "f4"].map(k => `<li>${SP_I(SP_IC.check)}${esc(SPT(k))}</li>`).join("")}</ul></header>
    <h2 class="sp-sec">${esc(SPT("help"))}</h2>
    <div class="sp-grid">
      <section class="card sp-card sp-share" aria-labelledby="spShH"><div class="sp-share-main"><div class="sp-h"><span class="sp-ic">${SP_I(SP_IC.share)}</span><h2 id="spShH">${esc(SPT("shareH"))}</h2></div><p>${esc(SPT("shareP"))}</p>
        <div class="sp-row">
          <button type="button" class="sp-btn" id="spNative" hidden>${SP_I(SP_IC.share)}${esc(SPT("shareNative"))}</button>
          <a class="sp-btn2" href="https://wa.me/?text=${spE(txt + " " + url)}" target="_blank" rel="noopener">${SP_I(SP_IC.chat)}${esc(SPT("wa"))}<span class="sr-only"> (${esc(SPT("ext"))})</span></a>
          <a class="sp-btn2" href="https://t.me/share/url?url=${spE(url)}&text=${spE(txt)}" target="_blank" rel="noopener">${SP_I(SP_IC.send)}${esc(SPT("tg"))}<span class="sr-only"> (${esc(SPT("ext"))})</span></a>
          <button type="button" class="sp-btn2" id="spCopy">${SP_I(SP_IC.copy)}${esc(SPT("copy"))}</button></div>
        <p class="sp-url"><code>${esc(url)}</code></p></div>
        <figure class="sp-qr"><img src="icons/qr-support.svg" alt="QR: ${esc(url)}" width="132" height="132"><figcaption><b>${esc(SPT("qrH"))}</b><span>${esc(SPT("qrP"))}</span><a class="sp-lnk" href="icons/qr-support.svg" download="taza-aba-qr.svg">${SP_I(SP_IC.dl)}${esc(SPT("qrDl"))}</a></figcaption></figure></section>
      ${card("phone", "spAppH", SPT("appH"), SPT("appP"), `<div class="sp-row"><a class="sp-btn" href="#download">${SP_I(SP_IC.dl)}${esc(SPT("appBtn"))}</a></div>`)}
      ${card("msg", "spBugH", SPT("bugH"), SPT("bugP"), `<div class="sp-row">${spExt(spIssue(SPT("bugTitle"), SPT("bugBody")), SPT("bugBtn"), "sp-btn")}${spExt(SP_REPO + "/issues", SPT("bugAll"))}${contacts}</div>`)}
      ${card("radio", "spSenH", SPT("senH"), SPT("senP"), `<div id="spCovSlot">${spCoverage()}</div><div class="sp-row">${spExt(`https://sensor.community/${senLang}/sensors/airrohr/`, SPT("senGuide"), "sp-btn")}${spExt("https://maps.sensor.community/", SPT("senMap"))}</div>`)}
      ${card("lang", "spKyH", SPT("kyH"), SPT("kyP"), `<div class="sp-row">${spExt(spIssue(SPT("kyTitle"), SPT("kyBody")), SPT("kyBtn"), "sp-btn")}</div>`)}
      ${card("landmark", "spGovH", SPT("govH"), SPT("govP"), `<div class="sp-row"><a class="sp-btn" href="#govbrief">${esc(SPT("govA4"))}</a><a class="sp-btn2" href="#govbrief/gazeta/${LANG === "ky" ? "ky" : "ru"}">${esc(SPT("govA5"))}</a><a class="sp-btn2" href="#gov">${esc(SPT("govOpen"))}</a></div>`)}
      ${card("code", "spCodeH", SPT("codeH"), SPT("codeP"), `<div class="sp-row">${spExt(SP_REPO, SPT("codeRepo"))}${spExt(SP_REPO + "/tree/main/archive", SPT("codeArch"))}</div>`, "sp-code")}
    </div>
    ${spDonate()}
  </div>`;
  const nb = el.querySelector("#spNative");
  if (navigator.share) { nb.hidden = false; nb.onclick = async () => { try { await navigator.share({ title: "Таза Аба", text: txt, url }); } catch (e) { /* отменено */ } }; }
  el.querySelector("#spCopy").onclick = async () => toast((await spCopy(url)) ? SPT("copied") : SPT("copyFail"));
    /* данные о воздухе приходят позже, чем рисуется раздел — дорисовать строку покрытия, когда они появятся */
  const slot = el.querySelector("#spCovSlot"); let tries = 0, last = spCoverage();
  const fill = () => { if (!slot.isConnected) return; const h = spCoverage(); if (h && h !== last) { last = h; slot.innerHTML = h; bindCov(); } if (++tries < 40) setTimeout(fill, 1500); };
  const bindCov = () => { const cv = el.querySelector("[data-sp-cov]"); if (cv) cv.onclick = () => { try { if (typeof mapLayers !== "undefined") mapLayers.cov = true; } catch (e) {} }; };
  bindCov(); setTimeout(fill, 1500);
}
if (typeof NAV_ICO !== "undefined") NAV_ICO.support = '<svg viewBox="0 0 24 24" aria-hidden="true">' + SP_IC.heart + '</svg>';
if (typeof views !== "undefined") { views.support = viewSupport; TAB_OF.support = "more";
  const m0 = views.more; views.more = el => { m0(el); const g = el.querySelector(".more-grid"); if (g && !g.querySelector(".sp-tile")) g.insertAdjacentHTML("beforeend", `<a href="#support" class="card more-tile sp-tile"><span class="mt-e">${navIco("support")}</span><b>${esc(SPT("menu"))}</b><small>${esc(SPT("menuSub"))}</small></a>`); };
  /* ссылка в подвале главной и «Ещё» */
  const addFoot = el => { el.querySelectorAll(".foot").forEach(f => { if (f.querySelector(".sp-foot")) return; f.insertAdjacentHTML("beforeend", ` · <a class="sp-foot" href="#support">${esc(SPT("foot"))}</a>`); }); };
  const h0 = views.home; views.home = el => { h0(el); addFoot(el); };
  const m1 = views.more; views.more = el => { m1(el); addFoot(el); };
  const rc = renderChrome; renderChrome = function () { const r = rc.apply(this, arguments); document.querySelectorAll('.tabbar a[data-tab="support"] span').forEach(s => s.textContent = SPT("menu")); return r; };
  if ((location.hash || "").startsWith("#support")) setTimeout(() => { try { route(true); } catch (e) {} }, 0); }
