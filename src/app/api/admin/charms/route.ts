import { ensureAdminAuthorized } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { normalizeDiscountPercent } from "@/lib/constants";
import { adminCharmSchema } from "@/lib/validators";
import { CharmModel } from "@/models/Charm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const denied = ensureAdminAuthorized(request);
  if (denied) {
    return denied;
  }

  try {
    await connectToDatabase();
    const items = await CharmModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      items: items.map((item) => ({
        id: String(item._id),
        name: item.name,
        icon: item.icon ?? "●",
        price: item.price,
        discountPercent: item.discountPercent,
        stock: item.stock,
        imageUrl: item.imageUrl ?? null,
        isActive: item.isActive,
      })),
    });
  } catch {
    return NextResponse.json({ message: "Failed to load charms." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = ensureAdminAuthorized(request);
  if (denied) {
    return denied;
  }

  try {
    const payload = await request.json();
    const parsed = adminCharmSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid charm payload.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const created = await CharmModel.create({
      name: parsed.data.name,
      icon: parsed.data.icon,
      price: parsed.data.price,
      discountPercent: normalizeDiscountPercent(parsed.data.discountPercent),
      stock: parsed.data.stock,
      imageUrl: parsed.data.imageUrl ?? null,
      isActive: parsed.data.isActive,
    });

    return NextResponse.json(
      {
        message: "Charm created.",
        item: {
          id: String(created._id),
          name: created.name,
          icon: created.icon,
          price: created.price,
          discountPercent: created.discountPercent,
          stock: created.stock,
          imageUrl: created.imageUrl,
          isActive: created.isActive,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create charm.";
    return NextResponse.json({ message }, { status: 500 });
  }
}