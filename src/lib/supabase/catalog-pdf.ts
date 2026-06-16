import "server-only";

import fs from "fs";
import path from "path";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export const CATALOG_BUCKET = "catalog-files";
export const CATALOG_OBJECT_PATH = "jake-houseware-catalog.pdf";
export const MAX_CATALOG_PDF_SIZE = 50 * 1024 * 1024;

export type CatalogFileInfo = {
  downloadUrl: string;
  fileName: string;
  fileSizeBytes: number;
  updatedAt: string;
  source: "supabase" | "local";
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatCatalogFileSize(bytes: number): string {
  return formatFileSize(bytes);
}

const LOCAL_CATALOG_CANDIDATES = [
  path.join(process.cwd(), "public/catalog", "jake-houseware-catalog.pdf"),
  path.join(process.cwd(), "public/catalog", "jake-houseware-catalog-2026.pdf"),
];

function getLocalCatalogInfo(): CatalogFileInfo | null {
  for (const filePath of LOCAL_CATALOG_CANDIDATES) {
    try {
      const stat = fs.statSync(filePath);
      if (stat.size < 1024) {
        continue;
      }

      const fileName = path.basename(filePath);
      return {
        downloadUrl: `/catalog/${fileName}`,
        fileName,
        fileSizeBytes: stat.size,
        updatedAt: stat.mtime.toISOString(),
        source: "local",
      };
    } catch {
      continue;
    }
  }

  return null;
}

export async function getCatalogFileInfo(): Promise<CatalogFileInfo | null> {
  try {
    const supabase = createSupabaseAdmin();
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(CATALOG_BUCKET)
      .download(CATALOG_OBJECT_PATH);

    if (!downloadError && fileData) {
      const buffer = Buffer.from(await fileData.arrayBuffer());
      const { data: listed } = await supabase.storage
        .from(CATALOG_BUCKET)
        .list("", { search: CATALOG_OBJECT_PATH });

      const {
        data: { publicUrl },
      } = supabase.storage.from(CATALOG_BUCKET).getPublicUrl(CATALOG_OBJECT_PATH);

      const meta = listed?.find((item) => item.name === CATALOG_OBJECT_PATH);

      return {
        downloadUrl: publicUrl,
        fileName: CATALOG_OBJECT_PATH,
        fileSizeBytes: buffer.length,
        updatedAt:
          meta?.updated_at ?? meta?.created_at ?? new Date().toISOString(),
        source: "supabase",
      };
    }
  } catch (error) {
    console.warn("[catalog] Supabase lookup failed:", error);
  }

  return getLocalCatalogInfo();
}

export async function uploadCatalogPdf(file: File): Promise<CatalogFileInfo> {
  if (file.type !== "application/pdf") {
    throw new Error("仅支持 PDF 格式");
  }

  if (file.size > MAX_CATALOG_PDF_SIZE) {
    throw new Error("PDF 大小不能超过 50MB");
  }

  const supabase = createSupabaseAdmin();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(CATALOG_BUCKET)
    .upload(CATALOG_OBJECT_PATH, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const info = await getCatalogFileInfo();
  if (!info) {
    throw new Error("上传成功但无法读取文件信息");
  }

  return info;
}
