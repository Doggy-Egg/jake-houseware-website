"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useInquiry } from "@/context/inquiry/inquiry-context";

type InquiryFormState = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  message: string;
};

const initialForm: InquiryFormState = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  country: "",
  message: "",
};

type InquirySubmissionFormProps = {
  onSuccess: () => void;
};

export function InquirySubmissionForm({ onSuccess }: InquirySubmissionFormProps) {
  const { items, clearItems } = useInquiry();
  const [form, setForm] = useState<InquiryFormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (field: keyof InquiryFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: form.phone || undefined,
          message: form.message || undefined,
          items,
        }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Submission failed.");
      }

      clearItems();
      setForm(initialForm);
      onSuccess();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Submission failed.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border-t border-border pt-8">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Submit Your Inquiry
        </h2>
        <p className="mt-1 text-sm text-muted">
          Provide your business details and we will prepare a wholesale quote.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Company Name"
          value={form.companyName}
          onChange={(event) => updateField("companyName", event.target.value)}
          required
        />
        <Input
          label="Contact Name"
          value={form.contactName}
          onChange={(event) => updateField("contactName", event.target.value)}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          required
        />
        <Input
          label="Phone (optional)"
          type="tel"
          value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
        />
      </div>

      <Input
        label="Country"
        value={form.country}
        onChange={(event) => updateField("country", event.target.value)}
        required
      />

      <Textarea
        label="Additional Message (optional)"
        value={form.message}
        onChange={(event) => updateField("message", event.target.value)}
        placeholder="Tell us about your target market, packaging requirements, or delivery timeline..."
      />

      {status === "error" ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Submitting..." : "Submit Inquiry"}
      </Button>
    </form>
  );
}
