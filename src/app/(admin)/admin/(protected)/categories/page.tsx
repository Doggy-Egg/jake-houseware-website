import { AdminCategoriesContent } from "@/components/admin/admin-categories";
import { Container } from "@/components/ui/container";
import { getCategoryUsage } from "@/lib/data/taxonomy-store";

export const dynamic = "force-dynamic";

export default function AdminCategoriesPage() {
  const categories = getCategoryUsage();

  return (
    <Container className="py-8 md:py-10">
      <AdminCategoriesContent initialCategories={categories} />
    </Container>
  );
}
