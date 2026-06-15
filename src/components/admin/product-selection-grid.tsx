"use client";

import { useEffect, useMemo, useState } from "react";
import { getProductPrimaryImage } from "@/lib/utils/product-image";
import { getProductDisplayName } from "@/lib/utils/product-display";
import { productStatusLabels } from "@/lib/constants/admin";
import { cn } from "@/lib/utils/cn";
import type { Product, ProductStatus } from "@/types/product";

type TaxonomyCategory = { slug: string; name: string };

type ProductSelectionGridProps = {
  products: Product[];
  selectedIds: Set<string>;
  onSelectedIdsChange: (ids: Set<string>) => void;
  /** Only list products that have at least one image. */
  requireImage?: boolean;
};

export function ProductSelectionGrid({
  products,
  selectedIds,
  onSelectedIdsChange,
  requireImage = false,
}: ProductSelectionGridProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>("all");
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);

  useEffect(() => {
    void fetch("/api/taxonomy")
      .then((response) => response.json())
      .then((data: { categories: TaxonomyCategory[] }) => {
        setCategories(data.categories);
      });
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return products.filter((product) => {
      if (requireImage && !getProductPrimaryImage(product)) {
        return false;
      }

      if (category !== "all" && product.categorySlug !== category) {
        return false;
      }

      if (statusFilter !== "all" && product.status !== statusFilter) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return (
        product.itemNo.toLowerCase().includes(normalized) ||
        getProductDisplayName(product).toLowerCase().includes(normalized) ||
        product.slug.toLowerCase().includes(normalized)
      );
    });
  }, [products, query, category, statusFilter, requireImage]);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索 Item No.、名称或 slug…"
          className="h-11 flex-1 rounded-sm border border-border bg-surface px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-11 rounded-sm border border-border bg-surface px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="all">全部分类</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "all" | ProductStatus)
          }
          className="h-11 rounded-sm border border-border bg-surface px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="all">全部状态</option>
          <option value="active">上架中</option>
          <option value="inactive">已下架</option>
          <option value="draft">草稿</option>
        </select>
      </div>

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
