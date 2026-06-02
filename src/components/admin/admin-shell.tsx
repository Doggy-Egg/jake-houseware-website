import { Logo } from "@/components/layout/logo";
import {
  AdminMobileNav,
  AdminSidebar,
} from "@/components/admin/admin-sidebar";
import { adminCopy } from "@/lib/constants/admin";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted-bg">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-surface">
          <div className="flex items-center justify-between px-6 py-4">
            <Logo height={28} />
            <span className="rounded-sm bg-accent-light px-2.5 py-1 text-xs font-medium tracking-wide text-accent">
              {adminCopy.panelBadge}
            </span>
          </div>
          <AdminMobileNav />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
