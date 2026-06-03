import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardImage,
  CardTitle,
} from "@/components/ui/card";
import { readCategories } from "@/lib/constants/categories";
import { collections } from "@/lib/constants/collections";
import { getProductsByCollection } from "@/lib/data/queries";
import { getProductPrimaryImage } from "@/lib/utils/product-image";

export const dynamic = "force-dynamic";

const collectionDescriptions: Record<string, string> = {
  "premium-collection":
    "Curated high-end pieces for discerning retail partners.",
  "best-sellers": "Proven performers with consistent reorder demand.",
  "new-arrivals": "Latest designs ready for your next season lineup.",
};

export default async function HomePage() {
  const categories = await readCategories();
  const collectionProducts = await Promise.all(
    collections.map(async (collection) => ({
      collection,
      products: await getProductsByCollection(collection.slug),
    })),
  );

  return (
    <>
      <section className="border-b border-gold/20 bg-muted-bg">
        <Container className="py-20 md:py-28">
          <div className="max-w-3xl">
            <Badge variant="gold">B2B Wholesale Catalog</Badge>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
              Houseware products built for global trade partners
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              JAKE HOUSEWARE supplies wine, bar, coffee, and kitchen
              accessories to importers, wholesalers, and retailers. Browse our
              catalog, build an inquiry list, and request a quote — no online
              checkout required.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/products" size="lg">
                Browse Products
              </Button>
              <Button href="/catalog" variant="outline" size="lg">
                Download Catalog
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Product Categories"
            title="Explore our product range"
            description="Seven focused categories covering bar, wine, coffee, kitchen, and lifestyle accessories."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="group flex items-center justify-between rounded-sm border border-border border-l-4 border-l-gold/70 bg-surface px-5 py-4 transition-colors hover:border-gold hover:bg-gold-light/40"
              >
                <span className="text-sm font-medium text-foreground">
                  {category.name}
                </span>
                <span
                  className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-gold"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-gold/20 bg-muted-bg py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Collections"
            title="Curated selections for your market"
            description="Curated selections for best sellers, new arrivals, and premium lines."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {collectionProducts.map(({ collection, products }) => {
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
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-t border-gold/20 bg-accent py-16 text-accent-foreground md:py-20">
        <Container className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            Partner With Us
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            Ready to discuss a wholesale partnership?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-accent-foreground/80">
            Add products to your inquiry list or reach out directly. Our team
            responds to B2B requests within one business day.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/inquiry" variant="onDark" size="lg">
              View Inquiry List
            </Button>
            <Button href="/contact" variant="onDarkOutline" size="lg">
              Contact Us
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
