import { ensureAdminAuthorized } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { CaseProductModel } from "@/models/CaseProduct";
import { Order } from "@/models/Order";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
  const denied = ensureAdminAuthorized(request);
  if (denied) {
    return denied;
  }

  try {
    await connectToDatabase();
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    const cases = await CaseProductModel.find().lean();
    let casePrices: Record<string, { name: string; price: number }> = {};
    cases.forEach((c) => {
      casePrices = {
        ...casePrices,
        [c.id]: {
          name: c.name,
          price: c.price,
        },
      };
    });

    const rows = orders.map((order) => ({
      OrderCode: order.orderCode,
      CustomerName: order.customer?.name ?? "",
      Instagram: order.customer?.instagram ?? "",
      PhoneNumber: order.customer?.phoneNumber ?? "",
      PhoneModel: order.customer?.phoneModel ?? "",
      CaseName: casePrices[order.caseItem].name ?? "",
      CasePrice: casePrices[order.caseItem].price ?? 0,
      CharmCount: order.charms?.length ?? 0,
      CharmTotal: order.charmTotal,
      Total: order.total,
      OrderStatus: order.status,
      PaymentStatus: order.payment?.status ?? "unpaid",
      PaidAmount: order.payment?.paidAmount ?? 0,
      CreatedAt: order.createdAt
        ? new Date(order.createdAt).toISOString()
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const filename = `kinef-orders-${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to export orders.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
