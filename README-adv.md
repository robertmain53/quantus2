# ActionsMatrix — Advanced Version

Domain: `actionsmatrix.com`

ActionsMatrix is the elevated evolution of Cernarus—a decision intelligence engine built around *specialized verticals* and *data-rich context*. While calculators remain part of the experience, the journey begins with a strategic question (“Can I afford this house?”, “Is my child growing as expected?”). The platform answers those questions by combining authoritative content, historical data, and interactive tools inside a clean, application-like interface.

## Positioning & philosophy

1. **Specialization over ubiquity** – Each vertical (Finance, Health, Engineering) is a deep silo anchored by a massive “pillar guide” (5,000+ words). Within that guide, clear stages (“Step 2: Mortgage”) link to individual tools. The goal is to signal to users **and search engines** that ActionsMatrix is the comprehensive authority on that decision space, not just a calculator farm.
2. **Context-first content** – Every calculator page includes:
   - **The Tool** — immediate access to the calculator (above the fold, interactive sliders, visual inputs, bi-directional inputs).
   - **The What** — a definition explaining the concept, its KPIs, and stakes.
   - **The How** — transparency about the formula, backed by math notes or a mini derivation.
   - **The Why** — decision advice (“When should you recalculate?”). 
   - **FAQ block** with Schema.org markup for “People Also Ask” real estate.
3. **Data empowerment** – Tools pre-populate inputs with curated datasets (flour brands for dough, vehicle Euro standards, regional construction costs). The UI offers quick lookups and tooltips so users never feel “data-less”.
4. **Authority & compliance** – Each vertical ships with lawyer-vetted disclaimers (Medical, Financial) and privacy messaging (“Your data never leaves the device”) plus a CMP (Cookiebot/Iubenda) controlling tracking scripts.
5. **Schema-first SEO** – Apply `WebApplication`, `HowTo`, `FAQPage`, and calculator-specific schema markup so Google surfaces the answer while still funneling clicks to ActionsMatrix. The meta description hints that the deeper experience (graph, PDF export) requires visiting the page.
6. **Experience excellence** – UX follows Omni Calculator-style patterns: instant INP, no submit buttons, dynamic tooltips, visual selectors, manipulable charts, large mobile tap zones, bi-directional calculation, real-time results, and code-splitting/lightweight libs to keep interaction threads unblocked.

## Structural blueprint

### Vertical hub model

- **Pillar guides** (single long-form page per vertical) outline the whole decision process, link to tools, and host the main schema (`HowTo`, `Article`).  
- **Tool micro-pages** embed the calculator + contextual sections + CTA to download/share printable reports. Each page denotes the user’s intent (budget, growth, regulatory compliance) to satisfy helpful content signals.
 
### Content + data requirements per tool

- 500–2000 words of structured, useful copy per tool.
- Embedded schema: `WebApplication`, `HowTo`, `FAQPage`, `HowToStep` fragments, `FAQ`, citations to high-authority sources.
- Real-time data helpers: pre-populated dataset selectors, informational modals, tooltip definitions, external lookups (e.g., Libretto di Circolazione).
- Visual/interactive inputs: sliders, icon-based selectors, dynamic amortization charts; bi-directional mode (enter desired output to infer inputs).

### Compliance & trust

- Medical disclaimers per tool (`BMI`, ovulation).  
- Financial disclaimers (“estimates only; not a solicitation”).  
- Privacy statement (“Your data never leaves your browser”) paired with CMP banner.  
- All legal copy stored as reusable snippets for consistency.

### Technical guardrails

- Critical CSS + semantic palette layer (already present).  
- React hydration optimized with code splitting, lazy-loaded chart libs, and no blocking scripts.  
- Schema-driven navigation via `data/summary.json` so category/sitemap generation remains lightweight.  
- CMP + script gating for ads/analytics.  
- INP monitoring (Performance budgets) to ensure low-latency interactions even on mid-range mobile.

## Runbook for the advanced platform

1. **Research & prompt** – Document the question, curate data assets, instruct AI to produce context-rich guidance plus config + schema + disclaimers.  
2. **Validation** – Run schema validation, formula checks, and helpful content audits (word count per section).  
3. **Generation** – Populate `data/calc.csv` (or upstream CMS) with the AI output plus publish dates.  
4. **Build** – `npm run build` runs `scripts/generate-summary.ts`, rebuilds `data/summary.json`, and produces optimized shell + Tailwind CSS.  
5. **Monitoring** – Track CSS bundle size, INP, schema errors, sitemap coverage, and CMP consent logs.  

If the advanced vision is approved, I’ll now create `README-ACTIONSMATRIX-adv.md` detailing actionable steps, owners, and metrics for each strategic focus. Let me know if you want to tweak this narrative first. 
