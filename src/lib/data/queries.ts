import type { Product } from "@/types/product";
import { PRODUCTS_PAGE_SIZE } from "@/lib/constants/products";
import { readProducts } from "@/lib/data/product-store";
import { isProductPubliclyVisible } from "@/lib/utils/product-visibility";
import type { ProductCategorySlug } from "@/lib/constants/categories";
import type { ProductSubCategorySlug } from "@/lib/constants/sub-categories";
import type { CollectionSlug } from "@/lib/constants/collections";

function sortProducts(products: Product[]): Product[] {
  return [...products].sort((a, b) =>
    a.itemNo.localeCompare(b.itemNo, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

async function getPublicProducts(): Promise<Product[]> {
  return sortProducts(
    (await readProducts()).filter(isProductPubliclyVisible),
  );
}

/** All products including draft/inactive — for Admin. */
export async function getAllProducts(): Promise<Product[]> {
  return sortProducts(await readProducts());
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  return (await getPublicProducts()).find((product) => product.slug === slug);
}

export async function getProductsByCategory(
  categorySlug: ProductCategorySlug,
): Promise<Product[]> {
  return (await getPublicProducts()).filter(
    (product) => product.categorySlug === categorySlug,
  );
}

export async function getProductsByCollection(
  collectionSlug: CollectionSlug,
): Promise<Product[]> {
  return (await getPublicProducts()).filter((product) =>
    product.collectionSlugs.includes(collectionSlug),
  );
}

export async function searchProducts(query: string): Promise<Product[]> {
  const products = await getPublicProducts();
  const normalized = query.trim().toLowerCase();
  if (!normalized) return products;

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(normalized) ||
      product.itemNo.toLowerCase().includes(normalized) ||
      product.description?.toLowerCase().includes(normalized) ||
      product.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(normalized),
      ),
  );
}

export async function filterProducts(options: {
  category?: ProductCategorySlug | null;
  subCategory?: ProductSubCategorySlug | null;
  collection?: CollectionSlug | null;
  query?: string | null;
}): Promise<Product[]> {
  let result = await getPublicProducts();

  if (options.category) {
    result = result.filter(
      (product) => product.categorySlug === options.category,
    );
  }

  if (options.subCategory) {
    result = result.filter(
      (product) => product.subCategorySlug === options.subCategory,
    );
  }

  if (options.collection) {
    result = result.filter((product) =>
      product.collectionSlugs.includes(options.collection!),
    );
  }

  if (options.query?.trim()) {
    const normalized = options.query.trim().toLowerCase();
    result = result.filter(
      (product) =>
        product.name.toLowerCase().includes(normalized) ||
        product.itemNo.toLowerCase().includes(normalized) ||
        product.description?.toLowerCase().includes(normalized) ||
        product.keywords?.some((keyword) =>
          keyword.toLowerCase().includes(normalized),
        ),
    );
  }

  return result;
}

export async function filterProductsPaginated(options: {
  category?: ProductCategorySlug | null;
  subCategory?: ProductSubCategorySlug | null;
  collection?: CollectionSlug | null;
  query?: string | null;
  page?: number;
  pageSize?: number;
}): Promise<{
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const pageSize = options.pageSize ?? PRODUCTS_PAGE_SIZE;
  const all = await filterProducts(options);
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const requestedPage = Math.max(1, options.page ?? 1);
  const page = Math.min(requestedPage, totalPages);
  const start = (page - 1) * pageSize;

  return {
    products: all.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getAllProductSlugs(): Promise<string[]> {
  return (await getPublicProducts())
    .map((product) => product.slug)
    .filter(Boolean);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return (await readProducts()).find((product) => product.id === id);
}
