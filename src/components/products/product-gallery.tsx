"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type ProductGalleryProps = {
  images: string[];
  name: string;
};

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden rounded-sm border border-border bg-muted-bg">
        {activeImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeImage}
            alt={name}
            className="h-full w-full object-cover"
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
                "aspect-square overflow-hidden rounded-sm border bg-muted-bg transition-colors",
                index === activeIndex
                  ? "border-accent ring-1 ring-accent"
                  : "border-border hover:border-accent/30",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`${name} view ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
