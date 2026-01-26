import type { Metadata } from "next";

import { Breadcrumb } from "@/components/breadcrumb";

export const metadata: Metadata = {
  title: "Calculation Standards Policy",
  description:
    "Fidamen's calculation standards policy: NIST-based unit conversions, timely financial formula updates, and strict user privacy.",
  alternates: {
    canonical: "https://fidamen.com/standards-policy",
  },
};

export default function StandardsPolicyPage() {
  return (
    <main className="container space-y-6 py-8 sm:space-y-8 sm:py-12 lg:py-16">
      <Breadcrumb items={[{ label: "Calculation Standards Policy", href: "/standards-policy" }]} />

      <header className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-slate-900">
          Calculation Standards Policy
        </h1>
        <p className="max-w-3xl text-lg text-slate-600">
          Every formula and conversion factor on Fidamen is held to documented standards. This policy
          outlines the authoritative sources, update commitments, and privacy guarantees that govern
          all calculations.
        </p>
        <p className="text-sm text-slate-500">Effective: January 2025</p>
      </header>

      <section className="space-y-3 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">Unit Conversions</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            All unit conversions are based on <strong>NIST Handbook 44 (2025 Edition)</strong>.
          </li>
          <li>
            Conversion factors are updated when NIST publishes revisions; changes are logged in
            release notes.
          </li>
          <li>Where NIST does not define a conversion, ISO 80000 serves as the fallback reference.</li>
        </ul>
      </section>

      <section className="space-y-3 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">Financial Formulas</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Tax and financial calculators are updated within <strong>48 hours</strong> of IRS
            Revenue Procedure publications.
          </li>
          <li>
            Each affected calculator displays the applicable tax year and the date of last revision.
          </li>
          <li>Historical versions remain accessible for audit and comparison purposes.</li>
        </ul>
      </section>

      <section className="space-y-3 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">User Privacy</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>User inputs are not tracked, stored, or logged.</strong>
          </li>
          <li>Calculations execute entirely in the browser; no input data is transmitted to servers.</li>
          <li>
            Analytics are limited to page views and general usage patterns—never calculation values.
          </li>
        </ul>
      </section>

      <section className="space-y-3 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">Reporting Errors</h2>
        <p>
          If a calculation appears inconsistent with the stated reference, report it to{" "}
          <a href="mailto:fidamen@yeahup.net" className="text-accent hover:underline">
            fidamen@yeahup.net
          </a>
          . Confirmed errors are corrected within 24 hours and disclosed in the changelog.
        </p>
      </section>
    </main>
  );
}
