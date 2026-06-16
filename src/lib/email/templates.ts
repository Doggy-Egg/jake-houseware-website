import "server-only";

import type { ContactFormData } from "@/types/contact";
import type { InquiryItem, InquirySubmission } from "@/types/inquiry";
import { escapeHtml, formatOptionalField } from "@/lib/email/format";

export type OutboundEmail = {
  subject: string;
  text: string;
  html: string;
  replyTo: string;
};

export function buildContactEmail(data: ContactFormData): OutboundEmail {
  const text = [
    "New contact form message",
    "",
    `Company: ${data.companyName}`,
    `Contact: ${data.contactName}`,
    `Email: ${data.email}`,
    formatOptionalField("Phone", data.phone),
    `Country: ${data.country}`,
    `Subject: ${data.subject}`,
    "",
    "Message:",
    data.message,
  ]
    .filter(Boolean)
    .join("\n");

  const rows = [
    ["Company", data.companyName],
    ["Contact", data.contactName],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Country", data.country],
    ["Subject", data.subject],
  ] as const;

  const tableRows = rows
    .filter(([, value]) => value?.trim())
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 0">${escapeHtml(value!)}</td></tr>`,
    )
    .join("");

  const html = `
    <h2 style="margin:0 0 16px;font-size:18px">New contact form message</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;line-height:1.5">${tableRows}</table>
    <h3 style="margin:24px 0 8px;font-size:14px">Message</h3>
    <p style="margin:0;white-space:pre-wrap;font-family:sans-serif;font-size:14px;line-height:1.6">${escapeHtml(data.message)}</p>
  `.trim();

  return {
    subject: `[Contact] ${data.subject} — ${data.companyName}`,
    text,
    html,
    replyTo: data.email,
  };
}

function buildInquiryItemsHtml(items: InquiryItem[]): string {
  const rows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(item.productItemNo)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(item.productName)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        </tr>`,
    )
    .join("");

  return `
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px">
      <thead>
        <tr>
          <th style="padding:8px 12px;border-bottom:2px solid #ddd;text-align:left">Item No.</th>
          <th style="padding:8px 12px;border-bottom:2px solid #ddd;text-align:left">Product</th>
          <th style="padding:8px 12px;border-bottom:2px solid #ddd;text-align:center">Qty</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `.trim();
}

export function buildInquiryEmail(
  data: InquirySubmission,
  inquiryId?: string,
): OutboundEmail {
  const lines = [
    "New wholesale inquiry",
    inquiryId ? `Reference: ${inquiryId}` : "",
    "",
    `Company: ${data.companyName}`,
    `Contact: ${data.contactName}`,
    `Email: ${data.email}`,
    formatOptionalField("Phone", data.phone),
    `Country: ${data.country}`,
    "",
    "Products:",
    ...data.items.map(
      (item, index) =>
        `${index + 1}. ${item.productItemNo} — ${item.productName} × ${item.quantity}`,
    ),
  ];

  if (data.message?.trim()) {
    lines.push("", "Additional message:", data.message.trim());
  }

  const infoRows = [
    inquiryId ? ["Reference", inquiryId] : null,
    ["Company", data.companyName],
    ["Contact", data.contactName],
    ["Email", data.email],
    data.phone ? ["Phone", data.phone] : null,
    ["Country", data.country],
  ].filter(Boolean) as [string, string][];

  const tableRows = infoRows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 0">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  const messageBlock = data.message?.trim()
    ? `<h3 style="margin:24px 0 8px;font-size:14px">Additional message</h3>
       <p style="margin:0;white-space:pre-wrap;font-family:sans-serif;font-size:14px;line-height:1.6">${escapeHtml(data.message)}</p>`
    : "";

  const html = `
    <h2 style="margin:0 0 16px;font-size:18px">New wholesale inquiry</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;line-height:1.5">${tableRows}</table>
    <h3 style="margin:24px 0 8px;font-size:14px">Products (${data.items.length})</h3>
    ${buildInquiryItemsHtml(data.items)}
    ${messageBlock}
  `.trim();

  const itemSummary = data.items.map((item) => item.productItemNo).join(", ");

  return {
    subject: `[Inquiry] ${data.companyName} — ${itemSummary}`,
    text: lines.filter((line) => line !== "").join("\n"),
    html,
    replyTo: data.email,
  };
}
