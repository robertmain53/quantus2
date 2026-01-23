import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import type { CalculatorConfig } from "@/lib/calculator-config";

export interface VersioningPolicy {
  semanticVersioning: {
    major: string;
    minor: string;
    patch: string;
  };
  reviewProtocol: string[];
}

export interface VersioningTests {
  goldenCases: number;
  edgeCases: number;
  lastRun: string;
  runId: string;
}

export interface ReviewerIdentity {
  name: string;
  role?: string;
  credentials?: string;
}

export interface ChangelogEntry {
  version: string;
  date: string; // ISO date preferred (YYYY-MM-DD or full ISO)
  changeType: "major" | "minor" | "patch";
  areas: string[];
  summary: string;
  why: string;
  reviewer: ReviewerIdentity;
  evidence: string[];
  riskLevel: string;
  tests: VersioningTests;

  // derived
  signature: string; // short display id
  entryHash?: string; // full sha256 (optional but recommended)
}

export interface VersioningRecord {
  engineVersion: string;
  dataVersion: string;
  contentVersion: string;
  uiVersion: string;
  changeType: "major" | "minor" | "patch";
  lastUpdated: string;
  reviewedBy: ReviewerIdentity;
  riskLevel: string;
  tests: VersioningTests;
  assumptions: string[];
  limitations: string[];
  evidence: string[];
  changelog: ChangelogEntry[];

  // derived
  recordId: string;     // short display id
  recordHash?: string;  // full sha256 (recommended)
  buildCommit?: string; // git sha if available
}

interface VersioningDefaults {
  engineVersion: string;
  dataVersion: string;
  contentVersion: string;
  uiVersion: string;
  changeType: "major" | "minor" | "patch";
  reviewedBy: ReviewerIdentity;
  riskLevel: string;
  tests: VersioningTests;
  assumptions: string[];
  limitations: string[];
  evidence: string[];
}

interface VersioningConfig {
  policy: VersioningPolicy;
  defaults: VersioningDefaults;
  records: Record<string, Partial<VersioningRecord>>;
}

let cache: VersioningConfig | null = null;

function loadConfig(): VersioningConfig {
  if (cache) return cache;
  const filePath = path.join(process.cwd(), "data", "versioning.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  cache = JSON.parse(raw) as VersioningConfig;
  return cache;
}

export function getVersioningPolicy(): VersioningPolicy {
  return loadConfig().policy;
}

/** Canonical JSON serialization: stable ordering across environments/refactors. */
function stableStringify(value: unknown): string {
  const seen = new WeakSet<object>();

  const helper = (v: any): any => {
    if (v === null || typeof v !== "object") return v;

    if (v instanceof Date) return v.toISOString();

    if (seen.has(v)) {
      // Avoid cycles; should not happen in our records, but keep deterministic behavior.
      return "[Circular]";
    }
    seen.add(v);

    if (Array.isArray(v)) {
      return v.map(helper);
    }

    const keys = Object.keys(v).sort();
    const out: Record<string, any> = {};
    for (const k of keys) out[k] = helper(v[k]);
    return out;
  };

  return JSON.stringify(helper(value));
}

function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function normalizeEvidence(urls: string[]): string[] {
  const cleaned = urls
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter(Boolean)
    // Optional: keep only http(s). If you want to allow other schemes, remove this.
    .filter((u) => u.startsWith("https://") || u.startsWith("http://"))
    .map((u) => u.replace(/\s+/g, " "))
    .map((u) => u.replace(/#.*$/, "")); // drop fragments to reduce churn
  return Array.from(new Set(cleaned)).sort();
}

function normalizeDate(input: string): string {
  // If you always store ISO dates already, you can simplify.
  // Here we try to ensure deterministic output.
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input; // preserve as-is if invalid
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getBuildCommit(): string | undefined {
  return (
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.GITHUB_SHA ??
    process.env.COMMIT_SHA ??
    undefined
  );
}

export function getVersioningRecord(
  fullPath: string,
  config: CalculatorConfig | null,
  publishDate: string | null,
  evidenceFromPage: string[] = []
): VersioningRecord {
  const { defaults, records } = loadConfig();
  const override = records[fullPath] ?? {};

  const metadataUpdated = config?.metadata?.lastUpdated ?? null;
  const fallbackDate = metadataUpdated ?? publishDate ?? new Date().toISOString();
  const lastUpdated = normalizeDate(String(override.lastUpdated ?? fallbackDate));

  const reviewedBy = override.reviewedBy ?? defaults.reviewedBy;

  // Evidence: prefer explicit override, else citations-derived, else defaults.
  const evidenceRaw =
    override.evidence ??
    (evidenceFromPage.length > 0 ? evidenceFromPage : defaults.evidence);

  const evidence = normalizeEvidence(evidenceRaw);

  const tests = override.tests ?? defaults.tests;
  const assumptions = override.assumptions ?? defaults.assumptions;
  const limitations = override.limitations ?? defaults.limitations;

  // Allow future separation if you add config.versioning.*
  const engineVersion =
    override.engineVersion ??
    (config as any)?.versioning?.engineVersion ??
    config?.version ??
    defaults.engineVersion;

  const contentVersion =
    override.contentVersion ??
    (config as any)?.versioning?.contentVersion ??
    config?.version ??
    defaults.contentVersion;

  const uiVersion =
    override.uiVersion ??
    (config as any)?.versioning?.uiVersion ??
    defaults.uiVersion;

  const dataVersion =
    override.dataVersion ??
    (config as any)?.versioning?.dataVersion ??
    config?.metadata?.taxYearBasis ??
    defaults.dataVersion;

  const changeType = override.changeType ?? defaults.changeType;
  const riskLevel = override.riskLevel ?? defaults.riskLevel;

  const buildCommit = getBuildCommit();

  const rawChangelog = override.changelog ?? [
    {
      version: engineVersion,
      date: lastUpdated,
      changeType,
      areas: ["engine", "content", "ui"],
      summary: "Initial publication and governance baseline.",
      why: "Published with reviewed formulas, unit definitions, and UX controls.",
      reviewer: reviewedBy,
      evidence,
      riskLevel,
      tests
    }
  ];

  // Deterministic ordering: newest first.
  const orderedChangelog = [...rawChangelog].sort((a, b) => {
    const ad = normalizeDate(String(a.date));
    const bd = normalizeDate(String(b.date));
    return bd.localeCompare(ad);
  });

  const changelog: ChangelogEntry[] = orderedChangelog.map((entry) => {
    const canonicalEntry = {
      fullPath,
      buildCommit: buildCommit ?? null,
      entry: {
        ...entry,
        date: normalizeDate(String(entry.date)),
        evidence: normalizeEvidence(entry.evidence ?? evidence)
      }
    };

    const entryHash = sha256Hex(stableStringify(canonicalEntry));
    return {
      ...entry,
      date: normalizeDate(String(entry.date)),
      evidence: normalizeEvidence(entry.evidence ?? evidence),
      entryHash,
      signature: entryHash.slice(0, 12)
    };
  });

  const recordBase = {
    fullPath,
    buildCommit: buildCommit ?? null,
    engineVersion,
    dataVersion,
    contentVersion,
    uiVersion,
    lastUpdated,
    changeType,
    reviewedBy,
    evidence,
    riskLevel,
    tests,
    assumptions,
    limitations,
    changelog: changelog.map((c) => ({
      // keep only the stable parts in the record hash;
      // signature is derived, but including it is fine as it is deterministic.
      version: c.version,
      date: c.date,
      changeType: c.changeType,
      areas: c.areas,
      summary: c.summary,
      why: c.why,
      reviewer: c.reviewer,
      evidence: c.evidence,
      riskLevel: c.riskLevel,
      tests: c.tests,
      entryHash: c.entryHash
    }))
  };

  const recordHash = sha256Hex(stableStringify(recordBase));
  const recordId = recordHash.slice(0, 12);

  return {
    engineVersion,
    dataVersion,
    contentVersion,
    uiVersion,
    changeType,
    lastUpdated,
    reviewedBy,
    riskLevel,
    tests,
    assumptions,
    limitations,
    evidence,
    changelog,
    recordId,
    recordHash,
    buildCommit
  };
}
