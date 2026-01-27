import { getCategories, getPublishedCalculators } from "@/lib/content";
import { getSiteUrl } from "@/lib/seo";

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

export async function GET() {
  const categories = getCategories();
  const calculators = getPublishedCalculators();
  const fallbackDate = new Date().toISOString();

  const urls = [
    { loc: getSiteUrl("/"), lastmod: fallbackDate, changefreq: "daily", priority: "1.0" },
    { loc: getSiteUrl("/category"), lastmod: fallbackDate, changefreq: "daily", priority: "0.9" },
    { loc: getSiteUrl("/calculators"), lastmod: fallbackDate, changefreq: "daily", priority: "0.9" },
    ...["/about", "/author", "/terms", "/privacy", "/cookies", "/search"].map((path) => ({
      loc: getSiteUrl(path),
      lastmod: fallbackDate,
      changefreq: "monthly",
      priority: "0.6"
    })),
    ...categories.map((category) => ({
      loc: getSiteUrl(`/category/${category.slug}`),
      lastmod: fallbackDate,
      changefreq: "weekly",
      priority: "0.8"
    })),
    ...calculators.map((calculator) => ({
      loc: getSiteUrl(calculator.fullPath),
      lastmod: calculator.publishDate ?? fallbackDate,
      changefreq: "weekly",
      priority: "0.7"
    }))
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (entry) =>
          `  <url>` +
          `<loc>${xmlEscape(entry.loc)}</loc>` +
          `<lastmod>${xmlEscape(formatDate(entry.lastmod))}</lastmod>` +
          `<changefreq>${entry.changefreq}</changefreq>` +
          `<priority>${entry.priority}</priority>` +
          `</url>`
      )
      .join("\n") +
    `\n</urlset>\n`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600"
    }
  });
}
