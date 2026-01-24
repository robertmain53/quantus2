import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Fidamen",
  description:
    "Technical specifications for Fidamen: ISO 80000-aligned calculators with edge-cached architecture, weekly updates, and auditable methodology.",
  alternates: {
    canonical: "https://fidamen.com/about",
  },
};

export default function AboutPage() {
  return (
    <main className="container space-y-6 py-8 sm:space-y-8 sm:py-12 lg:py-16">
      <header className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-slate-900">About Fidamen</h1>
        <p className="max-w-3xl text-lg text-slate-600">
          Fidamen is a calculator and unit conversion platform designed for technical professionals.
          The system provides standards-aligned computational tools with documented methodology,
          traceable references, and auditable outputs.
        </p>
      </header>

      <section className="space-y-4 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">System Capabilities</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Compliance Standard:</strong> Conversion factors and formulas aligned with
            ISO 80000 (Quantities and Units) where applicable.
          </li>
          <li>
            <strong>Update Frequency:</strong> Content reviewed and revalidated on a weekly cycle;
            critical corrections deployed within 24 hours.
          </li>
          <li>
            <strong>Architecture:</strong> Edge-cached static generation with on-demand
            revalidation; sub-100ms response times at global points of presence.
          </li>
          <li>
            <strong>Data Governance:</strong> Centralized methodology control with version-tracked
            references and release audit trails.
          </li>
          <li>
            <strong>Precision Handling:</strong> IEEE 754 double-precision arithmetic with
            configurable output rounding per calculator type.
          </li>
          <li>
            <strong>Instrumentation:</strong> Runtime telemetry for accuracy monitoring, usage
            metrics, and error tracking.
          </li>
          <li>
            <strong>Content Pipeline:</strong> Structured authoring workflow with schema
            validation and automated quality checks prior to publication.
          </li>
        </ul>
      </section>

      <section className="space-y-4 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">Technical References</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>ISO 80000-1:2022 — Quantities and units, Part 1: General</li>
          <li>NIST Special Publication 811 — Guide for the Use of the International System of Units</li>
          <li>IEEE 754-2019 — Standard for Floating-Point Arithmetic</li>
        </ul>
      </section>
    </main>
  );
}
