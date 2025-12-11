# Actions Matrix — Advanced Version

Use this document to brief a product/engineering team (or AI planner) on executing the ActionsMatrix “specialized decision engine” vision. Each row links a strategic aim to tangible actions, roles, and success metrics so the build is methodical, measurable, and repeatable.

| Focus Area | Strategic Play | Action Items | Owners | Signals / Metrics |
|------------|----------------|--------------|--------|------------------|
| **Vertical specialization** | Make ActionsMatrix a vertical-first destination—not a generic calculator tab. | 1. Build pillar guide templates (header, chapter navigation, deep links to tools). 2. Align each tool with its vertical and include “question → data → tool → insight” narrative arcs. 3. Publish 5,000-word guides per vertical with internal links pointing to each relevant calculator. | Content director + vertical SMEs | Pillar guide published per vertical; organic traffic lift on vertical landing pages |
| **Helpful content mandate** | Surround every tool with 500–2000 words of structured, expert content. | 1. Define section templates: What, How, Why, Data, FAQ. 2. Enforce requirement via `scripts/lint-configs.js` checking page_content word counts. 3. Embed schema (`HowTo`, `FAQPage`, `WebApplication`) inside `config_json`. | Editorial strategist + AI prompt engineer | 100% tools pass word-count guardrail; schema validation errors = 0 |
| **Data bridge** | Supply missing input data inline so users never stall because of unknown values. | 1. Build curated datasets (e.g., flour brands, car regs, regional costs). 2. Add lookup selectors/tooltips that populate fields automatically (use `form.fields.fetchUrl` or helper tables). 3. Provide mini-guides (“How to read Libretto di Circolazione”) inside the tool context. | Data engineer + UI/UX designer | Reduced drop-offs (<5%) for tools needing lookup data; tooltip interaction metrics |
| **Legal & compliance** | Show global/regional disclaimers per vertical to satisfy YMYL requirements. | 1. Maintain lawyer-approved snippets for medical, financial, legal tools. 2. Display CMP banner (Cookiebot/Iubenda) and record consent. 3. Highlight “Your data stays on this device” copy for privacy. | Legal + Compliance ops | CMP consent capture 100%; no AdSense/Google takedown notices |
| **Schema-first SEO** | Equip every calculator/guide with structured markup for SERP real estate. | 1. Extend engines to emit `WebApplication`, `HowTo`, `FAQPage`, `HowToStep` markup based on `config_json`. 2. Craft meta descriptions that promise deeper value (“interactive sliders, PDF export”). 3. Monitor Search Console for rich result impressions. | SEO analyst + Frontend engineer | `HowTo`/`FAQ` schema coverage 100%; CTR lift for targeted queries |
| **UX excellence** | Deliver low-latency, app-like interactions inspired by Omni Calculator. | 1. Implement bi-directional calculation modes per tool (budget → loan, target BMI → calories). 2. Keep INP low via lazy-loaded charts, optimized hydration, and lightweight libs. 3. Provide dynamic tooltips, visual selectors, manipulable graphs, and immediate results (no submit unless needed). | Product + Performance engineer | INP < 200ms; visual regression tests pass; engagement 30% higher than baseline |
| **Performance & critical CSS** | Maintain fast first paint despite the richer experience. | 1. Keep `critical.css` minimal (<4KB) for the shell. 2. Ensure `globals.css` imports it before Tailwind. 3. Monitor `.next/static/css` size and keep it under 30KB. | Build engineer + Frontend | CSS bundle <30KB; critical CSS <4KB |
| **Content ops** | Keep the AI-driven workflow disciplined. | 1. Version-control prompt templates in `scripts/generate-prompts.js`. 2. Automate CSV quality checks (`scripts/lint-configs.js`, schema guardrails). 3. Regenerate `data/summary.json` nightly and validate slug coverage against CSV rows. | Prompt engineer + Automation engineer | Zero invalid rows; summary JSON row count = CSV active rows |
| **Navigation & trust** | Ensure every tool surface is discoverable and crawlable. | 1. Generate static category agents with summary data (`lib/content.ts`). 2. Keep canonical metadata, sitemap, and footer nav updated. 3. Surface disclaimers and privacy messaging on every page. | SEO + Platform | No ISR page oversize warnings; sitemap coverage matches CSV |

## Execution cadence

1. **Weekly sprints** review:
   - `data/summary.json` vs CSV row count.
   - Critical CSS size, schema errors, INP reports.
   - Compliance logs (CMP, disclaimers, privacy indicators).
2. **New tool launch**:
   - Research + AI prompt → `config_json` + disclaimers + schema.
   - Paste row into `data/calc.csv`.
   - Run `nx run build` (or `npm run build`) to rebuild the summary + static pages.
3. **Monitoring**:
   - Track schema-rich impressions and click-through lifts for pillar guides.
   - Alert on ISR warnings, CMP consent misses, or slow INP.

Keep this matrix next to `README-adv.md` as the tactical execution companion for ActionsMatrix. Once these foundations are cast, advanced leaps (custom AI copilots, personalization, scenario forecasting) can be mapped on top. Ready for the next iteration? 
