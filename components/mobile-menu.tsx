"use client";

import { useState } from "react";
import Link from "next/link";

interface MobileMenuProps {
  categories: Array<{ slug: string; label: string }>;
}

export function MobileMenu({ categories }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
            className="fixed inset-0 top-[73px] z-40 bg-black/20 animate-in fade-in duration-200 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <nav className="absolute left-0 right-0 top-full z-50 border-b border-slate-200 bg-white p-4 shadow-lg animate-in slide-in-from-top-2 duration-200 md:hidden">
            <div className="container flex flex-col gap-3">
              <Link
                href="/category"
                className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-brand transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Categories
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-brand transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
