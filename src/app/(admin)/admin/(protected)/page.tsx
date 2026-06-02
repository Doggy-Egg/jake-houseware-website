import { AdminDashboardContent } from "@/components/admin/admin-products";
import { Container } from "@/components/ui/container";

export default function AdminDashboardPage() {
  return (
    <Container className="py-8 md:py-10">
      <AdminDashboardContent />
    </Container>
  );
}
