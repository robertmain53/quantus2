import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import Script from "next/script";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl } from "@/lib/seo";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cernarus.com"),
  title: {
    default: "Cernarus | Precision Converters & Calculators",
    template: "%s | Cernarus"
  },
  description:
    "Cernarus delivers authoritative calculators and unit converters for engineers, analysts, and operations teams who need standards-aligned answers.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cernarus.com",
    siteName: "Cernarus",
    title: "Cernarus | Precision Converters & Calculators",
    description:
      "Explore expertly crafted calculators and conversion tools optimized for accuracy, auditability, and day-to-day professional workflows."
  },
  twitter: {
    card: "summary_large_image",
    creator: "@cernarus",
    title: "Cernarus | Precision Converters & Calculators",
    description:
      "Enterprise-ready calculators and conversion tools designed for dependable decision support."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1
    }
  },
  verification: {
    google: [
      "L8cjnu8Ss2mqEu4EJMXWaWjnQeh8RNCwbQ891JT54LQ",
      "nHTljtqRum0afb01lKamYJNLndVCogkYWBc6KQT63zA"
    ]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const siteUrl = getSiteUrl();
  const rootStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Cernarus",
      url: siteUrl,
      sameAs: []
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Cernarus",
      url: siteUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    }
  ];

  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif.variable} scroll-smooth`}
    >
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9476637732224939"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-N3DCDYC7T1" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-N3DCDYC7T1');
          `}
        </Script>
      </head>
      <body className="bg-slate-50 text-slate-900">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootStructuredData) }}
        />
      </body>
    </html>
  );
}
