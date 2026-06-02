import type { CollectionSlug } from "@/lib/constants/collections";

export type Collection = {
  slug: CollectionSlug;
  name: string;
  description: string;
  image?: string;
};
