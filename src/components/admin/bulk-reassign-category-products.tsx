"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductSelectionGrid } from "@/components/admin/product-selection-grid";
import { useAdminProducts } from "@/context/admin/admin-products-context";
import {
  categoryAdminLabels,
  subCategoryAdminLabels,
} from "@/lib/constants/admin";
import type { ProductCategorySlug } from "@/lib/constants/categories";
import type { ProductSubCategorySlug } from "@/lib/constants/sub-categories";

type TaxonomyCategory = { slug: string; name: string };
type TaxonomySubCategory = {
  slug: string;
  name: string;
  categorySlug: string;
};

function taxonomyLabel(
  slug: string,
  labels: Record<string, string>,
  items: { slug: string; name: string }[],
) {
  return labels[slug] ?? items.find((item) => item.slug === slug)?.name ?? slug;
}

export function BulkReassignCategoryProductsForm() {
  const { products, isLoading, refreshProducts } = useAdminProducts();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ updated: number; skipped: number } | null>(
    null,
  );
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [subCategories, setSubCategories] = useState<TaxonomySubCategory[]>([]);
  const [targetCategory, setTargetCategory] = useState<ProductCategorySlug | "">(
    "",
  );
  const [targetSubCategory, setTargetSubCategory] = useState<
    ProductSubCategorySlug | ""
  >("");

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

  const targetSubCategories = useMemo(
    () =>
      subCategories.filter(
        (subCategory) => subCategory.categorySlug === targetCategory,
      ),
    [subCategories, targetCategory],
  );

  const submit = async () => {
    setError("");
    setResult(null);

    if (selectedIds.size === 0) {
      setError("请至少勾选一个产品");
      return;
    }

    if (!targetCategory) {
      setError("请选择目标 Category");
      return;
    }

    const categoryName = taxonomyLabel(targetCategory, categoryAdminLabels, categories);
    const subCategoryName = targetSubCategory
      ? taxonomyLabel(targetSubCategory, subCategoryAdminLabels, subCategories)
      : "不指定";

    if (
      !window.confirm(
        `确定将 ${selectedIds.size} 个产品转移到「${categoryName} › ${subCategoryName}」？`,
      )
    ) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/products/bulk-reassign-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: [...selectedIds],
          categorySlug: targetCategory,
          subCategorySlug: targetSubCategory || null,
        }),
      });

      const data = (await response.json()) as {
        updated?: number;
        skipped?: number;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "操作失败");
      }

      setResult({
        updated: data.updated ?? 0,
        skipped: data.skipped ?? 0,
      });
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

  const showBar = selectedIds.size > 0 || submitting;

  return (
    <>
      <div className="space-y-8 pb-32">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              批量转移分类
            </h1>
            <p className="mt-1 text-sm text-muted">
              先按当前 Category / Sub-category 筛选并勾选产品，再在底部选择目标分类并转移。
              例如：从「其他酒具配件」选中所有 Wine Pourer，转移到新建的 Sub-category。
            </p>
          </div>
          <Button href="/admin/products" variant="outline">
            返回产品列表
          </Button>
        </div>

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
              已转移 {result.updated} 个产品
              {result.skipped > 0 ? `（${result.skipped} 个未找到，已跳过）` : ""}
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

      {showBar ? (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-sm"
          role="region"
          aria-label="批量转移分类"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <p className="text-sm text-muted sm:pb-2.5">
                已选{" "}
                <span className="font-medium text-foreground">
                  {selectedIds.size}
                </span>{" "}
                个 · 转移到
              </p>
              <div className="w-full sm:w-48">
                <label
                  htmlFor="target-category"
                  className="mb-1 block text-xs font-medium text-muted"
                >
                  Category
                </label>
                <select
                  id="target-category"
                  value={targetCategory}
                  onChange={(event) => {
                    setTargetCategory(
                      event.target.value as ProductCategorySlug | "",
                    );
                    setTargetSubCategory("");
                  }}
                  className="h-10 w-full rounded-sm border border-border bg-surface px-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">选择 Category</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {taxonomyLabel(
                        category.slug,
                        categoryAdminLabels,
                        categories,
                      )}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-52">
                <label
                  htmlFor="target-sub-category"
                  className="mb-1 block text-xs font-medium text-muted"
                >
                  Sub-category（可选）
                </label>
                <select
                  id="target-sub-category"
                  value={targetSubCategory}
                  onChange={(event) =>
                    setTargetSubCategory(
                      event.target.value as ProductSubCategorySlug | "",
                    )
                  }
                  disabled={!targetCategory}
                  className="h-10 w-full rounded-sm border border-border bg-surface px-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">不指定</option>
                  {targetSubCategories.map((subCategory) => (
                    <option key={subCategory.slug} value={subCategory.slug}>
                      {taxonomyLabel(
                        subCategory.slug,
                        subCategoryAdminLabels,
                        subCategories,
                      )}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button
              type="button"
              disabled={
                submitting || selectedIds.size === 0 || !targetCategory
              }
              onClick={submit}
            >
              {submitting
                ? "转移中…"
                : `转移 ${selectedIds.size} 个产品`}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
