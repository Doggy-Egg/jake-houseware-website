import { PublicShell } from "@/components/layout/public-shell";
import { InquiryProvider } from "@/context/inquiry/inquiry-context";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <InquiryProvider>
      <PublicShell>{children}</PublicShell>
    </InquiryProvider>
  );
}
