import "server-only";

import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { contactInfo } from "@/lib/constants/contact";
import type { OutboundEmail } from "@/lib/email/templates";

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Next.js expands `$` in .env values — use SMTP_PASSWORD_B64 when the auth code contains `$`. */
function getSmtpPassword(): string {
  const b64 = process.env.SMTP_PASSWORD_B64?.trim();
  if (b64) {
    try {
      return Buffer.from(b64, "base64").toString("utf8").trim();
    } catch {
      return "";
    }
  }

  return process.env.SMTP_PASSWORD?.trim() ?? "";
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      getSmtpPassword(),
  );
}

export function getSmtpFromAddress(): string {
  return process.env.SMTP_USER?.trim() || contactInfo.email;
}

function getSmtpSettings() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = getSmtpPassword();

  if (!host || !user || !pass) {
    return null;
  }

  const port = parsePort(process.env.SMTP_PORT, 465);
  const secure =
    process.env.SMTP_SECURE?.trim() === "true" ||
    (process.env.SMTP_SECURE?.trim() !== "false" && (port === 465 || port === 994));

  return { host, user, pass, port, secure };
}

function createTransporter() {
  const settings = getSmtpSettings();
  if (!settings) {
    return null;
  }

  const options: SMTPTransport.Options = {
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: {
      user: settings.user,
      pass: settings.pass,
    },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 30_000,
  };

  if (!settings.secure && settings.port === 587) {
    options.requireTLS = true;
  }

  return nodemailer.createTransport(options);
}

function getSmtpErrorDetails(error: unknown): { code: string; response: string; message: string } {
  if (!(error instanceof Error)) {
    return { code: "", response: "", message: "SMTP 发送失败" };
  }

  const code = "code" in error ? String(error.code) : "";
  const response = "response" in error ? String(error.response) : "";

  return {
    code,
    response,
    message: error.message || "SMTP 发送失败",
  };
}

function formatSmtpError(error: unknown): string {
  const { code, response, message } = getSmtpErrorDetails(error);

  if (code === "EAUTH" || /auth/i.test(message)) {
    const serverHint = response ? ` 服务器返回：${response}` : "";
    return (
      "SMTP 登录失败：请确认 SMTP_PASSWORD 是「客户端授权码」（生成后要点确定保存），不是网页登录密码。" +
      " 若仍失败，可尝试把 SMTP_HOST 改为 smtp.qiye.163.com 后重启。" +
      serverHint
    );
  }

  if (code === "ETIMEDOUT" || code === "ESOCKET" || /timeout/i.test(message)) {
    return "连接 SMTP 服务器超时：请检查 SMTP_HOST、SMTP_PORT，或 Vercel 是否拦截出站 SMTP。";
  }

  if (/self signed/i.test(message)) {
    return "SMTP TLS 证书校验失败。";
  }

  return response || message || "SMTP 发送失败";
}

export function getSmtpErrorDebugInfo(error: unknown) {
  const { code, response, message } = getSmtpErrorDetails(error);
  return { code, response, message };
}

export async function verifySmtpConnection(): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) {
    throw new Error("SMTP 未配置");
  }

  try {
    await transporter.verify();
  } catch (error) {
    throw new Error(formatSmtpError(error));
  }
}

export async function sendViaSmtp(email: OutboundEmail, to: string): Promise<void> {
  const transporter = createTransporter();
  const settings = getSmtpSettings();

  if (!transporter || !settings) {
    throw new Error("SMTP 未配置");
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM?.trim() || `JAKE HOUSEWARE <${settings.user}>`,
      to,
      replyTo: email.replyTo,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
  } catch (error) {
    throw new Error(formatSmtpError(error));
  }
}

export function getSmtpPublicConfig() {
  const settings = getSmtpSettings();
  if (!settings) {
    return { configured: false as const };
  }

  const pass = getSmtpPassword();
  const usesBase64 = Boolean(process.env.SMTP_PASSWORD_B64?.trim());

  return {
    configured: true as const,
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    user: settings.user,
    from: process.env.EMAIL_FROM?.trim() || `JAKE HOUSEWARE <${settings.user}>`,
    passwordLength: pass.length,
    usesBase64,
    likelyTruncated: !usesBase64 && pass.length > 0 && pass.length < 12,
  };
}
