import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/products/product-card";
import { collections } from "@/lib/constants/collections";
import { getCollectionName } from "@/lib/data/products";
import { getProductsByCollection } from "@/lib/data/queries";
import type { CollectionSlug } from "@/lib/constants/collections";

const collectionDescriptions: Record<CollectionSlug, string> = {
  "premium-collection":
    "Curated high-end pieces for discerning retail partners.",
  "best-sellers": "Proven performers with consistent reorder demand.",
  "new-arrivals": "Latest designs ready for your next season lineup.",
};

type CollectionDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CollectionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = collections.find((item) => item.slug === slug);
  if (!collection) return { title: "Collection Not Found" };

  return {
    title: collection.name,
    description: collectionDescriptions[collection.slug as CollectionSlug],
  };
}

export default async function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { slug } = await params;
  const collection = collections.find((item) => item.slug === slug);

  if (!collection) notFound();

  const products = await getProductsByCollection(collection.slug);

  return (
    <Container as="main" className="py-16 md:py-20">
      <SectionHeading
        eyebrow="Collection"
        title={getCollectionName(collection.slug)}
        description={collectionDescriptions[collection.slug]}
      />

      <p className="mt-6 text-sm text-muted">
        {products.length} product{products.length === 1 ? "" : "s"}
      </p>

      <div className="mt-8">
        <ProductGrid
          products={products}
          emptyMessage="No products in this collection yet."
        />
      </div>
    </Container>
  );
}

export function generateStaticParams() {
  return collections.map((collection) => ({ slug: collection.slug }));
}
