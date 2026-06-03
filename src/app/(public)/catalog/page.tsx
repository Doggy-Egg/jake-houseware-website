import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { readCategories } from "@/lib/constants/categories";
import {
  catalogConfig,
  getCatalogDownloadUrl,
  getCatalogFileSize,
} from "@/lib/constants/catalog";

export const metadata: Metadata = {
  title: "Catalog",
  description:
    "Download the JAKE HOUSEWARE wholesale product catalog PDF. Browse wine, bar, coffee, and kitchen houseware products for B2B partners.",
};

export default async function CatalogPage() {
  const downloadUrl = getCatalogDownloadUrl();
  const fileSize = getCatalogFileSize();
  const categories = await readCategories();

  return (
    <>
      <section className="border-b border-gold/20 bg-muted-bg">
        <Container as="main" className="py-16 md:py-20">
          <div className="max-w-3xl">
            <Badge variant="gold">Wholesale Resources</Badge>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Product Catalog
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              {catalogConfig.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href={downloadUrl} size="lg" download>
                Download PDF
              </Button>
              <Button href="/products" variant="outline" size="lg">
                Browse Online Catalog
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="Catalog Details"
                title={catalogConfig.title}
              />
              <dl className="mt-8 space-y-4">
                <DetailRow label="Version" value={catalogConfig.version} />
                <DetailRow label="Last Updated" value={catalogConfig.updatedAt} />
                <DetailRow label="Language" value={catalogConfig.language} />
                <DetailRow
                  label="Pages"
                  value={String(catalogConfig.pages)}
                />
                <DetailRow label="File Size" value={fileSize} />
                <DetailRow label="Format" value="PDF" />
              </dl>
            </div>

            <div>
              <SectionHeading
                eyebrow="What's Included"
                title="Catalog highlights"
              />
              <ul className="mt-8 space-y-3">
                {catalogConfig.highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-muted"
                  >
                    <span className="mt-1 text-accent" aria-hidden="true">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-10 rounded-sm border border-border bg-muted-bg p-6">
                <p className="text-sm font-medium text-foreground">
                  Need a custom selection?
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Build an inquiry list online or contact our team for a
                  tailored product selection and quotation.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/inquiry"
                    className="text-sm font-medium text-accent hover:text-accent-hover"
                  >
                    View Inquiry List →
                  </Link>
                  <Link
                    href="/contact"
                    className="text-sm font-medium text-accent hover:text-accent-hover"
                  >
                    Contact Us →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-muted-bg py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Categories"
            title="Product categories in this catalog"
            description="Seven focused houseware categories for global B2B partners."
          />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="flex items-center justify-between rounded-sm border border-border bg-surface px-5 py-4 text-sm font-medium text-foreground transition-colors hover:border-accent/30"
                >
                  {category.name}
                  <span className="text-muted" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 border-b border-border pb-4 text-sm last:border-0">
      <dt className="font-medium text-muted">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
