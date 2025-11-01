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

- Source data lives in `data/calc.csv`. Each row defines a calculator/category path, predicted traffic, and publish date.
- The data layer (`lib/content.ts`) is memoized and powers static params, navigation, search, sitemaps, and metadata.
- Editing the CSV triggers new static routes automatically the next time `next build` runs—no code changes required for new entries. Entries with a `New_Publish_Date` in the future stay hidden from users, bots, and the sitemap until the date arrives.
- Use the `traffic_estimate` column to prioritize categories surfaced on the homepage and navigation.

### Adding calculators

1. Add a row to `data/calc.csv` with category, optional subcategory, slug (absolute path), and title.
2. Commit the change and run `npm run build`. Next.js will pre-render the new calculator and include it in search, navigation, and the sitemap once the publish date is in the past.
3. If the slug follows the pattern `{unit}-to-{unit}-converter`, the page automatically enables the interactive conversion widget.

### Category taxonomy

- Top categories are derived from the CSV. No manual configuration is required.
- Category and subcategory pages are statically rendered from the data layer and include internal linking plus traffic forecasts.

## Calculator production workflow (EEAT + AI assisted)

Every calculator ships as a best-in-class tool that surpasses competitors on UX, expertise, experience, authoritativeness, trust (EEAT), depth, and helpfulness. Follow this workflow for each slug listed in `data/calc.csv`.

1. **Create a research workspace**
   - In the repository root, create a folder whose name matches the calculator slug (e.g. `auto-loan-amortization-calculator`).
   - Collect 20–30 competitor calculators and related reference articles (HTML, PDFs, screenshots, spreadsheets). Save them in the folder for provenance.

2. **Synthesize research insights**
   - Catalogue formulas, variable definitions, edge cases, UX ideas, schema usage, and internal/external linking tactics present in the competitor set.
   - Identify authoritative sources cited by competitors (standards organizations, regulations, journals) and capture canonical URLs.

3. **Draft an AI brief**
   - Prepare a structured prompt that instructs the model to:
     - Study every file in the slug folder.
     - Summarize the strongest UX/UI patterns, data models, validation rules, and narrative structures.
     - Produce a calculator specification (inputs, outputs, formulas, error handling, accessibility requirements, performance targets).
     - Generate content sections (intro, methodology, FAQs, examples, citations) that exceed the depth of the aggregated competitors.
     - Recommend schema (JSON-LD) enhancements, internal links, and high-authority external references.

   Example prompt to adapt (feed alongside the collected files):
   ```
   You are an elite product strategist and senior engineer. Study every asset inside ./<slug>.
   Goals:
   1. Architect a calculator experience that outperforms all collected competitors in UX, clarity, speed, accessibility, and trust.
   2. Provide complete formulas (including unit conversions, rounding, edge cases) and explain each variable.
   3. Recommend UI flows, component states, microcopy, validation rules, and structured data.
   4. Draft long-form content with deep domain expertise (EEAT): intro, methodology, worked examples, FAQs, glossary, citations.
   5. Extract every authoritative source cited in the corpus. Return canonical URLs and context on why each matters.
   6. Suggest internal links (existing Quantus pages) that reinforce topical authority.
   Deliverables:
   - Calculator spec (JSON or markdown table).
   - Content outline and draft copy.
   - Schema enhancements (JSON-LD).
   - Link plan (internal + external with rationale).
   - QA checklist covering accessibility, performance, accuracy, and legal/compliance.
   ```

4. **Human + AI collaboration**
   - Humans review the AI output, validate formulas against primary sources, and adjust UX recommendations to align with design systems.
   - Iterate with AI as needed to refine the calculator spec, content, and link plan.
   - Document all authoritative references in the folder and cite them within the final content.

5. **Build the product experience**
   - Implement the calculator UI/logic in `app/(content)/...` aligned with the generated specification.
   - Add supporting visualizations, tables, and interactive helpers identified during research.
   - Ensure external links to authoritative sources open in new tabs with appropriate rel attributes.
   - Update structured data (FAQ, HowTo, Dataset, etc.) based on AI recommendations and legal approvals.

6. **QA and publication**
   - Run automated tests (`npm run test`, `npm run lint`) and manual QA against the checklist (accessibility, accuracy, cross-device).
   - Set or update `New_Publish_Date` in the CSV to control release timing. Once the date is in the past, the calculator appears in search, navigation, and the sitemap automatically.
   - Archive the final AI prompts and outputs in the slug folder for governance and future audits.

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
