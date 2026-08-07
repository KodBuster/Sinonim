/**
 * MAX Bot API — уведомления админам о покупках.
 * Паттерн как в «Я-помогаю»: POST https://platform-api.max.ru/messages
 */

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

/** Токен бота из business.max.ru (без префикса Bearer). */
export function getMaxBotToken(): string | undefined {
  return readEnv("MAX_BOT_TOKEN") ?? readEnv("MAX_TOKEN");
}

/**
 * Числовые user_id получателей.
 * Формат: MAX_ADMIN_USER_IDS=230495694,123456
 * Нулевые и пустые пропускаются.
 */
export function getMaxAdminUserIds(): number[] {
  const raw =
    readEnv("MAX_ADMIN_USER_IDS") ??
    readEnv("MAX_ADMIN_USER_ID") ??
    "230495694";

  return raw
    .split(/[,;\s]+/)
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((id) => Number.isFinite(id) && id > 0);
}

export function isMaxNotifyConfigured(): boolean {
  return Boolean(getMaxBotToken() && getMaxAdminUserIds().length > 0);
}
