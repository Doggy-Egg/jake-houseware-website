import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePublicCatalog } from "@/lib/cache/revalidate-public";
import { collections, type CollectionSlug } from "@/lib/constants/collections";
import { bulkAddProductCollections } from "@/lib/data/product-store";

const validSlugs = new Set<CollectionSlug>(collections.map((item) => item.slug));

function isCollectionSlug(value: string): value is CollectionSlug {
  return validSlugs.has(value as CollectionSlug);
}

function revalidateProductPages() {
  revalidatePublicCatalog();
  for (const collection of collections) {
    revalidatePath(`/collections/${collection.slug}`);
  }
}

export async function POST(request: NextRequest) {
  let body: {
    productIds?: string[];
    collectionSlugs?: string[];
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  const productIds = body.productIds?.filter(Boolean) ?? [];
  const collectionSlugs = (body.collectionSlugs ?? []).filter(isCollectionSlug);

  if (productIds.length === 0) {
    return NextResponse.json(
      { message: "请至少选择一个产品" },
      { status: 400 },
    );
  }

  if (collectionSlugs.length === 0) {
    return NextResponse.json(
      { message: "请至少选择一个系列（热销 / 精品 / 新品）" },
      { status: 400 },
    );
  }

  try {
    const result = await bulkAddProductCollections({
      productIds,
      collectionSlugs,
    });

    revalidateProductPages();
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "批量添加系列失败";
    return NextResponse.json({ message }, { status: 500 });
  }
}
