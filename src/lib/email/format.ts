export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatOptionalField(label: string, value?: string): string {
  if (!value?.trim()) {
    return "";
  }

  return `${label}: ${value.trim()}`;
}
