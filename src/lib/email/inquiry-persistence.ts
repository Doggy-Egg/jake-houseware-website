import "server-only";

import type { InquirySubmission } from "@/types/inquiry";
import type { StoredInquiry } from "@/lib/data/inquiry-store";

/** Best-effort local backup — skipped on Vercel where the filesystem is read-only. */
export async function persistInquiryLocally(
  submission: InquirySubmission,
): Promise<StoredInquiry | null> {
  if (process.env.VERCEL) {
    return null;
  }

  try {
    const { saveInquiry } = await import("@/lib/data/inquiry-store");
    return saveInquiry(submission);
  } catch (error) {
    console.warn("[inquiry] Local backup skipped:", error);
    return null;
  }
}

export function createInquiryReference(): string {
  return `inq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
