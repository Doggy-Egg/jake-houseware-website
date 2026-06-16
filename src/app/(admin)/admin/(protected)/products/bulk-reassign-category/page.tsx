import { BulkReassignCategoryProductsForm } from "@/components/admin/bulk-reassign-category-products";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";

export default function BulkReassignCategoryProductsPage() {
  return (
    <Container className="py-8 md:py-10">
      <BulkReassignCategoryProductsForm />
    </Container>
  );
}
