# Quantus Enterprise Content Platform

Quantus is a Next.js 14 application engineered to publish thousands of SEO-focused calculators and conversion tools from a single source-of-truth catalogue. The platform emphasizes static-first delivery, structured data, and an editorial workflow that can scale to 120K+ daily sessions.

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
- The data layer (`lib/content.ts`) is memoized and powers static params, sitemaps, navigation, and metadata.
- Editing the CSV triggers new static routes automatically the next time `next build` runs—no code changes required for new entries.
- Use the `traffic_estimate` column to prioritize categories surfaced on the homepage and navigation.

### Adding calculators

1. Add a row to `data/calc.csv` with category, optional subcategory, slug (absolute path), and title.
2. Commit the change and run `npm run build`. Next.js will pre-render the new calculator and include it in the sitemap and navigation.
3. If the slug follows the pattern `{unit}-to-{unit}-converter`, the page automatically enables the interactive conversion widget.

### Category taxonomy

- Top categories are derived from the CSV. No manual configuration is required.
- Category and subcategory pages are statically rendered from the data layer and include internal linking plus traffic forecasts.

## SEO foundation

- Page-level metadata powered by `generateMetadata` and consistent canonical URLs.
- JSON-LD schemas (BreadcrumbList, WebPage, FAQ, SoftwareApplication) emitted per calculator page.
- Global WebSite + Organization schema emitted from the root layout.
- Automatic `sitemap.xml` & `robots.txt` generation with environment-aware base URLs (`NEXT_PUBLIC_SITE_URL`).
- Tailwind typography + semantic headings for crawlability.

## UX essentials

- Global navigation highlights top-performing categories and links to the full taxonomy.
- Conversion pages offer interactive calculators, formula explainers, and expert FAQs.
- 404 experience points users back to the category index.

## Scaling considerations

1. **Build strategy**: For thousands of calculators, enable Incremental Static Regeneration (ISR) or on-demand revalidation. Pair with Vercel or AWS Edge @  global scale.
2. **Performance budget**: Monitor Core Web Vitals. Tailwind classes keep payloads light; add image optimization if media appears later.
3. **Editorial workflow**: Store `data/calc.csv` in Airtable or Google Sheets, then sync via CI to keep authors non-technical. Build guard rails using schema validation in `lib/content.ts`.
4. **Testing**: Extend Vitest coverage to conversion formulas and add Playwright smoke tests for key journeys (`/`, `/category/...`, calculator pages).
5. **Analytics & tracking**: Instrument GA4 or privacy-friendly analytics (e.g., Plausible) using Next.js Layout instrumentation.
6. **Internationalization**: Wrap content in locale-aware routing if expanding globally; `getSiteUrl` already centralizes canonical URLs.
7. **Caching**: CDN-cache the static assets aggressively. For API-based dynamic calculators, co-locate serverless functions and enable SWR on client.

## Environment variables

- `NEXT_PUBLIC_SITE_URL`: Set to the production domain (e.g., `https://quantus.com`). Used for canonical URLs, sitemap, and structured data.

## Roadmap ideas

- Expand `lib/conversions.ts` catalogue to support all planned unit types; consider sourcing definitions from an authoritative dataset.
- Introduce user-generated inputs (favorite conversions, history) behind edge storage to increase engagement signals.
- Add editorial notes/FAQs per calculator by extending the CSV or introducing MDX content overrides.
- Wire revalidation hooks (GitHub Actions + Vercel) to publish scheduled content automatically on its `New_Publish_Date`.
