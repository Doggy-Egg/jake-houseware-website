import "server-only";

import { contactInfo, formNotifyEmail } from "@/lib/constants/contact";
import { isResendConfigured } from "@/lib/email/resend";
import { isSmtpConfigured } from "@/lib/email/smtp";

export type EmailProvider = "smtp" | "resend";

export function isEmailConfigured(): boolean {
  return isSmtpConfigured() || isResendConfigured();
}

export function getEmailProvider(): EmailProvider | null {
  if (isSmtpConfigured()) return "smtp";
  if (isResendConfigured()) return "resend";
  return null;
}

/** Inbox that receives contact & inquiry notifications. */
export function getNotifyEmail(): string {
  return process.env.NOTIFY_EMAIL?.trim() || formNotifyEmail;
}

/** Used by Resend only — must be verified in Resend dashboard. */
export function getEmailFrom(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    `JAKE HOUSEWARE <onboarding@resend.dev>`
  );
}

export function getEmailNotConfiguredMessage(): string {
  return `Message delivery is not configured yet. Please email us directly at ${contactInfo.email}.`;
}
