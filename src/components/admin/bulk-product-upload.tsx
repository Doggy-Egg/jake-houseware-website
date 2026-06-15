"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminProducts } from "@/context/admin/admin-products-context";
import { adminCopy, productStatusLabels } from "@/lib/constants/admin";
import type { ProductCategorySlug } from "@/lib/constants/categories";
import type { ProductSubCategorySlug } from "@/lib/constants/sub-categories";
import {
  isAutoItemNoFilename,
  parseItemNoFromFilename,
  resolveBulkUploadItemNo,
} from "@/lib/utils/item-no";
import type { ProductStatus } from "@/types/product";

type TaxonomyCategory = { slug: string; name: string };
type TaxonomySubCategory = {
  slug: string;
  name: string;
  categorySlug: string;
};

type ImportResult = {
  fileName: string;
  itemNo: string;
  status: "pending" | "success" | "skipped" | "error";
  message?: string;
  action?: "created" | "updated" | "skipped";
};

type FileEntry = {
  key: string;
  file: File;
  autoItemNo: string;
  manualItemNo: string;
  needsManual: boolean;
};

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function resolveEntryItemNo(entry: FileEntry) {
  return resolveBulkUploadItemNo(entry.file.name, entry.manualItemNo);
}

export function BulkProductUploadForm() {
  const { refreshProducts } = useAdminProducts();
  const inputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [subCategories, setSubCategories] = useState<TaxonomySubCategory[]>([]);
  const [categorySlug, setCategorySlug] = useState<ProductCategorySlug | "">("");
  const [subCategorySlug, setSubCategorySlug] = useState<
    ProductSubCategorySlug | ""
  >("");
  const [status, setStatus] = useState<ProductStatus>("draft");
  const [updateExisting, setUpdateExisting] = useState(true);
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [formError, setFormError] = useState("");

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
          if (data.categories[0]) {
            setCategorySlug(data.categories[0].slug as ProductCategorySlug);
          }
        },
      );
  }, []);

  const visibleSubCategories = useMemo(
    () =>
      subCategories.filter(
        (subCategory) => subCategory.categorySlug === categorySlug,
      ),
    [subCategories, categorySlug],
  );

  const missingItemNoCount = useMemo(
    () => fileEntries.filter((entry) => !resolveEntryItemNo(entry)).length,
    [fileEntries],
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files ? Array.from(event.target.files) : [];

    setFileEntries((previous) => {
      const previousByKey = new Map(previous.map((entry) => [entry.key, entry]));

      return selected.map((file) => {
        const key = fileKey(file);
        const existing = previousByKey.get(key);
        const needsManual = !isAutoItemNoFilename(file.name);

        return {
          key,
          file,
          autoItemNo: parseItemNoFromFilename(file.name),
          manualItemNo: existing?.manualItemNo ?? "",
          needsManual,
        };
      });
    });

    setResults([]);
    setFormError("");
  };

  const updateManualItemNo = (key: string, manualItemNo: string) => {
    setFileEntries((previous) =>
      previous.map((entry) =>
        entry.key === key ? { ...entry, manualItemNo } : entry,
      ),
    );
    setFormError("");
  };

  const handleUpload = async () => {
    if (!categorySlug || fileEntries.length === 0) return;

    const unresolved = fileEntries.filter((entry) => !resolveEntryItemNo(entry));
    if (unresolved.length > 0) {
      setFormError(`还有 ${unresolved.length} 个文件未填写 Item No.`);
      return;
    }

    setFormError("");
    setUploading(true);
    setResults(
      fileEntries.map((entry) => ({
        fileName: entry.file.name,
        itemNo: resolveEntryItemNo(entry),
        status: "pending",
      })),
    );

    const nextResults: ImportResult[] = [];

    for (const entry of fileEntries) {
      const itemNo = resolveEntryItemNo(entry);
      const formData = new FormData();
      formData.append("file", entry.file);
      formData.append("itemNo", itemNo);
      formData.append("categorySlug", categorySlug);
      if (subCategorySlug) {
        formData.append("subCategorySlug", subCategorySlug);
      }
      formData.append("status", status);
      formData.append("updateExisting", String(updateExisting));

      try {
        const response = await fetch("/api/admin/products/import-image", {
          method: "POST",
          body: formData,
        });
        const data = (await response.json()) as {
          action?: "created" | "updated" | "skipped";
          itemNo?: string;
          message?: string;
        };

        if (!response.ok) {
          nextResults.push({
            fileName: entry.file.name,
            itemNo,
            status: "error",
            message: data.message ?? "导入失败",
          });
        } else if (data.action === "skipped") {
          nextResults.push({
            fileName: entry.file.name,
            itemNo: data.itemNo ?? itemNo,
            status: "skipped",
            action: "skipped",
            message: data.message,
          });
        } else {
          nextResults.push({
            fileName: entry.file.name,
            itemNo: data.itemNo ?? itemNo,
            status: "success",
            action: data.action,
          });
        }
      } catch {
        nextResults.push({
          fileName: entry.file.name,
          itemNo,
          status: "error",
          message: "网络错误",
        });
      }

      setResults([...nextResults]);
    }

    setUploading(false);
    await refreshProducts();
  };

  const successCount = results.filter((row) => row.status === "success").length;
  const skippedCount = results.filter((row) => row.status === "skipped").length;
  const errorCount = results.filter((row) => row.status === "error").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">批量上传产品图片</h1>
          <p className="mt-1 text-sm text-muted">
            文件名以 <code>JK</code> 或 <code>JH</code> 开头时，自动识别为 Item No.（如{" "}
            <code>JK-803.jpg</code>）。其他文件名需在下表手动填写货号。
          </p>
        </div>
        <Button href="/admin/products" variant="outline">
          返回产品列表
        </Button>
      </div>

      <div className="rounded-sm border border-border bg-surface p-6 space-y-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label
              htmlFor="bulk-category"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Category <span className="text-red-600">*</span>
            </label>
            <select
              id="bulk-category"
              value={categorySlug}
              onChange={(event) => {
                setCategorySlug(event.target.value as ProductCategorySlug);
                setSubCategorySlug("");
              }}
              className="h-11 w-full rounded-sm border border-border bg-surface px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="bulk-sub-category"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Sub-category ({adminCopy.optional})
            </label>
            <select
              id="bulk-sub-category"
              value={subCategorySlug}
              onChange={(event) =>
                setSubCategorySlug(
                  event.target.value as ProductSubCategorySlug | "",
                )
              }
              className="h-11 w-full rounded-sm border border-border bg-surface px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">不指定</option>
              {visibleSubCategories.map((subCategory) => (
                <option key={subCategory.slug} value={subCategory.slug}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="bulk-status"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              默认状态
            </label>
            <select
              id="bulk-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as ProductStatus)
              }
              className="h-11 w-full rounded-sm border border-border bg-surface px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {Object.entries(productStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-start gap-3 pt-8 text-sm text-foreground">
            <input
              type="checkbox"
              checked={updateExisting}
              onChange={(event) => setUpdateExisting(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border"
            />
            <span>
              若 Item No. 已存在，更新图片并归入所选 Category
              <span className="mt-1 block text-xs text-muted">
                未勾选时，重复 Item No. 的文件会被跳过
              </span>
            </span>
          </label>
        </div>

        <div className="space-y-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              选择图片
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={
                uploading ||
                !categorySlug ||
                fileEntries.length === 0 ||
                missingItemNoCount > 0
              }
            >
              {uploading
                ? `上传中 (${results.length}/${fileEntries.length})...`
                : `开始导入 (${fileEntries.length})`}
            </Button>
          </div>
          <p className="text-xs text-muted">
            支持 JPG、PNG、WebP、GIF，单张最大 5MB。图片上传至 Supabase Storage。
          </p>
          {formError ? (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          ) : null}
          {missingItemNoCount > 0 ? (
            <p className="text-sm text-amber-700">
              还有 {missingItemNoCount} 个文件需要手动填写 Item No.
            </p>
          ) : null}
        </div>
      </div>

      {fileEntries.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            待导入 ({fileEntries.length})
          </h2>
          <div className="overflow-hidden rounded-sm border border-border bg-surface">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-muted-bg text-xs uppercase tracking-widest text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">文件名</th>
                  <th className="px-5 py-3 font-medium">Item No.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fileEntries.map((entry) => {
                  const resolvedItemNo = resolveEntryItemNo(entry);

                  return (
                    <tr key={entry.key}>
                      <td className="px-5 py-3">{entry.file.name}</td>
                      <td className="px-5 py-3">
                        {entry.needsManual ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={entry.manualItemNo}
                              onChange={(event) =>
                                updateManualItemNo(entry.key, event.target.value)
                              }
                              placeholder="手动填写货号，如 JK-803"
                              className="h-10 w-full max-w-xs rounded-sm border border-amber-300 bg-amber-50/50 px-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                            {!resolvedItemNo ? (
                              <p className="text-xs text-amber-700">
                                文件名不是 JK/JH 开头，需手动填写
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <div>
                            <span className="font-medium">{entry.autoItemNo}</span>
                            <p className="mt-0.5 text-xs text-muted">来自文件名</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {results.length > 0 ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <h2 className="font-semibold uppercase tracking-widest text-muted">
              导入结果
            </h2>
            <span className="text-muted">
              成功 {successCount} · 跳过 {skippedCount} · 失败 {errorCount}
            </span>
            {!uploading ? (
              <Link
                href="/admin/products"
                className="text-accent underline-offset-4 hover:underline"
              >
                查看产品列表
              </Link>
            ) : null}
          </div>
          <div className="overflow-hidden rounded-sm border border-border bg-surface">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-muted-bg text-xs uppercase tracking-widest text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Item No.</th>
                  <th className="px-5 py-3 font-medium">结果</th>
                  <th className="px-5 py-3 font-medium">说明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.map((row) => (
                  <tr key={row.fileName}>
                    <td className="px-5 py-3 font-medium">{row.itemNo || "—"}</td>
                    <td className="px-5 py-3">
                      {row.status === "pending" && "处理中…"}
                      {row.status === "success" &&
                        (row.action === "updated" ? "已更新" : "已创建")}
                      {row.status === "skipped" && "已跳过"}
                      {row.status === "error" && "失败"}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {row.message ?? row.fileName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
