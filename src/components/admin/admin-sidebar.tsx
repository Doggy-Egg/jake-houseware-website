"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminCopy, adminNavigation } from "@/lib/constants/admin";
import { cn } from "@/lib/utils/cn";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-surface lg:block">
      <div className="flex h-full flex-col px-4 py-6">
        <p className="px-3 text-xs font-medium uppercase tracking-widest text-muted">
          管理菜单
        </p>
        <nav className="mt-4 space-y-1" aria-label="管理后台导航">
          {adminNavigation.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent-light text-accent"
                    : "text-foreground/80 hover:bg-muted-bg hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border pt-4">
          <Link
            href="/"
            className="block px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            {adminCopy.backToSite}
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-2 overflow-x-auto border-b border-border bg-surface px-4 py-3 lg:hidden"
      aria-label="管理后台移动导航"
    >
      {adminNavigation.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "bg-muted-bg text-foreground/80",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
