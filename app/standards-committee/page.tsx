import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Standards Committee",
  description:
    "Meet the Fidamen Standards Committee responsible for ensuring technical accuracy, methodological rigor, and cross-jurisdictional compliance across all platform calculators.",
  alternates: {
    canonical: "https://fidamen.com/standards-committee",
  },
};

export default function StandardsCommitteePage() {
  return (
    <main className="container space-y-8 py-16">
      <header className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-slate-900">
          Standards Committee
        </h1>
        <p className="max-w-3xl text-lg text-slate-600">
          The Standards Committee oversees the methodological integrity and technical accuracy of
          all Fidamen calculators and conversion tools. Committee members validate engineering
          algorithms, ensure regulatory compliance, and maintain the platform&apos;s commitment to
          precision and reliability.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">
          Committee Members
        </h2>

        <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-xl font-semibold text-slate-900">
                Ugo Candido
              </h3>
              <p className="text-sm font-medium text-slate-500">
                Lead Technologist &amp; Standards Director
              </p>
            </div>

            <div className="space-y-3 text-base text-slate-600">
              <p>
                Leveraging a foundational background in industrial technology and a specialized
                degree in Management Engineering (Materials Science), Ugo Candido directs the
                platform&apos;s architectural and computational integrity. An alumnus of M.I.B.
                Trieste (MBA), he applies rigorous systems engineering methodologies derived from
                extensive tenure as Head of International Projects.
              </p>
              <p>
                Currently CEO of Yeah Up, his functional role as Lead Technologist prioritizes
                high-precision data modeling and cross-jurisdictional compliance. He orchestrates
                the validation of engineering algorithms, ensuring strict adherence to technical
                standards and operational reliability within complex material calculation
                frameworks.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-semibold text-slate-700">Credentials</h4>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>
                  MBA,{" "}
                  <Link
                    href="https://mib.edu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    MIB Trieste School of Management
                  </Link>
                </li>
                <li>
                  Management Engineering (Materials Science),{" "}
                  <Link
                    href="https://www.uniud.it/it"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    University of Udine
                  </Link>
                </li>
                <li>
                  Industrial Technology,{" "}
                  <Link
                    href="https://malignani.edu.it/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    I.S.I.S. Arturo Malignani
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="https://yeahup.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
              >
                Yeah Up
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
              <Link
                href="https://www.linkedin.com/in/ugocandido92821"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
              >
                LinkedIn
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </article>
      </section>

      <section className="space-y-4 text-base text-slate-600">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">
          Committee Responsibilities
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Validation of engineering algorithms and computational methodologies across all
            calculator modules.
          </li>
          <li>
            Ensuring cross-jurisdictional compliance with regional standards and regulatory
            requirements.
          </li>
          <li>
            Oversight of data modeling precision and material calculation frameworks.
          </li>
          <li>
            Maintaining technical documentation and methodology references.
          </li>
          <li>
            Continuous review of platform accuracy, reliability, and operational standards.
          </li>
        </ul>
      </section>
    </main>
  );
}
