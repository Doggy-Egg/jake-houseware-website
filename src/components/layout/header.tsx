"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { InquiryNavLink } from "@/components/inquiry/add-to-inquiry-button";
import { Logo } from "@/components/layout/logo";
import { Container } from "@/components/ui/container";
import { mainNavigation } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "text-sm font-medium transition-colors",
        isActive
          ? "text-accent"
          : "text-foreground/80 hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </>
      ) : (
        <>
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </>
      )}
    </svg>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6 md:h-[4.5rem]">
          <Logo height={32} className="md:hidden" />
          <Logo height={38} className="hidden md:inline-flex" />

          <nav
            className="hidden items-center gap-8 lg:flex"
            aria-label="Main navigation"
          >
            {mainNavigation.map((item) =>
              item.href === "/inquiry" ? (
                <InquiryNavLink key={item.href} />
              ) : (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                />
              ),
            )}
          </nav>

          <div className="flex items-center gap-3 lg:hidden">
            <InquiryNavLink compact />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-foreground"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((open) => !open)}
            >
              <MenuIcon open={mobileOpen} />
            </button>
          </div>
        </div>
      </Container>

      {mobileOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-border bg-surface lg:hidden"
          aria-label="Mobile navigation"
        >
          <Container className="flex flex-col gap-1 py-4">
            {mainNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-sm px-3 py-3 text-sm font-medium transition-colors",
                  pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href))
                    ? "bg-muted-bg text-accent"
                    : "text-foreground hover:bg-muted-bg",
                )}
              >
                {item.label}
              </Link>
            ))}
          </Container>
        </nav>
      ) : null}
    </header>
  );
}
