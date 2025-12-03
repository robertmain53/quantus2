# Cernarus / Quantus Calculator Config Schema – DEFINITIVE SPECIFICATION (FULL)

**Version**: 1.0.0  
**Last Updated**: December 3, 2025  
**Status**: FROZEN – This is the single source of truth. No guessing, no variations.

---

## 0. CRITICAL PREMISE

This document defines the **only** acceptable JSON structure for Cernarus / Quantus calculators.

If something you want to do is **not explicitly allowed here**, then it is **forbidden**.

- Do **not** improvise new fields.
- Do **not** change types or nesting.
- Do **not** introduce Markdown, HTML, LaTeX, or comments inside JSON.

All validators, build scripts, and AI prompts must treat this document as **law**.

---

## 1. Top-Level Shape (Wrapper)

Every calculator configuration is represented by **exactly one** JSON object with **two** top-level keys:

```json
{
  "component_type": "converter|simple_calc|advanced_calc",
  "config_json": { /* calculator definition */ }
}
```

### 1.1. Rules

- `component_type`
  - Type: **string**
  - Allowed values: `"converter"`, `"simple_calc"`, `"advanced_calc"`
  - Must match the semantics of the calculator (see Section 2).

- `config_json`
  - Type: **object**
  - Contains **all** remaining fields.

- **Forbidden** top-level keys:
  - `slug`, `name`, `category`, `topic`
  - `meta`, `schema_org`, `seo`, `open_graph`, `twitter_card`
  - `calculator`, `content`, `layout`, `theme`
  - Any other key not listed above (`component_type`, `config_json`) is invalid.

If the wrapper is omitted (e.g., only `config_json` is stored in `data/configs`), any process that reconstructs the wrapper must do so exactly in this form.

---

## 2. Choosing `component_type`

You must select **exactly one** of the following types based on what the calculator does.

### 2.1. `converter`

Use `component_type: "converter"` **only if**:

- The tool converts **between two units** (e.g., meters ↔ feet, psi ↔ bar).  
- The relationship between units is **fixed and deterministic**.  
- The user primarily inputs **one value** and gets **one converted value**.  
- No complex multi-step workflow or case-based logic is required.

Converters:

- Do **not** expose formulas directly in JSON.
- Do **not** define custom units or extra conversion logic.
- Delegate all unit handling to `lib/conversions.ts`.

### 2.2. `simple_calc`

Use `component_type: "simple_calc"` if:

- The calculator uses a **single main formula** (or tightly related formulas) to compute outputs.  
- The user fills a **single form** (one set of fields).  
- There is **one primary output**, optionally with a few related metrics.  
- Examples: CAGR calculator, markup calculator, EBITDA from a fixed set of inputs.

### 2.3. `advanced_calc`

Use `component_type: "advanced_calc"` if:

- There are **multiple methods** or formula paths (e.g., Method A vs Method B).  
- Variables depend on **other variables and/or multiple inputs** with richer relationships.  
- The workflow may need **conditional logic**, or different sets of inputs per method.  
- Examples: retirement planning (several strategies), amortization engines with scenario tabs, multi-angle financial ratio suites.

---

## 3. `config_json` by Component Type

Below we describe the **exact** allowed structure for `config_json` for each `component_type`.

---

## 3.1. `component_type: "converter"`

### 3.1.1. Structure

```json
{
  "component_type": "converter",
  "config_json": {
    "version": "1.0.0",
    "metadata": {
      "title": "string (no HTML)",
      "description": "string (no HTML)"
    },
    "logic": {
      "type": "conversion",
      "fromUnitId": "unit_id_in_lib_conversions.ts",
      "toUnitId": "unit_id_in_lib_conversions.ts"
    },
    "page_content": {
      "introduction": ["string", "string"],
      "methodology": ["string", "string"],
      "faqs": [
        { "question": "string", "answer": "string" }
      ],
      "citations": [
        { "label": "string", "url": "https://..." }
      ],
      "examples": ["string"],
      "summary": ["string"],
      "glossary": ["string"]
    },
    "links": {
      "internal": ["/conversions/...", "/other/slug"],
      "external": [
        {
          "label": "string",
          "url": "https://...",
          "rel": ["external"]
        }
      ]
    },
    "schema": {
      "additionalTypes": ["HowTo"]
    }
  }
}
```

### 3.1.2. Required Fields

Inside `config_json`:

- `version`
  - Type: string
  - Must be semantic style: e.g., `"1.0.0"`

- `metadata`
  - Type: object
  - Required keys:
    - `title`: string, no HTML/Markdown
    - `description`: string, no HTML/Markdown
  - No other keys allowed in `metadata`.

- `logic`
  - Type: object
  - Required keys:
    - `type`: must be `"conversion"`
    - `fromUnitId`: string, must match an existing ID in `lib/conversions.ts`
    - `toUnitId`: string, must match an existing ID in `lib/conversions.ts`
  - No other keys allowed in `logic` for converters (e.g., no `factor`, `expressions`, `precision`).

- `page_content`
  - Type: object
  - May contain any of:
    - `introduction`: array of strings
    - `methodology`: array of strings
    - `faqs`: array of `{ "question": string, "answer": string }`
    - `citations`: array of `{ "label": string, "url": string }`
    - `examples`: array of strings
    - `summary`: array of strings
    - `glossary`: array of strings
  - No nested sub-objects like `{ "title": "...", "body": [...] }`.

### 3.1.3. Optional Fields

- `links` (optional)
  - `internal`: array of slug strings (e.g., `"/conversions/length/feet-to-meters-converter"`)
  - `external`: array of objects:
    - `label`: string
    - `url`: HTTPS string
    - `rel`: array of strings (e.g., `["external"]`)

- `schema` (optional)
  - `additionalTypes`: array of strings (e.g., `["HowTo"]`)

### 3.1.4. Forbidden for Converters

- Any `form` key (converter UI is handled by the engine).
- Any `fields`, `outputs`, `engine`, `expressions`, `js`.
- Any SEO keys: `canonical_url`, `robots`, `schema_org`, `open_graph`, `keywords`.
- Any layout/content keys: `hero`, `sections`, `blocks`, `body`.

If a field is not explicitly listed above as allowed, treat it as **forbidden**.

---

## 3.2. `component_type: "simple_calc"`

### 3.2.1. Structure

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
          "expression": "math expression using form.fields[].id",
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
          "default": 0,
          "min": 0,
          "max": 1000,
          "step": 1,
          "options": [
            {
              "value": "string",
              "label": "string"
            }
          ]
        }
      ],
      "result": {
        "outputs": [
          {
            "id": "output_id",
            "label": "string",
            "unit": "optional string",
            "format": "currency|percent|decimal|integer"
          }
        ]
      }
    },
    "page_content": {
      "introduction": ["string"],
      "methodology": ["string"],
      "faqs": [
        { "question": "string", "answer": "string" }
      ],
      "citations": [
        { "label": "string", "url": "https://..." }
      ],
      "examples": ["string"],
      "summary": ["string"],
      "glossary": ["string"]
    },
    "links": {
      "internal": ["/...", "/..."],
      "external": [
        { "label": "string", "url": "https://...", "rel": ["external"] }
      ]
    },
    "schema": {
      "additionalTypes": ["HowTo"]
    }
  }
}
```

### 3.2.2. Required Fields

Inside `config_json`:

- `version`
- `metadata.title`
- `metadata.description`
- `logic`:
  - `type`: must be `"formula"`
  - `outputs`: non-empty array of output objects
- `form`:
  - `fields`: non-empty array of field objects
- `page_content`: object with the same rules as in converters.

### 3.2.3. `logic.outputs` Objects

Each output object **must** have:

- `id`: string (unique within outputs)
- `label`: string (display label)
- `expression`: string, a valid math expression referencing `form.fields[].id` or other allowed symbols.
- `unit`: optional string (e.g., `"currency"`, `"years"`)
- `format`: one of `"currency"`, `"percent"`, `"decimal"`, `"integer"`

### 3.2.4. `form.fields` Objects

Each field object:

- Required keys:
  - `id`: string (must be unique among fields)
  - `label`: string
  - `type`: `"number"`, `"text"`, or `"select"`
- Optional keys:
  - `unit`: string
  - `required`: boolean (default `false` if omitted)
  - `default`: number or string (must match `type`)
  - `min`: number (for `type: "number"`)
  - `max`: number (for `type: "number"`)
  - `step`: number (for `type: "number"`)
  - `options`: for `type: "select"`:
    - Array of `{ "value": string, "label": string }`

### 3.2.5. `form.result`

- Optional object to control how outputs are displayed.
- `outputs`: array of objects, each with:
  - `id`: **must match** one of the `logic.outputs[].id`
  - `label`: optional override label (if omitted, engine may fall back to logic output label)
  - `unit`: optional override (if omitted, engine may use `logic.outputs[].unit`)
  - `format`: optional override (if omitted, engine may use `logic.outputs[].format`)

> NOTE: This structure explains why build errors like  
> `form.result.outputs[0] must be an object` or `requires id and label` appear.  
> Each `form.result.outputs[]` entry must be an object, not a string; and must include at least `id` (and depending on validation, may require `label` too).

### 3.2.6. Forbidden for `simple_calc`

- `logic.fromUnitId`, `logic.toUnitId` (these belong only to converters).
- `logic.methods`, `defaultMethod` (reserved for `advanced_calc`).
- Additional keys in `logic` like `engine`, `expressions`, `precision`.
- SEO metadata beyond `title` and `description`.

---

## 3.3. `component_type: "advanced_calc"`

### 3.3.1. Structure

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
      "defaultMethod": "method_id",
      "methods": {
        "method_id": {
          "label": "string",
          "description": "optional string",
          "variables": {
            "var_name": {
              "expression": "math expression",
              "dependencies": ["other_var_1", "field_id_1"],
              "label": "string",
              "unit": "optional string",
              "format": "currency|percent|decimal|integer",
              "display": true
            }
          },
          "outputs": [
            {
              "id": "output_id",
              "label": "string",
              "variable": "var_name",
              "unit": "optional string",
              "format": "currency|percent|decimal|integer"
            }
          ]
        }
      }
    },
    "form": {
      "fields": [
        {
          "id": "string",
          "label": "string",
          "type": "number|text|select",
          "required": true,
          "default": 0,
          "min": 0,
          "max": 1000,
          "options": [
            {
              "value": "string",
              "label": "string"
            }
          ]
        }
      ],
      "sections": [
        {
          "id": "section_id",
          "label": "string",
          "description": "optional string",
          "show_when": {
            "field": "field_id",
            "equals": "value",
            "in": ["v1", "v2"]
          },
          "fields": ["field_id_1", "field_id_2"]
        }
      ]
    },
    "page_content": {
      "introduction": ["string"],
      "methodology": ["string"],
      "faqs": [
        { "question": "string", "answer": "string" }
      ],
      "citations": [
        { "label": "string", "url": "https://..." }
      ],
      "examples": ["string"],
      "summary": ["string"],
      "glossary": ["string"]
    },
    "links": {
      "internal": ["/...", "/..."],
      "external": [
        { "label": "string", "url": "https://...", "rel": ["external"] }
      ]
    },
    "schema": {
      "additionalTypes": ["HowTo"]
    }
  }
}
```

### 3.3.2. Required Fields

Inside `config_json`:

- `version`
- `metadata.title`, `metadata.description`
- `logic.type`: must be `"advanced"`
- `logic.defaultMethod`: string, must match one of the keys in `logic.methods`
- `logic.methods`: object with at least **one** method.
- `page_content`

### 3.3.3. `logic.methods`

Each method key (e.g., `"net_income_method"`) maps to an object:

- `label`: string (user-facing method name)
- `description`: optional string
- `variables`: object
  - Keys: variable ids (e.g., `"ebitda"`, `"margin"`)
  - Each variable object:
    - `expression`: string; may use:
      - Field IDs from `form.fields[]`
      - Other variable IDs in this method (respecting `dependencies`)
      - Simple math operations and functions supported by the engine
    - `dependencies`: array of strings listing field IDs and/or variable IDs used
    - `label`: string; optional display label
    - `unit`: optional string
    - `format`: `"currency" | "percent" | "decimal" | "integer"`
    - `display`: boolean; if true, variable can be surfaced as an output or as part of the UI
- `outputs`: array of output objects:
  - `id`: string (unique within method outputs)
  - `label`: string (user-facing label)
  - `variable`: string, must match a key in `variables`
  - `unit`: optional string
  - `format`: `"currency" | "percent" | "decimal" | "integer"`

### 3.3.4. `form` for Advanced Calculators

- Optional, but recommended:
  - `fields`: same schema as for `simple_calc`
  - `sections`: optional grouping for UX:
    - `id`: string
    - `label`: string
    - `description`: optional string
    - `show_when`: optional object for conditional rendering:
      - `field`: string (ID of a field)
      - `equals`: value (string/number) – optional
      - `in`: array of values – optional
    - `fields`: array of field IDs belonging to this section

### 3.3.5. Forbidden for `advanced_calc`

- `logic.fromUnitId`, `logic.toUnitId`
- `logic.outputs` at the top level (outputs are per-method)
- Arbitrary execution engines (`engine`, `js`, `script`)

---

## 4. `page_content` Rules (All Types)

`page_content` is a **flat object** whose keys map to **arrays**. No nested title/body schemas, no rich objects beyond `faqs` and `citations`.

### 4.1. Keys & Types

- `introduction`: array of strings
- `methodology`: array of strings
- `examples`: array of strings (optional)
- `faqs`: array of `{ "question": string, "answer": string }`
- `citations`: array of `{ "label": string, "url": string }`
- `summary`: array of strings (optional)
- `glossary`: array of strings (optional)

### 4.2. FAQ Objects

Each FAQ object:

```json
{
  "question": "string",
  "answer": "string"
}
```

- Exactly two keys: `question`, `answer`
- No nested objects, no extra flags like `id`, `category`, `tags`

### 4.3. Citation Objects

Each citation object:

```json
{
  "label": "string",
  "url": "https://..."
}
```

- Exactly two keys: `label`, `url`
- `url` must be a **plain HTTPS string** (no Markdown, no HTML).

### 4.4. Forbidden Page Content Shapes

- No nested `title/body` objects:
  - ❌ `"formula": { "heading": "How it works", "body": ["..."] }`
- No `items` arrays inside `faqs` or `citations`.
- No raw HTML (`<p>`, `<strong>`, `<a>`, etc.).
- No Markdown (`**bold**`, `[link](url)`, `# headings`).

All text must be **plain text**.

---

## 5. `links` Object (Optional)

```json
"links": {
  "internal": [
    "/conversions/length/feet-to-meters-converter",
    "/business/accounting/ebitda-calculator"
  ],
  "external": [
    {
      "label": "NIST Guide to SI",
      "url": "https://www.nist.gov/pml/special-publication-811/",
      "rel": ["external"]
    }
  ]
}
```

- `internal`: array of slug strings
- `external`: array of objects with `label`, `url`, `rel`
- All URLs must be **HTTPS**.

---

## 6. `schema` Object (Optional)

```json
"schema": {
  "additionalTypes": ["HowTo", "FinancialProduct"]
}
```

- `additionalTypes`: array of strings
- No other keys permitted inside `schema`.

---

## 7. Text Content Rules (Universal)

Apply these rules to **all strings** (titles, descriptions, paragraphs, FAQ answers, etc.).

1. No HTML tags (`<p>`, `<br>`, `<a>`, `<span>`, etc.).  
2. No Markdown (`**bold**`, `_italic_`, `[link](url)`, `# heading`).  
3. No LaTeX (`$...$`, `\(...\)`).  
4. Plain text only.  
5. Unicode symbols (`°`, `×`, `→`) are allowed.  
6. Escape internal `"` as `\"` if necessary.  
7. Use `\n` only when genuinely needed inside one string.

---

## 8. Unit ID Rules for Converters

For `converter`:

- `logic.fromUnitId` and `logic.toUnitId` **must** exist in `lib/conversions.ts`.
- Example unit IDs (illustrative; actual list lives in code):
  - Length: `meter`, `kilometer`, `foot`, `inch`, `yard`, `mile`
  - Mass: `gram`, `kilogram`, `pound`, `ounce`
  - Temperature: `celsius`, `fahrenheit`, `kelvin`
  - Torque: `newton_meter`, `foot_pound`
  - Pressure: `pascal`, `bar`, `psi` (depending on implementation)

If a unit is not in `lib/conversions.ts`, you **must not** reference it.

---

## 9. JSON Validity Rules

1. No trailing commas.  
2. No comments (`// ...` or `/* ... */`).  
3. All keys and string values in double quotes.  
4. Balanced braces/brackets.  
5. Values must be JSON types: string, number, boolean, object, array, or `null`.  
6. No `undefined` or special values like `NaN`, `Infinity`.

---

## 10. Author / Model Checklist (Before Emitting JSON)

Before outputting the final JSON, **internally** verify:

- [ ] `component_type` is exactly `"converter"`, `"simple_calc"`, or `"advanced_calc"`
- [ ] `config_json.version` looks like `"1.0.0"`
- [ ] `metadata` has only `title` and `description`
- [ ] `logic.type` matches the chosen `component_type`
  - converter → `"conversion"`
  - simple_calc → `"formula"`
  - advanced_calc → `"advanced"`
- [ ] For converters: `fromUnitId` and `toUnitId` are valid IDs
- [ ] For simple_calc: `form.fields` exists and non-empty; `logic.outputs` exists and non-empty
- [ ] For advanced_calc: `logic.methods` non-empty; `defaultMethod` matches one method
- [ ] `page_content` uses only allowed keys, all arrays
- [ ] FAQ objects have exactly `question` and `answer`
- [ ] Citation objects have exactly `label` and `url`
- [ ] All URLs are HTTPS and plain strings
- [ ] No forbidden fields (slug, category, canonical_url, robots, etc.)
- [ ] No HTML, Markdown, or LaTeX in any string
- [ ] JSON passes a linter (e.g., jsonlint)

If **any** check fails, fix it before returning JSON.

---

## 11. Examples (Canonical)

### 11.1. Minimal Converter (Valid)

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
        "Use this tool to convert energy values from kilocalories to kilojoules.",
        "The conversion is based on the thermochemical definition commonly adopted in scientific and engineering practice."
      ],
      "methodology": [
        "The calculator applies the standard conversion factor between kilocalories and kilojoules.",
        "Results are intended for educational and planning purposes and do not replace formally certified measurement instruments."
      ],
      "faqs": [
        {
          "question": "What is the exact conversion between kilocalories and kilojoules?",
          "answer": "One kilocalorie is equal to approximately 4.184 kilojoules under the thermochemical convention."
        }
      ],
      "citations": [
        {
          "label": "NIST SI unit conversions",
          "url": "https://www.nist.gov/pml/special-publication-811"
        }
      ]
    },
    "links": {
      "internal": [
        "/conversions/energy/kilojoules-to-kilocalories-converter"
      ],
      "external": []
    },
    "schema": {
      "additionalTypes": [
        "HowTo"
      ]
    }
  }
}
```

### 11.2. Minimal Simple Calculator (Valid Skeleton)

```json
{
  "component_type": "simple_calc",
  "config_json": {
    "version": "1.0.0",
    "metadata": {
      "title": "EBITDA Calculator",
      "description": "Compute EBITDA and EBITDA margin from net income and standard add-backs."
    },
    "logic": {
      "type": "formula",
      "outputs": [
        {
          "id": "ebitda",
          "label": "EBITDA",
          "expression": "net_income + interest_expense + tax_expense + depreciation + amortization",
          "unit": "currency",
          "format": "currency"
        },
        {
          "id": "ebitda_margin",
          "label": "EBITDA margin",
          "expression": "(net_income + interest_expense + tax_expense + depreciation + amortization) / revenue",
          "unit": "ratio",
          "format": "percent"
        }
      ]
    },
    "form": {
      "fields": [
        {
          "id": "net_income",
          "label": "Net income",
          "type": "number",
          "required": true,
          "default": 0,
          "min": -1000000000000,
          "max": 1000000000000000
        },
        {
          "id": "interest_expense",
          "label": "Interest expense",
          "type": "number",
          "required": false,
          "default": 0,
          "min": 0,
          "max": 1000000000000000
        },
        {
          "id": "tax_expense",
          "label": "Tax expense",
          "type": "number",
          "required": false,
          "default": 0,
          "min": 0,
          "max": 1000000000000000
        },
        {
          "id": "depreciation",
          "label": "Depreciation",
          "type": "number",
          "required": false,
          "default": 0,
          "min": 0,
          "max": 1000000000000000
        },
        {
          "id": "amortization",
          "label": "Amortization",
          "type": "number",
          "required": false,
          "default": 0,
          "min": 0,
          "max": 1000000000000000
        },
        {
          "id": "revenue",
          "label": "Revenue",
          "type": "number",
          "required": true,
          "default": 1,
          "min": 0,
          "max": 1000000000000000
        }
      ],
      "result": {
        "outputs": [
          {
            "id": "ebitda",
            "label": "EBITDA",
            "unit": "currency",
            "format": "currency"
          },
          {
            "id": "ebitda_margin",
            "label": "EBITDA margin",
            "unit": "percent",
            "format": "percent"
          }
        ]
      }
    },
    "page_content": {
      "introduction": [
        "This EBITDA calculator adds back interest, taxes, depreciation, and amortization to net income to provide a consistent proxy for operating performance.",
        "Use it to compare companies or periods where capital structure and tax environments differ."
      ],
      "methodology": [
        "EBITDA is computed as net income plus interest expense, tax expense, depreciation, and amortization.",
        "EBITDA margin is EBITDA divided by revenue over the same period."
      ],
      "faqs": [
        {
          "question": "Is EBITDA the same as cash flow?",
          "answer": "No. EBITDA excludes working capital movements, capital expenditures, and financing costs. It is an operating performance proxy, not a direct measure of cash flow."
        }
      ],
      "citations": [
        {
          "label": "U.S. Securities and Exchange Commission – Guidance on non-GAAP measures",
          "url": "https://www.sec.gov"
        }
      ]
    },
    "links": {
      "internal": [
        "/business/accounting/ebit-calculator"
      ],
      "external": []
    },
    "schema": {
      "additionalTypes": [
        "HowTo",
        "FinancialProduct"
      ]
    }
  }
}
```

---

## 12. Summary Table – What Is Strict vs Flexible

| Aspect                           | Status   | Notes                                                                 |
|----------------------------------|----------|-----------------------------------------------------------------------|
| Top-level wrapper keys           | STRICT   | Must be exactly `component_type` + `config_json`                      |
| `component_type` values          | STRICT   | Only `"converter"`, `"simple_calc"`, `"advanced_calc"`               |
| `logic.type` per component_type  | STRICT   | `"conversion"`, `"formula"`, `"advanced"`                             |
| `metadata` fields                | STRICT   | Only `title`, `description`                                           |
| `page_content` shape             | STRICT   | Flat arrays; only documented keys                                     |
| FAQ & citation object keys       | STRICT   | Exactly `question`+`answer`, `label`+`url`                            |
| URL format                       | STRICT   | HTTPS only, no Markdown/HTML                                         |
| Text formatting                  | STRICT   | Plain text only                                                       |
| Lists length (intro, faqs, etc.) | FLEXIBLE | Reasonable ranges (e.g., 2–7 paragraphs, 3–10 FAQs)                   |
| Units used in explanations       | FLEXIBLE | Any text, as long as logic + IDs comply                               |
| Number of methods / outputs      | FLEXIBLE | One or more, as long as schema is respected                           |

---

**This document is the non-negotiable contract between AI, content editors, and the Cernarus / Quantus runtime.**  
If a configuration or an AI response deviates from this schema, it **must be rejected or corrected** before deployment.