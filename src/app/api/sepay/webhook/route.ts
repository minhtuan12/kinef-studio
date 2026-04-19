import { connectToDatabase } from "@/lib/db";
import { client } from "@/lib/sepay";
import { CharmModel } from "@/models/Charm";
import { Order } from "@/models/Order";
import { NextResponse } from "next/server";

type WebhookPayload = Record<string, unknown>;
type SepayOrderSearchResult = {
  order_id?: string | null;
  order_invoice_number?: string | null;
  order_description?: string | null;
};

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

function resolveTransferAmount(payload: WebhookPayload) {
  const raw = getFromPayload(payload, ["transferAmount"]);

  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }

  if (typeof raw === "string") {
    const parsed = Number(raw.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function resolveOrderCodeFromSearchResults(
  sepayPaymentCode: string,
  results: SepayOrderSearchResult[],
) {
  const exactOrder = results.find((order) => order.order_id === sepayPaymentCode);
  if (exactOrder?.order_invoice_number) {
    return exactOrder.order_invoice_number;
  }

  if (results.length === 1 && results[0]?.order_invoice_number) {
    return results[0].order_invoice_number;
  }

  return null;
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

async function decrementCharmStocks(charmIds: string[]) {
  const updatedIds: string[] = [];

  for (const charmId of charmIds) {
    const updatedCharm = await CharmModel.findOneAndUpdate(
      {
        _id: charmId,
        isActive: true,
        stock: { $gt: 0 },
      },
      { $inc: { stock: -1 } },
      { new: true },
    ).lean();

    if (!updatedCharm) {
      if (updatedIds.length > 0) {
        await CharmModel.updateMany(
          { _id: { $in: updatedIds } },
          { $inc: { stock: 1 } },
        );
      }

      return false;
    }

    updatedIds.push(charmId);
  }

  return true;
}

export async function POST(request: Request) {
  let decrementedDbCharmIds: string[] = [];
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

    const paidAmount = resolveTransferAmount(payload);
    if (paidAmount === null) {
      return NextResponse.json({ message: "Missing transfer amount." }, { status: 400 });
    }

    const sepayOrders = await client.order.all({ q: sepayPaymentCode });
    const orderCode = resolveOrderCodeFromSearchResults(
      sepayPaymentCode,
      Array.isArray(sepayOrders.data.data) ? sepayOrders.data.data : [],
    );

    if (!orderCode) {
      return NextResponse.json(
        { message: "Unable to resolve order code from SePay webhook." },
        { status: 404 },
      );
    }

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

    order.payment.paidAmount = paidAmount;
    if (paidAmount === order.total) {
      order.payment.status = "paid";
    } else {
      order.payment.status = 'partial';
    }
    order.status = "confirmed";

    const charmIds = order.charms.map((c: any) => c.id);
    if (charmIds.length > 0) {
      const stocksUpdated = await decrementCharmStocks(charmIds);
      if (!stocksUpdated) {
        return NextResponse.json(
          { message: "One or more selected charms are out of stock." },
          { status: 409 },
        );
      }

      decrementedDbCharmIds = charmIds;
    }

    await order.save();

    return NextResponse.json({
      message: "Order payment updated.",
      orderCode: order.orderCode,
      payment: order.payment,
      status: order.status,
    });
  } catch (error) {
    if (decrementedDbCharmIds.length > 0) {
      await CharmModel.updateMany(
        { _id: { $in: decrementedDbCharmIds } },
        { $inc: { stock: 1 } },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to process SePay webhook.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
