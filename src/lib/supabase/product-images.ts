import { slugify } from "@/lib/utils/slug";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export const PRODUCT_IMAGE_BUCKET = "product-images";
export const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;

export const PRODUCT_IMAGE_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

export function isAllowedProductImageType(type: string) {
  return PRODUCT_IMAGE_TYPES.has(type);
}

export async function uploadProductImage(
  file: File,
  options?: { itemNo?: string },
): Promise<string> {
  if (!isAllowedProductImageType(file.type)) {
    throw new Error("仅支持 JPG、PNG、WebP、GIF 格式");
  }

  if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
    throw new Error("图片大小不能超过 5MB");
  }

  const extension = PRODUCT_IMAGE_TYPES.get(file.type)!;
  const base = options?.itemNo?.trim()
    ? slugify(options.itemNo) || "product"
    : slugify(file.name.replace(/\.[^.]+$/i, "") || "product-image");
  const fileName = `${base}-${Date.now()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(fileName);

  return publicUrl;
}

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
