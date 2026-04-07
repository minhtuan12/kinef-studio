import { ensureAdminAuthorized } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const denied = ensureAdminAuthorized(request);
  if (denied) {
    return denied;
  }

  try {
    await connectToDatabase();
    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: String(order._id),
        orderCode: order.orderCode,
        customer: order.customer,
        caseItem: order.caseItem,
        charms: order.charms,
        total: order.total,
        charmTotal: order.charmTotal,
        caseTotal: order.caseTotal,
        status: order.status,
        payment: order.payment,
        createdAt: order.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ message: "Failed to load orders." }, { status: 500 });
  }
}