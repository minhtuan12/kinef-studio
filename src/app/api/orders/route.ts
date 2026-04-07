import {
  MAX_CHARMS_PER_ORDER,
  type CharmProduct,
} from "@/lib/constants";
import {
  getFinalCasePrice,
  getFinalCharmPrice,
  resolveCaseById,
  resolveCharmsByIds,
} from "@/lib/catalog";
import { connectToDatabase } from "@/lib/db";
import { createOrderSchema } from "@/lib/validators";
import { Order } from "@/models/Order";
import { NextResponse } from "next/server";

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

    const selectedCase = await resolveCaseById(parsed.data.caseId);
    if (!selectedCase || !selectedCase.isActive) {
      return NextResponse.json({ message: "Invalid case option." }, { status: 400 });
    }

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

    const caseTotal = getFinalCasePrice(selectedCase);
    const charmTotal = selectedCharms.reduce(
      (sum, charm) => sum + getFinalCharmPrice(charm),
      0,
    );
    const total = caseTotal + charmTotal;

    const orderCode = await buildUniqueOrderCode();

    await Order.create({
      orderCode,
      caseItem: {
        id: selectedCase.id,
        name: selectedCase.name,
        price: selectedCase.price,
        discountPercent: selectedCase.discountPercent,
        finalPrice: caseTotal,
        imageUrl: selectedCase.imageUrl,
      },
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
      referenceImageUrl: parsed.data.referenceImageUrl,
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

    return NextResponse.json({
      orderCode,
      total,
      message: "Order submitted successfully.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to place order.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
