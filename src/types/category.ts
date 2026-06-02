import type { ProductCategorySlug } from "@/lib/constants/categories";

export type Category = {
  slug: ProductCategorySlug;
  name: string;
  description: string;
  image?: string;
};
