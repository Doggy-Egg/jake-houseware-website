import "server-only";

import nodemailer from "nodemailer";
import { contactInfo } from "@/lib/constants/contact";
import type { OutboundEmail } from "@/lib/email/templates";

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASSWORD?.trim(),
  );
}

export function getSmtpFromAddress(): string {
  return process.env.SMTP_USER?.trim() || contactInfo.email;
}

export async function sendViaSmtp(email: OutboundEmail, to: string): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured");
  }

  const port = parsePort(process.env.SMTP_PORT, 465);
  const secure =
    process.env.SMTP_SECURE?.trim() === "true" ||
    (process.env.SMTP_SECURE?.trim() !== "false" && port === 465);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM?.trim() || `JAKE HOUSEWARE <${user}>`,
    to,
    replyTo: email.replyTo,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
}
