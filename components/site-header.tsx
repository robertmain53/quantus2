import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { getCategories, getTopCalculators } from "@/lib/content";
import { SiteSearch } from "@/components/site-search";
import { MobileMenu, LightweightCalculator } from "@/components/mobile-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const categories = getCategories();
  const popularCalculators = getTopCalculators(20)
    .slice(0, 20)
    .map(
      ({ slug, fullPath, title, category, subcategory }) =>
        ({ slug, fullPath, title, category, subcategory } as LightweightCalculator)
    );

  return (
    <header className="border-b border-base surface surface-soft backdrop-blur text-body">
      <div className="container flex items-center justify-between gap-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-900 no-underline"
          aria-label="Fidamen home"
        >
          <Image
            src="/logo-full.png"
            alt="Fidamen"
            width={200}
            height={133}
            priority
          />
        </Link>
        <div className="flex flex-1 items-center justify-end gap-4">
          {/* Desktop Navigation */}
          <nav className="hidden flex-wrap items-center gap-4 text-sm font-medium text-body xl:flex">
            <Link href="/category" className="hover:text-brand no-underline">
              All Categories
            </Link>
            <Link href="/calculators" className="hover:text-brand no-underline">
              All Calculators
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
          <div className="hidden items-center gap-3 text-xs uppercase tracking-wide text-muted xl:flex xl:items-center">
            <span>Standards aligned · audit ready</span>
            <ThemeToggle />
          </div>
        {/* Mobile Menu */}
        <div className="xl:hidden flex items-center gap-2">
          <ThemeToggle />
          <MobileMenu categories={categories} calculators={popularCalculators} />
        </div>
      </div>
    </header>
  );
}
