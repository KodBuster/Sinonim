import {
  getMaxAdminChatIds,
  getMaxAdminUserIds,
  getMaxBotToken,
} from "@/lib/max/config";

/** Актуальный домен API (старый platform-api.max.ru тоже отвечает, но docs рекомендуют api2). */
const MAX_API_BASE = "https://platform-api2.max.ru";

export type MaxTarget = { type: "user_id" | "chat_id"; id: number };

export type MaxSendDetail = {
  type: "user_id" | "chat_id";
  id: number;
  ok: boolean;
  httpCode: number;
  error?: string;
};

type MaxApiResult = {
  ok: boolean;
  httpCode: number;
  body: string;
  error?: string;
  json?: unknown;
};

function authHeader(token: string): string {
  const trimmed = token.trim();
  if (trimmed.toLowerCase().startsWith("bearer ")) {
    return trimmed.slice(7).trim();
  }
  return trimmed;
}

export async function maxApiRequest(
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
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : undefined;
    } catch {
      json = undefined;
    }

    return {
      ok: response.ok,
      httpCode: response.status,
      body: text,
      error: response.ok ? undefined : text.slice(0, 500),
      json,
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
): Promise<MaxSendDetail> {
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

  return {
    type: target.type,
    id: target.id,
    ok: result.ok,
    httpCode: result.httpCode,
    error: result.ok
      ? undefined
      : result.error || result.body.slice(0, 300) || `HTTP ${result.httpCode}`,
  };
}

export function getMaxNotifyTargets(): MaxTarget[] {
  const targets: MaxTarget[] = [];
  const seen = new Set<string>();

  for (const id of getMaxAdminUserIds()) {
    const key = `user_id:${id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    targets.push({ type: "user_id", id });
  }

  for (const id of getMaxAdminChatIds()) {
    const key = `chat_id:${id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    targets.push({ type: "chat_id", id });
  }

  return targets;
}

export type MaxNotifyResult = {
  configured: boolean;
  sent: number;
  recipients: number;
  errors: number;
  details: MaxSendDetail[];
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Отправить текст всем админам из MAX_ADMIN_USER_IDS / MAX_ADMIN_CHAT_IDS. */
export async function notifyMaxAdmins(text: string): Promise<MaxNotifyResult> {
  const token = getMaxBotToken();
  const targets = getMaxNotifyTargets();

  if (!token || targets.length === 0) {
    return {
      configured: false,
      sent: 0,
      recipients: 0,
      errors: 0,
      details: [],
    };
  }

  console.info(
    "MAX notify targets:",
    targets.map((t) => `${t.type}=${t.id}`).join(", ")
  );

  const details: MaxSendDetail[] = [];

  for (let i = 0; i < targets.length; i += 1) {
    if (i > 0) await sleep(350);
    details.push(await sendMaxMessage(token, targets[i], text));
  }

  const sent = details.filter((d) => d.ok).length;
  const errors = details.length - sent;

  return {
    configured: true,
    sent,
    recipients: targets.length,
    errors,
    details,
  };
}
