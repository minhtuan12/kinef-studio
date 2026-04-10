import { z } from "zod";

const nonNegativeInt = z.number().int().nonnegative();

export const createOrderSchema = z.object({
  caseId: z.string().min(1),
  charmIds: z
    .array(z.string().min(1))
    .min(1)
    .max(6)
    .refine((value) => new Set(value).size === value.length, {
      message: "Duplicate charm ids are not allowed.",
    }),
  customer: z.object({
    name: z.string().min(1).max(80),
    instagram: z.string().min(1).max(80),
    phoneNumber: z.string().min(1).max(30),
    phoneModel: z.string().min(1).max(120),
    address: z.string().max(500).optional().default(""),
  }),
  notes: z.string().max(500).optional().default(""),
});

export const adminCaseSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(250).optional().default(""),
  price: nonNegativeInt,
  discountPercent: z.number().int().min(0).max(100).optional().default(0),
  imageUrl: z.string().url().optional().nullable(),
  colorHex: z.string().optional().default(""),
  isActive: z.boolean().optional().default(true),
});

export const adminCharmSchema = z.object({
  name: z.string().min(1).max(120),
  icon: z.string().max(12).optional().default("●"),
  price: nonNegativeInt,
  discountPercent: z.number().int().min(0).max(100).optional().default(0),
  stock: nonNegativeInt,
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type AdminCaseInput = z.infer<typeof adminCaseSchema>;
export type AdminCharmInput = z.infer<typeof adminCharmSchema>;
