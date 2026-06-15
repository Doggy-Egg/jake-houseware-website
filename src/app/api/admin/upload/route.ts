import { NextRequest, NextResponse } from "next/server";
import { uploadProductImage } from "@/lib/supabase/product-images";

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

  try {
    const url = await uploadProductImage(file);
    return NextResponse.json({ url, fileName: file.name });
  } catch (error) {
    const message = error instanceof Error ? error.message : "上传失败";
    const status = message.includes("5MB") || message.includes("格式") ? 400 : 500;
    return NextResponse.json({ message }, { status });
  }
}
