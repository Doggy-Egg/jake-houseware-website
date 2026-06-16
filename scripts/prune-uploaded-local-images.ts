import { createClient } from "@supabase/supabase-js";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from "fs";
import { basename, dirname, join, relative, resolve } from "path";
import {
  matchFilenameToUploadedItemNos,
  resolveBulkUploadItemNo,
} from "../src/lib/utils/item-no";
import { normalizeItemNoKey } from "../src/lib/utils/slug";

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;
const DEFAULT_SOURCE = resolve(
  process.env.HOME ?? "",
  "Desktop/chinajake_images/images",
);
const DEFAULT_OUTPUT = resolve(
  process.env.HOME ?? "",
  "Desktop/chinajake_images/images_pending_upload",
);
const CATALOG_DIR = "电子目录更新 catalog-update";

type ProductRow = { item_no: string; images: string[] | null };

type PruneReport = {
  generatedAt: string;
  source: string;
  output: string;
  uploadedItemNos: number;
  uploadedWithImage: number;
  localImagesScanned: number;
  removedAsUploaded: number;
  remainingImages: number;
  remainingWithoutItemNo: number;
  removed: Array<{ path: string; filename: string; matchedKey: string }>;
  remainingNoItemNo: string[];
};

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function parseArgs(argv: string[]) {
  const options = {
    source: DEFAULT_SOURCE,
    output: DEFAULT_OUTPUT,
    includeCatalog: false,
    requireImage: false,
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--source") {
      options.source = resolve(argv[++index] ?? "");
    } else if (arg === "--output") {
      options.output = resolve(argv[++index] ?? "");
    } else if (arg === "--include-catalog") {
      options.includeCatalog = true;
    } else if (arg === "--require-image") {
      options.requireImage = true;
    } else if (arg === "--force") {
      options.force = true;
    }
  }

  return options;
}

function isImageFile(path: string) {
  return IMAGE_EXT.test(basename(path));
}

function shouldSkipPath(relativePath: string, includeCatalog: boolean) {
  if (includeCatalog) return false;
  const top = relativePath.split("/")[0] ?? relativePath;
  return top === CATALOG_DIR;
}

function walkFiles(root: string): string[] {
  const files: string[] = [];

  function walk(current: string) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }

  walk(root);
  return files;
}

async function fetchUploadedKeys(requireImage: boolean) {
  loadEnvLocal();
  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await supabase
    .from("products")
    .select("item_no, images");

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as ProductRow[];
  const keys = new Set<string>();
  const records: Array<{ itemNo: string; hasImage: boolean }> = [];
  let withImage = 0;

  for (const row of rows) {
    const hasImage = Array.isArray(row.images) && row.images.length > 0;
    if (hasImage) withImage += 1;
    if (requireImage && !hasImage) continue;
    keys.add(normalizeItemNoKey(row.item_no));
    records.push({ itemNo: row.item_no, hasImage });
  }

  return { keys, records, total: rows.length, withImage };
}

function copyFilteredTree(source: string, output: string, includeCatalog: boolean) {
  function copyNode(currentSource: string, currentOutput: string) {
    mkdirSync(currentOutput, { recursive: true });

    for (const entry of readdirSync(currentSource)) {
      const sourcePath = join(currentSource, entry);
      const rel = relative(source, sourcePath);
      if (shouldSkipPath(rel, includeCatalog)) continue;

      const destPath = join(currentOutput, entry);
      const stats = statSync(sourcePath);
      if (stats.isDirectory()) {
        copyNode(sourcePath, destPath);
      } else {
        cpSync(sourcePath, destPath);
      }
    }
  }

  copyNode(source, output);
}

function removeEmptyDirectories(dir: string): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const child = join(dir, entry.name);
    removeEmptyDirectories(child);
    if (readdirSync(child).length === 0) {
      rmSync(child);
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!existsSync(options.source)) {
    throw new Error(`Source folder not found: ${options.source}`);
  }

  if (existsSync(options.output)) {
    if (!options.force) {
      throw new Error(
        `Output already exists: ${options.output}\nUse --force to replace it.`,
      );
    }
    rmSync(options.output, { recursive: true, force: true });
  }

  const uploaded = await fetchUploadedKeys(options.requireImage);
  console.log(
    `Uploaded item nos: ${uploaded.keys.size} (${uploaded.total} products, ${uploaded.withImage} with images)`,
  );

  console.log(`Copying ${options.source} -> ${options.output}`);
  copyFilteredTree(options.source, options.output, options.includeCatalog);

  const report: PruneReport = {
    generatedAt: new Date().toISOString(),
    source: options.source,
    output: options.output,
    uploadedItemNos: uploaded.keys.size,
    uploadedWithImage: uploaded.withImage,
    localImagesScanned: 0,
    removedAsUploaded: 0,
    remainingImages: 0,
    remainingWithoutItemNo: 0,
    removed: [],
    remainingNoItemNo: [],
  };

  const files = walkFiles(options.output).filter(isImageFile);
  report.localImagesScanned = files.length;

  for (const filePath of files) {
    const filename = basename(filePath);
    const matchedKey = matchFilenameToUploadedItemNos(filename, uploaded.keys);

    if (matchedKey) {
      if (!statSync(filePath).isFile()) {
        continue;
      }
      unlinkSync(filePath);
      report.removedAsUploaded += 1;
      report.removed.push({
        path: relative(options.output, filePath),
        filename,
        matchedKey,
      });
      continue;
    }

    report.remainingImages += 1;
    if (!resolveBulkUploadItemNo(filename)) {
      report.remainingWithoutItemNo += 1;
      report.remainingNoItemNo.push(relative(options.output, filePath));
    }
  }

  removeEmptyDirectories(options.output);

  const reportPath = join(dirname(options.output), "prune-uploaded-report.json");
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf-8");

  const csvPath = join(dirname(options.output), "uploaded-item-nos.csv");
  writeFileSync(
    csvPath,
    `item_no,has_image\n${uploaded.records
      .map((row) => `${row.itemNo},${row.hasImage ? "yes" : "no"}`)
      .join("\n")}\n`,
    "utf-8",
  );

  console.log("");
  console.log(`Scanned images: ${report.localImagesScanned}`);
  console.log(`Removed (already uploaded): ${report.removedAsUploaded}`);
  console.log(`Remaining to review/upload: ${report.remainingImages}`);
  console.log(`  - without detectable item no: ${report.remainingWithoutItemNo}`);
  console.log(`Pending folder: ${options.output}`);
  console.log(`Report: ${reportPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
