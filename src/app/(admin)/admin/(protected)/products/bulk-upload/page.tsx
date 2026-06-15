import { BulkProductUploadForm } from "@/components/admin/bulk-product-upload";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";

export default function BulkProductUploadPage() {
  return (
    <Container className="py-8 md:py-10">
      <BulkProductUploadForm />
    </Container>
  );
}
