export type CatalogSource = "default" | "db";

export type CaseProduct = {
  _id: string;
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
};

export type CharmProduct = {
  id: string;
  name: string;
  icon: string;
  price: number;
  discountPercent: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  source: CatalogSource;
};

export const MAX_CHARMS_PER_ORDER = 100;

export function normalizeDiscountPercent(discountPercent: number): number {
  if (Number.isNaN(discountPercent)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(discountPercent)));
}

export function calculateDiscountedPrice(price: number, discountPercent: number): number {
  const safePrice = Math.max(0, Math.round(price));
  const safeDiscount = normalizeDiscountPercent(discountPercent);
  return Math.round(safePrice * (100 - safeDiscount) / 100);
}

const currencyFormatter = new Intl.NumberFormat("vi-VN");
export function formatVnd(amount: number) {
  return `${currencyFormatter.format(amount)} đ`;
}
