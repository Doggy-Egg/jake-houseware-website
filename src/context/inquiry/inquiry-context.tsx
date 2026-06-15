"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { InquiryItem } from "@/types/inquiry";
import type { Product } from "@/types/product";
import { getProductPrimaryImage } from "@/lib/utils/product-image";

const STORAGE_KEY = "jake-houseware-inquiry";

type InquiryContextValue = {
  items: InquiryItem[];
  itemCount: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearItems: () => void;
  isInList: (productId: string) => boolean;
  isHydrated: boolean;
};

const InquiryContext = createContext<InquiryContextValue | null>(null);

const listeners = new Set<() => void>();
let items: InquiryItem[] = [];
let clientLoaded = false;

const noopSubscribe = () => () => {};

function readStoredItems(): InquiryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InquiryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ensureClientLoaded() {
  if (typeof window === "undefined" || clientLoaded) return;
  clientLoaded = true;
  items = readStoredItems();
}

function persistItems(nextItems: InquiryItem[]) {
  items = nextItems;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  ensureClientLoaded();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return items;
}

function getServerSnapshot() {
  return [] as InquiryItem[];
}

function useClientHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function InquiryProvider({ children }: { children: React.ReactNode }) {
  const storedItems = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const isHydrated = useClientHydrated();

  const addItem = useCallback((product: Product, quantity = 1) => {
    ensureClientLoaded();
    const current = getSnapshot();
    const existing = current.find((item) => item.productId === product.id);
    const productImage = getProductPrimaryImage(product);

    if (existing) {
      persistItems(
        current.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                productImage: item.productImage ?? productImage,
              }
            : item,
        ),
      );
      return;
    }

    persistItems([
      ...current,
      {
        productId: product.id,
        productSlug: product.slug,
        productName: product.itemNo,
        productItemNo: product.itemNo,
        productImage,
        quantity: Math.max(1, quantity),
        addedAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const removeItem = useCallback((productId: string) => {
    ensureClientLoaded();
    persistItems(getSnapshot().filter((item) => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    ensureClientLoaded();
    persistItems(
      getSnapshot().map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );
  }, []);

  const clearItems = useCallback(() => {
    ensureClientLoaded();
    persistItems([]);
  }, []);

  const isInList = useCallback(
    (productId: string) =>
      storedItems.some((item) => item.productId === productId),
    [storedItems],
  );

  const value = useMemo(
    () => ({
      items: storedItems,
      itemCount: storedItems.reduce((sum, item) => sum + item.quantity, 0),
      addItem,
      removeItem,
      updateQuantity,
      clearItems,
      isInList,
      isHydrated,
    }),
    [
      storedItems,
      addItem,
      removeItem,
      updateQuantity,
      clearItems,
      isInList,
      isHydrated,
    ],
  );

  return (
    <InquiryContext.Provider value={value}>{children}</InquiryContext.Provider>
  );
}

export function useInquiry() {
  const context = useContext(InquiryContext);
  if (!context) {
    throw new Error("useInquiry must be used within InquiryProvider");
  }
  return context;
}
