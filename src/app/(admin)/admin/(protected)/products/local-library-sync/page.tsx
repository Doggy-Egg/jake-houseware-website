import { LocalLibrarySyncPanel } from "@/components/admin/local-library-sync";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";

export default function LocalLibrarySyncPage() {
  return (
    <Container className="py-8 md:py-10">
      <LocalLibrarySyncPanel />
    </Container>
  );
}
