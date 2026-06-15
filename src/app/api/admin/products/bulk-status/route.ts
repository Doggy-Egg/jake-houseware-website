import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { bulkSetProductStatus } from "@/lib/data/product-store";
import { categoryExists } from "@/lib/data/taxonomy-queries";
import { parseItemNoList } from "@/lib/utils/item-no";
import type { ProductStatus } from "@/types/product";

function revalidateProductPages() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/collections", "layout");
}

export async function POST(request: NextRequest) {
  let body: {
    itemNosText?: string;
    categorySlug?: string;
    status?: ProductStatus;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  const status = body.status ?? "inactive";
  if (!["draft", "active", "inactive"].includes(status)) {
    return NextResponse.json({ message: "Invalid status." }, { status: 400 });
  }

  const itemNos = body.itemNosText
    ? parseItemNoList(body.itemNosText)
    : undefined;
  const categorySlug = body.categorySlug?.trim();

  if (!categorySlug && (!itemNos || itemNos.length === 0)) {
    return NextResponse.json(
      { message: "请粘贴 Item No. 或选择 Category。" },
      { status: 400 },
    );
  }

  if (categorySlug && !(await categoryExists(categorySlug))) {
    return NextResponse.json({ message: "Category 不存在。" }, { status: 400 });
  }

  try {
    const result = await bulkSetProductStatus({
      status,
      itemNos: categorySlug ? undefined : itemNos,
      categorySlug: categorySlug || undefined,
    });

    revalidateProductPages();
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "批量更新失败";
    return NextResponse.json({ message }, { status: 500 });
  }
}
