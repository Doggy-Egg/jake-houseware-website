import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import type { Product } from "../src/types/product";
import type { Taxonomy } from "../src/types/taxonomy";

const COLLECTIONS = [
  { slug: "premium-collection", name: "Premium Collection", sort_order: 0 },
  { slug: "best-sellers", name: "Best Sellers", sort_order: 1 },
  { slug: "new-arrivals", name: "New Arrivals", sort_order: 2 },
] as const;

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readJsonFile<T>(relativePath: string): T {
  const filePath = resolve(process.cwd(), relativePath);
  return JSON.parse(readFileSync(filePath, "utf-8")) as T;
}

function toCategoryRow(category: Taxonomy["categories"][number]) {
  return {
    slug: category.slug,
    name: category.name,
    sort_order: category.sortOrder,
    created_at: category.createdAt,
    updated_at: category.updatedAt,
  };
}

function toSubCategoryRow(subCategory: Taxonomy["subCategories"][number]) {
  return {
    slug: subCategory.slug,
    name: subCategory.name,
    category_slug: subCategory.categorySlug,
    sort_order: subCategory.sortOrder,
    created_at: subCategory.createdAt,
    updated_at: subCategory.updatedAt,
  };
}

function toProductRow(product: Product) {
  return {
    id: product.id,
    slug: product.slug,
    item_no: product.itemNo,
    name: product.name,
    description: product.description ?? null,
    category_slug: product.categorySlug,
    sub_category_slug: product.subCategorySlug ?? null,
    collection_slugs: product.collectionSlugs ?? [],
    images: product.images ?? [],
    thumbnail: product.thumbnail ?? null,
    material: product.material ?? null,
    dimensions: product.dimensions ?? null,
    moq: product.moq ?? null,
    packaging: product.packaging ?? null,
    lead_time: product.leadTime ?? null,
    keywords: product.keywords ?? null,
    weight: product.weight ?? null,
    carton_size: product.cartonSize ?? null,
    qty_per_carton: product.qtyPerCarton ?? null,
    cbm: product.cbm ?? null,
    factory: product.factory ?? null,
    status: product.status,
    created_at: product.createdAt,
    updated_at: product.updatedAt,
  };
}

async function upsertRows<T extends Record<string, unknown>>(
  label: string,
  upsert: (rows: T[]) => PromiseLike<{ error: { message: string } | null }>,
  rows: T[],
) {
  if (rows.length === 0) {
    console.log(`- ${label}: skipped (0 rows)`);
    return;
  }

  const { error } = await upsert(rows);

  if (error) {
    throw new Error(`${label} upsert failed: ${error.message}`);
  }

  console.log(`- ${label}: ${rows.length} rows`);
}

async function main() {
  loadEnvLocal();

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const taxonomy = readJsonFile<Taxonomy>("data/taxonomy.json");
  const products = readJsonFile<Product[]>("data/products.json");

  const now = new Date().toISOString();
  const collectionRows = COLLECTIONS.map((collection) => ({
    slug: collection.slug,
    name: collection.name,
    sort_order: collection.sort_order,
    created_at: now,
    updated_at: now,
  }));

  console.log("Seeding Supabase...");

  await upsertRows(
    "categories",
    (rows) => supabase.from("categories").upsert(rows, { onConflict: "slug" }),
    taxonomy.categories.map(toCategoryRow),
  );

  await upsertRows(
    "sub_categories",
    (rows) => supabase.from("sub_categories").upsert(rows, { onConflict: "slug" }),
    taxonomy.subCategories.map(toSubCategoryRow),
  );

  await upsertRows(
    "collections",
    (rows) => supabase.from("collections").upsert(rows, { onConflict: "slug" }),
    collectionRows,
  );

  await upsertRows(
    "products",
    (rows) => supabase.from("products").upsert(rows, { onConflict: "id" }),
    products.map(toProductRow),
  );

  console.log("Seed complete.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Seed failed: ${message}`);
  process.exit(1);
});
