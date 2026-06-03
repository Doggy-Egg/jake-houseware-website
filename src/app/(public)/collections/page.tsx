import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardImage,
  CardTitle,
} from "@/components/ui/card";
import { collections } from "@/lib/constants/collections";
import { getProductsByCollection } from "@/lib/data/queries";
import { getProductPrimaryImage } from "@/lib/utils/product-image";

const collectionDescriptions: Record<string, string> = {
  "premium-collection":
    "Curated high-end pieces for discerning retail partners.",
  "best-sellers": "Proven performers with consistent reorder demand.",
  "new-arrivals": "Latest designs ready for your next season lineup.",
};

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const collectionProducts = await Promise.all(
    collections.map(async (collection) => ({
      collection,
      products: await getProductsByCollection(collection.slug),
    })),
  );

  return (
    <Container as="main" className="py-16 md:py-20">
      <SectionHeading
        eyebrow="Curated"
        title="Collections"
        description="Explore curated product selections designed for different retail and wholesale strategies."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {collectionProducts.map(({ collection, products }) => {
          const count = products.length;
          const coverProduct = products[0];

          return (
            <Card
              key={collection.slug}
              href={`/collections/${collection.slug}`}
            >
              <CardImage
                src={coverProduct ? getProductPrimaryImage(coverProduct) : undefined}
                alt={collection.name}
                aspectRatio="square"
              />
              <CardContent>
                <CardTitle>{collection.name}</CardTitle>
                <CardDescription>
                  {collectionDescriptions[collection.slug]}
                </CardDescription>
                <p className="mt-3 text-xs uppercase tracking-widest text-muted">
                  {count} products
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Container>
  );
}
