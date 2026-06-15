"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminProducts } from "@/context/admin/admin-products-context";
import { parseItemNoList } from "@/lib/utils/item-no";
import type { ProductCategorySlug } from "@/lib/constants/categories";

type TaxonomyCategory = { slug: string; name: string };

export function BulkDeactivateProductsForm() {
  const { refreshProducts } = useAdminProducts();
  const [itemNosText, setItemNosText] = useState("");
  const [categorySlug, setCategorySlug] = useState<ProductCategorySlug | "">("");
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    updated: number;
    notFound: string[];
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/taxonomy")
      .then((response) => response.json())
      .then((data: { categories: TaxonomyCategory[] }) => {
        setCategories(data.categories);
      });
  }, []);

  const parsedCount = useMemo(
    () => parseItemNoList(itemNosText).length,
    [itemNosText],
  );

  const submit = async (mode: "itemNos" | "category") => {
    setError("");
    setResult(null);

    if (mode === "category" && !categorySlug) {
      setError("请选择 Category");
      return;
    }

    if (mode === "itemNos" && parsedCount === 0) {
      setError("请粘贴至少一个 Item No.");
      return;
    }

    const confirmMessage =
      mode === "category"
        ? `确定将该分类下全部 ${categories.find((c) => c.slug === categorySlug)?.name ?? ""} 产品设为「已下架」？前台将不再显示。`
        : `确定将 ${parsedCount} 个产品设为「已下架」？前台将不再显示。`;

    if (!window.confirm(confirmMessage)) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/products/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "inactive",
          itemNosText: mode === "itemNos" ? itemNosText : undefined,
          categorySlug: mode === "category" ? categorySlug : undefined,
        }),
      });

      const data = (await response.json()) as {
        updated?: number;
        notFound?: string[];
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "操作失败");
      }

      setResult({
        updated: data.updated ?? 0,
        notFound: data.notFound ?? [],
      });
      if (mode === "itemNos") {
        setItemNosText("");
      }
      await refreshProducts();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "操作失败，请重试",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">批量无效化产品</h1>
          <p className="mt-1 text-sm text-muted">
            设为「已下架」后前台不可见，数据仍保留在数据库，可随时在编辑页恢复。
          </p>
        </div>
        <Button href="/admin/products" variant="outline">
          返回产品列表
        </Button>
      </div>

      <section className="rounded-sm border border-border bg-surface p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">按 Item No.</h2>
        <textarea
          value={itemNosText}
          onChange={(event) => setItemNosText(event.target.value)}
          rows={10}
          placeholder={"每行一个 Item No.\nJH-BW-001\nJK-803\nJK007-green"}
          className="w-full rounded-sm border border-border bg-surface px-4 py-3 text-sm font-mono focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            disabled={submitting || parsedCount === 0}
            onClick={() => submit("itemNos")}
          >
            {submitting ? "处理中…" : `下架 ${parsedCount || 0} 个产品`}
          </Button>
          {parsedCount > 0 ? (
            <span className="text-xs text-muted">已识别 {parsedCount} 个 Item No.</span>
          ) : null}
        </div>
      </section>

      <section className="rounded-sm border border-border bg-surface p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">或：整个 Category</h2>
        <select
          value={categorySlug}
          onChange={(event) =>
            setCategorySlug(event.target.value as ProductCategorySlug | "")
          }
          className="h-11 w-full max-w-md rounded-sm border border-border bg-surface px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">选择 Category</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          disabled={submitting || !categorySlug}
          onClick={() => submit("category")}
        >
          下架该分类下全部产品
        </Button>
      </section>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="rounded-sm border border-border bg-muted-bg px-5 py-4 text-sm">
          <p className="font-medium text-foreground">
            已下架 {result.updated} 个产品
          </p>
          {result.notFound.length > 0 ? (
            <p className="mt-2 text-muted">
              未找到 {result.notFound.length} 个 Item No.：
              {result.notFound.join("、")}
            </p>
          ) : null}
          <Link
            href="/admin/products"
            className="mt-3 inline-block text-accent underline-offset-4 hover:underline"
          >
            查看产品列表
          </Link>
        </div>
      ) : null}
    </div>
  );
}
