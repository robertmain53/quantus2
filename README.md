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
| `config_json` | JSON blob containing the full calculator contract: inputs, outputs, validation rules, content sections, schema hints, internal/external link plans, and presentation settings. |

> **Tip:** Keep JSON payloads in valid UTF-8 and escape double quotes if editing the CSV manually. For bulk edits, prefer tooling (Airtable export, Google Sheets + script) that can manage multi-line cells safely.

### Generic calculator engines

We ship a small stable of reusable React components. Each reads `component_type` and `config_json` to decide how to render the interactive experience:

- `GenericConverter.tsx` – unit-to-unit conversions with reversible inputs, precision rules, and optional derived outputs.
- `GenericSimpleCalculator.tsx` – single-formula calculators (e.g. CAGR, markup) with lightweight validation.
- `GenericAdvancedCalculator.tsx` – multi-step or multi-output flows (e.g. amortization) with repeatable groups, tables, and scenario analysis.

Adding a new calculator never requires building another bespoke React component. Instead, evolve the engine APIs if a new pattern emerges, then reuse it everywhere via configuration.

### Adding calculators

1. Paste a new row in `data/calc.csv` (or the upstream datasource) with category, slug, publish date, and the AI-generated `component_type` plus unified `config_json`.
2. Run `npm run build`. Next.js pre-renders the page, schema, and navigation updates using the generic component matched to `component_type` and hydrated by the config.
3. Commit the CSV change. The deployment pipeline handles static regeneration once the publish date is met.

### Category taxonomy

- Top categories are derived from the CSV. No manual configuration is required.
- Category and subcategory pages are statically rendered from the data layer and include internal linking plus traffic forecasts.

## AI-first production workflow

This model removes bespoke React development from the daily cadence. Humans concentrate on research, validation, and governance; AI generates production-ready configuration and content.

1. **Research (human)**
   - Assemble a corpus of 20–30 competitor calculators plus primary sources.
   - Store assets in a shared drive; provenance is mandatory for compliance and post-hoc audits.

2. **Synthesis & generation (AI)**
   - Feed the corpus into your AI workspace with a prompt that requests:
     - Final `component_type` selection.
     - A unified `config_json` matching the engine contract, including inputs, units, computed outputs, validation, display rules, content sections, link plans, and schema metadata. A representative structure might look like:
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
         "content": {
           "introduction": "<p>Use this calculator to understand the cost of any personal loan.</p>",
           "methodology": "<p>We compute payments using the standard amortization formula...</p>",
           "faqs": [
             { "question": "How do I lower my monthly payment?", "answer": "<p>Lower APR or longer term reduces payments.</p>" }
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

> **Quality gates:** Maintain automated validation inside `lib/content.ts` to reject malformed JSON, missing enum values, or unsanitised HTML before build time.

## Implementation guidance & critique

- **Strengths of the AI-first plan**
  - Eliminates bespoke React work; throughput is governed by research and validation capacity, not engineering.
  - Centralises all business logic in `config_json`, enabling reproducible builds and lightweight rollbacks (revert CSV rows).
  - Encourages consistent UX patterns because engines evolve once and instantly benefit every calculator.

- **Risk areas to address**
  - `config_json` must be strictly versioned. Introduce a `config_version` field or embed schema IDs so older rows do not break when engines evolve.
  - Large JSON blobs in CSV cells are fragile. Consider mirroring the data in Airtable or a headless CMS with an automated export to guarantee quoting and encoding fidelity.
  - AI-generated HTML embedded inside `config_json` requires sanitisation. Bake sanitising into the loader and limit the allowed tag list to prevent XSS.
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
