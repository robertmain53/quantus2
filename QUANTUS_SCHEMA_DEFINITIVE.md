# Cernarus Calculator Config Schema – Definitive Specification

**Version**: 1.0.0
**Last Updated**: November 28, 2025
**Status**: FROZEN (no guessing, no variations)

---

## CRITICAL PREAMBLE

This document defines the **ONLY acceptable JSON structure** for Cernarus calculators. There are NO exceptions, NO variations, NO ambiguities.

If you encounter anything not in this document, **STOP and ask** instead of guessing.

---

## Top-Level Structure (EXACT)

```json
{
  "component_type": "converter|simple_calc|advanced_calc",
  "config_json": {
    /* everything else goes here */
  }
}
```

**Rules:**
- The wrapper ALWAYS has exactly these two keys
- `component_type` must be a STRING, one of the three values above
- `config_json` is an OBJECT containing the calculator configuration
- NO other top-level keys are allowed (no "schema_org", no "meta", no "slug", no "category")

---

## config_json Structure (BY COMPONENT_TYPE)

### For `component_type: "converter"`

```json
{
  "component_type": "converter",
  "config_json": {
    "version": "1.0.0",
    "metadata": {
      "title": "string (title only, no HTML)",
      "description": "string (description only, no HTML)"
    },
    "logic": {
      "type": "conversion",
      "fromUnitId": "string matching lib/conversions.ts",
      "toUnitId": "string matching lib/conversions.ts"
    },
    "page_content": {
      "introduction": ["string", "string", "string"],
      "methodology": ["string", "string", ...],
      "faqs": [
        { "question": "string", "answer": "string" },
        { "question": "string", "answer": "string" }
      ],
      "citations": [
        { "label": "string", "url": "https://..." },
        { "label": "string", "url": "https://..." }
      ],
      "examples": ["string", "string", ...],
      "summary": ["string", ...],
      "glossary": ["string", ...]
    },
    "links": {
      "internal": ["/conversions/category/slug", ...],
      "external": [
        { "label": "string", "url": "https://...", "rel": ["external"] },
        ...
      ]
    },
    "schema": {
      "additionalTypes": ["HowTo"]
    }
  }
}
```

**MANDATORY fields:**
- `version` (required, must be semantic string "X.Y.Z")
- `metadata.title` (required, string, no HTML)
- `metadata.description` (required, string, no HTML)
- `logic.type` (required, must be exactly "conversion")
- `logic.fromUnitId` (required, string)
- `logic.toUnitId` (required, string)
- `page_content` (required, object)

**OPTIONAL fields in page_content:**
- `introduction` (recommended, array of strings 2–5 items)
- `methodology` (recommended, array of strings 3–7 items)
- `faqs` (recommended, array of objects with question/answer only)
- `citations` (recommended, array of objects with label/url only)
- `examples` (optional, array of strings)
- `summary` (optional, array of strings)
- `glossary` (optional, array of strings)

**OPTIONAL fields at root:**
- `links` (optional, object with internal and external arrays)
- `schema` (optional, object with additionalTypes array)

**FORBIDDEN fields (DO NOT ADD):**
- `slug`, `name`, `category`, `topic`, `meta`, `schema_org`
- `calculator`, `content`, `form` (for converters)
- `body`, `body_sections`, `sections`, `hero`
- `tags`, `precision`, `controls`, `units`, `fields`
- `formulas`, `js`, `expressions`, `engine`
- `og_title`, `og_description`, `og_type`
- `robots`, `canonical_url`, `keywords`
- ANY other fields not explicitly listed above

---

### For `component_type: "simple_calc"`

```json
{
  "component_type": "simple_calc",
  "config_json": {
    "version": "1.0.0",
    "metadata": {
      "title": "string",
      "description": "string"
    },
    "logic": {
      "type": "formula",
      "outputs": [
        {
          "id": "string",
          "label": "string",
          "expression": "math expression referencing form.fields[].id",
          "unit": "optional string",
          "format": "currency|percent|decimal|integer"
        }
      ]
    },
    "form": {
      "fields": [
        {
          "id": "string",
          "label": "string",
          "type": "number|text|select",
          "unit": "optional string",
          "required": true,
          "constraints": {
            "min": 0,
            "max": 1000
          }
        }
      ]
    },
    "page_content": {
      "introduction": [...],
      "methodology": [...],
      "faqs": [...],
      "citations": [...]
    },
    "links": {...},
    "schema": {...}
  }
}
```

**MANDATORY:**
- `version`
- `metadata.title`, `metadata.description`
- `logic.type` (must be "formula")
- `logic.outputs` (array of output objects)
- `form.fields` (required for simple_calc, array of input fields)
- `page_content`

**OPTIONAL:**
- `links`, `schema`

**FORBIDDEN:**
- `fromUnitId`, `toUnitId` (these are for converters)
- `form` field without `fields` array
- Any field listed as forbidden for converters

---

### For `component_type: "advanced_calc"`

```json
{
  "component_type": "advanced_calc",
  "config_json": {
    "version": "1.0.0",
    "metadata": {
      "title": "string",
      "description": "string"
    },
    "logic": {
      "type": "advanced",
      "defaultMethod": "string (method id)",
      "methods": {
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
              "display": true
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
    },
    "form": {
      "fields": [...],
      "sections": [...]
    },
    "page_content": {...},
    "links": {...},
    "schema": {...}
  }
}
```

**MANDATORY:**
- `version`
- `metadata.title`, `metadata.description`
- `logic.type` (must be "advanced")
- `logic.defaultMethod`
- `logic.methods` (object with at least one method)
- `page_content`

**OPTIONAL:**
- `form` (unlike simple_calc, form is optional for advanced_calc)
- `links`, `schema`

---

## page_content Field Rules (All Types)

### introduction
- Type: `["string", "string", ...]`
- Required: No (recommended for all types)
- Use: 2–3 paragraph summary of what the calculator does
- Format: Plain text strings only (no HTML, no Markdown)
- Example:
  ```json
  "introduction": [
    "This converter transforms lux to lumens...",
    "Use it when you have illuminance measurements..."
  ]
  ```

### methodology
- Type: `["string", "string", ...]`
- Required: No (recommended for all types)
- Use: 3–7 paragraphs explaining the mathematical basis, standards, or formula
- Format: Plain text strings only
- Example:
  ```json
  "methodology": [
    "Lux is defined as one lumen per square metre...",
    "The SI standard specifies..."
  ]
  ```

### examples
- Type: `["string", "string", ...]`
- Required: No (optional)
- Use: Worked examples, real-world scenarios
- Format: Plain text strings only
- Example:
  ```json
  "examples": [
    "Example 1: A 10 m² room with 500 lux requires 5000 lumens...",
    "Example 2: Lab equipment rated at 1000 lux..."
  ]
  ```

### faqs
- Type: `[{ "question": "string", "answer": "string" }, ...]`
- Required: No (recommended for all types)
- Use: Frequently asked questions with answers
- Format: Objects with exactly two keys: `question` and `answer` (plain text only)
- Rules:
  - Each object MUST have exactly `question` and `answer` (no other keys)
  - NO nested objects, NO markdown in answers
  - NO `answer_markdown`, NO `items` nested array
- Example:
  ```json
  "faqs": [
    {
      "question": "What is lux?",
      "answer": "Lux is a unit of illuminance equal to one lumen per square metre."
    }
  ]
  ```

### citations
- Type: `[{ "label": "string", "url": "https://..." }, ...]`
- Required: No (recommended for all types)
- Use: Authoritative sources (NIST, universities, standards bodies)
- Format: Objects with exactly two keys: `label` and `url` (plain strings only)
- Rules:
  - Each object MUST have exactly `label` and `url` (no other keys)
  - URLs MUST be plain strings: `"https://example.com"`
  - URLs MUST NOT be Markdown: `"[https://example.com](...)"`
  - URLs MUST NOT be HTML: `"<a href='...'>"`
  - All URLs MUST be HTTPS (not HTTP)
- Example:
  ```json
  "citations": [
    {
      "label": "NIST SI Standards",
      "url": "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.330-2019.pdf"
    }
  ]
  ```

### summary
- Type: `["string", "string", ...]`
- Required: No (optional)
- Use: Brief summary of key points
- Format: Plain text strings only

### glossary
- Type: `["string", "string", ...]`
- Required: No (optional)
- Use: Definitions of technical terms
- Format: Plain text strings only

---

## links Object (Optional)

```json
"links": {
  "internal": [
    "/conversions/length/meters-to-feet-converter",
    "/conversions/length/feet-to-meters-converter"
  ],
  "external": [
    {
      "label": "NIST Guide to SI",
      "url": "https://www.nist.gov/pml/special-publication-811/...",
      "rel": ["external"]
    }
  ]
}
```

**Rules:**
- `internal` is an array of slug strings (e.g., "/conversions/category/slug-name")
- `external` is an array of objects with `label`, `url`, and `rel` keys
- URLs in external array MUST be plain HTTPS strings
- The `rel` field should contain `["external"]`

---

## schema Object (Optional)

```json
"schema": {
  "additionalTypes": ["HowTo"]
}
```

**Rules:**
- `additionalTypes` is an array of strings
- Recommended value: `["HowTo"]` for educational converters
- No other keys are allowed

---

## Text Field Rules (UNIVERSAL)

These rules apply to ALL text fields (metadata.title, metadata.description, introduction[], methodology[], examples[], faqs[].answer, etc.):

1. **NO HTML**: Do not use `<div>`, `<p>`, `<br>`, `<a>`, `<span>`, or any HTML tags
2. **NO Markdown**: Do not use `**bold**`, `_italic_`, `[link](url)`, `# headers`, etc.
3. **NO LaTeX**: Do not use `$$...$$` or `\(...\)` for math
4. **Plain text only**: Use plain ASCII or Unicode text
5. **Special characters OK**: You may use Unicode characters like `·`, `×`, `→`, `°`, etc.
6. **Line breaks**: Use `\n` if multi-line text is needed within a string
7. **Escape quotes**: If using double quotes inside a string, escape them as `\"`

**Examples of CORRECT text:**
```
"Torque = Force × Distance"
"SI definition: 1 lux = 1 lumen per m²"
"The relationship is: E = F / A, where E is illuminance and A is area."
"Convert between °C and °F using the formula: T(°F) = T(°C) × 9/5 + 32"
```

**Examples of WRONG text:**
```
"Torque = <strong>Force</strong> × Distance"  ❌ HTML
"**Torque** = Force × Distance"  ❌ Markdown
"Torque = $F \times d$"  ❌ LaTeX
"Check [NIST guide](https://nist.gov)"  ❌ Markdown link
```

---

## Unit ID Validation (for converters)

For `component_type: "converter"`, the `logic.fromUnitId` and `logic.toUnitId` MUST exist in `lib/conversions.ts`.

**Currently supported units** (as of 2025-11-28):
- **Length**: meter, kilometer, foot, inch, centimeter, millimeter, yard, mile
- **Weight**: gram, kilogram, pound, ounce, ton
- **Temperature**: celsius, fahrenheit, kelvin
- **Volume**: liter, milliliter, gallon, cup, pint, fluid_ounce
- **Area**: square_meter, square_foot, square_kilometer, hectare, acre
- **Illuminance**: lumen, lux
- **Torque**: newton_meter, foot_pound

To add a new unit, modify `lib/conversions.ts` BEFORE creating a calculator that uses it.

---

## JSON Validation Rules

1. **No trailing commas**: `["item1", "item2"]` not `["item1", "item2",]`
2. **No comments**: JSON does not support comments
3. **No undefined values**: All values must be strings, numbers, booleans, arrays, or objects
4. **Balanced braces and quotes**: `{` pairs with `}`, `"` pairs with `"`
5. **Valid JSON structure**: Use a JSON validator (jsonlint.com) before submission

---

## Checklist for Authors (ChatGPT or Human)

Before submitting a JSON:

- [ ] Is `component_type` one of: "converter", "simple_calc", "advanced_calc"?
- [ ] Is `config_json` an object (not a string)?
- [ ] Is `version` a semantic string like "1.0.0"?
- [ ] Does `metadata` have ONLY `title` and `description`? (no other fields)
- [ ] Does `logic.type` match the `component_type`?
  - [ ] converter → "conversion"
  - [ ] simple_calc → "formula"
  - [ ] advanced_calc → "advanced"
- [ ] For converters: Do `logic.fromUnitId` and `logic.toUnitId` exist in lib/conversions.ts?
- [ ] For simple_calc: Does `form.fields` exist and have at least one field?
- [ ] For advanced_calc: Does `logic.methods` have at least one method?
- [ ] Are all `page_content` arrays (introduction[], methodology[], faqs[], citations[])?
- [ ] Do FAQ objects have ONLY `question` and `answer`? (no other keys)
- [ ] Do citation objects have ONLY `label` and `url`? (no other keys)
- [ ] Are all URLs plain strings (no Markdown, no HTML)? All HTTPS?
- [ ] Are there NO forbidden fields (slug, name, category, meta, schema_org, calculator, etc.)?
- [ ] Is there NO HTML or Markdown in any text field?
- [ ] Is the JSON valid? (no trailing commas, no undefined values, balanced braces)
- [ ] Is the JSON parseable? (paste into jsonlint.com)

---

## Summary: EXACT vs. FLEXIBLE

| Aspect | Status | Examples |
|--------|--------|----------|
| Component types | EXACT | Only "converter", "simple_calc", "advanced_calc" |
| Metadata fields | EXACT | Only "title" and "description" |
| page_content structure | EXACT | Flat arrays only: introduction[], methodology[], faqs[], citations[] |
| FAQ objects | EXACT | Only "question" and "answer" keys |
| Citation objects | EXACT | Only "label" and "url" keys |
| URL format | EXACT | Plain HTTPS strings only, no Markdown or HTML |
| Text content | FLEXIBLE | Plain text, any language, Unicode OK |
| Introduction/methodology length | FLEXIBLE | 2-7 paragraphs, author's choice |
| FAQ count | FLEXIBLE | 3-10 FAQs, author's choice |
| Citation count | FLEXIBLE | 3-8 citations, author's choice |
| page_content optional fields | FLEXIBLE | Include examples, summary, glossary as needed |

---

## If You Have Doubts

**DO NOT GUESS.** Instead:

1. Check this document first (is your question answered here?)
2. Look at a passing example (JSON #3: newton-meters-to-foot-pounds-converter)
3. Ask explicitly before proceeding
4. Never assume variations are allowed if not listed

**This document is the source of truth. Past practice, assumptions, and inference are NOT valid.**

---

**Document Status**: FROZEN
**Last Review**: November 28, 2025
**Approved for**: ChatGPT, developers, validators
