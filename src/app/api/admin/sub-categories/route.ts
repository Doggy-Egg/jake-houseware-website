import { NextRequest, NextResponse } from "next/server";
import { revalidateTaxonomyPages } from "@/lib/cache/revalidate-public";
import { createSubCategory } from "@/lib/data/taxonomy-store";

export async function POST(request: NextRequest) {
  let body: { name?: string; slug?: string; categorySlug?: string };

  try {
    body = (await request.json()) as {
      name?: string;
      slug?: string;
      categorySlug?: string;
    };
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  if (!body.name?.trim() || !body.categorySlug?.trim()) {
    return NextResponse.json(
      { message: "Sub-category name and parent category are required." },
      { status: 400 },
    );
  }

  const subCategory = await createSubCategory({
    name: body.name,
    slug: body.slug,
    categorySlug: body.categorySlug,
  });

  if (!subCategory) {
    return NextResponse.json({ message: "Parent category not found." }, { status: 404 });
  }

  revalidateTaxonomyPages();
  return NextResponse.json({ subCategory }, { status: 201 });
}
