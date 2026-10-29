/* Таза Аба — «свободный» советник: отвечает на любые вопросы без ключа.
 * Цепочка: Pollinations.AI (Classic API, без ключа, 1 запрос / 30 с с IP) → LLM7.io (анонимный turbo-уровень) → правила.
 * Свой ключ OpenAI / Gemini / xAI (OpenAI-совместимый) по-прежнему поддерживается.
 * Безопасность: ответ модели НИКОГДА не попадает в innerHTML — разметка строится узлами DOM (textContent),
 * ссылки только http/https. В запрос уходит только вопрос, история чата этой вкладки и публичный контекст воздуха
 * (город, район, AQI, прогноз) — без аккаунта, профиля здоровья и прочих личных данных. */
"use strict";
const AI_FREE = [
  { id: "pollinations", name: "Pollinations.AI", url: "https://text.pollinations.ai/openai", model: "openai", gap: 31000 },
  { id: "llm7", name: "LLM7.io", url: "https://api.llm7.io/v1/chat/completions", model: "default", gap: 6500 },
];
const AI_T = {
  ru: { freeName: "Бесплатный ИИ (без ключа)", mChat: "Любой вопрос", on: "🟢 Бесплатный ИИ: Pollinations.AI → LLM7.io → правила",
    priv: "🔒 Вопросы отправляются в сторонний ИИ-сервис {svc} (запасной — {svc2}) и не связаны с аккаунтом. Не пишите личные данные.",
    privOwn: "🔒 Вопросы отправляются в {svc} с вашим ключом; данные аккаунта не отправляются.", privRules: "🔒 Режим правил: вопросы никуда не отправляются.",
    hello: "Салам! Я помощник «Таза Аба». Спросите о чём угодно — от смога и здоровья до стихов, учёбы и рецептов. Про воздух в вашем районе знаю свежие данные.",
    suggL: "Спросите о чём угодно", via: "ответ: {svc} · ИИ может ошибаться", failNo: "Бесплатные ИИ-сервисы сейчас не ответили (лимит или сбой). Попробуйте ещё раз через полминуты — или нажмите быстрый вопрос ниже: на них я отвечаю и без ИИ.", fail: "Бесплатные ИИ-сервисы сейчас не ответили (лимит или сбой) — ниже ответ по правилам. Попробуйте ещё раз через полминуты.",
    empty: "Модель вернула пустой ответ.", clear: "🗑 Очистить чат", stop: "■ Стоп", stopped: "(остановлено)", wait: "Думаю…",
    title: "⚙️ ИИ: бесплатный, свой ключ или правила", sub: "Отвечает на любые вопросы; про воздух, смог и здоровье — с данными вашего района",
    s: ["Напиши короткое стихотворение о горах Ала-Тоо", "Какая столица Японии?", "Что такое PM2.5 простыми словами?", "Быстрый ужин из того, что есть дома", "Помоги написать письмо в мэрию о дыме", "Чем заняться с детьми дома, когда смог?"] },
  ky: { freeName: "Акысыз ЖИ (ачкычсыз)", mChat: "Каалаган суроо", on: "🟢 Акысыз ЖИ: Pollinations.AI → LLM7.io → эрежелер",
    priv: "🔒 Суроолор сырткы ЖИ-кызматына {svc} (запастагысы — {svc2}) жөнөтүлөт жана аккаунтка байланбайт. Жеке маалымат жазбаңыз.",
    privOwn: "🔒 Суроолор сиздин ачкыч менен {svc} кызматына жөнөтүлөт; аккаунттун маалыматы жөнөтүлбөйт.", privRules: "🔒 Эрежелер режими: суроолор эч жакка жөнөтүлбөйт.",
    hello: "Салам! Мен «Таза Аба» жардамчысымын. Каалаган нерсени сураңыз — түтүн менен ден соолуктан баштап ыр, окуу жана тамак-ашка чейин. Районуңуздагы аба тууралуу жаңы маалыматым бар.",
    suggL: "Каалаган нерсени сураңыз", via: "жооп: {svc} · ЖИ жаңылышы мүмкүн", failNo: "Акысыз ЖИ-кызматтар азыр жооп берген жок (лимит же бузулуу). Жарым мүнөттөн кийин кайра аракет кылыңыз — же төмөнкү тез суроону басыңыз: аларга ЖИсиз деле жооп берем.", fail: "Акысыз ЖИ-кызматтар азыр жооп берген жок (чек же ката) — төмөндө эрежелер боюнча жооп. Жарым мүнөттөн кийин кайра аракет кылыңыз.",
    empty: "Модель бош жооп кайтарды.", clear: "🗑 Чатты тазалоо", stop: "■ Токтотуу", stopped: "(токтотулду)", wait: "Ойлонуп жатам…",
    title: "⚙️ ЖИ: акысыз, өз ачкычыңыз же эрежелер", sub: "Каалаган суроого жооп берет; аба, түтүн жана ден соолук боюнча — районуңуздун маалыматы менен",
    s: ["Ала-Тоо тоолору жөнүндө кыска ыр жазып бер", "Япониянын борбору кайсы?", "PM2.5 деген эмне, жөнөкөй сөз менен?", "Үйдө бар нерседен тез кечки тамак", "Мэрияга түтүн тууралуу кат жазууга жардам бер", "Түтүн болгондо балдар менен үйдө эмне кылса болот?"] },
  en: { freeName: "Free AI (no key)", mChat: "Ask anything", on: "🟢 Free AI: Pollinations.AI → LLM7.io → rules",
    priv: "🔒 Questions are sent to the third-party AI service {svc} (backup: {svc2}) and are not linked to your account. Don't share personal data.",
    privOwn: "🔒 Questions go to {svc} with your own key; no account data is sent.", privRules: "🔒 Rules mode: questions are not sent anywhere.",
    hello: "Salam! I'm the Taza Aba assistant. Ask me anything — from smog and health to poems, homework and recipes. I also have live data on the air in your district.",
    suggL: "Ask anything", via: "answer: {svc} · AI can make mistakes", failNo: "The free AI services didn't respond right now (limit or outage). Try again in half a minute — or tap a quick question below: I can answer those without the AI.", fail: "The free AI services didn't respond right now (limit or outage) — here is a rule-based answer. Try again in half a minute.",
    empty: "The model returned an empty answer.", clear: "🗑 Clear chat", stop: "■ Stop", stopped: "(stopped)", wait: "Thinking…",
    title: "⚙️ AI: free, your own key, or rules", sub: "Answers any question; for air, smog and health it uses your district's data",
    s: ["Write a short poem about the Ala-Too mountains", "What is the capital of Japan?", "What is PM2.5 in simple words?", "A quick dinner from what's at home", "Help me write a letter to the city hall about smoke", "What can kids do at home on a smoggy day?"] },
  
};
const AIT = (k, v = {}) => String((AI_T[LANG] || AI_T.en)[k] ?? AI_T.ru[k] ?? k).replace(/\{(\w+)\}/g, (m, x) => v[x] ?? m);
if (typeof AD !== "undefined") Object.keys(AI_T).forEach(l => { if (AD[l]) AD[l].m_chat = AI_T[l].mChat; });
["ru", "ky", "en"].forEach(l => { if (DICT[l]) Object.assign(DICT[l], { llmTitle: AI_T[l].title, advSub: AI_T[l].sub }); });

/* ---------- история чата в рамках вкладки (sessionStorage) ---------- */
const AI_SS = "tazaAba.chat";
function aiSave() { try { sessionStorage.setItem(AI_SS, JSON.stringify({ mode: adv.mode, extra: adv.extra.filter(m => !m.pending).slice(-40) })); } catch (e) { } }
let aiRestored = false;
function aiRestore() { if (aiRestored) return; aiRestored = true; try { const s = JSON.parse(sessionStorage.getItem(AI_SS) || "null"); if (s && Array.isArray(s.extra) && !adv.extra.length) { adv.extra = s.extra; if (s.mode) adv.mode = s.mode; } } catch (e) { } }

/* ---------- безопасный Markdown → DOM (никакого innerHTML) ---------- */
function aiSafeHref(u) { try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : null; } catch (e) { return null; } }
function aiInline(el, s) {
  const rx = /(\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`|\[[^\]\n]+\]\([^)\s]+\)|\*[^*\s][^*\n]*\*)/;
  let rest = String(s);
  while (rest) {
    const m = rest.match(rx);
    if (!m) { el.appendChild(document.createTextNode(rest)); break; }
    if (m.index) el.appendChild(document.createTextNode(rest.slice(0, m.index)));
    const tok = m[0]; let n;
    if (tok.startsWith("**") || tok.startsWith("__")) { n = document.createElement("strong"); aiInline(n, tok.slice(2, -2)); }
    else if (tok.startsWith("`")) { n = document.createElement("code"); n.textContent = tok.slice(1, -1); }
    else if (tok.startsWith("[")) { const mm = tok.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/), h = mm && aiSafeHref(mm[2]);
      if (h) { n = document.createElement("a"); n.href = h; n.target = "_blank"; n.rel = "noopener noreferrer nofollow"; n.textContent = mm[1]; } else n = document.createTextNode(mm ? mm[1] : tok); }
    else { n = document.createElement("em"); aiInline(n, tok.slice(1, -1)); }
    el.appendChild(n); rest = rest.slice(m.index + tok.length);
  }
}
function aiMd(src) {
  const frag = document.createDocumentFragment(), lines = String(src || "").replace(/\r/g, "").replace(/<think>[\s\S]*?(<\/think>|$)/g, "").split("\n");
  let list = null, para = null, tbl = null, i = 0;
  const reset = () => { list = null; para = null; tbl = null; };
  while (i < lines.length) {
    const L = lines[i]; let m;
    if (/^\s*```/.test(L)) { const pre = document.createElement("pre"), code = document.createElement("code"), buf = []; i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) buf.push(lines[i++]); i++; code.textContent = buf.join("\n"); pre.appendChild(code); frag.appendChild(pre); reset(); continue; }
    if (!L.trim()) { reset(); i++; continue; }
    if (/^\s*(?:(?:-\s*){3,}|(?:\*\s*){3,}|(?:_\s*){3,})$/.test(L)) { frag.appendChild(document.createElement("hr")); reset(); i++; continue; }
    if ((m = L.match(/^\s*#{1,6}\s+(.*)$/))) { const h = document.createElement("h4"); aiInline(h, m[1].replace(/#+\s*$/, "")); frag.appendChild(h); reset(); i++; continue; }
    if (/^\s*\|.*\|\s*$/.test(L)) {
      if (/^\s*\|[\s:|-]+\|\s*$/.test(L)) { i++; continue; }
      if (!tbl) { const w = document.createElement("div"); w.className = "md-tw"; tbl = document.createElement("table"); w.appendChild(tbl); frag.appendChild(w); list = null; para = null; }
      const tr = document.createElement("tr"); L.trim().replace(/^\||\|$/g, "").split("|").forEach(c => { const td = document.createElement("td"); aiInline(td, c.trim()); tr.appendChild(td); }); tbl.appendChild(tr); i++; continue;
    }
    tbl = null;
    if ((m = L.match(/^\s*([-*•+]|\d+[.)])\s+(.*)$/))) { const ord = /\d/.test(m[1]);
      if (!list || list.ord !== ord) { list = { el: document.createElement(ord ? "ol" : "ul"), ord }; frag.appendChild(list.el); }
      const li = document.createElement("li"); aiInline(li, m[2]); list.el.appendChild(li); para = null; i++; continue; }
    if ((m = L.match(/^\s*>\s?(.*)$/))) { const q = document.createElement("blockquote"); aiInline(q, m[1]); frag.appendChild(q); reset(); i++; continue; }
    list = null;
    if (!para) { para = document.createElement("p"); frag.appendChild(para); } else para.appendChild(document.createElement("br"));
    aiInline(para, L); i++;
  }
  return frag;
}
function aiFill(box, m) {
  box.replaceChildren();
  if (m.pending && !m.text) { box.classList.add("typing"); for (let k = 0; k < 3; k++) box.appendChild(document.createElement("span")); return; }
  box.classList.remove("typing");
  const body = document.createElement("div"); body.className = "md"; body.appendChild(aiMd(m.text)); box.appendChild(body);
  if (m.stopped) { const s = document.createElement("div"); s.className = "small muted"; s.textContent = AIT("stopped"); box.appendChild(s); }
  if (m.via && !m.pending) { const v = document.createElement("div"); v.className = "ai-via small muted"; v.textContent = AIT("via", { svc: m.via }); box.appendChild(v); }
}
function aiHydrate(root) { root.querySelectorAll("[data-ai]").forEach(b => { const m = adv.extra[+b.dataset.ai]; if (m && m.ai) aiFill(b, m); }); }

/* ---------- контекст: только публичные данные о воздухе, без аккаунта и профиля ---------- */
function aiContext() {
  const c = cityObj(), lines = [];
  const now = new Date();
  lines.push(`Local date/time: ${now.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}.`);
  lines.push(`App city: ${tr(c.name)} (Kyrgyzstan).`);
  try {
    const d = byId(state.district), a = air.byDistrict[d.id];
    if (a) {
      lines.push(`Selected district: ${tr(d.name)}. US AQI now: ${a.aqi == null ? "no data" : a.aqi + " (" + level(a.aqi).name.en + ")"}${a.pm25 != null ? ", PM2.5 " + fmt(a.pm25, 1) + " µg/m³" : ""}; source: ${a.src === "model" ? "CAMS model via Open-Meteo (an estimate, not a measurement)" : a.src}.`);
      const x = typeof airCtx === "function" ? airCtx() : null;
      if (x) lines.push(`Today: best hour ${x.vars.best} (AQI ${x.vars.bv}), peak ${x.vars.worst} (AQI ${x.vars.wv}). Tomorrow max AQI ${x.vars.tm}.`);
      const days = dailyForecast(a).slice(1, 4); if (days.length) lines.push("Next days max AQI: " + days.map(z => z.date + " " + z.max).join(", ") + ".");
      /* v82: честный разброс по районам — чтобы ИИ не называл «самый чистый район», когда модель их не различает */
      if (typeof dlNoteText === "function") { const v = DISTRICTS.map(x => ({ x, r: air.byDistrict[x.id] })).filter(o => o.r && o.r.aqi != null);
        if (v.length >= 2) { const as = v.map(o => o.r.aqi), lo = Math.min(...as), hi = Math.max(...as), ns = v.filter(o => o.r.src === "sensors").length;
          const nm = a => v.filter(o => o.r.aqi === a).map(o => tr(o.x.name)), L1 = nm(lo), H1 = nm(hi);
          lines.push(`District AQI across the city (${v.length} districts): lowest ${lo} (${L1.slice(0, 3).join(", ")}${L1.length > 3 ? " and " + (L1.length - 3) + " more" : ""}), highest ${hi} (${H1.slice(0, 3).join(", ")}${H1.length > 3 ? " and " + (H1.length - 3) + " more" : ""}). ${ns ? `${ns} of ${v.length} districts are corrected with nearby residents' low-cost sensors; the rest are` : "All districts are"} the CAMS model (~40 km grid), which cannot tell neighbouring districts apart. ${hi - lo < 5 ? "There is practically no difference between districts — do not name a cleanest or dirtiest district." : "Mention whether a value is a model estimate or sensor-based when comparing districts."}`); } }
    } else lines.push("Air data is still loading.");
    if (air.weather) lines.push(`Weather now: ${fmt(air.weather.temperature_2m, 0)}°C, wind ${fmt(air.weather.wind_speed_10m, 1)} m/s.`);
  } catch (e) { }
  return lines.join(" ");
}
function aiSystem() {
  const lang = { ru: "Russian", ky: "Kyrgyz (Cyrillic script)", en: "English" }[LANG] || "Russian";
  return `You are the assistant of «Taza Aba», a free air-quality web app for Kyrgyzstan. You are a friendly, knowledgeable general helper: answer ANY question on any topic (facts, writing, poems, study, coding, cooking, travel, everyday life) helpfully, accurately and concisely. You also have extra expertise in air quality, smog, PM2.5, protecting health, cleaner home heating (insulation, heat pumps, solar instead of coal) and this app's data. Use the live context below only when it is relevant; never invent measurements — AQI values come from the CAMS model and are estimates. If you are unsure, say so. Always reply in ${lang}, unless the user explicitly asks for another language. Format with simple Markdown only (paragraphs, **bold**, lists, \`code\`); never output HTML. Refuse only clearly harmful requests (weapons, violence, self-harm methods, illegal or hateful content) — briefly and kindly. For medical emergencies tell the user to call emergency services (103 in Kyrgyzstan).\nLive context: ${aiContext()}`;
}
function aiHistory() {
  return adv.extra.filter(m => (m.me && m.text) || (m.ai && m.text && !m.pending)).slice(-12).map(m => ({ role: m.me ? "user" : "assistant", content: String(m.text).slice(0, 4000) }));
}

/* ---------- запрос со стримингом (OpenAI-совместимый SSE) ---------- */
async function aiCall(P, messages, onText, signal, key) {
  const ctl = new AbortController(), kill = () => ctl.abort();
  if (signal) signal.addEventListener("abort", kill);
  let tFirst = setTimeout(kill, 30000);
  try {
    const r = await fetch(P.url, { method: "POST", signal: ctl.signal, headers: Object.assign({ "Content-Type": "application/json" }, key ? { Authorization: "Bearer " + key } : {}),
      body: JSON.stringify({ model: P.model, messages, stream: true, temperature: 0.6, max_tokens: 1200 }) });
    if (!r.ok) { const e = new Error("HTTP " + r.status); e.status = r.status; e.retry = +(r.headers.get("Retry-After") || 0); throw e; }
    let text = "";
    if (!r.body || !/event-stream/.test(r.headers.get("content-type") || "")) {
      clearTimeout(tFirst); const j = await r.json(); if (j.error) throw new Error(j.error.message || "error");
      text = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || ""; onText(text); return text;
    }
    const rd = r.body.getReader(), dec = new TextDecoder(); let buf = "";
    for (;;) {
      const { value, done } = await rd.read(); if (done) break;
      clearTimeout(tFirst); tFirst = setTimeout(kill, 45000);   // зависший поток
      buf += dec.decode(value, { stream: true });
      let k; while ((k = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, k).trim(); buf = buf.slice(k + 1);
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim(); if (data === "[DONE]") { buf = ""; break; }
        let j; try { j = JSON.parse(data); } catch (e) { continue; }
        if (j.error) throw new Error(j.error.message || "stream error");
        const dl = j.choices && j.choices[0] && (j.choices[0].delta || j.choices[0].message);
        if (dl && typeof dl.content === "string" && dl.content) { text += dl.content; onText(text); }
      }
    }
    return text;
  } finally { clearTimeout(tFirst); if (signal) signal.removeEventListener("abort", kill); }
}
const aiNext = {};
let aiCtl = null;
async function aiAnswer(q, onText) {
  const cfg = llmCfg(), prov = provOf(cfg);
  const messages = [{ role: "system", content: aiSystem() }, ...aiHistory()];
  if (!messages.length || messages[messages.length - 1].role !== "user") messages.push({ role: "user", content: q });
  aiCtl = new AbortController(); const sig = aiCtl.signal;
  let chain;
  if (prov !== "free" && prov !== "rules" && cfg.key) chain = [{ id: "own", name: (PROVIDERS[prov] && PROVIDERS[prov].name) || cfg.url, url: String(cfg.url || "").replace(/\/+$/, "").replace(/\/chat\/completions$/, "") + "/chat/completions", model: cfg.model, key: cfg.key, gap: 0 }];
  else { const now = Date.now(); chain = AI_FREE.slice().sort((a, b) => ((aiNext[a.id] || 0) > now) - ((aiNext[b.id] || 0) > now)); }
  const errs = [];
  for (const P of chain) {
    if (sig.aborted) break;
    try {
      aiNext[P.id] = Date.now() + (P.gap || 0);
      const txt = await aiCall(P, messages, s => onText(s, P.name), sig, P.key);
      if (sig.aborted) return { text: txt, via: P.name, stopped: true };
      if (txt && txt.trim()) return { text: txt, via: P.name };
      errs.push(P.name + ": " + AIT("empty"));
    } catch (e) {
      if (sig.aborted) return { text: "", via: P.name, stopped: true };
      if (e.retry) aiNext[P.id] = Date.now() + e.retry * 1000;
      errs.push(P.name + ": " + (e.name === "AbortError" ? "timeout" : e.message)); console.warn("AI", P.name, e.message);
    }
  }
  return { fail: true, errs };
}
function aiRulesHtml(q) { const qk = detectQuick(q); return qk ? quickAnswer(qk) : (r => r.key ? t(r.key) : r.html)(ruleAnswer(q)); }
async function aiSubmit(q, rerender) {
  const cfg = llmCfg(), prov = provOf(cfg);
  adv.extra.push({ me: true, text: q });
  const offl = navigator.onLine === false;   // v62: без интернета — встроенные советы, с честной пометкой
  if (offl || prov === "rules" || (prov !== "free" && !cfg.key)) { rerender(); typing(); await new Promise(r => setTimeout(r, 350)); adv.extra.push({ html: (offl ? `<span class="small muted">${esc({ ru: "Нет интернета — ответ из встроенных советов, без ИИ.", ky: "Интернет жок — жооп орнотулган кеңештерден, ЖИ колдонулган жок.", en: "Offline — answer from built-in tips, without AI." }[LANG] || "")}</span><br>` : "") + aiRulesHtml(q) }); aiSave(); rerender(); return; }
  const m = { ai: true, text: "", via: "", pending: true }, idx = adv.extra.push(m) - 1; rerender(); aiBusy(true);
  let raf = 0;
  const res = await aiAnswer(q, (txt, via) => { m.text = txt; m.via = via;
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; const b = document.querySelector(`[data-ai="${idx}"]`); if (b) { aiFill(b, m); const c = $("#chat"); if (c) b.scrollIntoView({ block: "nearest" }); } }); });
  m.pending = false; aiBusy(false);
  if (res.fail) {
    const qk = detectQuick(q), ra = qk ? null : ruleAnswer(q), generic = !qk && ra && ra.key === "a_fallback";
    const errs = `<br><span class="small muted">${esc(res.errs.join(" · "))}</span>`;
    adv.extra.splice(idx, 1, { html: generic ? esc(AIT("failNo")) + errs : esc(AIT("fail")) + errs + "<br><br>" + (qk ? quickAnswer(qk) : ra.key ? t(ra.key) : ra.html) });
  }
  else { m.text = res.text || ""; m.via = res.via; m.stopped = !!res.stopped; if (!m.text && m.stopped) m.text = "…"; }
  aiSave(); rerender();
}
function aiBusy(on) { const f = $("#askForm"); if (!f) return; f.classList.toggle("busy", on); const s = $("#aiStop"); if (s) s.hidden = !on; const b = f.querySelector("button[type=submit]"); if (b) b.disabled = on; }
function aiStop() { if (aiCtl) aiCtl.abort(); }
function aiPrivacyLine() {
  const cfg = llmCfg(), prov = provOf(cfg);
  if (prov === "rules" || (prov !== "free" && !cfg.key)) return AIT("privRules");
  if (prov !== "free") return AIT("privOwn", { svc: (PROVIDERS[prov] && PROVIDERS[prov].name) || cfg.url });
  return AIT("priv", { svc: AI_FREE[0].name, svc2: AI_FREE[1].name });
}
