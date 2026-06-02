import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createCategory } from "@/lib/data/taxonomy-store";

function revalidateTaxonomyPages() {
  revalidatePath("/products");
  revalidatePath("/", "layout");
  revalidatePath("/collections", "layout");
  revalidatePath("/about");
  revalidatePath("/catalog");
}

export async function POST(request: NextRequest) {
  let body: { name?: string; slug?: string };

  try {
    body = (await request.json()) as { name?: string; slug?: string };
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ message: "Category name is required." }, { status: 400 });
  }

  const category = createCategory({
    name: body.name,
    slug: body.slug,
  });

  revalidateTaxonomyPages();
  return NextResponse.json({ category }, { status: 201 });
}
