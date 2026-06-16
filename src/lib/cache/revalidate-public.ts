import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CATALOG_TAGS } from "@/lib/cache/public-catalog";

export function revalidatePublicCatalog(productSlug?: string) {
  revalidateTag(PUBLIC_CATALOG_TAGS.taxonomy, { expire: 0 });
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/collections", "layout");
  if (productSlug) {
    revalidatePath(`/products/${productSlug}`);
  }
}

export function revalidateTaxonomyPages() {
  revalidateTag(PUBLIC_CATALOG_TAGS.taxonomy, { expire: 0 });
  revalidatePath("/products");
  revalidatePath("/", "layout");
  revalidatePath("/collections", "layout");
  revalidatePath("/about");
  revalidatePath("/catalog");
  revalidatePath("/admin/products");
}
