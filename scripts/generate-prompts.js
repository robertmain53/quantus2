#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

// Resolve paths relative to project root, not script location
const PROJECT_ROOT = path.resolve(__dirname, "..");

function parseDate(value) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const parts = normalized.split("/");
  if (parts.length !== 3) {
    return null;
  }

  const [month, day, year] = parts.map((part) => parseInt(part, 10));
  if (Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(year)) {
    return null;
  }

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
      const category = parts[0]?.trim() || "";
      const subcategory = parts[1]?.trim() || "";
      const slug = parts[2]?.trim() || "";
      const title = parts[3]?.trim() || "";
      const traffic = parts[4]?.trim() || "";
      const publishDate = parseDate(parts[5]);

      return {
        category,
        subcategory,
        slug,
        title,
        traffic,
        publishDate,
        raw: line
      };
    })
    .filter((row) => row.slug && row.title);
}

function selectPublishedRows(rows) {
  const today = new Date();
  return rows.filter(
    (row) => row.publishDate === null || row.publishDate <= today
  );
}

function buildTemplate() {
  const readme = fs.readFileSync(path.join(PROJECT_ROOT, "README.md"), "utf8");
  const anchor = "Replace the bracketed placeholders in the template below";
  const start = readme.indexOf(anchor);
  if (start === -1) {
    throw new Error("Could not find the prompt anchor in README.md");
  }

  const codeBlockStart = readme.indexOf("```text", start);
  if (codeBlockStart === -1) {
    throw new Error("Template block not found in README.md");
  }

  const codeBlockEnd = readme.indexOf("```", codeBlockStart + "```text".length);
  if (codeBlockEnd === -1) {
    throw new Error("Template block not properly terminated");
  }

  return readme
    .slice(codeBlockStart + "```text".length, codeBlockEnd)
    .trim();
}

function findMatchingZip(slug) {
  const slugFragment = slug.replace(/^\//, "").split("/").pop() || "";
  const base = slugFragment.replace("-converter", "").toLowerCase();
  const inputRoot = path.join(PROJECT_ROOT, "input");
  if (!fs.existsSync(inputRoot)) {
    return [];
  }

  const zipFiles = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (
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
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function main() {
  const rows = readCalcRows();
  const published = selectPublishedRows(rows);
  const template = buildTemplate();
  ensureDir(path.join(PROJECT_ROOT, "generated", "prompts"));

  published.forEach((row) => {
    const sanitizedTitle = row.title || "the calculator";
    const filledTemplate = template.replace(
      "[CALCULATOR NAME]",
      sanitizedTitle
    );

    const schemaRules = fs.readFileSync(path.join(PROJECT_ROOT, "scripts", "generate-prompts", "SCHEMA_STRICT_RULES.md"), "utf8");

    const extraInstructions = [
      "STRICT SCHEMA ENFORCEMENT:",
      schemaRules,
      "\nBefore you construct the config, scan the ./input folder and all subdirectories for competitor research assets (HTML snapshots, spreadsheets, or PDFs) and let the response draw from that corpus to raise information depth, EEAT, SEO, UX, and transparency.",
      "Also mention which internal Cernarus pages (e.g., category hubs or sibling calculators) provide related context, but avoid repeating any URLs already used in the citations that follow.",
      "Persistence note: if you include the wrapper, the repo saves only the inner config_json file under data/configs/...; do not introduce wrapper-specific keys into config_json."
    ].join(" ");

    const internalLinks = collectInternalLinks(rows, row);
    const assets = findMatchingZip(row.slug);

    const promptEntry = {
      slug: row.slug,
      title: sanitizedTitle,
      prompt: `${filledTemplate}\n\n${extraInstructions}`,
      context: {
        internalLinks,
        researchDirs: ["input"]
      },
      assets: {
        zips: assets
      }
    };

    const outputPath = path.join(
      PROJECT_ROOT,
      "generated",
      "prompts",
      `${formatSlugName(row.slug)}.json`
    );
    fs.writeFileSync(outputPath, JSON.stringify(promptEntry, null, 2));
    console.log(`Prepared prompt for ${row.title} -> ${outputPath}`);
  });
}

main();
