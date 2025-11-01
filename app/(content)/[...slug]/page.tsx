import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConversionCalculator } from "@/components/conversion-calculator";
import {
  getAllCalculators,
  getCalculatorByPath,
  getCalculatorPaths
} from "@/lib/content";
import {
  parseConversionFromSlug,
  ConversionContext,
  convertValue
} from "@/lib/conversions";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebPageSchema,
  getSiteUrl
} from "@/lib/seo";

interface CalculatorPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  return getCalculatorPaths().map((path) => ({
    slug: path.split("/").filter(Boolean)
  }));
}

export async function generateMetadata(
  props: CalculatorPageProps
): Promise<Metadata> {
  const params = await props.params;
  const fullPath = `/${params.slug.join("/")}`;
  const calculator = getCalculatorByPath(fullPath);

  if (!calculator) {
    return {};
  }

  const conversion = parseConversionFromSlug(calculator.slug);
  const title = calculator.title;
  const description = conversion
    ? `Instantly convert ${conversion.from.label.toLowerCase()} to ${conversion.to.label.toLowerCase()} with precise formulas, worked examples, and expert guidance.`
    : `Authoritative calculator and reference guide for ${title.toLowerCase()}.`;

  return {
    title,
    description,
    alternates: {
      canonical: calculator.fullPath
    },
    openGraph: {
      title,
      description,
      url: calculator.fullPath,
      type: "article"
    }
  };
}

export default async function CalculatorPage(props: CalculatorPageProps) {
  const params = await props.params;
  const fullPath = `/${params.slug.join("/")}`;
  const calculator = getCalculatorByPath(fullPath);

  if (!calculator) {
    notFound();
  }

  const conversion = parseConversionFromSlug(calculator.slug);
  const related = getRelatedCalculators(calculator.fullPath, calculator.category);
  const pageDescription = conversion
    ? `Use this converter to move seamlessly between ${conversion.from.label.toLowerCase()} and ${conversion.to.label.toLowerCase()} with instant precision.`
    : `This guide delivers trusted answers, methodology, and expert tips for ${calculator.title.toLowerCase()}.`;
  const categorySlug = calculator.segments[0] ?? "";
  const subcategorySlug =
    calculator.subcategory && calculator.segments.length > 2
      ? calculator.segments[calculator.segments.length - 2]
      : null;
  const faqEntries = buildFaq(calculator.title, conversion);
  const breadcrumbs = [
    { name: "Home", url: getSiteUrl("/") },
    { name: "Categories", url: getSiteUrl("/category") },
    ...(categorySlug
      ? [
          {
            name: titleCase(calculator.category),
            url: getSiteUrl(`/category/${categorySlug}`)
          }
        ]
      : []),
    ...(calculator.subcategory && subcategorySlug
      ? [
          {
            name: calculator.subcategory,
            url: getSiteUrl(`/category/${categorySlug}/${subcategorySlug}`)
          }
        ]
      : []),
    {
      name: calculator.title,
      url: getSiteUrl(calculator.fullPath)
    }
  ];
  const structuredData = [
    buildBreadcrumbSchema(breadcrumbs),
    buildWebPageSchema({
      name: calculator.title,
      description: pageDescription,
      url: getSiteUrl(calculator.fullPath),
      category: calculator.category,
      dateModified: calculator.publishDate
    }),
    buildFaqSchema(faqEntries)
  ];

  if (conversion) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: calculator.title,
      applicationCategory: "CalculatorApplication",
      operatingSystem: "Web",
      url: getSiteUrl(calculator.fullPath),
      description: pageDescription,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      }
    });
  }

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
              {calculator.subcategory && subcategorySlug && (
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
            <p className="text-lg text-slate-600">{pageDescription}</p>
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-slate-400">
              {calculator.publishDate && (
                <span>Updated {humanizeDate(calculator.publishDate)}</span>
              )}
              <span>{calculator.trafficEstimate.toLocaleString()} projected daily visits</span>
            </div>
          </div>
        </header>

        {conversion && <ConversionCalculator context={conversion} />}

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">
            How to use this {conversion ? conversion.from.label : "calculator"}
            {conversion ? " converter" : ""}
          </h2>
          <ol className="space-y-3 text-base text-slate-600">
            <li>
              1. Enter the value you want to convert in the first input field. You
              can type decimals or whole numbers.
            </li>
            <li>
              2. The result updates instantly with our high-precision formulas,
              rounding to sensible decimal places for practical use.
            </li>
            {conversion ? (
              <li>
                3. Use the swap button to reverse the calculation and move from{" "}
                {conversion.to.label.toLowerCase()} back to{" "}
                {conversion.from.label.toLowerCase()}.
              </li>
            ) : (
              <li>
                3. Review the methodology and worked examples below to understand
                how this calculator operates and when to rely on it.
              </li>
            )}
          </ol>
        </section>

        {conversion && (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <h2 className="font-serif text-2xl font-semibold text-slate-900">
              Conversion formula explained
            </h2>
            <p className="text-base text-slate-600">
              To convert {conversion.from.label.toLowerCase()} to {conversion.to.label.toLowerCase()},
              multiply the input value by the precise conversion factor derived from
              international measurement standards. The formula looks like this:
            </p>
            <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-200">
{formatFormula(conversion)}
            </pre>
            <p className="text-base text-slate-600">
              We compute the factor using the SI base unit as the truth source
              to guarantee accuracy even across chained conversions (e.g., meters →
              feet → inches).
            </p>
          </section>
        )}

        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">
            Expert Q&A
          </h2>
          <div className="space-y-6 text-base text-slate-600">
            {faqEntries.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-semibold text-slate-800">{faq.question}</h3>
                <p className="mt-2 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </article>

      <aside className="space-y-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
          <h2 className="text-base font-semibold text-slate-800">
            Related experiences
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {related.map((item) => (
              <li key={item.fullPath}>
                <Link href={item.fullPath} className="hover:text-brand">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-slate-100 shadow-sm shadow-slate-800">
          <p className="text-sm uppercase tracking-wide text-sky-300">
            Authority signal
          </p>
          <p className="mt-3 text-base">
            This experience belongs to the {calculator.category.toLowerCase()} cluster.
            It is updated according to our SEO playbook and schema governance to keep
            pace with algorithm changes.
          </p>
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
  return getAllCalculators()
    .filter((item) => item.fullPath !== currentPath && item.category === category)
    .slice(0, 6);
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

function buildFaq(
  title: string,
  conversion: ConversionContext | null
): { question: string; answer: string }[] {
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
          "Quantus calculators follow industry-standard formulas and document the methodology so you can confidently cite results in reports and client deliverables."
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

function formatFormula(context: ConversionContext) {
  const { slope, intercept } = deriveLinearCoefficients(context);
  const slopeText = slope.toLocaleString(undefined, { maximumFractionDigits: 8 });

  if (intercept === 0) {
    return `${context.to.symbol} = (${context.from.symbol} × ${slopeText})`;
  }

  const interceptMagnitude = Math.abs(intercept).toLocaleString(undefined, {
    maximumFractionDigits: 8
  });
  const operator = intercept >= 0 ? "+" : "-";

  return `${context.to.symbol} = (${context.from.symbol} × ${slopeText}) ${operator} ${interceptMagnitude}`;
}

function generateFormulaExplanation(context: ConversionContext) {
  const { slope, intercept } = deriveLinearCoefficients(context);
  const slopeText = slope.toLocaleString(undefined, { maximumFractionDigits: 8 });

  if (intercept === 0) {
    return `Multiply your value in ${context.from.label.toLowerCase()} by ${slopeText} to obtain the equivalent in ${context.to.label.toLowerCase()}.`;
  }

  const interceptMagnitude = Math.abs(intercept).toLocaleString(undefined, {
    maximumFractionDigits: 8
  });
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
  const interceptMagnitude = Math.abs(intercept).toLocaleString(undefined, {
    maximumFractionDigits: 8
  });
  const verb = intercept >= 0 ? "subtract" : "add";
  return `Yes. Swap the converter direction or ${verb} ${interceptMagnitude} from your ${context.to.label.toLowerCase()} value, then divide the result by ${slopeText}.`;
}
