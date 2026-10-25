// Приём заявок с формы сайта. Маленький сервер без зависимостей: принимает заявку и пересылает её в Telegram.
// Ключ бота лежит только здесь, в переменных окружения, и в браузер не попадает.
//
// Переменные окружения:
//   TELEGRAM_BOT_TOKEN  — ключ бота от BotFather
//   TELEGRAM_CHAT_ID    — чат, куда слать заявки
//   ALLOWED_ORIGINS     — адреса сайта через запятую, например https://vladnes.ru
//   PORT                — порт, по умолчанию 8787 (слушаем только 127.0.0.1, наружу отдаёт nginx)
//
// Запуск: node server/lead.mjs

import http from "node:http";

const TOKEN = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
const CHAT = (process.env.TELEGRAM_CHAT_ID || "").trim();
const ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);
const PORT = Number(process.env.PORT || 8787);

if (!TOKEN || !CHAT || !ORIGINS.length) {
  console.error("Не заданы TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID или ALLOWED_ORIGINS. Сервер не запущен.");
  process.exit(1);
}

const MAX_BODY = 4096;
// Не больше 3 заявок в минуту и 15 в час с одного адреса.
const LIMITS = [
  [60_000, 3],
  [3_600_000, 15],
];
const hits = new Map();

function allowed(ip, now) {
  const list = (hits.get(ip) || []).filter((t) => now - t < 3_600_000);
  const ok = LIMITS.every(([span, max]) => list.filter((t) => now - t < span).length < max);
  if (ok) list.push(now);
  hits.set(ip, list);
  return ok;
}

// Раз в десять минут забываем адреса, с которых давно ничего не приходило.
setInterval(() => {
  const now = Date.now();
  for (const [ip, list] of hits) if (!list.some((t) => now - t < 3_600_000)) hits.delete(ip);
}, 600_000).unref();

const clean = (value, max) =>
  String(value ?? "")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, max);

function reply(res, status, body, origin) {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

async function sendToTelegram(text) {
  const response = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT, text, disable_web_page_preview: true }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Telegram ответил ${response.status}`);
}

const server = http.createServer(async (req, res) => {
  const origin = (req.headers.origin || "").replace(/\/$/, "");
  const known = ORIGINS.includes(origin) ? origin : "";

  if (req.url !== "/api/lead") return reply(res, 404, { ok: false });

  if (req.method === "OPTIONS") {
    if (!known) return reply(res, 403, { ok: false });
    res.writeHead(204, {
      "Access-Control-Allow-Origin": known,
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "600",
      Vary: "Origin",
    });
    return res.end();
  }

  if (req.method !== "POST") return reply(res, 405, { ok: false });
  // Заявки принимаем только со своего сайта.
  if (!known) return reply(res, 403, { ok: false, error: "origin" });
  if (!String(req.headers["content-type"] || "").startsWith("application/json")) {
    return reply(res, 415, { ok: false }, known);
  }

  // nginx передаёт настоящий адрес посетителя в X-Real-IP.
  const ip = String(req.headers["x-real-ip"] || req.socket.remoteAddress || "unknown");
  if (!allowed(ip, Date.now())) return reply(res, 429, { ok: false, error: "rate" }, known);

  let raw = "";
  try {
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > MAX_BODY) return reply(res, 413, { ok: false }, known);
    }
  } catch {
    return reply(res, 400, { ok: false }, known);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return reply(res, 400, { ok: false }, known);
  }
  if (!data || typeof data !== "object") return reply(res, 400, { ok: false }, known);

  // Поле-ловушка: человек его не видит, а робот заполняет. Отвечаем «принято» и ничего не шлём.
  if (clean(data.website, 100)) return reply(res, 200, { ok: true }, known);

  const name = clean(data.name, 80);
  const phone = clean(data.phone, 40);
  const business = clean(data.business, 1200);
  if (!business) return reply(res, 422, { ok: false, error: "business" }, known);
  if (data.consent !== true) return reply(res, 422, { ok: false, error: "consent" }, known);

  const lines = ["Новая заявка с сайта", ""];
  if (name) lines.push(`Имя: ${name}`);
  if (phone) lines.push(`Телефон: ${phone}`);
  lines.push(`Бизнес: ${business}`, "", "Согласие на обработку данных: да");
  const text = lines.join("\n");

  try {
    await sendToTelegram(text);
    reply(res, 200, { ok: true }, known);
  } catch (error) {
    // В журнал пишем только причину, без содержимого заявки и без ключа.
    console.error("Заявка не отправлена:", error.message);
    reply(res, 502, { ok: false, error: "send" }, known);
  }
});

server.listen(PORT, "127.0.0.1", () => console.log(`Приём заявок слушает 127.0.0.1:${PORT}`));
