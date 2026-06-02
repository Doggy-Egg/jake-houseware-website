import type { ProductCategorySlug } from "@/lib/constants/categories";
import type { ProductSubCategorySlug } from "@/lib/constants/sub-categories";
import type { CollectionSlug } from "@/lib/constants/collections";

export type ProductStatus = "draft" | "active" | "inactive";

export type Product = {
  // Public — visible to customers when filled
  itemNo: string;
  name: string;
  description?: string;
  categorySlug: ProductCategorySlug;
  subCategorySlug?: ProductSubCategorySlug;
  collectionSlugs: CollectionSlug[];
  images: string[];
  /** Primary image for cards, inquiry list, and previews. Falls back to first scene image. */
  thumbnail?: string;
  material?: string;
  dimensions?: string;
  moq?: number;
  packaging?: string;
  leadTime?: string;
  keywords?: string[];

  // Internal — company product database (Admin only)
  weight?: string;
  cartonSize?: string;
  qtyPerCarton?: number;
  cbm?: number;
  factory?: string;

  // System — site management
  id: string;
  slug: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};
