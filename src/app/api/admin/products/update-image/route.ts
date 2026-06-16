import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { replaceProductImageByItemNo } from "@/lib/data/product-store";
import { uploadProductImage } from "@/lib/supabase/product-images";
import {
  isAutoItemNoFilename,
  resolveBulkUploadItemNo,
} from "@/lib/utils/item-no";

function revalidateProductPages() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/collections", "layout");
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
    return NextResponse.json({ message: "未选择文件" }, { status: 400 });
  }

  const itemNoFromForm = String(formData.get("itemNo") ?? "").trim();
  const itemNo = resolveBulkUploadItemNo(file.name, itemNoFromForm);
  if (!itemNo) {
    return NextResponse.json(
      {
        message: isAutoItemNoFilename(file.name)
          ? "请填写 Item No."
          : "文件名不像已知货号格式，请手动填写 Item No.",
      },
      { status: 400 },
    );
  }

  try {
    const imageUrl = await uploadProductImage(file, { itemNo });
    const result = await replaceProductImageByItemNo({ itemNo, imageUrl });

    if (result.action === "skipped") {
      return NextResponse.json({
        action: result.action,
        itemNo: result.itemNo,
        message: result.reason,
      });
    }

    revalidateProductPages();
    return NextResponse.json({
      action: result.action,
      itemNo: result.product.itemNo,
      product: result.product,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "更新图片失败，请重试";
    return NextResponse.json({ message }, { status: 500 });
  }
}
