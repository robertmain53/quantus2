import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Quantus",
  description:
    "Learn about Quantus, the enterprise content platform engineered for programmatic SEO growth."
};

export default function AboutPage() {
  return (
    <main className="container space-y-8 py-16">
      <header className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-slate-900">About Quantus</h1>
        <p className="max-w-3xl text-lg text-slate-600">
          Quantus exists to help data-driven teams publish high-performing calculators and
          conversion tools at scale. We blend authoritative data models, structured content, and a
          relentless focus on search intent to deliver growth that compounds.
        </p>
      </header>

      <section className="space-y-4 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">What we believe</h2>
        <p>
          Organic acquisition should be predictable. By pairing a rigorous content taxonomy with a
          modern edge-ready architecture, Quantus empowers SEO and product teams to orchestrate
          thousands of experiences without sacrificing quality or governance.
        </p>
        <p>
          We embrace a &ldquo;programmatic craftsmanship&rdquo; mindset: automate the repeatable,
          obsess over the moments that matter, and treat every experience as a trust signal.
        </p>
      </section>

      <section className="space-y-4 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">How we operate</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Static-first build pipeline with on-demand revalidation for fresh data.</li>
          <li>Centralized governance over schema, internal linking, and release cadence.</li>
          <li>Transparent analytics instrumentation to monitor velocity and quality.</li>
          <li>Editorial tooling that keeps non-technical authors in the driver&apos;s seat.</li>
        </ul>
      </section>
    </main>
  );
}
