import { Suspense } from "react";
import Link from "next/link";

import { getCategories, getTopCalculators } from "@/lib/content";
import { SiteSearch } from "@/components/site-search";
import { MobileMenu, LightweightCalculator } from "@/components/mobile-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const categories = getCategories().slice(0, 5);
  const topCalculators = getTopCalculators(4).map(
    ({ slug, title, category, subcategory }) =>
      ({ slug, title, category, subcategory } as LightweightCalculator)
  );

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="container flex items-center justify-between gap-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-xl font-semibold text-slate-900 no-underline"
        >
          Cernarus
        </Link>
        <div className="flex flex-1 items-center justify-end gap-4">
          {/* Desktop Navigation */}
          <nav className="hidden flex-wrap items-center gap-4 text-sm font-medium text-slate-600 2xl:flex">
            <Link href="/category" className="hover:text-brand no-underline">
              All Categories
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="hover:text-brand no-underline"
              >
                {category.label}
              </Link>
            ))}
          </nav>
          <Suspense fallback={<span className="text-sm text-slate-400">Loading search…</span>}>
            <SiteSearch />
          </Suspense>
          <div className="hidden items-center gap-3 text-xs uppercase tracking-wide text-slate-400 2xl:flex 2xl:items-center">
            <span>Standards aligned · audit ready</span>
            <ThemeToggle />
          </div>
        </div>
        {/* Mobile Menu */}
        <div className="2xl:hidden">
          <MobileMenu categories={categories} calculators={topCalculators} />
        </div>
      </div>
    </header>
  );
}
