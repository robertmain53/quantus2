// app/reviewers/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/breadcrumb";
import { getReviewerDirectory } from "@/lib/reviewers";
import { getSiteUrl } from "@/lib/seo";

interface ReviewerPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

export async function generateMetadata(props: ReviewerPageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const reviewer = getReviewerDirectory().bySlug[slug] ?? null;

  if (!reviewer) return {};

  const canonicalUrl = getSiteUrl(`/reviewers/${slug}`);
  const title = `${reviewer.name} — Reviewer Profile`;
  const description = reviewer.role
    ? `${reviewer.name} (${reviewer.role}) reviews Fidamen calculators for accuracy, methodology, and change-control governance.`
    : `${reviewer.name} reviews Fidamen calculators for accuracy, methodology, and change-control governance.`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "profile"
    }
  };
}

export default async function ReviewerProfilePage(props: ReviewerPageProps) {
  const { slug } = await props.params;
  const directory = getReviewerDirectory();
  const reviewer = directory.bySlug[slug] ?? null;

  if (!reviewer) notFound();

  const canonicalUrl = getSiteUrl(`/reviewers/${slug}`);
  const orgId = `${getSiteUrl("/") }#organization`;
  const personId = `${canonicalUrl}#person`;

  const structuredData: Array<Record<string, unknown>> = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": orgId,
      name: "Fidamen",
      url: getSiteUrl("/")
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": personId,
      name: reviewer.name,
      jobTitle: reviewer.role ?? undefined,
      description: reviewer.bio ?? reviewer.credentials ?? undefined,
      url: canonicalUrl,
      worksFor: { "@id": orgId }
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "@id": `${canonicalUrl}#profile`,
      url: canonicalUrl,
      mainEntity: { "@id": personId },
      about: { "@id": personId },
      isPartOf: { "@id": orgId }
    }
  ];

  return (
    <main className="container py-8 sm:py-12 lg:py-16">
      <Breadcrumb
        items={[
          { label: "Reviewers", href: "/reviewers" },
          { label: reviewer.name, href: `/reviewers/${slug}` }
        ]}
      />

      <header className="mt-8 space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-slate-900 sm:text-5xl">
          {reviewer.name}
        </h1>

        {reviewer.role ? (
          <p className="text-lg text-slate-600">{reviewer.role}</p>
        ) : (
          <p className="text-lg text-slate-600">Calculator reviewer</p>
        )}

        {reviewer.credentials ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500">Credentials</p>
            <p className="mt-2 text-base text-slate-700">{reviewer.credentials}</p>
          </div>
        ) : null}

        {reviewer.bio ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500">Biography</p>
            <p className="mt-2 text-base text-slate-700">{reviewer.bio}</p>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-xs uppercase tracking-wide text-slate-500">Review scope</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            {(reviewer.scope ?? [
              "Formula correctness and unit handling",
              "Edge-case validation and rounding policy",
              "Evidence linkage and source hygiene",
              "Change log completeness and semantic versioning discipline"
            ]).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
          <p className="text-xs uppercase tracking-wide text-slate-500">Entity identifiers</p>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Canonical URL:</span> {canonicalUrl}
            </p>
            <p>
              <span className="font-semibold">Person @id:</span> {personId}
            </p>
          </div>
        </div>
      </header>

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  );
}
