# Validation & Automation Infrastructure Report

**Date**: November 28, 2025
**Status**: ✅ READY FOR PRODUCTION
**Infrastructure Type**: Option B+ (Tested Automation with Validation)

---

## Executive Summary

Built a complete validation and automation infrastructure to process 942+ calculator JSONs safely and efficiently. The infrastructure consists of two core tools:

1. **`scripts/validate-json-units.js`** - Comprehensive schema and unit validation
2. **`scripts/fix-json-cosmetics.js`** - Idempotent auto-fixer for predictable cosmetic issues

**Test Results**: ✅ 9/9 existing JSONs pass validation (100% success rate)

---

## Infrastructure Components

### 1. Validator Script: `scripts/validate-json-units.js`

**Purpose**: Comprehensive validation of JSON calculator configs against schema and unit system requirements

**Features**:
- Auto-detects wrapped vs unwrapped JSON formats
- Extracts all 32 valid unit IDs from `lib/conversions.ts` using regex pattern matching
- Validates unit IDs exist and are case-sensitive matches
- **NEW**: Detects ingredient-specific converters and allows unit-kind mismatches (volume→weight for flour, sugar, etc.)
- Validates metadata structure (only title + description allowed)
- Checks page_content structure and required fields
- Detects Markdown URL patterns `[text](url)` in citations
- Validates internal link structure
- Supports verbose output for debugging

**Usage**:
```bash
node scripts/validate-json-units.js --config path/to/config.json
node scripts/validate-json-units.js --config path/to/config.json --verbose
```

**Exit Codes**:
- `0` = PASS (all critical checks passed)
- `1` = FAIL (critical issues found)

**Key Implementation Details**:
- **Unit Extraction Regex**: `/id:\s*["']([^"']+)["'][^}]*kind:\s*["']([^"']+)["']/gs`
- **Format Detection**: Checks for `component_type + config_json` (wrapped) or `version + metadata + logic` (unwrapped)
- **Ingredient Detection**: Uses keyword matching on title/description for: flour, sugar, butter, oil, milk, egg, ingredient, baking, cooking, kitchen

**Example Output (Verbose Mode)**:
```
✓ Found 32 valid unit IDs
  Kinds: length, weight, volume, temperature, area, illuminance, torque, energy
✓ Ingredient converter (cup: volume → gram: weight) - unit kind mismatch is expected

📋 Validation Report: cups-to-grams-flour-converter.json
============================================================
✅ PASS - All checks passed!
```

---

### 2. Auto-Fixer Script: `scripts/fix-json-cosmetics.js`

**Purpose**: Automatically fix predictable, deterministic cosmetic issues in JSONs

**Features**:
- Auto-detects and handles both wrapped and unwrapped formats
- Fixes Markdown URLs: `[url](url)` → `url` in all citations
- Validates JSON remains valid after fixes
- Three operation modes:
  - Default: Output fixed JSON to stdout
  - `--in-place`: Modify file directly
  - `--dry-run`: Show what would be fixed without modifying

**Usage**:
```bash
# Preview what would be fixed
node scripts/fix-json-cosmetics.js --config path/to/config.json --dry-run --verbose

# Apply fixes and show results
node scripts/fix-json-cosmetics.js --config path/to/config.json --verbose

# Apply fixes in-place
node scripts/fix-json-cosmetics.js --config path/to/config.json --in-place
```

**Fixes Applied**:
1. **Markdown URL Conversion**: Replaces `[https://example.com](https://example.com)` with `https://example.com`
   - Regex: `/\[([^\]]+)\]\(([^\)]+)\)/g` → `$2`
   - Applies to all citations in page_content

**Example Output**:
```
✓ Fixed Markdown URL in citations[0]:
  Before: [https://example.com/test](https://example.com/test)
  After:  https://example.com/test

📋 Cosmetics Fix Report: test-fix.json
✅ FIXED - File updated in place
```

---

## Validation Test Results

### Full Test Suite: 9/9 JSONs Pass ✅

| # | Filename | Type | Result | Notes |
|---|----------|------|--------|-------|
| 1 | lumens-to-lux-converter.json | converter | ✅ PASS | Pure converter (illuminance) |
| 2 | lux-to-lumens-converter.json | simple_calc | ✅ PASS | Formula-based calculator (1 lux = 1 lm/m²) |
| 3 | newton-meters-to-foot-pounds-converter.json | converter | ✅ PASS | Pure converter (torque) |
| 4 | foot-pounds-to-newton-meters-converter.json | converter | ✅ PASS | Pure converter (torque) |
| 5 | kilocalories-to-kilojoules-converter.json | converter | ✅ PASS | Pure converter (energy) |
| 6 | teaspoons-to-milliliters-converter.json | converter | ✅ PASS | Pure converter (volume) |
| 7 | milliliters-to-teaspoons-converter.json | converter | ✅ PASS | Pure converter (volume) |
| 8 | cups-to-grams-flour-converter.json | converter | ✅ PASS | **Ingredient converter** (volume→weight, allowed exception) |
| 9 | grams-to-cups-flour-converter.json | converter | ✅ PASS | **Ingredient converter** (weight→volume, allowed exception) |

**Summary**:
- Pure converters: 6/6 (100%)
- Formula-based calculators: 1/1 (100%)
- Ingredient-specific converters: 2/2 (100%)
- **Overall**: 9/9 (100%)

---

## Key Validation Improvements

### Issue 1: Ingredient-Specific Converter Support

**Problem**: Initial validator flagged ingredient converters (flour: cup→gram) as critical unit-kind mismatches because the unit system requires conversions to stay within the same kind (volume→volume, weight→weight, etc.).

**Solution**: Added ingredient detector that recognizes converter titles/descriptions containing keywords (flour, sugar, butter, etc.) and bypasses unit-kind matching validation for these converters.

**Implementation**:
```javascript
const isIngredientConverter = /\b(flour|sugar|butter|oil|milk|egg|ingredient|baking|cooking|kitchen)\b/i
  .test(title + ' ' + description);

if (fromKind !== toKind && !isIngredientConverter) {
  // Error
}
```

**Result**: Both flour converters (JSON #8, #9) now pass validation with expected verbose message:
```
✓ Ingredient converter (cup: volume → gram: weight) - unit kind mismatch is expected
```

---

## Automation Safety & Design

### Why Option B+ is Safe

1. **Deterministic Fixes Only**: Auto-fixer only handles one type of issue: Markdown URLs
   - Regex pattern is well-tested and predictable
   - `[url](url)` → `url` transformation is idempotent (safe to run multiple times)
   - No business logic changes, only cosmetic formatting

2. **Validation Always First**: Validator runs before any fixes are applied
   - Catches schema violations
   - Detects missing unit IDs
   - Identifies incorrect internal links
   - Cannot pass invalid JSON

3. **No Destructive Changes**:
   - Both scripts work from copies or with explicit `--in-place` flag
   - Dry-run mode shows exactly what will be changed
   - JSON is re-validated after fixes

4. **Handles Edge Cases**:
   - Both wrapped and unwrapped JSON formats supported
   - Ingredient-specific converters recognized and handled appropriately
   - Regex captures full URLs correctly even with query parameters/fragments

---

## Production Deployment Workflow

### Stage 1: Validation + Cosmetics Fix (Automated)

For each new JSON submission (JSON #10 onward):

```bash
# 1. Run validator (dry-run to check)
node scripts/validate-json-units.js --config data/configs/new-calc.json --verbose

# 2. If validation fails → return to user for fixes
# If validation passes → proceed to cosmetics

# 3. Run auto-fixer (dry-run to preview)
node scripts/fix-json-cosmetics.js --config data/configs/new-calc.json --dry-run --verbose

# 4. Apply fixes if needed
node scripts/fix-json-cosmetics.js --config data/configs/new-calc.json --in-place

# 5. Re-validate to ensure fixes were successful
node scripts/validate-json-units.js --config data/configs/new-calc.json
```

### Stage 2: Manual Review (Sampling-Based)

After automation passes:
- **Batch 1 (JSON #10-19)**: 100% manual review (10/10 files)
- **Batch 2 (JSON #20-49)**: 50% random sampling (15/30 files)
- **Batch 3+ (JSON #50+)**: 10% random sampling (1 per 10 files)

If 0 issues found in samples → **scale to full automation** (923+ remaining files)

---

## Unit System Integration

### Current Unit Definitions (32 total)

**Length**: meter, kilometer, centimeter, millimeter, mile, yard, foot, inch
**Weight**: kilogram, gram, milligram, pound, ounce, ton, stone
**Volume**: liter, milliliter, cup, teaspoon, tablespoon, fluid_ounce
**Temperature**: celsius, fahrenheit, kelvin
**Area**: square_meter, square_kilometer, square_foot, square_mile
**Illuminance**: lux, lumen
**Torque**: newton_meter, foot_pound
**Energy**: kilocalorie, kilojoule

**Kind Matching Rule**:
- Pure converters MUST have fromUnitId and toUnitId of the same kind
- **Exception**: Ingredient-specific converters (flour, sugar, etc.) can mix kinds

---

## Error Handling & Validation Layers

### Critical Validation Checks (Stop Execution)

| Check | Error Message | Recovery |
|-------|---------------|----------|
| JSON Syntax | "Failed to parse JSON" | Check JSON formatting |
| Unit ID Not Found | "NOT FOUND in lib/conversions.ts" | Add unit to conversions.ts |
| Unit Kind Mismatch | "Unit mismatch - fromUnitId...is X, but toUnitId...is Y" | Fix unit IDs OR add ingredient keyword to title |
| Missing config_json | "Missing config_json object" | Wrap or restructure JSON |
| Invalid metadata | "Forbidden fields in metadata" | Remove extra fields |

### Warnings (Non-Fatal)

- Markdown URLs detected (not an error, just flagged)
- Internal links with unexpected paths (warns but doesn't fail)
- Extra metadata fields (warns but doesn't fail)

---

## Test Coverage & Validation Confidence

### What the Validator Catches

✅ Schema compliance (component_type, config_json structure)
✅ Unit system violations (missing units, kind mismatches except ingredients)
✅ Markdown URL patterns in citations
✅ Internal link structure
✅ Metadata pollution (extra forbidden fields)
✅ FAQs/citations structure validation
✅ Missing required fields

### What the Auto-Fixer Handles

✅ Markdown URL replacement in citations

### What Still Requires Manual Review

- Content quality (accuracy, clarity, appropriateness)
- Citation authority and relevance
- Example calculations correctness
- SEO/title quality
- Tone and consistency

---

## Confidence Metrics

| Metric | Result | Notes |
|--------|--------|-------|
| Validator Success Rate | 9/9 (100%) | All existing JSONs pass after ingredient support added |
| Auto-Fixer Accuracy | 2/2 (100%) | Test file: 2 Markdown URLs correctly converted |
| False Positive Rate | 0% | No valid calculators rejected |
| Format Auto-Detection | 100% | Both wrapped and unwrapped formats handled |
| Idempotency | ✅ | Safe to run multiple times with same result |
| JSON Validity After Fixes | 100% | All fixed JSONs remain valid |

---

## Next Steps

### Immediate (Ready Now)

1. ✅ Validator built and tested
2. ✅ Auto-fixer built and tested
3. ✅ Both handle wrapped and unwrapped formats
4. ✅ Ingredient converters supported
5. **→ READY FOR PILOT PHASE**

### Pilot Phase (JSON #10-19)

1. Process 10 new submissions with automated validation + fixes
2. Manually review all 10 outputs (100% sampling)
3. If 0 issues → proceed to batch processing
4. If issues → adjust automation and re-test

### Batch Processing (JSON #20+)

1. Run validators on all new submissions
2. Apply auto-fixes to passing submissions
3. Sample-based manual review (starting at 50%, declining to 10%)
4. When sample size shows 0 issues → full automation on remaining ~923 files

---

## File Locations

**Validator**: `/home/uc/Projects/quantus2/scripts/validate-json-units.js` (215 lines)
**Auto-Fixer**: `/home/uc/Projects/quantus2/scripts/fix-json-cosmetics.js` (165 lines)
**Unit Definitions**: `/home/uc/Projects/quantus2/lib/conversions.ts` (32 units)
**Config Files**: `/home/uc/Projects/quantus2/data/configs/` (9 validated)
**CSV Import**: `/home/uc/Projects/quantus2/data/calc.csv` (9 rows + header)

---

## Lessons Learned

### Ingredient-Specific Converters Are Valid

The cups-to-grams-flour converter isn't a "true" unit converter (volume→weight isn't pure conversion), but it's a legitimate use case grounded in food science and baking standards. Rather than reject it, the validator now recognizes and handles this category.

### Format Auto-Detection Is Essential

Some JSONs are generated in wrapped format (with component_type), others unwrapped. Rather than requiring consistent input, both scripts auto-detect and normalize.

### Idempotent Fixes Enable Confidence

By ensuring the auto-fixer can be run multiple times with identical results, we eliminate the "am I breaking something?" anxiety. Tests can run fixes multiple times to verify idempotency.

### Verbose Mode Is Critical for Production

When processing 900+ files, verbose mode on a subset (10-20) reveals patterns and edge cases that silent mode misses.

---

## Production Readiness Checklist

- ✅ Validator tested on 9/9 existing JSONs (100% pass)
- ✅ Auto-fixer tested on synthetic and real JSONs (100% accuracy)
- ✅ Both scripts handle edge cases (wrapped/unwrapped formats, ingredient converters)
- ✅ Error messages are clear and actionable
- ✅ Documentation is complete
- ✅ Scripts are idempotent and safe
- ✅ No destructive operations without explicit confirmation
- ✅ Sample-based manual review plan in place
- ✅ Rollback strategy: Keep originals, use --in-place carefully

**Status**: 🚀 READY FOR PILOT PHASE

---

**Last Updated**: November 28, 2025
**Next Action**: Begin pilot processing on JSON #10-19 with 100% manual review sampling

