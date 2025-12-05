#!/usr/bin/env node

/**
 * Cernarus config linter / fixer
 *
 * Goals:
 * - Auto-coerce glossary arrays of strings to [{ term, definition }] objects.
 * - Auto-coerce form.result.outputs arrays of strings to proper objects.
 * - Flag (not auto-fix) form.sections[].fields issues before Next.js build.
 *
 * Run this before `next build`, e.g.:
 *   "build": "node scripts/lint-configs.js && next build"
 */

const fs = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const CONFIG_ROOT = path.join(PROJECT_ROOT, "data", "configs");

let changedFiles = 0;
let errorCount = 0;

/**
 * Recursively collect all .json files under CONFIG_ROOT
 */
function collectConfigFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectConfigFiles(full));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
      files.push(full);
    }
  }

  return files;
}

/**
 * Turn "ebit_margin" into "Ebit Margin"
 */
function prettifyLabel(id) {
  if (!id) return "";
  const base = String(id)
    .replace(/[_\-]+/g, " ")
    .trim();
  return base.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1));
}

/**
 * Coerce glossary to array of { term, definition } objects
 */
function fixGlossary(pageContent, filePath) {
  if (!pageContent || !Array.isArray(pageContent.glossary)) return false;

  let dirty = false;
  const original = pageContent.glossary;

  const fixed = original.map((item, index) => {
    // Case 1: already an object
    if (item && typeof item === "object") {
      const obj = { ...item };
      if (!obj.term && obj.definition) {
        obj.term = obj.definition;
        dirty = true;
      }
      if (!obj.definition && obj.term) {
        obj.definition = obj.term;
        dirty = true;
      }
      if (!obj.term && !obj.definition) {
        const fallback = `Glossary entry ${index + 1}`;
        obj.term = fallback;
        obj.definition = fallback;
        dirty = true;
      }
      return obj;
    }

    // Case 2: string → parse "Term: definition" or fallback
    if (typeof item === "string") {
      const raw = item.trim();
      if (!raw) {
        const fallback = `Glossary entry ${index + 1}`;
        dirty = true;
        return { term: fallback, definition: fallback };
      }

      const parts = raw.split(":");
      let term;
      let definition;

      if (parts.length > 1) {
        term = parts[0].trim();
        definition = parts.slice(1).join(":").trim();
      } else {
        term = raw;
        definition = raw;
      }

      dirty = true;
      return {
        term: term || raw,
        definition: definition || raw,
      };
    }

    // Case 3: unknown type → stringify
    dirty = true;
    const s = String(item);
    return { term: s, definition: s };
  });

  if (dirty) {
    console.log(
      `[lint-configs] Coerced glossary entries in ${path.relative(
        PROJECT_ROOT,
        filePath
      )}`
    );
    pageContent.glossary = fixed;
  }

  return dirty;
}

/**
 * Coerce form.result.outputs string[] → object[]
 */
function fixFormResultOutputs(form, filePath) {
  if (!form || !form.result || !Array.isArray(form.result.outputs))
    return false;

  let dirty = false;
  const outputs = form.result.outputs;

  if (outputs.length === 0) return false;

  // If they are strings, convert them
  if (typeof outputs[0] === "string") {
    form.result.outputs = outputs.map((id) => ({
      id,
      label: prettifyLabel(id),
    }));
    console.log(
      `[lint-configs] Coerced form.result.outputs to object[] in ${path.relative(
        PROJECT_ROOT,
        filePath
      )}`
    );
    dirty = true;
  } else {
    // Ensure every object has id + label
    form.result.outputs = outputs.map((o, index) => {
      if (!o || typeof o !== "object") {
        errorCount++;
        console.error(
          `[lint-configs] ERROR: form.result.outputs[${index}] is not an object in ${path.relative(
            PROJECT_ROOT,
            filePath
          )}`
        );
        return o;
      }
      if (!o.id) {
        errorCount++;
        console.error(
          `[lint-configs] ERROR: form.result.outputs[${index}] missing "id" in ${path.relative(
            PROJECT_ROOT,
            filePath
          )}`
        );
      }
      if (!o.label) {
        o.label = prettifyLabel(o.id || `output_${index + 1}`);
        dirty = true;
        console.log(
          `[lint-configs] Added label to form.result.outputs[${index}] in ${path.relative(
            PROJECT_ROOT,
            filePath
          )}`
        );
      }
      return o;
    });
  }

  return dirty;
}

/**
 * Validate form.sections[].fields structure
 * We don't auto-fix these, just flag them.
 */
function checkFormSections(form, filePath) {
  if (!form || !Array.isArray(form.sections)) return;

  form.sections.forEach((section, sIdx) => {
    if (!section || typeof section !== "object") {
      errorCount++;
      console.error(
        `[lint-configs] ERROR: form.sections[${sIdx}] is not an object in ${path.relative(
          PROJECT_ROOT,
          filePath
        )}`
      );
      return;
    }

    if (!Array.isArray(section.fields)) {
      errorCount++;
      console.error(
        `[lint-configs] ERROR: form.sections[${sIdx}].fields is not an array in ${path.relative(
          PROJECT_ROOT,
          filePath
        )}`
      );
      return;
    }

    section.fields.forEach((field, fIdx) => {
      if (!field || typeof field !== "object") {
        errorCount++;
        console.error(
          `[lint-configs] ERROR: form.sections[${sIdx}].fields[${fIdx}] is not an object in ${path.relative(
            PROJECT_ROOT,
            filePath
          )}`
        );
        return;
      }

      const missing = [];
      if (!field.id) missing.push("id");
      if (!field.label) missing.push("label");
      if (!field.type) missing.push("type");

      if (missing.length > 0) {
        errorCount++;
        console.error(
          `[lint-configs] ERROR: form.sections[${sIdx}].fields[${fIdx}] missing ${missing.join(
            ", "
          )} in ${path.relative(PROJECT_ROOT, filePath)}`
        );
      }
    });
  });
}

/**
 * Main per-file linter
 */
function lintConfigFile(filePath) {
  let dirty = false;

  let raw;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    errorCount++;
    console.error(
      `[lint-configs] ERROR: Failed to read ${path.relative(
        PROJECT_ROOT,
        filePath
      )}: ${err.message}`
    );
    return;
  }

  let json;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    errorCount++;
    console.error(
      `[lint-configs] ERROR: Invalid JSON in ${path.relative(
        PROJECT_ROOT,
        filePath
      )}: ${err.message}`
    );
    return;
  }

  const pageContent = json.page_content || json.pageContent;

  // 1) Fix glossary shape
  dirty = fixGlossary(pageContent, filePath) || dirty;

  // 2) Fix form.result.outputs
  dirty = fixFormResultOutputs(json.form, filePath) || dirty;

  // 3) Check form.sections structure
  checkFormSections(json.form, filePath);

  if (dirty) {
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
    changedFiles++;
  }
}

/**
 * Entry
 */
function main() {
  if (!fs.existsSync(CONFIG_ROOT)) {
    console.log(
      `[lint-configs] Config root not found, skipping: ${path.relative(
        PROJECT_ROOT,
        CONFIG_ROOT
      )}`
    );
    return;
  }

  const files = collectConfigFiles(CONFIG_ROOT);
  if (files.length === 0) {
    console.log("[lint-configs] No config files found under data/configs");
    return;
  }

  console.log(`[lint-configs] Scanning ${files.length} config file(s)...`);

  files.forEach(lintConfigFile);

  console.log(
    `[lint-configs] Done. Files changed: ${changedFiles}, errors: ${errorCount}`
  );

  // If there are structural errors, fail the process BEFORE Next.js build
  if (errorCount > 0) {
    console.error(
      "[lint-configs] Failing due to schema errors. Fix the reported issues before building."
    );
    process.exitCode = 1;
  }
}

main();
