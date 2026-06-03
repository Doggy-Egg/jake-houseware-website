import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteSubCategory, updateSubCategory } from "@/lib/data/taxonomy-store";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function revalidateTaxonomyPages() {
  revalidatePath("/products");
  revalidatePath("/admin/products");
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  let body: { name?: string; newSlug?: string; categorySlug?: string };

  try {
    body = (await request.json()) as {
      name?: string;
      newSlug?: string;
      categorySlug?: string;
    };
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  const subCategory = await updateSubCategory(slug, body);
  if (!subCategory) {
    return NextResponse.json({ message: "Sub-category not found." }, { status: 404 });
  }

  revalidateTaxonomyPages();
  return NextResponse.json({ subCategory });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const result = await deleteSubCategory(slug);

  if (!result.ok) {
    return NextResponse.json({ message: result.reason }, { status: 409 });
  }

  revalidateTaxonomyPages();
  return NextResponse.json({ success: true });
}
