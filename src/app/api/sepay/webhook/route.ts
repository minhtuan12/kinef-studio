import { connectToDatabase } from "@/lib/db";
import { client } from "@/lib/sepay";
import { Order } from "@/models/Order";
import { NextResponse } from "next/server";

type WebhookPayload = Record<string, unknown>;

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return {};
}

function getFromPayload(payload: WebhookPayload, keys: string[]) {
  for (const key of keys) {
    if (payload[key] !== undefined && payload[key] !== null) {
      return payload[key];
    }
  }

  return undefined;
}

async function readWebhookPayload(request: Request): Promise<WebhookPayload> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("application/json")) {
    return asRecord(await request.json());
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  try {
    return asRecord(await request.json());
  } catch {
    try {
      const formData = await request.formData();
      return Object.fromEntries(formData.entries());
    } catch {
      return {};
    }
  }
}

function resolveInvoiceCode(payload: WebhookPayload) {
  const raw = getFromPayload(payload, [
    "code",
  ]);

  return typeof raw === "string" ? raw.trim() : "";
}

function resolveApiKeyFromAuthorizationHeader(authorizationHeader: string | null) {
  if (!authorizationHeader) {
    return null;
  }

  const match = authorizationHeader.match(/^apikey\s+(.+)$/i);
  if (!match) {
    return null;
  }

  return match[1]?.trim() ?? null;
}

export async function POST(request: Request) {
  try {
    const expectedApiKey = process.env.SEPAY_WEBHOOK_API_KEY ?? process.env.SEPAY_WEBHOOK_SECRET;
    if (expectedApiKey) {
      const providedApiKey = resolveApiKeyFromAuthorizationHeader(
        request.headers.get("authorization"),
      );

      if (providedApiKey !== expectedApiKey) {
        return NextResponse.json(
          { message: "Unauthorized webhook request." },
          { status: 401 },
        );
      }
    }

    const payload = await readWebhookPayload(request);
    const sepayPaymentCode = resolveInvoiceCode(payload);
    if (!sepayPaymentCode) {
      return NextResponse.json({ message: "Missing payment code." }, { status: 400 });
    }

    const sepayOrder = await client.order.all({ q: sepayPaymentCode });
    const orderCode = sepayOrder.data.data?.[0]?.order_invoice_number ?? null;

    await connectToDatabase();

    const order = await Order.findOne({ orderCode });

    if (!order) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    if (order.payment.status !== "unpaid") {
      return NextResponse.json({
        message: "Order payment is already updated.",
        orderCode: order.orderCode,
        payment: order.payment,
        status: order.status,
      });
    }

    const halfAmount = Math.ceil(order.total * 0.5);

    order.payment.paidAmount = halfAmount;
    order.payment.status = "partial";
    order.status = "confirmed";

    await order.save();

    return NextResponse.json({
      message: "Order payment updated.",
      orderCode: order.orderCode,
      payment: order.payment,
      status: order.status,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process SePay webhook.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
