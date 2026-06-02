import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { InquiryListContent } from "@/components/inquiry/inquiry-list";

export default function InquiryPage() {
  return (
    <Container as="main" className="py-16 md:py-20">
      <SectionHeading
        eyebrow="Quote Request"
        title="Inquiry List"
        description="Review your selected products, adjust quantities, and submit a wholesale inquiry when ready."
      />
      <div className="mt-10">
        <InquiryListContent />
      </div>
    </Container>
  );
}
