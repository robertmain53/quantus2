#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "..");

// ------------------------ Helpers ------------------------

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

function readCalcRows() {
  const csvPath = path.join(PROJECT_ROOT, "data", "calc.csv");
  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.trim().split(/\r?\n/);
  const header = lines[0].split(",");

  return lines
    .slice(1)
    .map((line) => {
      const parts = line.split(",");
      return {
        category: parts[0]?.trim() || "",
        subcategory: parts[1]?.trim() || "",
        slug: parts[2]?.trim() || "",
        title: parts[3]?.trim() || "",
        traffic: parts[4]?.trim() || "",
        publishDate: parseDate(parts[5]),
        raw: line
      };
    })
    .filter((row) => row.slug && row.title);
}

function buildTemplate() {
  const readme = fs.readFileSync(path.join(PROJECT_ROOT, "README.md"), "utf8");
  const anchor = "Replace the bracketed placeholders in the template below";
  const start = readme.indexOf(anchor);
  if (start === -1) throw new Error("Prompt anchor not found.");

  const codeBlockStart = readme.indexOf("```text", start);
  const codeBlockEnd = readme.indexOf("```", codeBlockStart + "```text".length);

  return readme
    .slice(codeBlockStart + "```text".length, codeBlockEnd)
    .trim();
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

function formatSlugName(slug) {
  return slug.replace(/^\//, "").replace(/\//g, "_");
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

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ------------------------ Main Logic ------------------------

function main() {
  const rows = readCalcRows();
  const template = buildTemplate();
  const promptsDir = path.join(PROJECT_ROOT, "generated", "prompts");
  ensureDir(promptsDir);

  const schemaRules = fs.readFileSync(
    path.join(PROJECT_ROOT, "scripts", "generate-prompts", "SCHEMA_STRICT_RULES.md"),
    "utf8"
  );

  const extraInstructions = [
    "STRICT SCHEMA ENFORCEMENT:",
    schemaRules,
    "\nBefore you construct the config, scan ./input for asset research. Use it to refine EEAT, UX, methodology depth.",
    "Mention sibling Cernarus pages only when relevant.",
    "Only the config_json object is persisted; wrapper keys must not appear in config_json."
  ].join(" ");

  const index = {};
  const seenFiles = new Map(); // filename → slug

  for (const row of rows) {
    const sanitizedTitle = row.title;
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

    // Duplicate filename behavior: last one wins
    if (fs.existsSync(outputPath)) {
      console.log(`Duplicate filename detected → replacing: ${filename}`);
      fs.unlinkSync(outputPath);
    }

    if (seenFiles.has(filename)) {
      console.log(
        `Duplicate filename generated for slugs:\n` +
          `  First: ${seenFiles.get(filename)}\n` +
          `  Second: ${row.slug}\n→ Keeping the SECOND version.`
      );
    }
    seenFiles.set(filename, row.slug);

    fs.writeFileSync(outputPath, JSON.stringify(promptEntry, null, 2));
    console.log(`Prepared prompt → ${outputPath}`);

    // Index: slug → relative prompt path
    index[row.slug] = `generated/prompts/${filename}`;
  }

  const indexPath = path.join(promptsDir, "index.json");
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`Wrote index → ${indexPath}`);
}

main();
