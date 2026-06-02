import { AdminProductsTable } from "@/components/admin/admin-products";
import { Container } from "@/components/ui/container";

export default function AdminProductsPage() {
  return (
    <Container className="py-8 md:py-10">
      <AdminProductsTable />
    </Container>
  );
}
