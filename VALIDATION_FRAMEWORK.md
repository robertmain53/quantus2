# JSON Validation & Process Optimization Framework

## Two-Role Workflow

When you provide ChatGPT-generated JSON:

### Role 1: Tool Maker (Immediate)
- ✅ Validate JSON syntax
- ✅ Check schema compliance against SCHEMA_STRICT_RULES.md
- ✅ Fix any issues (URL escaping, field structure, etc.)
- ✅ Auto-run `scripts/add-calculator.js` to add to CSV
- ✅ Confirm success/failure with clear status

### Role 2: Process Engineer (Analysis)
- 📊 Analyze ChatGPT output patterns
- 🔍 Identify common errors and root causes
- 💡 Recommend specific prompt improvements
- 📈 Track metrics (compliance rate, error types, citation quality)
- 🎯 Propose concrete changes to embedded schema rules

---

## Validation Checklist (Tool Maker)

### JSON Structure
- [ ] Valid JSON syntax (no trailing commas, proper quotes)
- [ ] Has `component_type` at top level
- [ ] Has `config_json` object with all required fields

### Schema Compliance
- [ ] `version` is semantic (e.g., "1.0.0")
- [ ] `metadata.title` and `metadata.description` present, no HTML
- [ ] `logic.type` matches component_type (e.g., "conversion" for converter)
- [ ] `logic.fromUnitId` and `logic.toUnitId` exist in lib/conversions.ts
- [ ] `page_content.introduction` is array of strings (not object)
- [ ] `page_content.methodology` is array of strings
- [ ] `page_content.faqs` is array of objects with `question`/`answer` only
- [ ] `page_content.citations` is array of objects with `label`/`url` only
- [ ] No HTML/Markdown in text fields
- [ ] No forbidden fields (description, precision, factor, etc.)

### Content Quality
- [ ] Citations are authoritative (NIST, universities, .gov domains)
- [ ] FAQs address real user questions
- [ ] Examples are practical and relatable
- [ ] Copy is clear, no jargon without explanation
- [ ] Conversions/formulas are mathematically correct

### URL Handling
- [ ] No Markdown link syntax `[text](url)` in citations
- [ ] URLs are plain strings
- [ ] URLs are valid and reachable

---

## Process Engineer Analysis Template

When analyzing patterns, assess:

### Error Patterns
1. **Syntax Errors**: JSON parsing, trailing commas, quote escaping
2. **Schema Violations**: Missing fields, wrong structure, forbidden fields
3. **Content Issues**: Weak citations, vague FAQs, incorrect formulas
4. **URL Problems**: Markdown syntax, invalid domains, broken links

### Quality Metrics
- **Compliance Rate**: % of JSON that's valid without fixes
- **Citation Quality**: % citing NIST/universities/.gov
- **FAQ Quality**: Average helpfulness (1-5 scale)
- **Formula Accuracy**: % of conversions/calculations correct

### Prompt Improvement Opportunities

Check if ChatGPT struggles with:
- [ ] Citations (suggest adding "Cite only NIST, universities, .gov")
- [ ] URL formatting (suggest "URLs must be plain strings, NOT Markdown")
- [ ] Field structure (suggest adding example output)
- [ ] Formula accuracy (suggest adding validation steps)
- [ ] FAQ relevance (suggest specific question types)

---

## Output Format

For each JSON you send, I'll provide:

### ✅ VALIDATION REPORT
```
Status: [PASS / PASS WITH FIXES / FAIL]
- Schema compliance: [X/10 checks passed]
- Issues found: [List]
- Fixes applied: [List]
- CSV import: [SUCCESS / FAILED]
```

### 📊 PROCESS ANALYSIS
```
Error Patterns Observed:
  - [Pattern 1 with count/percentage]
  - [Pattern 2 with count/percentage]

Quality Assessment:
  - Citation authority: [Rating + example]
  - FAQ quality: [Rating + example]
  - Formula accuracy: [Rating + issues]

Prompt Improvements Recommended:
  1. [Specific change to embedded schema rules]
  2. [Specific change to ChatGPT instructions]
  3. [Specific change to examples]
```

### 🎯 NEXT STEPS
```
Immediate:
  - [Fix applied or waiting for user]

For Next JSONs:
  - [Prompt improvement to reduce this error type]
  - [New validation step to catch earlier]
```

---

## Tracking Over Time

As you provide multiple JSONs, I'll maintain:
- **Compliance trend** (% of JSONs passing validation)
- **Error distribution** (which types occur most)
- **Prompt effectiveness** (does each improvement help?)
- **Cycle time** (time from ChatGPT to production)

---

## Ready to Start

**Send JSON, and I'll provide:**
1. Immediate validation + fixes + CSV import
2. Detailed analysis of what ChatGPT did well/poorly
3. Specific recommendations to improve the prompt for next time

Let's make production smoother! 🚀
