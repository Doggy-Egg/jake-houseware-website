/** Item No. from image filename, e.g. `JH-BW-001.jpg` → `JH-BW-001` */
export function parseItemNoFromFilename(filename: string): string {
  return filename.replace(/\.[^.]+$/i, "").trim();
}

/** JK/JH plus legacy prefixes (BA, WA, SH, M07-style). */
const AUTO_ITEM_NO_PREFIX = /^(JK|JH|BA|WA|SH|M\d)/i;

/** Filenames that look like a product Item No. */
export function isAutoItemNoFilename(filename: string): boolean {
  const base = parseItemNoFromFilename(filename);
  return AUTO_ITEM_NO_PREFIX.test(base);
}

/** Resolve Item No. from filename, with optional manual override. */
export function resolveBulkUploadItemNo(
  filename: string,
  manualItemNo?: string,
): string {
  const manual = manualItemNo?.trim();
  if (manual) {
    return manual;
  }

  if (isAutoItemNoFilename(filename)) {
    return parseItemNoFromFilename(filename);
  }

  return "";
}

/** Parse pasted Item No. list (one per line, or comma-separated). */
export function parseItemNoList(text: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of text.split(/[\n,;]+/)) {
    const itemNo = part.trim();
    if (!itemNo) continue;
    const key = itemNo.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(itemNo);
  }

  return result;
}
