"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdminProducts } from "@/context/admin/admin-products-context";
import {
  isAutoItemNoFilename,
  parseItemNoFromFilename,
  resolveBulkUploadItemNo,
} from "@/lib/utils/item-no";
import {
  formatAdminUploadFetchError,
  readAdminUploadResponse,
} from "@/lib/utils/admin-upload-response";

type UpdateResult = {
  fileName: string;
  itemNo: string;
  status: "pending" | "success" | "skipped" | "error";
  message?: string;
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

export function BulkUpdateImagesForm() {
  const { refreshProducts } = useAdminProducts();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UpdateResult[]>([]);
  const [formError, setFormError] = useState("");

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
    if (fileEntries.length === 0) return;

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

    const nextResults: UpdateResult[] = [];

    for (const entry of fileEntries) {
      const itemNo = resolveEntryItemNo(entry);
      const formData = new FormData();
      formData.append("file", entry.file);
      formData.append("itemNo", itemNo);

      try {
        const response = await fetch("/api/admin/products/update-image", {
          method: "POST",
          body: formData,
        });
        const { ok, data, message } = await readAdminUploadResponse(response);

        if (!ok) {
          nextResults.push({
            fileName: entry.file.name,
            itemNo,
            status: "error",
            message: message || "更新失败",
          });
        } else if (data.action === "skipped") {
          nextResults.push({
            fileName: entry.file.name,
            itemNo: data.itemNo ?? itemNo,
            status: "skipped",
            message: data.message,
          });
        } else {
          nextResults.push({
            fileName: entry.file.name,
            itemNo: data.itemNo ?? itemNo,
            status: "success",
          });
        }
      } catch (error) {
        nextResults.push({
          fileName: entry.file.name,
          itemNo,
          status: "error",
          message: formatAdminUploadFetchError(error),
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
          <h1 className="text-2xl font-semibold tracking-tight">批量更新图片</h1>
          <p className="mt-1 text-sm text-muted">
            仅更新<strong>已存在</strong>的产品。文件名即 Item No.（JK/JH/BA/WA/SH/M 等货号开头自动识别），
            上传后会压缩为 JPG（最长边 1200px）并替换该产品全部旧图。
          </p>
        </div>
        <Button href="/admin/products" variant="outline">
          返回产品列表
        </Button>
      </div>

      <div className="rounded-sm border border-border bg-surface p-6 space-y-6">
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
                fileEntries.length === 0 ||
                missingItemNoCount > 0
              }
            >
              {uploading
                ? `更新中 (${results.length}/${fileEntries.length})...`
                : `开始更新 (${fileEntries.length})`}
            </Button>
          </div>
          <p className="text-xs text-muted">
            支持 JPG、PNG、WebP、GIF，单张最大 5MB。不存在的 Item No. 会跳过；GIF 不压缩。
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
            待更新 ({fileEntries.length})
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
                                文件名不像已知货号格式，需手动填写
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
              更新结果
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
                      {row.status === "success" && "已更新"}
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
