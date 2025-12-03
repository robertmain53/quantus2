# Cernarus Calculator Config Schema – Definitive Specification (Expanded Edition)

**Version**: 1.1.0  
**Last Updated**: December 2025  
**Status**: FROZEN — This is the complete, authoritative, and expanded schema definition.  
No inference. No guessing. No deviations.

---

# 🔥 CRITICAL WARNING

This schema defines **exactly** what every calculator JSON **must** look like for Cernarus/Quantus.

If any field appears that is **not** listed here → ❌ **REJECTED**  
If any required field is **missing** → ❌ **REJECTED**  
If any structure differs → ❌ **REJECTED**  

Validators, build scripts, and UI engines expect **perfect structural compliance**.

---

# 1. Top-Level Structure (MANDATORY)

Every config file MUST look like:

```json
{
  "component_type": "converter|simple_calc|advanced_calc",
  "config_json": {
      /* calculator definition */
  }
}
```

Rules:

- Only **two** top-level keys:  
  - `component_type`  
  - `config_json`
- `component_type` MUST be one of:
  - `"converter"`
  - `"simple_calc"`
  - `"advanced_calc"`
- No HTML, no Markdown, no extra metadata, no arrays outside defined sections.

---

# 2. component_type Decision Rules (EXPANDED)

## 2.1 converter

Choose `"converter"` ONLY IF:

- It converts **one unit to another** with a *fixed* conversion relation.
- Input is **1 value**, output is **1 converted value**.
- No formulas, no scenarios, no conditional logic.
- No multiple outputs.
- No form object (form UI is auto-generated).

Examples:

- meters → feet  
- psi → bar  
- lumens → lux

---

## 2.2 simple_calc

Choose `"simple_calc"` IF:

- It computes **one or more numeric outputs** from **fixed formulas**.
- User must manually input several values.
- There is **one method**.
- There is **no scenario switching**.
- The output expressions must reference inputs from `form.fields[].id`.

Examples:

- mortgage payment  
- EBITDA  
- break-even point  
- car payoff duration

---

## 2.3 advanced_calc

Choose `"advanced_calc"` IF:

- There are **multiple methods**, **scenarios**, or **calculation paths**.
- Methods may have different formulas or different variable chains.
- Users may select the scenario.
- "Variables" represent internal computational dependencies.
- A `defaultMethod` MUST be provided.

Examples:

- retirement planning (linear vs compound vs capped)  
- loan amortization (equal payments vs interest-only)  
- performance scoring with alternative weight systems

---

# 3. config_json Specification (ALL TYPES)

`config_json` contains the actual calculator definition.

Universal required keys:

| Key | Required | Notes |
|-----|----------|-------|
| `version` | yes | MUST be `"1.0.0"` or `"X.Y.Z"` |
| `metadata` | yes | Only `title` and `description` allowed |
| `page_content` | yes | Strict flat arrays only |
| `logic` | yes | Structure depends on component_type |
| `links` | optional | internal/external |
| `schema` | optional | additionalTypes only |

Forbidden keys (GLOBAL):

❌ `slug`  
❌ `category`  
❌ `name`  
❌ `hero`  
❌ `sections`  
❌ `ui`  
❌ `layout`  
❌ `meta`  
❌ `schema_org`  
❌ `canonical_url`  
❌ `robots`  
❌ `keywords`  
❌ `open_graph`  
❌ `twitter_card`  
❌ `js`  
❌ `css`  
❌ `style`  
❌ ANYTHING NOT DEFINED HERE

---

# 4. Detailed Schema by component_type

---

# 4.1 CONVERTER

```json
{
  "component_type": "converter",
  "config_json": {
    "version": "1.0.0",
    "metadata": {
      "title": "string",
      "description": "string"
    },
    "logic": {
      "type": "conversion",
      "fromUnitId": "string",
      "toUnitId": "string"
    },
    "page_content": {
      "introduction": ["string", ...],
      "methodology": ["string", ...],
      "faqs": [{ "question": "...", "answer": "..." }],
      "citations": [{ "label": "...", "url": "https://..." }],
      "examples": ["string", ...],
      "summary": ["string", ...],
      "glossary": ["string", ...]
    },
    "links": {
      "internal": ["/path", ...],
      "external": [
        { "label": "...", "url": "https://...", "rel": ["external"] }
      ]
    },
    "schema": {
      "additionalTypes": ["HowTo"]
    }
  }
}
```

### Converter Hard Rules

- No `form` object allowed.
- No formulas allowed.
- No variables.
- No `precision` field.
- Units must exist in `lib/conversions.ts`.

---

# 4.2 SIMPLE_CALC

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
          "expression": "math using form.fields[].id",
          "unit": "optional",
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
          "default": 0,
          "min": 0,
          "max": 999999999
        }
      ],
      "result": {
        "outputs": [
          { "id": "output_id", "label": "string" }
        ]
      }
    },
    "page_content": { ... },
    "links": { ... },
    "schema": { ... }
  }
}
```

### Simple Calc Hard Rules

- `form.fields` is **mandatory**.
- Output expressions MUST reference input field IDs.
- `form.result.outputs[*].id` AND `.label` are **required**.
- No nested structures beyond defined ones.

---

# 4.3 ADVANCED_CALC (EXPANDED)

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
          "description": "optional",
          "variables": {
            "varname": {
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
              "variable": "varname",
              "unit": "optional",
              "format": "currency|percent|decimal|integer"
            }
          ]
        }
      }
    },
    "form": {
      "fields": [...],
      "sections": [
        {
          "title": "string",
          "fields": ["id1", "id2"],
          "show_when": {
            "field": "field_id",
            "eq": "value"
          }
        }
      ]
    },
    "page_content": { ... },
    "links": { ... },
    "schema": { ... }
  }
}
```

### Advanced Calc Hard Rules

- At least **one method** required.
- `defaultMethod` MUST refer to an existing method key.
- Variables MUST NOT circularly reference.

---

# 5. page_content Specification (FULL)

Allowed keys:

- `introduction`: array of strings  
- `methodology`: array of strings  
- `faqs`: array of `{ question, answer }`  
- `citations`: array of `{ label, url }`  
- `examples`: array of strings  
- `summary`: array of strings  
- `glossary`: array of strings  

Strict rules:

- No HTML  
- No Markdown  
- No inline bold/italics  
- No links except plain HTTPS URLs inside `citations.url` or `links.external.url`

FAQ rules:

```json
{ "question": "string", "answer": "string" }
```

NO other keys allowed.

Citations rules:

```json
{ "label": "string", "url": "https://..." }
```

- Only HTTPS  
- No tracking parameters unless essential  
- No Markdown  
- No `<a>` tags  

---

# 6. links Object (Expanded)

```json
"links": {
  "internal": ["/path1", "/path2"],
  "external": [
    {
      "label": "string",
      "url": "https://...",
      "rel": ["external"]
    }
  ]
}
```

Rules:

- internal must be slugs, NOT full URLs
- external must include `"rel": ["external"]`

---

# 7. schema Object (Expanded)

```json
"schema": {
  "additionalTypes": ["HowTo", "FAQPage", "FinancialProduct"]
}
```

Allowed values:

- HowTo  
- FAQPage  
- FinancialProduct  
- EducationalOccupationalProgram  
- WebApplication  

---

# 8. Text Content Rules (GLOBAL)

These apply to:
- introduction
- methodology
- FAQs
- citations.label
- metadata.title
- metadata.description

❌ HTML forbidden  
❌ Markdown forbidden  
❌ LaTeX forbidden  
❌ No lists, no bullets within strings  
✔ plain text only  
✔ Unicode OK  

---

# 9. Unit Validation (Converters Only)

Units must exist in `lib/conversions.ts`.

Supported categories:

- length  
- mass  
- temperature  
- torque  
- illuminance  
- energy  
- data  

Missing units → ❌ REJECTED.

---

# 10. JSON Structure Validation

Your JSON must:

✔ be valid JSON  
✔ contain no trailing commas  
✔ have matched quotes/braces  
✔ avoid null unless explicitly allowed  

---

# 11. Compliance Checklist (EXPANDED)

Before ANY JSON is submitted:

- [ ] Top-level structure correct  
- [ ] `component_type` valid  
- [ ] `config_json.version` semantic  
- [ ] Only allowed metadata fields  
- [ ] Only allowed page_content fields  
- [ ] All arrays contain plain strings  
- [ ] FAQs contain only `question` + `answer`  
- [ ] Citations contain only `label` + `url`  
- [ ] All URLs HTTPS  
- [ ] No HTML/Markdown anywhere  
- [ ] No forbidden fields  
- [ ] For converters: units valid  
- [ ] For simple_calc: form.fields exists  
- [ ] For advanced_calc: methods valid  
- [ ] JSON parses with no errors  

---

# END OF DOCUMENT  
**Status: FROZEN — DO NOT MODIFY WITHOUT VERSION BUMP**
