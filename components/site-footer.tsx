import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-base surface-strong text-body">
      <div className="container grid gap-6 py-10 md:grid-cols-[2fr_3fr]">
        <div className="space-y-2">
          <p className="text-lg font-semibold">Cernarus</p>
          <p className="text-sm text-muted">
            Standards-driven calculators and converters for teams that depend on defensible answers.
          </p>
          <p className="mt-4 text-xs text-muted">
            © {new Date().getFullYear()} Cernarus. All rights reserved.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <nav>
            <p className="mb-2 font-semibold text-body">Policies</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
              <Link href="/calculators" className="hover:text-accent">
                All Calculators
              </Link>
              <Link href="/about" className="hover:text-accent">
                About
              </Link>
              <Link href="/privacy" className="hover:text-accent">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-accent">
                Terms
              </Link>
              <Link href="/cookies" className="hover:text-accent">
                Cookies
              </Link>
              <Link href="/sitemap.xml" className="hover:text-accent">
                Sitemap
              </Link>
              <Link href="/robots.txt" className="hover:text-accent">
                Robots
              </Link>
            </div>
          </nav>
          <div>
            <p className="mb-2 font-semibold text-body">Browse Categories</p>
            <div className="grid gap-4 text-sm text-muted">
              <Link href="/category/conversions" className="hover:text-accent">
                Conversions
              </Link>
              <Link href="/category/finance" className="hover:text-accent">
                Finance
              </Link>
              <Link href="/category/construction" className="hover:text-accent">
                Construction
              </Link>
              <Link href="/category/business" className="hover:text-accent">
                Business
              </Link>
              <Link href="/category/health" className="hover:text-accent">
                Health
              </Link>
              <Link href="/category/lifestyle" className="hover:text-accent">
                Lifestyle
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
