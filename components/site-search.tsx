'use client';

import { useSearchParams } from "next/navigation";

export function SiteSearch() {
  const searchParams = useSearchParams();
  const defaultQuery = searchParams?.get("q") ?? "";

  return (
    <form
      action="/search"
      method="get"
      className="flex w-full max-w-sm items-center gap-2"
      role="search"
    >
      <label htmlFor="site-search" className="sr-only">
        Search calculators
      </label>
      <input
        id="site-search"
        name="q"
        type="search"
        defaultValue={defaultQuery}
        placeholder="Search calculators..."
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        aria-label="Search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor">
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      </button>
    </form>
  );
}
