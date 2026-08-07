import { getMaxAdminUserIds, getMaxBotToken } from "@/lib/max/config";

const MAX_API_BASE = "https://platform-api.max.ru";

type MaxTarget = { type: "user_id" | "chat_id"; id: number };

type MaxApiResult = {
  ok: boolean;
  httpCode: number;
  body: string;
  error?: string;
};

function authHeader(token: string): string {
  const trimmed = token.trim();
  if (trimmed.toLowerCase().startsWith("bearer ")) {
    return trimmed.slice(7).trim();
  }
  return trimmed;
}

async function maxApiRequest(
  token: string,
  method: "GET" | "POST",
  path: string,
  body?: Record<string, unknown>,
  query?: Record<string, string | number>
): Promise<MaxApiResult> {
  const url = new URL(`${MAX_API_BASE}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, String(value));
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: authHeader(token),
        ...(method === "POST"
          ? { "Content-Type": "application/json; charset=utf-8" }
          : {}),
      },
      body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
      cache: "no-store",
    });

    const text = await response.text();
    return {
      ok: response.ok,
      httpCode: response.status,
      body: text,
      error: response.ok ? undefined : text.slice(0, 500),
    };
  } catch (error) {
    return {
      ok: false,
      httpCode: 0,
      body: "",
      error: error instanceof Error ? error.message : "fetch failed",
    };
  }
}

async function sendMaxMessage(
  token: string,
  target: MaxTarget,
  text: string
): Promise<boolean> {
  const result = await maxApiRequest(
    token,
    "POST",
    "/messages",
    { text, notify: true },
    { [target.type]: target.id }
  );

  if (!result.ok) {
    console.error(
      `MAX send failed (${target.type}=${target.id}): HTTP ${result.httpCode}`,
      result.error ?? result.body.slice(0, 300)
    );
  }

  return result.ok;
}

export type MaxNotifyResult = {
  configured: boolean;
  sent: number;
  recipients: number;
  errors: number;
};

/** Отправить текст всем админам из MAX_ADMIN_USER_IDS. */
export async function notifyMaxAdmins(text: string): Promise<MaxNotifyResult> {
  const token = getMaxBotToken();
  const userIds = getMaxAdminUserIds();

  if (!token || userIds.length === 0) {
    return { configured: false, sent: 0, recipients: 0, errors: 0 };
  }

  const targets: MaxTarget[] = userIds.map((id) => ({
    type: "user_id",
    id,
  }));

  let sent = 0;
  let errors = 0;

  for (const target of targets) {
    const ok = await sendMaxMessage(token, target, text);
    if (ok) sent += 1;
    else errors += 1;
  }

  return {
    configured: true,
    sent,
    recipients: targets.length,
    errors,
  };
}
