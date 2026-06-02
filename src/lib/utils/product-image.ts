import type { Product } from "@/types/product";

/** Primary product image (1:1) for cards, inquiry list, SEO previews, etc. */
export function getProductPrimaryImage(product: Pick<Product, "thumbnail" | "images">) {
  return product.thumbnail ?? product.images[0];
}
