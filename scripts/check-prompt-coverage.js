#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "..");

function readCalcSlugs() {
  const csvPath = path.join(PROJECT_ROOT, "data", "calc.csv");
  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.trim().split(/\r?\n/);
  if (lines.length <= 1) {
    return [];
  }

  // We only care about slugs (column index 2)
  const slugs = [];
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const parts = line.split(",");
    const slug = (parts[2] || "").trim();
    if (slug) slugs.push(slug);
  }
  return slugs;
}

function main() {
  const indexPath = path.join(
    PROJECT_ROOT,
    "generated",
    "prompts",
    "index.json"
  );

  if (!fs.existsSync(indexPath)) {
    console.error(
      "[check-prompt-coverage] Missing generated/prompts/index.json. " +
        "Run scripts/generate-prompts.js first."
    );
    process.exitCode = 1;
    return;
  }

  const promptIndex = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  const slugs = readCalcSlugs();

  let missing = 0;

  for (const slug of slugs) {
    if (!promptIndex[slug]) {
      console.error(
        `[check-prompt-coverage] Missing prompt mapping for slug: ${slug}`
      );
      missing++;
    }
  }

  if (missing > 0) {
    console.error(
      `\n[check-prompt-coverage] Found ${missing} slug(s) with no dedicated prompt.`
    );
    process.exitCode = 1;
  } else {
    console.log(
      "[check-prompt-coverage] All slugs in data/calc.csv have a dedicated prompt file ✅"
    );
  }
}

main();
