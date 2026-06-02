import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { readCategories } from "@/lib/constants/categories";
import {
  certifications,
  companyStats,
  companyValues,
  manufacturingCapabilities,
  partnerTypes,
} from "@/lib/constants/about";
import { siteConfig } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about JAKE HOUSEWARE — a B2B houseware manufacturer serving importers, wholesalers, and retailers worldwide with wine, bar, coffee, and kitchen products.",
};

export default function AboutPage() {
  const categories = readCategories();

  return (
    <>
      {/* Hero */}
      <section className="border-b border-gold/20 bg-muted-bg">
        <Container as="main" className="py-16 md:py-24">
          <div className="max-w-3xl">
            <Badge variant="gold">Our Company</Badge>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
              A trusted manufacturing partner for global houseware trade
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              {siteConfig.name} designs and manufactures houseware products for
              importers, wholesalers, and retailers across North America,
              Europe, and beyond. We focus on quality, consistency, and
              long-term B2B relationships — not retail e-commerce.
            </p>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="border-b border-border">
        <Container className="py-12 md:py-16">
          <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {companyStats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-sm text-muted">{stat.label}</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <SectionHeading
              eyebrow="Our Story"
              title="Built for wholesale, designed for retail success"
            />
            <div className="space-y-5 text-base leading-relaxed text-muted">
              <p>
                Founded in Guangdong, China, JAKE HOUSEWARE began as a specialist
                supplier of wine and bar accessories. Over 15 years, we expanded
                into coffee tools, kitchen gadgets, lifestyle accessories, and
                curated gift sets — always with the same principle: products
                that perform well on the shelf and in the hands of end
                consumers.
              </p>
              <p>
                Today we serve B2B partners in more than 40 countries. Our team
                handles product development, production coordination, quality
                control, and export logistics — so you can focus on building
                your market presence. Whether you need a single category or a
                full houseware assortment, we structure programs around your
                business model.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Product Focus */}
      <section className="border-y border-border bg-muted-bg py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="What We Make"
            title="Focused product categories"
            description="We concentrate on seven houseware categories where we have deep manufacturing expertise and proven market demand."
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

      {/* Why Partner With Us */}
      <section className="py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Why Partner With Us"
            title="What sets us apart for B2B buyers"
            description="We understand the requirements of international trade — from first sample to repeat container orders."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {companyValues.map((value) => (
              <div
                key={value.title}
                className="rounded-sm border border-border bg-surface p-6"
              >
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Who We Serve */}
      <section className="border-t border-border bg-muted-bg py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Our Partners"
            title="Who we work with"
            description="Our business model is built exclusively for B2B trade channels."
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

      {/* Manufacturing & Certifications */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="Manufacturing"
                title="In-house capabilities & quality standards"
              />
              <ul className="mt-8 space-y-3">
                {manufacturingCapabilities.map((capability) => (
                  <li
                    key={capability}
                    className="flex items-start gap-3 text-sm text-muted"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                      aria-hidden="true"
                    />
                    {capability}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionHeading
                eyebrow="Compliance"
                title="Certifications & standards"
                description="We maintain certifications and testing protocols aligned with major export market requirements."
              />
              <ul className="mt-8 space-y-3">
                {certifications.map((cert) => (
                  <li
                    key={cert}
                    className="flex items-start gap-3 rounded-sm border border-border bg-muted-bg px-4 py-3 text-sm font-medium text-foreground"
                  >
                    <span className="text-gold" aria-hidden="true">
                      ✓
                    </span>
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="border-t border-gold/20 bg-accent py-16 text-accent-foreground md:py-20">
        <Container className="text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-gold">
            Get Started
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            Let&apos;s explore a partnership
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-accent-foreground/80">
            Browse our product catalog, build an inquiry list, or contact our
            team to discuss your sourcing requirements.
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
