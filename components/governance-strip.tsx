'use client';

interface GovernanceStripProps {
  lastUpdatedLabel: string;
  goldenCases: number;
  edgeCases: number;
  reviewerName: string;
  evidenceDomains: string[];
  governanceSummary: string;
}

export function GovernanceStrip({
  lastUpdatedLabel,
  goldenCases,
  edgeCases,
  reviewerName,
  evidenceDomains,
  governanceSummary
}: GovernanceStripProps) {
  const handleCopy = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    void navigator.clipboard.writeText(governanceSummary);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-700">
          <span>
            <span className="font-semibold">Updated:</span> {lastUpdatedLabel}
          </span>
          <span className="text-slate-400" aria-hidden>
            •
          </span>
          <span>
            <span className="font-semibold">QA:</span> PASS (golden {goldenCases}, edge{" "}
            {edgeCases})
          </span>
          <span className="text-slate-400" aria-hidden>
            •
          </span>
          <span>
            <span className="font-semibold">Reviewed by:</span> {reviewerName}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:border-slate-400"
        >
          Copy governance summary
        </button>
      </div>

      {evidenceDomains.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {evidenceDomains.slice(0, 6).map((domain) => (
            <span
              key={domain}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600"
            >
              {domain}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
