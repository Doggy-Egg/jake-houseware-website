import sharp from "sharp";

export const PRODUCT_IMAGE_MAX_EDGE = 1200;
export const PRODUCT_IMAGE_JPEG_QUALITY = 82;

export type CompressedImage = {
  buffer: Buffer;
  contentType: "image/jpeg";
  extension: ".jpg";
};

/** Returns null for GIF — caller should upload the original file. */
export async function compressProductImage(
  input: Buffer,
  mimeType: string,
): Promise<CompressedImage | null> {
  if (mimeType === "image/gif") {
    return null;
  }

  const buffer = await sharp(input)
    .rotate()
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize(PRODUCT_IMAGE_MAX_EDGE, PRODUCT_IMAGE_MAX_EDGE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: PRODUCT_IMAGE_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  return {
    buffer,
    contentType: "image/jpeg",
    extension: ".jpg",
  };
}
