import { BulkAssignCollectionsForm } from "@/components/admin/bulk-assign-collections";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";

export default function BulkAssignCollectionsPage() {
  return (
    <Container className="py-8 md:py-10">
      <BulkAssignCollectionsForm />
    </Container>
  );
}
