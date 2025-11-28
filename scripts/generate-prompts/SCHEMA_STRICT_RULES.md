# Quantus Config Schema – STRICT ENFORCEMENT RULES

**You MUST follow these rules exactly. Do not deviate. Do not add extra fields.**

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
2. **NO custom fields**: Don't add `description`, `notes`, `help`, `ui`, `layout`, `styling`, etc.
3. **NO nested `page_content` objects**: Don't use `{ "title": "...", "body": "..." }` format. Use flat arrays of strings.
4. **Converters don't have `form`**: Omit the field entirely or set to `null`.
5. **Expressions must be valid**: Math expressions in `logic.outputs[].expression` or `logic.methods[].variables[].expression` must reference field IDs or other variables that exist.
6. **Unit IDs must exist**: `fromUnitId` and `toUnitId` must match actual entries in `lib/conversions.ts`.
7. **`page_content.introduction` is array of strings**: Not a single string, not an object with "title" + "body".
8. **`page_content.faqs` is array of objects**: Each object must have `question` and `answer` keys only.
9. **`page_content.citations` is array of objects**: Each object must have `label` and `url` keys (no HTML in either).
10. **No trailing commas, no undefined values, no comments in JSON**.

## Example: Minimal Converter (COPY THIS STRUCTURE)

```json
{
  "component_type": "converter",
  "config_json": {
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
}
```

---

**BEFORE YOU RESPOND WITH JSON:**
1. Check that your JSON is valid (paste into jsonlint.com if unsure).
2. Verify every field name matches this schema exactly.
3. Confirm no HTML or extra fields are present.
4. Ensure `introduction`, `methodology`, `faqs`, `citations` are arrays, not objects.
5. Return ONLY the JSON object. No commentary, no markdown code blocks, no explanations.
