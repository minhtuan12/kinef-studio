import {
  CASE_PRICE,
  MAX_CHARMS_PER_ORDER,
  type CharmProduct,
} from "@/lib/constants";
import {
  getFinalCharmPrice,
  resolveCharmsByIds,
} from "@/lib/catalog";
import { connectToDatabase } from "@/lib/db";
import { createOrderSchema } from "@/lib/validators";
import { CharmModel } from "@/models/Charm";
import { Order } from "@/models/Order";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { SePayPgClient } from "sepay-pg-node";

function createOrderCode() {
  const seed = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `KF${seed}`;
}

async function buildUniqueOrderCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const orderCode = createOrderCode();
    const existing = await Order.findOne({ orderCode }).lean();
    if (!existing) {
      return orderCode;
    }
  }

  throw new Error("Failed to generate unique order code.");
}

function findMissingCharmIds(requestedIds: string[], resolved: CharmProduct[]) {
  const resolvedSet = new Set(resolved.map((item) => item.id));
  return requestedIds.filter((id) => !resolvedSet.has(id));
}

function resolveStorefrontBaseUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.WEB_URL;
  if (configuredUrl && configuredUrl.trim().length > 0) {
    return configuredUrl.replace(/\/+$/, "");
  }

  return new URL(request.url).origin;
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

const client = new SePayPgClient({
  env: 'production',
  merchant_id: process.env.SEPAY_MERCHANT_ID!,
  secret_key: process.env.SEPAY_SECRET_KEY!,
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = createOrderSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid order payload.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const selectedCase = parsed.data.caseId;
    // if (!selectedCase || !selectedCase.isActive) {
    //   return NextResponse.json({ message: "Invalid case option." }, { status: 400 });
    // }

    const selectedCharms = await resolveCharmsByIds(parsed.data.charmIds);
    const missingCharmIds = findMissingCharmIds(parsed.data.charmIds, selectedCharms);
    if (missingCharmIds.length > 0) {
      return NextResponse.json(
        { message: `Charm ${missingCharmIds[0]} does not exist.` },
        { status: 400 },
      );
    }

    if (selectedCharms.length > MAX_CHARMS_PER_ORDER) {
      return NextResponse.json(
        { message: `Only ${MAX_CHARMS_PER_ORDER} charms are allowed per order.` },
        { status: 400 },
      );
    }

    const soldOutCharm = selectedCharms.find((item) => item.stock === 0);
    if (soldOutCharm) {
      return NextResponse.json(
        { message: `Charm ${soldOutCharm.name} is currently sold out.` },
        { status: 409 },
      );
    }

    const caseTotal = CASE_PRICE;
    const charmTotal = selectedCharms.reduce(
      (sum, charm) => sum + getFinalCharmPrice(charm),
      0,
    );
    const total = caseTotal + charmTotal;

    const orderCode = await buildUniqueOrderCode();
    const storefrontBaseUrl = resolveStorefrontBaseUrl(request);
    const confirmationUrl = `${storefrontBaseUrl}/confirmation/${orderCode}`;
    let decrementedDbCharmIds: string[] = [];

    const dbCharmIds = selectedCharms
      .filter((item) => item.source === "db" && mongoose.Types.ObjectId.isValid(item.id))
      .map((item) => item.id);

    if (dbCharmIds.length > 0) {
      const stocksUpdated = await decrementCharmStocks(dbCharmIds);
      if (!stocksUpdated) {
        return NextResponse.json(
          { message: "One or more selected charms are out of stock." },
          { status: 409 },
        );
      }

      decrementedDbCharmIds = dbCharmIds;
    }

    try {
      await Order.create({
        orderCode,
        caseItem: selectedCase,
        charms: selectedCharms.map((charm) => ({
          id: charm.id,
          name: charm.name,
          icon: charm.icon,
          price: charm.price,
          discountPercent: charm.discountPercent,
          finalPrice: getFinalCharmPrice(charm),
          imageUrl: charm.imageUrl,
        })),
        caseTotal,
        charmTotal,
        total,
        customer: parsed.data.customer,
        notes: parsed.data.notes,
        payment: {
          status: "unpaid",
          paidAmount: 0,
          options: {
            deposit: null,
            full: null,
          },
        },
        status: "pending",
      });
    } catch (error) {
      if (decrementedDbCharmIds.length > 0) {
        await CharmModel.updateMany(
          { _id: { $in: decrementedDbCharmIds } },
          { $inc: { stock: 1 } },
        );
      }

      throw error;
    }

    const checkoutURL = client.checkout.initCheckoutUrl();
    const checkoutFormfields = client.checkout.initOneTimePaymentFields({
      operation: "PURCHASE",
      payment_method: 'BANK_TRANSFER',
      order_invoice_number: orderCode,
      order_amount: total / 2,
      currency: 'VND',
      order_description: `Cọc đơn hàng ${orderCode}`,
      success_url: confirmationUrl,
      error_url: confirmationUrl,
      cancel_url: confirmationUrl,
    });

    return NextResponse.json({
      orderCode,
      checkoutUrl: checkoutURL,
      checkoutFormFields: checkoutFormfields,
      message: "Order submitted successfully.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to place order.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
