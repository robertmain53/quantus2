#!/usr/bin/env node

/**
 * Add a calculator to data/calc.csv with inline config JSON
 *
 * Usage:
 *   node scripts/add-calculator.js \
 *     --category "Conversions" \
 *     --subcategory "Illuminance" \
 *     --slug "/conversions/illuminance/lumens-to-lux-converter" \
 *     --title "Convert Lumens to Lux – Light Converter" \
 *     --traffic 10000 \
 *     --date "11/28/2025" \
 *     --config path/to/config.json
 */

const fs = require("node:fs");
const path = require("node:path");
const { createWriteStream } = require("node:fs");

const PROJECT_ROOT = path.resolve(__dirname, "..");

function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i].startsWith("--")) {
      const key = process.argv[i].slice(2);
      if (key === "help") {
        console.log(`Usage: node scripts/add-calculator.js \\
  --category <category> \\
  --subcategory <subcategory> \\
  --slug <slug> \\
  --title <title> \\
  --traffic <traffic_estimate> \\
  --date <MM/DD/YYYY> \\
  --config <path/to/config.json>

Example:
  node scripts/add-calculator.js \\
    --category "Conversions" \\
    --subcategory "Illuminance" \\
    --slug "/conversions/illuminance/lumens-to-lux-converter" \\
    --title "Convert Lumens to Lux – Light Converter" \\
    --traffic 10000 \\
    --date "11/28/2025" \\
    --config data/configs/lumens-to-lux-converter.json`);
        process.exit(0);
      }
      const value = process.argv[i + 1];
      if (!value || value.startsWith("--")) {
        console.error(`Error: --${key} requires a value`);
        process.exit(1);
      }
      args[key] = value;
      i++;
    }
  }
  return args;
}

function validateArgs(args) {
  const required = ["category", "subcategory", "slug", "title", "traffic", "date", "config"];
  const missing = required.filter(key => !args[key]);
  if (missing.length > 0) {
    console.error(`Error: Missing required arguments: ${missing.join(", ")}`);
    console.error("\nUsage:");
    console.error("  node scripts/add-calculator.js \\");
    console.error("    --category <category> \\");
    console.error("    --subcategory <subcategory> \\");
    console.error("    --slug <slug> \\");
    console.error("    --title <title> \\");
    console.error("    --traffic <traffic_estimate> \\");
    console.error("    --date <MM/DD/YYYY> \\");
    console.error("    --config <path/to/config.json>");
    process.exit(1);
  }
}

function loadConfig(configPath) {
  const fullPath = path.resolve(configPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`Error: Config file not found: ${fullPath}`);
    process.exit(1);
  }

  let configContent = fs.readFileSync(fullPath, "utf8");
  let config;

  try {
    // Try parsing as raw JSON first
    config = JSON.parse(configContent);

    // If it has the wrapper structure (component_type + config_json),
    // extract just the config_json part
    if (config.component_type && config.config_json) {
      config = config.config_json;
    }
  } catch (e) {
    console.error(`Error: Failed to parse config JSON: ${e.message}`);
    process.exit(1);
  }

  return config;
}

function escapeForCSV(value) {
  // If the value contains quotes or commas, wrap in quotes and escape internal quotes
  if (typeof value === "object") {
    value = JSON.stringify(value);
  }

  value = String(value);

  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function main() {
  const args = parseArgs();
  validateArgs(args);

  const config = loadConfig(args.config);
  const csvPath = path.join(PROJECT_ROOT, "data", "calc.csv");

  // Build CSV row
  const row = [
    args.category,
    args.subcategory,
    args.slug,
    args.title,
    args.traffic,
    args.date,
    config.component_type || "converter", // fallback to 'converter' if not in config
    JSON.stringify(config) // config_json as escaped JSON string
  ];

  // Escape each field for CSV
  const escapedRow = row.map(escapeForCSV).join(",");

  // Append to CSV
  try {
    fs.appendFileSync(csvPath, escapedRow + "\n", "utf8");
    console.log(`✓ Calculator added successfully!`);
    console.log(`  Category: ${args.category}`);
    console.log(`  Subcategory: ${args.subcategory}`);
    console.log(`  Slug: ${args.slug}`);
    console.log(`  Title: ${args.title}`);
    console.log(`  Component Type: ${config.component_type || "converter"}`);
    console.log(`\nConfig saved to: ${csvPath}`);
  } catch (e) {
    console.error(`Error: Failed to append to CSV: ${e.message}`);
    process.exit(1);
  }
}

main();
