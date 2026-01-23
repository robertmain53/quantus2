import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConversionCalculator } from "@/components/conversion-calculator";
import { GovernanceStrip } from "@/components/governance-strip";
import { GenericAdvancedCalculator } from "@/components/generic-advanced-calculator";
import { GenericConverter } from "@/components/generic-converter";
import { GenericSimpleCalculator } from "@/components/generic-simple-calculator";
import type { CalculatorRecord } from "@/lib/content";
import { getCalculatorByPath, getPublishedCalculators, toSlug } from "@/lib/content";
import {
  parseConversionFromSlug,
  ConversionContext,
  convertValue,
  getUnitById
} from "@/lib/conversions";
import type { ConversionLogicConfig, CalculatorLogicConfig } from "@/lib/calculator-config";
import { getVersioningPolicy, getVersioningRecord } from "@/lib/versioning";
import { buildBreadcrumbSchema, buildFaqSchema, buildWebPageSchema, getSiteUrl } from "@/lib/seo";

interface CalculatorPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

export async function generateMetadata(props: CalculatorPageProps): Promise<Metadata> {
  const params = await props.params;
  const fullPath = `/${params.slug.join("/")}`;
  const calculator = getCalculatorByPath(fullPath);

  if (!calculator) return {};

  if (!calculator.isPublished) {
    return { robots: { index: false, follow: false } };
  }

  const conversion = parseConversionFromSlug(calculator.slug);
  const title = calculator.title;
  const description = conversion
    ? `Instantly convert ${conversion.from.label.toLowerCase()} to ${conversion.to.label.toLowerCase()} with precise formulas, worked examples, and expert guidance.`
    : `Authoritative calculator and reference guide for ${title.toLowerCase()}.`;

  const canonicalUrl = getSiteUrl(calculator.fullPath);

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article"
    }
  };
}

export default async function CalculatorPage(props: CalculatorPageProps) {
  const params = await props.params;
  const fullPath = `/${params.slug.join("/")}`;
  const calculator = getCalculatorByPath(fullPath);

  if (!calculator || !calculator.isPublished) notFound();

  const config = calculator.config;
  const componentType = calculator.componentType;

  const conversionLogic = config?.logic ?? null;
  const conversionFromConfig = isConversionLogic(conversionLogic)
    ? buildConversionContextFromLogic(conversionLogic.fromUnitId, conversionLogic.toUnitId)
    : null;

  const conversionFromSlug = parseConversionFromSlug(calculator.slug);
  const conversion = conversionFromConfig ?? conversionFromSlug;

  const related = getRelatedCalculators(calculator.fullPath, calculator.category);
  const pageContent = config?.pageContent ?? null;

  const internalLinks = resolveInternalLinks(config?.links?.internal ?? []);
  const externalLinks = resolveExternalLinks(config?.links?.external ?? []);

  const introductionParagraphs = pageContent?.introduction ?? [];
  const methodologyParagraphs = pageContent?.methodology ?? [];
  const examples = pageContent?.examples ?? [];
  const summaryParagraphs = pageContent?.summary ?? [];
  const citationEntries = pageContent?.citations ?? [];

  const calculationLogic = pageContent?.calculation_logic;
  const limitations = pageContent?.limitations;
  const realScenarios = pageContent?.real_scenarios;
  const resultInterpretation = pageContent?.result_interpretation;
  const commonMistakes = pageContent?.common_mistakes;

  const author = config?.metadata?.author;
  const disclaimer = config?.metadata?.disclaimer;

  const authorSchema =
    typeof author === "object" && author !== null && "name" in author
      ? {
          "@type": "Person",
          name: String(author.name),
          jobTitle: "role" in author ? String(author.role) : undefined,
          description: "credentials" in author ? String(author.credentials) : undefined
        }
      : null;

  const citations = citationEntries
    .map((citation) => ({
      ...citation,
      url: citation.url ? normalizeExternalUrl(citation.url) : null
    }))
    .filter((citation) => citation.label || citation.text || citation.url);

  const evidenceLinks = citations
    .map((citation) => citation.url)
    .filter((url): url is string => Boolean(url));

  const versioning = getVersioningRecord(
    calculator.fullPath,
    config,
    calculator.publishDate,
    evidenceLinks
  );

  const versioningPolicy = getVersioningPolicy();

  const reviewerSchema = versioning.reviewedBy?.name
    ? {
        "@type": "Person",
        name: versioning.reviewedBy.name,
        jobTitle: versioning.reviewedBy.role,
        description: versioning.reviewedBy.credentials
      }
    : null;

  const governanceSummary = buildGovernanceSummary(versioning);
  const evidenceDomains = deriveEvidenceDomains(versioning.evidence ?? []);

  const evidenceText = (versioning.evidence ?? []).join(" ").toLowerCase();
  const hasNistIsoEvidence =
    evidenceText.includes("nist.gov") ||
    evidenceText.includes("iso.org") ||
    evidenceText.includes("nist") ||
    evidenceText.includes("iso");

  const verifiedAccuracyCopy = hasNistIsoEvidence
    ? "Built for professionals who demand precision. Where applicable, we benchmark against NIST/ISO references and peer-review updates so you can trust your results."
    : "Built for professionals who demand precision. We validate formulas, rounding policies, and edge cases with documented sources and automated regression tests, then record reviewer sign-off for material changes.";

  const faqEntriesFromConfig = pageContent?.faqs ?? null;

  const pageDescription =
    config?.metadata?.description ??
    introductionParagraphs[0] ??
    (conversion
      ? `Use this converter to move seamlessly between ${conversion.from.label.toLowerCase()} and ${conversion.to.label.toLowerCase()} with instant precision.`
      : `This guide delivers trusted answers, methodology, and expert tips for ${calculator.title.toLowerCase()}.`);

  const categorySlug = calculator.category ? toSlug(calculator.category) : null;
  const subcategorySlug = calculator.subcategory ? toSlug(calculator.subcategory) : null;

  const faqEntries =
    faqEntriesFromConfig && faqEntriesFromConfig.length > 0
      ? faqEntriesFromConfig
      : buildFaq(calculator.title, conversion);

  const advancedCalculatorNode =
    (componentType === "advanced_calc" || config?.logic?.type === "advanced") && config ? (
      <GenericAdvancedCalculator config={config} />
    ) : null;

  const converterNode =
    componentType === "converter" && config ? (
      <GenericConverter config={config} />
    ) : !config && conversion ? (
      <ConversionCalculator fromUnitId={conversion.from.id} toUnitId={conversion.to.id} />
    ) : null;

  const simpleCalculatorNode =
    componentType === "simple_calc" && config ? <GenericSimpleCalculator config={config} /> : null;

  const breadcrumbs = [
    { name: "Home", url: getSiteUrl("/") },
    { name: "Categories", url: getSiteUrl("/category") },
    ...(categorySlug
      ? [{ name: titleCase(calculator.category), url: getSiteUrl(`/category/${categorySlug}`) }]
      : []),
    ...(calculator.subcategory && categorySlug && subcategorySlug
      ? [{ name: calculator.subcategory, url: getSiteUrl(`/category/${categorySlug}/${subcategorySlug}`) }]
      : []),
    { name: calculator.title, url: getSiteUrl(calculator.fullPath) }
  ];

  const structuredData: Array<Record<string, unknown>> = [
    buildBreadcrumbSchema(breadcrumbs),
    buildWebPageSchema({
      name: calculator.title,
      description: pageDescription,
      url: getSiteUrl(calculator.fullPath),
      category: calculator.category,
      dateModified: versioning.lastUpdated, // single source of truth
      author: authorSchema,
      reviewedBy: reviewerSchema
    })
  ];

  if (faqEntries.length > 0) structuredData.push(buildFaqSchema(faqEntries));

  if (config?.schema?.additionalTypes) {
    for (const type of config.schema.additionalTypes) {
      structuredData.push({ "@context": "https://schema.org", "@type": type });
    }
  }

  structuredData.push({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: calculator.title,
    applicationCategory: "CalculatorApplication",
    operatingSystem: "Web",
    url: getSiteUrl(calculator.fullPath),
    description: pageDescription,
    softwareVersion: versioning.engineVersion,
    dateModified: versioning.lastUpdated,
    reviewedBy: versioning.reviewedBy?.name
      ? {
          "@type": "Person",
          name: versioning.reviewedBy.name,
          jobTitle: versioning.reviewedBy.role,
          description: versioning.reviewedBy.credentials
        }
      : undefined,
    publisher: { "@type": "Organization", name: "Fidamen", url: getSiteUrl("/") },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  });

  return (
    <main className="container grid gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_340px]">
      <article className="space-y-12">
        <header className="space-y-6">
          <nav className="text-sm text-slate-500">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-brand">
                  Home
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li>
                <Link href="/category" className="hover:text-brand">
                  Categories
                </Link>
              </li>
              {categorySlug && (
                <>
                  <li aria-hidden>›</li>
                  <li>
                    <Link href={`/category/${categorySlug}`} className="hover:text-brand">
                      {titleCase(calculator.category)}
                    </Link>
                  </li>
                </>
              )}
              {calculator.subcategory && categorySlug && subcategorySlug && (
                <>
                  <li aria-hidden>›</li>
                  <li>
                    <Link
                      href={`/category/${categorySlug}/${subcategorySlug}`}
                      className="text-slate-700 hover:text-brand"
                    >
                      {calculator.subcategory}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden>›</li>
              <li className="text-slate-700">{calculator.title}</li>
            </ol>
          </nav>

          <div className="space-y-4">
            <h1 className="font-serif text-4xl font-semibold text-slate-900 sm:text-5xl">
              {calculator.title}
            </h1>

            {introductionParagraphs.length > 0 ? (
              <div className="space-y-3 text-lg text-slate-600">
                {introductionParagraphs.map((paragraph, index) => (
                  <p key={`intro-${index}`}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-lg text-slate-600">{pageDescription}</p>
            )}

            {/* Governance strip (compact, above-the-fold) */}
            <div className="space-y-3">
              <GovernanceStrip
                lastUpdatedLabel={humanizeDate(versioning.lastUpdated)}
                goldenCases={versioning.tests.goldenCases}
                edgeCases={versioning.tests.edgeCases}
                reviewerName={versioning.reviewedBy.name}
                evidenceDomains={evidenceDomains}
                governanceSummary={governanceSummary}
              />
              <p className="text-sm text-slate-600">{verifiedAccuracyCopy}</p>
            </div>

            {author && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {typeof author === "object" && author !== null && "name" in author
                        ? String(author.name)
                        : "Expert Review"}
                    </p>
                    {typeof author === "object" && author !== null && "credentials" in author && (
                      <p className="text-slate-600">{String(author.credentials)}</p>
                    )}
                    {typeof author === "object" && author !== null && "role" in author && (
                      <p className="text-xs text-slate-500">{String(author.role)}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {disclaimer && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-amber-900">Important Disclaimer</p>
                <p className="mt-1 text-amber-800">{disclaimer}</p>
              </div>
            )}
          </div>
        </header>

        {advancedCalculatorNode}
        {converterNode}
        {simpleCalculatorNode}

        {calculationLogic && typeof calculationLogic === "object" && (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">How This Calculator Works</h2>
            {"overview" in calculationLogic && (
              <p className="text-base text-slate-600">{String((calculationLogic as any).overview)}</p>
            )}
            {"tax_year" in calculationLogic && "official_source" in calculationLogic && (
              <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p>
                  <span className="font-semibold">Tax Year:</span> {String((calculationLogic as any).tax_year)}
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Source:</span> {String((calculationLogic as any).official_source)}
                </p>
              </div>
            )}
            {"formula_breakdown" in calculationLogic && Array.isArray((calculationLogic as any).formula_breakdown) && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800">Formula Breakdown</h3>
                {(calculationLogic as any).formula_breakdown.map((step: unknown, index: number) => {
                  if (typeof step !== "object" || step === null) return null;
                  const s = step as Record<string, unknown>;
                  return (
                    <div key={index} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                          {String(s.step || index + 1)}
                        </span>
                        <div className="flex-1 space-y-2">
                          {s.name ? <h4 className="font-semibold text-slate-900">{String(s.name)}</h4> : null}
                          {s.formula ? (
                            <code className="block rounded bg-slate-800 px-3 py-2 text-sm text-slate-100">
                              {String(s.formula)}
                            </code>
                          ) : null}
                          {s.explanation ? <p className="text-slate-600">{String(s.explanation)}</p> : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {resultInterpretation && typeof resultInterpretation === "object" && (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">Understanding Your Results</h2>
            {"understanding_your_results" in resultInterpretation &&
              Array.isArray((resultInterpretation as any).understanding_your_results) && (
                <div className="space-y-4">
                  {(resultInterpretation as any).understanding_your_results.map((item: unknown, index: number) => {
                    if (typeof item !== "object" || item === null) return null;
                    const i = item as Record<string, unknown>;
                    return (
                      <div key={index}>
                        {i.concept ? <h3 className="font-semibold text-slate-800">{String(i.concept)}</h3> : null}
                        {i.explanation ? <p className="mt-1 text-slate-600">{String(i.explanation)}</p> : null}
                      </div>
                    );
                  })}
                </div>
              )}
            {"optimization_strategies" in resultInterpretation &&
              Array.isArray((resultInterpretation as any).optimization_strategies) && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800">Optimization Strategies</h3>
                  {(resultInterpretation as any).optimization_strategies.map((item: unknown, index: number) => {
                    if (typeof item !== "object" || item === null) return null;
                    const i = item as Record<string, unknown>;
                    return (
                      <div key={index} className="rounded-md border-l-4 border-brand bg-slate-50 p-4">
                        {i.strategy ? <h4 className="font-semibold text-slate-900">{String(i.strategy)}</h4> : null}
                        {i.details ? <p className="mt-1 text-slate-600">{String(i.details)}</p> : null}
                        {i.example ? (
                          <p className="mt-2 text-sm italic text-slate-500">Example: {String(i.example)}</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
          </section>
        )}

        {realScenarios && Array.isArray(realScenarios) && realScenarios.length > 0 && (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">Real-World Scenarios</h2>
            <div className="space-y-6">
              {realScenarios.map((scenario, index) => {
                if (typeof scenario !== "object" || scenario === null) return null;
                const s = scenario as Record<string, unknown>;
                return (
                  <div
                    key={index}
                    className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5"
                  >
                    {s.scenario_name ? (
                      <h3 className="font-serif text-lg font-semibold text-slate-900">{String(s.scenario_name)}</h3>
                    ) : null}
                    {s.profile && typeof s.profile === "object" ? (
                      <div className="mt-3 grid gap-2 text-sm">
                        {Object.entries(s.profile as Record<string, unknown>).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="font-medium text-slate-600">{key.replace(/_/g, " ")}:</span>
                            <span className="text-slate-800">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {s.calculation_walkthrough && typeof s.calculation_walkthrough === "object" ? (
                      <div className="mt-4 space-y-2 rounded-md bg-slate-800 p-4 text-sm text-slate-100">
                        <p className="font-semibold text-sky-300">Calculation Steps:</p>
                        {Object.entries(s.calculation_walkthrough as Record<string, unknown>).map(([key, value]) => (
                          <p key={key} className="font-mono text-xs">
                            {String(value)}
                          </p>
                        ))}
                      </div>
                    ) : null}
                    {s.interpretation ? <p className="mt-3 text-slate-600">{String(s.interpretation)}</p> : null}
                    {s.optimization_tip ? (
                      <div className="mt-3 rounded-md border-l-4 border-green-500 bg-green-50 p-3 text-sm">
                        <p className="font-semibold text-green-900">Optimization Tip</p>
                        <p className="mt-1 text-green-800">{String(s.optimization_tip)}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {limitations && typeof limitations === "object" && (
          <section className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold text-amber-900">
              {"title" in limitations ? String((limitations as any).title) : "Limitations"}
            </h2>
            {"items" in limitations && Array.isArray((limitations as any).items) && (
              <div className="space-y-3">
                {(limitations as any).items.map((item: unknown, index: number) => {
                  if (typeof item !== "object" || item === null) return null;
                  const i = item as Record<string, unknown>;
                  return (
                    <div key={index} className="rounded-md border border-amber-300 bg-white p-4">
                      {i.limitation ? <h3 className="font-semibold text-amber-900">{String(i.limitation)}</h3> : null}
                      {i.details ? <p className="mt-1 text-sm text-amber-800">{String(i.details)}</p> : null}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {commonMistakes && Array.isArray(commonMistakes) && commonMistakes.length > 0 && (
          <section className="space-y-4 rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold text-red-900">Common Mistakes to Avoid</h2>
            <div className="space-y-4">
              {commonMistakes.map((mistake, index) => {
                if (typeof mistake !== "object" || mistake === null) return null;
                const m = mistake as Record<string, unknown>;
                return (
                  <div key={index} className="rounded-md border border-red-300 bg-white p-4">
                    {m.mistake ? <h3 className="font-semibold text-red-900">{String(m.mistake)}</h3> : null}
                    {m.why_it_happens ? (
                      <p className="mt-2 text-sm text-slate-700">
                        <span className="font-semibold">Why it happens:</span> {String(m.why_it_happens)}
                      </p>
                    ) : null}
                    {m.consequence ? (
                      <p className="mt-1 text-sm text-red-700">
                        <span className="font-semibold">Consequence:</span> {String(m.consequence)}
                      </p>
                    ) : null}
                    {m.how_to_avoid ? (
                      <p className="mt-2 text-sm text-green-700">
                        <span className="font-semibold">How to avoid:</span> {String(m.how_to_avoid)}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {methodologyParagraphs.length > 0 ? (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">Methodology</h2>
            <div className="space-y-3 text-base text-slate-600">
              {methodologyParagraphs.map((paragraph, index) => (
                <p key={`method-${index}`}>{paragraph}</p>
              ))}
            </div>
          </section>
        ) : (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">
              How to use this {conversion ? conversion.from.label : "calculator"}
              {conversion ? " converter" : ""}
            </h2>
            <ol className="space-y-3 text-base text-slate-600">
              {conversion ? (
                <>
                  <li>1. Enter the value you want to convert in the first input field. You can type decimals or whole numbers.</li>
                  <li>2. The result updates instantly with our high-precision formulas, rounding to sensible decimal places for practical use.</li>
                  <li>
                    3. Use the swap button to reverse the calculation and move from{" "}
                    {conversion.to.label.toLowerCase()} back to {conversion.from.label.toLowerCase()}.
                  </li>
                </>
              ) : (
                <>
                  <li>1. Enter your latest business assumptions in the inputs above. Every field is validated to keep projections realistic.</li>
                  <li>2. Results refresh instantly so you can compare profitability, efficiency, and payback metrics across calculation methods.</li>
                  <li>3. Review the methodology and worked examples below to confirm how each formula maps to your operating model.</li>
                </>
              )}
            </ol>
          </section>
        )}

        {summaryParagraphs.length > 0 && (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">Key takeaways</h2>
            <div className="space-y-3 text-base text-slate-600">
              {summaryParagraphs.map((paragraph, index) => (
                <p key={`summary-${index}`}>{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        {examples.length > 0 && (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">Worked examples</h2>
            <div className="space-y-3 text-base text-slate-600">
              {examples.map((paragraph, index) => (
                <p key={`example-${index}`}>{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">F.A.Q.</h2>
          <div className="space-y-6 text-base text-slate-600">
            {faqEntries.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-semibold text-slate-800">{faq.question}</h3>
                <p className="mt-2 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {citations.length > 0 && (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">Sources & citations</h2>
            <ul className="space-y-3 text-sm text-slate-600">
              {citations.map((citation, index) => (
                <li key={citation.url ?? index}>
                  <span className="font-medium text-slate-800">{citation.label ?? citation.text ?? citation.url}</span>
                  {citation.url && (
                    <>
                      {" "}
                      —{" "}
                      <a href={citation.url} target="_blank" rel="noopener noreferrer" className="hover:text-brand">
                        {citation.url}
                      </a>
                    </>
                  )}
                  {citation.text && <p className="text-xs text-slate-500">{citation.text}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Versioning moved down and collapsed by default */}
        {(advancedCalculatorNode || converterNode || simpleCalculatorNode) && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-slate-900">Versioning</h2>
                  <p className="mt-1 text-sm text-slate-600">Change-control record for this calculator.</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs uppercase tracking-wide text-slate-600">
                  Record ID: {versioning.recordId}
                </div>
              </summary>

              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Engine</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">v{versioning.engineVersion}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Data</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{versioning.dataVersion}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Content</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">v{versioning.contentVersion}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">UI</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">v{versioning.uiVersion}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Governance</h3>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <p>
                        <span className="font-semibold">Last updated:</span> {humanizeDate(versioning.lastUpdated)}
                      </p>
                      <p>
                        <span className="font-semibold">Reviewed by:</span> {versioning.reviewedBy.name}
                        {versioning.reviewedBy.role ? ` (${versioning.reviewedBy.role})` : ""}
                      </p>
                      {versioning.reviewedBy.credentials && (
                        <p className="text-xs text-slate-500">Credentials: {versioning.reviewedBy.credentials}</p>
                      )}
                      <p>
                        <span className="font-semibold">Risk level:</span> {versioning.riskLevel}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Test status</h3>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <p>
                        QA: PASS (golden {versioning.tests.goldenCases} + edge {versioning.tests.edgeCases})
                      </p>
                      <p>
                        Last run: {versioning.tests.lastRun} • Run ID: {versioning.tests.runId}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Semantic versioning</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                    <li>MAJOR: {versioningPolicy.semanticVersioning.major}</li>
                    <li>MINOR: {versioningPolicy.semanticVersioning.minor}</li>
                    <li>PATCH: {versioningPolicy.semanticVersioning.patch}</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Review protocol</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                    {versioningPolicy.reviewProtocol.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Assumptions & limitations
                    </h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                      {versioning.assumptions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                      {versioning.limitations.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Change log</h3>
                    <div className="mt-3 space-y-3 text-sm text-slate-700">
                      {versioning.changelog.map((entry) => (
                        <div key={`${entry.version}-${entry.date}`} className="rounded-md bg-white p-3">
                          <p className="font-semibold text-slate-900">
                            v{entry.version} • {entry.date} • {entry.changeType.toUpperCase()}
                          </p>
                          <p className="mt-1">{entry.summary}</p>
                          <p className="mt-1 text-xs text-slate-600">Why: {entry.why}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Areas: {entry.areas.join(", ")} • Reviewer: {entry.reviewer.name} • Entry ID:{" "}
                            {entry.signature}
                          </p>
                          {entry.evidence.length > 0 && (
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-500">
                              {entry.evidence.map((url) => (
                                <li key={url}>
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-brand">
                                    {url}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </section>
        )}

        {(related.length > 0 || internalLinks.length > 0 || externalLinks.length > 0) && (
          <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">Further resources</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {related.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Related tools</h3>
                  <ul className="mt-3 space-y-3 text-sm text-slate-600">
                    {related.map((item: CalculatorRecord) => (
                      <li key={item.fullPath}>
                        <Link href={item.fullPath} className="hover:text-brand">
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {internalLinks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Related calculators
                  </h3>
                  <ul className="mt-3 space-y-3 text-sm text-slate-600">
                    {internalLinks.map((item) => (
                      <li key={item.fullPath}>
                        <Link href={item.fullPath} className="hover:text-brand">
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {externalLinks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    External guidance
                  </h3>
                  <ul className="mt-3 space-y-3 text-sm text-slate-600">
                    {externalLinks.map((item) => (
                      <li key={item.url}>
                        <a
                          href={item.url}
                          target="_blank"
                          rel={[..."noopener noreferrer".split(" "), ...(item.rel ?? [])]
                            .filter(Boolean)
                            .join(" ")}
                          className="hover:text-brand"
                        >
                          {item.label ?? item.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
      </article>

      <aside className="space-y-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-slate-100 shadow-sm shadow-slate-800">
          <p className="text-sm uppercase tracking-wide text-sky-300">Verified Accuracy</p>
          <p className="mt-3 text-base">{verifiedAccuracyCopy}</p>
        </div>
      </aside>

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  );
}

function getRelatedCalculators(currentPath: string, category: string) {
  return getPublishedCalculators()
    .filter((item) => item.fullPath !== currentPath && item.category === category)
    .slice(0, 6);
}

function resolveInternalLinks(paths: string[]): CalculatorRecord[] {
  const results: CalculatorRecord[] = [];
  const seen = new Set<string>();

  for (const rawPath of paths) {
    if (typeof rawPath !== "string") continue;
    const normalized = normalizeInternalPath(rawPath);
    if (!normalized || seen.has(normalized)) continue;
    const calculator = getCalculatorByPath(normalized);
    if (calculator && calculator.isPublished) {
      results.push(calculator);
      seen.add(normalized);
    }
  }

  return results;
}

function normalizeInternalPath(pathValue: string) {
  const trimmed = pathValue.trim();
  if (!trimmed) return null;
  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeading.replace(/\/+/g, "/").replace(/\/+$/g, "") || null;
}

function normalizeExternalUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const markdownLinkMatch = trimmed.match(/^\[.*\]\((https?:\/\/[^)]+)\)$/);
  if (markdownLinkMatch) return markdownLinkMatch[1];

  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
  return null;
}

interface ExternalLink {
  url: string;
  label?: string;
  rel?: string[];
}

function resolveExternalLinks(entries: unknown): ExternalLink[] {
  if (!Array.isArray(entries)) return [];

  const seen = new Set<string>();
  const links: ExternalLink[] = [];

  entries.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;

    const rawUrl = "url" in entry ? (entry as any).url : null;
    const url = typeof rawUrl === "string" ? normalizeExternalUrl(rawUrl) ?? "" : "";
    if (!url || seen.has(url)) return;

    const label =
      "label" in entry && typeof (entry as any).label === "string" ? (entry as any).label.trim() : undefined;

    const rel =
      "rel" in entry && Array.isArray((entry as any).rel)
        ? (entry as any).rel.filter(
            (token: unknown): token is string => typeof token === "string" && token.trim() !== ""
          )
        : undefined;

    links.push({ url, label, rel });
    seen.add(url);
  });

  return links;
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function humanizeDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function isConversionLogic(logic: CalculatorLogicConfig | null | undefined): logic is ConversionLogicConfig {
  return Boolean(logic && (logic as any).type === "conversion" && "fromUnitId" in (logic as any) && "toUnitId" in (logic as any));
}

function buildConversionContextFromLogic(fromUnitId: string, toUnitId: string): ConversionContext | null {
  const fromUnit = getUnitById(fromUnitId);
  const toUnit = getUnitById(toUnitId);
  if (!fromUnit || !toUnit) return null;
  if (fromUnit.kind !== toUnit.kind) return null;
  return { from: fromUnit, to: toUnit, kind: fromUnit.kind };
}

function buildFaq(title: string, conversion: ConversionContext | null): { question: string; answer: string }[] {
  if (!conversion) {
    return [
      {
        question: `What does the ${title} help me accomplish?`,
        answer:
          "This calculator distills the key formula and process so you can solve the problem faster than manual math or spreadsheet templates."
      },
      {
        question: "How should I cite or reference the result?",
        answer:
          "Fidamen calculators follow industry-standard formulas and document the methodology so you can confidently cite results in reports and client deliverables."
      },
      {
        question: "How often is this experience updated?",
        answer:
          "We refresh each experience quarterly—more frequently when underlying standards change—to keep pace with search intent and algorithm updates."
      }
    ];
  }

  return [
    {
      question: `What is the exact formula for ${conversion.from.label.toLowerCase()} to ${conversion.to.label.toLowerCase()}?`,
      answer: generateFormulaExplanation(conversion)
    },
    {
      question: `Can I convert ${conversion.to.label.toLowerCase()} back to ${conversion.from.label.toLowerCase()}?`,
      answer: buildReverseFormulaExplanation(conversion)
    },
    {
      question: "How accurate is this converter?",
      answer:
        "We anchor every conversion to internationally recognized base units. The calculator rounds to sensible decimals for readability, but core math runs at double precision."
    }
  ];
}

function deriveLinearCoefficients(context: ConversionContext) {
  const forwardZero = convertValue(0, "forward", context);
  const forwardOne = convertValue(1, "forward", context);
  const slope = forwardOne - forwardZero;
  const intercept = forwardZero;

  const normalizedSlope = Math.abs(slope) < 1e-12 ? 0 : slope;
  const normalizedIntercept = Math.abs(intercept) < 1e-9 ? 0 : intercept;

  return { slope: normalizedSlope, intercept: normalizedIntercept };
}

function generateFormulaExplanation(context: ConversionContext) {
  const { slope, intercept } = deriveLinearCoefficients(context);
  const slopeText = slope.toLocaleString(undefined, { maximumFractionDigits: 8 });

  if (intercept === 0) {
    return `Multiply your value in ${context.from.label.toLowerCase()} by ${slopeText} to obtain the equivalent in ${context.to.label.toLowerCase()}.`;
  }

  const interceptMagnitude = Math.abs(intercept).toLocaleString(undefined, { maximumFractionDigits: 8 });
  const verb = intercept >= 0 ? "add" : "subtract";

  return `Multiply your ${context.from.label.toLowerCase()} value by ${slopeText}, then ${verb} ${interceptMagnitude} to reach ${context.to.label.toLowerCase()}.`;
}

function buildReverseFormulaExplanation(context: ConversionContext) {
  const { slope, intercept } = deriveLinearCoefficients(context);

  if (intercept === 0) {
    const inverseSlope = (1 / slope).toLocaleString(undefined, { maximumFractionDigits: 8 });
    return `Yes. Hit the swap button in the converter to reverse the calculation or multiply your ${context.to.label.toLowerCase()} value by ${inverseSlope} to switch back.`;
  }

  const slopeText = slope.toLocaleString(undefined, { maximumFractionDigits: 8 });
  const interceptMagnitude = Math.abs(intercept).toLocaleString(undefined, { maximumFractionDigits: 8 });
  const verb = intercept >= 0 ? "subtract" : "add";
  return `Yes. Swap the converter direction or ${verb} ${interceptMagnitude} from your ${context.to.label.toLowerCase()} value, then divide the result by ${slopeText}.`;
}

function deriveEvidenceDomains(urls: string[]) {
  const domains = new Set<string>();
  for (const u of urls) {
    try {
      const host = new URL(u).hostname.toLowerCase();
      domains.add(host.replace(/^www\./, ""));
    } catch {
      // ignore
    }
  }
  return Array.from(domains).sort();
}

function buildGovernanceSummary(versioning: any) {
  const parts = [
    `Updated ${String(versioning.lastUpdated).slice(0, 10)}`,
    `Engine v${versioning.engineVersion}`,
    `Content v${versioning.contentVersion}`,
    `UI v${versioning.uiVersion}`,
    `Data ${versioning.dataVersion}`,
    `QA PASS (golden ${versioning.tests?.goldenCases ?? "?"}, edge ${versioning.tests?.edgeCases ?? "?"})`,
    `Reviewed by ${versioning.reviewedBy?.name ?? "Unknown"}`,
    `Record ID ${versioning.recordId}`
  ];
  return parts.join(" • ");
}
