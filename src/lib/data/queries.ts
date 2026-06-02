import type { ProductCategorySlug } from "@/lib/constants/categories";
import type { ProductSubCategorySlug } from "@/lib/constants/sub-categories";
import type { CollectionSlug } from "@/lib/constants/collections";
import { readProducts } from "@/lib/data/product-store";
import { isProductPubliclyVisible } from "@/lib/utils/product-visibility";
import type { Product } from "@/types/product";

function sortProducts(products: Product[]): Product[] {
  return [...products].sort((a, b) => a.name.localeCompare(b.name));
}

function getPublicProducts(): Product[] {
  return sortProducts(readProducts().filter(isProductPubliclyVisible));
}

/** All products including draft/inactive — for Admin. */
export function getAllProducts(): Product[] {
  return sortProducts(readProducts());
}

export function getProductBySlug(slug: string): Product | undefined {
  return getPublicProducts().find((product) => product.slug === slug);
}

export function getProductsByCategory(
  categorySlug: ProductCategorySlug,
): Product[] {
  return getPublicProducts().filter(
    (product) => product.categorySlug === categorySlug,
  );
}

export function getProductsByCollection(
  collectionSlug: CollectionSlug,
): Product[] {
  return getPublicProducts().filter((product) =>
    product.collectionSlugs.includes(collectionSlug),
  );
}

export function searchProducts(query: string): Product[] {
  const products = getPublicProducts();
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

export function filterProducts(options: {
  category?: ProductCategorySlug | null;
  subCategory?: ProductSubCategorySlug | null;
  collection?: CollectionSlug | null;
  query?: string | null;
}): Product[] {
  let result = getPublicProducts();

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

export function getAllProductSlugs(): string[] {
  return getPublicProducts()
    .map((product) => product.slug)
    .filter(Boolean);
}

export function getProductById(id: string): Product | undefined {
  return readProducts().find((product) => product.id === id);
}
