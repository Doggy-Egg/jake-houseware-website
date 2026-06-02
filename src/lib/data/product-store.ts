import fs from "fs";
import path from "path";
import { products as seedProducts } from "@/lib/data/products";
import {
  generateProductId,
  normalizeItemNoKey,
  resolveProductSlug,
} from "@/lib/utils/slug";
import { normalizeProductStatus } from "@/lib/utils/product-visibility";
import type { ProductCategorySlug } from "@/lib/constants/categories";
import type { ProductSubCategorySlug } from "@/lib/constants/sub-categories";
import type { CollectionSlug } from "@/lib/constants/collections";
import { categoryExists, isSubCategoryValidForCategory } from "@/lib/data/taxonomy-queries";
import type { Product, ProductStatus } from "@/types/product";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

export class ProductStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductStoreError";
  }
}

export type ProductInput = {
  name: string;
  itemNo: string;
  description?: string;
  categorySlug: ProductCategorySlug;
  subCategorySlug?: ProductSubCategorySlug;
  collectionSlugs: CollectionSlug[];
  images: string[];
  thumbnail?: string;
  material?: string;
  dimensions?: string;
  moq?: number;
  packaging?: string;
  leadTime?: string;
  keywords?: string[];
  weight?: string;
  cartonSize?: string;
  qtyPerCarton?: number;
  cbm?: number;
  factory?: string;
  status?: ProductStatus;
};

function ensureProductsFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(seedProducts, null, 2));
  }
}

function normalizeProduct(product: Product): Product {
  const itemNo = product.itemNo.trim();

  return {
    ...product,
    itemNo,
    slug: resolveProductSlug({ itemNo, id: product.id }),
    status: normalizeProductStatus(product.status),
    collectionSlugs: product.collectionSlugs ?? [],
  };
}

export function readProducts(): Product[] {
  ensureProductsFile();
  const raw = fs.readFileSync(PRODUCTS_FILE, "utf-8");
  const parsed = JSON.parse(raw) as Product[];
  const products = Array.isArray(parsed) ? parsed : seedProducts;
  return products.map(normalizeProduct);
}

function writeProducts(products: Product[]) {
  ensureProductsFile();
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

function optionalString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function assertUniqueItemNo(
  products: Product[],
  itemNo: string,
  excludeId?: string,
) {
  const key = normalizeItemNoKey(itemNo);
  if (!key) {
    throw new ProductStoreError("Item No. is required.");
  }

  const conflict = products.find(
    (product) =>
      product.id !== excludeId && normalizeItemNoKey(product.itemNo) === key,
  );

  if (conflict) {
    throw new ProductStoreError(
      `Item No. "${itemNo.trim()}" is already used by another product.`,
    );
  }
}

function buildProduct(input: ProductInput, existing?: Product): Product {
  const now = new Date().toISOString();
  const itemNo = input.itemNo.trim();
  const images = input.images.filter(Boolean);
  const thumbnail = input.thumbnail?.trim() || images[0] || undefined;
  const subCategorySlug =
    input.subCategorySlug &&
    categoryExists(input.categorySlug) &&
    isSubCategoryValidForCategory(input.categorySlug, input.subCategorySlug)
      ? input.subCategorySlug
      : undefined;
  const id = existing?.id ?? generateProductId();

  return {
    id,
    slug: resolveProductSlug({ itemNo, id }),
    itemNo,
    name: input.name.trim(),
    description: optionalString(input.description),
    categorySlug: input.categorySlug,
    subCategorySlug,
    collectionSlugs: input.collectionSlugs,
    images,
    thumbnail,
    material: optionalString(input.material),
    dimensions: optionalString(input.dimensions),
    moq: input.moq,
    packaging: optionalString(input.packaging),
    leadTime: optionalString(input.leadTime),
    keywords: input.keywords?.filter(Boolean).length
      ? input.keywords.filter(Boolean)
      : undefined,
    weight: optionalString(input.weight),
    cartonSize: optionalString(input.cartonSize),
    qtyPerCarton: input.qtyPerCarton,
    cbm: input.cbm,
    factory: optionalString(input.factory),
    status: input.status ?? existing?.status ?? "draft",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function createProduct(input: ProductInput): Product {
  const products = readProducts();
  assertUniqueItemNo(products, input.itemNo);
  const product = buildProduct(input);
  writeProducts([product, ...products]);
  return product;
}

export function updateProduct(id: string, input: ProductInput): Product | null {
  const products = readProducts();
  const existing = products.find((product) => product.id === id);
  if (!existing) return null;

  assertUniqueItemNo(products, input.itemNo, id);
  const updated = buildProduct(input, existing);
  writeProducts(
    products.map((product) => (product.id === id ? updated : product)),
  );
  return updated;
}

export function deleteProduct(id: string): boolean {
  const products = readProducts();
  const next = products.filter((product) => product.id !== id);
  if (next.length === products.length) return false;
  writeProducts(next);
  return true;
}

export function resetProductsToSeed() {
  writeProducts(structuredClone(seedProducts));
}

export function isItemNoTaken(itemNo: string, excludeId?: string): boolean {
  const key = normalizeItemNoKey(itemNo);
  if (!key) return false;

  return readProducts().some(
    (product) =>
      product.id !== excludeId && normalizeItemNoKey(product.itemNo) === key,
  );
}
