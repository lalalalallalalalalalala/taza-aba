/* Таза Аба — ключи внешних источников измерений (необязательно).
 * Пусто = источник выключен, приложение работает на Open-Meteo (модель CAMS) + Sensor.Community (без ключа).
 * Бесплатные ключи:
 *   AIRNOW_KEY  — https://docs.airnowapi.org/account/request/   (AirNow, мониторы посольств США; CORS: *)
 *   WAQI_TOKEN  — https://aqicn.org/data-platform/token/        (World Air Quality Index; CORS: *; демо-токен «demo» не использовать)
 *   OPENAQ_KEY  — https://explore.openaq.org/register           (OpenAQ v3; ключ в заголовке X-API-Key —
 *                 их сервер не отвечает на CORS-preflight, поэтому из браузера нужен свой прокси в OPENAQ_BASE)
 * Внимание: ключ в статическом сайте виден всем — используйте отдельный бесплатный ключ с лимитами. */
/* SITE_URL — публичный адрес сайта со слешем на конце (для ссылок «Поделиться» и og:image), например
 *   "https://USER.github.io/taza-aba/". Пусто = берётся текущий адрес страницы. mkzip.py подставляет его в og:url/og:image. */
window.TAZA_CONFIG = Object.assign({
  SITE_URL: "https://zusenbaev7-cmd.github.io/taza-aba/",
  AIRNOW_KEY: "",
  WAQI_TOKEN: "",
  OPENAQ_KEY: "",
  OPENAQ_BASE: "https://api.openaq.org",
  /* TOMTOM_KEY — живые пробки (TomTom Traffic Flow, бесплатный ключ: https://developer.tomtom.com/). Пусто = слой выключен, запросов нет. */
  TOMTOM_KEY: "",
  /* Куда отправлять предложения мест «Чистый воздух внутри»: e-mail и/или Telegram-имя проекта (без @). Пусто = пользователь выбирает сам. */
  PROJECT_EMAIL: "",
  PROJECT_TG: "",
  /* TELEGRAM_BOT — username бота смог-алертов без @ (например "taza_aba_bot"). Пусто = кнопка подписки скрыта. */
  TELEGRAM_BOT: "",
  /* GOATCOUNTER — код сайта GoatCounter (например "taza-aba" для taza-aba.goatcounter.com) или полный URL /count. Пусто = выключено. */
  GOATCOUNTER: "",
  /* Серверные аккаунты (Supabase). Пусто = только локальные зашифрованные аккаунты на устройстве.
     Заполняется скриптом backend/setup.sh. Anon key публичный по замыслу: доступ ограничен RLS. */
  /* ARCHIVE_REPO — публичный репозиторий GitHub с открытым архивом по дням (archive/<город>.csv, пишет workflow daily-archive.yml). */
  ARCHIVE_REPO: "zusenbaev7-cmd/taza-aba",
  /* SUPPORT — реквизиты для добровольной поддержки в разделе #support. Пока все поля пустые, блок «Поддержать деньгами» НЕ показывается.
     mbank/odengi/elsom/optima — номер телефона или кошелька для перевода; name — имя получателя, как его видит банк;
     boosty/kofi/patreon/other — полная ссылка https://…; otherName — подпись для other; note_ru/note_ky/note_en — необязательная строка «на что идут деньги». */
  SUPPORT: { name: "", mbank: "", odengi: "", elsom: "", optima: "", boosty: "", kofi: "", patreon: "", other: "", otherName: "", note_ru: "", note_ky: "", note_en: "" },
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",
}, window.TAZA_CONFIG || {});
