/* Таза Аба — аккаунты со сквозным шифрованием.
 * Локальный режим (по умолчанию): всё в IndexedDB «tazaAba-accounts» ТОЛЬКО шифротекстом (AES-GCM 256),
 *   ключ = PBKDF2-SHA256(пароль, случайная соль 16 байт, 310 000 итераций), живёт только в памяти; автоблокировка.
 * Серверный режим (если в config.js заданы SUPABASE_URL и SUPABASE_ANON_KEY): вход с любого устройства.
 *   Supabase получает НЕ пароль, а authPw = PBKDF2(пароль, "tazaaba-auth:"+email) — из него нельзя получить ключ шифрования
 *   (ключ выводится с другой, случайной солью). В таблицу taza_profiles и в бакет taza-aba-avatars уходит только шифротекст.
 * Без аналитики: счётчик посещений не знает про аккаунты; координаты дома не попадают в ссылки «поделиться». */
"use strict";
const AC_T = {
  ru: { noIdb: "Хранилище браузера (IndexedDB) недоступно — например, в приватном режиме или если запрещено сохранять данные сайтов. Аккаунты на этом устройстве не работают; остальная часть «Таза Аба» доступна.", acc: "Аккаунт", accSub: "Имя, фото, дом и избранное — зашифровано на устройстве", create: "Создать аккаунт", unlock: "Войти", name: "Имя", pw: "Пароль (не короче 8 символов)", pw2: "Пароль ещё раз",
    photo: "Фото профиля (необязательно)", ack: "Я понимаю: пароль нельзя восстановить. Без него данные не расшифровать — ни мне, ни разработчикам.", warn: "⚠️ Пароль не восстанавливается. Запишите его или сделайте резервную копию.",
    pick: "Аккаунт на этом устройстве", accN: "Аккаунт {n}", wrong: "Неверный пароль", short: "Пароль слишком короткий", mism: "Пароли не совпадают", needAck: "Подтвердите, что поняли про пароль", needName: "Укажите имя",
    working: "Шифрую… (PBKDF2, 310 000 итераций)", lock: "🔒 Заблокировать", logout: "Выйти", locked: "Аккаунт заблокирован", lockedAuto: "Аккаунт заблокирован после бездействия", hi: "Вы вошли как {n}",
    guest: "Гостевой режим: данные хранятся как раньше, без аккаунта.", none: "На этом устройстве пока нет аккаунтов.", orCreate: "или создайте новый",
    home: "Дом", work: "Работа / учёба (необязательно)", byD: "Район", byPin: "Точка на карте", noneOpt: "Не указано", pinHint: "Нажмите на карту, чтобы поставить точку.", saved: "Сохранено (зашифровано)",
    fav: "Избранные районы", favAdd: "➕ Добавить текущий район", favNone: "Пока нет избранных районов.", del: "Удалить", settings: "Настройки", autolock: "Автоблокировка", min: "{n} мин", thr: "Предупреждать дома при AQI выше",
    accent: "Цвет оформления", green: "Зелёная", blue: "Голубая", backup: "Резервная копия", exp: "⬇️ Скачать зашифрованную копию (.tazaaba)", imp: "⬆️ Импорт копии", impOk: "Копия импортирована — войдите с её паролем", impBad: "Это не файл резервной копии Таза Аба",
    delAcc: "Удалить аккаунт", delAsk: "Введите пароль, чтобы удалить аккаунт навсегда", delDone: "Аккаунт удалён", privacy: "Конфиденциальность", photoCh: "Сменить фото",
    atHome: "🏠 Дома: AQI {a} — {l}", atWork: "🏢 Работа/учёба: AQI {a} — {l}", badHome: "Дома сейчас плохой воздух (AQI {a}). Закройте окна, включите очиститель, если есть.", setHome: "🏠 Укажите дом в аккаунте — покажем воздух у дома.",
    srv: "Вход с любого устройства", srvSub: "Серверный режим: Supabase хранит только шифротекст.", email: "Email", srvOff: "Скоро: вход с других устройств. Сейчас аккаунт работает только на этом устройстве.",
    signin: "Войти по email", signup: "Создать аккаунт с email", confirm: "Проверьте почту и подтвердите email, затем войдите.", srvErr: "Сервер не ответил: {e}", synced: "Синхронизировано", local: "Только на этом устройстве", remote: "Синхронизация с сервером", rem: "Запомнить меня на этом устройстве", remHint: "Ключ хранится в браузере в неизвлекаемом виде; любой, у кого есть доступ к этому разблокированному устройству, сможет открыть профиль.", lockRem: "Автоблокировка и на запомненном устройстве", outAll: "Выйти на всех устройствах", sessGone: "Сессия завершена — войдите снова", mail: "Почта", linkEm: "Привязать почту", linkSub: "Вход по email с любого устройства и сброс пароля по ссылке. Адрес нужно подтвердить по письму.", emOff: "Появится после подключения сервера", emPend: "Письмо отправлено на {e}. Откройте ссылку из письма на этом устройстве — после этого почта будет привязана.", emOk: "Почта привязана: {e}", emCheck: "Я подтвердил(а) — проверить", pwNow: "Текущий пароль", forgot: "Забыли пароль?", rc: "Код восстановления", rcShow: "Сохраните код в надёжном месте — он показывается только сейчас. С ним можно задать новый пароль и не потерять данные.", rcDone: "Я сохранил(а) код", copy: "Копировать", copied: "Скопировано", rcHas: "Код восстановления создан. Можно создать новый — старый перестанет работать.", rcNone: "У этого аккаунта нет кода восстановления: забытый пароль = потерянные данные. Создайте код.", rcNew: "Создать новый код", newPw: "Новый пароль (не короче 8 символов)", rcBad: "Код не подходит", rcOk: "Пароль изменён, данные сохранены", rcSet: "Задать новый пароль", resetMail: "Сбросить пароль по email", resetSent: "Если адрес зарегистрирован, мы отправили письмо со ссылкой.", resetT: "Новый пароль после сброса по почте", resetNo: "Без кода восстановления зашифрованные данные расшифровать нельзя — профиль начнётся заново.", resetFresh: "Начать профиль заново" },
  ky: { noIdb: "Браузердин сактагычы (IndexedDB) жеткиликсиз — мисалы, жеке режимде же сайттардын маалыматын сактоо тыюу салынганда. Бул түзмөктө аккаунттар иштебейт; «Таза Абанын» калган бөлүгү иштейт.", acc: "Аккаунт", accSub: "Аты, сүрөтү, үйү жана тандалгандар — түзмөктө шифрленет", create: "Аккаунт түзүү", unlock: "Кирүү", name: "Аты", pw: "Сырсөз (8 белгиден кем эмес)", pw2: "Сырсөздү кайталаңыз",
    photo: "Профиль сүрөтү (милдеттүү эмес)", ack: "Түшүнөм: сырсөздү калыбына келтирүү мүмкүн эмес. Ансыз маалыматты эч ким — мен да, иштеп чыгуучулар да — ача албайт.", warn: "⚠️ Сырсөз калыбына келбейт. Жазып алыңыз же резервдик көчүрмө жасаңыз.",
    pick: "Бул түзмөктөгү аккаунт", accN: "Аккаунт {n}", wrong: "Сырсөз туура эмес", short: "Сырсөз өтө кыска", mism: "Сырсөздөр дал келбейт", needAck: "Сырсөз тууралуу түшүнгөнүңүздү ырастаңыз", needName: "Атыңызды жазыңыз",
    working: "Шифрленүүдө… (PBKDF2, 310 000 итерация)", lock: "🔒 Кулпулоо", logout: "Чыгуу", locked: "Аккаунт кулпуланды", lockedAuto: "Аракетсиздиктен кийин аккаунт кулпуланды", hi: "Сиз {n} катары кирдиңиз",
    guest: "Конок режими: маалымат мурдагыдай, аккаунтсуз сакталат.", none: "Бул түзмөктө азырынча аккаунт жок.", orCreate: "же жаңысын түзүңүз",
    home: "Үй", work: "Жумуш / окуу (милдеттүү эмес)", byD: "Район", byPin: "Картадагы чекит", noneOpt: "Көрсөтүлгөн эмес", pinHint: "Чекит коюу үчүн картаны басыңыз.", saved: "Сакталды (шифрленген)",
    fav: "Тандалган райондор", favAdd: "➕ Учурдагы районду кошуу", favNone: "Азырынча тандалган район жок.", del: "Өчүрүү", settings: "Жөндөөлөр", autolock: "Автокулпулоо", min: "{n} мүн", thr: "Үйдө AQI ушундан жогору болсо эскертүү",
    accent: "Түс", green: "Жашыл", blue: "Көгүлтүр", backup: "Резервдик көчүрмө", exp: "⬇️ Шифрленген көчүрмөнү жүктөө (.tazaaba)", imp: "⬆️ Көчүрмөнү импорттоо", impOk: "Көчүрмө импорттолду — анын сырсөзү менен кириңиз", impBad: "Бул Таза Аба резервдик көчүрмөсү эмес",
    delAcc: "Аккаунтту өчүрүү", delAsk: "Аккаунтту биротоло өчүрүү үчүн сырсөздү жазыңыз", delDone: "Аккаунт өчүрүлдү", privacy: "Купуялуулук", photoCh: "Сүрөттү алмаштыруу",
    atHome: "🏠 Үйдө: AQI {a} — {l}", atWork: "🏢 Жумуш/окуу: AQI {a} — {l}", badHome: "Үйдө азыр аба начар (AQI {a}). Терезелерди жабыңыз, тазалагыч болсо күйгүзүңүз.", setHome: "🏠 Аккаунтта үйүңүздү көрсөтүңүз — үйдүн жанындагы абаны көрсөтөбүз.",
    srv: "Каалаган түзмөктөн кирүү", srvSub: "Сервер режими: Supabase шифротекстти гана сактайт.", email: "Email", srvOff: "Жакында: башка түзмөктөрдөн кирүү. Азыр аккаунт ушул түзмөктө гана иштейт.",
    signin: "Email менен кирүү", signup: "Email менен аккаунт түзүү", confirm: "Почтаңызды текшерип, email'ди ырастаңыз, анан кириңиз.", srvErr: "Сервер жооп берген жок: {e}", synced: "Шайкештирилди", local: "Ушул түзмөктө гана", remote: "Сервер менен шайкештирүү", rem: "Мени ушул түзмөктө эстеп кал", remHint: "Ачкыч браузерде алынбай турган түрдө сакталат; бул кулпусу ачык түзмөккө жеткен ар бир адам профилди ача алат.", lockRem: "Эстелген түзмөктө да автокулпулоо", outAll: "Бардык түзмөктөрдөн чыгуу", sessGone: "Сессия бүттү — кайра кириңиз", mail: "Почта", linkEm: "Почтаны байлоо", linkSub: "Каалаган түзмөктөн email менен кирүү жана шилтеме аркылуу сырсөздү жаңылоо. Даректи кат аркылуу ырастоо керек.", emOff: "Сервер туташтырылгандан кийин пайда болот", emPend: "Кат {e} дарегине жөнөтүлдү. Каттагы шилтемени ушул түзмөктө ачыңыз — андан кийин почта байланат.", emOk: "Почта байланды: {e}", emCheck: "Ырастадым — текшерүү", pwNow: "Учурдагы сырсөз", forgot: "Сырсөздү унуттуңузбу?", rc: "Калыбына келтирүү коду", rcShow: "Кодду ишенимдүү жерге сактаңыз — ал азыр гана көрсөтүлөт. Аны менен маалыматты жоготпой жаңы сырсөз коюуга болот.", rcDone: "Кодду сактадым", copy: "Көчүрүү", copied: "Көчүрүлдү", rcHas: "Калыбына келтирүү коду түзүлгөн. Жаңысын түзсөңүз болот — эскиси иштебей калат.", rcNone: "Бул аккаунтта калыбына келтирүү коду жок: унутулган сырсөз = жоголгон маалымат. Код түзүңүз.", rcNew: "Жаңы код түзүү", newPw: "Жаңы сырсөз (8 белгиден кем эмес)", rcBad: "Код туура эмес", rcOk: "Сырсөз өзгөртүлдү, маалымат сакталды", rcSet: "Жаңы сырсөз коюу", resetMail: "Сырсөздү email аркылуу жаңылоо", resetSent: "Эгер дарек катталган болсо, шилтеме менен кат жөнөттүк.", resetT: "Почта аркылуу жаңылагандан кийинки жаңы сырсөз", resetNo: "Калыбына келтирүү кодусуз шифрленген маалыматты ачуу мүмкүн эмес — профиль жаңыдан башталат.", resetFresh: "Профилди жаңыдан баштоо" },
  en: { noIdb: "Browser storage (IndexedDB) is unavailable — e.g. in private mode or when site data is blocked. Accounts cannot work on this device; the rest of Taza Aba still works.", acc: "Account", accSub: "Name, photo, home and favourites — encrypted on your device", create: "Create account", unlock: "Unlock", name: "Name", pw: "Password (at least 8 characters)", pw2: "Repeat password",
    photo: "Profile photo (optional)", ack: "I understand: the password cannot be recovered. Without it nobody — not me, not the developers — can decrypt the data.", warn: "⚠️ The password cannot be recovered. Write it down or make a backup.",
    pick: "Account on this device", accN: "Account {n}", wrong: "Wrong password", short: "Password is too short", mism: "Passwords don't match", needAck: "Please confirm you understand about the password", needName: "Enter a name",
    working: "Encrypting… (PBKDF2, 310,000 iterations)", lock: "🔒 Lock", logout: "Log out", locked: "Account locked", lockedAuto: "Account locked after inactivity", hi: "Signed in as {n}",
    guest: "Guest mode: data is stored as before, without an account.", none: "No accounts on this device yet.", orCreate: "or create a new one",
    home: "Home", work: "Work / school (optional)", byD: "District", byPin: "Pin on the map", noneOpt: "Not set", pinHint: "Tap the map to drop a pin.", saved: "Saved (encrypted)",
    fav: "Favourite districts", favAdd: "➕ Add current district", favNone: "No favourite districts yet.", del: "Remove", settings: "Settings", autolock: "Auto-lock", min: "{n} min", thr: "Warn at home when AQI is above",
    accent: "Colour scheme", green: "Green", blue: "Blue", backup: "Backup", exp: "⬇️ Download encrypted backup (.tazaaba)", imp: "⬆️ Import backup", impOk: "Backup imported — unlock it with its password", impBad: "This is not a Taza Aba backup file",
    delAcc: "Delete account", delAsk: "Enter the password to delete the account permanently", delDone: "Account deleted", privacy: "Privacy", photoCh: "Change photo",
    atHome: "🏠 At home: AQI {a} — {l}", atWork: "🏢 Work/school: AQI {a} — {l}", badHome: "The air at home is bad right now (AQI {a}). Close windows and run a purifier if you have one.", setHome: "🏠 Set your home in the account to see the air there.",
    srv: "Sign in from any device", srvSub: "Server mode: Supabase stores ciphertext only.", email: "Email", srvOff: "Coming soon: sign-in from other devices. For now your account works on this device only.",
    signin: "Sign in with email", signup: "Create account with email", confirm: "Check your inbox and confirm the email, then sign in.", srvErr: "Server didn't respond: {e}", synced: "Synced", local: "This device only", remote: "Synced with server", rem: "Remember me on this device", remHint: "The key is kept in the browser in non-extractable form; anyone with access to this unlocked device can open the profile.", lockRem: "Auto-lock even on a remembered device", outAll: "Log out on all devices", sessGone: "Session ended — please sign in again", mail: "Email", linkEm: "Link email", linkSub: "Sign in by email from any device and reset the password via a link. The address must be confirmed by email.", emOff: "Available once the server is connected", emPend: "We sent an email to {e}. Open the link from it on this device and the email will be linked.", emOk: "Email linked: {e}", emCheck: "I've confirmed — check", pwNow: "Current password", forgot: "Forgot password?", rc: "Recovery code", rcShow: "Store this code somewhere safe — it is shown only now. With it you can set a new password without losing data.", rcDone: "I've saved the code", copy: "Copy", copied: "Copied", rcHas: "A recovery code exists. You can create a new one — the old one will stop working.", rcNone: "This account has no recovery code: a forgotten password means lost data. Create one.", rcNew: "Create a new code", newPw: "New password (at least 8 characters)", rcBad: "The code doesn't match", rcOk: "Password changed, data kept", rcSet: "Set new password", resetMail: "Reset password by email", resetSent: "If the address is registered, we've sent an email with a link.", resetT: "New password after the email reset", resetNo: "Without the recovery code the encrypted data cannot be decrypted — the profile will start over.", resetFresh: "Start the profile over" },
  
};
const AC = (k, v) => { let s = (AC_T[LANG] || AC_T.ru)[k]; if (s == null) s = AC_T.ru[k]; if (v) for (const x in v) s = s.split("{" + x + "}").join(v[x]); return s; };

/* ---------- цветовая схема: зелёная / голубая ---------- */
const ACCENT_KEY = "tazaAba.accent";
const accentMode = () => localStorage.getItem(ACCENT_KEY) === "blue" ? "blue" : "green";
function applyAccent() { const h = document.documentElement; h.dataset.accent = accentMode();
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = h.dataset.theme === "dark" ? (h.dataset.accent === "blue" ? "#0D1722" : "#0E1A14") : (h.dataset.accent === "blue" ? "#E9F1F6" : "#EEF1DF"); }
function setAccent(a) { localStorage.setItem(ACCENT_KEY, a === "blue" ? "blue" : "green"); applyAccent(); renderAccentBtn(); }
function renderAccentBtn() { const b = document.getElementById("accentBtn"); if (!b) return; const a = accentMode();
  b.innerHTML = `<span class="acc-dot ${a}" aria-hidden="true"></span>`; const L = AC("accent") + ": " + AC(a); b.title = L; b.setAttribute("aria-label", L); }
if (typeof applyTheme === "function") { const _at = applyTheme; applyTheme = function () { const r = _at.apply(this, arguments); applyAccent(); return r; }; }
applyAccent();

/* ---------- криптография ---------- */
const AC_ITER = 310000, acEnc = new TextEncoder(), acDec = new TextDecoder();
const acB64 = buf => { const u = new Uint8Array(buf); let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const acUb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const acRand = n => crypto.getRandomValues(new Uint8Array(n));
async function acKey(pw, salt, iter = AC_ITER) {
  const base = await crypto.subtle.importKey("raw", acEnc.encode(pw), "PBKDF2", false, ["deriveKey", "deriveBits"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iter }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
async function acAuthPw(pw, email) {   // пароль для сервера: другая соль → ключ шифрования из него не получить
  const base = await crypto.subtle.importKey("raw", acEnc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: acEnc.encode("tazaaba-auth:" + email.trim().toLowerCase()), iterations: AC_ITER }, base, 256);
  return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, "0")).join("");
}
/* Ключ данных (DK) — случайные 32 байта; хранится обёрнутым паролем (wk.pw) и кодом восстановления (wk.rc).
   Старые аккаунты без wk: ключ данных = ключ из пароля. */
const acImpDK = raw => crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
const acRcNorm = s => (s || "").toUpperCase().replace(/[^A-Z2-7]/g, "");
function acRcGen() { const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; let s = ""; for (const x of acRand(20)) s += A[x & 31]; return s.match(/.{4}/g).join("-"); }   // 100 бит
async function acNewKeys(pw) {
  const salt = acRand(16), kpw = await acKey(pw, salt), raw = acRand(32), code = acRcGen(), rs = acRand(16), krc = await acKey(acRcNorm(code), rs);
  const wk = { pw: await acSeal(kpw, raw), rc: Object.assign({ salt: acB64(rs), iter: AC_ITER }, await acSeal(krc, raw)) };
  const key = await acImpDK(raw); raw.fill(0);
  return { kdf: { alg: "PBKDF2-SHA256", iter: AC_ITER, salt: acB64(salt) }, wk, key, code };
}
async function acDK(rec, pw) { const kpw = await acKey(pw, acUb64(rec.kdf.salt), rec.kdf.iter); if (!rec.wk) return kpw;
  const raw = await acOpen(kpw, rec.wk.pw); try { return await acImpDK(raw); } finally { raw.fill(0); } }
/* восстановление: код → DK → новая обёртка новым паролем; шифротекст данных не меняется */
async function acRecover(rec, code, newPw) {
  const r = rec.wk && rec.wk.rc; if (!r) throw new Error("no recovery code");
  const raw = await acOpen(await acKey(acRcNorm(code), acUb64(r.salt), r.iter), r), salt = acRand(16), kpw = await acKey(newPw, salt);
  const out = Object.assign({}, rec, { kdf: { alg: "PBKDF2-SHA256", iter: AC_ITER, salt: acB64(salt) }, wk: Object.assign({}, rec.wk, { pw: await acSeal(kpw, raw) }) });
  const key = await acImpDK(raw); raw.fill(0); return { rec: out, key, data: await acOpenJ(key, out) };
}
async function acSeal(key, bytes) { const iv = acRand(12); const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, bytes); return { iv: acB64(iv), ct: acB64(ct) }; }
async function acOpen(key, rec) { return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: acUb64(rec.iv) }, key, acUb64(rec.ct))); }
const acSealJ = (key, obj) => acSeal(key, acEnc.encode(JSON.stringify(obj)));
const acOpenJ = async (key, rec) => JSON.parse(acDec.decode(await acOpen(key, rec)));

/* ---------- IndexedDB (только шифротекст + соль и номер) ---------- */
let acDbP = null;
const acDb = () => acDbP || (acDbP = new Promise((res, rej) => { if (typeof indexedDB === "undefined" || !indexedDB) { acDbP = null; return rej(new Error("no indexedDB")); } const r = indexedDB.open("tazaAba-accounts", 2);
  r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains("acc")) d.createObjectStore("acc", { keyPath: "id" }); if (!d.objectStoreNames.contains("sess")) d.createObjectStore("sess", { keyPath: "id" }); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
const acTx = async (mode, fn, store = "acc") => { const db = await acDb(); return new Promise((res, rej) => { const tx = db.transaction(store, mode), st = tx.objectStore(store); const out = fn(st); tx.oncomplete = () => res(out instanceof IDBRequest ? out.result : out); tx.onerror = () => rej(tx.error); }); };
const acAll = () => acTx("readonly", st => st.getAll());
const acPut = rec => acTx("readwrite", st => st.put(rec));
const acDelRec = id => acTx("readwrite", st => st.delete(id));
/* «Запомнить меня»: в хранилище «sess» лежит сам ключ данных как НЕИЗВЛЕКАЕМЫЙ CryptoKey (structured clone) —
   браузер может им шифровать/расшифровывать, но байты ключа не выдаёт никому, даже скриптам сайта. */
const acSessGet = () => acTx("readonly", st => st.get("cur"), "sess").catch(() => null);
const acSessPut = (acc, key) => acTx("readwrite", st => st.put({ id: "cur", acc, key, at: Date.now() }), "sess").catch(e => console.warn("remember:", e.message));
const acSessDel = () => acTx("readwrite", st => st.delete("cur"), "sess").catch(() => { });

/* ---------- сессия ---------- */
let AS = null;             // { id, key, rec, data, remote? } — только в памяти
let acLastId = null, acGuest = null, acTimer = null, acList = [], acRcShow = null, acResetMode = false;
const AC_PF = ["name", "house", "plan", "switched", "joined", "customGroups", "alerts", "district"];
const acPick = o => JSON.parse(JSON.stringify(AC_PF.reduce((a, k) => (a[k] = o[k], a), {})));
const acNewData = (name, avatar) => ({ v: 1, name, avatar: avatar || "", home: null, work: null, fav: [], settings: { lock: 15, thr: 150 }, profile: acPick(state), created: new Date().toISOString().slice(0, 10) });
function acEnter(id, key, rec, data, remote, remember) {
  AS = { id, key, rec, data, remote: remote || null, remember: !!remember }; if (remember) acSessPut(id, key); else acSessDel(); acLastId = id; acGuest = acPick(state);
  if (data.profile) Object.assign(state, JSON.parse(JSON.stringify(data.profile)));
  if (data.name) state.name = data.name;
  if (data.settings && data.settings.accent) setAccent(data.settings.accent);
  acArm(); acHdr(); acTryLink().catch(() => { });
}
function acLock(auto) { acSessDel(); if (!AS) return; acFlush(); Object.assign(state, acGuest || {}); AS = null; acGuest = null; clearTimeout(acTimer); acHdr(); toast(AC(auto ? "lockedAuto" : "locked")); route(true); }
function acLogout(all) { const sb = acSb; acLock(); acLastId = null; if (sb) sb.auth.signOut(all ? { scope: "global" } : undefined).catch(() => { }); }
function acArm() { clearTimeout(acTimer); acTimer = null; if (!AS) return; if (AS.remember && !(AS.data.settings && AS.data.settings.lockRem)) return; const m = (AS.data.settings && AS.data.settings.lock) || 15; acTimer = setTimeout(() => acLock(true), m * 60e3); }
["pointerdown", "keydown", "wheel", "touchstart"].forEach(e => addEventListener(e, () => { if (AS) acArm(); }, { passive: true }));
/* сохранение: при открытом аккаунте профильные поля уходят в шифротекст, а в localStorage остаётся гостевой вариант */
let acSaveT = null, acSaving = null;
function acPersist() { clearTimeout(acSaveT); acSaveT = setTimeout(acFlush, 500); }
async function acFlush() { clearTimeout(acSaveT); if (!AS) return; const S = AS; const sealed = await acSealJ(S.key, S.data); S.rec = Object.assign({}, S.rec, sealed); acSaving = acPut(S.rec); await acSaving; if (S.remote) acPushRemote(S).catch(e => console.warn("sync:", e.message)); }
if (typeof save === "function") { const _save = save;
  save = function () { if (!AS) return _save.apply(this, arguments); AS.data.profile = acPick(state); AS.data.name = state.name || AS.data.name; acPersist();
    const cur = acPick(state); Object.assign(state, acGuest); try { return _save.apply(this, arguments); } finally { Object.assign(state, cur); } }; }

async function acCreateLocal(name, pw, avatar, remember) {
  const k = await acNewKeys(pw), list = await acAll(), n = Math.max(0, ...list.map(r => r.n || 0)) + 1;
  const data = acNewData(name, avatar), rec = { id: acB64(acRand(9)).replace(/[+/=]/g, ""), n, kdf: k.kdf, wk: k.wk, ...(await acSealJ(k.key, data)) };
  await acPut(rec); acRcShow = k.code; acEnter(rec.id, k.key, rec, data, null, remember); return rec;
}
async function acUnlockLocal(rec, pw, remember) { const key = await acDK(rec, pw); const data = await acOpenJ(key, rec); acEnter(rec.id, key, rec, data, data.remote || null, remember); return data; }
/* новый код восстановления (и перевод старого аккаунта на обёрнутый ключ): нужен текущий пароль */
async function acRekey(pw) { const old = await acDK(AS.rec, pw); await acOpen(old, AS.rec);
  const k = await acNewKeys(pw); AS.key = k.key; AS.rec = Object.assign({}, AS.rec, { kdf: k.kdf, wk: k.wk }); if (AS.remote) AS.remote.avSent = null;
  await acFlush(); if (AS.remember) await acSessPut(AS.id, AS.key); return k.code; }
async function acAutoUnlock() {
  const s = await acSessGet(); if (!s || !s.key || AS) return;
  const rec = (await acAll()).find(r => r.id === s.acc); if (!rec) return acSessDel();
  let data; try { data = await acOpenJ(s.key, rec); } catch (e) { return acSessDel(); }
  acEnter(rec.id, s.key, rec, data, data.remote || null, true);
  if (["home", "account", "profile"].includes((location.hash || "#home").slice(1).split("/")[0])) route(true);
  if (AS.remote && AS.remote.uid && acSbCfg()) { try { const sb = await acSbClient(), { error } = await sb.auth.getUser();   // «выйти на всех устройствах» отзывает сессии
      if (error && (error.status === 401 || error.status === 403 || /session|jwt|refresh/i.test(error.message || ""))) { acLock(); toast(AC("sessGone")); } } catch (e) { } }
}
async function acResize(file) {
  const bmp = await (window.createImageBitmap ? createImageBitmap(file) : new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); }));
  const S = 256, c = document.createElement("canvas"); c.width = c.height = S; const g = c.getContext("2d"), w = bmp.width, h = bmp.height, s = Math.min(w, h);
  g.drawImage(bmp, (w - s) / 2, (h - s) / 2, s, s, 0, 0, S, S);
  let u = c.toDataURL("image/webp", 0.85); if (!u.startsWith("data:image/webp")) u = c.toDataURL("image/jpeg", 0.85); return u;
}

/* ---------- серверный режим (Supabase) — включается, когда в config.js заданы ключи ---------- */
let acSb = null;
const acSbCfg = () => { const c = window.TAZA_CONFIG || {}; return c.SUPABASE_URL && c.SUPABASE_ANON_KEY ? c : null; };
async function acSbClient() { if (acSb) return acSb; const c = acSbCfg(); if (!c) throw new Error("no server");
  if (!window.supabase) await lazyLoad(["vendor/supabase/supabase.js"]);
  acSb = window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce", storageKey: "tazaAba.sb" } });
  acSb.auth.onAuthStateChange((ev, ses) => { if (ev === "PASSWORD_RECOVERY") { acResetMode = true; location.hash = "#account"; } if (ses) setTimeout(() => acTryLink().catch(() => { }), 0); });
  return acSb; }
const acBase = () => location.origin + location.pathname;   // относительно текущего адреса: github.io/taza-aba/ или taza-aba.surge.sh/
/* ссылка из письма (?code=…): обменять на сессию и убрать параметры из адреса */
async function acSbBoot() { if (!acSbCfg()) return; const q = new URLSearchParams(location.search);
  if (!q.has("code") && !localStorage.getItem("tazaAba.sb")) return;
  const sb = await acSbClient(); if (q.get("reset") === "1") acResetMode = true;
  await sb.auth.getSession(); if (q.has("code") || q.has("reset")) history.replaceState(null, "", acBase() + (acResetMode ? "#account" : location.hash));
  if (acResetMode) route(true); }
/* привязка почты: после подтверждения письма появляется сессия того же email → аккаунт становится серверным */
async function acTryLink() { if (!AS || !AS.data.pendingEmail || !acSbCfg()) return false;
  const sb = await acSbClient(), { data: { session } } = await sb.auth.getSession();
  if (!session || (session.user.email || "").toLowerCase() !== AS.data.pendingEmail.toLowerCase()) return false;
  AS.data.remote = { uid: session.user.id, email: session.user.email }; AS.remote = Object.assign({}, AS.data.remote); delete AS.data.pendingEmail;
  await acFlush(); toast(AC("emOk", { e: session.user.email })); if ((location.hash || "").startsWith("#account")) route(true); return true; }
async function acLinkEmail(email, pw) {
  const k = await acDK(AS.rec, pw); await acOpen(k, AS.rec);   // проверка пароля
  const sb = await acSbClient(), { data: r, error } = await sb.auth.signUp({ email, password: await acAuthPw(pw, email), options: { emailRedirectTo: acBase() } }); if (error) throw error;
  AS.data.pendingEmail = email; await acFlush(); if (r.session && await acTryLink()) return "ok"; return "confirm"; }
async function acResetMail(email) { const sb = await acSbClient(); const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: acBase() + "?reset=1" }); if (error) throw error; }
/* после ссылки сброса: код восстановления → новый пароль (данные целы) или «начать заново» */
async function acServerReset(code, newPw, fresh) {
  const sb = await acSbClient(), { data: { session } } = await sb.auth.getSession(); if (!session) throw new Error("no session");
  const uid = session.user.id, email = session.user.email, id = "r" + uid.replace(/-/g, "").slice(0, 16), list = await acAll(), old = list.find(x => x.id === id), n = old ? old.n : Math.max(0, ...list.map(x => x.n || 0)) + 1;
  let rec, key, data;
  if (fresh) { const k = await acNewKeys(newPw); key = k.key; acRcShow = k.code; data = acNewData("", ""); rec = { id, n, kdf: k.kdf, wk: k.wk, ...(await acSealJ(key, data)) }; }
  else { const { data: row, error } = await sb.from("taza_profiles").select("*").eq("user_id", uid).maybeSingle(); if (error) throw error; if (!row || !row.wk) throw new Error(AC("rcBad"));
    const r = await acRecover({ id, n, kdf: { alg: "PBKDF2-SHA256", iter: row.kdf_iter, salt: row.enc_salt }, wk: row.wk, iv: row.iv, ct: row.ct }, code, newPw); rec = r.rec; key = r.key; data = r.data; }
  const up = await sb.auth.updateUser({ password: await acAuthPw(newPw, email) }); if (up.error) throw up.error;
  data.remote = { uid, email }; await acPut(rec); acResetMode = false; acEnter(id, key, rec, data, Object.assign({ avSent: fresh ? null : "" }, data.remote), true); await acFlush(); }
async function acPushRemote(S) {
  const sb = await acSbClient(), uid = S.remote.uid, data = Object.assign({}, S.data, { avatar: "" });
  const sealed = await acSealJ(S.key, data);
  const { error } = await sb.from("taza_profiles").upsert({ user_id: uid, enc_salt: S.rec.kdf.salt, kdf_iter: S.rec.kdf.iter, wk: S.rec.wk || null, iv: sealed.iv, ct: sealed.ct, updated_at: new Date().toISOString() });
  if (error) throw error;
  if (S.data.avatar && S.data.avatar !== S.remote.avSent) { const a = await acSeal(S.key, acEnc.encode(S.data.avatar));
    const up = await sb.storage.from("taza-aba-avatars").upload(`${uid}/avatar.bin`, new Blob([JSON.stringify(a)], { type: "application/octet-stream" }), { upsert: true, contentType: "application/octet-stream" });
    if (up.error) throw up.error; S.remote.avSent = S.data.avatar; }
}
async function acSignIn(email, pw, remember) {
  const sb = await acSbClient(), { data: r, error } = await sb.auth.signInWithPassword({ email, password: await acAuthPw(pw, email) }); if (error) throw error;
  const uid = r.user.id, { data: row, error: e2 } = await sb.from("taza_profiles").select("*").eq("user_id", uid).maybeSingle(); if (e2) throw e2;
  const id = "r" + uid.replace(/-/g, "").slice(0, 16), list = await acAll(), old = list.find(x => x.id === id), n = old ? old.n : Math.max(0, ...list.map(x => x.n || 0)) + 1;
  let rec, key, data;
  if (row) { rec = { id, n, kdf: { alg: "PBKDF2-SHA256", iter: row.kdf_iter || AC_ITER, salt: row.enc_salt }, iv: row.iv, ct: row.ct }; if (row.wk) rec.wk = row.wk;
    key = await acDK(rec, pw); data = await acOpenJ(key, rec);
    const av = await sb.storage.from("taza-aba-avatars").download(`${uid}/avatar.bin`); if (av.data) { try { data.avatar = acDec.decode(await acOpen(key, JSON.parse(await av.data.text()))); } catch (e) { } } }
  else { const k = await acNewKeys(pw); key = k.key; acRcShow = k.code; data = acNewData("", ""); rec = { id, n, kdf: k.kdf, wk: k.wk, ...(await acSealJ(key, data)) }; }
  data.remote = { uid, email: r.user.email || email };
  await acPut(rec); acEnter(id, key, rec, data, Object.assign({ avSent: data.avatar }, data.remote), remember); await acFlush();
}

/* ---------- воздух у дома / работы ---------- */
const acAirMem = {};
async function acAqiAt(p) {
  if (p.city === CITY && p.district && air.byDistrict && air.byDistrict[p.district] && p.kind === "d") return air.byDistrict[p.district].aqi;
  const k = p.lat.toFixed(3) + "," + p.lon.toFixed(3); if (acAirMem[k] && Date.now() - acAirMem[k].at < 15 * 60e3) return acAirMem[k].v;
  const j = await fetchJSON(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${p.lat}&longitude=${p.lon}&current=us_aqi&timezone=auto`, 12000);
  const v = j && j.current ? aqiOf(j.current.us_aqi) : null; acAirMem[k] = { at: Date.now(), v }; return v;
}
let acNotified = 0;
async function acHomeCard(el) {
  if (!AS || el.querySelector(".ac-home")) return;
  const D = AS.data, h = $(".hero", el); if (!h) return;
  if (!D.home) { h.insertAdjacentHTML("afterend", `<a class="card ac-home small" href="#account">${AC("setHome")}</a>`); return; }
  h.insertAdjacentHTML("afterend", `<div class="card ac-home"><div id="acHomeL" class="small muted">…</div></div>`);
  const rows = [];
  for (const [k, p] of [["atHome", D.home], ["atWork", D.work]]) { if (!p) continue; let a = null; try { a = await acAqiAt(p); } catch (e) { }
    if (a != null) rows.push({ k, a }); }
  const box = $("#acHomeL", el); if (!box) return;
  if (!rows.length) { box.textContent = "—"; return; }
  const thr = (D.settings && D.settings.thr) || 150, hm = rows.find(r => r.k === "atHome");
  box.className = ""; box.innerHTML = rows.map(r => { const L = level(r.a); return `<div class="ac-aq"><span class="gv-chip" style="background:${L.color}">${r.a}</span> ${esc(AC(r.k, { a: r.a, l: tr(L.name) }).replace(/AQI \d+ — /, ""))}</div>`; }).join("")
    + (hm && hm.a > thr ? `<div class="ac-bad">⚠️ ${esc(AC("badHome", { a: hm.a }))}</div>` : "");
  if (hm && hm.a > thr && "Notification" in window && Notification.permission === "granted" && Date.now() - acNotified > 2 * 3600e3) {
    acNotified = Date.now(); try { new Notification("Таза Аба", { body: AC("badHome", { a: hm.a }), icon: "icons/icon-192.png", tag: "taza-home" }); } catch (e) { } }
}

/* ---------- экран аккаунта ---------- */
const acAv = (d, cls = "") => d && d.avatar ? `<img class="ac-av ${cls}" src="${d.avatar}" alt="">` : `<span class="ac-av ac-av-e ${cls}" aria-hidden="true">🧑‍🌾</span>`;
function acHdr() {
  let b = document.getElementById("accBtn"); const hr = document.getElementById("hdrRight"); if (!hr) return;
  if (!b) { hr.insertAdjacentHTML("afterbegin", `<a id="accBtn" class="theme-btn acc-btn" href="#account"></a>`); b = document.getElementById("accBtn"); }
  b.innerHTML = AS ? acAv(AS.data, "sm") : "🔐"; const L = AS ? AC("hi", { n: AS.data.name || "" }) : AC("acc"); b.title = L; b.setAttribute("aria-label", L);
}
function acLocPicker(id, p) {
  const kind = p ? p.kind : "";
  return `<div class="ac-loc" data-loc="${id}"><select class="ac-kind"><option value="">${AC("noneOpt")}</option><option value="d" ${kind === "d" ? "selected" : ""}>${AC("byD")}</option><option value="p" ${kind === "p" ? "selected" : ""}>${AC("byPin")}</option></select>
    <select class="ac-d" ${kind === "d" ? "" : "hidden"}>${DISTRICTS.map(d => `<option value="${d.id}" ${p && p.district === d.id && p.city === CITY ? "selected" : ""}>${esc(dName(d))}</option>`).join("")}</select>
    <div class="ac-pinw" ${kind === "p" ? "" : "hidden"}><div class="small muted">${AC("pinHint")}</div><div class="ac-map" id="acMap_${id}"></div></div>
    ${p && p.city !== CITY ? `<div class="small muted">${esc(tr(CITIES[p.city] ? CITIES[p.city].name : ""))}${p.district && CITIES[p.city] ? " · " + esc(dName(CITIES[p.city].districts.find(d => d.id === p.district) || { name: "" })) : ""}</div>` : ""}</div>`;
}
function acLocBind(el, id) {
  const w = el.querySelector(`[data-loc="${id}"]`), ks = w.querySelector(".ac-kind"), ds = w.querySelector(".ac-d"), pw = w.querySelector(".ac-pinw");
  let pm = null, pin = null;
  const set = v => { AS.data[id] = v; acPersist(); toast(AC("saved")); };
  const fromD = () => { const d = DISTRICTS.find(x => x.id === ds.value); if (d) set({ kind: "d", city: CITY, district: d.id, lat: d.lat, lon: d.lon }); };
  const mkPin = () => { if (pm) return; const p = AS.data[id], c = p && p.kind === "p" ? [p.lat, p.lon] : cityObj().center;
    pm = L.map(`acMap_${id}`, { zoomControl: true, attributionControl: true }).setView(c, p && p.kind === "p" ? 14 : (cityObj().zoom || 12)); baseTiles(pm);
    const acPinI = () => L.divIcon({ className: "", html: `<div class="home-pin">📍</div>`, iconSize: [30, 30], iconAnchor: [15, 28] });   // без PNG-иконки Leaflet (vendor/leaflet/images не поставляется)
    if (p && p.kind === "p") pin = L.marker(c, { icon: acPinI(), keyboard: false }).addTo(pm);
    pm.on("click", e => { const { lat, lng } = e.latlng; if (pin) pin.setLatLng(e.latlng); else pin = L.marker(e.latlng, { icon: acPinI(), keyboard: false }).addTo(pm);
      set({ kind: "p", city: CITY, district: nearestDistrict(lat, lng).id, lat: +lat.toFixed(5), lon: +lng.toFixed(5) }); }); };
  ks.onchange = () => { ds.hidden = ks.value !== "d"; pw.hidden = ks.value !== "p"; if (ks.value === "") set(null); else if (ks.value === "d") fromD(); else { mkPin(); setTimeout(() => pm && pm.invalidateSize(), 50); } };
  ds.onchange = fromD; if (ks.value === "p") setTimeout(mkPin, 0);
  return () => { if (pm) { try { pm.remove(); } catch (e) { } } };
}
let acCleanup = [];
function viewAccount(el) {
  acCleanup.forEach(f => f()); acCleanup = [];
  if (AS) return acViewOpen(el);
  acAll().then(list => { acList = list.sort((a, b) => a.n - b.n); if ((location.hash || "").slice(1).split("/")[0] === "account" && !AS) acViewLocked(el); }).catch(e => { console.warn("IndexedDB:", e && e.message); el.innerHTML = `<h1>${AC("acc")}</h1><div class="card fail">⚠️ ${esc(AC("noIdb"))}</div>`; });
  el.innerHTML = `<h1>${AC("acc")}</h1><div class="skeleton"></div>`;
}
function acViewLocked(el) {
  const sb = acSbCfg();
  const chk = (id, on) => `<label class="ac-chk"><input type="checkbox" id="${id}" ${on ? "checked" : ""}> <span>${AC("rem")}</span></label>`;
  const rst = acResetMode && sb ? `<form class="card ac-form" id="acRst"><h3>🔑 ${AC("resetT")}</h3><label>${AC("rc")}<input id="acRstC" autocomplete="off" spellcheck="false" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"></label>
      <label>${AC("newPw")}<input type="password" id="acRstP1" minlength="8" autocomplete="new-password" required></label><label>${AC("pw2")}<input type="password" id="acRstP2" minlength="8" autocomplete="new-password" required></label>
      <button class="btn" type="submit">${AC("rcSet")}</button><p class="small muted">${AC("resetNo")}</p><button class="btn ghost" type="button" id="acRstF">${AC("resetFresh")}</button><p class="small ac-msg" id="acMsgR" role="alert"></p></form>` : "";
  el.innerHTML = `<h1>${AC("acc")}</h1><p class="sub">${AC("accSub")}</p>${rst}
    ${acList.length ? `<form class="card ac-form" id="acUnl"><h3>${AC("unlock")}</h3><label>${AC("pick")}<select id="acPick">${acList.map(r => `<option value="${r.id}" ${r.id === acLastId ? "selected" : ""}>${esc(AC("accN", { n: r.n }))}</option>`).join("")}</select></label>
      <label>${AC("pw").replace(/ \(.*\)/, "")}<input type="password" id="acPw" autocomplete="current-password" required></label>${chk("acRem1", true)}<button class="btn" type="submit">${AC("unlock")}</button><p class="small ac-msg" id="acMsg1" role="alert"></p>
      <details class="ac-forgot"><summary class="small">${AC("forgot")}</summary><div class="ac-form" id="acRcF"><label>${AC("rc")}<input id="acRcC" autocomplete="off" spellcheck="false" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"></label>
        <label>${AC("newPw")}<input type="password" id="acRcP1" minlength="8" autocomplete="new-password"></label><label>${AC("pw2")}<input type="password" id="acRcP2" minlength="8" autocomplete="new-password"></label>
        <button class="btn ghost" type="button" id="acRcGo">${AC("rcSet")}</button><p class="small ac-msg" id="acMsgRc" role="alert"></p></div></details></form>` : `<div class="card small muted">${AC("none")}</div>`}
    <form class="card ac-form" id="acNew"><h3>${AC("create")}</h3><p class="small ac-warn">${AC("warn")}</p>
      <label>${AC("name")}<input id="acName" maxlength="40" autocomplete="nickname" required></label>
      <label>${AC("pw")}<input type="password" id="acP1" minlength="8" autocomplete="new-password" required></label>
      <label>${AC("pw2")}<input type="password" id="acP2" minlength="8" autocomplete="new-password" required></label>
      <label>${AC("photo")}<input type="file" id="acPh" accept="image/*"></label><div id="acPrev"></div>
      ${sb ? `<label>${AC("email")} <span class="small muted">(${AC("srv")})</span><input type="email" id="acEm" autocomplete="email"></label><p class="small muted">${AC("linkSub")}</p>`
        : `<label>${AC("email")} <span class="small muted">(${AC("emOff")})</span><input type="email" id="acEm" disabled placeholder="${AC("emOff")}" aria-describedby="acEmN"></label>`}
      <label class="ac-chk"><input type="checkbox" id="acAck"> <span>${AC("ack")}</span></label>
      ${chk("acRem2", true)}<button class="btn" type="submit">${AC("create")}</button><p class="small ac-msg" id="acMsg2" role="alert"></p></form>
    <div class="card"><h3>☁️ ${AC("srv")}</h3>${sb ? `<form class="ac-form" id="acSrv"><p class="small">${AC("srvSub")}</p><label>${AC("email")}<input type="email" id="acSE" autocomplete="email" required></label><label>${AC("pw").replace(/ \(.*\)/, "")}<input type="password" id="acSP" autocomplete="current-password" required></label>${chk("acRem3", true)}<button class="btn ghost" type="submit">${AC("signin")}</button><p class="small ac-msg" id="acMsg3" role="alert"></p></form>
      <details class="ac-forgot"><summary class="small">${AC("forgot")}</summary><div class="ac-form"><label>${AC("email")}<input type="email" id="acRME" autocomplete="email"></label><button class="btn ghost" type="button" id="acRM">${AC("resetMail")}</button><p class="small muted">${AC("resetNo")}</p><p class="small ac-msg" id="acMsgM" role="alert"></p></div></details>` : `<p class="small muted">${AC("srvOff")}</p>`}</div>
    <div class="card"><h3>${AC("backup")}</h3><label class="btn ghost ac-file">${AC("imp")}<input type="file" id="acImp" accept=".tazaaba,application/json" hidden></label></div>
    <p class="small"><a href="#privacy">🔏 ${AC("privacy")}</a> · ${AC("guest")}</p><div class="foot">${t("footProto")}</div>`;
  let avatar = "";
  const busy = (f, m) => { const b = f.querySelector("button[type=submit]"); b.disabled = true; m.textContent = AC("working"); return () => { b.disabled = false; }; };
  const u = $("#acUnl"); if (u) u.onsubmit = async e => { e.preventDefault(); const m = $("#acMsg1"), done = busy(u, m), rec = acList.find(r => r.id === $("#acPick").value);
    try { await acUnlockLocal(rec, $("#acPw").value, $("#acRem1").checked); m.textContent = ""; route(true); } catch (er) { m.textContent = AC("wrong"); } finally { done(); } };
  const rg = $("#acRcGo"); if (rg) rg.onclick = async () => { const m = $("#acMsgRc"), p1 = $("#acRcP1").value, rec = acList.find(r => r.id === $("#acPick").value);
    if (p1.length < 8) return m.textContent = AC("short"); if (p1 !== $("#acRcP2").value) return m.textContent = AC("mism");
    if (!rec.wk || !rec.wk.rc) return m.textContent = AC("rcNone");
    rg.disabled = true; m.textContent = AC("working");
    try { const r = await acRecover(rec, $("#acRcC").value, p1); await acPut(r.rec); acEnter(r.rec.id, r.key, r.rec, r.data, r.data.remote || null, $("#acRem1").checked);
      if (AS.remote && acSbCfg()) { try { const sb = await acSbClient(); await sb.auth.updateUser({ password: await acAuthPw(p1, AS.remote.email) }); await acFlush(); } catch (e) { console.warn("server pw:", e.message); } }
      toast(AC("rcOk")); route(true); } catch (er) { m.textContent = AC("rcBad"); } finally { rg.disabled = false; } };
  const rs = $("#acRst"); if (rs) { const go = async fresh => { const m = $("#acMsgR"), p1 = $("#acRstP1").value; if (p1.length < 8) return m.textContent = AC("short"); if (p1 !== $("#acRstP2").value) return m.textContent = AC("mism");
      m.textContent = AC("working"); try { await acServerReset($("#acRstC").value, p1, fresh); toast(AC("rcOk")); route(true); } catch (er) { m.textContent = fresh ? AC("srvErr", { e: er.message }) : AC("rcBad"); } };
    rs.onsubmit = e => { e.preventDefault(); go(false); }; $("#acRstF").onclick = () => go(true); }
  const rm = $("#acRM"); if (rm) rm.onclick = async () => { const m = $("#acMsgM"); try { await acResetMail($("#acRME").value.trim()); m.textContent = AC("resetSent"); } catch (er) { m.textContent = AC("srvErr", { e: er.message }); } };
  $("#acPh").onchange = async e => { const f = e.target.files[0]; if (!f) return; try { avatar = await acResize(f); $("#acPrev").innerHTML = `<img class="ac-av" src="${avatar}" alt="">`; } catch (er) { avatar = ""; } };
  $("#acNew").onsubmit = async e => { e.preventDefault(); const m = $("#acMsg2"), nm = $("#acName").value.trim(), p1 = $("#acP1").value, p2 = $("#acP2").value, em = $("#acEm") && $("#acEm").value.trim();
    if (!nm) return m.textContent = AC("needName"); if (p1.length < 8) return m.textContent = AC("short"); if (p1 !== p2) return m.textContent = AC("mism"); if (!$("#acAck").checked) return m.textContent = AC("needAck");
    const done = busy($("#acNew"), m);
    try { await acCreateLocal(nm, p1, avatar, $("#acRem2").checked); if (em && sb) { try { await acLinkEmail(em, p1); } catch (er) { toast(AC("srvErr", { e: er.message })); } } route(true); scrollTo(0, 0); }
    catch (er) { m.textContent = AC("srvErr", { e: er.message }); } finally { done(); } };
  const sv = $("#acSrv"); if (sv) sv.onsubmit = async e => { e.preventDefault(); const m = $("#acMsg3"), done = busy(sv, m);
    try { await acSignIn($("#acSE").value.trim(), $("#acSP").value, $("#acRem3").checked); route(true); } catch (er) { m.textContent = AC("srvErr", { e: er.message }); } finally { done(); } };
  $("#acImp").onchange = async e => { const f = e.target.files[0]; if (!f) return;
    try { const j = JSON.parse(await f.text()); if (j.format !== "tazaaba-backup" || !j.kdf || !j.iv || !j.ct) throw 0;
      const list = await acAll(); const nr = { id: acB64(acRand(9)).replace(/[+/=]/g, ""), n: Math.max(0, ...list.map(r => r.n || 0)) + 1, kdf: j.kdf, iv: j.iv, ct: j.ct }; if (j.wk) nr.wk = j.wk; await acPut(nr); toast(AC("impOk")); route(true); }
    catch (er) { toast(AC("impBad")); } };
}
function acViewOpen(el) {
  const D = AS.data, S = D.settings || (D.settings = { lock: 15, thr: 150 }), a = accentMode();
  const favs = (D.fav || []).map((f, i) => { const c = CITIES[f.city], d = c && c.districts.find(x => x.id === f.district); return d ? `<li>${esc(dName(d))} <span class="small muted">· ${esc(tr(c.name))}</span> <button class="btn ghost ac-fdel" data-i="${i}" type="button">${AC("del")}</button></li>` : ""; }).join("");
  const sbOn = acSbCfg(), R = AS.remote;
  const rcCard = acRcShow ? `<div class="card ac-rcbox" id="acRcBox"><h3>🔑 ${AC("rc")}</h3><p class="small">${AC("rcShow")}</p><code class="ac-rc" id="acRcV">${esc(acRcShow)}</code>
      <div class="ac-acts"><button class="btn ghost" type="button" id="acRcCp">${AC("copy")}</button><button class="btn" type="button" id="acRcOk">${AC("rcDone")}</button></div></div>` : "";
  const mail = !sbOn ? `<div class="ac-form"><label>${AC("email")}<input type="email" id="acLE" disabled placeholder="name@example.com"></label><p class="small muted">🔌 ${AC("emOff")}</p><button class="btn ghost" type="button" disabled>${AC("linkEm")}</button></div>`
    : R && R.uid ? `<p class="small">✅ ${esc(AC("emOk", { e: R.email || "" }))}</p>`
    : D.pendingEmail ? `<p class="small">✉️ ${esc(AC("emPend", { e: D.pendingEmail }))}</p><button class="btn ghost" type="button" id="acLChk">${AC("emCheck")}</button><p class="small ac-msg" id="acMsgL" role="alert"></p>`
    : `<form class="ac-form" id="acLink"><p class="small muted">${AC("linkSub")}</p><label>${AC("email")}<input type="email" id="acLE" autocomplete="email" required></label><label>${AC("pwNow")}<input type="password" id="acLP" autocomplete="current-password" required></label><button class="btn" type="submit">${AC("linkEm")}</button><p class="small ac-msg" id="acMsgL" role="alert"></p></form>`;
  el.innerHTML = `${rcCard}<div class="card ac-head">${acAv(D, "lg")}<div><h1 style="margin:0">${esc(D.name || "")}</h1><div class="small muted">${AS.remote ? "☁️ " + AC("remote") + " · " + esc(AS.remote.email || "") : "📱 " + AC("local")}</div>
      <label class="btn ghost ac-file small">${AC("photoCh")}<input type="file" id="acPh2" accept="image/*" hidden></label></div>
      <div class="ac-acts"><button class="btn" id="acLock" type="button">${AC("lock")}</button><button class="btn ghost" id="acOut" type="button">${AC("logout")}</button>${R && R.uid ? `<button class="btn ghost" id="acOutAll" type="button">${AC("outAll")}</button>` : ""}</div></div>
    <div class="card"><h3>🏠 ${AC("home")}</h3>${acLocPicker("home", D.home)}</div>
    <div class="card"><h3>🏢 ${AC("work")}</h3>${acLocPicker("work", D.work)}</div>
    <div class="card"><h3>⭐ ${AC("fav")}</h3>${favs ? `<ul class="ac-fav">${favs}</ul>` : `<p class="small muted">${AC("favNone")}</p>`}<button class="btn ghost" id="acFavAdd" type="button">${AC("favAdd")}</button></div>
    <div class="card ac-form"><h3>⚙️ ${AC("settings")}</h3>
      <label>${AC("name")}<input id="acNm" value="${esc(D.name || "")}" maxlength="40"></label>
      <label class="ac-chk"><input type="checkbox" id="acRemS" ${AS.remember ? "checked" : ""}> <span>${AC("rem")}</span></label><p class="small muted">${AC("remHint")}</p>
      <label class="ac-chk"><input type="checkbox" id="acLkR" ${S.lockRem ? "checked" : ""} ${AS.remember ? "" : "disabled"}> <span>${AC("lockRem")}</span></label>
      <label>${AC("autolock")}<select id="acLk">${[5, 15, 30, 60].map(n => `<option value="${n}" ${S.lock === n ? "selected" : ""}>${AC("min", { n })}</option>`).join("")}</select></label>
      <label>${AC("thr")}<select id="acTh">${[100, 150, 200].map(n => `<option value="${n}" ${S.thr === n ? "selected" : ""}>AQI ${n}</option>`).join("")}</select></label>
      <div><span class="small"><b>${AC("accent")}</b></span><div class="ac-seg" role="group"><button type="button" class="${a === "green" ? "on" : ""}" data-acc="green"><span class="acc-dot green"></span> ${AC("green")}</button><button type="button" class="${a === "blue" ? "on" : ""}" data-acc="blue"><span class="acc-dot blue"></span> ${AC("blue")}</button></div></div></div>
    <div class="card"><h3>📧 ${AC("mail")}</h3>${mail}</div>
    <div class="card"><h3>🔑 ${AC("rc")}</h3><p class="small ${AS.rec.wk ? "muted" : "ac-warn"}">${AC(AS.rec.wk ? "rcHas" : "rcNone")}</p><form class="ac-form" id="acRk"><label>${AC("pwNow")}<input type="password" id="acRkP" autocomplete="current-password" required></label><button class="btn ghost" type="submit">${AC("rcNew")}</button><p class="small ac-msg" id="acMsgK" role="alert"></p></form></div>
    <div class="card"><h3>${AC("backup")}</h3><p class="small muted">${AC("warn")}</p><button class="btn ghost" id="acExp" type="button">${AC("exp")}</button></div>
    <div class="card"><h3>${AC("delAcc")}</h3><form class="ac-form" id="acDel"><label>${AC("delAsk")}<input type="password" id="acDP" autocomplete="current-password" required></label><button class="btn ghost ac-danger" type="submit">${AC("delAcc")}</button><p class="small ac-msg" id="acMsg4" role="alert"></p></form></div>
    <p class="small"><a href="#privacy">🔏 ${AC("privacy")}</a></p><div class="foot">${t("footProto")}</div>`;
  acCleanup.push(acLocBind(el, "home"), acLocBind(el, "work"));
  $("#acLock").onclick = () => acLock(); $("#acOut").onclick = () => acLogout(); const oa = $("#acOutAll"); if (oa) oa.onclick = () => { acLogout(true); toast(AC("sessGone")); };
  if (acRcShow) { $("#acRcCp").onclick = () => { (navigator.clipboard ? navigator.clipboard.writeText(acRcShow) : Promise.reject()).then(() => toast(AC("copied")), () => { const r = document.createRange(); r.selectNodeContents($("#acRcV")); getSelection().removeAllRanges(); getSelection().addRange(r); }); };
    $("#acRcOk").onclick = () => { acRcShow = null; route(true); }; }
  $("#acRemS").onchange = e => { AS.remember = e.target.checked; if (AS.remember) acSessPut(AS.id, AS.key); else acSessDel(); acArm(); toast(AC("saved")); route(true); };
  $("#acLkR").onchange = e => { S.lockRem = e.target.checked; acPersist(); acArm(); toast(AC("saved")); };
  const lk = $("#acLink"); if (lk) lk.onsubmit = async e => { e.preventDefault(); const m = $("#acMsgL"); m.textContent = AC("working");
    try { const r = await acLinkEmail($("#acLE").value.trim(), $("#acLP").value); m.textContent = r === "ok" ? "" : ""; route(true); } catch (er) { m.textContent = /decrypt|operation/i.test(er.message || er.name || "") ? AC("wrong") : AC("srvErr", { e: er.message }); } };
  const lc = $("#acLChk"); if (lc) lc.onclick = async () => { const ok = await acTryLink().catch(() => false); if (!ok) $("#acMsgL").textContent = AC("confirm"); };
  $("#acRk").onsubmit = async e => { e.preventDefault(); const m = $("#acMsgK"); m.textContent = AC("working");
    try { acRcShow = await acRekey($("#acRkP").value); route(true); scrollTo(0, 0); } catch (er) { m.textContent = AC("wrong"); } };
  $("#acPh2").onchange = async e => { const f = e.target.files[0]; if (!f) return; try { D.avatar = await acResize(f); acPersist(); acHdr(); route(true); } catch (er) { } };
  $("#acFavAdd").onclick = () => { D.fav = D.fav || []; if (!D.fav.some(f => f.city === CITY && f.district === state.district)) D.fav.push({ city: CITY, district: state.district }); acPersist(); route(true); };
  el.querySelectorAll(".ac-fdel").forEach(b => b.onclick = () => { D.fav.splice(+b.dataset.i, 1); acPersist(); route(true); });
  $("#acNm").onchange = e => { D.name = e.target.value.trim(); state.name = D.name; save(); acHdr(); toast(AC("saved")); };
  $("#acLk").onchange = e => { S.lock = +e.target.value; acPersist(); acArm(); toast(AC("saved")); };
  $("#acTh").onchange = e => { S.thr = +e.target.value; acPersist(); toast(AC("saved")); };
  el.querySelectorAll("[data-acc]").forEach(b => b.onclick = () => { setAccent(b.dataset.acc); S.accent = b.dataset.acc; acPersist(); route(true); });
  $("#acExp").onclick = async () => { await acFlush(); const r = AS.rec, blob = new Blob([JSON.stringify({ format: "tazaaba-backup", v: r.wk ? 2 : 1, kdf: r.kdf, wk: r.wk, iv: r.iv, ct: r.ct }, null, 1)], { type: "application/json" });
    const x = document.createElement("a"); x.href = URL.createObjectURL(blob); x.download = `taza-aba-${AC("acc").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.tazaaba`; document.body.appendChild(x); x.click(); setTimeout(() => { URL.revokeObjectURL(x.href); x.remove(); }, 1000); };
  $("#acDel").onsubmit = async e => { e.preventDefault(); const m = $("#acMsg4"); m.textContent = AC("working");
    try { const k = await acDK(AS.rec, $("#acDP").value); await acOpen(k, AS.rec); const S2 = AS; acSessDel();
      if (S2.remote && S2.remote.uid) { try { const sb = await acSbClient(); await sb.storage.from("taza-aba-avatars").remove([`${S2.remote.uid}/avatar.bin`]); await sb.rpc("taza_delete_my_account"); } catch (er) { console.warn("server delete:", er.message); } }
      await acDelRec(S2.id); Object.assign(state, acGuest || {}); AS = null; acLastId = null; acHdr(); toast(AC("delDone")); route(true); }
    catch (er) { m.textContent = AC("wrong"); } };
}

/* ---------- страница конфиденциальности ---------- */
const PV_T = {
  ru: ["Конфиденциальность", "<ul><li><b>Без аккаунта</b> (гостевой режим) настройки хранятся в браузере этого устройства, как раньше.</li><li><b>Аккаунт</b>: имя, фото, дом, работа/учёба, избранное и настройки шифруются на вашем устройстве (AES-GCM 256, ключ из пароля через PBKDF2-SHA256, 310 000 итераций, случайная соль). В хранилище браузера (IndexedDB) лежит только шифротекст; ключ — только в памяти и стирается при блокировке, выходе или после бездействия.</li><li><b>Пароль нельзя восстановить.</b> Мы его не знаем и не храним. Сделайте резервную копию (.tazaaba) — она тоже зашифрована.</li><li><b>Вход с других устройств</b> (когда подключён сервер): данные идут только между вашим устройством и сервером проекта (Supabase). Сервер получает не ваш пароль, а производный от него код для входа; профиль и фото хранятся там только шифротекстом, доступ к строке — только у вашего аккаунта (Row Level Security).</li><li><b>Никакой аналитики профиля.</b> Анонимный счётчик посещений считает только число открытий сайта и ничего не знает об аккаунтах. Координаты дома не попадают в ссылки «Поделиться».</li><li>Запросы о качестве воздуха для точки дома отправляются в Open-Meteo (координаты с точностью до ~100 м), как и для любого района.</li><li>Удаление аккаунта стирает его с устройства (и с сервера, если он подключён).</li><li><b>«Запомнить меня на этом устройстве»</b>: после входа ключ данных сохраняется в IndexedDB как неизвлекаемый ключ WebCrypto (его байты не может прочитать даже скрипт сайта), поэтому профиль открывается сам после перезагрузки и перезапуска. <b>Компромисс:</b> любой, у кого есть доступ к этому разблокированному устройству и браузеру, сможет открыть профиль. Автоблокировка при этом выключена, но её можно включить в настройках. «Выйти» и «Выйти на всех устройствах» стирают сохранённый ключ.</li><li><b>Код восстановления</b> показывается один раз при создании аккаунта: ключ данных дополнительно зашифрован этим кодом, с ним можно задать новый пароль без потери данных. Без кода забытый пароль означает потерю данных.</li><li><b>Почта</b> (когда подключён сервер) нужна для входа с других устройств и сброса пароля по ссылке; адрес подтверждается письмом. Сброс по почте сохраняет данные только вместе с кодом восстановления — иначе профиль начинается заново.</li></ul>"],
  ky: ["Купуялуулук", "<ul><li><b>Аккаунтсуз</b> (конок режими) жөндөөлөр мурдагыдай ушул түзмөктүн браузеринде сакталат.</li><li><b>Аккаунт</b>: аты, сүрөтү, үйү, жумушу/окуусу, тандалгандар жана жөндөөлөр түзмөгүңүздө шифрленет (AES-GCM 256, ачкыч сырсөздөн PBKDF2-SHA256 аркылуу, 310 000 итерация, кокус туз). Браузердин сактагычында (IndexedDB) шифротекст гана турат; ачкыч эсте гана болот жана кулпулоодо, чыгууда же аракетсиздиктен кийин өчүрүлөт.</li><li><b>Сырсөздү калыбына келтирүү мүмкүн эмес.</b> Биз аны билбейбиз жана сактабайбыз. Резервдик көчүрмө (.tazaaba) жасаңыз — ал да шифрленген.</li><li><b>Башка түзмөктөрдөн кирүү</b> (сервер туташканда): маалымат түзмөгүңүз менен долбоордун серверинин (Supabase) ортосунда гана жүрөт. Сервер сырсөзүңүздү эмес, андан алынган кирүү кодун алат; профиль жана сүрөт ал жакта шифротекст гана болуп сакталат, ага сиздин аккаунтуңуз гана кире алат (Row Level Security).</li><li><b>Профиль боюнча аналитика жок.</b> Анонимдүү эсептегич сайттын ачылыш санын гана эсептейт, аккаунттар тууралуу эч нерсе билбейт. Үйдүн координаттары «Бөлүшүү» шилтемелерине кирбейт.</li><li>Үйдүн чекити үчүн абанын сапаты тууралуу суроолор Open-Meteo'го жөнөтүлөт (~100 м тактык менен), каалаган район үчүн болгондой.</li><li>Аккаунтту өчүрүү аны түзмөктөн (жана сервер туташкан болсо, серверден) жок кылат.</li><li><b>«Мени ушул түзмөктө эстеп кал»</b>: киргенден кийин маалымат ачкычы IndexedDB'де алынбай турган WebCrypto ачкычы катары сакталат (анын байттарын сайттын скрипти да окуй албайт), ошондуктан профиль кайра жүктөлгөндө өзү ачылат. <b>Компромисс:</b> бул кулпусу ачык түзмөккө жана браузерге жеткен ар бир адам профилди ача алат. Мындайда автокулпулоо өчүк, бирок жөндөөлөрдөн күйгүзсө болот. «Чыгуу» жана «Бардык түзмөктөрдөн чыгуу» сакталган ачкычты өчүрөт.</li><li><b>Калыбына келтирүү коду</b> аккаунт түзүлгөндө бир жолу көрсөтүлөт: маалымат ачкычы бул код менен да шифрленет, аны менен маалыматты жоготпой жаңы сырсөз коюуга болот. Кодсуз унутулган сырсөз маалыматтын жоголушун билдирет.</li><li><b>Почта</b> (сервер туташканда) башка түзмөктөрдөн кирүү жана шилтеме аркылуу сырсөздү жаңылоо үчүн керек; дарек кат менен ырасталат. Почта аркылуу жаңылоо маалыматты калыбына келтирүү коду менен гана сактайт — антпесе профиль жаңыдан башталат.</li></ul>"],
  en: ["Privacy", "<ul><li><b>Without an account</b> (guest mode) settings are stored in this device's browser, as before.</li><li><b>Account</b>: name, photo, home, work/school, favourites and settings are encrypted on your device (AES-GCM 256, key from your password via PBKDF2-SHA256, 310,000 iterations, random salt). Browser storage (IndexedDB) holds ciphertext only; the key lives only in memory and is wiped on lock, log-out or inactivity.</li><li><b>The password cannot be recovered.</b> We don't know it and don't store it. Make a backup (.tazaaba) — it is encrypted too.</li><li><b>Signing in from other devices</b> (once the server is connected): data flows only between your device and the project server (Supabase). The server receives not your password but a login code derived from it; your profile and photo are stored there as ciphertext only, and only your account can access its row (Row Level Security).</li><li><b>No profile analytics.</b> The anonymous visit counter only counts site opens and knows nothing about accounts. Home coordinates never go into share links.</li><li>Air-quality requests for your home pin go to Open-Meteo (coordinates rounded to ~100 m), just like for any district.</li><li>Deleting the account wipes it from the device (and from the server, if connected).</li><li><b>“Remember me on this device”</b>: after you sign in, the data key is stored in IndexedDB as a non-extractable WebCrypto key (its bytes cannot be read even by the site's own scripts), so the profile opens by itself after reloads and restarts. <b>Trade-off:</b> anyone with access to this unlocked device and browser can open the profile. Auto-lock is off in this case, but you can turn it on in settings. “Log out” and “Log out on all devices” erase the stored key.</li><li><b>The recovery code</b> is shown once when the account is created: the data key is additionally encrypted with it, so you can set a new password without losing data. Without the code, a forgotten password means lost data.</li><li><b>Email</b> (once the server is connected) is used to sign in from other devices and to reset the password via a link; the address is confirmed by email. An email reset keeps your data only together with the recovery code — otherwise the profile starts over.</li></ul>"],
  
};
function viewPrivacy(el) { const [h, b] = PV_T[LANG] || PV_T.ru; el.innerHTML = `<h1>🔏 ${h}</h1><div class="card ac-priv">${b}</div><p><a href="#account">← ${AC("acc")}</a></p><div class="foot">${t("footProto")}</div>`; }

/* ---------- подключение ---------- */
(function () {
  views.account = viewAccount; views.privacy = viewPrivacy; TAB_OF.account = "more"; TAB_OF.privacy = "more";
  if (typeof NAV_ICO !== "undefined") NAV_ICO.account = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.4"/></svg>';
  const _home = views.home; views.home = el => { _home(el); if (AS) acHomeCard(el).catch(e => console.warn("home card:", e.message)); };
  const _prof = views.profile; views.profile = el => { _prof(el); const h = el.querySelector(".pro-head");
    if (h) { if (AS && AS.data.avatar) { const av = h.querySelector(".avatar"); if (av) av.innerHTML = `<img src="${AS.data.avatar}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`; }
      h.insertAdjacentHTML("afterend", `<a class="card small ac-plink" href="#account">${AS ? "🔓 " + esc(AC("hi", { n: AS.data.name || "" })) : "🔐 " + esc(AC("create")) + " / " + esc(AC("unlock"))}</a>`); } };
  const _more = views.more; views.more = el => { _more(el); const g = el.querySelector(".more-grid"); if (!g) return;
    g.insertAdjacentHTML("afterbegin", `<a href="#account" class="card more-tile"><span class="mt-e">${typeof navIco === "function" ? navIco("account") : ""}</span><b>${esc(AC("acc"))}</b><small>${esc(AC("accSub"))}</small></a>`); };
  const hr = document.getElementById("hdrRight"), tb = document.getElementById("themeBtn");
  if (hr && tb && !document.getElementById("accentBtn")) { tb.insertAdjacentHTML("afterend", `<button id="accentBtn" class="theme-btn" type="button"></button>`);
    document.getElementById("accentBtn").onclick = () => { setAccent(accentMode() === "blue" ? "green" : "blue"); if (AS) { AS.data.settings.accent = accentMode(); acPersist(); } }; }
  const rc = renderChrome; renderChrome = function () { const r = rc.apply(this, arguments); renderAccentBtn(); acHdr();
    document.querySelectorAll('.tabbar a[data-tab="account"] span').forEach(s => s.textContent = AC("acc")); return r; };
  renderAccentBtn(); acHdr();
  acSbBoot().catch(e => console.warn("auth link:", e.message)).then(() => acAutoUnlock()).catch(e => console.warn("auto-unlock:", e.message));
  addEventListener("pagehide", () => { if (AS) acFlush(); });
})();
