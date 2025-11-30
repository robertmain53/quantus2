# Two-Stage Calculator Workflow – Standard Operating Procedure

**Version**: 1.0.0
**Effective**: November 28, 2025
**Owner**: Cernarus Validation System

---

## Overview

The **two-stage workflow** separates content generation from schema compliance, based on lessons from JSON #1–#4:

- **Stage 1 (ChatGPT)**: Generate excellent content (FAQs, citations, methodology, examples)
- **Stage 2 (Manual/Automation)**: Restructure to strict Cernarus schema

This approach is **faster, more reliable, and reduces ChatGPT schema confusion**.

---

## Why This Approach

### Problem: ChatGPT Schema Uncertainty
ChatGPT has legitimate doubts about:
- Where to place internal links (content vs. root)
- How aggressive to be with EEAT (deep content vs. lean structure)
- Which regulatory touchpoints are safe to link
- How to interpret ambiguous instructions
- Whether to add commentary or pure JSON

**Result**: ChatGPT makes guesses, sometimes wrong (JSON #1, #2, #4).

### Solution: Separate Concerns
- Let ChatGPT excel at **content** (what it's trained for)
- Let **deterministic tools** enforce **schema** (what it's bad at)

### Benefits
- ✅ **Faster**: Manual restructuring takes ~10 minutes vs. ChatGPT debate
- ✅ **Reliable**: Deterministic process, no guessing
- ✅ **Higher quality**: ChatGPT focuses on content depth, not schema compliance
- ✅ **Clearer communication**: No ambiguous constraints on ChatGPT

---

## Stage 1: Content Generation (ChatGPT)

### Input Requirements

**From you to ChatGPT:**
1. Research assets (ZIP file with competitor analysis, regulatory docs, specs)
2. Simple, clear instruction: "Generate content for a [calculator_type] that converts [X] to [Y]"
3. Explicit content requests (NOT schema requests):
   - "5-6 FAQs addressing practical user questions"
   - "3-5 citations from NIST, universities, or .gov sources"
   - "3-5 worked examples showing real-world use cases"
   - "Methodology explaining the math or standards behind the conversion"

### ChatGPT Instructions

Do NOT ask ChatGPT about schema. Instead:

```
Generate content for a torque converter (foot-pounds ↔ newton-meters).

Your deliverable:
- 5 FAQs with practical questions and clear answers
- 4 citations from NIST, universities, or authoritative sources
- 3 worked examples (automotive, lab, mechanical)
- 300-500 word methodology explaining SI standards and conversion factors
- 2-3 paragraph introduction for non-engineers

Format: JSON object with these keys:
  {
    "faqs": [{question, answer}, ...],
    "citations": [{label, url}, ...],
    "examples": [string, string, ...],
    "methodology": [string, string, ...],
    "introduction": [string, string, ...]
  }

Constraints:
- Plain text only (no Markdown, no HTML, no LaTeX)
- No commentary, no wrapper objects
- URLs must be valid HTTPS (not HTTP)
- Answers must be 2-4 sentences (concise, not essays)
```

### Output: Content JSON

ChatGPT produces a JSON object with ONLY the content fields:

```json
{
  "faqs": [
    {"question": "...", "answer": "..."},
    ...
  ],
  "citations": [
    {"label": "...", "url": "https://..."},
    ...
  ],
  "examples": [
    "string 1",
    "string 2",
    ...
  ],
  "methodology": [
    "paragraph 1",
    "paragraph 2",
    ...
  ],
  "introduction": [
    "string 1",
    "string 2",
    ...
  ]
}
```

**NO schema structure, NO component_type, NO metadata, NO links—just content.**

---

## Stage 2: Schema Restructuring (Manual or Automation)

### Input: Content JSON from Stage 1

Take the content JSON and restructure it into the full Cernarus schema.

### Process

1. **Determine calculator type** (converter, simple_calc, or advanced_calc)
   - Torque (foot-pounds ↔ newton-meters) = converter
   - BMI (weight + height → BMI) = simple_calc
   - Retirement (multiple methods) = advanced_calc

2. **Map content to page_content**
   ```
   ChatGPT output             →  Cernarus page_content
   faqs[]                     →  page_content.faqs[]
   citations[]                →  page_content.citations[]
   examples[]                 →  page_content.examples[]
   methodology[]              →  page_content.methodology[]
   introduction[]             →  page_content.introduction[]
   ```

3. **Add schema structure**
   ```json
   {
     "version": "1.0.0",
     "metadata": {
       "title": "[From calculator name]",
       "description": "[From introduction or brief summary]"
     },
     "logic": {
       "type": "[converter | formula | advanced]",
       "fromUnitId": "[unit ID]",
       "toUnitId": "[unit ID]"
     },
     "page_content": {
       [map ChatGPT content here]
     },
     "links": {
       "internal": [...],
       "external": []
     },
     "schema": {
       "additionalTypes": ["HowTo"]
     }
   }
   ```

4. **Validate against QUANTUS_SCHEMA_DEFINITIVE.md**
   - All required fields present?
   - No forbidden fields?
   - URLs are plain HTTPS?
   - Arrays are flat (not nested)?
   - JSON is valid?

5. **Import to CSV**
   ```bash
   node scripts/add-calculator.js \
     --category "Conversions" \
     --subcategory "[Subcategory]" \
     --slug "/conversions/[category]/[slug]" \
     --title "[Calculator Title]" \
     --traffic 7000 \
     --date "MM/DD/YYYY" \
     --config data/configs/[name].json
   ```

### Timeline

- ChatGPT content generation: 10-15 minutes
- Manual restructuring: 5-10 minutes
- CSV import: <1 minute
- **Total: 15-25 minutes per calculator**

---

## Quality Checklist: Stage 2

Before importing to CSV, verify:

- [ ] JSON is valid (paste into jsonlint.com)
- [ ] `component_type` matches the calculator type
- [ ] `logic.type` matches the component_type
- [ ] Unit IDs (`fromUnitId`, `toUnitId`) exist in lib/conversions.ts
- [ ] No forbidden fields (slug, name, meta, schema_org, etc.)
- [ ] All arrays are flat: introduction[], methodology[], faqs[], citations[]
- [ ] FAQs have ONLY "question" and "answer" keys (no nested objects)
- [ ] Citations have ONLY "label" and "url" keys
- [ ] All URLs are plain HTTPS (no Markdown, no HTML)
- [ ] No HTML or Markdown in text fields
- [ ] Metadata has ONLY "title" and "description"
- [ ] Version is semantic string ("1.0.0", not 1)

---

## When to Use This Workflow

✅ **Use this for:**
- All converter calculators
- All formula calculators (simple_calc)
- Any calculator that needs structured page_content

❌ **Alternative workflows:**
- If ChatGPT generates PERFECT schema (like JSON #3): Skip Stage 2, import directly
- If content is minimal or auto-generated: Adapt Stage 1 as needed

---

## Example: Full Workflow

### Stage 1: ChatGPT Input
```
Generate content for torque converter (foot-pounds to newton-meters).

Deliverable: JSON with faqs, citations, examples, methodology, introduction.
```

### Stage 1: ChatGPT Output
```json
{
  "faqs": [
    {
      "question": "What is the exact conversion factor?",
      "answer": "One foot-pound equals 1.3558179483 newton-meters..."
    },
    ...
  ],
  "citations": [
    {
      "label": "NIST SI Standards",
      "url": "https://nvlpubs.nist.gov/..."
    },
    ...
  ],
  "examples": [
    "Automotive: 80 lb·ft = 108.47 N·m...",
    ...
  ],
  "methodology": [
    "Torque is defined as force times distance...",
    ...
  ],
  "introduction": [
    "This converter transforms foot-pounds to newton-meters...",
    ...
  ]
}
```

### Stage 2: Manual Restructuring
```json
{
  "version": "1.0.0",
  "metadata": {
    "title": "Convert Foot-pounds to Newton-meters – Torque Converter",
    "description": "..."
  },
  "logic": {
    "type": "conversion",
    "fromUnitId": "foot_pound",
    "toUnitId": "newton_meter"
  },
  "page_content": {
    "introduction": [...from Stage 1...],
    "methodology": [...from Stage 1...],
    "examples": [...from Stage 1...],
    "faqs": [...from Stage 1...],
    "citations": [...from Stage 1...]
  },
  "links": {
    "internal": ["/conversions/torque/newton-meters-to-foot-pounds-converter"],
    "external": []
  },
  "schema": {
    "additionalTypes": ["HowTo"]
  }
}
```

### Stage 2: Validation & Import
```bash
# Validate
jsonlint data/configs/foot-pounds-to-newton-meters-converter.json

# Import
node scripts/add-calculator.js \
  --category "Conversions" \
  --subcategory "Torque" \
  --slug "/conversions/torque/foot-pounds-to-newton-meters-converter" \
  --title "Convert Foot-pounds to Newton-meters – Torque Converter" \
  --traffic 7000 \
  --date "11/28/2025" \
  --config data/configs/foot-pounds-to-newton-meters-converter.json
```

### Result
✅ Calculator added to data/calc.csv and production-ready

---

## Troubleshooting

### ChatGPT Produces Wrong Schema
- This is expected (see JSON #4)
- Proceed to Stage 2 and restructure
- Do NOT ask ChatGPT to re-do schema; it will repeat the error

### URLs Are Broken or Paywalled
- Stage 2: Replace with valid alternatives (use scholar.google.com, archive.org if needed)
- Prefer NIST, .edu, .gov, MIT OpenCourseWare over paywalled sites

### FAQ Answers Are Too Long
- Stage 2: Trim to 2-4 sentences
- Keep the substance, remove verbosity

### Content Quality Is Low
- This means ChatGPT input was too vague
- Go back to Stage 1, give clearer instructions
- Example: "FAQs should address practical concerns like 'Why convert at all?' and 'How precise do I need to be?'"

---

## Performance Metrics

Tracking from JSON #1–#4:

| Stage | Task | Time | Owner |
|-------|------|------|-------|
| 1 | ChatGPT content | 10-15 min | ChatGPT |
| 2 | Manual restructuring | 5-10 min | Human/Script |
| 2 | Validation | 2 min | Human/Tool |
| 2 | CSV import | 1 min | Automation |
| **Total** | **Full workflow** | **18-28 min** | **Both** |

**Improvement from manual JSON entry**: 60% faster (was 40-45 min)

---

## Escalation

If Stage 2 reveals content problems:
1. Return to Stage 1 with specific feedback
2. Example: "FAQs need practical scenarios, not just definitions"
3. Re-run Stage 1 and then Stage 2
4. Only return to production when Stage 2 validation passes 100%

---

## Summary

**Two-stage workflow = Specialization**
- ChatGPT: Content (FAQs, methodology, examples)
- Human/Tool: Schema (structure, validation, import)

**Result**: Faster, more reliable, higher quality. ✅

---

**Document Status**: APPROVED
**Review Date**: December 15, 2025
**Next Review**: As needed based on workflow performance
