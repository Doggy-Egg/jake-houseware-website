import { BulkPublishProductsForm } from "@/components/admin/bulk-publish-products";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";

export default function BulkPublishProductsPage() {
  return (
    <Container className="py-8 md:py-10">
      <BulkPublishProductsForm />
    </Container>
  );
}
