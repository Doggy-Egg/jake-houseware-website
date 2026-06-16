"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted-bg px-6">
      <div className="max-w-md space-y-4 rounded-sm border border-border bg-surface p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">后台加载失败</h1>
        <p className="text-sm text-muted">
          登录已成功，但页面数据加载出错。常见原因：Vercel 未配置 Supabase 环境变量。
        </p>
        {error.message ? (
          <p className="rounded-sm bg-muted-bg px-3 py-2 text-left text-xs text-red-600">
            {error.message}
          </p>
        ) : null}
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={reset}>
            重试
          </Button>
          <Button href="/admin/login" variant="outline">
            返回登录
          </Button>
        </div>
      </div>
    </div>
  );
}
