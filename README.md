# Quantus Enterprise Content Platform

Quantus is a Next.js 14 application engineered to publish thousands of SEO-focused calculators and conversion tools from a single source-of-truth catalogue. The platform emphasizes static-first delivery, structured data, and an editorial workflow that can scale to 120K daily sessions.

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

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run build` | Create production build (SSG/ISR ready) |
| `npm run start` | Serve production build |
| `npm run lint` | Run Next.js ESLint rules |
| `npm run test` | Execute Vitest suite for data layer |

> **Note:** Tests and linting require dependencies to be installed. Network access may be needed when running `npm install` within a sandboxed environment.

## Content operations

- Source data lives in `data/calc.csv`. Each row is the single source of truth for taxonomy, publishing cadence, calculator configuration, and on-page copy.
- The data layer (`lib/content.ts`) loads the CSV, memoizes it, and exposes helpers that drive static params, navigation, search, sitemaps, metadata, and calculator rendering.
- Editing the CSV is all that’s required to launch, update, or unpublish a calculator. During `next build`, unpublished rows (publish date in the future) are skipped automatically.
- Use the `traffic_estimate` column to prioritize categories surfaced on the homepage and navigation.

### CSV schema (AI-first)

| Column | Purpose |
| --- | --- |
| `category` | Human-readable cluster name (e.g. `Finance`). Used for taxonomy grouping and navigation copy. |
| `subcategory` | Optional sub-cluster label (e.g. `Loans`). Empty cells keep calculators directly under the category. |
| `slug` | Absolute path (e.g. `/finance/loans/personal-loan-payment-calculator`). Uniqueness is enforced in the loader. |
| `title` | Page H1 and default metadata title. AI copy should be final-ready. |
| `traffic_estimate` | Daily sessions forecast. Drives prioritisation and projected totals. |
| `New_Publish_Date` | ISO-friendly date. Items with a future date stay hidden until the next rebuild after that date. |
| `component_type` | Enum describing which generic engine should render the calculator. Supported values: `converter`, `simple_calc`, `advanced_calc`. |
| `config_json` | JSON blob containing the full calculator contract: inputs, outputs, validation rules, structured page copy, schema hints, internal/external link plans, and presentation settings (no raw HTML). |

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
             { "id": "principal", "label": "Loan amount", "type": "currency", "min": 1000, "max": 500000 },
             { "id": "apr", "label": "APR", "type": "percent", "min": 0.1, "max": 60 },
             { "id": "term_months", "label": "Term", "type": "integer", "min": 6, "max": 360 }
           ],
           "result": {
             "outputs": [
               { "id": "monthlyPayment", "label": "Monthly payment", "unit": "usd" },
               { "id": "totalInterest", "label": "Total interest", "unit": "usd" }
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
             { "question": "How do I lower my monthly payment?", "answer": "Lower the APR, extend the term, or reduce the principal. Each lever has trade-offs covered below." }
           ],
           "citations": [
             { "label": "Consumer Finance Protection Bureau", "url": "https://www.consumerfinance.gov" }
           ]
         },
         "schema": {
           "additionalTypes": ["HowTo"]
         },
         "links": {
           "internal": ["/finance/loans/auto-loan-payment-calculator"],
           "external": [
             { "url": "https://www.fdic.gov/resources/consumers/consumer-news/2023-12.pdf", "rel": ["noopener", "noreferrer"] }
           ]
         }
       }
       ```
     - Any specialised JSON-LD requirements (e.g. `HowTo`, `Dataset`) should be embedded inside `config_json` so engines can emit schema automatically.

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
  - List of existing Quantus internal links relevant to the topic (category hubs, related calculators).
  - Any guardrails (tone, compliance notes, traffic goal, localisation).
- When using ChatGPT/Gemini/Claude: upload the zip first, then paste the prompt+context.
- When using VS Code AI: ensure the assistant has access to the research folder (or paste representative excerpts) before running the prompt.

Replace the bracketed placeholders in the template below before sending it to the model. When you paste the AI response into `/admin/playground`, you may either paste the entire wrapper (with `component_type` + `config_json`) or only the inner `config_json`.

```text
You are an elite product strategist, quant engineer, and technical copywriter tasked with building the market-leading version of “[CALCULATOR NAME]”. Study every asset provided (competitor calculators, regulatory PDFs, spreadsheets, notes). Your deliverable must be production-ready and strictly follow the Quantus config schema.

Goals:

1. Deliver a deployable JSON config that matches the Quantus schema, keeps the converter lean, and trades in user-facing value rather than internal talk.

2. Keep metadata, page copy, and FAQs focused on address user's intent plus practical reassurance (calibration, instrument limits, regulatory cues).

3. Use strong EEAT language (citations, references to NIST/OSHA/DOE/MIT/ISO, practical FAQs) without mentioning competitors, filenames, or the fact that this is a benchmark exercise.

3. capture recipe & lab traffic with trust signals
5. reference attached assets only for gaps in accuracy, authority, or UX and do not mention them in copy. 
6 reference universities, and *.gov site for informations, formulas, insights and do mention them or even better link the in the copy
7. strong EEAT copy (beyond methodology/faq)
8. the output must be deployable JSON . I’ll review it directly via Quantus (so no placeholder commentary)
9. Produce a single JSON object compatible with Quantus engines (`component_type` + `config_json`). No additional commentary.

Requirements for the JSON you return:
- Top-level shape:
  ```json
  {
    "component_type": "converter | simple_calc | advanced_calc",
    "config_json": { ... }
  }
  ```
- Inside `config_json`:
  - `version`: semantic string, bump `major.minor` if you introduce new schema capabilities.
  - `metadata.title` and `metadata.description`: persuasive copy that differentiates us; no HTML.
  - `logic`:
    * For `component_type = "converter"` set `type` to `"conversion"` and provide only `fromUnitId` and `toUnitId` that match entries in `lib/conversions.ts`. Do not emit custom unit arrays, conversion factors, precision settings, or formula strings.
    * For `component_type = "simple_calc"` set `type` to `"formula"` with an `outputs` array (each item needs `id`, `label`, `expression`, optional `unit`/`format`). Do **not** create extra properties such as `expressions`, `precision`, `isPrimary`, or `description`.
    * For `component_type = "advanced_calc"` set `type` to `"advanced"` and supply a `methods` object. Each method must define:
      - `label` + optional `description`.
      - `variables`: map of `{ "variable_name": { "expression": "...", "dependencies": [], "label": "...", "unit": "...", "format": "...", "display": true|false } }`. Expressions may reference form field IDs, other variables, or helper functions (`pow`, `min`, `max`, `abs`, `sqrt`, `log`, `exp`).
      - `outputs`: array of `{ "id": "...", "label": "...", "variable": "variable_name", "unit": "...", "format": "currency|percent|decimal|integer" }`. At least one output must be present per method. Use `"display": true` and/or `label` on variables to surface additional metrics.
      - `formula` (optional) to indicate the primary variable if you want a default highlight.
    * Always populate `defaultMethod` with the method id that should load first.
  - `form`:
    * Converters render their own inputs; omit `form` or set it to `null` unless a companion UX pattern (e.g., presets) is explicitly required.
    * For simple calculators, supply a flat `fields` array (labels, types, sensible defaults, min/max, step, options). Use `form.result.outputs` when you want companion result cards—each entry should only include `id`, `label`, `format`, and optional `unit`.
    * For advanced calculators you may combine `fields` (global inputs) and `sections` (grouped inputs). Each section can include an optional `description` and `show_when` object (`field`, `equals`, `in`) to control conditional rendering. Every field may include `help_text`, `placeholder`, `default`, and validation limits.
  - `page_content`: use arrays of plain-text sentences; do not embed HTML. Provide:
    * `introduction`: 2–3 short paragraphs explaining intent and user value.
    * `methodology`: authoritative walkthrough referencing standards/regulations.
    * `examples`: optional worked scenarios expressed as plain-text sentences (no nested objects).
    * `faqs`: 3–5 Q&As covering expert intent, edge cases, and trust-building topics.
    * `citations`: authoritative sources (label + URL + optional summary).
    * `summary`: short bullet sentences capturing key insights from the attached assets (reference filenames when helpful).
    * `glossary` if helpful.
  - `links`: `internal` should list existing Quantus slugs (e.g., `"/finance/loans/roi-calculator"`). `external` entries must be objects with `url` and optional `label`, `rel` (array of tokens such as `"noopener"` or `"noreferrer"`).
  - `schema.additionalTypes`: include structured data hints (e.g., `"HowTo"`, `"Dataset"`) when justified by the copy.
- Never emit HTML tags; formatting is handled by the React engine.
- Ensure math expressions use variables that match `form.fields[].id`.
- All numeric conversions must reference official standards (cite them).

Analytical expectations:
- Benchmark formulas, ranges, and UX patterns against every attached competitor. Flag weaknesses and improve them in our config.
- Address user mental models (e.g., disclaimers, validation states, error copy) inside the appropriate JSON fields.
- Surface compliance or safety caveats when the topic demands it (loans, health, etc.).
- Recommend internal links that strengthen our topical authority; avoid duplicates already in the citations list.
- When you create multiple calculation methods (`advanced_calc`), ensure each method exposes distinct outputs and clearly communicates when it should be used.

Output:
- Return ONLY the final JSON object (containing `component_type` and `config_json`). It must parse without post-processing and conform to the schema above.
```


### Explanation by Claude

A configuration-driven, AI-first platform designed to publish thousands of SEO-focused calculators without bespoke React development. Here's the operational breakdown:

Core Mechanism

Single Source of Truth: data/calc.csv contains all metadata and configuration for every calculator. Each row drives publication, taxonomy, rendering logic, and content. Three Generic Engines: Instead of building custom React components per calculator:
- GenericConverter – unit conversions (e.g., kg to lbs)
- GenericSimpleCalculator – single-formula tools (e.g., CAGR)
- GenericAdvancedCalculator – multi-step flows (e.g., loan amortization)

The component_type field routes to the right engine; config_json contains the full calculator blueprint (inputs, outputs, validation, copy, links, schema).

## Operational Workflow (Steps 1–5)

### Overview

The workflow takes a calculator from research to publication in **~12 minutes** using ChatGPT and a single import script. No manual CSV escaping required.

```
Step 1: Research     [Human, 5 min]  → Gather competitor assets
       ↓
Step 2: Generate     [AI, 5 min]     → Use provided prompt + assets → Get JSON
       ↓
Step 3: Review       [Human, 1 min]  → Validate JSON against schema
       ↓
Step 4: Import       [Script, 1 min]  → Run add-calculator.js → Auto-escapes & adds to CSV
       ↓
Step 5: Publish      [Automated]     → npm run build; Next.js renders using config_json
```

---

### Step 1: Research (Human, ~5 min)

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

### Complete Workflow Example

```bash
# 1. RESEARCH (Manual)
SERPER_API_KEY=sk_... node scripts/generate-zip/index.js

# 2. GENERATE PROMPT
npm run prepare-prompts

# 3. CHATGPT (Manual, ~5 min)
# → Copy prompt from generated/prompts/...json
# → Attach ZIP from input/
# → ChatGPT returns config_json

# 4. IMPORT TO CSV (Automated, ~1 min)
node scripts/add-calculator.js \
  --category "Conversions" \
  --subcategory "Illuminance" \
  --slug "/conversions/illuminance/lumens-to-lux-converter" \
  --title "Convert Lumens to Lux – Light Converter" \
  --traffic 10000 \
  --date "11/28/2025" \
  --config data/configs/lumens-to-lux-converter.json

# 5. PUBLISH (Automated)
npm run build && npm start
```

**Total: ~12 minutes per calculator** (40% faster than manual)

---

### Documentation & Tools

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](QUICK_START.md) | 3-minute quick reference |
| [scripts/ADD_CALCULATOR_README.md](scripts/ADD_CALCULATOR_README.md) | Full script documentation |
| [SCHEMA_ENFORCEMENT_GUIDE.md](SCHEMA_ENFORCEMENT_GUIDE.md) | ChatGPT integration guide |
| [WORKFLOW_SUMMARY.md](WORKFLOW_SUMMARY.md) | Complete end-to-end process |

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

- **Review tooling***
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

- `NEXT_PUBLIC_SITE_URL`: Set to the production domain (e.g., `https://quantus.com`). Used for canonical URLs, sitemap, and structured data.

## Roadmap ideas

- Expand `lib/conversions.ts` catalogue to support all planned unit types; consider sourcing definitions from an authoritative dataset.
- Introduce user-generated inputs (favorite conversions, history) behind edge storage to increase engagement signals.
- Add editorial notes/FAQs per calculator by extending the CSV or introducing MDX content overrides.
- Wire revalidation hooks (GitHub Actions + Vercel) to publish scheduled content automatically on its `New_Publish_Date`.
- Build AI-assisted gap analysis scripts that flag categories lacking depth compared to competitors.
