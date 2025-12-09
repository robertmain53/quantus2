import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

interface CsvRow {
  [key: string]: string;
}

interface SummaryEntry {
  slug: string;
  title: string;
  category: string;
  subcategory: string | null;
  trafficEstimate: number;
  publishDate: string | null;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CSV_PATH = path.join(ROOT, "data", "calc.csv");
const CONFIG_DIR = path.join(ROOT, "data", "configs");
const SUMMARY_PATH = path.join(ROOT, "data", "summary.json");

function parseCsv(content: string): CsvRow[] {
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) {
    return [];
  }

  const headers = lines[0].split(",").map((header) => header.trim());
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;

    const values = line.split(",");
    const row: CsvRow = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

function normalizeSlug(value: string): string {
  if (!value) return "";
  return value.startsWith("/") ? value : `/${value}`;
}

function readConfigTitle(filename: string): string | null {
  if (!filename) return null;
  const filePath = path.join(CONFIG_DIR, filename);
  if (!fs.existsSync(filePath)) return null;

  try {
    const payload = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(payload);
    if (json && typeof json.metadata?.title === "string") {
      return json.metadata.title;
    }
  } catch {
    return null;
  }

  return null;
}

function buildSummary(entries: CsvRow[]): SummaryEntry[] {
  const summary: SummaryEntry[] = [];

  for (const row of entries) {
    const slug =
      normalizeSlug(row.slug ?? row.Slug ?? row.path ?? row.Path ?? "");
    if (!slug) {
      continue;
    }

    const titleFromCsv = row.title ?? row.Title ?? "";
    const title =
      readConfigTitle(row.config_json ?? row.Config ?? "") || titleFromCsv || "";

    const category = row.category ?? row.Category ?? "uncategorized";
    const subcategory = row.subcategory ?? row.Subcategory ?? null;
    const trafficEstimate =
      Number.parseInt(row.traffic_estimate ?? row["traffic_estimate"] ?? "0", 10) || 0;
    const publishDate = row.New_Publish_Date ?? row.publish_date ?? row.Publish_Date ?? null;

    summary.push({
      slug,
      title,
      category,
      subcategory,
      trafficEstimate,
      publishDate
    });
  }

  return summary;
}

function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error("Missing data/calc.csv");
    process.exit(1);
  }

  const raw = fs.readFileSync(CSV_PATH, "utf-8");
  const rows = parseCsv(raw);
  const summary = buildSummary(rows);
  fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2));
  console.log(`Generated summary.json with ${summary.length} entries`);
}

main();
