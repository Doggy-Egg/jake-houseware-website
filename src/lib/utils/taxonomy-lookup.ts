export function lookupTaxonomyName(
  items: { slug: string; name: string }[],
  slug: string | undefined,
): string | undefined {
  if (!slug) return undefined;
  return items.find((item) => item.slug === slug)?.name ?? slug;
}
