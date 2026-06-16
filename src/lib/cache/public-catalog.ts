import { unstable_cache } from "next/cache";
import { readTaxonomy } from "@/lib/data/taxonomy-store";
import type { Category, SubCategory } from "@/types/taxonomy";

export const PUBLIC_CATALOG_TAGS = {
  taxonomy: "public-taxonomy",
} as const;

const TAXONOMY_REVALIDATE_SECONDS = 300;

async function loadSortedCategories(): Promise<Category[]> {
  const taxonomy = await readTaxonomy();
  return taxonomy.categories
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

async function loadSortedSubCategories(): Promise<SubCategory[]> {
  const taxonomy = await readTaxonomy();
  return taxonomy.subCategories
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export const getCachedCategories = unstable_cache(
  loadSortedCategories,
  ["public-categories"],
  {
    revalidate: TAXONOMY_REVALIDATE_SECONDS,
    tags: [PUBLIC_CATALOG_TAGS.taxonomy],
  },
);

export const getCachedSubCategories = unstable_cache(
  loadSortedSubCategories,
  ["public-sub-categories"],
  {
    revalidate: TAXONOMY_REVALIDATE_SECONDS,
    tags: [PUBLIC_CATALOG_TAGS.taxonomy],
  },
);
