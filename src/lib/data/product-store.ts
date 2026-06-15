import "server-only";

import { products as seedProducts } from "@/lib/data/products";
import {
  mapProductRow,
  toProductRow,
  type ProductRow,
} from "@/lib/supabase/mappers";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { deleteProductImagesFromStorage } from "@/lib/supabase/product-images";
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
    name: optionalString(input.name) ?? "",
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
    .order("item_no", { ascending: true });

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

export async function bulkSetProductStatus(options: {
  status: ProductStatus;
  productIds?: string[];
  itemNos?: string[];
  categorySlug?: string;
}): Promise<{ updated: number; notFound: string[] }> {
  const supabase = createSupabaseAdmin();
  const now = new Date().toISOString();
  const allProducts = await readProducts();
  let targets: Product[] = [];
  let notFound: string[] = [];

  if (options.productIds?.length) {
    const idSet = new Set(options.productIds);
    targets = allProducts.filter((product) => idSet.has(product.id));
  } else if (options.categorySlug) {
    targets = allProducts.filter(
      (product) => product.categorySlug === options.categorySlug,
    );
  } else {
    const itemNos = options.itemNos ?? [];
    const keyToProduct = new Map(
      allProducts.map((product) => [
        normalizeItemNoKey(product.itemNo),
        product,
      ]),
    );

    const targetIds = new Set<string>();
    for (const itemNo of itemNos) {
      const product = keyToProduct.get(normalizeItemNoKey(itemNo));
      if (product) {
        targetIds.add(product.id);
      } else {
        notFound.push(itemNo);
      }
    }

    targets = allProducts.filter((product) => targetIds.has(product.id));
  }

  if (targets.length === 0) {
    return { updated: 0, notFound };
  }

  const ids = targets.map((product) => product.id);
  const { error } = await supabase
    .from("products")
    .update({ status: options.status, updated_at: now })
    .in("id", ids);

  if (error) {
    throw new ProductStoreError(error.message);
  }

  return { updated: targets.length, notFound };
}

function collectProductImageUrls(product: Product): string[] {
  const urls = new Set<string>();
  for (const url of product.images) {
    urls.add(url);
  }
  if (product.thumbnail) {
    urls.add(product.thumbnail);
  }
  return [...urls];
}

export async function bulkDeleteProducts(
  productIds: string[],
): Promise<{ deleted: number }> {
  if (productIds.length === 0) {
    return { deleted: 0 };
  }

  const supabase = createSupabaseAdmin();
  const allProducts = await readProducts();
  const idSet = new Set(productIds);
  const targets = allProducts.filter((product) => idSet.has(product.id));

  if (targets.length === 0) {
    return { deleted: 0 };
  }

  const urls = new Set<string>();
  for (const product of targets) {
    for (const url of collectProductImageUrls(product)) {
      urls.add(url);
    }
  }

  await deleteProductImagesFromStorage([...urls]);

  const ids = targets.map((product) => product.id);
  const { error } = await supabase.from("products").delete().in("id", ids);

  if (error) {
    throw new ProductStoreError(error.message);
  }

  return { deleted: targets.length };
}

export async function deleteProduct(id: string): Promise<boolean> {
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
    return false;
  }

  const product = normalizeProduct(mapProductRow(existingRow as ProductRow));
  await deleteProductImagesFromStorage(collectProductImageUrls(product));

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

export async function findProductByItemNo(
  itemNo: string,
): Promise<Product | undefined> {
  const key = normalizeItemNoKey(itemNo);
  if (!key) return undefined;

  const products = await readProducts();
  return products.find(
    (product) => normalizeItemNoKey(product.itemNo) === key,
  );
}

export async function upsertProductImageByItemNo(options: {
  itemNo: string;
  categorySlug: ProductCategorySlug;
  subCategorySlug?: ProductSubCategorySlug;
  imageUrl: string;
  status?: ProductStatus;
  updateExisting: boolean;
}): Promise<
  | { action: "created"; product: Product }
  | { action: "updated"; product: Product }
  | { action: "skipped"; reason: string; itemNo: string }
> {
  const itemNo = options.itemNo.trim();
  if (!itemNo) {
    return { action: "skipped", reason: "无法从文件名解析 Item No.", itemNo: "" };
  }

  const existing = await findProductByItemNo(itemNo);

  if (existing) {
    if (!options.updateExisting) {
      return {
        action: "skipped",
        reason: "Item No. 已存在（未勾选更新）",
        itemNo,
      };
    }

    const images = [
      options.imageUrl,
      ...existing.images.filter((url) => url !== options.imageUrl),
    ];

    const updated = await updateProduct(existing.id, {
      name: existing.name,
      itemNo: existing.itemNo,
      description: existing.description,
      categorySlug: options.categorySlug,
      subCategorySlug: options.subCategorySlug ?? existing.subCategorySlug,
      collectionSlugs: existing.collectionSlugs,
      images,
      thumbnail: options.imageUrl,
      material: existing.material,
      dimensions: existing.dimensions,
      moq: existing.moq,
      packaging: existing.packaging,
      leadTime: existing.leadTime,
      keywords: existing.keywords,
      weight: existing.weight,
      cartonSize: existing.cartonSize,
      qtyPerCarton: existing.qtyPerCarton,
      cbm: existing.cbm,
      factory: existing.factory,
      status: options.status ?? existing.status,
    });

    if (!updated) {
      throw new ProductStoreError("Failed to update existing product.");
    }

    return { action: "updated", product: updated };
  }

  const product = await createProduct({
    name: "",
    itemNo,
    categorySlug: options.categorySlug,
    subCategorySlug: options.subCategorySlug,
    collectionSlugs: [],
    images: [options.imageUrl],
    thumbnail: options.imageUrl,
    status: options.status ?? "draft",
  });

  return { action: "created", product };
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
