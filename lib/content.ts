import fs from "node:fs";
import path from "node:path";

const DATA_FILE = path.join(process.cwd(), "data", "calc.csv");

export interface CalculatorRecord {
  category: string;
  subcategory: string | null;
  /**
   * Slug of the calculator (last segment).
   */
  slug: string;
  /**
   * Normalized absolute path starting with "/".
   */
  fullPath: string;
  /**
   * Nested path segments, e.g. ["finance", "personal", "feet-to-meters-converter"]
   */
  segments: string[];
  title: string;
  trafficEstimate: number;
  publishDate: string | null;
}

export interface CategorySummary {
  slug: string;
  label: string;
  calculators: CalculatorRecord[];
  subcategories: SubcategorySummary[];
  trafficTotal: number;
}

export interface SubcategorySummary {
  slug: string;
  label: string;
  calculators: CalculatorRecord[];
  trafficTotal: number;
}

interface ContentCache {
  calculators: CalculatorRecord[];
  calculatorMap: Map<string, CalculatorRecord>;
  categories: Map<string, CategorySummary>;
}

let cache: ContentCache | null = null;

function ensureCache(): ContentCache {
  if (cache) {
    return cache;
  }

  const file = fs.readFileSync(DATA_FILE, "utf-8");
  const rows = parseCsv(file);

  if (rows.length === 0) {
    throw new Error(`Content file ${DATA_FILE} has no rows`);
  }

  const header = rows[0];
  const dataRows = rows.slice(1);

  const calculators = dataRows
    .map((columns, index) => {
      const row = rowToRecord(header, columns);

      if (!row.slug) {
        throw new Error(`Missing slug at row ${index + 2}`);
      }

      const fullPath = normalizePath(row.slug);
      const segments = fullPath
        .split("/")
        .filter(Boolean);

      return {
        category: row.category?.trim() || "uncategorized",
        subcategory: row.subcategory?.trim() || null,
        slug: segments[segments.length - 1] ?? "",
        fullPath,
        segments,
        title: row.title.trim(),
        trafficEstimate: Number.parseInt(row.traffic_estimate ?? "0", 10),
        publishDate: normalizeDate(row.New_Publish_Date)
      } satisfies CalculatorRecord;
    })
    .sort((a, b) => {
      if (a.category === b.category) {
        return a.title.localeCompare(b.title);
      }
      return a.category.localeCompare(b.category);
    });

  const calculatorMap = new Map<string, CalculatorRecord>();
  const categoryMap = new Map<string, CategorySummary>();

  for (const calculator of calculators) {
    if (calculatorMap.has(calculator.fullPath)) {
      throw new Error(`Duplicate calculator path detected: ${calculator.fullPath}`);
    }

    calculatorMap.set(calculator.fullPath, calculator);

    const categoryKey = calculator.category;
    const categorySlug = toSlug(categoryKey);

    if (!categoryMap.has(categoryKey)) {
      categoryMap.set(categoryKey, {
        slug: categorySlug,
        label: categoryKey,
        calculators: [],
        subcategories: [],
        trafficTotal: 0
      });
    }

    const category = categoryMap.get(categoryKey)!;
    category.calculators.push(calculator);
    category.trafficTotal += calculator.trafficEstimate;

    if (calculator.subcategory) {
      let subcategory = category.subcategories.find(
        (item) => item.label === calculator.subcategory
      );

      if (!subcategory) {
        subcategory = {
          slug: toSlug(calculator.subcategory),
          label: calculator.subcategory,
          calculators: [],
          trafficTotal: 0
        };
        category.subcategories.push(subcategory);
      }

      subcategory.calculators.push(calculator);
      subcategory.trafficTotal += calculator.trafficEstimate;
    }
  }

  categoryMap.forEach((category) => {
    category.subcategories.sort((a, b) => b.trafficTotal - a.trafficTotal);
    category.calculators.sort((a, b) => b.trafficEstimate - a.trafficEstimate);
  });

  cache = {
    calculators,
    calculatorMap,
    categories: categoryMap
  };

  return cache;
}

type CsvRow = Record<string, string>;

function rowToRecord(header: string[], values: string[]): CsvRow {
  return header.reduce<CsvRow>((acc, key, index) => {
    acc[key] = values[index] ?? "";
    return acc;
  }, {});
}

function normalizePath(slug: string) {
  const trimmed = slug.trim();
  if (!trimmed) {
    throw new Error("Slug cannot be empty");
  }

  const normalized = trimmed.replace(/\/+/g, "/");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function normalizeDate(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const [month, day, year] = normalized.split(/[/-]/).map((part) => Number.parseInt(part, 10));
  if (Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(year)) {
    return null;
  }

  const iso = new Date(Date.UTC(year, month - 1, day)).toISOString();
  return iso.split("T")[0] ?? null;
}

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function parseCsv(content: string): string[][] {
  const lines: string[][] = [];
  let current: string[] = [];
  let cell = "";
  let insideQuotes = false;

  const pushCell = () => {
    current.push(cell);
    cell = "";
  };

  const pushRow = () => {
    pushCell();
    lines.push(current);
    current = [];
  };

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const next = content[i + 1];

    if (char === "\"") {
      if (insideQuotes && next === "\"") {
        cell += "\"";
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      pushCell();
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") {
        i++;
      }

      pushRow();
    } else {
      cell += char;
    }
  }

  if (cell !== "" || current.length > 0) {
    pushRow();
  }

  return lines.filter((row) => row.length > 0);
}

export function getAllCalculators(): CalculatorRecord[] {
  return ensureCache().calculators;
}

export function getCalculatorByPath(pathname: string): CalculatorRecord | undefined {
  const normalized = normalizePath(pathname);
  return ensureCache().calculatorMap.get(normalized);
}

export function getCalculatorPaths(): string[] {
  return getAllCalculators().map((calculator) => calculator.fullPath);
}

export function getCategories(): CategorySummary[] {
  return Array.from(ensureCache().categories.values()).sort(
    (a, b) => b.trafficTotal - a.trafficTotal
  );
}

export function getCategoryBySlug(slug: string): CategorySummary | undefined {
  const categories = ensureCache().categories;
  for (const category of categories.values()) {
    if (category.slug === slug) {
      return category;
    }
  }
  return undefined;
}

export function invalidateCache() {
  cache = null;
}

export function getSubcategoryBySlug(
  categorySlug: string,
  subcategorySlug: string
): { category: CategorySummary; subcategory: SubcategorySummary } | undefined {
  const category = getCategoryBySlug(categorySlug);
  if (!category) {
    return undefined;
  }

  const subcategory = category.subcategories.find((item) => item.slug === subcategorySlug);
  if (!subcategory) {
    return undefined;
  }

  return { category, subcategory };
}

export function getTopCalculators(limit = 12): CalculatorRecord[] {
  return getAllCalculators()
    .slice()
    .sort((a, b) => b.trafficEstimate - a.trafficEstimate)
    .slice(0, limit);
}

export interface PublishScheduleItem {
  path: string;
  title: string;
  publishDate: string;
}

export function getUpcomingPublishSchedule(): PublishScheduleItem[] {
  return getAllCalculators()
    .filter((calculator): calculator is CalculatorRecord & { publishDate: string } => {
      return Boolean(calculator.publishDate);
    })
    .map((calculator) => ({
      path: calculator.fullPath,
      title: calculator.title,
      publishDate: calculator.publishDate!
    }))
    .sort((a, b) => a.publishDate.localeCompare(b.publishDate));
}
