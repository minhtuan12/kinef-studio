import {
  calculateDiscountedPrice,
  DEFAULT_CASES,
  DEFAULT_CHARMS,
  type CaseProduct,
  type CharmProduct,
} from "@/lib/constants";
import { CaseProductModel } from "@/models/CaseProduct";
import { CharmModel } from "@/models/Charm";
import mongoose from "mongoose";

type IdLike = string | mongoose.Types.ObjectId;

// function mapCaseDocument(doc: {
//   _id: IdLike;
//   name: string;
//   description: string;
//   price: number;
//   discountPercent: number;
//   imageUrl?: string | null;
//   colorHex?: string;
//   isActive: boolean;
// }): CaseProduct {
//   return {
//     id: String(doc._id),
//     name: doc.name,
//     description: doc.description,
//     price: doc.price,
//     discountPercent: doc.discountPercent,
//     imageUrl: doc.imageUrl ?? null,
//     colorHex: doc.colorHex ?? "#f7f4f0",
//     isActive: doc.isActive,
//     source: "db",
//   };
// }

function mapCharmDocument(doc: {
  _id: IdLike;
  name: string;
  icon?: string;
  price: number;
  discountPercent: number;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
}): CharmProduct {
  return {
    id: String(doc._id),
    name: doc.name,
    icon: doc.icon ?? "●",
    price: doc.price,
    discountPercent: doc.discountPercent,
    stock: doc.stock,
    imageUrl: doc.imageUrl ?? null,
    isActive: doc.isActive,
    source: "db",
  };
}

export function getFinalCasePrice(item: CaseProduct): number {
  return calculateDiscountedPrice(item.price, item.discountPercent);
}

export function getFinalCharmPrice(item: CharmProduct): number {
  return calculateDiscountedPrice(item.price, item.discountPercent);
}

// export async function listStoreCases(): Promise<CaseProduct[]> {
//   const docs = await CaseProductModel.find({ isActive: true }).sort({ createdAt: -1 }).lean();
//   if (docs.length === 0) {
//     return DEFAULT_CASES;
//   }

//   return docs.map((doc) => mapCaseDocument(doc));
// }

export async function listStoreCharms(): Promise<CharmProduct[]> {
  const docs = await CharmModel.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  if (docs.length === 0) {
    return DEFAULT_CHARMS;
  }

  return docs.map((doc) => mapCharmDocument(doc));
}

// export async function resolveCaseById(caseId: string): Promise<CaseProduct | null> {
//   if (mongoose.Types.ObjectId.isValid(caseId)) {
//     const doc = await CaseProductModel.findOne({ _id: caseId, isActive: true }).lean();
//     if (doc) {
//       return mapCaseDocument(doc);
//     }
//   }

//   return DEFAULT_CASES.find((item) => item.id === caseId) ?? null;
// }

export async function resolveCharmsByIds(charmIds: string[]): Promise<CharmProduct[]> {
  const dbIds = charmIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const dbDocs =
    dbIds.length > 0
      ? await CharmModel.find({ _id: { $in: dbIds }, isActive: true }).lean()
      : [];

  const dbMap = new Map(dbDocs.map((doc) => [String(doc._id), mapCharmDocument(doc)]));
  const defaultMap = new Map(DEFAULT_CHARMS.map((item) => [item.id, item]));

  const resolved: CharmProduct[] = [];
  for (const id of charmIds) {
    const fromDb = dbMap.get(id);
    if (fromDb) {
      resolved.push(fromDb);
      continue;
    }

    const fallback = defaultMap.get(id);
    if (fallback) {
      resolved.push(fallback);
    }
  }

  return resolved;
}
