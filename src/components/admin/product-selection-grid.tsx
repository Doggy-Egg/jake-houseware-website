"use client";

import { useEffect, useMemo, useState } from "react";
import { getProductPrimaryImage } from "@/lib/utils/product-image";
import { getProductDisplayName } from "@/lib/utils/product-display";
import { productStatusLabels, categoryAdminLabels, subCategoryAdminLabels } from "@/lib/constants/admin";
import { cn } from "@/lib/utils/cn";
import type { Product, ProductStatus } from "@/types/product";

type TaxonomyCategory = { slug: string; name: string };
type TaxonomySubCategory = {
  slug: string;
  name: string;
  categorySlug: string;
};

function matchesProductFilters(
  product: Product,
  options: {
    category: string;
    subCategory: string;
    statusFilter: "all" | ProductStatus;
    query: string;
    requireImage: boolean;
  },
) {
  if (options.requireImage && !getProductPrimaryImage(product)) {
    return false;
  }

  if (options.category !== "all" && product.categorySlug !== options.category) {
    return false;
  }

  if (options.subCategory === "__none__") {
    if (product.subCategorySlug) {
      return false;
    }
  } else if (
    options.subCategory !== "all" &&
    product.subCategorySlug !== options.subCategory
  ) {
    return false;
  }

  if (options.statusFilter !== "all" && product.status !== options.statusFilter) {
    return false;
  }

  const normalized = options.query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return (
    product.itemNo.toLowerCase().includes(normalized) ||
    getProductDisplayName(product).toLowerCase().includes(normalized) ||
    product.slug.toLowerCase().includes(normalized)
  );
}

type ProductSelectionGridProps = {
  products: Product[];
  selectedIds: Set<string>;
  onSelectedIdsChange: (ids: Set<string>) => void;
  /** Only list products that have at least one image. */
  requireImage?: boolean;
  /** Must pick a category before showing products. */
  requireCategory?: boolean;
};

export function ProductSelectionGrid({
  products,
  selectedIds,
  onSelectedIdsChange,
  requireImage = false,
  requireCategory = false,
}: ProductSelectionGridProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(requireCategory ? "" : "all");
  const [subCategory, setSubCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>("all");
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [subCategories, setSubCategories] = useState<TaxonomySubCategory[]>([]);

  useEffect(() => {
    void fetch("/api/taxonomy")
      .then((response) => response.json())
      .then(
        (data: {
          categories: TaxonomyCategory[];
          subCategories: TaxonomySubCategory[];
        }) => {
          setCategories(data.categories);
          setSubCategories(data.subCategories);
        },
      );
  }, []);

  const visibleSubCategories = useMemo(
    () =>
      category === "all" || !category
        ? []
        : subCategories.filter((item) => item.categorySlug === category),
    [subCategories, category],
  );

  const filtered = useMemo(() => {
    return products.filter((product) =>
      matchesProductFilters(product, {
        category,
        subCategory,
        statusFilter,
        query,
        requireImage,
      }),
    );
  }, [products, query, category, subCategory, statusFilter, requireImage]);

  const categorySelected = !requireCategory || (category !== "" && category !== "all");

  const scopeProductCount = useMemo(() => {
    if (!categorySelected || category === "all") {
      return 0;
    }

    return products.filter((product) =>
      matchesProductFilters(product, {
        category,
        subCategory: "all",
        statusFilter: "all",
        query: "",
        requireImage,
      }),
    ).length;
  }, [products, category, categorySelected, requireImage]);

  const visibleIds = useMemo(
    () => filtered.map((product) => product.id),
    [filtered],
  );

  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedIds.has(id));

  const toggleProduct = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectedIdsChange(next);
  };

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      const next = new Set(selectedIds);
      for (const id of visibleIds) {
        next.delete(id);
      }
      onSelectedIdsChange(next);
      return;
    }

    const next = new Set(selectedIds);
    for (const id of visibleIds) {
      next.add(id);
    }
    onSelectedIdsChange(next);
  };

  const clearSelection = () => {
    onSelectedIdsChange(new Set());
  };

  const categoryLabel = (slug: string) =>
    categoryAdminLabels[slug] ?? categories.find((item) => item.slug === slug)?.name ?? slug;

  const subCategoryLabel = (slug: string) =>
    subCategoryAdminLabels[slug] ??
    subCategories.find((item) => item.slug === slug)?.name ??
    slug;

  const handleCategoryChange = (nextCategory: string) => {
    setCategory(nextCategory);
    setSubCategory("all");
  };

  const hasActiveFilters =
    subCategory !== "all" || statusFilter !== "all" || query.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className={requireCategory ? "w-full sm:max-w-xs" : "w-full sm:flex-1"}>
            <label
              htmlFor="product-grid-category"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Category {requireCategory ? <span className="text-red-600">*</span> : null}
            </label>
            <select
              id="product-grid-category"
              value={category}
              onChange={(event) => handleCategoryChange(event.target.value)}
              className="h-11 w-full rounded-sm border border-border bg-surface px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {requireCategory ? (
                <option value="">请选择 Category</option>
              ) : (
                <option value="all">全部分类</option>
              )}
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {categoryLabel(item.slug)}
                </option>
              ))}
            </select>
          </div>

          {categorySelected ? (
            <>
              <div className="w-full sm:max-w-xs">
                <label
                  htmlFor="product-grid-sub-category"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Sub-category
                </label>
                <select
                  id="product-grid-sub-category"
                  value={subCategory}
                  onChange={(event) => setSubCategory(event.target.value)}
                  disabled={category === "all"}
                  className="h-11 w-full rounded-sm border border-border bg-surface px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="all">全部 Sub-category</option>
                  <option value="__none__">未指定 Sub-category</option>
                  {visibleSubCategories.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {subCategoryLabel(item.slug)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:flex-1">
                <label
                  htmlFor="product-grid-search"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  搜索
                </label>
                <input
                  id="product-grid-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Item No.、名称或 slug…"
                  className="h-11 w-full rounded-sm border border-border bg-surface px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div className="w-full sm:max-w-[160px]">
                <label
                  htmlFor="product-grid-status"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  状态
                </label>
                <select
                  id="product-grid-status"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as "all" | ProductStatus)
                  }
                  className="h-11 w-full rounded-sm border border-border bg-surface px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="all">全部状态</option>
                  <option value="active">上架中</option>
                  <option value="inactive">已下架</option>
                  <option value="draft">草稿</option>
                </select>
              </div>
            </>
          ) : null}
        </div>

        {requireCategory && !categorySelected ? (
          <p className="text-sm text-muted">
            请先选择 Category，再按 Sub-category 筛选并勾选产品。
          </p>
        ) : null}

        {categorySelected && category !== "all" ? (
          <p className="text-sm text-muted">
            {categoryLabel(category)} 共 {scopeProductCount} 个产品
            {hasActiveFilters ? ` · 当前筛选显示 ${filtered.length} 个` : null}
            {subCategory !== "all" ? (
              <span>
                {" "}
                · Sub:{" "}
                {subCategory === "__none__"
                  ? "未指定"
                  : subCategoryLabel(subCategory)}
              </span>
            ) : null}
          </p>
        ) : null}
      </div>

      {!categorySelected ? (
        <div className="rounded-sm border border-dashed border-border bg-muted-bg px-6 py-16 text-center text-sm text-muted">
          请选择 Category 查看产品
        </div>
      ) : (
        <>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">
          显示 {filtered.length} 个 · 已选 {selectedIds.size} 个
        </span>
        <button
          type="button"
          onClick={toggleAllVisible}
          disabled={filtered.length === 0}
          className="font-medium text-accent hover:text-accent-hover disabled:text-muted"
        >
          {allVisibleSelected ? "取消全选当前列表" : "全选当前列表"}
        </button>
        {selectedIds.size > 0 ? (
          <button
            type="button"
            onClick={clearSelection}
            className="font-medium text-muted hover:text-foreground"
          >
            清空选择
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border bg-muted-bg px-6 py-16 text-center text-sm text-muted">
          没有符合条件的产品
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((product) => {
            const image = getProductPrimaryImage(product);
            const selected = selectedIds.has(product.id);

            return (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  className={cn(
                    "group w-full overflow-hidden rounded-sm border text-left transition-colors",
                    selected
                      ? "border-accent ring-2 ring-accent"
                      : "border-border hover:border-accent/40",
                  )}
                >
                  <div className="relative aspect-square bg-white">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt={getProductDisplayName(product)}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted">
                        无图片
                      </div>
                    )}
                    <span
                      className={cn(
                        "absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-sm border bg-surface text-xs font-bold shadow-sm",
                        selected
                          ? "border-accent bg-accent text-white"
                          : "border-border text-transparent group-hover:text-muted",
                      )}
                      aria-hidden
                    >
                      ✓
                    </span>
                    <StatusPill status={product.status} />
                  </div>
                  <div className="space-y-0.5 border-t border-border bg-surface px-3 py-2">
                    <p className="truncate text-xs font-medium text-foreground">
                      {product.itemNo}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {getProductDisplayName(product)}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
        </>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: ProductStatus }) {
  const styles = {
    draft: "bg-muted-bg text-muted",
    active: "bg-emerald-50 text-emerald-700",
    inactive: "bg-amber-50 text-amber-800",
  } as const;

  return (
    <span
      className={cn(
        "absolute right-2 top-2 rounded-sm px-1.5 py-0.5 text-[10px] font-medium",
        styles[status],
      )}
    >
      {productStatusLabels[status]}
    </span>
  );
}
