import Link from "next/link";
import { getSiteUrl } from "@/lib/seo";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Semantic breadcrumb component optimized for:
 * - Accessibility (aria-label, aria-current)
 * - LLM parsing (JSON-LD BreadcrumbList)
 * - Clean structure (CSS separators, no junk nodes)
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length === 0) return null;

  // Build full breadcrumb chain with Home at the start
  const fullItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    ...items,
  ];

  // Generate JSON-LD BreadcrumbList
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: fullItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: getSiteUrl(item.href),
    })),
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
          {fullItems.map((item, index) => {
            const isLast = index === fullItems.length - 1;

            return (
              <li
                key={item.href}
                className={`flex items-center ${index > 0 ? "before:mr-1 before:content-['›'] before:text-slate-400" : ""}`}
              >
                {isLast ? (
                  <span aria-current="page" className="text-slate-700">
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:text-brand">
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
