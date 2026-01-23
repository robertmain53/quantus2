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
  date: string;
  changeType: "major" | "minor" | "patch";
  areas: string[];
  summary: string;
  why: string;
  reviewer: ReviewerIdentity;
  evidence: string[];
  riskLevel: string;
  tests: VersioningTests;
  signature: string;
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
  recordId: string;
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
  if (cache) {
    return cache;
  }
  const filePath = path.join(process.cwd(), "data", "versioning.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  cache = JSON.parse(raw) as VersioningConfig;
  return cache;
}

export function getVersioningPolicy(): VersioningPolicy {
  return loadConfig().policy;
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
  const fallbackDate = metadataUpdated ?? publishDate ?? new Date().toISOString().split("T")[0];
  const lastUpdated = override.lastUpdated ?? fallbackDate;
  const reviewedBy = override.reviewedBy ?? defaults.reviewedBy;
  const evidence = override.evidence ?? (evidenceFromPage.length > 0 ? evidenceFromPage : defaults.evidence);
  const tests = override.tests ?? defaults.tests;
  const assumptions = override.assumptions ?? defaults.assumptions;
  const limitations = override.limitations ?? defaults.limitations;

  const engineVersion = override.engineVersion ?? config?.version ?? defaults.engineVersion;
  const dataVersion = override.dataVersion ?? config?.metadata?.taxYearBasis ?? defaults.dataVersion;
  const contentVersion = override.contentVersion ?? config?.version ?? defaults.contentVersion;
  const uiVersion = override.uiVersion ?? defaults.uiVersion;
  const changeType = override.changeType ?? defaults.changeType;
  const riskLevel = override.riskLevel ?? defaults.riskLevel;

  const changelogSource = override.changelog ?? [
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

  const changelog = changelogSource.map((entry) => {
    const signature = crypto
      .createHash("sha256")
      .update(JSON.stringify({ fullPath, entry }))
      .digest("hex")
      .slice(0, 12);
    return {
      ...entry,
      signature
    };
  });

  const recordBase = {
    fullPath,
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
    changelog
  };

  const recordId = crypto
    .createHash("sha256")
    .update(JSON.stringify(recordBase))
    .digest("hex")
    .slice(0, 12);

  return {
    ...recordBase,
    recordId
  };
}
