import { NextRequest, NextResponse } from "next/server";
import { slugify } from "@/lib/utils/slug";
import { createSupabaseAdmin } from "@/lib/supabase/server";

const BUCKET = "product-images";
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
  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.storage.from(BUCKET).upload(fileName, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

  return NextResponse.json({
    url: publicUrl,
    fileName,
  });
}
