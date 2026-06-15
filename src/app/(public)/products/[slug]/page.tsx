import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { AddToInquiryButton } from "@/components/inquiry/add-to-inquiry-button";
import { ProductGallery } from "@/components/products/product-gallery";
import { getCollectionName } from "@/lib/data/products";
import { getProductBySlug, getAllProductSlugs } from "@/lib/data/queries";
import { getProductDisplayName } from "@/lib/utils/product-display";
import {
  buildProductJsonLd,
  buildProductMetadata,
} from "@/lib/seo/product";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return buildProductMetadata(product);
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const jsonLd = await buildProductJsonLd(product);
  const displayName = getProductDisplayName(product);

  return (
    <Container as="main" className="py-16 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-8 text-sm text-muted">
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{displayName}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} name={displayName} />

        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted">
            {product.itemNo}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            {displayName}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2">
            {product.collectionSlugs.map((collectionSlug) => (
              <Badge key={collectionSlug} variant="gold">
                {getCollectionName(collectionSlug)}
              </Badge>
            ))}
          </div>

          {product.description ? (
            <p className="mt-6 text-base leading-relaxed text-muted">
              {product.description}
            </p>
          ) : null}

          <dl className="mt-8 space-y-4 border-t border-border pt-8">
            {product.moq != null ? (
              <SpecRow
                label="MOQ"
                value={product.moq.toLocaleString()}
              />
            ) : null}
            {product.material ? (
              <SpecRow label="Material" value={product.material} />
            ) : null}
            {product.dimensions ? (
              <SpecRow label="Dimensions" value={product.dimensions} />
            ) : null}
            {product.packaging ? (
              <SpecRow label="Packaging" value={product.packaging} />
            ) : null}
            {product.leadTime ? (
              <SpecRow label="Lead Time" value={product.leadTime} />
            ) : null}
          </dl>

          <AddToInquiryButton product={product} className="mt-10" />
        </div>
      </div>
    </Container>
  );
}

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4 text-sm">
      <dt className="font-medium text-muted">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
