import { NextRequest, NextResponse } from "next/server";
import { revalidatePublicCatalog } from "@/lib/cache/revalidate-public";
import { bulkReassignProductCategory } from "@/lib/data/product-store";
import type { ProductCategorySlug } from "@/lib/constants/categories";
import type { ProductSubCategorySlug } from "@/lib/constants/sub-categories";

function revalidateProductPages() {
  revalidatePublicCatalog();
}

export async function POST(request: NextRequest) {
  let body: {
    productIds?: string[];
    categorySlug?: string;
    subCategorySlug?: string | null;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  const productIds = body.productIds?.filter(Boolean) ?? [];
  const categorySlug = body.categorySlug?.trim();

  if (productIds.length === 0) {
    return NextResponse.json(
      { message: "请至少选择一个产品" },
      { status: 400 },
    );
  }

  if (!categorySlug) {
    return NextResponse.json(
      { message: "请选择目标 Category" },
      { status: 400 },
    );
  }

  const subCategorySlug =
    body.subCategorySlug === null || body.subCategorySlug === ""
      ? null
      : body.subCategorySlug?.trim();

  try {
    const result = await bulkReassignProductCategory({
      productIds,
      categorySlug: categorySlug as ProductCategorySlug,
      subCategorySlug: subCategorySlug as ProductSubCategorySlug | null,
    });

    revalidateProductPages();
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "批量转移分类失败";
    return NextResponse.json({ message }, { status: 500 });
  }
}
