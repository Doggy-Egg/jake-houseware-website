import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  ActiveFilterLabel,
  CategoryFilter,
  ProductSearch,
  SubCategoryFilter,
} from "@/components/products/product-filters";
import { ProductGrid } from "@/components/products/product-card";
import { ProductPagination } from "@/components/products/product-pagination";
import { filterProductsPaginated } from "@/lib/data/queries";
import { readCategories } from "@/lib/constants/categories";
import { readSubCategoriesWithProducts } from "@/lib/constants/sub-categories";
import type { ProductCategorySlug } from "@/lib/constants/categories";
import type { ProductSubCategorySlug } from "@/lib/constants/sub-categories";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
    subCategory?: string;
    q?: string;
    page?: string;
  }>;
};

export const dynamic = "force-dynamic";

function parsePageParam(value?: string) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category as ProductCategorySlug | undefined;
  const subCategory = params.subCategory as ProductSubCategorySlug | undefined;
  const query = params.q?.trim() || null;
  const page = parsePageParam(params.page);
  const categories = await readCategories();
  const subCategories = await readSubCategoriesWithProducts();

  const { products, total, page: currentPage, pageSize, totalPages } =
    await filterProductsPaginated({
      category: category ?? null,
      subCategory: subCategory ?? null,
      query,
      page,
    });

  return (
    <Container as="main" className="py-16 md:py-20">
      <SectionHeading
        eyebrow="Catalog"
        title="Products"
        description="Browse our wholesale houseware catalog. Filter by category, sub-category, or search by Item No."
      />

      <div className="mt-10 space-y-6">
        <Suspense fallback={null}>
          <ProductSearch />
        </Suspense>

        <Suspense fallback={null}>
          <CategoryFilter categories={categories} />
        </Suspense>

        <Suspense fallback={null}>
          <SubCategoryFilter subCategories={subCategories} />
        </Suspense>

        <ActiveFilterLabel
          categories={categories}
          subCategories={subCategories}
          category={category ?? null}
          subCategory={subCategory ?? null}
          query={query}
        />

        <p className="text-sm text-muted">
          {total} product{total === 1 ? "" : "s"}
          {totalPages > 1 ? ` · Page ${currentPage} of ${totalPages}` : ""}
        </p>

        <ProductGrid products={products} />

        <ProductPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          category={category}
          subCategory={subCategory}
          query={query ?? undefined}
        />
      </div>
    </Container>
  );
}
