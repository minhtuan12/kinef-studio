"use client";

import {
  calculateDiscountedPrice,
  MAX_CHARMS_PER_ORDER,
  type CaseProduct,
  type CharmProduct,
} from "@/lib/constants";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type OrderForm = {
  name: string;
  instagram: string;
  phoneNumber: string;
  phoneModel: string;
  address: string;
  notes: string;
};

export type CartItem = {
  id: string;
  caseItem: {
    id: string;
    name: string;
    imageUrl: string;
    unitPrice: number;
  };
  charms: Array<{
    id: string;
    name: string;
    icon: string;
    imageUrl: string | null;
    unitPrice: number;
  }>;
  customer: OrderForm;
  casePrice: number;
  charmTotal: number;
  totalPrice: number;
  addedAt: string;
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
  cartItems: CartItem[];
  setSelectedCase: (next: CaseProduct | null) => void;
  setSelectedCharms: (next: CharmProduct[]) => void;
  toggleCharm: (charm: CharmProduct) => void;
  removeCharm: (charmId: string) => void;
  setOrderFormField: (key: keyof OrderForm, value: string) => void;
  setReferenceFile: (file: File | null) => void;
  resetBuilder: () => void;
  addCurrentSelectionToCart: (formPatch?: Partial<OrderForm>) => boolean;
  removeCartItem: (itemId: string) => void;
  clearCart: () => void;
  hydrateBuilderFromCartItem: (itemId: string) => boolean;
  casePrice: number;
  charmTotal: number;
  totalPrice: number;
  maxCharmsPerOrder: number;
};

const initialOrderForm: OrderForm = {
  name: "",
  instagram: "",
  phoneNumber: "",
  phoneModel: "",
  address: "",
  notes: "",
};

const CART_STORAGE_KEY = "kinef-storefront-cart-v1";

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

function getRandomId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function StorefrontProvider({ children }: { children: React.ReactNode }) {
  const [cases, setCases] = useState<CaseProduct[]>([]);
  const [charms, setCharms] = useState<CharmProduct[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseProduct | null>(null);
  const [selectedCharms, setSelectedCharms] = useState<CharmProduct[]>([]);
  const [orderForm, setOrderForm] = useState<OrderForm>(initialOrderForm);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState<boolean>(true);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setIsCatalogLoading(true);
        const [caseResponse, charmResponse] = await Promise.all([
          fetch("/api/cases", { cache: "no-store" }),
          fetch("/api/charms", { cache: "no-store" }),
        ]);

        if (!charmResponse.ok) {
          throw new Error("Unable to load catalog.");
        }

        const caseData = (await caseResponse.json()) as { cases?: CaseProduct[] };
        const charmData = (await charmResponse.json()) as { charms?: CharmProduct[] };

        setCases(Array.isArray(caseData.cases) && caseData.cases.length > 0
          ? caseData.cases
          : [],);
        setCharms(
          Array.isArray(charmData.charms) && charmData.charms.length > 0
            ? charmData.charms
            : [],
        );
        setDataLoadError(null);
      } catch {
        setCases([]);
        setCharms([]);
        setDataLoadError(
          "Using local catalog data right now. Backend catalog APIs are unavailable.",
        );
      } finally {
        setIsCatalogLoading(false);
      }
    };

    void loadCatalog();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) {
        setCartItems(parsed);
      }
    } catch {
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

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
  const cartCount = cartItems.length;

  const addCurrentSelectionToCart = useCallback(
    (formPatch?: Partial<OrderForm>) => {
      if (!selectedCase) {
        return false;
      }

      const customer = { ...orderForm, ...formPatch };
      const nextItem: CartItem = {
        id: getRandomId(),
        caseItem: {
          id: selectedCase.id,
          name: selectedCase.name,
          imageUrl: selectedCase.imageUrl,
          unitPrice: calculateDiscountedPrice(
            selectedCase.price,
            selectedCase.discountPercent,
          ),
        },
        charms: selectedCharms.map((charm) => ({
          id: charm.id,
          name: charm.name,
          icon: charm.icon,
          imageUrl: charm.imageUrl,
          unitPrice: calculateDiscountedPrice(charm.price, charm.discountPercent),
        })),
        customer,
        casePrice,
        charmTotal,
        totalPrice,
        addedAt: new Date().toISOString(),
      };

      setOrderForm(customer);
      setCartItems((prev) => [nextItem, ...prev]);
      return true;
    },
    [selectedCase, selectedCharms, orderForm, casePrice, charmTotal, totalPrice],
  );

  const removeCartItem = useCallback((itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const hydrateBuilderFromCartItem = useCallback(
    (itemId: string) => {
      const item = cartItems.find((entry) => entry.id === itemId);
      if (!item) {
        return false;
      }

      const nextCase = cases.find((entry) => entry.id === item.caseItem.id);
      if (!nextCase) {
        return false;
      }

      const nextCharms = item.charms
        .map(
          (cartCharm) =>
            charms.find((entry) => entry.id === cartCharm.id) ?? {
              id: cartCharm.id,
              name: cartCharm.name,
              icon: cartCharm.icon,
              price: cartCharm.unitPrice,
              discountPercent: 0,
              stock: 1,
              imageUrl: cartCharm.imageUrl,
              isActive: true,
              source: "default" as const,
            },
        )
        .filter(Boolean);

      setSelectedCase(nextCase);
      setSelectedCharms(nextCharms);
      setOrderForm(item.customer);
      return true;
    },
    [cartItems, cases, charms],
  );

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
      cartItems,
      setSelectedCase,
      setSelectedCharms,
      toggleCharm,
      removeCharm,
      setOrderFormField,
      setReferenceFile,
      resetBuilder,
      addCurrentSelectionToCart,
      removeCartItem,
      clearCart,
      hydrateBuilderFromCartItem,
      casePrice,
      charmTotal,
      totalPrice,
      maxCharmsPerOrder: MAX_CHARMS_PER_ORDER,
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
      cartItems,
      addCurrentSelectionToCart,
      removeCartItem,
      clearCart,
      hydrateBuilderFromCartItem,
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
