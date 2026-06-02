"use client";

import Link from "next/link";
import { ProductCardInquiryAction } from "@/components/inquiry/add-to-inquiry-button";
import { CardContent, CardImage, CardTitle } from "@/components/ui/card";
import { getProductPrimaryImage } from "@/lib/utils/product-image";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article
      className={cn(
        "group relative rounded-sm border border-border bg-surface transition-colors",
        "hover:border-accent/30 hover:shadow-sm",
      )}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <CardImage
          src={getProductPrimaryImage(product)}
          alt={product.name}
          aspectRatio="square"
        />
        <CardContent className="pb-14">
          <p className="text-xs uppercase tracking-widest text-muted">
            {product.itemNo}
          </p>
          <CardTitle className="mt-2">{product.name}</CardTitle>
        </CardContent>
      </Link>
      <ProductCardInquiryAction product={product} />
    </article>
  );
}

type ProductGridProps = {
  products: Product[];
  emptyMessage?: string;
};

export function ProductGrid({
  products,
  emptyMessage = "No products match your filters.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-border bg-muted-bg px-6 py-16 text-center">
        <p className="text-sm text-muted">{emptyMessage}</p>
        <Link
          href="/products"
          className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-hover"
        >
          View all products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
