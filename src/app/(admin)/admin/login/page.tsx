import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted-bg">
          <p className="text-sm text-muted">加载中...</p>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
