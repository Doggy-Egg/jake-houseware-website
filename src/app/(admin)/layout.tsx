import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理后台登录",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
