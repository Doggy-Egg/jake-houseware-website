import { CatalogUploadForm } from "@/components/admin/catalog-upload-form";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";

export default function AdminCatalogPage() {
  return (
    <Container className="py-8 md:py-10">
      <CatalogUploadForm />
    </Container>
  );
}
