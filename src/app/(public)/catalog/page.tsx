import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { readCategories } from "@/lib/constants/categories";
import { catalogPageCopy } from "@/lib/constants/catalog";
import {
  formatCatalogFileSize,
  getCatalogFileInfo,
} from "@/lib/supabase/catalog-pdf";

export const metadata: Metadata = {
  title: "Catalog",
  description:
    "Download the JAKE HOUSEWARE wholesale product catalog PDF or browse products online.",
};

function formatDisplayDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function CatalogPage() {
  const [catalog, categories] = await Promise.all([
    getCatalogFileInfo(),
    readCategories(),
  ]);

  return (
    <>
      <section className="border-b border-gold/20 bg-muted-bg">
        <Container as="main" className="py-16 md:py-20">
          <div className="max-w-3xl">
            <Badge variant="gold">Wholesale Resources</Badge>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              {catalogPageCopy.title}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              {catalogPageCopy.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {catalog ? (
                <Button href={catalog.downloadUrl} size="lg" download>
                  Download PDF
                </Button>
              ) : (
                <Button size="lg" disabled>
                  PDF not available yet
                </Button>
              )}
              <Button href="/products" variant="outline" size="lg">
                Browse Online Catalog
              </Button>
            </div>
            {!catalog ? (
              <p className="mt-4 text-sm text-muted">
                The catalog PDF is being prepared. You can browse products online
                or contact us for a copy.
              </p>
            ) : null}
          </div>
        </Container>
      </section>

      {catalog ? (
        <section className="py-16 md:py-20">
          <Container>
            <div className="max-w-xl">
              <SectionHeading eyebrow="File" title="Download details" />
              <dl className="mt-8 space-y-4">
                <DetailRow label="Format" value="PDF" />
                <DetailRow
                  label="File Size"
                  value={formatCatalogFileSize(catalog.fileSizeBytes)}
                />
                <DetailRow
                  label="Last Updated"
                  value={formatDisplayDate(catalog.updatedAt)}
                />
              </dl>
            </div>
          </Container>
        </section>
      ) : null}

      <section
        className={
          catalog
            ? "border-t border-border bg-muted-bg py-16 md:py-20"
            : "py-16 md:py-20"
        }
      >
        <Container>
          <SectionHeading
            eyebrow="Categories"
            title="Product categories"
            description="Browse by category in the online catalog."
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

          <div className="mt-10 rounded-sm border border-border bg-surface p-6">
            <p className="text-sm font-medium text-foreground">
              Need a custom selection?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Build an inquiry list online or contact our team for a tailored
              product selection and quotation.
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
