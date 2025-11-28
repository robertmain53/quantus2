#!/usr/bin/env node

/**
 * Validate JSON calculator config against unit system and schema requirements
 *
 * Usage:
 *   node scripts/validate-json-units.js --config path/to/config.json
 *   node scripts/validate-json-units.js --config path/to/config.json --verbose
 *
 * Checks:
 * 1. Unit IDs (fromUnitId, toUnitId) exist in lib/conversions.ts
 * 2. Unit IDs match exactly (case-sensitive)
 * 3. fromUnitId and toUnitId are the same unit kind
 * 4. Markdown URLs in citations ([url](url) format)
 * 5. Internal links point to valid categories
 * 6. JSON structure is valid
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const configPath = args[args.indexOf('--config') + 1];
const verbose = args.includes('--verbose');

if (!configPath) {
  console.error('❌ Usage: node scripts/validate-json-units.js --config path/to/config.json');
  process.exit(1);
}

const PROJECT_ROOT = path.resolve(__dirname, '..');
const fullConfigPath = path.resolve(configPath);

// ============================================================================
// Step 1: Load and parse the config JSON
// ============================================================================

let config;
let isWrapped = false;

try {
  const rawJson = fs.readFileSync(fullConfigPath, 'utf8');
  const parsed = JSON.parse(rawJson);

  // Check if this is wrapped (has component_type) or unwrapped (direct config_json)
  if (parsed.component_type && parsed.config_json) {
    // Already wrapped with component_type
    config = parsed;
    isWrapped = true;
  } else if (parsed.version && parsed.metadata && parsed.logic) {
    // This is the inner config_json, wrap it
    config = {
      component_type: parsed.logic.type === 'conversion' ? 'converter' : (parsed.form ? 'simple_calc' : 'advanced_calc'),
      config_json: parsed
    };
    isWrapped = false;
  } else {
    throw new Error('Unknown JSON structure - cannot determine if wrapped or unwrapped');
  }
} catch (err) {
  console.error(`❌ Failed to parse JSON at ${fullConfigPath}:`);
  console.error(`   ${err.message}`);
  process.exit(1);
}

// ============================================================================
// Step 2: Extract valid unit IDs from lib/conversions.ts
// ============================================================================

let validUnitIds = new Set();
let unitKinds = new Map(); // Maps unitId -> kind

try {
  const conversionsPath = path.join(PROJECT_ROOT, 'lib', 'conversions.ts');
  const conversionsContent = fs.readFileSync(conversionsPath, 'utf8');

  // Extract unit IDs and kinds using regex
  // Looking for: id: "unitName", ... kind: "kindName"
  const unitRegex = /id:\s*["']([^"']+)["'][^}]*kind:\s*["']([^"']+)["']/gs;
  let match;

  while ((match = unitRegex.exec(conversionsContent)) !== null) {
    const unitId = match[1];
    const kind = match[2];
    validUnitIds.add(unitId);
    unitKinds.set(unitId, kind);
  }

  if (verbose) {
    console.log(`✓ Found ${validUnitIds.size} valid unit IDs`);
    console.log(`  Kinds: ${Array.from(new Set(unitKinds.values())).join(', ')}`);
  }
} catch (err) {
  console.error(`❌ Failed to read lib/conversions.ts:`);
  console.error(`   ${err.message}`);
  process.exit(1);
}

// ============================================================================
// Step 3: Validate the config
// ============================================================================

const issues = [];
const warnings = [];

// Check: component_type exists and is valid
if (!config.component_type) {
  issues.push('Missing "component_type" field');
} else if (!['converter', 'simple_calc', 'advanced_calc'].includes(config.component_type)) {
  issues.push(`Invalid component_type: "${config.component_type}" (must be converter, simple_calc, or advanced_calc)`);
}

// Check: config_json exists
if (!config.config_json) {
  issues.push('Missing "config_json" object');
  console.error(`❌ FAILED: ${issues.join(', ')}`);
  process.exit(1);
}

const cfg = config.config_json;

// Check: version is a string
if (typeof cfg.version !== 'string') {
  issues.push(`version must be string, got ${typeof cfg.version}`);
}

// Check: metadata has only title and description
if (!cfg.metadata || typeof cfg.metadata !== 'object') {
  issues.push('Missing or invalid metadata object');
} else {
  const metaKeys = Object.keys(cfg.metadata);
  const allowedMeta = ['title', 'description'];
  const extraKeys = metaKeys.filter(k => !allowedMeta.includes(k));
  if (extraKeys.length > 0) {
    issues.push(`Metadata has forbidden fields: ${extraKeys.join(', ')}`);
  }
}

// ============================================================================
// CRITICAL: Validate unit IDs for converters
// ============================================================================

if (cfg.logic && cfg.logic.type === 'conversion') {
  const fromUnitId = cfg.logic.fromUnitId;
  const toUnitId = cfg.logic.toUnitId;

  // Check: fromUnitId exists
  if (!fromUnitId) {
    issues.push('Missing logic.fromUnitId');
  } else if (!validUnitIds.has(fromUnitId)) {
    issues.push(`❌ CRITICAL: fromUnitId "${fromUnitId}" NOT FOUND in lib/conversions.ts`);
    if (verbose) {
      issues.push(`   Valid IDs: ${Array.from(validUnitIds).sort().join(', ')}`);
    }
  }

  // Check: toUnitId exists
  if (!toUnitId) {
    issues.push('Missing logic.toUnitId');
  } else if (!validUnitIds.has(toUnitId)) {
    issues.push(`❌ CRITICAL: toUnitId "${toUnitId}" NOT FOUND in lib/conversions.ts`);
    if (verbose) {
      issues.push(`   Valid IDs: ${Array.from(validUnitIds).sort().join(', ')}`);
    }
  }

  // Check: Both units exist and are same kind
  // Exception: Ingredient-specific converters (flour, sugar, etc.) are allowed to mix unit kinds (volume → weight)
  if (validUnitIds.has(fromUnitId) && validUnitIds.has(toUnitId)) {
    const fromKind = unitKinds.get(fromUnitId);
    const toKind = unitKinds.get(toUnitId);

    // Detect ingredient-specific converters by looking for ingredient keywords in title/description
    const title = (cfg.metadata?.title || '').toLowerCase();
    const description = (cfg.metadata?.description || '').toLowerCase();
    const isIngredientConverter = /\b(flour|sugar|butter|oil|milk|egg|ingredient|baking|cooking|kitchen)\b/i.test(title + ' ' + description);

    if (fromKind !== toKind && !isIngredientConverter) {
      issues.push(`❌ CRITICAL: Unit mismatch - fromUnitId "${fromUnitId}" is ${fromKind}, but toUnitId "${toUnitId}" is ${toKind}`);
    } else if (verbose) {
      if (isIngredientConverter && fromKind !== toKind) {
        console.log(`✓ Ingredient converter (${fromUnitId}: ${fromKind} → ${toUnitId}: ${toKind}) - unit kind mismatch is expected`);
      } else {
        console.log(`✓ Units match: ${fromUnitId} (${fromKind}) → ${toUnitId} (${fromKind})`);
      }
    }
  }
}

// ============================================================================
// Check: page_content structure
// ============================================================================

if (!cfg.page_content || typeof cfg.page_content !== 'object') {
  issues.push('Missing or invalid page_content object');
} else {
  const pageContent = cfg.page_content;

  // Check for forbidden fields
  const allowedPageFields = ['introduction', 'methodology', 'examples', 'summary', 'glossary', 'faqs', 'citations'];
  const pageKeys = Object.keys(pageContent);
  const forbiddenPageKeys = pageKeys.filter(k => !allowedPageFields.includes(k));

  if (forbiddenPageKeys.length > 0) {
    issues.push(`page_content has forbidden fields: ${forbiddenPageKeys.join(', ')}`);
  }

  // Check: faqs is array of objects with question/answer
  if (pageContent.faqs && Array.isArray(pageContent.faqs)) {
    for (let i = 0; i < pageContent.faqs.length; i++) {
      const faq = pageContent.faqs[i];
      if (typeof faq !== 'object' || !faq.question || !faq.answer) {
        issues.push(`faqs[${i}] invalid structure - must have "question" and "answer" fields`);
      }
    }
  }

  // Check: citations format and URLs
  if (pageContent.citations && Array.isArray(pageContent.citations)) {
    for (let i = 0; i < pageContent.citations.length; i++) {
      const citation = pageContent.citations[i];

      if (typeof citation !== 'object' || !citation.label || !citation.url) {
        issues.push(`citations[${i}] invalid structure - must have "label" and "url" fields`);
        continue;
      }

      // Check for Markdown URLs
      if (citation.url.match(/\[([^\]]+)\]\(([^\)]+)\)/)) {
        warnings.push(`citations[${i}] has Markdown URL format: ${citation.url.substring(0, 50)}...`);
      }

      // Check for HTML URLs
      if (citation.url.match(/<a\s+href/i)) {
        issues.push(`citations[${i}] has HTML <a> tag - must be plain HTTPS string`);
      }
    }
  }
}

// ============================================================================
// Check: internal links (if present)
// ============================================================================

if (cfg.links && cfg.links.internal && Array.isArray(cfg.links.internal)) {
  // Basic validation: should start with /conversions/
  for (let i = 0; i < cfg.links.internal.length; i++) {
    const link = cfg.links.internal[i];
    if (typeof link !== 'string') {
      warnings.push(`links.internal[${i}] is not a string`);
    } else if (!link.startsWith('/conversions/')) {
      warnings.push(`links.internal[${i}] doesn't start with /conversions/ - ${link}`);
    }
  }
}

// ============================================================================
// Output results
// ============================================================================

console.log(`\n📋 Validation Report: ${path.basename(fullConfigPath)}`);
console.log('='.repeat(60));

if (issues.length === 0 && warnings.length === 0) {
  console.log('✅ PASS - All checks passed!\n');
  process.exit(0);
}

if (issues.length > 0) {
  console.log(`\n❌ CRITICAL ISSUES (${issues.length}):`);
  issues.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue}`);
  });
}

if (warnings.length > 0) {
  console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
  warnings.forEach((warning, i) => {
    console.log(`   ${i + 1}. ${warning}`);
  });
}

console.log('\n' + '='.repeat(60));

if (issues.length > 0) {
  console.log('❌ FAILED - Cannot proceed with import\n');
  process.exit(1);
} else {
  console.log('✅ PASSED with warnings - Review manually before import\n');
  process.exit(0);
}
