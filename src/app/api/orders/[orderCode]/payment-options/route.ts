import { createSepayOrder, isSepayConfigured } from "@/lib/sepay";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { NextResponse } from "next/server";

type PaymentOptionType = "deposit" | "full";

type PersistedPaymentOption = {
  amount: number;
  sepayOrderId: string;
  sepayOrderCode: string;
  qrCode?: string | null;
  checkoutUrl?: string | null;
  status?: string | null;
};

function mapOption(type: PaymentOptionType, option: PersistedPaymentOption) {
  return {
    type,
    amount: option.amount,
    sepayOrderId: option.sepayOrderId,
    sepayOrderCode: option.sepayOrderCode,
    qrCode: option.qrCode ?? null,
    checkoutUrl: option.checkoutUrl ?? null,
    status: option.status ?? null,
  };
}

async function createOrReuseOption({
  order,
  type,
  amount,
  suffix,
}: {
  order: InstanceType<typeof Order>;
  type: PaymentOptionType;
  amount: number;
  suffix: string;
}) {
  const existing = order.get(`payment.options.${type}`) as PersistedPaymentOption | null;
  if (existing?.sepayOrderId) {
    return existing;
  }

  const description = order.orderCode;
  const primaryCode = `${order.orderCode}-${suffix}`;

  try {
    const created = await createSepayOrder({
      amount,
      orderCode: primaryCode,
      description,
    });

    const nextOption: PersistedPaymentOption = {
      amount: created.amount,
      sepayOrderId: created.id,
      sepayOrderCode: created.orderCode,
      qrCode: created.qrCode ?? null,
      checkoutUrl: created.checkoutUrl ?? null,
      status: created.status ?? null,
    };

    order.set(`payment.options.${type}`, nextOption);
    return nextOption;
  } catch (error) {
    const retryCode = `${primaryCode}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
    const created = await createSepayOrder({
      amount,
      orderCode: retryCode,
      description,
    });

    const nextOption: PersistedPaymentOption = {
      amount: created.amount,
      sepayOrderId: created.id,
      sepayOrderCode: created.orderCode,
      qrCode: created.qrCode ?? null,
      checkoutUrl: created.checkoutUrl ?? null,
      status: created.status ?? null,
    };

    order.set(`payment.options.${type}`, nextOption);

    if (error instanceof Error) {
      order.set("payment.lastSepayError", error.message);
    }

    return nextOption;
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderCode: string }> },
) {
  try {
    const { orderCode } = await context.params;

    await connectToDatabase();
    const order = await Order.findOne({ orderCode });
    if (!order) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    const depositAmount = Math.ceil(order.total * 0.5);
    const fullAmount = order.total;

    if (!isSepayConfigured()) {
      return NextResponse.json(
        {
          message:
            "SePay is not configured. Set SEPAY_API_TOKEN and SEPAY_BANK_ACCOUNT_UUID.",
          options: [
            { type: "deposit", amount: depositAmount },
            { type: "full", amount: fullAmount },
          ],
        },
        { status: 501 },
      );
    }

    const deposit = await createOrReuseOption({
      order,
      type: "deposit",
      amount: depositAmount,
      suffix: "50",
    });

    const full = await createOrReuseOption({
      order,
      type: "full",
      amount: fullAmount,
      suffix: "100",
    });

    await order.save();

    return NextResponse.json({
      orderCode: order.orderCode,
      total: order.total,
      options: [mapOption("deposit", deposit), mapOption("full", full)],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate payment options.";

    return NextResponse.json({ message }, { status: 500 });
  }
}