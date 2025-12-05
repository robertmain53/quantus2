#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const PROMPTS_DIR = path.join(PROJECT_ROOT, "generated", "prompts");
const INPUT_DIR = path.join(PROJECT_ROOT, "input");

// ------------------------ Utility ------------------------

function safeReadJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[cleanup] Failed to read/parse JSON: ${filePath}`, err.message);
    return null;
  }
}

function listFilesRecursively(root, filterFn) {
  const out = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (!filterFn || filterFn(fullPath, entry)) {
        out.push(fullPath);
      }
    }
  }
  walk(root);
  return out;
}

function deleteIfEmptyDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir);
  if (entries.length === 0) {
    fs.rmdirSync(dir);
    console.log(`[cleanup] Removed empty directory: ${dir}`);
  }
}

function deleteEmptyDirsRecursively(root) {
  if (!fs.existsSync(root)) return;
  // post-order: children first
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      }
    }
    deleteIfEmptyDir(dir);
  }
  walk(root);
}

// ------------------------ Step 1: Read canonical slugs ------------------------

function readCalcSlugs() {
  const csvPath = path.join(PROJECT_ROOT, "data", "calc.csv");
  if (!fs.existsSync(csvPath)) {
    console.warn("[cleanup] data/calc.csv not found; skipping cleanup.");
    return new Set();
  }

  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.trim().split(/\r?\n/);
  if (lines.length <= 1) return new Set();

  const slugs = new Set();
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const parts = line.split(",");
    const slug = (parts[2] || "").trim();
    if (slug) slugs.add(slug);
  }
  return slugs;
}

// ------------------------ Step 2: Determine used prompt files ------------------------

function getUsedPromptFiles(slugsFromCsv) {
  const indexPath = path.join(PROMPTS_DIR, "index.json");
  if (!fs.existsSync(indexPath)) {
    console.warn("[cleanup] generated/prompts/index.json not found; skipping prompt cleanup.");
    return { usedPromptFiles: new Set(), usedPromptPaths: new Map() };
  }

  const index = safeReadJSON(indexPath) || {};
  const usedPromptFiles = new Set();
  const usedPromptPaths = new Map(); // slug → absolute path

  for (const slug of slugsFromCsv) {
    const relPath = index[slug];
    if (!relPath) {
      // slug has no prompt mapping; nothing to keep for it
      continue;
    }
    const absPath = path.join(PROJECT_ROOT, relPath);
    usedPromptFiles.add(absPath);
    usedPromptPaths.set(slug, absPath);
  }

  return { usedPromptFiles, usedPromptPaths };
}

// ------------------------ Step 3: Cleanup orphan prompt files ------------------------

function cleanupPromptFiles(usedPromptFiles) {
  if (!fs.existsSync(PROMPTS_DIR)) return;

  const allPromptFiles = listFilesRecursively(PROMPTS_DIR, (file) => {
    return file.endsWith(".json");
  });

  for (const filePath of allPromptFiles) {
    // Never delete index.json here
    if (path.basename(filePath) === "index.json") continue;

    if (!usedPromptFiles.has(filePath)) {
      // orphan prompt file
      fs.unlinkSync(filePath);
      console.log(`[cleanup] Deleted orphan prompt file: ${filePath}`);
    }
  }

  // After deleting, clean up empty dirs in promptsDir
  deleteEmptyDirsRecursively(PROMPTS_DIR);
}

// ------------------------ Step 4: Cleanup orphan zip files in input/ ------------------------

function collectUsedZipsFromPrompts(usedPromptFiles) {
  const usedZips = new Set();

  for (const filePath of usedPromptFiles) {
    const promptJson = safeReadJSON(filePath);
    if (!promptJson || !promptJson.assets || !Array.isArray(promptJson.assets.zips)) continue;

    for (const rel of promptJson.assets.zips) {
      const abs = path.join(PROJECT_ROOT, rel);
      usedZips.add(path.normalize(abs));
    }
  }

  return usedZips;
}

function cleanupZipFiles(usedZips) {
  if (!fs.existsSync(INPUT_DIR)) return;

  const allZips = listFilesRecursively(INPUT_DIR, (file) => file.toLowerCase().endsWith(".zip"));

  for (const zipPath of allZips) {
    const normalized = path.normalize(zipPath);
    if (!usedZips.has(normalized)) {
      fs.unlinkSync(normalized);
      console.log(`[cleanup] Deleted orphan zip: ${normalized}`);
    }
  }

  // Clean empty directories under input/
  deleteEmptyDirsRecursively(INPUT_DIR);
}

// ------------------------ Main ------------------------

function main() {
  console.log("[cleanup] Starting prompt & asset cleanup...");

  const slugsFromCsv = readCalcSlugs();
  console.log(`[cleanup] Slugs from CSV: ${slugsFromCsv.size}`);

  const { usedPromptFiles, usedPromptPaths } = getUsedPromptFiles(slugsFromCsv);
  console.log(`[cleanup] Prompt files referenced by CSV slugs: ${usedPromptFiles.size}`);

  // 1) Remove orphan prompt files
  cleanupPromptFiles(usedPromptFiles);

  // 2) Remove orphan zips (not referenced in prompt assets.zips)
  const usedZips = collectUsedZipsFromPrompts(usedPromptFiles);
  console.log(`[cleanup] Zip files referenced in prompt assets: ${usedZips.size}`);
  cleanupZipFiles(usedZips);

  console.log("[cleanup] Done.");
}

main();
