import { config } from "dotenv";

config({ path: ".env.telegram.local", quiet: true });
const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
async function call(method: string, body: Record<string, unknown> = {}) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!response.ok || !data.ok)
    throw new Error(`Telegram отклонил ${method} (код ${response.status}). Проверьте токен, канал и права бота.`);
  return data.result;
}
try {
  if (!token) throw new Error("Заполните TELEGRAM_BOT_TOKEN в .env.telegram.local.");
  const bot = await call("getMe");
  console.log(`Бот доступен: @${bot.username}`);
  if (!chatId) {
    const webhook = await call("getWebhookInfo");
    if (webhook.url) throw new Error("У бота уже подключён webhook. Используйте отдельного бота или укажите ID канала вручную.");
    const updates = await call("getUpdates", { timeout: 0, limit: 100 });
    const channels = new Map<string, string>();
    for (const update of updates) {
      const chat = (update.channel_post ?? update.my_chat_member)?.chat;
      if (chat?.type === "channel") channels.set(String(chat.id), chat.title);
    }
    for (const [id, title] of channels) console.log(`Канал «${title}»: TELEGRAM_CHAT_ID=${id}`);
    throw new Error(channels.size
      ? "Впишите ID нужного канала в .env.telegram.local и повторите проверку."
      : "Добавьте бота администратором канала, опубликуйте там «Проверка Astrowed» и повторите проверку.");
  }
  const chat = await call("getChat", { chat_id: chatId });
  const member = await call("getChatMember", { chat_id: chatId, user_id: bot.id });
  if (!["channel", "supergroup"].includes(chat.type)) throw new Error("Для заявок ожидается закрытый канал или супергруппа эксперта.");
  if (chat.username) throw new Error("Канал публичный. Для персональных анкет используйте закрытый канал.");
  const canSend = chat.type === "channel"
    ? member.status === "creator" || (member.status === "administrator" && member.can_post_messages)
    : ["creator", "administrator"].includes(member.status) ||
      (member.status === "member" && chat.permissions?.can_send_messages) ||
      (member.status === "restricted" && member.is_member && member.can_send_messages);
  if (!canSend)
    throw new Error("Разрешите боту публикацию сообщений в канале.");
  const topic = process.env.TELEGRAM_MESSAGE_THREAD_ID?.trim();
  if (topic && (!/^\d+$/.test(topic) || !Number.isSafeInteger(Number(topic)) || Number(topic) < 1 || !chat.is_forum))
    throw new Error("Проверьте ID темы: он должен быть положительным числом, а чат — группой с темами.");
  console.log(`Чат «${chat.title}»: право публикации подтверждено. Сообщения не отправлялись.`);
  if (topic) console.log(`Тема ${topic}: существование и доставку нужно подтвердить тестовым сообщением.`);
} catch (error) {
  // Never print fetch errors/stacks: their URLs can contain the bot token.
  console.error(error instanceof Error && !error.cause && !/fetch|https?:/i.test(error.message)
    ? error.message : "Не удалось связаться с Telegram. Проверьте подключение и повторите.");
  process.exitCode = 1;
}
