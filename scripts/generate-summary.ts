import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

interface CsvRow {
  [key: string]: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const CSV_PATH = path.join(PROJECT_ROOT, "data", "calc.csv");
const CONFIG_DIR = path.join(PROJECT_ROOT, "data", "configs");
const SUMMARY_PATH = path.join(PROJECT_ROOT, "data", "summary.json");

function parseCsv(content: string): CsvRow[] {
  const rows: CsvRow[] = [];
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) {
    return rows;
  }

  const header = lines[0]
    .split(",")
    .map((column) => column.trim());

  for (let rowIndex = 1; rowIndex < lines.length; rowIndex += 1) {
    const line = lines[rowIndex].trim();
    if (!line) {
      continue;
    }

    const parts = line.split(",");
    const row: CsvRow = {};
    header.forEach((column, index) => {
      row[column] = parts[index] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

function readConfigTitle(configPath: string): string | null {
  try {
    const payload = fs.readFileSync(configPath, "utf8");
    const json = JSON.parse(payload);
    if (json?.metadata?.title) {
      return String(json.metadata.title);
    }
  } catch {
    // ignore parsing errors and return null
  }
  return null;
}

function normalizeSlug(slug: string): string {
  if (!slug) {
    return "";
  }
  return slug.startsWith("/") ? slug : `/${slug}`;
}

function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`Missing ${CSV_PATH}`);
    process.exit(1);
  }

  const rawCsv = fs.readFileSync(CSV_PATH, "utf8");
  const rows = parseCsv(rawCsv);
  const summary: Array<Record<string, string | number>> = [];

  for (const row of rows) {
    const slug = normalizeSlug(row.slug ?? row.Slug ?? row["SLUG"] ?? "");
    if (!slug) {
      continue;
    }

    const category = row.category ?? row.Category ?? "uncategorized";
    const titleFromCsv = row.title ?? row.Title ?? "";
    const trafficEstimate =
      Number.parseInt(row.traffic_estimate ?? row["traffic_estimate"] ?? row["traffic"] ?? "0", 10) || 0;
    const publishDate = row.New_Publish_Date ?? row["publish_date"] ?? "";

    const configFilename = row.config_json ?? row["config_json"] ?? "";
    let title = titleFromCsv.trim() || "";

    if (configFilename) {
      const configPath = path.join(CONFIG_DIR, configFilename);
      if (fs.existsSync(configPath)) {
        const metadataTitle = readConfigTitle(configPath);
        if (metadataTitle) {
          title = metadataTitle;
        }
      }
    }

    summary.push({
      slug,
      title,
      category,
      subcategory: row.subcategory ?? row.Subcategory ?? null,
      trafficEstimate,
      publishDate
    });
  }

  fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2));
  console.log(`Summary written to ${path.relative(PROJECT_ROOT, SUMMARY_PATH)} (${summary.length} entries)`);
}

main();
