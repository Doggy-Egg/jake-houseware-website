"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ProductInput } from "@/lib/data/product-store";
import type { Product } from "@/types/product";

type AdminProductsContextValue = {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  createProduct: (input: ProductInput) => Promise<Product>;
  updateProduct: (id: string, input: ProductInput) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
};

const AdminProductsContext = createContext<AdminProductsContextValue | null>(
  null,
);

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(data.message ?? "Request failed");
  }
  return data;
}

export function AdminProductsProvider({
  children,
  initialProducts = [],
}: {
  children: React.ReactNode;
  initialProducts?: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/products");
      const data = await parseResponse<{ products: Product[] }>(response);
      setProducts(data.products);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "加载产品失败",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProductById = useCallback(
    (id: string) => products.find((product) => product.id === id),
    [products],
  );

  const createProduct = useCallback(async (input: ProductInput) => {
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await parseResponse<{ product: Product }>(response);
    await refreshProducts();
    return data.product;
  }, [refreshProducts]);

  const updateProduct = useCallback(
    async (id: string, input: ProductInput) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      await parseResponse(response);
      await refreshProducts();
    },
    [refreshProducts],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      await parseResponse(response);
      await refreshProducts();
    },
    [refreshProducts],
  );

  const value = useMemo(
    () => ({
      products,
      isLoading,
      error,
      refreshProducts,
      getProductById,
      createProduct,
      updateProduct,
      deleteProduct,
    }),
    [
      products,
      isLoading,
      error,
      refreshProducts,
      getProductById,
      createProduct,
      updateProduct,
      deleteProduct,
    ],
  );

  return (
    <AdminProductsContext.Provider value={value}>
      {children}
    </AdminProductsContext.Provider>
  );
}

export function useAdminProducts() {
  const context = useContext(AdminProductsContext);
  if (!context) {
    throw new Error(
      "useAdminProducts must be used within AdminProductsProvider",
    );
  }
  return context;
}

// Backward-compatible alias for components using isHydrated
export function useAdminProductsHydrated() {
  const { isLoading } = useAdminProducts();
  return !isLoading;
}
