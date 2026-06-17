import { NextResponse } from "next/server";
import type { InquiryItem, InquirySubmission } from "@/types/inquiry";
import { getEmailNotConfiguredMessage, isEmailConfigured } from "@/lib/email/config";
import {
  createInquiryReference,
  persistInquiryLocally,
} from "@/lib/email/inquiry-persistence";
import { sendInquiryEmail } from "@/lib/email/send-mail";

function validateInquiryBody(body: unknown): {
  data?: Omit<InquirySubmission, "items"> & { items: InquiryItem[] };
  errors?: string[];
} {
  if (!body || typeof body !== "object") {
    return { errors: ["Invalid request body."] };
  }

  const input = body as Partial<InquirySubmission>;
  const errors: string[] = [];

  if (!input.companyName?.trim()) errors.push("Company name is required.");
  if (!input.contactName?.trim()) errors.push("Contact name is required.");
  if (!input.email?.trim()) {
    errors.push("Email is required.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.push("Invalid email address.");
  }
  if (!input.country?.trim()) errors.push("Country is required.");
  if (!Array.isArray(input.items) || input.items.length === 0) {
    errors.push("Inquiry list must contain at least one product.");
  }

  if (errors.length > 0) return { errors };

  return {
    data: {
      companyName: input.companyName!.trim(),
      contactName: input.contactName!.trim(),
      email: input.email!.trim(),
      phone: input.phone?.trim() || undefined,
      country: input.country!.trim(),
      message: input.message?.trim() || undefined,
      items: input.items as InquiryItem[],
    },
  };
}

export async function POST(request: Request) {
  if (!isEmailConfigured()) {
    return NextResponse.json(
      { message: getEmailNotConfiguredMessage() },
      { status: 503 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  const { data, errors } = validateInquiryBody(body);

  if (errors || !data) {
    return NextResponse.json(
      { message: errors?.[0] ?? "Validation failed." },
      { status: 400 },
    );
  }

  const inquiryId = createInquiryReference();

  try {
    await sendInquiryEmail(data, inquiryId);
  } catch (error) {
    console.error("[inquiry submission]", error);
    return NextResponse.json(
      {
        message:
          "We could not send your inquiry right now. Please email us directly or try again later.",
      },
      { status: 502 },
    );
  }

  await persistInquiryLocally(data);

  return NextResponse.json({
    message:
      "Thank you. Your inquiry has been sent.",
    id: inquiryId,
  });
}
