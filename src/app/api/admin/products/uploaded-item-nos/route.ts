import { NextResponse } from "next/server";
import { readProducts } from "@/lib/data/product-store";
import { normalizeItemNoKey } from "@/lib/utils/slug";

export async function GET() {
  try {
    const products = await readProducts();
    const itemNos = products.map((product) => ({
      itemNo: product.itemNo,
      key: normalizeItemNoKey(product.itemNo),
      hasImage: product.images.length > 0,
      status: product.status,
    }));

    return NextResponse.json({
      total: itemNos.length,
      withImage: itemNos.filter((row) => row.hasImage).length,
      withoutImage: itemNos.filter((row) => !row.hasImage).length,
      itemNos,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "读取已上传货号失败";
    return NextResponse.json({ message }, { status: 500 });
  }
}
