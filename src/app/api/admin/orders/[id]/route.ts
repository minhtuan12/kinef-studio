import { ensureAdminAuthorized } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

const updateOrderSchema = z.object({
  status: z
    .enum(["pending", "confirmed", "in_progress", "completed", "cancelled"])
    .optional(),
  paymentStatus: z.enum(["unpaid", "partial", "paid"]).optional(),
  paidAmount: z.number().int().nonnegative().optional(),
});

function invalidIdResponse() {
  return NextResponse.json({ message: "Invalid order id." }, { status: 400 });
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
    const parsed = updateOrderSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid order update payload.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    if (parsed.data.status) {
      order.status = parsed.data.status;
      if (parsed.data.status === 'completed') {
        order.payment.paidAmount = order.total;
        order.payment.status = 'paid';
      }
    }

    await order.save();

    return NextResponse.json({
      message: "Order updated.",
      order: {
        id: String(order._id),
        orderCode: order.orderCode,
        status: order.status,
        payment: order.payment,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update order.";
    return NextResponse.json({ message }, { status: 500 });
  }
}