/**
 * MAX Bot API — уведомления админам о покупках.
 * @see https://dev.max.ru/docs-api
 */

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

/** Токен бота из business.max.ru (без префикса Bearer). */
export function getMaxBotToken(): string | undefined {
  return readEnv("MAX_BOT_TOKEN") ?? readEnv("MAX_TOKEN");
}

function parseIdList(raw: string | undefined): number[] {
  if (!raw) return [];
  return raw
    .split(/[,;\s]+/)
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((id) => Number.isFinite(id) && id !== 0);
}

/**
 * Числовые user_id получателей.
 * Формат: MAX_ADMIN_USER_IDS=230495694;211500277
 * (точка с запятой надёжнее запятой в некоторых панелях env)
 */
export function getMaxAdminUserIds(): number[] {
  const raw =
    readEnv("MAX_ADMIN_USER_IDS") ??
    readEnv("MAX_ADMIN_USER_ID") ??
    "230495694";

  return [...new Set(parseIdList(raw).filter((id) => id > 0))];
}

/**
 * chat_id личных диалогов с ботом (если user_id не доставляет).
 * Формат: MAX_ADMIN_CHAT_IDS=-123456789;-987654321
 * Как получить: /api/notify/max-ids (после того как админ написал боту).
 */
export function getMaxAdminChatIds(): number[] {
  return [...new Set(parseIdList(readEnv("MAX_ADMIN_CHAT_IDS")))];
}

export function isMaxNotifyConfigured(): boolean {
  return Boolean(
    getMaxBotToken() &&
      (getMaxAdminUserIds().length > 0 || getMaxAdminChatIds().length > 0)
  );
}
