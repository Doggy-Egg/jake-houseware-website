import type { Metadata } from "next";
import type { Product } from "@/types/product";
import { siteConfig } from "@/lib/constants/site";
import { getCategoryName } from "@/lib/data/products";
import { getProductPrimaryImage } from "@/lib/utils/product-image";

export function buildProductMetadata(product: Product): Metadata {
  const description =
    product.description ??
    `${product.name} — wholesale ${getCategoryName(product.categorySlug)} from ${siteConfig.name}.`;

  const primaryImage = getProductPrimaryImage(product);

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: primaryImage ? [{ url: primaryImage }] : [],
      type: "website",
      siteName: siteConfig.name,
    },
  };
}

export function buildProductJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.itemNo,
    description: product.description,
    image: getProductPrimaryImage(product) ?? product.images,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    category: getCategoryName(product.categorySlug),
  };
}
