import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { upsertProductImageByItemNo } from "@/lib/data/product-store";
import { categoryExists } from "@/lib/data/taxonomy-queries";
import { uploadProductImage } from "@/lib/supabase/product-images";
import { resolveBulkUploadItemNo, isAutoItemNoFilename } from "@/lib/utils/item-no";
import type { ProductCategorySlug } from "@/lib/constants/categories";
import type { ProductSubCategorySlug } from "@/lib/constants/sub-categories";
import type { ProductStatus } from "@/types/product";

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
  const categorySlug = String(formData.get("categorySlug") ?? "").trim();
  const subCategorySlug = String(formData.get("subCategorySlug") ?? "").trim();
  const status = String(formData.get("status") ?? "draft").trim() as ProductStatus;
  const updateExisting = formData.get("updateExisting") === "true";

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: "未选择文件" }, { status: 400 });
  }

  if (!categorySlug) {
    return NextResponse.json({ message: "请选择 Category" }, { status: 400 });
  }

  if (!(await categoryExists(categorySlug))) {
    return NextResponse.json({ message: "Category 不存在" }, { status: 400 });
  }

  const itemNoFromForm = String(formData.get("itemNo") ?? "").trim();
  const itemNo = resolveBulkUploadItemNo(file.name, itemNoFromForm);
  if (!itemNo) {
    return NextResponse.json(
      {
        message: isAutoItemNoFilename(file.name)
          ? "请填写 Item No."
          : "文件名不是 JK/JH 开头的货号，请手动填写 Item No.",
      },
      { status: 400 },
    );
  }

  try {
    const imageUrl = await uploadProductImage(file, { itemNo });
    const result = await upsertProductImageByItemNo({
      itemNo,
      categorySlug: categorySlug as ProductCategorySlug,
      subCategorySlug: (subCategorySlug || undefined) as
        | ProductSubCategorySlug
        | undefined,
      imageUrl,
      status,
      updateExisting,
    });

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
      error instanceof Error ? error.message : "导入失败，请重试";
    const statusCode = message.includes("already used") ? 409 : 500;
    return NextResponse.json({ message }, { status: statusCode });
  }
}
