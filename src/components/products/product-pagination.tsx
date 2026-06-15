import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type ProductPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  category?: string;
  subCategory?: string;
  query?: string;
};

function buildPageHref(
  page: number,
  options: Omit<ProductPaginationProps, "currentPage" | "totalPages" | "totalItems" | "pageSize">,
) {
  const params = new URLSearchParams();

  if (options.category) {
    params.set("category", options.category);
  }

  if (options.subCategory) {
    params.set("subCategory", options.subCategory);
  }

  if (options.query) {
    params.set("q", options.query);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export function ProductPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  category,
  subCategory,
  query,
}: ProductPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const pageOptions = {
    category,
    subCategory,
    query,
  };

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      aria-label="Product pagination"
      className="flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-muted">
        Showing {start}–{end} of {totalItems}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {currentPage > 1 ? (
          <PaginationLink href={buildPageHref(currentPage - 1, pageOptions)}>
            Previous
          </PaginationLink>
        ) : (
          <span className="rounded-sm border border-border px-3 py-1.5 text-sm text-muted">
            Previous
          </span>
        )}

        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-muted"
            >
              …
            </span>
          ) : (
            <PaginationLink
              key={page}
              href={buildPageHref(page, pageOptions)}
              active={page === currentPage}
            >
              {page}
            </PaginationLink>
          ),
        )}

        {currentPage < totalPages ? (
          <PaginationLink href={buildPageHref(currentPage + 1, pageOptions)}>
            Next
          </PaginationLink>
        ) : (
          <span className="rounded-sm border border-border px-3 py-1.5 text-sm text-muted">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}

function PaginationLink({
  href,
  children,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-sm border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-surface text-foreground hover:border-accent/40 hover:bg-muted-bg",
      )}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];

  if (currentPage > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);
  return pages;
}
