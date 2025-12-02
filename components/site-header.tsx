import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";

import { getCategories } from "@/lib/content";
import { SiteSearch } from "@/components/site-search";
import { MobileMenu } from "@/components/mobile-menu";

export function SiteHeader() {
  const categories = getCategories().slice(0, 5);

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="container flex items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Image
            src="/cernarus-logo.png"
            alt="Cernarus"
            width={160}
            height={100}
            priority
            className="h-9 w-auto"
          />
          <span className="sr-only">Cernarus</span>
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
          <div className="hidden text-xs uppercase tracking-wide text-slate-400 2xl:flex 2xl:items-center">
            <span>Standards aligned · audit ready</span>
          </div>
        </div>
        {/* Mobile Menu */}
        <div className="2xl:hidden">
          <MobileMenu categories={categories} />
        </div>
      </div>
    </header>
  );
}
