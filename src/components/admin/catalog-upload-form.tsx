"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type CatalogMeta = {
  available: boolean;
  fileName?: string;
  fileSize?: string;
  updatedAt?: string;
  downloadUrl?: string;
  source?: string;
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("zh-CN", { hour12: false });
  } catch {
    return iso;
  }
}

export function CatalogUploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [meta, setMeta] = useState<CatalogMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadMeta = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/catalog");
      const data = (await response.json()) as CatalogMeta;
      setMeta(data);
    } catch {
      setError("无法加载当前目录信息");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMeta();
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setMessage("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/catalog", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as CatalogMeta & { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "上传失败");
      }

      setMessage(data.message ?? "目录 PDF 已更新");
      await loadMeta();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "上传失败",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">产品目录 PDF</h1>
          <p className="mt-1 text-sm text-muted">
            上传后，前台 Catalog 页和首页「Download Catalog」将提供此 PDF 下载。
            单文件最大 50MB。
          </p>
        </div>
        <Button href="/catalog" variant="outline" target="_blank">
          查看前台页面
        </Button>
      </div>

      <section className="rounded-sm border border-border bg-surface p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          当前文件
        </h2>

        {loading ? (
          <p className="text-sm text-muted">加载中…</p>
        ) : meta?.available ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">文件名</dt>
              <dd className="mt-1 font-medium">{meta.fileName}</dd>
            </div>
            <div>
              <dt className="text-muted">大小</dt>
              <dd className="mt-1 font-medium">{meta.fileSize}</dd>
            </div>
            <div>
              <dt className="text-muted">更新时间</dt>
              <dd className="mt-1 font-medium">{formatDate(meta.updatedAt)}</dd>
            </div>
            <div>
              <dt className="text-muted">存储</dt>
              <dd className="mt-1 font-medium">
                {meta.source === "supabase" ? "Supabase" : "本地 public/catalog"}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-muted">
            尚未上传目录 PDF。请上传后前台才会显示下载按钮。
          </p>
        )}

        {meta?.available && meta.downloadUrl ? (
          <Link
            href={meta.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium text-accent hover:text-accent-hover"
          >
            打开当前 PDF →
          </Link>
        ) : null}
      </section>

      <section className="rounded-sm border border-border bg-surface p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          上传 / 替换
        </h2>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "上传中…" : "选择 PDF 并上传"}
        </Button>
        <p className="text-xs text-muted">
          新文件会替换现有目录。请在 Supabase 执行{" "}
          <code>002_catalog_pdf.sql</code> 创建 <code>catalog-files</code>{" "}
          存储桶（若尚未执行）。
        </p>
      </section>

      {message ? (
        <p className="text-sm text-emerald-700" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
