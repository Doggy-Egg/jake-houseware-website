import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  createProduct,
  readProducts,
  type ProductInput,
} from "@/lib/data/product-store";

function revalidateProductPages() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/collections", "layout");
}

export async function GET() {
  return NextResponse.json({ products: await readProducts() });
}

export async function POST(request: NextRequest) {
  let body: ProductInput;

  try {
    body = (await request.json()) as ProductInput;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  if (!body.itemNo?.trim()) {
    return NextResponse.json({ message: "itemNo is required." }, { status: 400 });
  }

  try {
    const product = await createProduct(body);
    revalidateProductPages();
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create product.";
    const status = message.includes("already used") ? 409 : 400;
    return NextResponse.json({ message }, { status });
  }
}
