# Add Calculator Script

Streamline adding calculators to `data/calc.csv` with properly escaped JSON config.

## Quick Start

```bash
node scripts/add-calculator.js   --category "Conversions"   --subcategory "Illuminance"   --slug "/conversions/illuminance/lumens-to-lux-converter"   --title "Convert Lumens to Lux – Light Converter"   --traffic 10000   --date "11/28/2025"   --config data/configs/lumens-to-lux-converter.json
```

## Workflow

### Step 1: Get JSON from ChatGPT

Paste the generated prompt from `generated/prompts/*.json` into ChatGPT with research assets. ChatGPT returns:

```json
{
  "component_type": "converter",
  "config_json": {
    "version": "1.0.0",
    "metadata": { ... },
    ...
  }
}
```

### Step 2: Save the `config_json` Part

Extract just the `config_json` object and save to a file (e.g. `data/configs/lumens-to-lux-converter.json`):

```json
{
  "version": "1.0.0",
  "metadata": { ... },
  ...
}
```

**Do NOT include the wrapper** (`component_type` + outer `config_json`).  
The script will handle `component_type` separately.

### Step 3: Run the Add Script

```bash
node scripts/add-calculator.js   --category "Conversions"   --subcategory "Illuminance"   --slug "/conversions/illuminance/lumens-to-lux-converter"   --title "Convert Lumens to Lux – Light Converter"   --traffic 10000   --date "11/28/2025"   --config data/configs/lumens-to-lux-converter.json
```

The script will:

- Load the JSON config
- Properly escape it for CSV
- Append a new row to `data/calc.csv`
- Validate the JSON before saving

---

## Arguments

| Argument        | Required | Format     | Example                                              |
| --------------- | -------- | ---------- | ---------------------------------------------------- |
| `--category`    | Yes      | String     | `"Conversions"`                                      |
| `--subcategory` | Yes      | String     | `"Illuminance"`                                      |
| `--slug`        | Yes      | URL path   | `"/conversions/illuminance/lumens-to-lux-converter"` |
| `--title`       | Yes      | String     | `"Convert Lumens to Lux – Light Converter"`          |
| `--traffic`     | Yes      | Number     | `10000`                                              |
| `--date`        | Yes      | MM/DD/YYYY | `"11/28/2025"`                                       |
| `--config`      | Yes      | File path  | `"data/configs/lumens-to-lux-converter.json"`        |

---

## Config File Format

The config file should be the **inner `config_json` object only**, not the wrapper:

### ❌ WRONG (Don't do this)

```json
{
  "component_type": "converter",
  "config_json": {
    "version": "1.0.0",
    ...
  }
}
```

### ✅ CORRECT (Do this)

```json
{
  "version": "1.0.0",
  "metadata": { ... },
  ...
}
```

### Required `page_content` keys (flat arrays, plain text)

- `introduction`: 2–3 short paragraphs.
- `methodology`: authoritative walk-through.
- `how_is_calculated`: concise formulas/steps shown in Pro view (fallback will use methodology if omitted).
- `faqs`: array of `{ "question": "...", "answer": "..." }`.
- `citations`: array of `{ "label": "...", "url": "..." }`.
- Optional: `examples`, `summary`, `glossary` (if used, `glossary` must be an array of `{ "term": ".", "definition": "." }`).

See `scripts/generate-prompts/SCHEMA_STRICT_RULES.md` for the full strict schema injected into all prompt templates.

---

## Prompt Mapping (Slug → Prompt)

The prompt generator script:

```bash
node scripts/generate-prompts.js
```

will:

1. Read `data/calc.csv`.
2. Generate one prompt file per slug in `generated/prompts/*.json`.
3. Write a canonical index file: `generated/prompts/index.json` mapping:

   ```json
   {
     "/conversions/illuminance/lumens-to-lux-converter": "generated/prompts/conversions_illuminance_lumens-to-lux-converter.json",
     "...": "..."
   }
   ```

Your factory / runner MUST load prompts using the **exact slug**, not fuzzy matches. For example:

```js
const { getPromptForSlug } = require("./get-prompt-for-slug");

const prompt = getPromptForSlug(
  "/conversions/illuminance/lumens-to-lux-converter"
);
// use prompt.prompt, prompt.context, prompt.assets, etc.
```

If a slug has no entry in `index.json`, the loader will throw instead of guessing.

For coverage checks:

```bash
node scripts/check-prompt-coverage.js
```

will verify that every slug in `data/calc.csv` has a dedicated prompt in the index.

---

## How It Works (Add Calculator Script)

1. **Parses CLI arguments** – validates all required fields.
2. **Loads the JSON config** – reads and parses the config file.
3. **Handles both formats** – automatically extracts `config_json` if wrapper is present (for convenience).
4. **Escapes for CSV** – properly escapes quotes, commas, newlines per CSV standards.
5. **Appends to CSV** – adds new row to `data/calc.csv` with escaped JSON.
6. **Validates** – confirms JSON is parseable before writing.

---

## Example Workflow

```bash
# 1. Save ChatGPT response to config file
#    (extract just the config_json object from ChatGPT output)

# 2. Run the script
node scripts/add-calculator.js   --category "Conversions"   --subcategory "Temperature"   --slug "/conversions/temperature/celsius-to-kelvin-converter"   --title "Convert Celsius to Kelvin"   --traffic 5000   --date "11/28/2025"   --config data/configs/celsius-to-kelvin.json

# 3. Verify it was added
tail -1 data/calc.csv | python3 -c "
import csv, json, sys
row = next(csv.DictReader(sys.stdin))
config = json.loads(row['config_json'])
print(f'✓ Added: {row["title"]}')
print(f'  Slug: {row["slug"]}')
print(f'  Config valid: {"version" in config}')
"
```

---

## Troubleshooting

### Config file not found

Ensure the path is relative to the project root (where you run the command).

### JSON parsing error

Check that the config file contains **only the inner `config_json` object**, not the wrapper.

### Missing arguments

Run:

```bash
node scripts/add-calculator.js --help
```

to see all required fields.

---

## Benefits Over Manual CSV Entry

| Task                 | Manual | Script    |
| -------------------- | ------ | --------- |
| Escaping JSON quotes | Manual | Automatic |
| Handling newlines    | Manual | Automatic |
| CSV validation       | Manual | Automatic |
| JSON validation      | Manual | Automatic |
| Error checking       | Manual | Automatic |
| Time per calculator  | ~5 min | ~1 min    |

---

## Future Enhancements

Potential next steps:

- Accept JSON from stdin (for piping ChatGPT output directly).
- Auto-generate slug from title if not provided.
- Batch-add multiple calculators from a JSONL file.
- Sync configs back to `data/configs/` (one-way or two-way).
