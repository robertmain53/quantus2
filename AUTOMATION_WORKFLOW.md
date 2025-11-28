# Calculator JSON Automation Workflow

Quick reference for processing new calculator submissions.

---

## Quick Commands

### 1. Validate a New JSON

```bash
node scripts/validate-json-units.js --config data/configs/my-new-calculator.json
```

**Expected Output if PASS**:
```
✅ PASS - All checks passed!
```

**Expected Output if FAIL**:
```
❌ CRITICAL ISSUES (1):
   1. ❌ CRITICAL: fromUnitId "invalid_id" NOT FOUND in lib/conversions.ts
```

---

### 2. Check What Needs Fixing (Dry Run)

```bash
node scripts/fix-json-cosmetics.js --config data/configs/my-new-calculator.json --dry-run --verbose
```

**Shows exactly what would be changed without modifying the file.**

---

### 3. Apply Automatic Fixes

```bash
node scripts/fix-json-cosmetics.js --config data/configs/my-new-calculator.json --in-place
```

**Modifies the file directly.** Always use `--dry-run` first to preview!

---

### 4. Re-Validate After Fixes

```bash
node scripts/validate-json-units.js --config data/configs/my-new-calculator.json --verbose
```

**Ensure fixes worked and JSON is still valid.**

---

## Full Workflow

### New JSON Submission Checklist

```bash
CONFIG_FILE="data/configs/my-new-calc.json"

# Step 1: Validate
echo "Step 1: Validating..."
node scripts/validate-json-units.js --config "$CONFIG_FILE" --verbose

# Step 2: If validation passed, check what needs fixing
if [ $? -eq 0 ]; then
  echo "✅ Validation passed. Checking for cosmetic issues..."
  node scripts/fix-json-cosmetics.js --config "$CONFIG_FILE" --dry-run --verbose

  # Step 3: Apply fixes
  echo "Applying fixes..."
  node scripts/fix-json-cosmetics.js --config "$CONFIG_FILE" --in-place

  # Step 4: Re-validate
  echo "Re-validating after fixes..."
  node scripts/validate-json-units.js --config "$CONFIG_FILE"

  if [ $? -eq 0 ]; then
    echo "✅ READY FOR CSV IMPORT"
  else
    echo "❌ Fixes caused validation errors"
    exit 1
  fi
else
  echo "❌ Validation failed - needs manual review"
  exit 1
fi
```

---

## Common Issues & Solutions

### Issue: "NOT FOUND in lib/conversions.ts"

**Problem**: Unit ID doesn't exist in the system

**Solution**:
1. Check `/home/uc/Projects/quantus2/lib/conversions.ts` for valid IDs
2. If unit is missing, add it (see Adding Units section below)
3. Re-validate

**Valid Unit IDs** (as of Nov 28, 2025):
- Length: meter, kilometer, centimeter, millimeter, mile, yard, foot, inch
- Weight: kilogram, gram, milligram, pound, ounce, ton, stone
- Volume: liter, milliliter, cup, teaspoon, tablespoon, fluid_ounce
- Temperature: celsius, fahrenheit, kelvin
- Area: square_meter, square_kilometer, square_foot, square_mile
- Illuminance: lux, lumen
- Torque: newton_meter, foot_pound
- Energy: kilocalorie, kilojoule

---

### Issue: "Unit mismatch - fromUnitId...is X, but toUnitId...is Y"

**Problem**: Converter tries to mix unit kinds (e.g., cup→gram)

**Solution**:
1. **If it's an ingredient converter** (flour, sugar, butter, etc.):
   - Add ingredient keyword to title or description
   - Validator will recognize it and allow the mismatch
   - Valid keywords: flour, sugar, butter, oil, milk, egg, ingredient, baking, cooking, kitchen

2. **If it's NOT an ingredient converter**:
   - Fix the unit IDs to match kinds (volume→volume, weight→weight, etc.)
   - OR create two separate converters in compatible unit systems

**Example Fix**:
```json
{
  "metadata": {
    "title": "Convert Cups to Grams Flour – Kitchen Converter",
    "description": "Convert cups of all-purpose flour to grams..."
  },
  "logic": {
    "fromUnitId": "cup",    // volume
    "toUnitId": "gram"      // weight - mismatch OK because "Flour" in title
  }
}
```

---

### Issue: "Forbidden fields: slug, name, meta, form"

**Problem**: JSON has extra fields that aren't allowed

**Solution**:
Remove forbidden fields from `metadata`:
- ✅ Allowed: `title`, `description`
- ❌ Forbidden: `slug`, `name`, `meta`, `author`, `form`, `hero`, `copy`, `converter`, etc.

---

### Issue: Markdown URLs `[url](url)` detected

**Problem**: Citations have Markdown format instead of plain URLs

**Solution**:
Auto-fixer handles this automatically:
```bash
node scripts/fix-json-cosmetics.js --config data/configs/your-calc.json --in-place
```

**Before**:
```json
"url": "[https://example.com](https://example.com)"
```

**After**:
```json
"url": "https://example.com"
```

---

## Adding a New Unit to the System

If you need to add a unit that doesn't exist:

1. Edit `/home/uc/Projects/quantus2/lib/conversions.ts`
2. Add entry in the appropriate kind section:

```typescript
myunit: {
  id: "myunit",
  label: "My Unit",
  symbol: "mu",
  kind: "weight",  // or length, volume, temperature, area, illuminance, torque, energy
  toBase: (value) => value * 1000,      // convert to base unit (gram for weight)
  fromBase: (value) => value / 1000,    // convert from base unit
  decimalPlaces: 2
},
// Add aliases for flexibility
"my unit": { id: "myunit" },
"my-unit": { id: "myunit" },
```

3. Run validator on existing JSONs to ensure no regressions
4. Test new converter with new unit

---

## Batch Processing

### Process Multiple Files

```bash
for config in data/configs/*.json; do
  echo "Validating: $(basename $config)"
  node scripts/validate-json-units.js --config "$config" || echo "FAILED: $config"
done
```

### Apply Fixes to Passing Configs Only

```bash
for config in data/configs/*.json; do
  if node scripts/validate-json-units.js --config "$config" > /dev/null 2>&1; then
    echo "Fixing: $(basename $config)"
    node scripts/fix-json-cosmetics.js --config "$config" --in-place --verbose
  fi
done
```

---

## Verbose Output Examples

### Successful Converter Validation

```bash
$ node scripts/validate-json-units.js --config data/configs/teaspoons-to-milliliters.json --verbose

✓ Found 32 valid unit IDs
  Kinds: length, weight, volume, temperature, area, illuminance, torque, energy
✓ Units match: teaspoon (volume) → milliliter (volume)

📋 Validation Report: teaspoons-to-milliliters-converter.json
============================================================
✅ PASS - All checks passed!
```

### Ingredient Converter Validation

```bash
$ node scripts/validate-json-units.js --config data/configs/cups-to-grams-flour.json --verbose

✓ Found 32 valid unit IDs
  Kinds: length, weight, volume, temperature, area, illuminance, torque, energy
✓ Ingredient converter (cup: volume → gram: weight) - unit kind mismatch is expected

📋 Validation Report: cups-to-grams-flour-converter.json
============================================================
✅ PASS - All checks passed!
```

### Cosmetics Fix (Dry Run)

```bash
$ node scripts/fix-json-cosmetics.js --config data/configs/new-calc.json --dry-run --verbose

✓ Fixed Markdown URL in citations[0]:
  Before: [https://nist.gov/test](https://nist.gov/test)
  After:  https://nist.gov/test

📋 Cosmetics Fix Report: new-calc.json
============================================================

✓ Found 1 issue(s) to fix:

1. Markdown URL in citations[0]
   Before: [https://nist.gov/test](https://nist.gov/test)
   After:  https://nist.gov/test

============================================================
🔍 DRY RUN - No files modified
```

---

## Exit Codes

### validate-json-units.js
- `0` = PASS (ready for import)
- `1` = FAIL (needs fixing)

### fix-json-cosmetics.js
- `0` = Success (fixes applied or no fixes needed)
- `1` = Error (JSON parsing or writing failed)

**Check exit code in scripts**:
```bash
node scripts/validate-json-units.js --config "$CONFIG"
if [ $? -eq 0 ]; then
  echo "✅ Validation passed"
else
  echo "❌ Validation failed"
fi
```

---

## Manual Review Checklist

Even with automated validation, check these manually:

- [ ] Content is accurate (math, conversions, formulas)
- [ ] Examples are realistic and helpful
- [ ] Citations are authoritative and relevant
- [ ] FAQs address real user concerns
- [ ] No Lorem Ipsum or placeholder text
- [ ] Tone is professional and consistent
- [ ] Internal links point to real converters
- [ ] Title and description are clear and SEO-friendly
- [ ] No obvious typos or grammar errors

---

## Troubleshooting

### Script Not Found
```bash
# Make sure you're in the project root
cd /home/uc/Projects/quantus2
node scripts/validate-json-units.js --config data/configs/test.json
```

### Permission Denied
```bash
chmod +x scripts/validate-json-units.js
chmod +x scripts/fix-json-cosmetics.js
```

### JSON Won't Parse
```bash
# Check JSON syntax at https://jsonlint.com/
# Or use Node.js:
node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync('data/configs/test.json'))))"
```

### Fixes Aren't Applied
```bash
# Use verbose mode to see what's happening
node scripts/fix-json-cosmetics.js --config data/configs/test.json --dry-run --verbose

# Check file permissions
ls -la data/configs/test.json
```

---

## Support

For issues with the scripts:
1. Check this guide first
2. Run with `--verbose` flag for more details
3. Verify JSON syntax with a JSON validator
4. Check that unit IDs exist in `lib/conversions.ts`

---

**Last Updated**: November 28, 2025
**Status**: Production Ready
