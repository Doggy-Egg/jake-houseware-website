import {
  countProductsByCategory,
  countProductsBySubCategory,
  readTaxonomy,
} from "@/lib/data/taxonomy-store";
import { readActiveSubCategorySlugsForCategory } from "@/lib/data/product-store";
import { getCachedSubCategories } from "@/lib/cache/public-catalog";

export type ProductCategorySlug = string;
export type ProductSubCategorySlug = string;

export async function readCategories() {
  return (await readTaxonomy())
    .categories.slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function readSubCategories(categorySlug?: string) {
  const subCategories = (await readTaxonomy())
    .subCategories.slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (!categorySlug) return subCategories;

  return subCategories.filter(
    (subCategory) => subCategory.categorySlug === categorySlug,
  );
}

export async function readSubCategoriesWithProducts(categorySlug?: string) {
  if (!categorySlug) return [];

  const [subCategories, activeSlugs] = await Promise.all([
    getCachedSubCategories().then((all) =>
      all.filter((subCategory) => subCategory.categorySlug === categorySlug),
    ),
    readActiveSubCategorySlugsForCategory(categorySlug),
  ]);

  return subCategories.filter((subCategory) => activeSlugs.has(subCategory.slug));
}

export async function getCategoryName(slug: string): Promise<string> {
  return (
    (await readCategories()).find((category) => category.slug === slug)?.name ??
    slug
  );
}

export async function getSubCategoryName(
  subCategorySlug: string | undefined,
): Promise<string | undefined> {
  if (!subCategorySlug) return undefined;

  return (
    (await readTaxonomy()).subCategories.find(
      (subCategory) => subCategory.slug === subCategorySlug,
    )?.name ?? subCategorySlug
  );
}

export async function getSubCategoriesForCategory(categorySlug: string) {
  return (await readSubCategories(categorySlug)).map(({ slug, name }) => ({
    slug,
    name,
  }));
}

export async function getSubCategoryCategory(
  subCategorySlug: string,
): Promise<string | undefined> {
  return (await readTaxonomy()).subCategories.find(
    (subCategory) => subCategory.slug === subCategorySlug,
  )?.categorySlug;
}

export async function isSubCategoryValidForCategory(
  categorySlug: string,
  subCategorySlug: string | undefined,
): Promise<boolean> {
  if (!subCategorySlug) return true;
  return (await getSubCategoryCategory(subCategorySlug)) === categorySlug;
}

export async function categoryExists(slug: string): Promise<boolean> {
  return (await readCategories()).some((category) => category.slug === slug);
}

export async function subCategoryExists(slug: string): Promise<boolean> {
  return (await readTaxonomy()).subCategories.some(
    (subCategory) => subCategory.slug === slug,
  );
}

export { countProductsByCategory, countProductsBySubCategory };
