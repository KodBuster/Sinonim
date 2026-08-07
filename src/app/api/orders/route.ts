import { NextResponse } from "next/server";
import { checkCartItemsStock } from "@/lib/advantshop/cart-stock";
import { submitAdvantShopOrder } from "@/lib/advantshop/orders";
import { isAdvantShopConfigured } from "@/lib/advantshop/config";
import type { CartItem } from "@/lib/cart";
import {
  getDeliveryFee,
  validateCheckoutForm,
  type CheckoutFormData,
  type PaymentMethod,
} from "@/lib/checkout";
import { allocateNextOrderNumber } from "@/lib/order-sequence";
import { createYooKassaPayment } from "@/lib/yookassa/client";
import { isYooKassaConfigured } from "@/lib/yookassa/config";

type CreateOrderRequest = {
  customer: CheckoutFormData;
  items: CartItem[];
  subtotal: number;
};

export async function POST(request: Request) {
  let body: CreateOrderRequest;

  try {
    body = (await request.json()) as CreateOrderRequest;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  if (!body.customer || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
  }

  const customer: CheckoutFormData = {
    ...body.customer,
    name: body.customer.name?.trim() ?? "",
    city: body.customer.city?.trim() ?? "",
    address: body.customer.address?.trim() ?? "",
    apartment: body.customer.apartment?.trim() ?? "",
    comment: body.customer.comment?.trim() ?? "",
    paymentMethod: body.customer.paymentMethod ?? "on_receipt",
  };

  const validationError = validateCheckoutForm(customer);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const subtotal =
    typeof body.subtotal === "number"
      ? body.subtotal
      : body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = getDeliveryFee(customer.deliveryMethod, subtotal);
  const total = subtotal + deliveryFee;
  const paymentMethod: PaymentMethod = customer.paymentMethod;

  if (paymentMethod === "yookassa" && !isYooKassaConfigured()) {
    return NextResponse.json(
      { error: "Онлайн-оплата временно недоступна" },
      { status: 503 },
    );
  }

  if (!isAdvantShopConfigured()) {
    return NextResponse.json(
      { error: "Интеграция с AdvantShop не настроена" },
      { status: 503 },
    );
  }

  try {
    const stockCheck = await checkCartItemsStock(body.items);
    if (!stockCheck.ok) {
      return NextResponse.json(
        {
          error: stockCheck.message,
          code: "OUT_OF_STOCK",
          unavailable: stockCheck.unavailable,
        },
        { status: 409 },
      );
    }

    const sequentialNumber = String(await allocateNextOrderNumber());
    const advantshop = await submitAdvantShopOrder({
      orderNumber: sequentialNumber,
      customer,
      items: body.items,
      deliveryFee,
    });

    // Публичный номер: то, что вернул AdvantShop (обычно совпадает с отправленным 1, 2, 3…)
    const orderId = advantshop.advantshopOrderNumber;

    const response: Record<string, unknown> = {
      id: orderId,
      advantshopOrderId: advantshop.advantshopOrderId,
      advantshopOrderNumber: orderId,
      deliveryFee,
      total,
      paymentMethod,
    };

    if (paymentMethod === "yookassa") {
      const payment = await createYooKassaPayment({
        orderId,
        amount: total,
        description: `Заказ ${orderId} — Синоним`,
        customerPhone: customer.phone,
      });

      const paymentUrl = payment.confirmation?.confirmation_url;
      if (!paymentUrl) {
        throw new Error("ЮKassa не вернула ссылку на оплату");
      }

      response.paymentId = payment.id;
      response.paymentUrl = paymentUrl;
      response.paymentStatus = payment.status;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Order/payment error:", error);
    const raw =
      error instanceof Error ? error.message : "Не удалось оформить заказ";
    const looksLikeStock =
      /нет в наличии|недоступ|остат|amount|available|quantity/i.test(raw);
    const message = looksLikeStock
      ? "К сожалению, эти изделия закончились. Пожалуйста, подберите вместо них другие. У нас ещё много чего есть."
      : raw;
    return NextResponse.json(
      { error: message, code: looksLikeStock ? "OUT_OF_STOCK" : undefined },
      { status: looksLikeStock ? 409 : 502 },
    );
  }
}
