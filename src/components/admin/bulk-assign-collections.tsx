"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BulkActionBar } from "@/components/admin/bulk-action-bar";
import { ProductSelectionGrid } from "@/components/admin/product-selection-grid";
import { useAdminProducts } from "@/context/admin/admin-products-context";
import { collectionAdminLabels } from "@/lib/constants/admin";
import { collections, type CollectionSlug } from "@/lib/constants/collections";
import { cn } from "@/lib/utils/cn";

export function BulkAssignCollectionsForm() {
  const { products, isLoading, refreshProducts } = useAdminProducts();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [collectionSlugs, setCollectionSlugs] = useState<Set<CollectionSlug>>(
    new Set(),
  );
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ updated: number } | null>(null);
  const [error, setError] = useState("");

  const toggleCollection = (slug: CollectionSlug) => {
    setCollectionSlugs((current) => {
      const next = new Set(current);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const selectedCollectionLabels = [...collectionSlugs].map(
    (slug) => collectionAdminLabels[slug] ?? slug,
  );

  const submit = async () => {
    setError("");
    setResult(null);

    if (selectedIds.size === 0) {
      setError("请至少勾选一个产品");
      return;
    }

    if (collectionSlugs.size === 0) {
      setError("请至少选择一个系列");
      return;
    }

    if (
      !window.confirm(
        `确定为 ${selectedIds.size} 个产品添加系列：${selectedCollectionLabels.join("、")}？\n已有系列归属的产品会追加，不会覆盖原有系列。`,
      )
    ) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/products/bulk-collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: [...selectedIds],
          collectionSlugs: [...collectionSlugs],
        }),
      });

      const data = (await response.json()) as {
        updated?: number;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "操作失败");
      }

      setResult({ updated: data.updated ?? 0 });
      setSelectedIds(new Set());
      await refreshProducts();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "操作失败，请重试",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted">加载产品中…</p>;
  }

  return (
    <>
      <div className="space-y-8 pb-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              批量添加系列
            </h1>
            <p className="mt-1 text-sm text-muted">
              为选中产品添加热销 / 精品 / 新品系列归属，会追加到现有系列，不会移除已有系列。
            </p>
          </div>
          <Button href="/admin/products" variant="outline">
            返回产品列表
          </Button>
        </div>

        <section className="rounded-sm border border-border bg-surface p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">选择系列</h2>
          <div className="flex flex-wrap gap-3">
            {collections.map((collection) => {
              const selected = collectionSlugs.has(collection.slug);
              const label =
                collectionAdminLabels[collection.slug] ?? collection.name;

              return (
                <button
                  key={collection.slug}
                  type="button"
                  onClick={() => toggleCollection(collection.slug)}
                  className={cn(
                    "rounded-sm border px-4 py-2 text-sm font-medium transition-colors",
                    selected
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-surface text-foreground hover:border-accent/40",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted">
            热销 → Collections「Best Sellers」· 精品 →「Premium Collection」·
            新品 →「New Arrivals」
          </p>
        </section>

        <section className="rounded-sm border border-border bg-surface p-6">
          <ProductSelectionGrid
            products={products}
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelectedIds}
            requireCategory
          />
        </section>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {result ? (
          <div className="rounded-sm border border-border bg-muted-bg px-5 py-4 text-sm">
            <p className="font-medium text-foreground">
              已为 {result.updated} 个产品添加系列
            </p>
            <Link
              href="/admin/products"
              className="mt-3 inline-block text-accent underline-offset-4 hover:underline"
            >
              查看产品列表
            </Link>
          </div>
        ) : null}
      </div>

      <BulkActionBar
        selectedCount={selectedIds.size}
        submitting={submitting}
        onSubmit={submit}
        submitLabel={
          collectionSlugs.size > 0
            ? `为 ${selectedIds.size} 个产品添加 ${selectedCollectionLabels.join("、")}`
            : `为 ${selectedIds.size} 个产品添加系列`
        }
        disabled={collectionSlugs.size === 0}
      />
    </>
  );
}
