import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/breadcrumb";
import { getCategories } from "@/lib/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "All Categories",
  description:
    "Browse all calculator and converter categories on Fidamen, organized by discipline. Find standards-aligned tools for conversions, finance, engineering, health, and more.",
  alternates: {
    canonical: "https://fidamen.com/category",
  },
};

export default function CategoryIndexPage() {
  const categories = getCategories();

  return (
    <main className="container space-y-8 py-8 sm:space-y-10 sm:py-12 lg:space-y-12 lg:py-16">
      <Breadcrumb items={[{ label: "All Categories", href: "/category" }]} />

      <header className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-slate-900">
          All Categories
        </h1>
        <p className="max-w-3xl text-lg text-slate-600">
          Organized by discipline and function. Select a category to access
          individual calculators and converters.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        {categories.map((category) => (
          <article
            key={category.slug}
            className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200"
          >
            <div className="space-y-2">
              <Link
                href={`/category/${category.slug}`}
                className="font-serif text-2xl font-semibold text-slate-900 hover:text-brand"
              >
                {titleCase(category.label)}
              </Link>
              <p className="text-sm text-slate-500">
          {/*      {category.trafficTotal.toLocaleString()} projected daily visits ·{" "} */}
                {category.calculators.length} calculators
              </p>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              {category.subcategories.slice(0, 4).map((subcategory) => (
                <li key={subcategory.slug}>
                  <Link
                    href={`/category/${category.slug}/${subcategory.slug}`}
                    className="hover:text-brand"
                  >
                    {titleCase(subcategory.label)} ({subcategory.calculators.length})
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </main>
  );
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
