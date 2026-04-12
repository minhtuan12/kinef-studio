import { InferSchemaType, model, models, Schema } from "mongoose";

const caseSnapshotSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discountPercent: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
    imageUrl: { type: String, default: null },
  },
  { _id: false },
);

const charmSnapshotSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    icon: { type: String, default: "●" },
    price: { type: Number, required: true },
    discountPercent: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
    imageUrl: { type: String, default: null },
  },
  { _id: false },
);

const paymentOptionSchema = new Schema(
  {
    amount: { type: Number, required: true },
    sepayOrderId: { type: String, required: true },
    sepayOrderCode: { type: String, required: true },
    qrCode: { type: String, default: null },
    checkoutUrl: { type: String, default: null },
    status: { type: String, default: null },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    caseItem: {
      type: String,
      required: true,
    },
    charms: {
      type: [charmSnapshotSchema],
      default: [],
    },
    caseTotal: { type: Number, required: true },
    charmTotal: { type: Number, required: true },
    total: { type: Number, required: true },
    customer: {
      name: { type: String, required: true, trim: true },
      instagram: { type: String, required: true, trim: true },
      phoneNumber: { type: String, required: true, trim: true },
      phoneModel: { type: String, required: true, trim: true },
      address: { type: String, trim: true },
    },
    notes: { type: String, default: "", trim: true },
    payment: {
      status: {
        type: String,
        enum: ["unpaid", "partial", "paid"],
        default: "unpaid",
      },
      paidAmount: { type: Number, default: 0 },
      options: {
        deposit: { type: paymentOptionSchema, default: null },
        full: { type: paymentOptionSchema, default: null },
      },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    paymentCode: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

export type OrderDocument = InferSchemaType<typeof orderSchema>;

export const Order = models.Order || model("Order", orderSchema);
