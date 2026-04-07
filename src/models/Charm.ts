import { InferSchemaType, model, models, Schema } from "mongoose";

const charmSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "●" },
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    stock: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type CharmDocument = InferSchemaType<typeof charmSchema>;

export const CharmModel = models.Charm || model("Charm", charmSchema);
