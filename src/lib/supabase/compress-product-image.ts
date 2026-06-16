export const PRODUCT_IMAGE_MAX_EDGE = 1200;
export const PRODUCT_IMAGE_JPEG_QUALITY = 82;

export type CompressedImage = {
  buffer: Buffer;
  contentType: "image/jpeg";
  extension: ".jpg";
};

type SharpModule = typeof import("sharp");

let sharpLoader: Promise<SharpModule["default"]> | null = null;

async function loadSharp() {
  if (!sharpLoader) {
    sharpLoader = import("sharp").then((module) => module.default);
  }

  return sharpLoader;
}

/** Returns null for GIF or when Sharp is unavailable — caller uploads the original. */
export async function compressProductImage(
  input: Buffer,
  mimeType: string,
): Promise<CompressedImage | null> {
  if (mimeType === "image/gif") {
    return null;
  }

  try {
    const sharp = await loadSharp();
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
  } catch (error) {
    console.error("[compressProductImage] Sharp failed, using original file:", error);
    return null;
  }
}
