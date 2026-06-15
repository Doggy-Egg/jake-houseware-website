"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminProducts } from "@/context/admin/admin-products-context";
import { adminCopy, productStatusLabels } from "@/lib/constants/admin";
import { lookupTaxonomyName } from "@/lib/utils/taxonomy-lookup";
import { formatCollectionAdminLabels } from "@/lib/utils/admin-labels";
import { getProductDisplayName } from "@/lib/utils/product-display";
import type { Product } from "@/types/product";

export function AdminDashboardContent() {
  const { products, isLoading } = useAdminProducts();
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>(
    [],
  );

  useEffect(() => {
    void fetch("/api/taxonomy")
      .then((response) => response.json())
      .then((data: { categories: { slug: string; name: string }[] }) => {
        setCategories(data.categories);
      });
  }, []);

  if (isLoading) {
    return <p className="text-sm text-muted">{adminCopy.loading}</p>;
  }

  const collectionCount = products.filter(
    (product) => product.collectionSlugs.length > 0,
  ).length;
  const regularCount = products.filter(
    (product) => product.collectionSlugs.length === 0,
  ).length;
  const categoryCount = new Set(products.map((product) => product.categorySlug))
    .size;

  const stats = [
    { label: "产品总数", value: products.length },
    { label: "系列商品", value: collectionCount },
    { label: "普通商品", value: regularCount },
    { label: "已用分类", value: categoryCount },
  ];

  const recentProducts = [...products]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">概览</h1>
          <p className="mt-1 text-sm text-muted">产品目录管理总览</p>
        </div>
        <Button href="/admin/products/new">新增产品</Button>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-sm border border-border bg-surface p-5"
          >
            <dt className="text-sm text-muted">{stat.label}</dt>
            <dd className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">
              最近更新
            </h2>
          </div>
          <ul className="divide-y divide-border">
            {recentProducts.map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {getProductDisplayName(product)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{product.itemNo}</p>
                </div>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="shrink-0 text-sm font-medium text-accent hover:text-accent-hover"
                >
                  编辑
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-sm border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">
              分类分布
            </h2>
          </div>
          <ul className="divide-y divide-border">
            {categories.map((category) => {
              const count = products.filter(
                (product) => product.categorySlug === category.slug,
              ).length;

              return (
                <li
                  key={category.slug}
                  className="flex items-center justify-between px-5 py-4 text-sm"
                >
                  <span className="text-foreground">{category.name}</span>
                  <span className="font-medium text-muted">{count}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="rounded-sm border border-dashed border-border bg-surface px-5 py-4 text-sm text-muted">
        产品数据保存在 Supabase，Admin 修改会同步到前台网站。
      </div>
    </div>
  );
}

export function AdminProductsTable() {
  const { products, isLoading, deleteProduct } = useAdminProducts();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>(
    [],
  );
  const [subCategories, setSubCategories] = useState<
    { slug: string; name: string; categorySlug: string }[]
  >([]);

  useEffect(() => {
    void fetch("/api/taxonomy")
      .then((response) => response.json())
      .then(
        (data: {
          categories: { slug: string; name: string }[];
          subCategories: { slug: string; name: string; categorySlug: string }[];
        }) => {
          setCategories(data.categories);
          setSubCategories(data.subCategories);
        },
      );
  }, []);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        category === "all" || product.categorySlug === category;
      const normalized = query.trim().toLowerCase();
      const matchesQuery =
        !normalized ||
        product.name.toLowerCase().includes(normalized) ||
        getProductDisplayName(product).toLowerCase().includes(normalized) ||
        product.itemNo.toLowerCase().includes(normalized) ||
        product.slug.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [products, query, category]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(adminCopy.confirmDelete(name))) return;
    try {
      await deleteProduct(id);
    } catch {
      window.alert("删除失败，请重试");
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted">{adminCopy.loading}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">产品管理</h1>
          <p className="mt-1 text-sm text-muted">管理批发产品目录</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href="/admin/products/new">新增产品</Button>
          <Button href="/admin/products/bulk-upload" variant="outline">
            批量上传图片
          </Button>
          <Button href="/admin/products/bulk-deactivate" variant="outline">
            批量无效化
          </Button>
          <Button href="/admin/products/bulk-delete-images" variant="outline">
            批量删除图片
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索产品名称、Item No. 或 slug..."
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
      </div>

      <p className="text-sm text-muted">共 {filtered.length} 个产品</p>

      <div className="overflow-hidden rounded-sm border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-muted-bg text-xs uppercase tracking-widest text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">产品</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Sub-category</th>
                <th className="px-5 py-3 font-medium">系列</th>
                <th className="px-5 py-3 font-medium">MOQ</th>
                <th className="px-5 py-3 font-medium">状态</th>
                <th className="px-5 py-3 font-medium">更新时间</th>
                <th className="px-5 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-muted"
                  >
                    {adminCopy.noProducts}
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-muted-bg/50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">
                        {getProductDisplayName(product)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {product.itemNo} · {product.slug}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {lookupTaxonomyName(categories, product.categorySlug)}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {lookupTaxonomyName(subCategories, product.subCategorySlug) ??
                        "—"}
                    </td>
                    <td className="px-5 py-4">
                      {product.collectionSlugs.length === 0 ? (
                        <span className="text-muted">{adminCopy.regularProduct}</span>
                      ) : (
                        <span className="text-foreground">
                          {formatCollectionAdminLabels(product.collectionSlugs)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {product.moq != null
                        ? product.moq.toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {new Date(product.updatedAt).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="font-medium text-accent hover:text-accent-hover"
                        >
                          编辑
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              product.id,
                              getProductDisplayName(product),
                            )
                          }
                          className="font-medium text-muted transition-colors hover:text-foreground"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Product["status"] }) {
  const styles = {
    draft: "bg-muted-bg text-muted",
    active: "bg-emerald-50 text-emerald-700",
    inactive: "bg-amber-50 text-amber-800",
  } as const;

  return (
    <span
      className={`inline-flex rounded-sm px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {productStatusLabels[status]}
    </span>
  );
}
