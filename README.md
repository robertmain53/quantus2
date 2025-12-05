# Cernarus Enterprise Content Platform

Cernarus is a Next.js 14 application engineered to publish thousands of SEO-focused calculators and conversion tools from a single source-of-truth catalogue. The platform emphasizes static-first delivery, structured data, and an editorial workflow that can scale to 120K daily sessions.

## Requirements

- Node.js 18.18+ (Next.js 14 baseline)
- npm 9+ or pnpm/yarn equivalents
- Access to install dependencies (`npm install`)
- Optional: Playwright or Cypress for E2E (not bundled)

## Quick start

```bash
npm install
npm run dev
```

| Command         | Purpose                                 |
| --------------- | --------------------------------------- |
| `npm run dev`   | Start local development server          |
| `npm run build` | Create production build (SSG/ISR ready) |
| `npm run start` | Serve production build                  |
| `npm run lint`  | Run Next.js ESLint rules                |
| `npm run test`  | Execute Vitest suite for data layer     |

> **Note:** Tests and linting require dependencies to be installed. Network access may be needed when running `npm install` within a sandboxed environment.

## Content operations

- Source data lives in `data/calc.csv`. Each row is the single source of truth for taxonomy, publishing cadence, calculator configuration, and on-page copy.
- The data layer (`lib/content.ts`) loads the CSV, memoizes it, and exposes helpers that drive static params, navigation, search, sitemaps, metadata, and calculator rendering.
- Editing the CSV is all that’s required to launch, update, or unpublish a calculator. During `next build`, unpublished rows (publish date in the future) are skipped automatically.
- Use the `traffic_estimate` column to prioritize categories surfaced on the homepage and navigation.

### CSV schema (AI-first)

| Column             | Purpose                                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `category`         | Human-readable cluster name (e.g. `Finance`). Used for taxonomy grouping and navigation copy.                                                                                                    |
| `subcategory`      | Optional sub-cluster label (e.g. `Loans`). Empty cells keep calculators directly under the category.                                                                                             |
| `slug`             | Absolute path (e.g. `/finance/loans/personal-loan-payment-calculator`). Uniqueness is enforced in the loader.                                                                                    |
| `title`            | Page H1 and default metadata title. AI copy should be final-ready.                                                                                                                               |
| `traffic_estimate` | Daily sessions forecast. Drives prioritisation and projected totals.                                                                                                                             |
| `New_Publish_Date` | ISO-friendly date. Items with a future date stay hidden until the next rebuild after that date.                                                                                                  |
| `component_type`   | Enum describing which generic engine should render the calculator. Supported values: `converter`, `simple_calc`, `advanced_calc`.                                                                |
| `config_json`      | JSON blob containing the full calculator contract: inputs, outputs, validation rules, structured page copy, schema hints, internal/external link plans, and presentation settings (no raw HTML). |
| `creation_date`    | ISO date when the initial calculator JSON was first committed to git and deployed to production. Set during Phase 1 Step 2.                                                                      |
| `revision1_date`   | ISO date when the first revision cycle (Phase 2) was completed and deployed. Set during Phase 2 Step 9. Optional until revision is complete.                                                     |
| `revision2_date`   | ISO date when the second revision cycle (Phase 3) was completed and deployed. Optional for subsequent revisions.                                                                                 |

> **Tip:** Keep JSON payloads in valid UTF-8 and escape double quotes if editing the CSV manually. For bulk edits, prefer tooling (Airtable export, Google Sheets + script) that can manage multi-line cells safely.

### Generic calculator engines

We ship a small stable of reusable React components. Each reads `component_type` and `config_json` to decide how to render the interactive experience:

- `GenericConverter.tsx` – unit-to-unit conversions with reversible inputs, precision rules, and optional derived outputs.
- `GenericSimpleCalculator.tsx` – single-formula calculators (e.g. CAGR, markup) with lightweight validation.
- `GenericAdvancedCalculator.tsx` – multi-step or multi-output flows (e.g. amortization) with repeatable groups, tables, and scenario analysis.

Adding a new calculator never requires building another bespoke React component. Instead, evolve the engine APIs if a new pattern emerges, then reuse it everywhere via configuration. Each engine owns the presentation layer—`page_content` strings are rendered with consistent typography, headings, and components, so the AI focuses purely on copy and logic.

### Adding calculators

1. Paste a new row in `data/calc.csv` (or the upstream datasource) with category, slug, publish date, and the AI-generated `component_type` plus unified `config_json`.
2. Run `npm run build`. Next.js pre-renders the page, schema, and navigation updates using the generic component matched to `component_type` and hydrated by the config.
3. Commit the CSV change. The deployment pipeline handles static regeneration once the publish date is met.

### Category taxonomy

- Top categories are derived from the CSV. No manual configuration is required.
- Category and subcategory pages are statically rendered from the data layer and include internal linking plus traffic forecasts.

## AI-first production workflow

### Original Bluprint

This model removes bespoke React development from the daily cadence. Humans concentrate on research, validation, and governance; AI generates production-ready configuration and content.

1. **Research (human)**

   - Assemble a corpus of 20–30 competitor calculators plus primary sources.
   - Store assets in a shared drive; provenance is mandatory for compliance and post-hoc audits.

2. **Synthesis & generation (AI)**

   - Feed the corpus into your AI workspace with a prompt that requests:

     - Final `component_type` selection.
     - A unified `config_json` matching the engine contract, including inputs, units, computed outputs, validation, display rules, structured page copy (plain text/Markdown snippets), link plans, and schema metadata. A representative structure might look like:
       ```json
       {
         "version": "1.0.0",
         "metadata": {
           "title": "Personal Loan Payment Calculator",
           "description": "Model monthly repayments, total interest, and payoff timelines."
         },
         "form": {
           "fields": [
             {
               "id": "principal",
               "label": "Loan amount",
               "type": "currency",
               "min": 1000,
               "max": 500000
             },
             {
               "id": "apr",
               "label": "APR",
               "type": "percent",
               "min": 0.1,
               "max": 60
             },
             {
               "id": "term_months",
               "label": "Term",
               "type": "integer",
               "min": 6,
               "max": 360
             }
           ],
           "result": {
             "outputs": [
               {
                 "id": "monthlyPayment",
                 "label": "Monthly payment",
                 "unit": "usd"
               },
               {
                 "id": "totalInterest",
                 "label": "Total interest",
                 "unit": "usd"
               }
             ]
           }
         },
         "logic": {
           "type": "amortization",
           "formula": "PMT"
         },
         "page_content": {
           "introduction": [
             "Use this calculator to understand the cost of any personal loan.",
             "Adjust the sliders to see the impact of APR and term on cash flow."
           ],
           "methodology": [
             "We compute payments using the standard amortization (PMT) formula that assumes fixed APR across the life of the loan."
           ],
           "faqs": [
             {
               "question": "How do I lower my monthly payment?",
               "answer": "Lower the APR, extend the term, or reduce the principal. Each lever has trade-offs covered below."
             }
           ],
           "citations": [
             {
               "label": "Consumer Finance Protection Bureau",
               "url": "https://www.consumerfinance.gov"
             }
           ]
         },
         "schema": {
           "additionalTypes": ["HowTo"]
         },
         "links": {
           "internal": ["/finance/loans/auto-loan-payment-calculator"],
           "external": [
             {
               "url": "https://www.fdic.gov/resources/consumers/consumer-news/2023-12.pdf",
               "rel": ["noopener", "noreferrer"]
             }
           ]
         }
       }
       ```
     - Any specialised JSON-LD requirements (e.g. `HowTo`, `Dataset`) should be embedded inside `config_json` so engines can emit schema automatically.

     IMPORTANT: Never output raw '<' or '>' characters inside JSON values. Replace all '<' with '\u003C' and all '>' with '\u003E'. This prevents HTML interpretation, JSX parsing, and CSV corruption.

3. **Review (human)**

   - Senior engineer validates the JSON: formulas, units, rounding, and accessibility properties.
   - Editor reviews the generated copy for EEAT, tone, compliance, and citation accuracy.
   - Both sign off by updating the row status in the source spreadsheet (optional but recommended).

4. **Data entry (human)**

   - Paste the approved `config_json` into the CSV (or upstream database). Avoid manual tweaks elsewhere; the runtime should stay deterministic.

5. **Publication**
   - Trigger `npm run build` locally or rely on CI. Once the publish date arrives, the calculator goes live with no additional engineering effort.
   - Scheduled refreshes or corrections are handled by updating the CSV and re-running the pipeline.

> **Quality gates:** Maintain automated validation inside `lib/content.ts` to reject malformed JSON, missing enum values, or unsupported content patterns before build time.

### AI prompt template

**How to use**

- Gather your research corpus (competitor pages, regulations, spreadsheets, notes) in a single folder. Compress it into a `.zip` when sending to a chat model, or keep it beside the repo when using a VS Code AI assistant that can read local files.
- Prepare a short "context packet" to paste alongside the prompt:
  - Target calculator slug and objective (e.g., `/finance/loans/personal-loan-payment-calculator`).
  - List of existing Cernarus internal links relevant to the topic (category hubs, related calculators).
  - Any guardrails (tone, compliance notes, traffic goal, localisation).
- When using ChatGPT/Gemini/Claude: upload the zip first, then paste the prompt+context.
- When using VS Code AI: ensure the assistant has access to the research folder (or paste representative excerpts) before running the prompt.

Replace the bracketed placeholders in the template below before sending it to the model. When you paste the AI response into `/admin/playground`, you may either paste the entire wrapper (with `component_type` + `config_json`) or only the inner `config_json`.

````text
You are an elite product strategist, quant engineer, and technical copywriter tasked with building the market-leading version of “[CALCULATOR NAME]”. Study every asset provided (competitor calculators, regulatory PDFs, spreadsheets, notes). Your deliverable must be production-ready and strictly follow the Cernarus config schema.

### CORE OBJECTIVES
1.  **Deployable JSON:** Produce a single, valid JSON object (`component_type` + `config_json`). No markdown, no commentary.
2.  **User-Centricity:** Trade internal jargon for user intent. Focus on practical reassurance (calibration, limits, regulatory compliance).
3.  **High-Trust EEAT:** You must cite specific standards (NIST, ISO, IEEE, OSHA) and include accuracy caveats. Do not mention competitors or filenames.
4.  **Schema Compliance:** Adhere strictly to the data types defined below (e.g., Glossary must be objects, not strings).

### JSON REQUIREMENTS
**Top-level shape:**
```json
{
  "component_type": "converter | simple_calc | advanced_calc",
  "config_json": { ... }
}
```

**`config_json` Structure:**

1.  **`version`**: Semantic string (bump major.minor if schema capabilities change).
2.  **`metadata`**:
    * `title`: Persuasive, SEO-optimized title (No HTML).
    * `description`: 150-160 chars max. Differentiates us from generic tools.
3.  **`logic`**:
    * **IF `converter`**: Set `type: "conversion"`. Provide `fromUnitId` and `toUnitId` matching `lib/conversions.ts`. No custom arrays or factors.
    * **IF `simple_calc`**: Set `type: "formula"`. `outputs` array must contain `{ id, label, expression, unit (opt), format (opt) }`. No `expressions` or `precision` keys.
    * **IF `advanced_calc`**: Set `type: "advanced"`. Define `methods` object.
        * `variables`: Map of `{ "var_name": { "expression", "dependencies", "label", "unit", "format", "display": bool } }`. Use helper functions: `pow`, `min`, `max`, `abs`, `sqrt`, `log`, `exp`.
        * `outputs`: Array of `{ "id", "label", "variable", "unit", "format" }`.
        * `defaultMethod`: String ID of the primary method.
4.  **`form`**:
    * **Converters**: Set to `null`.
    * **Simple Calc**: Flat `fields` array. Use `form.result.outputs` for result cards.
    * **Advanced Calc**: Combine `fields` (global) and `sections` (grouped). Use `show_when` for conditional logic.
    * **Validation**: All numeric fields must have sensible `min`, `max`, `step`, and `default`.
5.  **`page_content`** (Plain text arrays, NO HTML):
    * `introduction`: 2 short paragraphs max. Clear user value proposition.
    * `methodology`: **Mandatory.**
        * Must reference the governing standard (e.g., "Calculations align with ISO 80000-1").
        * **Precision Note:** explicitly state if the conversion factor is **exact** (defined by treaty/standard) or **derived**. (e.g., "1 inch is exactly 25.4mm per international agreement. Output rounded to 4 significant figures").
    * `how_is_calculated`: Concise step-by-step or formula for Pro view.
    * `examples`: **Strict Format:** "Input [X] results in Output [Y]." Max 1 sentence per example. No narrative, no storytelling.
    * `faqs`: 3-5 high-value Q&As (focus on edge cases, safety, and regulatory alignment).
    * `citations`: Array of objects: `{ "label": "Source Name", "url": "...", "summary": "..." }`. Prioritize .gov and .edu.
    * `summary`: Bullet points capturing key insights from attached assets.
    * `glossary`: **Strict Schema:** Array of objects `{ "term": "...", "definition": "..." }`. Do NOT use strings.
6.  **`links`**:
    * `internal`: List existing Cernarus slugs (e.g., `/finance/loans/roi`).
    * `external`: Objects with `{ "url": "...", "label": "...", "rel": ["noopener", "noreferrer"] }`.
7.  **`schema.additionalTypes`**: Structured data hints (e.g., `HowTo`, `Dataset`) if applicable.

### ANALYTICAL & STYLE GUIDELINES
* **Unit Precision:** Explicitly distinguish between Binary (GiB) and Decimal (GB) prefixes for data tools. Cite JEDEC vs IEC standards where applicable.
* **Tone:** Authoritative yet accessible. Use active voice. Avoid fluff.
* **Math:** Ensure all expressions use variables defined in `form.fields[].id`.
* **Safety:** For health/finance, include specific caveats (e.g., "Not a substitute for professional medical advice").

### OUTPUT
Return **ONLY** the raw JSON object. Do not wrap in markdown code blocks. Do not add conversational text.
```


### Explanation by Claude

A configuration-driven, AI-first platform designed to publish thousands of SEO-focused calculators without bespoke React development. Here's the operational breakdown:

Core Mechanism

Single Source of Truth: data/calc.csv contains all metadata and configuration for every calculator. Each row drives publication, taxonomy, rendering logic, and content. Three Generic Engines: Instead of building custom React components per calculator:
- GenericConverter – unit conversions (e.g., kg to lbs)
- GenericSimpleCalculator – single-formula tools (e.g., CAGR)
- GenericAdvancedCalculator – multi-step flows (e.g., loan amortization)

The component_type field routes to the right engine; config_json contains the full calculator blueprint (inputs, outputs, validation, copy, links, schema).

## Operational Workflow (New Process)

### Overview

The new workflow introduces a **multi-phase review cycle** with deep auditing and iterative improvement. Each calculator undergoes initial production deployment, then structured review, refinement, and revision cycles. Subsequent revisions follow the same Phase 2 pattern.

```

Phase 1: Initial Production
Step 1: ChatGPT Generation [AI, 5 min] → Use provided prompt + assets → Get JSON
↓
Step 2: Claude Code Commit [Human, 2 min] → Commit JSON to git and push to main
↓
Step 3: Vercel Deploy [Automated] → Deploy to staging/production
↓
Step 4: CSV Entry [Human, 1 min] → Add row to calc.csv with creation_date
↓
Phase 2: First Revision
Step 5: Gemini Deep Audit [AI, 10 min] → Download MHTML files, perform deep research + criticism
↓
Step 6: ChatGPT Improvement [AI, 10 min] → Process Gemini report, enhance JSON with revisions
↓
Step 7: Claude Code Update [Human, 2 min] → Update original calculator JSON with revisions
↓
Step 8: Vercel Re-Deploy [Automated] → Deploy updated calculator
↓
Step 9: CSV Revision Date [Human, 1 min] → Update calc.csv revision1_date column
↓
Phase 3: Subsequent Revisions (repeat Phase 2 pattern as needed)
Step 10: Audit & Improve [AI, ~20 min] → Additional review cycles
↓
Step 11: CSV Update [Human, 1 min] → Update calc.csv revision2_date (or later columns)

````

---

### Phase 1: Initial Production Workflow

#### Step 1: ChatGPT Generation (AI, ~5 min)

Using the prompt template from this README:

1. Gather research assets (competitor pages, PDFs, spreadsheets)
2. Copy the full **AI prompt template** from the "AI prompt template" section below
3. Open ChatGPT/Claude/Gemini and attach your research assets
4. Paste the prompt and run it
5. ChatGPT returns production-ready JSON with `component_type` and `config_json`

**Output:** A complete, deployable JSON object ready for commit.

---

#### Step 2: Claude Code Commit (Human, ~2 min)

1. Copy the returned `config_json` object (not the wrapper) and save to `data/configs/[calculator-slug]-converter.json`
2. Commit the file to git:
   ```bash
   git add data/configs/[calculator-slug]-converter.json
   git commit -m "JSON #N: [Calculator Name] – Production Upload"
   git push origin main
   ```

````

3. **production_date** is automatically recorded as today's date when this commit lands.

**Output:** Calculator JSON is now in git and deploying to production.

---

#### Step 3: Vercel Deploy (Automated)

Once pushed to main, Vercel automatically triggers a build and deployment. The calculator is now live.

---

#### Step 4: CSV Entry (Human, ~1 min)

After the calculator deploys successfully, add a row to `data/calc.csv`:

```bash
node scripts/add-calculator.js \
  --category "Conversions" \
  --subcategory "Pressure" \
  --slug "/conversions/pressure/pascals-to-atmospheres-converter" \
  --title "Convert Pascals to Atmospheres – Pressure Converter" \
  --traffic 5000 \
  --date "11/29/2025" \
  --config data/configs/pascals-to-atmospheres-converter.json
```

**Ensure the CSV row includes:**

- `creation_date`: Set to the date you committed the JSON (e.g., `11/29/2025`)
- `revision1_date`: Leave empty for now (will be updated in Phase 2)
- `revision2_date`: Leave empty for now (will be updated in Phase 3 if applicable)

**Output:** Calculator is now indexed in the system and searchable.

---

### Phase 2: Review & Revision Workflow

#### Step 5: Gemini Deep Audit (AI, ~10 min)

After the calculator has been deployed for at least 24 hours:

1. Download all MHTML files from the deployed Vercel calculator
2. Open Gemini AI and attach all MHTML files
3. Request a **deep research audit** covering:
   - Accuracy of conversion factors
   - Completeness of FAQs and examples
   - Authority of citations
   - Gaps in methodology or edge cases
   - Accessibility and UX clarity
   - Cross-tool consistency
4. Gemini provides a detailed criticism report with improvement suggestions

**Output:** Structured audit report identifying weaknesses and improvement opportunities.

---

#### Step 6: ChatGPT Improvement (AI, ~10 min)

1. Copy the Gemini audit report
2. Open ChatGPT and paste the report along with the original JSON
3. Request: "Using this audit, enhance and revise the calculator JSON to address all critiques"
4. ChatGPT returns an improved `config_json` with enhancements

**Output:** Refined JSON ready for deployment.

---

#### Step 7: Claude Code Update (Human, ~2 min)

1. Replace the original JSON file with the revised version:
   ```bash
   # Update the JSON file with the new content
   git add data/configs/[calculator-slug]-converter.json
   git commit -m "JSON #N Revision 1: [Calculator Name] – Gemini Audit Review & Improvements"
   git push origin main
   ```

**Output:** Revised calculator is deploying to production.

#### Phase 3+ Subsequent Revisions

If additional improvements are needed after Phase 2:

1. Repeat Steps 5–9 using the same pattern
2. Update the commit message to reference the revision number (e.g., `Revision 2`)
3. Update the appropriate revision column in calc.csv (`revision2_date`, `revision3_date`, etc.)
4. The same validation and deployment process applies

---

#### Step 8: Vercel Re-Deploy (Automated)

Vercel automatically deploys the updated calculator.

---

#### Step 9: CSV Revision Date (Human, ~1 min)

Update the CSV row to record the revision completion:

```bash
# Edit data/calc.csv and set revision1_date for this calculator
# Example: revision1_date = "11/30/2025"
git add data/calc.csv
git commit -m "Update calc.csv: Add revision1_date for [Calculator Name]"
git push origin main
```

**Output:** Revision is now tracked in the system metadata.

---

### Step 1 (Legacy): Research (Human, ~5 min)

Assemble competitor data and primary sources:

1. Identify 20–30 competitor calculator pages
2. Capture as HTML/PDF/screenshots
3. Save to `scripts/generate-zip/keywords.txt`:

   ```
   google.com|Convert Lumens to Lux|lumens-to-lux-converter.zip
   google.com|Convert Fahrenheit to Celsius|fahrenheit-to-celsius-converter.zip
   ```

4. (Optional) Run SERP harvester to auto-collect research:
   ```bash
   SERPER_API_KEY=sk_... node scripts/generate-zip/index.js
   ```
   → Outputs ZIP files to `input/` folder

---

### Step 2: Generate Prompt + AI Synthesis (AI, ~5 min)

**Generate the prompt template:**

```bash
npm run prepare-prompts
```

This creates `generated/prompts/conversions_*_your-converter.json` with:

- Strict schema enforcement rules (prevents bad JSON)
- Calculator-specific context (slug, title, internal links)
- Research assets reference (point to ZIP in `input/`)

**In ChatGPT/Claude/Gemini:**

1. Open the relevant prompt file from `generated/prompts/`
2. Copy the entire `"prompt"` field
3. Attach ZIP file(s) from `input/` folder
4. ChatGPT returns production-ready JSON with `component_type` and `config_json`

> **Schema Enforcement:** Embedded rules ensure ~95% JSON compliance.

---

### Step 3: Review (Human, ~1 min)

Validate the ChatGPT JSON:

**Review checklist:**

- ✅ Citations point to authoritative sources (NIST, universities, .gov)
- ✅ FAQs are practical and address user intent
- ✅ No HTML/Markdown in text fields
- ✅ Formula/conversion logic is correct
- ✅ All unit IDs exist in `lib/conversions.ts`

---

### Step 4: Import to CSV (Script, ~1 min)

**Extract the `config_json` object** (NOT the wrapper) and run the import script:

```bash
node scripts/add-calculator.js \
  --category "Conversions" \
  --subcategory "Illuminance" \
  --slug "/conversions/illuminance/lumens-to-lux-converter" \
  --title "Convert Lumens to Lux – Light Converter" \
  --traffic 10000 \
  --date "11/28/2025" \
  --config data/configs/lumens-to-lux-converter.json
```

**The script automatically:**

- ✅ Loads your JSON config
- ✅ Escapes quotes, commas, newlines for CSV
- ✅ Validates JSON before appending
- ✅ Appends row to `data/calc.csv`

For detailed documentation: `node scripts/add-calculator.js --help` or see [scripts/ADD_CALCULATOR_README.md](scripts/ADD_CALCULATOR_README.md)

---

### Step 5: Publish (Automated)

**Build and deploy:**

```bash
npm run build && npm start
```

**What happens:**

1. Next.js reads `data/calc.csv`
2. For each row, selects the matching generic engine
3. Pre-renders all calculator pages with structured data
4. Generates sitemap, schema, navigation automatically

No additional engineering required—the calculator is live.

---

### Complete Workflow Example (New Process)

#### Phase 1: Initial Production (~10 min total)

```bash
# PHASE 1, STEP 1: CHATGPT GENERATION (Manual, ~5 min)
# 1. Gather research assets (competitor pages, PDFs, spreadsheets)
# 2. Copy the AI prompt template from this README
# 3. Open ChatGPT/Claude/Gemini, attach assets, paste prompt
# 4. Get back: { "component_type": "converter", "config_json": { ... } }

# PHASE 1, STEP 2: COMMIT TO GIT (Manual, ~2 min)
cp /path/to/chatgpt-output.json data/configs/pascals-to-atmospheres-converter.json
git add data/configs/pascals-to-atmospheres-converter.json
git commit -m "JSON #26: Pascals to Atmospheres – Production Upload"
git push origin main

# PHASE 1, STEP 3: VERCEL DEPLOYS AUTOMATICALLY
# (Wait for Vercel build to complete)

# PHASE 1, STEP 4: ADD TO CSV (Manual, ~1 min)
node scripts/add-calculator.js \
  --category "Conversions" \
  --subcategory "Pressure" \
  --slug "/conversions/pressure/pascals-to-atmospheres-converter" \
  --title "Convert Pascals to Atmospheres – Pressure Converter" \
  --traffic 5000 \
  --date "11/29/2025" \
  --config data/configs/pascals-to-atmospheres-converter.json
git add data/calc.csv
git commit -m "Add pascals-to-atmospheres-converter to CSV with creation_date"
git push origin main
```

**CSV Row Structure (Phase 1):**

- `creation_date`: 11/29/2025 (set to commit date)
- `revision1_date`: (empty, set in Phase 2)
- `revision2_date`: (empty, set in Phase 3 if needed)

---

#### Phase 2: First Revision (~25 min total, spread over 1–2 days)

```bash
# PHASE 2, STEP 5: GEMINI DEEP AUDIT (Manual, ~10 min)
# 1. Download MHTML files from deployed calculator
# 2. Open Gemini AI, attach MHTML files
# 3. Request: "Perform deep research audit and criticism of this calculator"
# 4. Save the detailed audit report

# PHASE 2, STEP 6: CHATGPT IMPROVEMENT (Manual, ~10 min)
# 1. Copy Gemini audit report
# 2. Open ChatGPT, provide original JSON + audit report
# 3. Request: "Using this audit, enhance and revise the calculator"
# 4. Get back improved: { "config_json": { ... } }

# PHASE 2, STEP 7: UPDATE GIT WITH REVISIONS (Manual, ~2 min)
cp /path/to/improved-output.json data/configs/pascals-to-atmospheres-converter.json
git add data/configs/pascals-to-atmospheres-converter.json
git commit -m "JSON #26 Revision 1: Pascals to Atmospheres – Gemini Audit Review & Improvements"
git push origin main

# PHASE 2, STEP 8: VERCEL RE-DEPLOYS AUTOMATICALLY
# (Wait for Vercel build to complete)

# PHASE 2, STEP 9: UPDATE CSV REVISION DATE (Manual, ~1 min)
# Edit data/calc.csv, set revision1_date = "11/30/2025" for this calculator
git add data/calc.csv
git commit -m "Update calc.csv: Add revision1_date for Pascals to Atmospheres"
git push origin main
```

**CSV Row Structure (Phase 2):**

- `creation_date`: 11/29/2025 (unchanged from Phase 1)
- `revision1_date`: 11/30/2025 (set to revision completion date)
- `revision2_date`: (empty, set in Phase 3 if needed)

---

#### Phase 3+: Subsequent Revisions (Repeat Phase 2 pattern)

```bash
# PHASE 3, STEP 5–9: (Same pattern as Phase 2)
# Perform audit, improvement, update, and deploy
# Update revision2_date (or later revision columns as needed)

git commit -m "Update calc.csv: Add revision2_date for [Calculator Name]"
```

**CSV Row Structure (Phase 3+):**

- `creation_date`: 11/29/2025 (unchanged)
- `revision1_date`: 11/30/2025 (unchanged)
- `revision2_date`: 12/1/2025 (set to next revision completion date)

---

**Total Phase 1: ~10 minutes**
**Total Phase 2: ~25 minutes (spread over 1–2 days)**
**Total Phase 3+: ~25 minutes per revision (as needed)**
**Advantage: Deep review + iterative improvement ensures production-quality calculators with full revision history tracking**

---

### Documentation & Tools

| Document                                                             | Purpose                     |
| -------------------------------------------------------------------- | --------------------------- |
| [QUICK_START.md](QUICK_START.md)                                     | 3-minute quick reference    |
| [scripts/ADD_CALCULATOR_README.md](scripts/ADD_CALCULATOR_README.md) | Full script documentation   |
| [SCHEMA_ENFORCEMENT_GUIDE.md](SCHEMA_ENFORCEMENT_GUIDE.md)           | ChatGPT integration guide   |
| [WORKFLOW_SUMMARY.md](WORKFLOW_SUMMARY.md)                           | Complete end-to-end process |

---

The generated/prompts folder

Purpose

Each .json file in generated/prompts/ is a pre-constructed AI prompt template that:

Combines the AI prompt template from the README (the long prompt in section "AI prompt template")

Injects calculator-specific context: slug, title, internal links, research directories

Is ready to copy-paste into an AI model (ChatGPT, Claude, Gemini, etc.)

Structure (from the example above)
{
"slug": "/conversions/length/feet-to-meters-converter",
"title": "Convert Feet to Meters – Length Converter",
"prompt": "[Full AI prompt template + schema rules + guardrails...]",
"context": {
"internalLinks": ["related calculators..."],
"researchDirs": ["input"]
},
"assets": {
"zips": []
}
}

How It Fits the Workflow

1 Human (Research phase) – Gathers competitor assets, stores in input/ folder

2 Human → AI (Synthesis phase) –
Opens the relevant file in generated/prompts/
Copies the prompt field
Attaches research assets (from input/) to the AI model
AI returns component_type + config_json
3 Human (Review phase) – Validates the JSON
4 Human (Data entry) – Pastes into CSV
5 Publish – npm run build

Key Observation

The files appear auto-generated (notice the naming pattern: category_subcategory_slug.json). This suggests a build step that:
Reads data/calc.csv
Generates a prompt file for each calculator entry
Pre-fills internal links and context metadata

Bottom line: generated/prompts/ is a convenience layer that pre-seeds AI requests with the right schema rules, internal links, and research context. It accelerates the synthesis phase by eliminating manual prompt construction

## Implementation guidance & critique

- **Review tooling\***
  - Use `/admin/playground` to validate and preview `config_json` before it reaches the CSV. The textarea+preview workflow lets reviewers catch schema violations immediately and see how each generic engine renders the experience.
- **Strengths of the AI-first plan**

  - Eliminates bespoke React work; throughput is governed by research and validation capacity, not engineering.
  - Centralises all business logic in `config_json`, enabling reproducible builds and lightweight rollbacks (revert CSV rows).
  - Encourages consistent UX patterns because engines evolve once and instantly benefit every calculator.

- **Risk areas to address**

  - `config_json` must be strictly versioned. Introduce a `config_version` field or embed schema IDs so older rows do not break when engines evolve.
  - Large JSON blobs in CSV cells are fragile. Consider mirroring the data in Airtable or a headless CMS with an automated export to guarantee quoting and encoding fidelity.
  - Even with structured text, enforce validation so the AI cannot inject unsupported Markdown or scripting fragments. Fail fast in the loader and surface actionable errors to editors.
  - Advanced calculators may need cross-field dependencies (e.g., amortisation tables). Document the engine contract thoroughly so AI prompts include required structures.

- **Recommendations for future refinement**
  1. Extend `npm run test` with JSON-schema validation against `config_json` and snapshot tests for representative calculators.
  2. Add a playground admin tool that loads `config_json` and renders the generic component locally for reviewers (no code changes required).
  3. Track review outcomes (approved / needs-fix) in metadata to build governance metrics and surface calculators stuck in QA.
  4. Automate link checking and citation validation to catch stale sources before publication.
  5. When new UX paradigms arise, enhance the generic engines behind feature flags, then upgrade existing rows by script—never by hand.

## SEO foundation

- Page-level metadata powered by `generateMetadata` and consistent canonical URLs.
- JSON-LD schemas (BreadcrumbList, WebPage, FAQ, SoftwareApplication) emitted per calculator page.
- Global WebSite + Organization schema emitted from the root layout.
- Automatic `sitemap.xml` & `robots.txt` generation with environment-aware base URLs (`NEXT_PUBLIC_SITE_URL`).
- Tailwind typography + semantic headings for crawlability.

## UX essentials

- Global navigation highlights top-performing categories and links to the full taxonomy.
- Conversion pages offer interactive calculators, formula explainers, and expert FAQs.
- Search surface (`/search`) helps visitors discover published calculators, while unpublished experiences stay hidden until launch.
- 404 experience points users back to the category index.

## Scaling considerations

1. **Build strategy**: For thousands of calculators, enable Incremental Static Regeneration (ISR) or on-demand revalidation. Pair with Vercel or AWS Edge at global scale.
2. **Performance budget**: Monitor Core Web Vitals. Tailwind classes keep payloads light; add image optimization if media appears later.
3. **Editorial workflow**: Store `data/calc.csv` in Airtable or Google Sheets, then sync via CI to keep authors non-technical. Build guard rails using schema validation in `lib/content.ts`.
4. **Testing**: Extend Vitest coverage to conversion formulas and add Playwright smoke tests for key journeys (`/`, `/category/...`, calculator pages, `/search`).
5. **Analytics & tracking**: Instrument GA4 or privacy-friendly analytics (e.g., Plausible) using Next.js Layout instrumentation.
6. **Internationalization**: Wrap content in locale-aware routing if expanding globally; `getSiteUrl` already centralizes canonical URLs.
7. **Caching**: CDN-cache static assets aggressively. For API-based dynamic calculators, co-locate serverless functions and enable SWR on client.

## Environment variables

- `NEXT_PUBLIC_SITE_URL`: Set to the production domain (e.g., `https://cernarus.com`). Used for canonical URLs, sitemap, and structured data.

## Roadmap ideas

- Expand `lib/conversions.ts` catalogue to support all planned unit types; consider sourcing definitions from an authoritative dataset.
- Introduce user-generated inputs (favorite conversions, history) behind edge storage to increase engagement signals.
- Add editorial notes/FAQs per calculator by extending the CSV or introducing MDX content overrides.
- Wire revalidation hooks (GitHub Actions + Vercel) to publish scheduled content automatically on its `New_Publish_Date`.
- Build AI-assisted gap analysis scripts that flag categories lacking depth compared to competitors.
````
