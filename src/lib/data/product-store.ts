import "server-only";

import { products as seedProducts } from "@/lib/data/products";
import {
  mapProductRow,
  toProductRow,
  type ProductRow,
} from "@/lib/supabase/mappers";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import {
  generateProductId,
  normalizeItemNoKey,
  resolveProductSlug,
} from "@/lib/utils/slug";
import { normalizeProductStatus } from "@/lib/utils/product-visibility";
import type { ProductCategorySlug } from "@/lib/constants/categories";
import type { ProductSubCategorySlug } from "@/lib/constants/sub-categories";
import type { CollectionSlug } from "@/lib/constants/collections";
import type { Product, ProductStatus } from "@/types/product";

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

function optionalString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

async function categoryExists(slug: string): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  return !error && !!data;
}

async function isSubCategoryValidForCategory(
  categorySlug: string,
  subCategorySlug: string,
): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("sub_categories")
    .select("slug")
    .eq("slug", subCategorySlug)
    .eq("category_slug", categorySlug)
    .maybeSingle();

  return !error && !!data;
}

async function assertUniqueItemNo(itemNo: string, excludeId?: string) {
  const key = normalizeItemNoKey(itemNo);
  if (!key) {
    throw new ProductStoreError("Item No. is required.");
  }

  const taken = await isItemNoTaken(itemNo, excludeId);
  if (taken) {
    throw new ProductStoreError(
      `Item No. "${itemNo.trim()}" is already used by another product.`,
    );
  }
}

async function buildProduct(
  input: ProductInput,
  existing?: Product,
): Promise<Product> {
  const now = new Date().toISOString();
  const itemNo = input.itemNo.trim();
  const images = input.images.filter(Boolean);
  const thumbnail = input.thumbnail?.trim() || images[0] || undefined;
  const subCategorySlug =
    input.subCategorySlug &&
    (await categoryExists(input.categorySlug)) &&
    (await isSubCategoryValidForCategory(
      input.categorySlug,
      input.subCategorySlug,
    ))
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

export async function readProducts(): Promise<Product[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new ProductStoreError(error.message);
  }

  return ((data ?? []) as ProductRow[]).map(mapProductRow).map(normalizeProduct);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  await assertUniqueItemNo(input.itemNo);
  const product = normalizeProduct(await buildProduct(input));
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("products").insert(toProductRow(product));

  if (error) {
    throw new ProductStoreError(error.message);
  }

  return product;
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Product | null> {
  const supabase = createSupabaseAdmin();
  const { data: existingRow, error: readError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    throw new ProductStoreError(readError.message);
  }

  if (!existingRow) {
    return null;
  }

  const existing = normalizeProduct(mapProductRow(existingRow as ProductRow));
  await assertUniqueItemNo(input.itemNo, id);
  const updated = normalizeProduct(await buildProduct(input, existing));
  const { error } = await supabase
    .from("products")
    .update(toProductRow(updated))
    .eq("id", id);

  if (error) {
    throw new ProductStoreError(error.message);
  }

  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    throw new ProductStoreError(error.message);
  }

  return (data?.length ?? 0) > 0;
}

export async function resetProductsToSeed() {
  const supabase = createSupabaseAdmin();
  const rows = structuredClone(seedProducts).map((product) =>
    toProductRow(normalizeProduct(product)),
  );
  const { error } = await supabase.from("products").upsert(rows, { onConflict: "id" });

  if (error) {
    throw new ProductStoreError(error.message);
  }
}

export async function isItemNoTaken(
  itemNo: string,
  excludeId?: string,
): Promise<boolean> {
  const key = normalizeItemNoKey(itemNo);
  if (!key) return false;

  const products = await readProducts();
  return products.some(
    (product) =>
      product.id !== excludeId && normalizeItemNoKey(product.itemNo) === key,
  );
}

export async function migrateProductsCategorySlug(
  oldSlug: string,
  newSlug: string,
) {
  const supabase = createSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("products")
    .update({ category_slug: newSlug, updated_at: now })
    .eq("category_slug", oldSlug);

  if (error) {
    throw new Error(error.message);
  }
}

export async function migrateProductsSubCategorySlug(
  oldSlug: string,
  newSlug: string,
) {
  const supabase = createSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("products")
    .update({ sub_category_slug: newSlug, updated_at: now })
    .eq("sub_category_slug", oldSlug);

  if (error) {
    throw new Error(error.message);
  }
}

export async function migrateProductsToCategory(
  subCategorySlug: string,
  categorySlug: string,
) {
  const supabase = createSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("products")
    .update({ category_slug: categorySlug, updated_at: now })
    .eq("sub_category_slug", subCategorySlug);

  if (error) {
    throw new Error(error.message);
  }
}
