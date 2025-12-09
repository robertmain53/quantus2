import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-200">
      <div className="container grid gap-6 py-10 md:grid-cols-[2fr_3fr]">
        <div>
          <p className="text-lg font-semibold">Cernarus</p>
          <p className="text-sm text-slate-400">
            Standards-driven calculators and converters for teams that depend on defensible answers.
          </p>
          <p className="mt-4 text-xs text-slate-500">
            © {new Date().getFullYear()} Cernarus. All rights reserved.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <nav className="text-sm text-slate-300">
            <p className="mb-2 font-semibold text-slate-200">Policies</p>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link href="/about" className="hover:text-white">
                About
              </Link>
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
              <Link href="/cookies" className="hover:text-white">
                Cookies
              </Link>
              <Link href="/sitemap.xml" className="hover:text-white">
                Sitemap
              </Link>
              <Link href="/robots.txt" className="hover:text-white">
                Robots
              </Link>
            </div>
          </nav>
          <div>
            <p className="mb-2 font-semibold text-slate-200">Browse Categories</p>
            <div className="grid gap-2 text-sm text-slate-300">
              <Link href="/category/conversions" className="hover:text-white">
                Conversions
              </Link>
              <Link href="/category/finance" className="hover:text-white">
                Finance
              </Link>
              <Link href="/category/construction" className="hover:text-white">
                Construction
              </Link>
              <Link href="/category/business" className="hover:text-white">
                Business
              </Link>
              <Link href="/category/health" className="hover:text-white">
                Health
              </Link>
              <Link href="/category/lifestyle" className="hover:text-white">
                Lifestyle
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
