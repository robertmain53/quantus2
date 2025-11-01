import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Author Guidelines",
  description:
    "Publishing standards, voice, and workflow expectations for Quantus content authors."
};

export default function AuthorPage() {
  return (
    <main className="container space-y-8 py-16">
      <header className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-slate-900">Author Guidelines</h1>
        <p className="max-w-3xl text-lg text-slate-600">
          These standards keep every calculator trustworthy, consistent, and compliant. Please
          review before submitting new experiences or updating existing ones.
        </p>
      </header>

      <section className="space-y-4 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">Voice &amp; tone</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Lead with clarity. Explain inputs, outputs, and methodology succinctly.</li>
          <li>Adopt a helpful, expert tone—never promotional, never alarmist.</li>
          <li>Support every claim with primary data or industry-standard formulas.</li>
        </ul>
      </section>

      <section className="space-y-4 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">Submission checklist</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Confirm the slug, category, and subcategory match the approved taxonomy.</li>
          <li>Provide schema-ready metadata: title, meta description, FAQs, and imagery.</li>
          <li>Document formulas, units, and authoritative references in the editorial brief.</li>
          <li>Flag any compliance considerations (financial disclaimers, health caveats, etc.).</li>
        </ol>
      </section>

      <section className="space-y-4 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">Review workflow</h2>
        <p>
          Every submission passes through our editorial QA. Expect structural feedback within two
          business days and final publication once legal, data, and SEO sign-offs are complete.
        </p>
      </section>
    </main>
  );
}
