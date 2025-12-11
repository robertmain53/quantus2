#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "..");

function parseDate(value) {
  if (!value) return null;
  const normalized = value.trim();
  if (!normalized) return null;
  const parts = normalized.split("/");
  if (parts.length !== 3) return null;
  const [month, day, year] = parts.map((p) => parseInt(p, 10));
  if (Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(year)) return null;
  return new Date(year, month - 1, day);
}

function splitCSVLine(line) {
  const segments = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i - 1] !== "\\") {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      segments.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  segments.push(current);
  return segments;
}

function readCalcRows() {
  const csvPath = path.join(PROJECT_ROOT, "data", "calc.csv");
  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.trim().split(/\r?\n/);
  const header = lines[0].split(",").map((h) => h.trim());

  return lines
    .slice(1)
    .map((line) => {
      const parts = splitCSVLine(line);
      const record = header.reduce((acc, key, idx) => {
        acc[key] = parts[idx]?.trim() ?? "";
        return acc;
      }, {});
      return {
        ...record,
        publishDate: parseDate(record.New_Publish_Date),
        raw: line
      };
    })
    .filter((row) => row.slug && row.title);
}

function loadTemplate(contentType) {
  const templateName = contentType === "Article" ? "article-adv.txt" : "tool-adv.txt";
  const templatePath = path.join(
    PROJECT_ROOT,
    "scripts",
    "generate-prompts",
    "templates-adv",
    templateName
  );
  if (!fs.existsSync(templatePath)) throw new Error(`Template missing: ${templateName}`);
  return fs.readFileSync(templatePath, "utf8").trim();
}

function formatSlugName(slug) {
  return slug.replace(/^\//, "").replace(/\//g, "_");
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function collectInternalLinks(rows, current) {
  return rows
    .filter(
      (row) =>
        row.slug !== current.slug &&
        row.category === current.category &&
        row.slug.startsWith("/conversions")
    )
    .slice(0, 3)
    .map((row) => row.slug);
}

function buildExtraInstructions() {
  const schemaRules = fs.readFileSync(
    path.join(PROJECT_ROOT, "scripts", "generate-prompts", "SCHEMA_STRICT_RULES.md"),
    "utf8"
  );
  return [
    "STRICT SCHEMA ENFORCEMENT:",
    schemaRules,
    "\nBefore you construct the config, scan ./input for asset research. Use it to refine EEAT, UX, methodology depth.",
    "Mention sibling Cernarus pages only when relevant.",
    "Only the config_json object is persisted; wrapper keys must not appear in config_json."
  ].join(" ");
}

function findMatchingZip(slug) {
  const slugFragment = slug.replace(/^\//, "").split("/").pop() || "";
  const base = slugFragment.replace("-converter", "").toLowerCase();
  const inputRoot = path.join(PROJECT_ROOT, "input");
  if (!fs.existsSync(inputRoot)) return [];
  const zipFiles = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (
        entry.isFile() &&
        entry.name.toLowerCase().includes(base) &&
        entry.name.toLowerCase().endsWith(".zip")
      ) {
        zipFiles.push(path.relative(".", fullPath));
      }
    }
  };
  walk(inputRoot);
  return zipFiles;
}

function main() {
  const rows = readCalcRows();
  const promptsDir = path.join(PROJECT_ROOT, "generated", "prompts-adv");
  ensureDir(promptsDir);

  const extraInstructions = buildExtraInstructions();
  const index = {};
  const seenFiles = new Map();

  for (const row of rows) {
    const sanitizedTitle = row.title;
    const contentType = row.content_type || "Tool";
    const template = loadTemplate(contentType);
    const filledTemplate = template.replace("[CALCULATOR NAME]", sanitizedTitle);

    const internalLinks = collectInternalLinks(rows, row);
    const assets = findMatchingZip(row.slug);

    const promptEntry = {
      slug: row.slug,
      title: sanitizedTitle,
      prompt: `${filledTemplate}\n\n${extraInstructions}`,
      context: { internalLinks, researchDirs: ["input"] },
      assets: { zips: assets }
    };

    const filename = `${formatSlugName(row.slug)}.json`;
    const outputPath = path.join(promptsDir, filename);

    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    seenFiles.set(filename, row.slug);

    fs.writeFileSync(outputPath, JSON.stringify(promptEntry, null, 2));
    index[row.slug] = `generated/prompts-adv/${filename}`;
  }

  fs.writeFileSync(path.join(promptsDir, "index.json"), JSON.stringify(index, null, 2));
  console.log("Advanced prompts generated.");
}

main();
