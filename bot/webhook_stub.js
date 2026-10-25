#!/usr/bin/env node
/**
 * Обработка апдейтов Telegram (webhook или getUpdates).
 * Команды: /start <districtId>, /stop, /status.
 * Пишет bot/subscribers.json. Для Actions — отдельный job с GITHUB_TOKEN.
 * Без TELEGRAM_BOT_TOKEN выходит сразу.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
if (!TOKEN) { console.log("TELEGRAM_BOT_TOKEN empty — inert"); process.exit(0); }
const SUB = path.join(__dirname, "subscribers.json");
const API = `https://api.telegram.org/bot${TOKEN}`;

async function api(m, body) {
  const r = await fetch(`${API}/${m}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
  return r.json();
}
function load() { return JSON.parse(fs.readFileSync(SUB, "utf8")); }
function save(j) { fs.writeFileSync(SUB, JSON.stringify(j, null, 2) + "\n"); }

async function handle(u) {
  const msg = u.message || u.edited_message; if (!msg || !msg.text) return;
  const chat = msg.chat.id, text = msg.text.trim();
  const j = load();
  const list = j.subscribers || (j.subscribers = []);
  if (text.startsWith("/start")) {
    const dist = (text.split(/\s+/)[1] || "").replace(/[^a-z0-9_]/gi, "");
    if (!dist) { await api("sendMessage", { chat_id: chat, text: "Откройте ссылку из приложения «Таза Аба» (кнопка подписки на район), или: /start <id_района>" }); return; }
    const i = list.findIndex(s => s.chat_id === chat);
    const row = { chat_id: chat, district: dist, lang: (msg.from && msg.from.language_code || "ru").slice(0, 2), threshold: j.defaultThreshold || 100, since: new Date().toISOString().slice(0, 10) };
    if (!["ru", "ky", "en"].includes(row.lang)) row.lang = "ru";
    if (i >= 0) list[i] = { ...list[i], ...row }; else list.push(row);
    save(j);
    await api("sendMessage", { chat_id: chat, text: `Подписка на район «${dist}» оформлена. Порог AQI ≥ ${row.threshold}. /stop — отписаться.` });
  } else if (text.startsWith("/stop")) {
    j.subscribers = list.filter(s => s.chat_id !== chat); save(j);
    await api("sendMessage", { chat_id: chat, text: "Подписка отменена." });
  } else if (text.startsWith("/status")) {
    const s = list.find(x => x.chat_id === chat);
    await api("sendMessage", { chat_id: chat, text: s ? `Район: ${s.district}, порог: ${s.threshold}, язык: ${s.lang}` : "Вы не подписаны. Откройте ссылку из приложения." });
  } else {
    await api("sendMessage", { chat_id: chat, text: "Команды: /start <район>, /status, /stop" });
  }
}

(async () => {
  // long-poll один проход (для cron «подхватить подписки»)
  const j = await api("getUpdates", { timeout: 0, limit: ["message"] });
  if (!j.ok) throw new Error(j.description || "getUpdates");
  let max = 0;
  for (const u of j.result || []) { await handle(u); max = Math.max(max, u.update_id); }
  if (max) await api("getUpdates", { offset: max + 1, timeout: 0 });
  console.log("updates", (j.result || []).length);
})().catch(e => { console.error(e); process.exit(1); });
