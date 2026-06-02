import type { CollectionSlug } from "@/lib/constants/collections";
import {
  adminCopy,
  categoryAdminLabels,
  collectionAdminLabels,
  subCategoryAdminLabels,
} from "@/lib/constants/admin";

export function getCategoryAdminLabel(slug: string): string {
  return categoryAdminLabels[slug] ?? slug;
}

export function getSubCategoryAdminLabel(slug: string): string {
  return subCategoryAdminLabels[slug] ?? slug;
}

export function formatCollectionAdminLabels(
  slugs: CollectionSlug[],
): string {
  if (slugs.length === 0) return adminCopy.regularProduct;
  return slugs
    .map((slug) => collectionAdminLabels[slug] ?? slug)
    .join("、");
}
