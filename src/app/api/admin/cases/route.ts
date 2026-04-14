import { ensureAdminAuthorized } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { CaseProductModel } from "@/models/CaseProduct";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const denied = ensureAdminAuthorized(request);
  if (denied) {
    return denied;
  }

  try {
    await connectToDatabase();
    const items = await CaseProductModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      items: items.map((item) => ({
        _id: String(item._id),
        name: item.name,
        description: item.description,
        price: item.price,
        discountPercent: item.discountPercent,
        imageUrl: item.imageUrl ?? null,
        colorHex: item.colorHex ?? "#f7f4f0",
        isActive: item.isActive,
        height: item.height,
        width: item.width,
        source: item.source,
        id: item.id,
        swatchClassName: item.swatchClassName,
      })),
    });
  } catch {
    return NextResponse.json({ message: "Failed to load cases." }, { status: 500 });
  }
}

// export async function POST(request: Request) {
//   const denied = ensureAdminAuthorized(request);
//   if (denied) {
//     return denied;
//   }

//   try {
//     const payload = await request.json();
//     const parsed = adminCaseSchema.safeParse(payload);

//     if (!parsed.success) {
//       return NextResponse.json(
//         { message: "Invalid case payload.", details: parsed.error.flatten() },
//         { status: 400 },
//       );
//     }

//     await connectToDatabase();
//     const created = await CaseProductModel.create({
//       name: parsed.data.name,
//       description: parsed.data.description,
//       price: parsed.data.price,
//       discountPercent: normalizeDiscountPercent(parsed.data.discountPercent),
//       imageUrl: parsed.data.imageUrl ?? null,
//       colorHex: parsed.data.colorHex,
//       isActive: parsed.data.isActive,
//     });

//     return NextResponse.json(
//       {
//         message: "Case created.",
//         item: {
//           id: String(created._id),
//           name: created.name,
//           description: created.description,
//           price: created.price,
//           discountPercent: created.discountPercent,
//           imageUrl: created.imageUrl,
//           colorHex: created.colorHex,
//           isActive: created.isActive,
//         },
//       },
//       { status: 201 },
//     );
//   } catch (error) {
//     const message = error instanceof Error ? error.message : "Failed to create case.";
//     return NextResponse.json({ message }, { status: 500 });
//   }
// }