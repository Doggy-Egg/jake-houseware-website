/** Item No. from image filename, e.g. `JH-BW-001.jpg` → `JH-BW-001` */
export function parseItemNoFromFilename(filename: string): string {
  return filename.replace(/\.[^.]+$/i, "").trim();
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
