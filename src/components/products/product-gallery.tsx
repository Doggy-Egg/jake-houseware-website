"use client";

import { useState } from "react";
import { ProductImage } from "@/components/ui/product-image";
import { cn } from "@/lib/utils/cn";

type ProductGalleryProps = {
  images: string[];
  itemNo: string;
};

export function ProductGallery({ images, itemNo }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-sm border border-border bg-white">
        {activeImage ? (
          <ProductImage
            src={activeImage}
            alt={itemNo}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-sm border bg-white transition-colors",
                index === activeIndex
                  ? "border-accent ring-1 ring-accent"
                  : "border-border hover:border-accent/30",
              )}
            >
              <ProductImage
                src={image}
                alt={`${itemNo} view ${index + 1}`}
                fill
                sizes="120px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
