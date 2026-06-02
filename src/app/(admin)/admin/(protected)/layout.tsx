import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminProductsProvider } from "@/context/admin/admin-products-context";
import { readProducts } from "@/lib/data/product-store";

export const metadata: Metadata = {
  title: "管理后台",
  robots: { index: false, follow: false },
};

export default function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const products = readProducts();

  return (
    <AdminProductsProvider initialProducts={products}>
      <AdminShell>{children}</AdminShell>
    </AdminProductsProvider>
  );
}
