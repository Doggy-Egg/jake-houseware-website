import { NextResponse } from "next/server";
import { getCategoryUsage } from "@/lib/data/taxonomy-store";

export async function GET() {
  return NextResponse.json({ categories: getCategoryUsage() });
}
