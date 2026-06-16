import { BulkUpdateImagesForm } from "@/components/admin/bulk-update-images";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";

export default function BulkUpdateImagesPage() {
  return (
    <Container className="py-8 md:py-10">
      <BulkUpdateImagesForm />
    </Container>
  );
}
