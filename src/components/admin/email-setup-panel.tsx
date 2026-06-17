"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { contactInfo, formNotifyEmail } from "@/lib/constants/contact";

type EmailStatus = {
  configured: boolean;
  provider: "smtp" | "resend" | null;
  notifyEmail: string;
  smtp: {
    configured: boolean;
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    from?: string;
    passwordLength?: number;
    usesBase64?: boolean;
    likelyTruncated?: boolean;
  };
  resend: { configured: boolean };
};

export function EmailSetupPanel() {
  const [status, setStatus] = useState<EmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/email");
      const data = (await response.json()) as EmailStatus;
      setStatus(data);
    } catch {
      setError("无法读取邮件配置状态");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const sendTest = async () => {
    setSending(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/email", { method: "POST" });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "发送失败");
      }

      setMessage(data.message ?? "测试邮件已发送");
    } catch (sendError) {
      setError(
        sendError instanceof Error ? sendError.message : "测试邮件发送失败",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">邮件发送</h1>
        <p className="mt-1 text-sm text-muted">
          Contact 表单和 Inquiry List 提交后，通知邮件发到{" "}
          <strong>{formNotifyEmail}</strong>。对外仍显示 {contactInfo.email}。
        </p>
      </div>

      <section className="rounded-sm border border-border bg-surface p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          当前状态
        </h2>

        {loading ? (
          <p className="text-sm text-muted">加载中…</p>
        ) : status ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">已配置</dt>
              <dd className="mt-1 font-medium">
                {status.configured ? "是" : "否"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">方式</dt>
              <dd className="mt-1 font-medium">{status.provider ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">通知收件人</dt>
              <dd className="mt-1 font-medium">{status.notifyEmail}</dd>
            </div>
            {status.smtp.configured ? (
              <>
                <div>
                  <dt className="text-muted">SMTP 服务器</dt>
                  <dd className="mt-1 font-medium">
                    {status.smtp.host}:{status.smtp.port}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">发信账号</dt>
                  <dd className="mt-1 font-medium">{status.smtp.user}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted">发件人显示</dt>
                  <dd className="mt-1 font-medium">{status.smtp.from}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted">授权码读取</dt>
                  <dd className="mt-1 font-medium">
                    {status.smtp.likelyTruncated ? (
                      <span className="text-red-600">
                        授权码可能被截断（仅读到 {status.smtp.passwordLength}{" "}
                        位）。若授权码含 <code>$</code>，请改用{" "}
                        <code>SMTP_PASSWORD_B64</code> 配置。
                      </span>
                    ) : status.smtp.usesBase64 ? (
                      <span className="text-emerald-700">
                        使用 Base64 配置，长度 {status.smtp.passwordLength} 位
                      </span>
                    ) : (
                      <span className="text-emerald-700">
                        已读取 {status.smtp.passwordLength} 位
                      </span>
                    )}
                  </dd>
                </div>
              </>
            ) : null}
          </dl>
        ) : null}

        <Button
          type="button"
          variant="outline"
          disabled={sending || loading || !status?.configured}
          onClick={sendTest}
        >
          {sending ? "发送中…" : "发送测试邮件"}
        </Button>
      </section>

      <section className="rounded-sm border border-border bg-muted-bg p-6 space-y-3 text-sm text-muted">
        <h2 className="font-semibold text-foreground">网易企业邮箱配置（.env.local / Vercel）</h2>
        <pre className="overflow-x-auto rounded-sm bg-surface p-4 text-xs text-foreground">
{`SMTP_HOST=smtphz.qiye.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=gabriel@chinajake.com
SMTP_PASSWORD=客户端授权码
NOTIFY_EMAIL=gabriel@chinajake.com
EMAIL_FROM=JAKE HOUSEWARE <gabriel@chinajake.com>`}
        </pre>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            登录 qiye.163.com → 设置 → 勾选 <strong>IMAP/SMTP 协议</strong>
          </li>
          <li>
            打开 <strong>客户端授权密码</strong> 开关 → 点{" "}
            <strong>生成客户端授权密码</strong>
          </li>
          <li>
            输入名称（如「网站发信」）→ 生成后必须点 <strong>确定</strong> 保存
          </li>
          <li>
            点 <strong>关闭，复制授权码</strong>。若含 <code>$</code> 等特殊字符，用 Base64
            写入 <code>SMTP_PASSWORD_B64</code>（见下方说明）
          </li>
          <li>填到本地 <code>.env.local</code>，重启 <code>npm run dev</code></li>
          <li>点上方「发送测试邮件」确认 gabriel@ 能收到</li>
        </ol>
        <p className="text-xs">
          授权码含 <code>$</code> 时，Next.js 会截断 <code>SMTP_PASSWORD</code>。在终端运行{" "}
          <code>node -e &quot;console.log(Buffer.from(&apos;你的授权码&apos;).toString(&apos;base64&apos;))&quot;</code>{" "}
          把输出填到 <code>SMTP_PASSWORD_B64=</code>，并删除 <code>SMTP_PASSWORD</code> 行。
        </p>
      </section>

      {message ? (
        <p className="text-sm text-emerald-700" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
