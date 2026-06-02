"use client";

import { ProductForm, productToFormState } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { useAdminProducts } from "@/context/admin/admin-products-context";
import { adminCopy } from "@/lib/constants/admin";

export function EditProductForm({ productId }: { productId: string }) {
  const { getProductById, isLoading } = useAdminProducts();

  if (isLoading) {
    return <p className="text-sm text-muted">{adminCopy.loading}</p>;
  }

  const product = getProductById(productId);

  if (!product) {
    return (
      <div className="rounded-sm border border-dashed border-border bg-surface px-6 py-12 text-center">
        <p className="text-sm text-muted">{adminCopy.productNotFound}</p>
        <Button href="/admin/products" variant="outline" className="mt-4">
          {adminCopy.backToProducts}
        </Button>
      </div>
    );
  }

  return (
    <ProductForm
      key={product.id}
      mode="edit"
      productId={productId}
      initialValues={productToFormState(product)}
    />
  );
}
