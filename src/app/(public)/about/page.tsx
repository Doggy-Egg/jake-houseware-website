import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { readCategories } from "@/lib/constants/categories";
import { partnerTypes } from "@/lib/constants/about";
import { contactInfo } from "@/lib/constants/contact";
import { siteConfig } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `About ${siteConfig.name} — B2B wholesale houseware catalog for importers, wholesalers, and retailers.`,
};

export default async function AboutPage() {
  const categories = await readCategories();

  return (
    <>
      <section className="border-b border-gold/20 bg-muted-bg">
        <Container as="main" className="py-16 md:py-24">
          <div className="max-w-3xl">
            <Badge variant="gold">Our Company</Badge>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
              {siteConfig.name}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              {siteConfig.description} Use this site to browse the catalog, build
              an inquiry list, and contact us for wholesale inquiries — there is
              no online checkout.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="max-w-3xl space-y-5 text-base leading-relaxed text-muted">
            <SectionHeading
              eyebrow="Contact"
              title="Get in touch"
            />
            <p>
              For pricing, samples, or partnership questions, reach us by email
              or phone.
            </p>
            <ul className="space-y-2 text-sm text-foreground">
              <li>
                <span className="text-muted">Email: </span>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-accent hover:text-accent-hover"
                >
                  {contactInfo.email}
                </a>
              </li>
              <li>
                <span className="text-muted">Phone: </span>
                <a
                  href={`tel:${contactInfo.phoneTel}`}
                  className="text-accent hover:text-accent-hover"
                >
                  {contactInfo.phone}
                </a>
              </li>
              <li>
                <span className="text-muted">Location: </span>
                {contactInfo.address}
              </li>
            </ul>
            <Button href="/contact" variant="outline" className="mt-2">
              Contact form
            </Button>
          </div>
        </Container>
      </section>

      <section className="border-y border-border bg-muted-bg py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="What We Make"
            title="Product categories"
            description="Categories currently listed in our wholesale catalog."
          />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="flex items-center justify-between rounded-sm border border-border bg-surface px-5 py-4 text-sm font-medium text-foreground transition-colors hover:border-accent/30 hover:bg-white"
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

      <section className="py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Our Partners"
            title="Who this site is for"
            description="This catalog is intended for B2B trade channels."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {partnerTypes.map((partner) => (
              <div
                key={partner.title}
                className="rounded-sm border border-border bg-surface p-6"
              >
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {partner.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {partner.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-gold/20 bg-accent py-16 text-accent-foreground md:py-20">
        <Container className="text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-gold">
            Get Started
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            Browse the catalog
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-accent-foreground/80">
            Add products to your inquiry list or send us a message with your
            requirements.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/products" variant="onDark" size="lg">
              Browse Products
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
