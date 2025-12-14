import type { Metadata } from "next";
import Link from "next/link";

import { getCategories, getPublishedCalculators, searchCalculators, toSlug } from "@/lib/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface CalculatorsDirectoryPageProps {
  searchParams: Promise<{ q?: string }>;
}

function normalizeQuery(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

export async function generateMetadata(
  props: CalculatorsDirectoryPageProps
): Promise<Metadata> {
  const { q } = await props.searchParams;
  const query = normalizeQuery(q);

  return {
    title: query ? `All Calculators (search: ${query})` : "All Calculators",
    description:
      "Browse every published calculator and converter on Cernarus, grouped by category and subcluster.",
    alternates: {
      canonical: "https://cernarus.com/calculators"
    },
    robots: query
      ? {
          index: false,
          follow: true
        }
      : undefined
  };
}

export default async function CalculatorsDirectoryPage(
  props: CalculatorsDirectoryPageProps
) {
  const { q } = await props.searchParams;
  const query = normalizeQuery(q);
  const calculators = query ? searchCalculators(query) : getPublishedCalculators();
  const categories = getCategories();

  const calculatorsByCategoryLabel = new Map<string, typeof calculators>();
  for (const calculator of calculators) {
    const list = calculatorsByCategoryLabel.get(calculator.category) ?? [];
    list.push(calculator);
    calculatorsByCategoryLabel.set(calculator.category, list);
  }

  return (
    <main className="container space-y-12 py-16">
      <header className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-slate-900">
          All calculators & converters
        </h1>
        <p className="max-w-3xl text-lg text-slate-600">
          A single directory page that links to every published experience, keeping navigation
          user-friendly while giving crawlers a clear two-click path to deep content.
        </p>
        <form action="/calculators" method="get" className="flex max-w-xl items-center gap-3">
          <label htmlFor="calculator-query" className="sr-only">
            Search calculators
          </label>
          <input
            id="calculator-query"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search (e.g., psi to bar)"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-base text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="submit"
            className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-accent"
          >
            Search
          </button>
        </form>
        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-slate-400">
          <span>{query ? calculators.length : getPublishedCalculators().length} published</span>
          {query && (
            <Link href="/calculators" className="hover:text-brand">
              Clear search
            </Link>
          )}
        </div>
      </header>

      {!query && (
        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">
            Jump to a category
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <a
                key={`jump-${category.slug}`}
                href={`#${category.slug}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-brand hover:text-brand"
              >
                {titleCase(category.label)}
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">
          {query ? "Matching experiences" : "All experiences by category"}
        </h2>

        <div className="space-y-4">
          {(query
            ? Array.from(calculatorsByCategoryLabel.keys()).sort((a, b) => a.localeCompare(b))
            : categories.map((category) => category.label)
          )
            .filter((label) => calculatorsByCategoryLabel.has(label))
            .map((categoryLabel) => {
              const categorySlug = toSlug(categoryLabel);
              const categoryCalculators = calculatorsByCategoryLabel.get(categoryLabel) ?? [];
              const calculatorsBySubcategory = new Map<string, typeof categoryCalculators>();

              for (const calculator of categoryCalculators) {
                const key = calculator.subcategory ?? "General";
                const list = calculatorsBySubcategory.get(key) ?? [];
                list.push(calculator);
                calculatorsBySubcategory.set(key, list);
              }

              return (
                <details
                  key={categorySlug}
                  id={categorySlug}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200"
                >
                  <summary className="cursor-pointer list-none">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="font-serif text-xl font-semibold text-slate-900">
                          {titleCase(categoryLabel)}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {categoryCalculators.length} experiences ·{" "}
                          <Link
                            href={`/category/${categorySlug}`}
                            className="font-medium hover:text-brand"
                          >
                            View category hub
                          </Link>
                        </p>
                      </div>
                      <span className="text-xs uppercase tracking-wide text-slate-400">
                        Expand
                      </span>
                    </div>
                  </summary>

                  <div className="mt-6 space-y-6">
                    {Array.from(calculatorsBySubcategory.entries())
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([subcategoryLabel, items]) => {
                        const subcategorySlug = toSlug(subcategoryLabel);
                        return (
                          <div key={`${categorySlug}-${subcategorySlug}`} className="space-y-3">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                                {subcategoryLabel} ({items.length})
                              </p>
                              {subcategoryLabel !== "General" && (
                                <Link
                                  href={`/category/${categorySlug}/${subcategorySlug}`}
                                  className="text-sm font-medium text-slate-600 hover:text-brand"
                                >
                                  Browse subcategory
                                </Link>
                              )}
                            </div>
                            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {items
                                .slice()
                                .sort((a, b) => b.trafficEstimate - a.trafficEstimate)
                                .map((calculator) => (
                                  <li key={calculator.fullPath}>
                                    <Link
                                      href={calculator.fullPath}
                                      className="block rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-sm text-slate-800 hover:border-brand hover:bg-white hover:text-brand"
                                    >
                                      {calculator.title}
                                    </Link>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        );
                      })}
                  </div>
                </details>
              );
            })}
        </div>
      </section>
    </main>
  );
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

