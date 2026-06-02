import "server-only";

import fs from "fs";
import path from "path";
import { taxonomySeed } from "@/lib/data/taxonomy-seed";
import { slugify } from "@/lib/utils/slug";
import type {
  Category,
  CategoryInput,
  CategoryUpdateInput,
  SubCategory,
  SubCategoryInput,
  SubCategoryUpdateInput,
  Taxonomy,
} from "@/types/taxonomy";
import type { Product } from "@/types/product";

const DATA_DIR = path.join(process.cwd(), "data");
const TAXONOMY_FILE = path.join(DATA_DIR, "taxonomy.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

function ensureTaxonomyFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(TAXONOMY_FILE)) {
    fs.writeFileSync(TAXONOMY_FILE, JSON.stringify(taxonomySeed, null, 2));
  }
}

export function readTaxonomy(): Taxonomy {
  ensureTaxonomyFile();
  const raw = fs.readFileSync(TAXONOMY_FILE, "utf-8");
  const parsed = JSON.parse(raw) as Taxonomy;
  if (!parsed?.categories || !parsed?.subCategories) {
    return structuredClone(taxonomySeed);
  }
  return parsed;
}

function writeTaxonomy(taxonomy: Taxonomy) {
  ensureTaxonomyFile();
  fs.writeFileSync(TAXONOMY_FILE, JSON.stringify(taxonomy, null, 2));
}

function uniqueSlug(base: string, existing: string[]): string {
  let slug = slugify(base);
  if (!slug) slug = "category";
  let candidate = slug;
  let index = 2;
  while (existing.includes(candidate)) {
    candidate = `${slug}-${index}`;
    index += 1;
  }
  return candidate;
}

export function countProductsByCategory(categorySlug: string): number {
  return readProductsForMigration().filter(
    (product) => product.categorySlug === categorySlug,
  ).length;
}

export function countProductsBySubCategory(subCategorySlug: string): number {
  return readProductsForMigration().filter(
    (product) => product.subCategorySlug === subCategorySlug,
  ).length;
}

function readProductsForMigration(): Product[] {
  if (!fs.existsSync(PRODUCTS_FILE)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8")) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeProductsForMigration(products: Product[]) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

function migrateProductsCategorySlug(oldSlug: string, newSlug: string) {
  const now = new Date().toISOString();
  writeProductsForMigration(
    readProductsForMigration().map((product) =>
      product.categorySlug === oldSlug
        ? { ...product, categorySlug: newSlug, updatedAt: now }
        : product,
    ),
  );
}

function migrateProductsSubCategorySlug(oldSlug: string, newSlug: string) {
  const now = new Date().toISOString();
  writeProductsForMigration(
    readProductsForMigration().map((product) =>
      product.subCategorySlug === oldSlug
        ? { ...product, subCategorySlug: newSlug, updatedAt: now }
        : product,
    ),
  );
}

function migrateProductsToCategory(subCategorySlug: string, categorySlug: string) {
  const now = new Date().toISOString();
  writeProductsForMigration(
    readProductsForMigration().map((product) =>
      product.subCategorySlug === subCategorySlug
        ? { ...product, categorySlug, updatedAt: now }
        : product,
    ),
  );
}

export function createCategory(input: CategoryInput): Category {
  const taxonomy = readTaxonomy();
  const slug = uniqueSlug(
    input.slug ?? input.name,
    taxonomy.categories.map((category) => category.slug),
  );
  const now = new Date().toISOString();
  const category: Category = {
    slug,
    name: input.name.trim(),
    sortOrder: input.sortOrder ?? taxonomy.categories.length,
    createdAt: now,
    updatedAt: now,
  };
  writeTaxonomy({
    ...taxonomy,
    categories: [...taxonomy.categories, category],
  });
  return category;
}

export function updateCategory(
  slug: string,
  input: CategoryUpdateInput,
): Category | null {
  const taxonomy = readTaxonomy();
  const index = taxonomy.categories.findIndex((category) => category.slug === slug);
  if (index === -1) return null;

  const current = taxonomy.categories[index]!;
  const newSlug =
    input.newSlug && input.newSlug !== slug
      ? uniqueSlug(
          input.newSlug,
          taxonomy.categories
            .map((category) => category.slug)
            .filter((existing) => existing !== slug),
        )
      : slug;

  if (newSlug !== slug) {
    migrateProductsCategorySlug(slug, newSlug);
    taxonomy.subCategories = taxonomy.subCategories.map((subCategory) =>
      subCategory.categorySlug === slug
        ? {
            ...subCategory,
            categorySlug: newSlug,
            updatedAt: new Date().toISOString(),
          }
        : subCategory,
    );
  }

  const updated: Category = {
    ...current,
    slug: newSlug,
    name: input.name?.trim() ?? current.name,
    sortOrder: input.sortOrder ?? current.sortOrder,
    updatedAt: new Date().toISOString(),
  };

  const categories = [...taxonomy.categories];
  categories[index] = updated;
  writeTaxonomy({ ...taxonomy, categories });
  return updated;
}

export function deleteCategory(slug: string): { ok: true } | { ok: false; reason: string } {
  const productCount = countProductsByCategory(slug);
  if (productCount > 0) {
    return {
      ok: false,
      reason: `Cannot delete: ${productCount} product(s) still use this category. Transfer or reassign products first.`,
    };
  }

  const taxonomy = readTaxonomy();
  const subCategories = taxonomy.subCategories.filter(
    (subCategory) => subCategory.categorySlug === slug,
  );

  for (const subCategory of subCategories) {
    const subCount = countProductsBySubCategory(subCategory.slug);
    if (subCount > 0) {
      return {
        ok: false,
        reason: `Cannot delete: sub-category "${subCategory.name}" still has ${subCount} product(s).`,
      };
    }
  }

  writeTaxonomy({
    categories: taxonomy.categories.filter((category) => category.slug !== slug),
    subCategories: taxonomy.subCategories.filter(
      (subCategory) => subCategory.categorySlug !== slug,
    ),
  });

  return { ok: true };
}

export function createSubCategory(input: SubCategoryInput): SubCategory | null {
  const taxonomy = readTaxonomy();
  if (!taxonomy.categories.some((category) => category.slug === input.categorySlug)) {
    return null;
  }

  const slug = uniqueSlug(
    input.slug ?? input.name,
    taxonomy.subCategories.map((subCategory) => subCategory.slug),
  );
  const siblings = taxonomy.subCategories.filter(
    (subCategory) => subCategory.categorySlug === input.categorySlug,
  );
  const now = new Date().toISOString();
  const subCategory: SubCategory = {
    slug,
    name: input.name.trim(),
    categorySlug: input.categorySlug,
    sortOrder: input.sortOrder ?? siblings.length,
    createdAt: now,
    updatedAt: now,
  };

  writeTaxonomy({
    ...taxonomy,
    subCategories: [...taxonomy.subCategories, subCategory],
  });
  return subCategory;
}

export function updateSubCategory(
  slug: string,
  input: SubCategoryUpdateInput,
): SubCategory | null {
  const taxonomy = readTaxonomy();
  const index = taxonomy.subCategories.findIndex(
    (subCategory) => subCategory.slug === slug,
  );
  if (index === -1) return null;

  const current = taxonomy.subCategories[index]!;
  const targetCategorySlug = input.categorySlug ?? current.categorySlug;

  if (!taxonomy.categories.some((category) => category.slug === targetCategorySlug)) {
    return null;
  }

  const newSlug =
    input.newSlug && input.newSlug !== slug
      ? uniqueSlug(
          input.newSlug,
          taxonomy.subCategories
            .map((subCategory) => subCategory.slug)
            .filter((existing) => existing !== slug),
        )
      : slug;

  if (newSlug !== slug) {
    migrateProductsSubCategorySlug(slug, newSlug);
  }

  if (targetCategorySlug !== current.categorySlug && countProductsBySubCategory(slug) > 0) {
    migrateProductsToCategory(newSlug, targetCategorySlug);
  }

  const updated: SubCategory = {
    ...current,
    slug: newSlug,
    name: input.name?.trim() ?? current.name,
    categorySlug: targetCategorySlug,
    sortOrder: input.sortOrder ?? current.sortOrder,
    updatedAt: new Date().toISOString(),
  };

  const subCategories = [...taxonomy.subCategories];
  subCategories[index] = updated;
  writeTaxonomy({ ...taxonomy, subCategories });
  return updated;
}

export function deleteSubCategory(
  slug: string,
): { ok: true } | { ok: false; reason: string } {
  const productCount = countProductsBySubCategory(slug);
  if (productCount > 0) {
    return {
      ok: false,
      reason: `Cannot delete: ${productCount} product(s) still use this sub-category. Reassign products first.`,
    };
  }

  const taxonomy = readTaxonomy();
  writeTaxonomy({
    ...taxonomy,
    subCategories: taxonomy.subCategories.filter(
      (subCategory) => subCategory.slug !== slug,
    ),
  });
  return { ok: true };
}

export function getCategoryUsage() {
  const taxonomy = readTaxonomy();
  return taxonomy.categories.map((category) => ({
    ...category,
    productCount: countProductsByCategory(category.slug),
    subCategories: taxonomy.subCategories
      .filter((subCategory) => subCategory.categorySlug === category.slug)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((subCategory) => ({
        ...subCategory,
        productCount: countProductsBySubCategory(subCategory.slug),
      })),
  }));
}
