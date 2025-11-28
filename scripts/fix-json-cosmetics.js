#!/usr/bin/env node

/**
 * Auto-fix predictable cosmetic issues in calculator JSON configs
 *
 * Usage:
 *   node scripts/fix-json-cosmetics.js --config path/to/config.json [--in-place]
 *   node scripts/fix-json-cosmetics.js --config path/to/config.json --dry-run
 *
 * Fixes:
 * 1. Markdown URLs in citations: [url](url) → url
 * 2. Validates JSON after fixes
 *
 * Options:
 *   --config        Path to config JSON file (required)
 *   --in-place      Modify file directly (default: output to stdout)
 *   --dry-run       Show what would be fixed without modifying
 *   --verbose       Show details of each fix applied
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const configPath = args[args.indexOf('--config') + 1];
const inPlace = args.includes('--in-place');
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');

if (!configPath) {
  console.error('❌ Usage: node scripts/fix-json-cosmetics.js --config path/to/config.json [--in-place]');
  process.exit(1);
}

const fullConfigPath = path.resolve(configPath);

// ============================================================================
// Load the config JSON
// ============================================================================

let config;
let originalJson;

try {
  originalJson = fs.readFileSync(fullConfigPath, 'utf8');
  config = JSON.parse(originalJson);
} catch (err) {
  console.error(`❌ Failed to parse JSON at ${fullConfigPath}:`);
  console.error(`   ${err.message}`);
  process.exit(1);
}

// ============================================================================
// Detect wrapped vs unwrapped format
// ============================================================================

let cfg;
if (config.component_type && config.config_json) {
  // Wrapped format
  cfg = config.config_json;
} else if (config.version && config.metadata && config.logic) {
  // Unwrapped format - need to wrap it for consistency
  config = {
    component_type: config.logic.type === 'conversion' ? 'converter' : (config.form ? 'simple_calc' : 'advanced_calc'),
    config_json: config
  };
  cfg = config.config_json;
} else {
  console.error('❌ Unknown JSON structure - cannot determine if wrapped or unwrapped');
  process.exit(1);
}

// ============================================================================
// Fix Markdown URLs in citations
// ============================================================================

const fixes = [];

// Regex to match Markdown URL format: [text](url)
// Captures the URL (group 2) and discards the text (group 1)
const markdownUrlRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;

if (cfg && cfg.page_content && cfg.page_content.citations) {
  const citations = cfg.page_content.citations;

  for (let i = 0; i < citations.length; i++) {
    const citation = citations[i];

    if (citation.url && typeof citation.url === 'string') {
      const originalUrl = citation.url;

      // Check if URL contains Markdown format
      if (markdownUrlRegex.test(originalUrl)) {
        // Reset regex (it's stateful)
        markdownUrlRegex.lastIndex = 0;

        // Replace Markdown URLs with plain URLs
        // [text](url) becomes just url
        const fixedUrl = originalUrl.replace(markdownUrlRegex, '$2');

        citation.url = fixedUrl;

        fixes.push({
          type: 'Markdown URL',
          location: `citations[${i}]`,
          before: originalUrl,
          after: fixedUrl
        });

        if (verbose) {
          console.log(`✓ Fixed Markdown URL in citations[${i}]:`);
          console.log(`  Before: ${originalUrl.substring(0, 70)}...`);
          console.log(`  After:  ${fixedUrl.substring(0, 70)}...`);
        }
      }
    }
  }
}

// ============================================================================
// Validate JSON after fixes
// ============================================================================

let jsonValid = false;
try {
  // Verify the modified config is still valid JSON
  const testJson = JSON.stringify(config);
  JSON.parse(testJson);
  jsonValid = true;
} catch (err) {
  console.error(`❌ JSON became invalid after fixes:`);
  console.error(`   ${err.message}`);
  process.exit(1);
}

// ============================================================================
// Output results
// ============================================================================

console.log(`\n📋 Cosmetics Fix Report: ${path.basename(fullConfigPath)}`);
console.log('='.repeat(60));

if (fixes.length === 0) {
  console.log('✅ No fixes needed - JSON is already clean\n');
  process.exit(0);
}

console.log(`\n✓ Found ${fixes.length} issue(s) to fix:\n`);

fixes.forEach((fix, i) => {
  console.log(`${i + 1}. ${fix.type} in ${fix.location}`);
  console.log(`   Before: ${fix.before.substring(0, 80)}`);
  console.log(`   After:  ${fix.after.substring(0, 80)}`);
  console.log();
});

console.log('='.repeat(60));

if (dryRun) {
  console.log('🔍 DRY RUN - No files modified\n');
  process.exit(0);
}

// ============================================================================
// Write output
// ============================================================================

if (inPlace) {
  try {
    const outputJson = JSON.stringify(config, null, 2) + '\n';
    fs.writeFileSync(fullConfigPath, outputJson, 'utf8');
    console.log(`✅ FIXED - File updated in place: ${fullConfigPath}\n`);
    process.exit(0);
  } catch (err) {
    console.error(`❌ Failed to write file:`);
    console.error(`   ${err.message}`);
    process.exit(1);
  }
} else {
  // Output to stdout
  const outputJson = JSON.stringify(config, null, 2);
  console.log('✅ FIXED - Output to stdout (use --in-place to modify file):\n');
  console.log(outputJson);
  console.log();
  process.exit(0);
}
