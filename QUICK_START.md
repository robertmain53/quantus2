# Quick Start: Add a Calculator in 3 Steps

## Step 1: Get Config from ChatGPT (10 min)

```bash
# Generate prompt template
npm run prepare-prompts

# Find your calculator's prompt
cat generated/prompts/conversions_*_your-converter.json
```

**In ChatGPT:**
1. Paste entire prompt (it includes schema enforcement rules)
2. Upload ZIP from `input/your-converter.zip`
3. Copy ChatGPT's response (it's valid JSON)

## Step 2: Save Config File (1 min)

Extract the `config_json` object (NOT the wrapper) from ChatGPT and save:

```bash
cat > data/configs/your-converter.json << 'EOF'
{
  "version": "1.0.0",
  "metadata": { ... },
  ...
}
EOF
```

## Step 3: Import to CSV (1 min)

```bash
node scripts/add-calculator.js \
  --category "Conversions" \
  --subcategory "Category Name" \
  --slug "/conversions/category/your-converter" \
  --title "Convert X to Y – Category Converter" \
  --traffic 10000 \
  --date "11/28/2025" \
  --config data/configs/your-converter.json
```

✅ Done! Row added to `data/calc.csv` with properly escaped JSON.

---

## Verify It Works

```bash
# Check last row was added
tail -1 data/calc.csv | python3 -c "
import csv, json, sys
row = next(csv.DictReader(sys.stdin))
config = json.loads(row['config_json'])
print(f'✓ {row[\"title\"]}')
print(f'  Slug: {row[\"slug\"]}')
"

# Test build
npm run build
```

---

## Help

```bash
# See all options
node scripts/add-calculator.js --help

# Read full guide
cat scripts/ADD_CALCULATOR_README.md
```

---

**See also**: [WORKFLOW_SUMMARY.md](WORKFLOW_SUMMARY.md) for full end-to-end process
