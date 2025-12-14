"use client";

import { useState } from "react";
import Link from "next/link";

export interface LightweightCalculator {
  slug: string;
  title: string;
  category: string;
  subcategory: string | null;
}

interface MobileMenuProps {
  categories: Array<{ slug: string; label: string }>;
  calculators: LightweightCalculator[];
}

export function MobileMenu({ categories, calculators }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-[73px] z-40 bg-black/20 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <nav className="absolute left-0 right-0 top-full z-50 border-b border-slate-200 bg-white p-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="container flex flex-col gap-3">
              <Link
                href="/category"
                className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-brand transition-colors no-underline"
                onClick={() => setIsOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/calculators"
                className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-brand transition-colors no-underline"
                onClick={() => setIsOpen(false)}
              >
                All Calculators
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-brand transition-colors no-underline"
                  onClick={() => setIsOpen(false)}
                >
                  {category.label}
                </Link>
              ))}
              {calculators.length > 0 && (
                <>
                  <div className="mt-2 border-t border-slate-200 pt-2 text-xs uppercase tracking-wide text-slate-400">
                    Popular calculators
                  </div>
                  {calculators.slice(0, 10).map((calculator) => (
                    <Link
                      key={calculator.slug}
                      href={calculator.slug}
                      className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-brand transition-colors no-underline"
                      onClick={() => setIsOpen(false)}
                    >
                      {calculator.title}
                    </Link>
                  ))}
                  <Link
                    href="/calculators"
                    className="block rounded-md px-3 py-2 text-sm font-semibold text-brand hover:bg-slate-100 transition-colors no-underline"
                    onClick={() => setIsOpen(false)}
                  >
                    View All Calculators
                  </Link>
                </>
              )}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
