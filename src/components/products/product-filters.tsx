"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils/cn";

export type TaxonomyCategory = {
  slug: string;
  name: string;
};

export type TaxonomySubCategory = {
  slug: string;
  name: string;
  categorySlug: string;
};

type CategoryFilterProps = {
  categories: TaxonomyCategory[];
};

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const [, startTransition] = useTransition();

  const setCategory = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    params.delete("subCategory");
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <FilterPill
        active={!activeCategory}
        onClick={() => setCategory(null)}
        label="All"
      />
      {categories.map((category) => (
        <FilterPill
          key={category.slug}
          active={activeCategory === category.slug}
          onClick={() => setCategory(category.slug)}
          label={category.name}
        />
      ))}
    </div>
  );
}

type SubCategoryFilterProps = {
  subCategories: TaxonomySubCategory[];
};

export function SubCategoryFilter({ subCategories }: SubCategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const activeSubCategory = searchParams.get("subCategory");
  const [, startTransition] = useTransition();

  if (!activeCategory) return null;

  const visibleSubCategories = subCategories.filter(
    (subCategory) => subCategory.categorySlug === activeCategory,
  );

  if (visibleSubCategories.length === 0) return null;

  const setSubCategory = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("subCategory", slug);
    } else {
      params.delete("subCategory");
    }
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-widest text-muted">
        Sub-category
      </p>
      <div className="flex flex-wrap gap-2">
        <FilterPill
          active={!activeSubCategory}
          onClick={() => setSubCategory(null)}
          label="All"
          size="sm"
        />
        {visibleSubCategories.map((subCategory) => (
          <FilterPill
            key={subCategory.slug}
            active={activeSubCategory === subCategory.slug}
            onClick={() => setSubCategory(subCategory.slug)}
            label={subCategory.name}
            size="sm"
          />
        ))}
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  size = "md",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-sm border font-medium transition-colors",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-surface text-foreground/80 hover:border-accent/30 hover:bg-muted-bg",
      )}
    >
      {label}
    </button>
  );
}

export function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  const updateQuery = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      startTransition(() => {
        router.push(`/products?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      const current = searchParams.get("q") ?? "";
      if (query !== current) {
        updateQuery(query);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, searchParams, updateQuery]);

  return (
    <div className="relative max-w-md">
      <label htmlFor="product-search" className="sr-only">
        Search products
      </label>
      <input
        id="product-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name or Item No..."
        className="flex h-11 w-full rounded-sm border border-border bg-surface px-4 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}

export function ActiveFilterLabel({
  categories,
  subCategories,
  category,
  subCategory,
  query,
}: {
  categories: TaxonomyCategory[];
  subCategories: TaxonomySubCategory[];
  category: string | null;
  subCategory: string | null;
  query: string | null;
}) {
  if (!category && !subCategory && !query) return null;

  const categoryName = category
    ? categories.find((item) => item.slug === category)?.name
    : null;
  const subCategoryName = subCategory
    ? subCategories.find((item) => item.slug === subCategory)?.name
    : null;

  return (
    <p className="text-sm text-muted">
      Showing results
      {categoryName ? (
        <>
          {" "}
          in <span className="font-medium text-foreground">{categoryName}</span>
        </>
      ) : null}
      {subCategoryName ? (
        <>
          {" "}
          ›{" "}
          <span className="font-medium text-foreground">{subCategoryName}</span>
        </>
      ) : null}
      {query ? (
        <>
          {" "}
          for{" "}
          <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
        </>
      ) : null}
      {" · "}
      <Link
        href="/products"
        className="font-medium text-accent hover:text-accent-hover"
      >
        Clear filters
      </Link>
    </p>
  );
}
