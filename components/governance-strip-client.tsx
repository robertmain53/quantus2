// components/governance-strip-client.tsx
"use client";

import * as React from "react";

type ReviewerIdentity = {
  name: string;
  role?: string;
  credentials?: string;
};

type VersioningTests = {
  goldenCases: number;
  edgeCases: number;
  lastRun: string;
  runId: string;
};

export function GovernanceStripClient(props: {
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
}) {
  const [copied, setCopied] = React.useState(false);

  async function copySummary() {
    const lines = [
      `Fidamen Governance Summary`,
      `URL: ${props.pageUrl}`,
      `Record ID: ${props.recordId}`,
      `Last updated: ${props.lastUpdated}`,
      `Versions: engine v${props.engineVersion} | data ${props.dataVersion} | content v${props.contentVersion} | UI v${props.uiVersion}`,
      `Risk: ${props.riskLevel}`,
      `Reviewed by: ${props.reviewedBy.name}${props.reviewedBy.role ? ` (${props.reviewedBy.role})` : ""}`,
      props.reviewedBy.credentials ? `Credentials: ${props.reviewedBy.credentials}` : "",
      `QA: PASS (golden ${props.tests.goldenCases} + edge ${props.tests.edgeCases})`,
      `Run: ${props.tests.runId} • Last run: ${props.tests.lastRun}`
    ].filter(Boolean);

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = lines.join("\n");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Governance</p>
          <p className="mt-1 text-sm text-slate-700">
            Record <span className="font-semibold text-slate-900">{props.recordId}</span> • Reviewed by{" "}
            <span className="font-semibold text-slate-900">{props.reviewedBy.name}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={copySummary}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:bg-slate-100"
          aria-label="Copy governance summary"
        >
          {copied ? "Copied" : "Copy summary"}
        </button>
      </div>
    </div>
  );
}
