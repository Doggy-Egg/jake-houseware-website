import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { bulkDeleteProducts } from "@/lib/data/product-store";

function revalidateProductPages() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/collections", "layout");
}

export async function POST(request: NextRequest) {
  let body: { productIds?: string[] };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  const productIds = body.productIds?.filter(Boolean) ?? [];

  if (productIds.length === 0) {
    return NextResponse.json(
      { message: "请至少选择一个产品。" },
      { status: 400 },
    );
  }

  try {
    const result = await bulkDeleteProducts(productIds);
    revalidateProductPages();
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "批量删除产品失败";
    return NextResponse.json({ message }, { status: 500 });
  }
}
