import { BulkDeactivateProductsForm } from "@/components/admin/bulk-deactivate-products";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";

export default function BulkDeactivateProductsPage() {
  return (
    <Container className="py-8 md:py-10">
      <BulkDeactivateProductsForm />
    </Container>
  );
}
