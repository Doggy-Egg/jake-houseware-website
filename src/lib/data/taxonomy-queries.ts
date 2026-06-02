import {
  countProductsByCategory,
  countProductsBySubCategory,
  readTaxonomy,
} from "@/lib/data/taxonomy-store";

export type ProductCategorySlug = string;
export type ProductSubCategorySlug = string;

export function readCategories() {
  return readTaxonomy()
    .categories.slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function readSubCategories(categorySlug?: string) {
  const subCategories = readTaxonomy()
    .subCategories.slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);
  if (!categorySlug) return subCategories;
  return subCategories.filter(
    (subCategory) => subCategory.categorySlug === categorySlug,
  );
}

export function readSubCategoriesWithProducts(categorySlug?: string) {
  return readSubCategories(categorySlug).filter(
    (subCategory) => countProductsBySubCategory(subCategory.slug) > 0,
  );
}

export function getCategoryName(slug: string): string {
  return readCategories().find((category) => category.slug === slug)?.name ?? slug;
}

export function getSubCategoryName(
  subCategorySlug: string | undefined,
): string | undefined {
  if (!subCategorySlug) return undefined;
  return (
    readTaxonomy().subCategories.find(
      (subCategory) => subCategory.slug === subCategorySlug,
    )?.name ?? subCategorySlug
  );
}

export function getSubCategoriesForCategory(categorySlug: string) {
  return readSubCategories(categorySlug).map(({ slug, name }) => ({ slug, name }));
}

export function getSubCategoryCategory(
  subCategorySlug: string,
): string | undefined {
  return readTaxonomy().subCategories.find(
    (subCategory) => subCategory.slug === subCategorySlug,
  )?.categorySlug;
}

export function isSubCategoryValidForCategory(
  categorySlug: string,
  subCategorySlug: string | undefined,
): boolean {
  if (!subCategorySlug) return true;
  return getSubCategoryCategory(subCategorySlug) === categorySlug;
}

export function categoryExists(slug: string): boolean {
  return readCategories().some((category) => category.slug === slug);
}

export function subCategoryExists(slug: string): boolean {
  return readTaxonomy().subCategories.some(
    (subCategory) => subCategory.slug === slug,
  );
}

export { countProductsByCategory, countProductsBySubCategory };
