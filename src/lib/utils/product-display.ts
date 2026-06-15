import type { Product } from "@/types/product";

export function getProductDisplayName(product: Pick<Product, "name" | "itemNo">) {
  const name = product.name.trim();
  return name || product.itemNo;
}
