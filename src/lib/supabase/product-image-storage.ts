import { createSupabaseAdmin } from "@/lib/supabase/server";

export const PRODUCT_IMAGE_BUCKET = "product-images";

export function getStoragePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) {
    return null;
  }

  return decodeURIComponent(url.slice(index + marker.length));
}

export async function deleteProductImagesFromStorage(urls: string[]) {
  const paths = urls
    .map((url) => getStoragePathFromPublicUrl(url))
    .filter((path): path is string => Boolean(path));

  if (paths.length === 0) {
    return;
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .remove(paths);

  if (error) {
    throw new Error(error.message);
  }
}
