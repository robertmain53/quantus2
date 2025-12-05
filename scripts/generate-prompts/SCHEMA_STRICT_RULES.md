# Cernarus Config Schema – STRICT ENFORCEMENT RULES

You MUST follow these rules exactly.  
Do not deviate. Do not add extra fields.

These rules apply to the inner `config_json` object only.

---

## 1. Choosing the correct `component_type`

Before generating any JSON, decide which calculator type is appropriate:

### `component_type: "converter"`

Use **converter** if:

- You are converting between **two units** (e.g. kilocalories ↔ kilojoules, lumens ↔ lux, miles ↔ kilometers).
- The conversion is a **fixed mathematical relationship**.
- The user typically enters **one value** and gets **one primary output**.
- No additional variables or intermediate expressions are needed.

Examples:

- “Convert Kilocalories to Kilojoules”
- “Lumens to Lux Converter”
- “Miles to Kilometers Converter”

### `component_type: "simple_calc"`

Use **simple_calc** if:

- You are computing values using **one formula block** with multiple inputs.
- There is **one primary result** (possibly with a small number of supporting outputs).
- The calculator logic is straightforward and can be expressed as:
  - `logic.type = "formula"`
  - `logic.outputs[]` with `expression` fields referencing `form.fields[].id`.

Examples:

- BMI calculator (weight + height → BMI)
- Mortgage payment calculator
- Break-even point calculator

### `component_type: "advanced_calc"`

Use **advanced_calc** if:

- There are **multiple methods** or scenarios in a single tool.
- Users can switch between different formulas or workflows.
- You need an internal graph of **variables** with dependencies and multiple outputs per method.

Examples:

- Retirement planner with multiple methods
- Complex engineering calculators with several modes
- “From Volume” vs “From Area × Depth” methods within one tool

> **CRITICAL:**
>
> - Do NOT use `simple_calc` or `advanced_calc` for pure unit conversions.
> - Do NOT add a `form` object to a pure converter.

---

## 2. Top-level wrapper structure (for ChatGPT output)

Your full response to the user (outside this schema) may include a wrapper like:

```json
{
  "component_type": "converter|simple_calc|advanced_calc",
  "config_json": { ... }
}
```

The repo, however, saves **only** the inner `config_json` to `data/configs/*.json`.

---

## 3. `config_json` for `component_type: "converter"`

**Allowed fields in `config_json`:**

- `version` (required)

  - String, semantic version, e.g. `"1.0.0"`.

- `metadata` (required)

  - `title`: string, no HTML.
  - `description`: string, no HTML.

- `logic` (required)

  - `type`: MUST be exactly `"conversion"`.
  - `fromUnitId`: string; MUST match a valid unit ID in `lib/conversions.ts`.
  - `toUnitId`: string; MUST match a valid unit ID in `lib/conversions.ts`.
  - **Do NOT add**: `factor`, `formula`, `precision`, `units`, `customFactors`, `methods`, `variables`, or any other fields.

- `form`

  - **Omit entirely** or set to `null` for simple conversions.
  - Converters normally rely on the generic converter UI, not custom forms.

- `page_content` (required)

  - Object with these keys ONLY:
    - `introduction`: array of plain-text strings (2–3 paragraphs).
    - `methodology`: array of plain-text strings (authoritative explanation).
    - `how_is_calculated`: array of plain-text strings (concise formulas / steps).
    - `faqs`: array of objects `{ "question": ".", "answer": "." }`.
    - `citations`: array of objects `{ "label": ".", "url": "." }`.
  - Optional additional arrays (same flat format as above):
    - `examples`
    - `summary`
    - `glossary` (if used, must be array of `{ "term": ".", "definition": "." }`).
  - **Do NOT add** nested structures like `{ "title": "...", "body": "..." }`.
  - **Do NOT use HTML or Markdown** (no `<p>`, `<br>`, `**bold**`, or `[link](url)`).

- `links` (optional)

  - `internal`: array of string slugs (e.g. `"/conversions/length/meters-to-feet"`).
  - `external`: array of objects:
    ```json
    {
      "url": "https://example.com",
      "label": "Example Label",
      "rel": ["noopener", "noreferrer"]
    }
    ```

- `schema` (optional)
  - `additionalTypes`: array of strings, e.g. `["HowTo"]`.

---

## 4. `config_json` for `component_type: "simple_calc"`

**Allowed fields:**

- `version`, `metadata` – same constraints as converters.

- `logic` (required)

  - `type`: MUST be exactly `"formula"`.
  - `outputs`: array of objects:
    ```json
    {
      "id": "string",
      "label": "string",
      "expression": "math expression referencing form.fields[].id",
      "unit": "optional string",
      "format": "currency|percent|decimal|integer"
    }
    ```
  - **Do NOT add**: `expressions`, `engine`, `precision`, `isPrimary`, `description` or any custom logic fields.

- `form` (required)

  - `fields`: array of input field objects:
    ```json
    {
      "id": "string",
      "label": "string",
      "type": "number|integer|select|text",
      "default": number|string,
      "min": optional number,
      "max": optional number,
      "step": optional number,
      "options": [
        { "label": "string", "value": "string" }
      ] // for select
    }
    ```
  - `result` (optional)
    - `outputs`: **array of objects**, never strings.
      - Each object MUST have:
        - `id`: string – must match one of `logic.outputs[].id`.
        - `label`: string – user-facing label.
      - May also include:
        - `format`: `"currency" | "percent" | "decimal" | "integer"`.
        - `unit`: string (e.g. `"kg"`, `"years"`, `"%"`).

  #### ❌ WRONG (will break the build)

  ```json
  "result": {
    "outputs": [
      "ebit",
      "ebit_reconciled",
      "ebit_margin"
    ]
  }
  ```

  #### ✅ CORRECT

  ```json
  "result": {
    "outputs": [
      { "id": "ebit", "label": "EBIT (Earnings Before Interest & Taxes)" },
      { "id": "ebit_reconciled", "label": "EBIT (reconciled from Net Income)" },
      { "id": "ebit_margin", "label": "EBIT Margin (%)" }
    ]
  }
  ```

- `page_content`, `links`, `schema`
  - Same format and restrictions as for converters.

---

## 5. `config_json` for `component_type: "advanced_calc"`

**Allowed fields:**

- `version`, `metadata` – same constraints as converters.

- `logic` (required)

  - `type`: MUST be exactly `"advanced"`.
  - `defaultMethod`: string – key of the default method.
  - `methods`: object map of method definitions:
    ```json
    {
      "method_id": {
        "label": "string",
        "description": "optional string",
        "variables": {
          "var_name": {
            "expression": "math expression",
            "dependencies": ["other_var", "field_id"],
            "label": "string",
            "unit": "optional string",
            "format": "currency|percent|decimal|integer",
            "display": true
          }
        },
        "outputs": [
          {
            "id": "string",
            "label": "string",
            "variable": "var_name",
            "unit": "optional string",
            "format": "currency|percent|decimal|integer"
          }
        ]
      }
    }
    ```

- `form` (optional)

  - `fields`: global inputs (same format as simple_calc).
  - `sections`: grouped inputs with optional `show_when`:
    ```json
    {
      "id": "section_id",
      "label": "Section label",
      "show_when": { "field": "field_id", "is": "value" },
      "fields": [
        {
          "id": "field_id",
          "label": "string",
          "type": "number|integer|select|text",
          "default": number|string,
          "min": optional number,
          "max": optional number,
          "step": optional number,
          "options": [
            { "label": "string", "value": "string" }
          ]
        }
      ]
    }
    ```

- `page_content`, `links`, `schema`
  - Same format and restrictions as for converters.

---

## 6. `page_content` rules (all types)

- `page_content` MUST be a flat object of arrays and simple objects:

  - `introduction`: `string[]`
  - `methodology`: `string[]`
  - `how_is_calculated`: `string[]`
  - `examples`: `string[]` (optional)
  - `summary`: `string[]` (optional)
  - `faqs`: `{ question, answer }[]`
  - `citations`: `{ label, url }[]`
  - `glossary`: `{ term, definition }[]` (optional)

- **No HTML, no Markdown**:

  - No `<div>`, `<p>`, `<br>`, `<strong>`, etc.
  - No `**bold**`, `_italic_`, `[link](url)`, or `> blockquote`.

- **URLs**:

  - `citations[].url` must be plain strings like:
    - `"https://example.com/path"`
  - Do NOT wrap in Markdown or HTML.

- **Glossary**:
  - If used, MUST look like:
    ```json
    "glossary": [
      { "term": "Bulk density", "definition": "Mass per unit volume..." },
      { "term": "Compaction factor", "definition": "Ratio that describes..." }
    ]
    ```
  - NOT an array of strings.

---

## 7. Forbidden patterns (will be rejected)

- Converters with form + expression engine:

  ```json
  {
    "logic": {
      "type": "expression",
      "engine": "math-expression",
      "expressions": [...]
    },
    "form": { ... }
  }
  ```

- Markdown URLs:

  ```json
  "citations": [
    {
      "label": "NIST",
      "url": "[https://nist.gov/...](https://nist.gov/...)"
    }
  ]
  ```

- Nested `page_content`:

  ```json
  "page_content": {
    "formula": {
      "heading": "How to Convert",
      "body": "..."
    }
  }
  ```

- Extra metadata fields in `metadata`:
  - Do **not** add `canonical_url`, `robots`, `keywords`, `schema_org`, `open_graph`, etc.

---

## 8. Internal checklist (for the model, not to be printed)

Before you output JSON you must internally verify:

1. `component_type` is exactly `"converter"`, `"simple_calc"`, or `"advanced_calc"`.
2. `logic.type` matches:
   - converter → `"conversion"`
   - simple_calc → `"formula"`
   - advanced_calc → `"advanced"`.
3. `fromUnitId` / `toUnitId` (if present) exist in `lib/conversions.ts`.
4. `page_content` uses only allowed keys and flat arrays (no nested objects).
5. `page_content.faqs` and `page_content.citations` are arrays of objects with the required keys.
6. `page_content.glossary` (if present) is an array of `{ term, definition }` objects.
7. No HTML or Markdown is present in any text.
8. No forbidden fields are present.
9. All expressions reference existing field IDs or variables.

Once all checks pass in your internal reasoning, output ONLY the final JSON object (for `config_json`), no commentary.
