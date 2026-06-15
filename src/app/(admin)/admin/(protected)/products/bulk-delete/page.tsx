import { BulkDeleteProductsForm } from "@/components/admin/bulk-delete-products";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";

export default function BulkDeleteProductsPage() {
  return (
    <Container className="py-8 md:py-10">
      <BulkDeleteProductsForm />
    </Container>
  );
}
