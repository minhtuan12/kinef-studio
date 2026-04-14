import {
  calculateDiscountedPrice,
  CatalogSource,
  type CaseProduct,
  type CharmProduct,
} from "@/lib/constants";
import { CaseProductModel } from "@/models/CaseProduct";
import { CharmModel } from "@/models/Charm";
import mongoose from "mongoose";
import { StaticImageData } from "next/image";

type IdLike = string | mongoose.Types.ObjectId;

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


function mapCaseDocument(doc: {
  _id: IdLike;
  id: string;
  name: string;
  description: string;
  price: number;
  discountPercent: number;
  imageUrl: string;
  colorHex: string;
  swatchClassName?: string;
  isActive: boolean;
  source: CatalogSource;
  width: number;
  height: number;
}): CaseProduct {
  return {
    _id: String(doc._id),
    id: doc.id,
    name: doc.name,
    description: doc.description,
    price: doc.price,
    discountPercent: doc.discountPercent,
    imageUrl: doc.imageUrl,
    colorHex: doc.colorHex,
    swatchClassName: doc.swatchClassName,
    isActive: doc.isActive,
    source: doc.source,
    width: doc.width,
    height: doc.height,
  };
}

export function getFinalCasePrice(item: CaseProduct): number {
  return calculateDiscountedPrice(item.price, item.discountPercent);
}

export function getFinalCharmPrice(item: CharmProduct): number {
  return calculateDiscountedPrice(item.price, item.discountPercent);
}

export async function listStoreCharms(): Promise<CharmProduct[]> {
  const docs = await CharmModel.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  if (docs.length === 0) {
    return [];
  }

  return docs.map((doc) => mapCharmDocument(doc));
}

export async function listStoreCases(): Promise<CaseProduct[]> {
  const docs = await CaseProductModel.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  if (docs.length === 0) {
    return [];
  }

  return docs.map((doc) => mapCaseDocument(doc));
}

export async function resolveCharmsByIds(charmIds: string[]): Promise<CharmProduct[]> {
  const dbIds = charmIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const dbDocs =
    dbIds.length > 0
      ? await CharmModel.find({ _id: { $in: dbIds }, isActive: true }).lean()
      : [];

  const dbMap = new Map(dbDocs.map((doc) => [String(doc._id), mapCharmDocument(doc)]));

  const resolved: CharmProduct[] = [];
  for (const id of charmIds) {
    const fromDb = dbMap.get(id);
    if (fromDb) {
      resolved.push(fromDb);
      continue;
    }
  }

  return resolved;
}
