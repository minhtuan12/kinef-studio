import { ensureAdminAuthorized } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { normalizeDiscountPercent } from "@/lib/constants";
import { adminCharmSchema } from "@/lib/validators";
import { CharmModel } from "@/models/Charm";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

function invalidIdResponse() {
  return NextResponse.json({ message: "Invalid charm id." }, { status: 400 });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const denied = ensureAdminAuthorized(request);
  if (denied) {
    return denied;
  }

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return invalidIdResponse();
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
    const updated = await CharmModel.findByIdAndUpdate(
      id,
      {
        name: parsed.data.name,
        icon: parsed.data.icon,
        price: parsed.data.price,
        discountPercent: normalizeDiscountPercent(parsed.data.discountPercent),
        stock: parsed.data.stock,
        imageUrl: parsed.data.imageUrl ?? null,
        isActive: parsed.data.isActive,
      },
      { new: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ message: "Charm not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Charm updated.",
      item: {
        id: String(updated._id),
        name: updated.name,
        icon: updated.icon ?? "●",
        price: updated.price,
        discountPercent: updated.discountPercent,
        stock: updated.stock,
        imageUrl: updated.imageUrl ?? null,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update charm.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const denied = ensureAdminAuthorized(request);
  if (denied) {
    return denied;
  }

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return invalidIdResponse();
  }

  try {
    await connectToDatabase();
    const deleted = await CharmModel.findByIdAndDelete(id).lean();

    if (!deleted) {
      return NextResponse.json({ message: "Charm not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Charm deleted." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete charm.";
    return NextResponse.json({ message }, { status: 500 });
  }
}