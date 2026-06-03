import type { Metadata } from "next";
import type { Product } from "@/types/product";
import { siteConfig } from "@/lib/constants/site";
import { getCategoryName } from "@/lib/data/taxonomy-queries";
import { getProductPrimaryImage } from "@/lib/utils/product-image";

export async function buildProductMetadata(product: Product): Promise<Metadata> {
  const categoryName = await getCategoryName(product.categorySlug);
  const description =
    product.description ??
    `${product.name} — wholesale ${categoryName} from ${siteConfig.name}.`;

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

export async function buildProductJsonLd(product: Product) {
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
    category: await getCategoryName(product.categorySlug),
  };
}
