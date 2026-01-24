const DEFAULT_SITE_URL = "https://fidamen.com";

export function getSiteUrl(pathname = "/") {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
  return new URL(pathname, base).toString();
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

export function buildWebPageSchema(options: {
  name: string;
  description: string;
  url: string;
  category?: string;
  dateModified?: string | null;
  author?: Record<string, unknown> | null;
  reviewedBy?: Record<string, unknown> | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: options.name,
    description: options.description,
    url: options.url,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: "Fidamen",
      url: getSiteUrl()
    },
    about: options.category,
    dateModified: options.dateModified ?? undefined,
    author: options.author ?? undefined,
    reviewedBy: options.reviewedBy ?? undefined
  };
}

/**
 * Generates a JSON-LD schema of type SoftwareApplication for calculator tools.
 * @param toolName - The name of the calculator tool
 * @param description - A description of what the calculator does
 * @param category - The application category (e.g., "FinanceApplication", "HealthApplication")
 * @returns A valid JSON-LD object conforming to schema.org/SoftwareApplication
 */
export function generateCalculatorSchema(
  toolName: string,
  description: string,
  category: string
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: toolName,
    description: description,
    applicationCategory: category,
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    provider: {
      "@type": "Organization",
      name: "Fidamen",
      url: getSiteUrl()
    },
    featureList: [
      "Standards-aligned calculations",
      "Documented methodology",
      "Auditable outputs"
    ],
    softwareVersion: "1.0",
    applicationSubCategory: "Calculator"
  };
}
