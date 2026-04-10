"use client";

import {
  calculateDiscountedPrice,
  DEFAULT_CASES,
  DEFAULT_CHARMS,
  MAX_CHARMS_PER_ORDER,
  type CaseProduct,
  type CharmProduct,
} from "@/lib/constants";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type OrderForm = {
  name: string;
  instagram: string;
  phoneNumber: string;
  phoneModel: string;
  address: string;
  notes: string;
};

type StorefrontContextValue = {
  cases: CaseProduct[];
  charms: CharmProduct[];
  dataLoadError: string | null;
  selectedCase: CaseProduct | null;
  selectedCharms: CharmProduct[];
  orderForm: OrderForm;
  referenceFile: File | null;
  isCatalogLoading: boolean;
  cartCount: number;
  setSelectedCase: (next: CaseProduct | null) => void;
  toggleCharm: (charm: CharmProduct) => void;
  removeCharm: (charmId: string) => void;
  setOrderFormField: (key: keyof OrderForm, value: string) => void;
  setReferenceFile: (file: File | null) => void;
  resetBuilder: () => void;
  casePrice: number;
  charmTotal: number;
  totalPrice: number;
  maxCharmsPerOrder: number;
  incrementCartCount: () => void;
};

const initialOrderForm: OrderForm = {
  name: "",
  instagram: "",
  phoneNumber: "",
  phoneModel: "",
  address: "",
  notes: "",
};

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

export function StorefrontProvider({ children }: { children: React.ReactNode }) {
  const [cases, setCases] = useState<CaseProduct[]>(DEFAULT_CASES);
  const [charms, setCharms] = useState<CharmProduct[]>(DEFAULT_CHARMS);
  const [selectedCase, setSelectedCase] = useState<CaseProduct | null>(null);
  const [selectedCharms, setSelectedCharms] = useState<CharmProduct[]>([]);
  const [orderForm, setOrderForm] = useState<OrderForm>(initialOrderForm);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState<boolean>(true);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setIsCatalogLoading(true);
        const [charmResponse] = await Promise.all([
          // fetch("/api/cases", { cache: "no-store" }),
          fetch("/api/charms", { cache: "no-store" }),
        ]);

        if (!charmResponse.ok) {
          throw new Error("Unable to load catalog.");
        }

        // const caseData = (await caseResponse.json()) as { cases?: CaseProduct[] };
        const charmData = (await charmResponse.json()) as { charms?: CharmProduct[] };

        setCases(DEFAULT_CASES);
        setCharms(
          Array.isArray(charmData.charms) && charmData.charms.length > 0
            ? charmData.charms
            : DEFAULT_CHARMS,
        );
        setDataLoadError(null);
      } catch {
        setCases(DEFAULT_CASES);
        setCharms(DEFAULT_CHARMS);
        setDataLoadError(
          "Using local catalog data right now. Backend catalog APIs are unavailable.",
        );
      } finally {
        setIsCatalogLoading(false);
      }
    };

    void loadCatalog();
  }, []);

  const toggleCharm = (charm: CharmProduct) => {
    if (charm.stock === 0 || !charm.isActive) {
      return;
    }

    setSelectedCharms((prev) => {
      const exists = prev.find((selected) => selected.id === charm.id);
      if (exists) {
        return prev.filter((selected) => selected.id !== charm.id);
      }
      return [...prev, charm];
    });
  };

  const removeCharm = (charmId: string) => {
    setSelectedCharms((prev) => prev.filter((charm) => charm.id !== charmId));
  };

  const setOrderFormField = (key: keyof OrderForm, value: string) => {
    setOrderForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetBuilder = () => {
    setSelectedCase(null);
    setSelectedCharms([]);
    setOrderForm(initialOrderForm);
    setReferenceFile(null);
  };

  const casePrice = useMemo(() => {
    if (!selectedCase) {
      return 0;
    }
    return calculateDiscountedPrice(selectedCase.price, selectedCase.discountPercent);
  }, [selectedCase]);

  const charmTotal = useMemo(
    () =>
      selectedCharms.reduce(
        (sum, charm) => sum + calculateDiscountedPrice(charm.price, charm.discountPercent),
        0,
      ),
    [selectedCharms],
  );

  const totalPrice = casePrice + charmTotal;

  const value = useMemo<StorefrontContextValue>(
    () => ({
      cases,
      charms,
      dataLoadError,
      selectedCase,
      selectedCharms,
      orderForm,
      referenceFile,
      isCatalogLoading,
      cartCount,
      setSelectedCase,
      toggleCharm,
      removeCharm,
      setOrderFormField,
      setReferenceFile,
      resetBuilder,
      casePrice,
      charmTotal,
      totalPrice,
      maxCharmsPerOrder: MAX_CHARMS_PER_ORDER,
      incrementCartCount: () => setCartCount((prev) => prev + 1),
    }),
    [
      cases,
      charms,
      dataLoadError,
      selectedCase,
      selectedCharms,
      orderForm,
      referenceFile,
      isCatalogLoading,
      cartCount,
      casePrice,
      charmTotal,
      totalPrice,
    ],
  );

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefront() {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error("useStorefront must be used within StorefrontProvider.");
  }
  return context;
}

