import { normalizeItemNoKey } from "@/lib/utils/slug";

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

/** Candidate keys for matching a local filename to an uploaded Item No. */
export function itemNoKeysFromFilename(filename: string): string[] {
  const stem = parseItemNoFromFilename(filename);
  const keys: string[] = [];
  const seen = new Set<string>();

  const push = (value: string) => {
    const key = normalizeItemNoKey(value);
    if (!key || seen.has(key)) return;
    seen.add(key);
    keys.push(key);
  };

  push(stem);

  const resolved = resolveBulkUploadItemNo(filename);
  if (resolved) {
    push(resolved);
  }

  if (isAutoItemNoFilename(filename)) {
    const head = stem.split(/\s+/)[0] ?? "";
    push(head);

    const code = head.match(/^((?:JK|JH|BA|WA|SH|M\d)[\w-]*)/i)?.[1];
    if (code) {
      push(code);
    }
  }

  return keys;
}

export function matchFilenameToUploadedItemNos(
  filename: string,
  uploadedKeys: ReadonlySet<string>,
): string | null {
  for (const key of itemNoKeysFromFilename(filename)) {
    if (uploadedKeys.has(key)) {
      return key;
    }
  }

  return null;
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
