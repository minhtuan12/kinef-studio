import blackCase from '@/assets/images/black-case.png';
import whiteCase from '@/assets/images/white-case.png';
import clearCase from '@/assets/images/clear-case.png';
import { StaticImageData } from 'next/image';

export type CatalogSource = "default" | "db";

export type CaseProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPercent: number;
  imageUrl: StaticImageData;
  colorHex: string;
  swatchClassName?: string;
  isActive: boolean;
  source: CatalogSource;
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

export const MAX_CHARMS_PER_ORDER = 6;

export const DEFAULT_CASES: CaseProduct[] = [
  {
    id: "case-white",
    name: "White",
    description: "Cream opaque, soft finish",
    price: 120000,
    discountPercent: 0,
    imageUrl: whiteCase,
    colorHex: "#f7f4f0",
    swatchClassName: "sw-white",
    isActive: true,
    source: "default",
  },
  {
    id: "case-black",
    name: "Black",
    description: "Deep matte, dramatic",
    price: 120000,
    discountPercent: 0,
    imageUrl: blackCase,
    colorHex: "#161412",
    swatchClassName: "sw-black",
    isActive: true,
    source: "default",
  },
  {
    id: "case-clear",
    name: "Clear",
    description: "Original case shows through",
    price: 120000,
    discountPercent: 0,
    imageUrl: clearCase,
    colorHex: "transparent",
    swatchClassName: "sw-clear",
    isActive: true,
    source: "default",
  },
];

export const DEFAULT_CHARMS: CharmProduct[] = [
  {
    id: "charm-1",
    name: "Butterfly",
    icon: "🦋",
    price: 35000,
    discountPercent: 0,
    stock: 2,
    imageUrl: null,
    isActive: true,
    source: "default",
  },
  {
    id: "charm-2",
    name: "Star Cluster",
    icon: "✦",
    price: 28000,
    discountPercent: 0,
    stock: 0,
    imageUrl: null,
    isActive: true,
    source: "default",
  },
  {
    id: "charm-3",
    name: "Moon Pearl",
    icon: "🌙",
    price: 32000,
    discountPercent: 0,
    stock: 1,
    imageUrl: null,
    isActive: true,
    source: "default",
  },
  {
    id: "charm-4",
    name: "Mushroom",
    icon: "🍄",
    price: 30000,
    discountPercent: 0,
    stock: 2,
    imageUrl: null,
    isActive: true,
    source: "default",
  },
  {
    id: "charm-5",
    name: "Silk Bow",
    icon: "🎀",
    price: 25000,
    discountPercent: 0,
    stock: 1,
    imageUrl: null,
    isActive: true,
    source: "default",
  },
  {
    id: "charm-6",
    name: "Evil Eye",
    icon: "◉",
    price: 38000,
    discountPercent: 0,
    stock: 0,
    imageUrl: null,
    isActive: true,
    source: "default",
  },
  {
    id: "charm-7",
    name: "White Pearl",
    icon: "●",
    price: 22000,
    discountPercent: 0,
    stock: 2,
    imageUrl: null,
    isActive: true,
    source: "default",
  },
  {
    id: "charm-8",
    name: "Mini Bear",
    icon: "🐻",
    price: 35000,
    discountPercent: 0,
    stock: 1,
    imageUrl: null,
    isActive: true,
    source: "default",
  },
  {
    id: "charm-9",
    name: "Crystal Heart",
    icon: "♡",
    price: 40000,
    discountPercent: 0,
    stock: 2,
    imageUrl: null,
    isActive: true,
    source: "default",
  },
  {
    id: "charm-10",
    name: "Gold Snake",
    icon: "⊛",
    price: 45000,
    discountPercent: 0,
    stock: 0,
    imageUrl: null,
    isActive: true,
    source: "default",
  },
  {
    id: "charm-11",
    name: "Cherry",
    icon: "🍒",
    price: 28000,
    discountPercent: 0,
    stock: 2,
    imageUrl: null,
    isActive: true,
    source: "default",
  },
  {
    id: "charm-12",
    name: "Lucky Clover",
    icon: "☘",
    price: 25000,
    discountPercent: 0,
    stock: 1,
    imageUrl: null,
    isActive: true,
    source: "default",
  },
];

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

export const CASE_PRICE = 120000;

const currencyFormatter = new Intl.NumberFormat("vi-VN");
export function formatVnd(amount: number) {
  return `${currencyFormatter.format(amount)} đ`;
}
