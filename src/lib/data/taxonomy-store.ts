import "server-only";

import { taxonomySeed } from "@/lib/data/taxonomy-seed";
import {
  migrateProductsCategorySlug,
  migrateProductsSubCategorySlug,
  migrateProductsToCategory,
} from "@/lib/data/product-store";
import {
  mapCategoryRow,
  mapSubCategoryRow,
  toCategoryRow,
  toSubCategoryRow,
  type CategoryRow,
  type SubCategoryRow,
} from "@/lib/supabase/mappers";
import { createSupabaseAdmin } from "@/lib/supabase/server";
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

export async function readTaxonomy(): Promise<Taxonomy> {
  const supabase = createSupabaseAdmin();

  const [categoriesResult, subCategoriesResult] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase
      .from("sub_categories")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  if (categoriesResult.error) {
    throw new Error(categoriesResult.error.message);
  }

  if (subCategoriesResult.error) {
    throw new Error(subCategoriesResult.error.message);
  }

  const categories = ((categoriesResult.data ?? []) as CategoryRow[]).map(
    mapCategoryRow,
  );
  const subCategories = ((subCategoriesResult.data ?? []) as SubCategoryRow[]).map(
    mapSubCategoryRow,
  );

  if (categories.length === 0 && subCategories.length === 0) {
    return structuredClone(taxonomySeed);
  }

  return { categories, subCategories };
}

export async function countProductsByCategory(
  categorySlug: string,
): Promise<number> {
  const supabase = createSupabaseAdmin();
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_slug", categorySlug);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function countProductsBySubCategory(
  subCategorySlug: string,
): Promise<number> {
  const supabase = createSupabaseAdmin();
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("sub_category_slug", subCategorySlug);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const taxonomy = await readTaxonomy();
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

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("categories").insert(toCategoryRow(category));

  if (error) {
    throw new Error(error.message);
  }

  return category;
}

export async function updateCategory(
  slug: string,
  input: CategoryUpdateInput,
): Promise<Category | null> {
  const taxonomy = await readTaxonomy();
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
    await migrateProductsCategorySlug(slug, newSlug);

    const supabase = createSupabaseAdmin();
    const now = new Date().toISOString();
    const { error: subCategoryError } = await supabase
      .from("sub_categories")
      .update({ category_slug: newSlug, updated_at: now })
      .eq("category_slug", slug);

    if (subCategoryError) {
      throw new Error(subCategoryError.message);
    }
  }

  const updated: Category = {
    ...current,
    slug: newSlug,
    name: input.name?.trim() ?? current.name,
    sortOrder: input.sortOrder ?? current.sortOrder,
    updatedAt: new Date().toISOString(),
  };

  const supabase = createSupabaseAdmin();

  if (newSlug !== slug) {
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("slug", slug);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    const { error: insertError } = await supabase
      .from("categories")
      .insert(toCategoryRow(updated));

    if (insertError) {
      throw new Error(insertError.message);
    }
  } else {
    const { error } = await supabase
      .from("categories")
      .update(toCategoryRow(updated))
      .eq("slug", slug);

    if (error) {
      throw new Error(error.message);
    }
  }

  return updated;
}

export async function deleteCategory(
  slug: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const productCount = await countProductsByCategory(slug);
  if (productCount > 0) {
    return {
      ok: false,
      reason: `Cannot delete: ${productCount} product(s) still use this category. Transfer or reassign products first.`,
    };
  }

  const taxonomy = await readTaxonomy();
  const subCategories = taxonomy.subCategories.filter(
    (subCategory) => subCategory.categorySlug === slug,
  );

  for (const subCategory of subCategories) {
    const subCount = await countProductsBySubCategory(subCategory.slug);
    if (subCount > 0) {
      return {
        ok: false,
        reason: `Cannot delete: sub-category "${subCategory.name}" still has ${subCount} product(s).`,
      };
    }
  }

  const supabase = createSupabaseAdmin();
  const { error: subCategoryDeleteError } = await supabase
    .from("sub_categories")
    .delete()
    .eq("category_slug", slug);

  if (subCategoryDeleteError) {
    throw new Error(subCategoryDeleteError.message);
  }

  const { error } = await supabase.from("categories").delete().eq("slug", slug);

  if (error) {
    throw new Error(error.message);
  }

  return { ok: true };
}

export async function createSubCategory(
  input: SubCategoryInput,
): Promise<SubCategory | null> {
  const taxonomy = await readTaxonomy();
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

  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("sub_categories")
    .insert(toSubCategoryRow(subCategory));

  if (error) {
    throw new Error(error.message);
  }

  return subCategory;
}

export async function updateSubCategory(
  slug: string,
  input: SubCategoryUpdateInput,
): Promise<SubCategory | null> {
  const taxonomy = await readTaxonomy();
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
    await migrateProductsSubCategorySlug(slug, newSlug);
  }

  if (
    targetCategorySlug !== current.categorySlug &&
    (await countProductsBySubCategory(newSlug)) > 0
  ) {
    await migrateProductsToCategory(newSlug, targetCategorySlug);
  }

  const updated: SubCategory = {
    ...current,
    slug: newSlug,
    name: input.name?.trim() ?? current.name,
    categorySlug: targetCategorySlug,
    sortOrder: input.sortOrder ?? current.sortOrder,
    updatedAt: new Date().toISOString(),
  };

  const supabase = createSupabaseAdmin();

  if (newSlug !== slug) {
    const { error: deleteError } = await supabase
      .from("sub_categories")
      .delete()
      .eq("slug", slug);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    const { error: insertError } = await supabase
      .from("sub_categories")
      .insert(toSubCategoryRow(updated));

    if (insertError) {
      throw new Error(insertError.message);
    }
  } else {
    const { error } = await supabase
      .from("sub_categories")
      .update(toSubCategoryRow(updated))
      .eq("slug", slug);

    if (error) {
      throw new Error(error.message);
    }
  }

  return updated;
}

export async function deleteSubCategory(
  slug: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const productCount = await countProductsBySubCategory(slug);
  if (productCount > 0) {
    return {
      ok: false,
      reason: `Cannot delete: ${productCount} product(s) still use this sub-category. Reassign products first.`,
    };
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("sub_categories").delete().eq("slug", slug);

  if (error) {
    throw new Error(error.message);
  }

  return { ok: true };
}

export async function getCategoryUsage() {
  const taxonomy = await readTaxonomy();

  return Promise.all(
    taxonomy.categories.map(async (category) => ({
      ...category,
      productCount: await countProductsByCategory(category.slug),
      subCategories: await Promise.all(
        taxonomy.subCategories
          .filter((subCategory) => subCategory.categorySlug === category.slug)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(async (subCategory) => ({
            ...subCategory,
            productCount: await countProductsBySubCategory(subCategory.slug),
          })),
      ),
    })),
  );
}
