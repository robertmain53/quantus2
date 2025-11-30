# Schema Enforcement Guide for ChatGPT Prompts

## What Changed

The `generate-prompts.js` script now **embeds strict schema rules directly into the generated prompts**. This significantly reduces the risk of ChatGPT generating invalid JSON that doesn't match the Cernarus engine contract.

## How Schema Enforcement Works

When you run `node scripts/generate-prompts.js`, it:
1. Reads the template from README.md
2. **Loads strict schema rules** from `scripts/generate-prompts/SCHEMA_STRICT_RULES.md`
3. Embeds those rules into each generated prompt file

The schema rules are **comprehensive and strict**:
- Defines allowed fields for each `component_type` (converter, simple_calc, advanced_calc)
- Prohibits forbidden fields (no `description`, `notes`, `help`, `ui`, `layout`, etc.)
- Enforces plain-text arrays for `page_content` (no nested objects with "title"/"body")
- Specifies exact field names and structures
- Includes a minimal working example to copy
- Provides a 10-point violation checklist

## Updated ChatGPT Workflow

### Step 1: Generate the Prompt
```bash
node scripts/generate-prompts.js
```
This creates files in `generated/prompts/` with the schema rules embedded.

### Step 2: Open the generated prompt JSON
Find the relevant calculator prompt file:
```
generated/prompts/conversions_energy_kilocalories-to-kilojoules-converter.json
```

### Step 3: In ChatGPT, paste in order:

**A) Calculator context**
```
Calculator: Convert Kilocalories to Kilojoules – Energy Converter
Slug: /conversions/energy/kilocalories-to-kilojoules-converter

Related internal pages (for internal links):
- /conversions/length/meters-to-feet-converter
- /conversions/length/feet-to-meters-converter
```

**B) The prompt field** (entire `prompt` value from the JSON)
Copy the full prompt—it now includes the strict schema enforcement rules.

**C) Upload ZIP files** (from the `assets.zips` array)
- `input/kilocalories-to-kilojoules-converter.zip`
- `input/convert-kilocalories-to-kilojoules.zip`

### Step 4: ChatGPT generates JSON
ChatGPT will now return a JSON object that strictly follows:
- The schema structure (no extra fields)
- Plain-text arrays for `page_content`
- Valid unit IDs from `lib/conversions.ts`
- Proper formatting for all nested objects

## Key Improvements

| Aspect | Before | After |
|--------|--------|-------|
| **Schema rules** | Buried in prompt text | Explicit section at top |
| **Field restrictions** | Unclear | 10-point violation checklist |
| **Examples** | Vague | Minimal working example provided |
| **Enforcement** | Soft guidance | Strict "DO NOT" statements |

## What to Do If ChatGPT Violates the Schema

1. **Copy the full prompt** (including schema rules section) again
2. **Add this instruction** at the end:
   ```
   Your previous response violated these rules:
   [List the specific violation, e.g., "You added a 'description' field to page_content"]

   Follow the STRICT SCHEMA ENFORCEMENT section exactly.
   Use the "Minimal Converter Example" as your template.
   Return ONLY valid JSON, no explanations.
   ```
3. **Re-run the generation** if needed

## File Locations

- **Generated prompts**: `generated/prompts/*.json`
- **Schema rules (embedded)**: `scripts/generate-prompts/SCHEMA_STRICT_RULES.md`
- **Script that embeds rules**: `scripts/generate-prompts.js`

## Testing the Schema

To verify ChatGPT's output is valid:
1. Paste the JSON into [jsonlint.com](https://www.jsonlint.com)
2. Check that it passes validation
3. Verify field names match the strict rules (no extra fields like `description`, `ui`, etc.)
4. Ensure `page_content` uses arrays of strings, not nested objects

## Common Violations to Watch For

```javascript
// ❌ WRONG: Nested object with title + body
"introduction": {
  "title": "...",
  "body": "..."
}

// ✅ CORRECT: Array of plain-text strings
"introduction": [
  "...",
  "..."
]
```

```javascript
// ❌ WRONG: Adding custom fields
"logic": {
  "type": "conversion",
  "fromUnitId": "...",
  "toUnitId": "...",
  "description": "...",  // NOT ALLOWED
  "precision": 2         // NOT ALLOWED
}

// ✅ CORRECT: Only allowed fields
"logic": {
  "type": "conversion",
  "fromUnitId": "...",
  "toUnitId": "..."
}
```

```javascript
// ❌ WRONG: HTML or markdown in page_content
"methodology": [
  "<p>This is <strong>bold</strong></p>"
]

// ✅ CORRECT: Plain text only
"methodology": [
  "This is bold text."
]
```

---

The strict schema enforcement is now **built into every prompt you generate**. ChatGPT has no ambiguity about what structure to return.
