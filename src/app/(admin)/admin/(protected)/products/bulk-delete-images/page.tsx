import { BulkDeleteImagesForm } from "@/components/admin/bulk-delete-images";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";

export default function BulkDeleteImagesPage() {
  return (
    <Container className="py-8 md:py-10">
      <BulkDeleteImagesForm />
    </Container>
  );
}
