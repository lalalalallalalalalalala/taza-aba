/* v45: «Скачать приложение» (#download) — Windows (Neutralino exe), Linux (.deb/.pkg.tar.zst/.tar.gz), Android, установка PWA. Файлы — ассеты GitHub Release, не в репозитории. */
const DL = { tag: "app-v44", ver: "v44", base: "https://github.com/lalalalallalalalalalala/taza-aba/releases/download/app-v44/", rel: "https://github.com/lalalalallalalalalalala/taza-aba/releases/tag/app-v44",
  files: { exe: { n: "TazaAba.exe", mb: 22.3 }, zip: { n: "TazaAba-Windows-portable.zip", mb: 7.4 }, apk: { n: "TazaAba.apk", mb: 0.12 },
    deb: { n: "taza-aba_1.0.44-1_amd64.deb", mb: 5.4 }, debA: { n: "taza-aba_1.0.44-1_arm64.deb", mb: 5.3 }, pac: { n: "taza-aba-1.0.44-1-x86_64.pkg.tar.zst", mb: 5.7 }, pacA: { n: "taza-aba-1.0.44-1-aarch64.pkg.tar.zst", mb: 5.7 },
    tgz: { n: "TazaAba-linux-x64.tar.gz", mb: 7.3 }, tgzA: { n: "TazaAba-linux-arm64.tar.gz", mb: 7.3 } } };
const DL_T = {
  ru: { menu: "Скачать приложение", menuSub: "Windows, Linux, Android, установка с сайта", title: "Таза Аба — приложения", sub: "Тот же сервис качества воздуха — отдельным окном на компьютере и в телефоне. Бесплатно, без рекламы и регистрации.",
    win: "Windows", winSub: "Windows 10/11 · 64-бит · без установки", exe: "Скачать .exe", zip: "Портативный .zip", and: "Android", andSub: "Android 7+ · APK", soon: "Скоро", apk: "Скачать .apk",
    pwa: "Установить с сайта (PWA)", pwaSub: "Самый лёгкий вариант: работает офлайн, обновляется сам. Chrome/Edge: меню ⋮ → «Установить приложение»; iPhone (Safari): «Поделиться» → «На экран „Домой“».", pwaBtn: "Установить", pwaDone: "Уже установлено или браузер не поддерживает установку — используйте меню браузера.",
    how: "Как установить", hWin: "Windows может показать SmartScreen «Windows защитила ваш компьютер» — файл не подписан сертификатом издателя. Нажмите «Подробнее» → «Выполнить в любом случае». Нужен WebView2 (есть в Windows 10/11).",
    hAnd: "Разрешите установку из этого источника: Настройки → Безопасность → «Установка неизвестных приложений» для браузера, затем откройте скачанный APK.", ver: "Версия {v}", size: "{s} МБ", all: "Все файлы релиза на GitHub", home: "📲 Приложения для Windows, Linux и Android", lin: "Linux", linSub: "Debian/Ubuntu, Arch · 64-бит (x64 и ARM64)", deb: "Debian / Ubuntu .deb", pac: "Arch .pkg.tar.zst", tgz: "Портативный .tar.gz", arm: "ARM64:", hLin: "Установка: в папке с файлом выполните команду ниже. Нужны WebKitGTK и GTK3 — менеджер пакетов поставит их сам.", homeSub: "Скачать" },
  ky: { menu: "Тиркемени жүктөө", menuSub: "Windows, Linux, Android, сайттан орнотуу", title: "Таза Аба — тиркемелер", sub: "Ошол эле аба сапаты кызматы — компьютерде жана телефондо өзүнчө терезе менен. Акысыз, жарнамасыз жана каттоосуз.",
    win: "Windows", winSub: "Windows 10/11 · 64-бит · орнотуусуз", exe: ".exe жүктөө", zip: "Портативдүү .zip", and: "Android", andSub: "Android 7+ · APK", soon: "Жакында", apk: ".apk жүктөө",
    pwa: "Сайттан орнотуу (PWA)", pwaSub: "Эң жеңил жолу: офлайн иштейт, өзү жаңыланат. Chrome/Edge: ⋮ меню → «Тиркемени орнотуу»; iPhone (Safari): «Бөлүшүү» → «Башкы экранга».", pwaBtn: "Орнотуу", pwaDone: "Орнотулган же браузер орнотууну колдобойт — браузердин менюсун колдонуңуз.",
    how: "Кантип орнотуу керек", hWin: "Windows SmartScreen «Windows компьютериңизди коргоду» деп көрсөтүшү мүмкүн — файл басып чыгаруучунун сертификаты менен кол коюлган эмес. «Кененирээк» → «Баары бир аткаруу» басыңыз. WebView2 керек (Windows 10/11де бар).",
    hAnd: "Бул булактан орнотууга уруксат бериңиз: Жөндөөлөр → Коопсуздук → браузер үчүн «Белгисиз тиркемелерди орнотуу», андан кийин жүктөлгөн APKны ачыңыз.", ver: "Версия {v}", size: "{s} МБ", all: "GitHubдагы релиздин бардык файлдары", home: "📲 Windows, Linux жана Android үчүн тиркемелер", lin: "Linux", linSub: "Debian/Ubuntu, Arch · 64-бит (x64 жана ARM64)", deb: "Debian / Ubuntu .deb", pac: "Arch .pkg.tar.zst", tgz: "Портативдүү .tar.gz", arm: "ARM64:", hLin: "Орнотуу: файл жаткан папкада төмөнкү буйрукту аткарыңыз. WebKitGTK жана GTK3 керек — пакет менеджери өзү орнотот.", homeSub: "Жүктөө" },
  en: { menu: "Download the app", menuSub: "Windows, Linux, Android, install from the site", title: "Taza Aba — apps", sub: "The same air-quality service in its own window on your computer and phone. Free, no ads, no sign-up.",
    win: "Windows", winSub: "Windows 10/11 · 64-bit · no installation", exe: "Download .exe", zip: "Portable .zip", and: "Android", andSub: "Android 7+ · APK", soon: "Coming soon", apk: "Download .apk",
    pwa: "Install from the site (PWA)", pwaSub: "The lightest option: works offline and updates itself. Chrome/Edge: ⋮ menu → “Install app”; iPhone (Safari): Share → “Add to Home Screen”.", pwaBtn: "Install", pwaDone: "Already installed or your browser can't install here — use the browser menu.",
    how: "How to install", hWin: "Windows may show SmartScreen “Windows protected your PC” because the file isn't signed with a publisher certificate. Click “More info” → “Run anyway”. Requires WebView2 (built into Windows 10/11).",
    hAnd: "Allow installs from this source: Settings → Security → “Install unknown apps” for your browser, then open the downloaded APK.", ver: "Version {v}", size: "{s} MB", all: "All release files on GitHub", home: "📲 Apps for Windows, Linux and Android", lin: "Linux", linSub: "Debian/Ubuntu, Arch · 64-bit (x64 and ARM64)", deb: "Debian / Ubuntu .deb", pac: "Arch .pkg.tar.zst", tgz: "Portable .tar.gz", arm: "ARM64:", hLin: "To install, run the command below in the folder with the file. Needs WebKitGTK and GTK3 — your package manager pulls them in.", homeSub: "Download" } };
const DT = (k, o) => { let s = (DL_T[LANG] || DL_T.ru)[k] ?? DL_T.ru[k]; if (o) for (const [a, b] of Object.entries(o)) s = s.split("{" + a + "}").join(b); return s; };
let dlPrompt = null; addEventListener("beforeinstallprompt", e => { e.preventDefault(); dlPrompt = e; });
const DL_IC = { win: '<svg viewBox="0 0 24 24"><path d="M3 5.5l7.5-1v7H3zM11.5 4.3L21 3v8.5h-9.5zM3 12.5h7.5v7L3 18.5zM11.5 12.5H21V21l-9.5-1.3z"/></svg>', and: '<svg viewBox="0 0 24 24"><path d="M7 9h10v8a1 1 0 01-1 1h-1v3h-2v-3h-2v3H9v-3H8a1 1 0 01-1-1zM5 9.5v6M19 9.5v6M8 8a4 4 0 018 0zM9 4l1 1.6M15 4l-1 1.6"/></svg>', lin: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M7 9l2.5 2L7 13M12 13h4M9 21h6M12 17v4"/></svg>', pwa: '<svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M5 19h14"/></svg>' };
const dlSize = f => fmt(f.mb, 1);
function viewDownload(el) { const F = DL.files, A = F.apk;
  el.innerHTML = `<div class="dl"><div class="dl-head"><img src="icons/icon-192.png" alt="" width="72" height="72"><div><h1>${esc(DT("title"))}</h1><p class="sub">${esc(DT("sub"))}</p><span class="dl-ver">${esc(DT("ver", { v: DL.ver }))}</span></div></div>
    <div class="dl-grid">
      <div class="card dl-card"><i class="dl-ic win">${DL_IC.win}</i><h2>${esc(DT("win"))}</h2><p>${esc(DT("winSub"))}</p>
        <a class="dl-btn" href="${DL.base + F.exe.n}" download>${esc(DT("exe"))}<small>${esc(F.exe.n)} · ${esc(DT("size", { s: dlSize(F.exe) }))}</small></a>
        <a class="dl-btn2" href="${DL.base + F.zip.n}" download>${esc(DT("zip"))} · ${esc(DT("size", { s: dlSize(F.zip) }))}</a>
        <p class="dl-note">🛡️ ${esc(DT("hWin"))}</p></div>
      <div class="card dl-card"><i class="dl-ic lin">${DL_IC.lin}</i><h2>${esc(DT("lin"))}</h2><p>${esc(DT("linSub"))}</p>
        <a class="dl-btn" href="${DL.base + F.deb.n}" download>${esc(DT("deb"))}<small>${esc(F.deb.n)} · ${esc(DT("size", { s: dlSize(F.deb) }))}</small></a>
        <code class="dl-cmd">sudo apt install ./taza-aba_*.deb</code>
        <a class="dl-btn" href="${DL.base + F.pac.n}" download>${esc(DT("pac"))}<small>${esc(F.pac.n)} · ${esc(DT("size", { s: dlSize(F.pac) }))}</small></a>
        <code class="dl-cmd">sudo pacman -U taza-aba-*.pkg.tar.zst</code>
        <a class="dl-btn2" href="${DL.base + F.tgz.n}" download>${esc(DT("tgz"))} · ${esc(DT("size", { s: dlSize(F.tgz) }))}</a>
        <p class="dl-arm">${esc(DT("arm"))} <a href="${DL.base + F.debA.n}" download>.deb</a> · <a href="${DL.base + F.pacA.n}" download>.pkg.tar.zst</a> · <a href="${DL.base + F.tgzA.n}" download>.tar.gz</a></p>
        <p class="dl-note">🐧 ${esc(DT("hLin"))}</p></div>
      <div class="card dl-card"><i class="dl-ic and">${DL_IC.and}</i><h2>${esc(DT("and"))}</h2><p>${esc(DT("andSub"))}</p>
        ${A ? `<a class="dl-btn" href="${DL.base + A.n}" download>${esc(DT("apk"))}<small>${esc(A.n)} · ${esc(DT("size", { s: dlSize(A) }))}</small></a>` : `<span class="dl-btn dis" aria-disabled="true">${esc(DT("soon"))}</span>`}
        <p class="dl-note">📲 ${esc(DT("hAnd"))}</p></div>
      <div class="card dl-card"><i class="dl-ic pwa">${DL_IC.pwa}</i><h2>${esc(DT("pwa"))}</h2><p>${esc(DT("pwaSub"))}</p>
        <button type="button" class="dl-btn" id="dlPwa">${esc(DT("pwaBtn"))}</button></div></div>
    <p class="dl-all"><a href="${DL.rel}" target="_blank" rel="noopener">${esc(DT("all"))} ↗</a></p></div>`;
  el.querySelector("#dlPwa").onclick = async () => { if (dlPrompt) { dlPrompt.prompt(); try { await dlPrompt.userChoice; } catch (e) {} dlPrompt = null; } else toast(DT("pwaDone")); };
}
if (typeof views !== "undefined") { views.download = viewDownload; TAB_OF.download = "more";
  if (typeof viewMore2 === "function") { const m0 = views.more; views.more = el => { m0(el); const g = el.querySelector(".more-grid"); if (g) g.insertAdjacentHTML("afterbegin", `<a href="#download" class="card more-tile dl-tile"><span class="mt-e">${DL_IC.pwa}</span><b>${esc(DT("menu"))}</b><small>${esc(DT("menuSub"))}</small></a>`); }; }
  const h0 = views.home; views.home = el => { h0(el); if (el.querySelector(".dl-home")) return; const f = el.querySelector(".foot"); const html = `<a href="#download" class="card dl-home"><span>${esc(DT("home"))}</span><em>${esc(DT("homeSub"))} →</em></a>`; if (f) f.insertAdjacentHTML("beforebegin", html); else el.insertAdjacentHTML("beforeend", html); };
  if (location.hash.startsWith("#download")) setTimeout(() => { try { route(true); } catch (e) {} }, 0); }
