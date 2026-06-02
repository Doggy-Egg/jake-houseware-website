import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  deleteProduct,
  updateProduct,
  type ProductInput,
} from "@/lib/data/product-store";

function revalidateProductPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/products");
  if (slug) revalidatePath(`/products/${slug}`);
  revalidatePath("/collections", "layout");
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  let body: ProductInput;

  try {
    body = (await request.json()) as ProductInput;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    const product = updateProduct(id, body);
    if (!product) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    revalidateProductPages(product.slug);
    return NextResponse.json({ product });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update product.";
    const status = message.includes("already used") ? 409 : 400;
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const deleted = deleteProduct(id);

  if (!deleted) {
    return NextResponse.json({ message: "Product not found." }, { status: 404 });
  }

  revalidateProductPages();
  return NextResponse.json({ success: true });
}
