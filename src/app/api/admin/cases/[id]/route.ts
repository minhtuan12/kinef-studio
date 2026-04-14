import { ensureAdminAuthorized } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { adminCaseSchema } from "@/lib/validators";
import { CaseProductModel } from "@/models/CaseProduct";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

function invalidIdResponse() {
  return NextResponse.json({ message: "Invalid case id." }, { status: 400 });
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
    const parsed = adminCaseSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid case payload.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const updated = await CaseProductModel.findByIdAndUpdate(
      id,
      {
        name: parsed.data.name,
        // description: parsed.data.description,
        price: parsed.data.price,
        // discountPercent: normalizeDiscountPercent(parsed.data.discountPercent),
        // imageUrl: parsed.data.imageUrl ?? null,
        // colorHex: parsed.data.colorHex,
        isActive: parsed.data.isActive,
      },
      { new: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ message: "Case not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Case updated.",
      item: {
        id: String(updated._id),
        name: updated.name,
        description: updated.description,
        price: updated.price,
        discountPercent: updated.discountPercent,
        imageUrl: updated.imageUrl ?? null,
        colorHex: updated.colorHex ?? "#f7f4f0",
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update case.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

// export async function DELETE(
//   request: Request,
//   context: { params: Promise<{ id: string }> },
// ) {
//   const denied = ensureAdminAuthorized(request);
//   if (denied) {
//     return denied;
//   }

//   const { id } = await context.params;
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return invalidIdResponse();
//   }

//   try {
//     await connectToDatabase();
//     const deleted = await CaseProductModel.findByIdAndDelete(id).lean();

//     if (!deleted) {
//       return NextResponse.json({ message: "Case not found." }, { status: 404 });
//     }

//     return NextResponse.json({ message: "Case deleted." });
//   } catch (error) {
//     const message = error instanceof Error ? error.message : "Failed to delete case.";
//     return NextResponse.json({ message }, { status: 500 });
//   }
// }