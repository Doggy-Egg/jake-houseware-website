import { EmailSetupPanel } from "@/components/admin/email-setup-panel";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";

export default function AdminEmailPage() {
  return (
    <Container className="py-8 md:py-10">
      <EmailSetupPanel />
    </Container>
  );
}
