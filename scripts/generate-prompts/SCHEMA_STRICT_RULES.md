# Cernarus Config Schema – STRICT ENFORCEMENT RULES

**You MUST follow these rules exactly. Do not deviate. Do not add extra fields.**

---

## CHOOSING THE RIGHT COMPONENT_TYPE

Before you start, determine which calculator type is needed:

### Use "converter" IF:
- Converting between two units (kilocalories ↔ kilojoules, lumens ↔ lux, miles ↔ kilometers, fahrenheit ↔ celsius)
- The conversion has a FIXED mathematical relationship
- Users need to input ONE value and get ONE output
- No variables or intermediate calculations needed
- Example: "Convert Lumens to Lux" (fixed ratio, no extra inputs)

### Use "simple_calc" IF:
- Calculating a value using a FORMULA with multiple inputs
- Users input several related values to compute a result
- The formula has ONE primary output
- Examples: BMI calculator (weight + height → BMI), mortgage payment (principal + rate + term → payment), tip calculator (bill + percentage → tip)
- The "form" object is REQUIRED with "fields" array for user inputs

### Use "advanced_calc" IF:
- Multiple calculation methods or variable dependencies
- Users need to switch between different formulas or scenarios
- Complex workflows with conditional logic
- Example: Retirement calculator (choose method: simple savings, compound interest, with conditions based on age)
- The "logic.methods" object is REQUIRED

**CRITICAL: DO NOT use simple_calc or advanced_calc for unit conversions. DO NOT add a form object to a converter.**

---

## Top-Level Structure

```json
{
  "component_type": "converter|simple_calc|advanced_calc",
  "config_json": { ... }
}
```

## For `component_type: "converter"`

**Allowed fields in `config_json`:**
- `version` (required): semantic string, e.g., "1.0.0"
- `metadata` (required):
  - `title` (string, no HTML)
  - `description` (string, no HTML)
- `logic` (required):
  - `type`: MUST be exactly `"conversion"`
  - `fromUnitId`: string matching lib/conversions.ts (e.g., "kilocalorie", "foot")
  - `toUnitId`: string matching lib/conversions.ts (e.g., "kilojoule", "meter")
  - **DO NOT add**: `factor`, `formula`, `precision`, `units`, `customFactors`
- `form`: OMIT or set to `null` (converters render their own inputs)
- `page_content` (required): object with these fields ONLY:
  - `introduction`: array of plain-text strings (2–3 paragraphs)
  - `methodology`: array of plain-text strings (authoritative walkthrough)
  - `faqs`: array of objects: `[{ "question": "...", "answer": "..." }]`
  - `citations`: array of objects: `[{ "label": "...", "url": "..." }]`
  - **Optional**: `examples`, `summary`, `glossary` (same format)
  - **DO NOT add**: `title`, `body`, `items` nested objects, HTML tags
- `links` (optional): object with:
  - `internal`: array of slug strings (e.g., `["/conversions/length/..."]`)
  - `external`: array of objects: `[{ "url": "...", "label": "...", "rel": [...] }]`
- `schema` (optional): object with:
  - `additionalTypes`: array of strings (e.g., `["HowTo"]`)

## For `component_type: "simple_calc"`

**Allowed fields in `config_json`:**
- `version`, `metadata` (same as converter)
- `logic` (required):
  - `type`: MUST be exactly `"formula"`
  - `outputs`: array of:
    ```json
    {
      "id": "string",
      "label": "string",
      "expression": "math expression referencing form.fields[].id",
      "unit": "optional",
      "format": "currency|percent|decimal|integer"
    }
    ```
  - **DO NOT add**: `expressions`, `precision`, `isPrimary`, `description`
- `form` (required): object with:
  - `fields`: array of input objects (labels, types, defaults, min/max)
  - `result`: optional object with `outputs` (simple card display)
- `page_content`, `links`, `schema` (same as converter)

### For `component_type: "simple_calc"`

[...]

- `form` (required): object with:
  - `fields`: array of input objects (labels, types, defaults, min/max)
  - `result`: optional object with:
    - `outputs`: **array of objects**, NEVER strings.  
      Each object MUST have at least:
      - `id`: string – must match one of `logic.outputs[].id`
      - `label`: string – user-facing label for that output card  
      You MAY also include:
      - `format`: `"currency" | "percent" | "decimal" | "integer"`
      - `unit`: string (e.g., `"currency"`, `"percent"`, `"years"`)

#### ❌ WRONG (will break the build)

```json
"result": {
  "outputs": [
    "ebit",
    "ebit_reconciled",
    "ebit_margin"
  ]
}

✅ CORRECT
"result": {
  "outputs": [
    { "id": "ebit", "label": "EBIT (Earnings Before Interest & Taxes)" },
    { "id": "ebit_reconciled", "label": "EBIT (reconciled from Net Income)" },
    { "id": "ebit_margin", "label": "EBIT Margin (%)" }
  ]
}


This way, when `generate-prompts.js` injects `SCHEMA_STRICT_RULES.md` into every prompt, the model gets a **hard schema rule** for `form.result.outputs`.

---

### 4. What to tweak in the README prompt (optional but recommended)

In `README.md`, inside the AI prompt template section where you describe `form`, update this bullet:

Current-ish:

> Use `form.result.outputs` when you want companion result cards—each entry should only include `id`, `label`, `format`, and optional `unit`.

Make it more rigid and explicit:

```text
- For simple calculators, supply a flat `fields` array (labels, types, defaults, min/max, step, options).
- If you want companion result cards, use `form.result.outputs`:

  - `form.result.outputs` MUST be an array of OBJECTS, NOT strings.
  - Each object MUST include `id` and `label`.
  - You MAY also include `format` and `unit`.

  Example (CORRECT):
  "result": {
    "outputs": [
      { "id": "ebit", "label": "EBIT (Earnings Before Interest & Taxes)" },
      { "id": "ebit_reconciled", "label": "EBIT (reconciled from Net Income)" },
      { "id": "ebit_margin", "label": "EBIT Margin (%)" }
    ]
  }
  

## For `component_type: "advanced_calc"`

**Allowed fields in `config_json`:**
- `version`, `metadata` (same as converter)
- `logic` (required):
  - `type`: MUST be exactly `"advanced"`
  - `defaultMethod`: string (id of method to load first)
  - `methods`: object where each key is a method id:
    ```json
    {
      "method_id": {
        "label": "string",
        "description": "optional string",
        "variables": {
          "var_name": {
            "expression": "math expression",
            "dependencies": [],
            "label": "string",
            "unit": "optional",
            "format": "currency|percent|decimal|integer",
            "display": true|false
          }
        },
        "outputs": [
          {
            "id": "string",
            "label": "string",
            "variable": "var_name",
            "unit": "optional",
            "format": "currency|percent|decimal|integer"
          }
        ]
      }
    }
    ```
- `form` (optional): object with:
  - `fields`: global inputs
  - `sections`: grouped inputs with optional `show_when` conditional logic
- `page_content`, `links`, `schema` (same as converter)

## Critical Rules (VIOLATIONS WILL CAUSE REJECTION)

1. **NO HTML**: Never use `<div>`, `<p>`, `<br>`, markdown, or any markup. Use plain-text strings only.

2. **NO custom fields**: Don't add `description`, `notes`, `help`, `ui`, `layout`, `styling`, `canonical_url`, `robots`, `keywords`, `schema_org`, `open_graph`, `twitter_card`, or any field not listed above.

3. **NO nested `page_content` objects**: Don't use `{ "title": "...", "body": "..." }` format. Use flat arrays of strings instead.

4. **Converters don't have `form`**: Omit the field entirely or set to `null`. Only simple_calc and advanced_calc have form objects.

5. **component_type must match content**:
   - "converter" = unit conversion (NO form, logic.type = "conversion")
   - "simple_calc" = formula calculation (form REQUIRED, logic.type = "formula")
   - "advanced_calc" = multiple methods (form optional, logic.type = "advanced")

6. **Expressions must be valid**: Math expressions in `logic.outputs[].expression` or `logic.methods[].variables[].expression` must reference field IDs or other variables that exist.

7. **Unit IDs must exist**: `fromUnitId` and `toUnitId` must match actual entries in `lib/conversions.ts`.

8. **`page_content.introduction` is array of strings**: Not a single string, not an object with "title" + "body". Example: `["String 1", "String 2", "String 3"]`

9. **`page_content.faqs` is array of objects**: Each object must have `question` and `answer` keys only. Example: `[{ "question": "Q?", "answer": "A." }]`

10. **`page_content.citations` is array of objects**: Each object must have `label` and `url` keys (no HTML in either). **URLs MUST be plain strings like `"https://example.com"` – NEVER use Markdown syntax `[url](url)` or HTML `<a>` tags.**

11. **No trailing commas, no undefined values, no comments in JSON**.

## Common Mistakes (DON'T DO THIS)

### ❌ WRONG: Converter with form and expression engine
```json
{
  "component_type": "converter",
  "config_json": {
    "logic": {
      "type": "expression",
      "engine": "math-expression",
      "expressions": [...]
    },
    "form": { ... }
  }
}
```
**Problem**: Converters use "conversion" type, not "expression". No form needed.

### ❌ WRONG: Markdown URLs in citations
```json
"citations": [
  {
    "label": "NIST Standards",
    "url": "[https://nist.gov/...](https://nist.gov/...)"
  }
]
```
**Problem**: URLs have [brackets]. Should be plain: `"url": "https://nist.gov/..."`

### ❌ WRONG: Nested page_content structure
```json
"page_content": {
  "formula": {
    "heading": "How to Convert",
    "body": "Step by step..."
  },
  "faq": {
    "items": [...]
  }
}
```
**Problem**: Should use flat arrays. Correct format:
```json
"page_content": {
  "introduction": ["String 1", "String 2"],
  "faqs": [{ "question": "Q?", "answer": "A." }]
}
```

### ❌ WRONG: Extra metadata fields
```json
"metadata": {
  "title": "...",
  "description": "...",
  "canonical_url": "...",
  "robots": "...",
  "keywords": [...],
  "schema_org": {...},
  "open_graph": {...}
}
```
**Problem**: Only `title` and `description` allowed. SEO fields belong in Next.js config, not here.

---

## Example: Minimal Converter (COPY THIS STRUCTURE)

```json
{
    "version": "1.0.0",
    "metadata": {
      "title": "Convert Kilocalories to Kilojoules",
      "description": "Convert energy values between kilocalories and kilojoules using SI-consistent standards."
    },
    "logic": {
      "type": "conversion",
      "fromUnitId": "kilocalorie",
      "toUnitId": "kilojoule"
    },
    "page_content": {
      "introduction": [
        "Convert energy values between kilocalories and kilojoules.",
        "Based on the thermochemical definition: 1 kcal = 4.184 kJ."
      ],
      "methodology": [
        "The conversion factor comes from NIST standards."
      ],
      "faqs": [
        {
          "question": "What is the exact relationship?",
          "answer": "1 kcal = 4.184 kJ by thermochemical definition."
        }
      ],
      "citations": [
        {
          "label": "NIST SI unit conversion",
          "url": "https://nvlpubs.nist.gov/..."
        }
      ]
    },
    "links": {
      "internal": ["/conversions/energy/..."],
      "external": []
    },
    "schema": {
      "additionalTypes": ["HowTo"]
    }
  
}
```

---

## VALIDATION CHECKLIST (Before you respond with JSON)

**Read this checklist and verify every item:**

- [ ] My JSON is valid (no syntax errors, balanced quotes/braces)
- [ ] `component_type` is EXACTLY one of: "converter", "simple_calc", "advanced_calc"
- [ ] `logic.type` matches the component_type:
  - converter → "conversion"
  - simple_calc → "formula"
  - advanced_calc → "advanced"
- [ ] `fromUnitId` and `toUnitId` are real units in lib/conversions.ts (e.g., "lumen", "lux", "meter", "foot")
- [ ] `metadata` has ONLY: `title` (string, no HTML) and `description` (string, no HTML)
- [ ] `page_content` has ONLY these fields (as arrays of strings): `introduction`, `methodology`, and optional `examples`, `summary`, `glossary`
- [ ] `page_content.faqs` is an array of objects: `[{ "question": "...", "answer": "..." }]` – NO "items" nested object
- [ ] `page_content.citations` is an array of objects: `[{ "label": "...", "url": "..." }]` – URLs are PLAIN STRINGS, not Markdown
- [ ] All URLs are bare HTTPS strings like `"https://example.com"` – NOT `"[https://example.com](https://example.com)"` or `"<a href='...'>"`
- [ ] No HTML tags (`<div>`, `<p>`, `<br>`, etc.) in any text field
- [ ] No forbidden fields like `form` (for converters), `description`, `canonical_url`, `robots`, `keywords`, etc.
- [ ] Arrays like `introduction`, `methodology`, `faqs`, `citations` are NOT nested in objects like `{ "title": "...", "body": [...] }`

**If any checkbox fails, fix it before responding.**

---

## CRITICAL: Internal checklist before you generate JSON

Before you generate the JSON, you must internally verify ALL of the following.
These checks are for your own reasoning only – do NOT print this checklist,
do NOT explain it, do NOT ask any follow-up questions. You will only return
the final JSON object.

1. You have correctly chosen the calculator type:
   `component_type` is exactly one of `"converter"`, `"simple_calc"`, or `"advanced_calc"`,
   and `logic.type` matches (`"conversion"`, `"formula"`, or `"advanced"`).

2. You will use `page_content` as **flat arrays only**:
   `introduction[]`, `methodology[]`, `faqs[]`, `citations[]`
   (plus any allowed optional arrays like `examples`, `summary`, `glossary`).

3. All URLs in `page_content.citations[].url` are **plain HTTPS strings**,
   with no Markdown like `[url](url)` and no HTML tags.

4. You have NOT added any forbidden fields (no `slug`, `name`, `category`,
   `meta`, `schema_org`, `canonical_url`, `robots`, `keywords`, or any other
   field not explicitly listed in this schema).

5. All math expressions reference existing field IDs or variables, and
   `fromUnitId` / `toUnitId` (if used) are valid unit IDs.

6. You understand that this is the final JSON and you cannot add commentary
   or explanations afterward.

Once all points above are satisfied IN YOUR INTERNAL REASONING,
you directly output the final JSON object and nothing else.
Do not print the checklist, do not ask “Ready for me to produce the JSON?”.


This ensures you have understood the schema before committing to output.

---


## Reference Documentation

For any ambiguity not covered here, see:
- **QUANTUS_SCHEMA_DEFINITIVE.md** – Complete specification with no exceptions
- **SCHEMA_ENFORCEMENT_GUIDE.md** – User guide for following this schema
- **lib/conversions.ts** – Current list of supported unit IDs

If something is not in QUANTUS_SCHEMA_DEFINITIVE.md, it is NOT allowed.
