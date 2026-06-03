import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteCategory, updateCategory } from "@/lib/data/taxonomy-store";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function revalidateTaxonomyPages() {
  revalidatePath("/products");
  revalidatePath("/", "layout");
  revalidatePath("/collections", "layout");
  revalidatePath("/about");
  revalidatePath("/catalog");
  revalidatePath("/admin/products");
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  let body: { name?: string; newSlug?: string };

  try {
    body = (await request.json()) as { name?: string; newSlug?: string };
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  const category = await updateCategory(slug, body);
  if (!category) {
    return NextResponse.json({ message: "Category not found." }, { status: 404 });
  }

  revalidateTaxonomyPages();
  return NextResponse.json({ category });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const result = await deleteCategory(slug);

  if (!result.ok) {
    return NextResponse.json({ message: result.reason }, { status: 409 });
  }

  revalidateTaxonomyPages();
  return NextResponse.json({ success: true });
}
