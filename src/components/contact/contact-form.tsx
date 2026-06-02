"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ContactFormData } from "@/types/contact";

type FormErrors = Partial<Record<keyof ContactFormData, string>>;

const initialForm: ContactFormData = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  country: "",
  subject: "",
  message: "",
};

function validateForm(data: ContactFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.companyName.trim()) {
    errors.companyName = "Company name is required.";
  }
  if (!data.contactName.trim()) {
    errors.contactName = "Contact name is required.";
  }
  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!data.country.trim()) {
    errors.country = "Country is required.";
  }
  if (!data.subject.trim()) {
    errors.subject = "Subject is required.";
  }
  if (!data.message.trim()) {
    errors.message = "Message is required.";
  } else if (data.message.trim().length < 20) {
    errors.message = "Please provide at least 20 characters.";
  }

  return errors;
}

export function ContactForm() {
  const [form, setForm] = useState<ContactFormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [statusMessage, setStatusMessage] = useState("");

  const updateField = (field: keyof ContactFormData, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Something went wrong.");
      }

      setStatus("success");
      setStatusMessage(
        data.message ??
          "Thank you. Your message has been received. Our team will respond within one business day.",
      );
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Unable to send your message. Please try again.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Company Name"
          placeholder="Your company"
          value={form.companyName}
          onChange={(event) => updateField("companyName", event.target.value)}
          error={errors.companyName}
          required
        />
        <Input
          label="Contact Name"
          placeholder="Your name"
          value={form.contactName}
          onChange={(event) => updateField("contactName", event.target.value)}
          error={errors.contactName}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Email"
          type="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          error={errors.email}
          required
        />
        <Input
          label="Phone (optional)"
          type="tel"
          placeholder="+1 000 000 0000"
          value={form.phone ?? ""}
          onChange={(event) => updateField("phone", event.target.value)}
        />
      </div>

      <Input
        label="Country"
        placeholder="United States"
        value={form.country}
        onChange={(event) => updateField("country", event.target.value)}
        error={errors.country}
        required
      />

      <Input
        label="Subject"
        placeholder="Wholesale inquiry"
        value={form.subject}
        onChange={(event) => updateField("subject", event.target.value)}
        error={errors.subject}
        required
      />

      <Textarea
        label="Message"
        placeholder="Tell us about your business, target market, and product interests..."
        value={form.message}
        onChange={(event) => updateField("message", event.target.value)}
        error={errors.message}
        required
      />

      {status === "success" ? (
        <div
          role="status"
          className="rounded-sm border border-accent/20 bg-accent-light px-4 py-3 text-sm text-accent"
        >
          {statusMessage}
        </div>
      ) : null}

      {status === "error" ? (
        <div
          role="alert"
          className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {statusMessage}
        </div>
      ) : null}

      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Send Message"}
      </Button>

      <p className="text-xs leading-relaxed text-muted">
        B2B inquiries only. We typically respond within one business day.
      </p>
    </form>
  );
}
