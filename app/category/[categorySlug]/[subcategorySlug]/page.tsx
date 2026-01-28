import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/breadcrumb";
import { getSubcategoryBySlug, getCategoryBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SubcategoryPageProps {
  params: Promise<{
    categorySlug: string;
    subcategorySlug: string;
  }>;
}

export async function generateMetadata(
  props: SubcategoryPageProps
): Promise<Metadata> {
  const params = await props.params;
  const lookup = getSubcategoryBySlug(params.categorySlug, params.subcategorySlug);

  if (!lookup) {
    return {};
  }

  const { category, subcategory } = lookup;
  const categoryTitle = titleCase(category.label);
  const subcategoryTitle = titleCase(subcategory.label);
  const calculatorCount = subcategory.calculators.length;

  return {
    title: `${subcategoryTitle} Calculators & Tools – ${categoryTitle} | Fidamen`,
    description: `${calculatorCount} standards-aligned ${subcategoryTitle.toLowerCase()} calculators with documented methodology, traceable references, and auditable outputs. Part of the ${categoryTitle} toolkit for technical professionals.`,
    alternates: {
      canonical: `/category/${category.slug}/${subcategory.slug}`
    }
  };
}

export default async function SubcategoryPage(props: SubcategoryPageProps) {
  const params = await props.params;
  const lookup = getSubcategoryBySlug(params.categorySlug, params.subcategorySlug);

  if (!lookup) {
    notFound();
  }

  const { category, subcategory } = lookup;
  const calculators = subcategory.calculators;

  // Get sibling subcategories for cross-navigation
  const fullCategory = getCategoryBySlug(params.categorySlug);
  const siblingSubcategories = fullCategory?.subcategories.filter(
    (s) => s.slug !== subcategory.slug
  ).slice(0, 4) ?? [];

  return (
    <main className="container space-y-8 py-8 sm:space-y-10 sm:py-12 lg:space-y-12 lg:py-16">
      <Breadcrumb
        items={[
          { label: "All Categories", href: "/category" },
          { label: titleCase(category.label), href: `/category/${category.slug}` },
          { label: titleCase(subcategory.label), href: `/category/${category.slug}/${subcategory.slug}` },
        ]}
      />

      <header className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-slate-900 sm:text-5xl">
          {titleCase(subcategory.label)} Calculators
        </h1>
        <p className="max-w-3xl text-lg text-slate-600">
          {calculators.length} specialized tools for {subcategory.label.toLowerCase()} calculations.
          Each calculator documents its methodology, references authoritative sources, and provides
          auditable outputs suitable for professional use.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            {calculators.length} tools
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            {titleCase(category.label)}
          </span>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">
            Standards-aligned
          </span>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          What these calculators provide
        </h2>
        <ul className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 flex-none rounded-full bg-sky-500" aria-hidden />
            Documented formulas with source references
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 flex-none rounded-full bg-sky-500" aria-hidden />
            Version-controlled methodology updates
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 flex-none rounded-full bg-sky-500" aria-hidden />
            Edge-case validation and rounding rules
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 flex-none rounded-full bg-sky-500" aria-hidden />
            Reviewer sign-off and change logs
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 flex-none rounded-full bg-sky-500" aria-hidden />
            IEEE 754 double-precision arithmetic
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 flex-none rounded-full bg-sky-500" aria-hidden />
            Professional-grade output formatting
          </li>
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">
          Available {titleCase(subcategory.label)} Tools
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {calculators.map((calculator) => (
            <Link
              key={calculator.slug}
              href={calculator.fullPath}
              className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand hover:shadow-md"
            >
              <h3 className="font-semibold text-slate-900 group-hover:text-brand">
                {calculator.title}
              </h3>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                {subcategory.label}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {siblingSubcategories.length > 0 && (
        <section className="space-y-4 border-t border-slate-200 pt-8">
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            Other {titleCase(category.label)} Categories
          </h2>
          <div className="flex flex-wrap gap-3">
            {siblingSubcategories.map((sibling) => (
              <Link
                key={sibling.slug}
                href={`/category/${category.slug}/${sibling.slug}`}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand hover:text-brand"
              >
                {titleCase(sibling.label)}
                <span className="ml-1.5 text-slate-400">({sibling.calculators.length})</span>
              </Link>
            ))}
            <Link
              href={`/category/${category.slug}`}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              View all →
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
