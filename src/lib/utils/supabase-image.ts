export function getSupabaseImageHostname(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return undefined;

  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

export function isOptimizableProductImageUrl(src: string): boolean {
  if (src.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(src);
    return (
      url.hostname.endsWith(".supabase.co") &&
      url.pathname.includes("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}
