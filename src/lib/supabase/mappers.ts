import type { CollectionSlug } from "@/lib/constants/collections";
import type { ProductCategorySlug } from "@/lib/constants/categories";
import type { ProductSubCategorySlug } from "@/lib/constants/sub-categories";
import type { Product, ProductStatus } from "@/types/product";
import type { Category, SubCategory } from "@/types/taxonomy";

export type ProductRow = {
  id: string;
  slug: string;
  item_no: string;
  name: string;
  description: string | null;
  category_slug: string;
  sub_category_slug: string | null;
  collection_slugs: string[] | null;
  images: string[] | null;
  thumbnail: string | null;
  material: string | null;
  dimensions: string | null;
  moq: number | null;
  packaging: string | null;
  lead_time: string | null;
  keywords: string[] | null;
  weight: string | null;
  carton_size: string | null;
  qty_per_carton: number | null;
  cbm: number | string | null;
  factory: string | null;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  slug: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SubCategoryRow = {
  slug: string;
  name: string;
  category_slug: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function optionalNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    itemNo: row.item_no,
    name: row.name,
    description: row.description ?? undefined,
    categorySlug: row.category_slug as ProductCategorySlug,
    subCategorySlug: (row.sub_category_slug ?? undefined) as
      | ProductSubCategorySlug
      | undefined,
    collectionSlugs: (row.collection_slugs ?? []) as CollectionSlug[],
    images: row.images ?? [],
    thumbnail: row.thumbnail ?? undefined,
    material: row.material ?? undefined,
    dimensions: row.dimensions ?? undefined,
    moq: row.moq ?? undefined,
    packaging: row.packaging ?? undefined,
    leadTime: row.lead_time ?? undefined,
    keywords: row.keywords ?? undefined,
    weight: row.weight ?? undefined,
    cartonSize: row.carton_size ?? undefined,
    qtyPerCarton: row.qty_per_carton ?? undefined,
    cbm: optionalNumber(row.cbm),
    factory: row.factory ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toProductRow(product: Product): ProductRow {
  return {
    id: product.id,
    slug: product.slug,
    item_no: product.itemNo,
    name: product.name,
    description: product.description ?? null,
    category_slug: product.categorySlug,
    sub_category_slug: product.subCategorySlug ?? null,
    collection_slugs: product.collectionSlugs ?? [],
    images: product.images ?? [],
    thumbnail: product.thumbnail ?? null,
    material: product.material ?? null,
    dimensions: product.dimensions ?? null,
    moq: product.moq ?? null,
    packaging: product.packaging ?? null,
    lead_time: product.leadTime ?? null,
    keywords: product.keywords ?? null,
    weight: product.weight ?? null,
    carton_size: product.cartonSize ?? null,
    qty_per_carton: product.qtyPerCarton ?? null,
    cbm: product.cbm ?? null,
    factory: product.factory ?? null,
    status: product.status,
    created_at: product.createdAt,
    updated_at: product.updatedAt,
  };
}

export function mapCategoryRow(row: CategoryRow): Category {
  return {
    slug: row.slug,
    name: row.name,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toCategoryRow(category: Category): CategoryRow {
  return {
    slug: category.slug,
    name: category.name,
    sort_order: category.sortOrder,
    created_at: category.createdAt,
    updated_at: category.updatedAt,
  };
}

export function mapSubCategoryRow(row: SubCategoryRow): SubCategory {
  return {
    slug: row.slug,
    name: row.name,
    categorySlug: row.category_slug,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toSubCategoryRow(subCategory: SubCategory): SubCategoryRow {
  return {
    slug: subCategory.slug,
    name: subCategory.name,
    category_slug: subCategory.categorySlug,
    sort_order: subCategory.sortOrder,
    created_at: subCategory.createdAt,
    updated_at: subCategory.updatedAt,
  };
}
