"use client";

import Link from "next/link";
import { ProductCardInquiryAction } from "@/components/inquiry/add-to-inquiry-button";
import { CardContent, CardImage, CardTitle } from "@/components/ui/card";
import { getProductPrimaryImage } from "@/lib/utils/product-image";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
  imagePriority?: boolean;
};

export function ProductCard({ product, imagePriority = false }: ProductCardProps) {
  return (
    <article
      className={cn(
        "group relative rounded-sm border border-border bg-surface transition-colors",
        "hover:border-gold/40 hover:shadow-sm",
      )}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <CardImage
          src={getProductPrimaryImage(product)}
          alt={product.itemNo}
          aspectRatio="square"
          priority={imagePriority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <CardContent className="pb-14">
          <CardTitle>{product.itemNo}</CardTitle>
        </CardContent>
      </Link>
      <ProductCardInquiryAction product={product} />
    </article>
  );
}

type ProductGridProps = {
  products: Product[];
  emptyMessage?: string;
  /** Eager-load images for the first N cards (above-the-fold). */
  priorityCount?: number;
};

export function ProductGrid({
  products,
  emptyMessage = "No products match your filters.",
  priorityCount = 4,
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
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          imagePriority={index < priorityCount}
        />
      ))}
    </div>
  );
}
