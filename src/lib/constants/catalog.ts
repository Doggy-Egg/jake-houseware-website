import fs from "fs";
import path from "path";

export const catalogConfig = {
  fileName: "jake-houseware-catalog-2026.pdf",
  title: "JAKE HOUSEWARE Product Catalog 2026",
  version: "2026.1",
  updatedAt: "2026-01-15",
  language: "English",
  pages: 48,
  description:
    "Complete wholesale product catalog featuring wine accessories, barware, whiskey and coffee tools, kitchen gadgets, lifestyle accessories, and gift sets.",
  highlights: [
    "Full product range with SKU references",
    "MOQ and packaging information",
    "Material and dimension specifications",
    "OEM / ODM capability overview",
  ],
} as const;

export function getCatalogDownloadUrl() {
  return `/catalog/${catalogConfig.fileName}`;
}

export function getCatalogFileSize(): string {
  try {
    const filePath = path.join(
      process.cwd(),
      "public/catalog",
      catalogConfig.fileName,
    );
    const { size } = fs.statSync(filePath);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  } catch {
    return "—";
  }
}
