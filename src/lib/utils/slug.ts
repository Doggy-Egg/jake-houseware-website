export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** URL slug is always derived from Item No. */
export function resolveProductSlug(options: {
  itemNo: string;
  id?: string;
}): string {
  const fromItemNo = slugify(options.itemNo);
  if (fromItemNo) return fromItemNo;

  if (options.id?.trim()) {
    const fromId = slugify(options.id);
    if (fromId) return fromId;
    return options.id.trim();
  }

  return generateProductId();
}

export function normalizeItemNoKey(itemNo: string): string {
  return itemNo.trim().toLowerCase();
}

export function generateProductId(): string {
  return `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
