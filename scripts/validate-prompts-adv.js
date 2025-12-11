#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "..");

function readCalcRows() {
  const csvPath = path.join(PROJECT_ROOT, "data", "calc.csv");
  const raw = fs.readFileSync(csvPath, "utf8");
  const header = raw.trim().split(/\r?\n/)[0].split(",").map((h) => h.trim());
  const rows = raw
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const parts = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && line[i - 1] !== "\\") {
          inQuotes = !inQuotes;
          continue;
        }
        if (char === "," && !inQuotes) {
          parts.push(current);
          current = "";
          continue;
        }
        current += char;
      }
      parts.push(current);
      const record = header.reduce((acc, key, idx) => {
        acc[key] = parts[idx]?.trim() ?? "";
        return acc;
      }, {});
      return record;
    });
  return rows;
}

function main() {
  const rows = readCalcRows();
  const rowMap = rows.reduce((acc, row) => {
    acc[row.slug] = row;
    return acc;
  }, {});

  const promptsPath = path.join(PROJECT_ROOT, "generated", "prompts-adv");
  const indexPath = path.join(promptsPath, "index.json");
  if (!fs.existsSync(indexPath)) {
    console.error("Missing prompts index. Run generation first.");
    process.exit(1);
  }

  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  const errors = [];

  for (const slug of Object.keys(index)) {
    const promptPath = path.join(PROJECT_ROOT, index[slug]);
    if (!fs.existsSync(promptPath)) {
      errors.push(`Missing file for ${slug}`);
      continue;
    }
    const entry = JSON.parse(fs.readFileSync(promptPath, "utf8"));
    const row = rowMap[slug];
    if (!row) {
      errors.push(`No CSV row for ${slug}`);
      continue;
    }
    if (!entry.prompt.includes(row.title)) {
      errors.push(`Prompt for ${slug} missing title.`);
    }
    if (row.content_type === "Article" && !entry.prompt.includes("Ultimate Guide")) {
      errors.push(`Article prompt for ${slug} missing "Ultimate Guide" reference.`);
    }
  }

  if (errors.length > 0) {
    console.error("Validation failed:\n" + errors.join("\n"));
    process.exit(1);
  }

  console.log("All advanced prompts validated successfully.");
}

main();
