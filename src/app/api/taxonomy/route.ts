import { NextResponse } from "next/server";
import { readCategories, readSubCategories } from "@/lib/data/taxonomy-queries";

export async function GET() {
  return NextResponse.json({
    categories: readCategories(),
    subCategories: readSubCategories(),
  });
}
