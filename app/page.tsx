import Link from "next/link";

import { getCategories, getTopCalculators, getUpcomingPublishSchedule } from "@/lib/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  alternates: {
    canonical: "https://cernarus.com/",
  },
};

export default function HomePage() {
  const categories = getCategories().slice(0, 6);
  const topCalculators = getTopCalculators(6);
  const publishSchedule = getUpcomingPublishSchedule().slice(0, 5);

  return (
    <main className="container flex flex-col gap-16 py-16">
      <section className="grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="space-y-6 lg:col-span-7">
          <span className="inline-flex items-center rounded-full bg-surface px-4 py-1 text-sm font-medium text-accent">
            Built for Technical Teams
          </span>
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-body sm:text-5xl">
            Deliver calculators your experts can trust on deadline.
          </h1>
          <p className="text-lg text-muted">
            Cernarus keeps every converter auditable—aligning with published standards,
            documenting methodology, and presenting results in a workflow your engineers,
            analysts, and operators can rely on for real-world decisions.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <div className="rounded-lg border border-base bg-surface px-4 py-2 shadow-sm shadow-soft">
              Versioned methodologies &amp; units
            </div>
            <div className="rounded-lg border border-base bg-surface px-4 py-2 shadow-sm shadow-soft">
              Standards-backed references
            </div>
            <div className="rounded-lg border border-base bg-surface px-4 py-2 shadow-sm shadow-soft">
              Governed release cadence
            </div>
          </div>
        </div>
        <aside className="space-y-6 rounded-2xl border border-base bg-surface p-6 shadow-lg shadow-soft lg:col-span-5">
          <h2 className="text-base font-semibold text-body">
            Upcoming releases (versioned roadmap)
          </h2>
          <ol className="space-y-4 text-sm text-muted">
            {publishSchedule.map((entry) => (
              <li key={entry.path} className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 flex-none rounded-full bg-sky-500" aria-hidden />
                <div className="space-y-1">
                  <span className="font-medium text-body">{entry.title}</span>
                  <p className="text-xs uppercase tracking-wide text-muted">
                    Publishing {formatPublishDate(entry.publishDate)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="font-serif text-2xl font-semibold text-body">
            Disciplines we support
          </h2>
          <Link
            href="/category"
            className="text-sm font-medium text-accent hover:text-accent"
          >
            View all categories
          </Link>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <article
              key={category.slug}
              className="flex h-full flex-col justify-between rounded-2xl border border-base surface p-6 shadow-sm shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="space-y-3">
                <Link
                  href={`/category/${category.slug}`}
                  className="font-serif text-xl font-semibold text-body hover:text-accent"
                >
                  {titleCase(category.label)}
                </Link>
                <p className="text-sm text-muted">
                  {category.subcategories.length} sub clusters ·{" "}
                  {category.calculators.length} experiences
                </p>
              </div>
              <div className="mt-6 space-y-2">
                {category.calculators.slice(0, 3).map((calculator) => (
                  <Link
                    key={calculator.fullPath}
                    href={calculator.fullPath}
                    className="flex flex-col gap-2 rounded-lg border border-transparent bg-surface px-3 py-2 text-sm text-muted transition hover:border-base hover:bg-surface-strong hover:text-body sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="min-w-0 flex-1 text-body">{calculator.title}</span>

                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">
          Browse by Category
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
          <Link
            key={`browse-${category.slug}`}
            href={`/category/${category.slug}`}
            className="block rounded-2xl border border-base surface p-4 text-sm font-semibold text-body transition hover:border-accent hover:text-accent"
          >
            {titleCase(category.label)}
          </Link>
          ))}
        </div>
      </section>
    
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">
            Core converters  
          </h2>
          <p className="text-sm text-slate-500">
            Prioritized by demand  
          </p>
        </div>
        <div className="grid gap-4 rounded-2xl border border-base surface p-6 shadow-sm shadow-soft">
          {topCalculators.map((calculator) => (
            <Link
              key={calculator.fullPath}
              href={calculator.fullPath}
              className="flex flex-col gap-2 rounded-lg border border-transparent bg-surface px-3 py-2 transition hover:border-accent hover:bg-surface-strong"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-body">{calculator.title}</p>
              </div>
              <p className="text-xs uppercase tracking-wide text-muted">
                {calculator.category}
                {calculator.subcategory ? ` · ${calculator.subcategory}` : ""}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function formatTraffic(value: number) {
  if (value >= 1000) {
    return `${Math.round(value / 100) / 10}K`;
  }
  return value.toString();
}

function formatPublishDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
