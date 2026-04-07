import { InferSchemaType, model, models, Schema } from "mongoose";

const caseProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    imageUrl: { type: String, default: null },
    colorHex: { type: String, default: "#f7f4f0" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type CaseProductDocument = InferSchemaType<typeof caseProductSchema>;

export const CaseProductModel =
  models.CaseProduct || model("CaseProduct", caseProductSchema);
