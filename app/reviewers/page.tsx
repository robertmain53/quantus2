// app/reviewers/page.tsx
import Link from "next/link";
import { getReviewerDirectory } from "@/lib/reviewers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ReviewersIndexPage() {
  const directory = getReviewerDirectory();
  const seeded = Object.values(directory.bySlug).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="container py-16">
      <header className="space-y-3">
        <h1 className="font-serif text-4xl font-semibold text-slate-900">Reviewers</h1>
        <p className="text-slate-600">
          Canonical reviewer profiles used as entities in structured data and change-control governance.
        </p>
      </header>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200">
        {seeded.length === 0 ? (
          <p className="text-sm text-slate-600">
            No reviewers have been explicitly listed yet. Add profiles in <code className="font-mono">lib/reviewers.ts</code>.
          </p>
        ) : (
          <ul className="space-y-3 text-sm text-slate-700">
            {seeded.map((r) => (
              <li key={r.slug} className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/reviewers/${r.slug}`} className="font-semibold hover:text-brand">
                  {r.name}
                </Link>
                <span className="text-slate-500">{r.role ?? "Reviewer"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
