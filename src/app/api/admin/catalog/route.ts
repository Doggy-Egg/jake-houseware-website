import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  formatCatalogFileSize,
  getCatalogFileInfo,
  uploadCatalogPdf,
} from "@/lib/supabase/catalog-pdf";

export const runtime = "nodejs";

export async function GET() {
  const info = await getCatalogFileInfo();

  if (!info) {
    return NextResponse.json({ available: false });
  }

  return NextResponse.json({
    available: true,
    fileName: info.fileName,
    fileSize: formatCatalogFileSize(info.fileSizeBytes),
    fileSizeBytes: info.fileSizeBytes,
    updatedAt: info.updatedAt,
    downloadUrl: info.downloadUrl,
    source: info.source,
  });
}

export async function POST(request: NextRequest) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "无效的上传请求" }, { status: 400 });
  }

  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: "请选择 PDF 文件" }, { status: 400 });
  }

  try {
    const info = await uploadCatalogPdf(file);
    revalidatePath("/catalog");
    revalidatePath("/");

    return NextResponse.json({
      message: "目录 PDF 已更新",
      fileName: info.fileName,
      fileSize: formatCatalogFileSize(info.fileSizeBytes),
      updatedAt: info.updatedAt,
      downloadUrl: info.downloadUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "上传失败";
    const status =
      message.includes("PDF") || message.includes("50MB") ? 400 : 500;
    return NextResponse.json({ message }, { status });
  }
}
