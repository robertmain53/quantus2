'use client';

interface ReviewerIdentity {
  name: string;
  role?: string;
  credentials?: string;
  scope?: string[];
  signedAt?: string;
}

interface VersioningTests {
  goldenCases: number;
  edgeCases: number;
  lastRun: string;
  runId: string;
}

interface GovernanceStripClientProps {
  recordId: string;
  lastUpdated: string;
  engineVersion: string;
  dataVersion: string;
  contentVersion: string;
  uiVersion: string;
  riskLevel: string;
  reviewedBy: ReviewerIdentity;
  tests: VersioningTests;
  pageUrl: string;
}

export function GovernanceStripClient({
  recordId,
  lastUpdated,
  engineVersion,
  dataVersion,
  contentVersion,
  uiVersion,
  riskLevel,
  reviewedBy,
  tests,
  pageUrl
}: GovernanceStripClientProps) {
  const handleCopy = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    const summary = [
      `Page: ${pageUrl}`,
      `Record ID: ${recordId}`,
      `Last updated: ${lastUpdated}`,
      `Engine v${engineVersion}, Data: ${dataVersion}, Content v${contentVersion}, UI v${uiVersion}`,
      `Risk: ${riskLevel}`,
      `Reviewed by: ${reviewedBy.name}${reviewedBy.role ? ` (${reviewedBy.role})` : ""}`,
      `QA: PASS (golden ${tests.goldenCases}, edge ${tests.edgeCases})`,
      `Run: ${tests.runId} (${tests.lastRun})`
    ].join("\n");
    void navigator.clipboard.writeText(summary);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-700">
          <span>
            <span className="font-semibold">Updated:</span> {lastUpdated}
          </span>
          <span className="text-slate-400" aria-hidden>
            •
          </span>
          <span>
            <span className="font-semibold">QA:</span> PASS (golden {tests.goldenCases}, edge{" "}
            {tests.edgeCases})
          </span>
          <span className="text-slate-400" aria-hidden>
            •
          </span>
          <span>
            <span className="font-semibold">Reviewed by:</span> {reviewedBy.name}
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

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
          Engine v{engineVersion}
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
          Data: {dataVersion}
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
          Content v{contentVersion}
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
          UI v{uiVersion}
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
          Record {recordId}
        </span>
      </div>
    </div>
  );
}
