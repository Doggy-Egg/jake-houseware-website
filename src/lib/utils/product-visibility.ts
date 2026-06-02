import type { Product, ProductStatus } from "@/types/product";

export function normalizeProductStatus(status?: ProductStatus): ProductStatus {
  return status ?? "active";
}

export function isProductPubliclyVisible(
  product: Pick<Product, "status">,
): boolean {
  return normalizeProductStatus(product.status) === "active";
}
