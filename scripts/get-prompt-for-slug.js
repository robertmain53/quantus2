const fs = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "..");

// Load the canonical slug → prompt path index
const PROMPT_INDEX_PATH = path.join(
  PROJECT_ROOT,
  "generated",
  "prompts",
  "index.json"
);

let promptIndex = {};
if (fs.existsSync(PROMPT_INDEX_PATH)) {
  promptIndex = JSON.parse(fs.readFileSync(PROMPT_INDEX_PATH, "utf8"));
} else {
  // You likely want to run generate-prompts first if this happens
  console.warn(
    "[get-prompt-for-slug] Warning: prompt index not found at",
    PROMPT_INDEX_PATH
  );
}

/**
 * Get the prompt JSON for a given slug.
 *
 * - slug MUST exactly match a key in generated/prompts/index.json
 * - If not found, this throws (no fuzzy matching, no fallbacks).
 *
 * @param {string} slug e.g. "/conversions/data-storage/bytes-to-mebibytes-converter"
 * @returns {object} parsed prompt JSON
 */
function getPromptForSlug(slug) {
  if (!slug || typeof slug !== "string") {
    throw new Error(
      `[get-prompt-for-slug] Invalid slug argument: ${JSON.stringify(slug)}`
    );
  }

  const promptPath = promptIndex[slug];

  if (!promptPath) {
    // No fuzzy matching allowed: the whole point is one prompt per slug.
    throw new Error(
      `[get-prompt-for-slug] No prompt found for slug: ${slug}. ` +
        `Make sure generate-prompts.js has been run and calc.csv contains this slug.`
    );
  }

  const fullPath = path.join(PROJECT_ROOT, promptPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(
      `[get-prompt-for-slug] Prompt file missing on disk for slug: ${slug}\n` +
        `Expected at: ${fullPath}`
    );
  }

  const raw = fs.readFileSync(fullPath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `[get-prompt-for-slug] Failed to parse prompt JSON for slug: ${slug}\n` +
        `File: ${fullPath}\n` +
        `Error: ${err.message}`
    );
  }
}

module.exports = {
  getPromptForSlug,
};
