import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { isOptimizableProductImageUrl } from "@/lib/utils/supabase-image";

type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  objectFit?: "contain" | "cover";
};

export function ProductImage({
  src,
  alt,
  className,
  fill = false,
  width,
  height,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  priority = false,
  objectFit = "contain",
}: ProductImageProps) {
  const objectClass = objectFit === "cover" ? "object-cover" : "object-contain";

  if (!isOptimizableProductImageUrl(src)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={cn("h-full w-full", objectClass, className)}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(objectClass, className)}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(objectClass, className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 800}
      height={height ?? 800}
      sizes={sizes}
      priority={priority}
      className={cn(objectClass, className)}
    />
  );
}
