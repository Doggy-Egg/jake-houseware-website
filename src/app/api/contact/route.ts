import { NextResponse } from "next/server";
import type { ContactFormData } from "@/types/contact";
import { getEmailNotConfiguredMessage, isEmailConfigured } from "@/lib/email/config";
import { sendContactEmail } from "@/lib/email/send-mail";

function validateContactBody(body: unknown): {
  data?: ContactFormData;
  errors?: string[];
} {
  if (!body || typeof body !== "object") {
    return { errors: ["Invalid request body."] };
  }

  const input = body as Partial<ContactFormData>;
  const errors: string[] = [];

  if (!input.companyName?.trim()) errors.push("Company name is required.");
  if (!input.contactName?.trim()) errors.push("Contact name is required.");
  if (!input.email?.trim()) {
    errors.push("Email is required.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.push("Invalid email address.");
  }
  if (!input.country?.trim()) errors.push("Country is required.");
  if (!input.subject?.trim()) errors.push("Subject is required.");
  if (!input.message?.trim()) {
    errors.push("Message is required.");
  } else if (input.message.trim().length < 20) {
    errors.push("Message must be at least 20 characters.");
  }

  if (errors.length > 0) return { errors };

  return {
    data: {
      companyName: input.companyName!.trim(),
      contactName: input.contactName!.trim(),
      email: input.email!.trim(),
      phone: input.phone?.trim() || undefined,
      country: input.country!.trim(),
      subject: input.subject!.trim(),
      message: input.message!.trim(),
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
    return NextResponse.json(
      { message: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const { data, errors } = validateContactBody(body);

  if (errors || !data) {
    return NextResponse.json(
      { message: errors?.[0] ?? "Validation failed." },
      { status: 400 },
    );
  }

  try {
    await sendContactEmail(data);
  } catch (error) {
    console.error("[contact submission]", error);
    return NextResponse.json(
      {
        message:
          "We could not send your message right now. Please email us directly or try again later.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    message:
      "Thank you. Your message has been sent.",
  });
}
