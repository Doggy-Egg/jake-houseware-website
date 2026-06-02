import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Container } from "@/components/ui/container";
import { mainNavigation } from "@/lib/constants/navigation";
import { siteConfig } from "@/lib/constants/site";

const footerLinks = mainNavigation.filter(
  (item) => item.href !== "/",
);

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t-4 border-gold bg-accent text-accent-foreground">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo height={34} />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-accent-foreground/75">
              {siteConfig.description}
            </p>
            <p className="mt-4 text-sm text-accent-foreground/65">
              Serving importers, wholesalers, and retailers worldwide.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
              Navigation
            </p>
            <ul className="mt-4 space-y-3">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-accent-foreground/85 transition-colors hover:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
              Contact
            </p>
            <ul className="mt-4 space-y-3 text-sm text-accent-foreground/85">
              <li>
                <a
                  href="mailto:info@jakehouseware.com"
                  className="transition-colors hover:text-gold"
                >
                  info@jakehouseware.com
                </a>
              </li>
              <li>+86 XXX XXXX XXXX</li>
              <li>Guangdong, China</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-gold/20 pt-8 text-sm text-accent-foreground/60 md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>B2B inquiries only. Minimum order quantities apply.</p>
        </div>
      </Container>
    </footer>
  );
}
