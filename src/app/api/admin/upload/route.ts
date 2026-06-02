import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { slugify } from "@/lib/utils/slug";

const UPLOAD_DIR = path.join(process.cwd(), "public/images/products");
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

export async function POST(request: NextRequest) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "无效的上传请求" }, { status: 400 });
  }

  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: "未选择文件" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { message: "仅支持 JPG、PNG、WebP、GIF 格式" },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { message: "图片大小不能超过 5MB" },
      { status: 400 },
    );
  }

  const originalBase = slugify(
    file.name.replace(/\.[^.]+$/, "") || "product-image",
  );
  const extension = ALLOWED_TYPES.get(file.type)!;
  const fileName = `${originalBase}-${Date.now()}${extension}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, fileName), buffer);

  return NextResponse.json({
    url: `/images/products/${fileName}`,
    fileName,
  });
}
