"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductSelectionGrid } from "@/components/admin/product-selection-grid";
import { useAdminProducts } from "@/context/admin/admin-products-context";

export function BulkDeleteProductsForm() {
  const { products, isLoading, refreshProducts } = useAdminProducts();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ deleted: number } | null>(null);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    setResult(null);

    if (selectedIds.size === 0) {
      setError("请至少勾选一个产品");
      return;
    }

    if (
      !window.confirm(
        `确定永久删除 ${selectedIds.size} 个产品？\n\n将同时删除产品信息、图片及 Storage 文件，此操作不可恢复。`,
      )
    ) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/products/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: [...selectedIds],
        }),
      });

      const data = (await response.json()) as {
        deleted?: number;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "操作失败");
      }

      setResult({ deleted: data.deleted ?? 0 });
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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">批量删除产品</h1>
          <p className="mt-1 text-sm text-muted">
            勾选产品后永久删除。产品信息、图片及 Storage 文件将全部移除，不可恢复。
          </p>
        </div>
        <Button href="/admin/products" variant="outline">
          返回产品列表
        </Button>
      </div>

      <section className="rounded-sm border border-border bg-surface p-6 space-y-6">
        <ProductSelectionGrid
          products={products}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
        />

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <Button
            type="button"
            variant="outline"
            disabled={submitting || selectedIds.size === 0}
            onClick={submit}
            className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
          >
            {submitting
              ? "处理中…"
              : `永久删除 ${selectedIds.size} 个产品`}
          </Button>
        </div>
      </section>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="rounded-sm border border-border bg-muted-bg px-5 py-4 text-sm">
          <p className="font-medium text-foreground">
            已删除 {result.deleted} 个产品
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
  );
}
