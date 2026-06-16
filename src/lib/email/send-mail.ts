import "server-only";

import type { ContactFormData } from "@/types/contact";
import type { InquirySubmission } from "@/types/inquiry";
import { getEmailProvider, getNotifyEmail, isEmailConfigured } from "@/lib/email/config";
import { sendViaResend } from "@/lib/email/resend";
import { sendViaSmtp } from "@/lib/email/smtp";
import {
  buildContactEmail,
  buildInquiryEmail,
  type OutboundEmail,
} from "@/lib/email/templates";

async function dispatchEmail(email: OutboundEmail): Promise<void> {
  if (!isEmailConfigured()) {
    throw new Error("Email is not configured");
  }

  const to = getNotifyEmail();
  const provider = getEmailProvider();

  if (provider === "smtp") {
    await sendViaSmtp(email, to);
    return;
  }

  if (provider === "resend") {
    await sendViaResend(email, to);
    return;
  }

  throw new Error("Email is not configured");
}

export async function sendContactEmail(data: ContactFormData): Promise<void> {
  await dispatchEmail(buildContactEmail(data));
}

export async function sendInquiryEmail(
  data: InquirySubmission,
  inquiryId?: string,
): Promise<void> {
  await dispatchEmail(buildInquiryEmail(data, inquiryId));
}
