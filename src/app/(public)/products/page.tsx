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
import { filterProducts } from "@/lib/data/queries";
import { readCategories } from "@/lib/constants/categories";
import { readSubCategoriesWithProducts } from "@/lib/constants/sub-categories";
import type { ProductCategorySlug } from "@/lib/constants/categories";
import type { ProductSubCategorySlug } from "@/lib/constants/sub-categories";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
    subCategory?: string;
    q?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category as ProductCategorySlug | undefined;
  const subCategory = params.subCategory as ProductSubCategorySlug | undefined;
  const query = params.q ?? null;
  const categories = await readCategories();
  const subCategories = await readSubCategoriesWithProducts();

  const products = await filterProducts({
    category: category ?? null,
    subCategory: subCategory ?? null,
    query,
  });

  return (
    <Container as="main" className="py-16 md:py-20">
      <SectionHeading
        eyebrow="Catalog"
        title="Products"
        description="Browse our wholesale houseware catalog. Filter by category, sub-category, or search by product name and Item No."
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
          {products.length} product{products.length === 1 ? "" : "s"}
        </p>

        <ProductGrid products={products} />
      </div>
    </Container>
  );
}
