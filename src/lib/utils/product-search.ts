/** Escape user input for Postgres ILIKE patterns. */
export function escapeIlikePattern(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

/** PostgREST `.or()` treats commas as separators — strip problematic chars. */
export function sanitizeProductSearchTerm(value: string): string {
  return value.replace(/[,().]/g, " ").trim();
}
