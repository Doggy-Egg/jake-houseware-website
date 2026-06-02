import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/contact-form";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact JAKE HOUSEWARE for wholesale pricing, samples, and B2B partnership inquiries. Serving importers, wholesalers, and retailers worldwide.",
};

const contactDetails = [
  {
    label: "Email",
    value: "info@jakehouseware.com",
    href: "mailto:info@jakehouseware.com",
  },
  {
    label: "Phone",
    value: "+86 XXX XXXX XXXX",
  },
  {
    label: "Location",
    value: "Guangdong, China",
  },
  {
    label: "Business Hours",
    value: "Mon – Fri, 9:00 – 18:00 (GMT+8)",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-border bg-muted-bg">
        <Container as="main" className="py-16 md:py-20">
          <div className="max-w-3xl">
            <SectionHeading
              eyebrow="Get in Touch"
              title="Contact Us"
              description="Reach out for wholesale pricing, product samples, OEM/ODM projects, or long-term partnership discussions."
            />
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_380px] lg:gap-20">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Send us a message
              </h2>
              <p className="mt-2 text-sm text-muted">
                Complete the form below and our export team will get back to you.
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>

            <aside>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Contact information
              </h2>
              <ul className="mt-6 space-y-5">
                {contactDetails.map((item) => (
                  <li key={item.label}>
                    <p className="text-xs font-medium uppercase tracking-widest text-muted">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="mt-1 block text-sm text-foreground transition-colors hover:text-accent"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-foreground">
                        {item.value}
                      </p>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-10 rounded-sm border border-border bg-muted-bg p-6">
                <p className="text-sm font-medium text-foreground">
                  B2B inquiries only
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  We work exclusively with importers, wholesalers, and
                  retailers. Minimum order quantities apply to all product lines.
                </p>
              </div>

              <div className="mt-6 rounded-sm border border-border bg-muted-bg p-6">
                <p className="text-sm font-medium text-foreground">
                  Prefer to browse first?
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Explore our online catalog and add products to your inquiry
                  list before requesting a quote.
                </p>
                <Link
                  href="/products"
                  className="mt-3 inline-block text-sm font-medium text-accent hover:text-accent-hover"
                >
                  Browse Products →
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
