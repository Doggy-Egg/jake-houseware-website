import { slugify } from "@/lib/utils/slug";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { compressProductImage } from "@/lib/supabase/compress-product-image";
import { PRODUCT_IMAGE_BUCKET } from "@/lib/supabase/product-image-storage";

export { PRODUCT_IMAGE_BUCKET } from "@/lib/supabase/product-image-storage";
export {
  deleteProductImagesFromStorage,
  getStoragePathFromPublicUrl,
} from "@/lib/supabase/product-image-storage";

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

function resolveImageMimeType(file: File): string {
  if (file.type && isAllowedProductImageType(file.type)) {
    return file.type;
  }

  const extension = file.name.match(/\.[^.]+$/i)?.[0]?.toLowerCase();
  const byExtension: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };

  if (extension && byExtension[extension]) {
    return byExtension[extension]!;
  }

  return file.type;
}

export async function uploadProductImage(
  file: File,
  options?: { itemNo?: string },
): Promise<string> {
  const mimeType = resolveImageMimeType(file);

  if (!isAllowedProductImageType(mimeType)) {
    throw new Error("仅支持 JPG、PNG、WebP、GIF 格式");
  }

  if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
    throw new Error("图片大小不能超过 5MB");
  }

  const base = options?.itemNo?.trim()
    ? slugify(options.itemNo) || "product"
    : slugify(file.name.replace(/\.[^.]+$/i, "") || "product-image");
  const fileNameBase = `${base}-${Date.now()}`;

  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const compressed = await compressProductImage(rawBuffer, mimeType);

  const uploadBuffer = compressed?.buffer ?? rawBuffer;
  const contentType = compressed?.contentType ?? mimeType;
  const extension = compressed?.extension ?? PRODUCT_IMAGE_TYPES.get(mimeType)!;
  const fileName = `${fileNameBase}${extension}`;

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(fileName, uploadBuffer, {
      contentType,
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
