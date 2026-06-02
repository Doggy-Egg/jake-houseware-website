"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "登录失败");
      }

      const from = searchParams.get("from") || "/admin";
      router.push(from);
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "登录失败，请重试",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted-bg px-6">
      <div className="w-full max-w-md rounded-sm border border-border bg-surface p-8 shadow-sm">
        <div className="mb-8 flex justify-center">
          <Logo height={36} />
        </div>

        <h1 className="text-center text-xl font-semibold tracking-tight">
          管理后台登录
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          请输入管理员密码以继续
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input
            label="密码"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="请输入密码"
            required
          />

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "登录中..." : "登录"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          本地开发默认密码：jakehouseware
        </p>
      </div>
    </div>
  );
}
