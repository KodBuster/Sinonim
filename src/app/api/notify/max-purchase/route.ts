import { NextResponse } from "next/server";
import type { Order } from "@/lib/checkout";
import { isMaxNotifyConfigured } from "@/lib/max/config";
import { notifyMaxAdmins } from "@/lib/max/client";
import { formatPurchaseMaxMessage } from "@/lib/max/purchase-notify";

/** Антидубль в рамках инстанса (клиент может дернуть повторно). */
const recentNotified = new Map<string, number>();
const DEDUP_TTL_MS = 10 * 60 * 1000;

function wasRecentlyNotified(orderKey: string): boolean {
  const now = Date.now();
  for (const [key, at] of recentNotified) {
    if (now - at > DEDUP_TTL_MS) recentNotified.delete(key);
  }
  if (recentNotified.has(orderKey)) return true;
  recentNotified.set(orderKey, now);
  return false;
}

export async function POST(request: Request) {
  if (!isMaxNotifyConfigured()) {
    return NextResponse.json(
      { ok: false, error: "MAX notify is not configured" },
      { status: 503 }
    );
  }

  let order: Order;
  try {
    const body = (await request.json()) as { order?: Order };
    if (!body.order?.id || !body.order.customer || !Array.isArray(body.order.items)) {
      return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
    }
    order = body.order;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orderKey = order.advantshopOrderNumber ?? order.id;
  if (wasRecentlyNotified(orderKey)) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  const text = formatPurchaseMaxMessage(order);
  const result = await notifyMaxAdmins(text);

  return NextResponse.json({
    ok: result.sent > 0 && result.errors === 0,
    partial: result.sent > 0 && result.errors > 0,
    ...result,
  });
}
