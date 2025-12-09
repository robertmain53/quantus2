import { Suspense } from "react";
import Link from "next/link";

import { getCategories, getTopCalculators } from "@/lib/content";
import { SiteSearch } from "@/components/site-search";
import { MobileMenu, LightweightCalculator } from "@/components/mobile-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const categories = getCategories().slice(0, 5);
  const popularCalculators = getTopCalculators(20)
    .slice(0, 20)
    .map(
      ({ slug, title, category, subcategory }) =>
        ({ slug, title, category, subcategory } as LightweightCalculator)
    );

  return (
    <header className="border-b border-base surface surface-soft backdrop-blur">
      <div className="container flex items-center justify-between gap-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-xl font-semibold text-slate-900 no-underline"
        >
          Cernarus
        </Link>
        <div className="flex flex-1 items-center justify-end gap-4">
          {/* Desktop Navigation */}
          <nav className="hidden flex-wrap items-center gap-4 text-sm font-medium text-body 2xl:flex">
            <Link href="/category" className="hover:text-brand no-underline">
              All Categories
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="hover:text-accent no-underline"
              >
                {category.label}
              </Link>
            ))}
          </nav>
          <Suspense fallback={<span className="text-sm text-slate-400">Loading search…</span>}>
            <SiteSearch />
          </Suspense>
        </div>
          <div className="hidden items-center gap-3 text-xs uppercase tracking-wide text-muted 2xl:flex 2xl:items-center">
            <span>Standards aligned · audit ready</span>
            <ThemeToggle />
          </div>
        {/* Mobile Menu */}
        <div className="2xl:hidden flex items-center gap-2">
          <ThemeToggle />
          <MobileMenu categories={categories} calculators={popularCalculators} />
        </div>
      </div>
    </header>
  );
}
