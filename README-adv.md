# ActionsMatrix — Advanced Version

Domain: `actionsmatrix.com`

ACTIONSMatrix is the elevated evolution of Cernarus—a decision intelligence engine built around *specialized verticals* and *data-rich context*. While calculators remain part of the experience, the journey begins with a strategic question (“Can I afford this house?”, “Is my child growing as expected?”). The platform answers those questions by combining authoritative content, historical data, and interactive tools inside a clean, application-like interface.

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

## Search & intent discovery

All pages feature a persistent search bar in the header to route queries across disciplines and hubs. The homepage hero introduces the Dynamic Sentence Builder: “Voglio calcolare…” with intent-focused autocomplete that maps user phrases to tools (e.g., typing “Mutuo” suggests “…la rata mensile del mutuo”, “…quanti soldi la banca mi dà”, “…quanto risparmio con la surroga”). This solves the vocabulary gap, helping users find the right tool even when their terminology differs from branded calculator names.

## Structural blueprint

### Dual taxonomy model

ActionsMatrix content organizes itself along two orthogonal axes:

1. **Discipline taxonomy (cat1.csv)** – categories/subcategories/sub-subcategories structured by discipline. This axis feeds the “Discipline Mega Menu” and discipline landing pages, mirroring the prior category hierarchy.
2. **Hub + Cluster model (cat2.csv)** – hubs represent user intentions (e.g., “Buy a Home,” “Grow a Business”) and each hub contains clusters (specific question or workflow bundles). All breadcrumbs and URLs follow this hub/cluster structure: `actionsmatrix.com/[hub]/[cluster]/slug`. These clusters surface in a second “Intent Mega Menu” built around user goals.

### Intent menu design (Mega Menu)

The Intent Mega Menu is a full-width, three-column panel:

- **Left column (“High Intent”)** highlights the most popular tools in the current hub (e.g., Net Salary, Mortgage in Money).  
- **Middle column (“Goal Clusters”)** lists the “I want to …” clusters (Buying a House, Taxes, Investing), covering 4–5 clusters per hub.  
- **Right column (“Featured Guide”)** links to the pillar page for that hub (“The Ultimate Guide to Buying a House in Italy 2024”), reinforcing topical authority.

There are six top-level hubs (Money, Health, Life, Engineering, Law, Food & Home), each with its own mega menu. Labels use task-based verbs (“Gestire”, “Costruire”, “Cucinare”) to mirror user intent. This menu replaces any simple dropdown and is paired with the discipline menu (showing category > subcategory on hover).

Homepage features an interactive “Sentence Builder” search (“Voglio calcolare…”) powered by intent autocomplete so users are matched to the right tool even if their wording differs from official tool names.

Every page (whether a discipline-focused tool listing or an intent hub landing page) will feature both hierarchies: the discipline mega menu (Category > Subcategory) plus the intent mega menu (Hub > Cluster), along with dedicated listing pages for each node.

- **Pillar guides** (single long-form page per vertical) outline the whole decision process, link to tools, and host the main schema (`HowTo`, `Article`).  
- **Tool micro-pages** embed the calculator + contextual sections + CTA to download/share printable reports. Each page denotes the user’s intent (budget, growth, regulatory compliance) to satisfy helpful content signals.
 
### Content + data requirements per tool

- 500–2000 words of structured, useful copy per tool.
- Embedded schema: `WebApplication`, `HowTo`, `FAQPage`, `HowToStep` fragments, `FAQ`, citations to high-authority sources.
- Real-time data helpers: pre-populated dataset selectors, informational modals, tooltip definitions, external lookups (e.g., Libretto di Circolazione).
- Visual/interactive inputs: sliders, icon-based selectors, dynamic amortization charts; bi-directional mode (enter desired output to infer inputs).

### Source-of-truth schema (Advanced)

`cat-3.csv` defines the metadata for category, subcategory, subsubcategory, hub, and cluster listing pages. Each row includes:

| Field | Purpose |
| --- | --- |
| `title`, `description`, `meta description` | Feed the hero intro, `<title>`, and meta description tags for that landing page. |
| `category`, `subcategory`, `subsubcategory`, `hub`, `cluster` | Ensure both Discipline and Intent taxonomies show consistent copy. |
| `links_to` | Additional slug references that must appear in the Related Tools widget for that page. |

Every tool page surfaces a Related Tools section linking to both same-subcategory calculators (discipline axis) and same-cluster pages (intent axis) plus any explicit `links_to` slugs.

### Prompt types (`content_type`)

Each row in `data/calc.csv` includes `content_type`.  
* If `content_type = Tool`, the prompt remains the current tool-focused request (calculator + context + schema).  
* If `content_type = Article`, the prompt asks for an “Ultimate Guide”—a 3,000–5,000 word pillar combining novice-to-PhD explanations of the topic plus links to related tools, data sources, and schema markup.

### Prompt examples & storage

**Tool prompt (calculator)**  
“Generate a `component_type` = `simple_calc` configuration for a mortgage calculator in Italy. Include form fields, validation, logic/expressions, `page_content` (introduction, methodology, FAQs, citations, how_is_calculated), and Schema.org annotations. Provide five related tools and `links_to` slugs.”

**Article prompt (Ultimate Guide)**  
“Write a 4,500-word pillar titled ‘The Ultimate Guide to Buying a House in Italy 2024’. Cover the journey from novice to PhD level, highlight related calculators (mortgage, taxes, renovation), cite authoritative sources, and include HowTo + FAQ schema. The copy must reference both the discipline and hub sections.”

### Source-of-truth schema (ActionsMatrix)

`data/calc.csv` retains its central role but follows the advanced schema:

| Column | Purpose |
| --- | --- |
| `title`, `category`, `subcategory`, `subsubcategory` | Discipline taxonomy copy powering Mega Menu #1 (Disciplines). |
| `component_type` | Engine selection (`converter`, `simple_calc`, `advanced_calc`). |
| `links_to` | Comma-separated slugs for mandatory Related Tools links (tools, guides, articles). |
| `hub`, `cluster`, `slug` | Intent taxonomy data feeding Mega Menu #2 (User Intent) and canonical URLs (`/hub/cluster/slug`). |
| `traffic_estimate`, `New_Publish_Date` | Ranking/prioritization metadata and scheduling. |
| `config_json` | Full calculator contract (inputs, outputs, copy, schema, disclaimers). |
| `creation_date`, `revision1_date`, `revision2_date`, `revision3_date` | Editorial version tracking for compliance and proofreading cycles. |

Every calculator page must render a **Related Tools** section that links both to other pages sharing the same subcategory (discipline axis) and the same cluster (intent axis), alongside any `links_to` slugs from the CSV row. This dual linkage ensures users can dive deeper along the discipline path or stay within their decision-intent funnel.

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

### Tagging requirements

Every page must include the following site verification + tag snippets:

```html
<meta name="google-site-verification" content="GFsI66v_z9aOqTO10A4kDyxfN-ZDtV5Q1r1SCSmQEUc" />
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-EYHHPWND7Z"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-EYHHPWND7Z');
</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9476637732224939"
     crossorigin="anonymous"></script>
```

If the advanced vision is approved, I’ll now create `README-ACTIONSMATRIX-adv.md` detailing actionable steps, owners, and metrics for each strategic focus. Let me know if you want to tweak this narrative first. 
The full tool template lives at `scripts/generate-prompts/templates/tool.txt`, and the Ultimate Guide template sits at `scripts/generate-prompts/templates/article.txt`. The script auto-selects the right template using the CSV’s `content_type`.

### Advanced prompt tooling

Use `node scripts/generate-prompts-adv.js` to output prompts into `generated/prompts-adv/`, then run `node scripts/validate-prompts-adv.js` to ensure each prompt includes its slug/title and, for `content_type = Article`, references the “Ultimate Guide” requirement.
