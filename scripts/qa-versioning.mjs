// scripts/qa-versioning.mjs
// Deterministic governance gate for calculator pages.
// Fails CI when published calculators violate risk-tier requirements in data/versioning.json.
//
// Usage:
//   node scripts/qa-versioning.mjs
//
// Exit codes:
//   0 = pass
//   1 = fail

import fs from "node:fs";
import path from "node:path";

import { getPublishedCalculators } from "../src/lib/content.js";
import { getVersioningPolicy, getVersioningRecord } from "../src/lib/versioning.js";

/**
 * IMPORTANT:
 * - This script assumes your app code is transpiled/available for Node ESM import.
 * - If your repo structure differs (e.g., no /src), adjust import paths accordingly.
 */

const ALLOWED_RISK = new Set(["low", "medium", "high"]);

function fail(msg) {
  throw new Error(msg);
}

function warn(msg) {
  // eslint-disable-next-line no-console
  console.warn(`[QA-VERSIONING][WARN] ${msg}`);
}

function info(msg) {
  // eslint-disable-next-line no-console
  console.log(`[QA-VERSIONING] ${msg}`);
}

function readVersioningJson() {
  const filePath = path.join(process.cwd(), "data", "versioning.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);
  return data;
}

function normalizeExternalUrl(raw) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Markdown link [label](url)
  const markdownLinkMatch = trimmed.match(/^\[.*\]\((https?:\/\/[^)]+)\)$/);
  if (markdownLinkMatch) return markdownLinkMatch[1];

  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
  return null;
}

function extractEvidenceLinksFromConfig(calcConfig) {
  const citations = calcConfig?.pageContent?.citations;
  if (!Array.isArray(citations)) return [];
  const urls = citations
    .map((c) => (c && typeof c === "object" ? normalizeExternalUrl(c.url) : null))
    .filter(Boolean);
  // Dedupe + sort for determinism
  return Array.from(new Set(urls)).sort();
}

function parseIsoDateOrNull(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function getRequirements(policy, riskLevel) {
  const reqs = policy?.requirements ?? null;
  if (!reqs || typeof reqs !== "object") return null;
  const r = reqs[riskLevel];
  if (!r || typeof r !== "object") return null;
  return r;
}

function ensureNonEmptyString(label, v, ctx) {
  if (typeof v !== "string" || v.trim() === "") {
    fail(`${ctx}: ${label} is missing/empty`);
  }
}

function ensureArrayMin(label, arr, min, ctx) {
  if (!Array.isArray(arr) || arr.length < min) {
    fail(`${ctx}: ${label} must have >= ${min} item(s)`);
  }
}

function ensureIntMin(label, n, min, ctx) {
  if (typeof n !== "number" || !Number.isFinite(n) || n < min) {
    fail(`${ctx}: ${label} must be a number >= ${min}`);
  }
}

function ensureAllowedRisk(risk, ctx) {
  if (!ALLOWED_RISK.has(risk)) {
    fail(`${ctx}: riskLevel "${risk}" is invalid. Allowed: low|medium|high`);
  }
}

function ensureChangelogMatches(versioning, ctx) {
  if (!Array.isArray(versioning.changelog) || versioning.changelog.length === 0) {
    fail(`${ctx}: changelog is required and must be non-empty`);
  }
  const hasEntryForEngine = versioning.changelog.some((e) => e && e.version === versioning.engineVersion);
  if (!hasEntryForEngine) {
    fail(`${ctx}: changelog must contain an entry for engineVersion=${versioning.engineVersion}`);
  }

  // Optional but strongly recommended: lastUpdated == most recent changelog date
  const dates = versioning.changelog
    .map((e) => parseIsoDateOrNull(e?.date))
    .filter(Boolean)
    .sort((a, b) => b.getTime() - a.getTime());

  if (dates.length > 0) {
    const latest = dates[0].toISOString().slice(0, 10);
    const lastUpdated = String(versioning.lastUpdated).slice(0, 10);
    if (latest !== lastUpdated) {
      fail(`${ctx}: lastUpdated (${lastUpdated}) must match latest changelog date (${latest})`);
    }
  }
}

function ensureTests(versioning, req, ctx) {
  if (!versioning.tests || typeof versioning.tests !== "object") {
    fail(`${ctx}: tests object is missing`);
  }
  ensureIntMin("tests.goldenCases", versioning.tests.goldenCases, req.minGoldenCases ?? 0, ctx);
  ensureIntMin("tests.edgeCases", versioning.tests.edgeCases, req.minEdgeCases ?? 0, ctx);
  ensureNonEmptyString("tests.lastRun", versioning.tests.lastRun, ctx);
  ensureNonEmptyString("tests.runId", versioning.tests.runId, ctx);
}

function ensureReviewer(versioning, req, ctx) {
  if (req.requireReviewer) {
    if (!versioning.reviewedBy || typeof versioning.reviewedBy !== "object") {
      fail(`${ctx}: reviewedBy is required`);
    }
    ensureNonEmptyString("reviewedBy.name", versioning.reviewedBy.name, ctx);

    // Optional but recommended: role OR credentials should exist for medium/high
    if (versioning.riskLevel !== "low") {
      const hasRole = typeof versioning.reviewedBy.role === "string" && versioning.reviewedBy.role.trim() !== "";
      const hasCreds =
        typeof versioning.reviewedBy.credentials === "string" && versioning.reviewedBy.credentials.trim() !== "";
      if (!hasRole && !hasCreds) {
        fail(`${ctx}: reviewedBy should include role and/or credentials for riskLevel=${versioning.riskLevel}`);
      }
    }
  }

  if (req.requireReviewerScope) {
    // You will add this in your VersioningRecord after updating versioning.ts
    const scope = versioning.reviewedBy?.scope;
    if (!Array.isArray(scope) || scope.length === 0) {
      fail(`${ctx}: reviewedBy.scope is required for riskLevel=${versioning.riskLevel}`);
    }
  }
}

function ensureEvidence(versioning, req, ctx) {
  if (req.requireEvidence) {
    ensureArrayMin("evidence", versioning.evidence, 1, ctx);
  }
}

function ensureRecordId(versioning, ctx) {
  ensureNonEmptyString("recordId", versioning.recordId, ctx);
  if (String(versioning.recordId).length !== 12) {
    fail(`${ctx}: recordId should be 12 chars (got ${versioning.recordId})`);
  }
}

function main() {
  const policy = getVersioningPolicy();
  const versioningJson = readVersioningJson();

  // Sanity: policy in code should match policy in JSON file (optional check)
  if (!versioningJson?.policy?.semanticVersioning) {
    fail(`data/versioning.json: missing policy.semanticVersioning`);
  }

  const calculators = getPublishedCalculators();
  info(`Checking versioning governance for ${calculators.length} published calculators...`);

  const failures = [];

  for (const calc of calculators) {
    const ctx = `${calc.fullPath}`;

    try {
      const evidenceFromPage = extractEvidenceLinksFromConfig(calc.config);
      const versioning = getVersioningRecord(calc.fullPath, calc.config, calc.publishDate ?? null, evidenceFromPage);

      ensureAllowedRisk(versioning.riskLevel, ctx);

      const req = getRequirements(policy, versioning.riskLevel) ?? {
        requireReviewer: true,
        requireChangelog: true,
        requireEvidence: versioning.riskLevel !== "low",
        requireTests: true,
        minGoldenCases: versioning.riskLevel === "high" ? 50 : versioning.riskLevel === "medium" ? 25 : 10,
        minEdgeCases: versioning.riskLevel === "high" ? 200 : versioning.riskLevel === "medium" ? 120 : 25,
        requireReviewerScope: versioning.riskLevel === "high"
      };

      if (req.requireChangelog) ensureChangelogMatches(versioning, ctx);
      if (req.requireTests) ensureTests(versioning, req, ctx);
      ensureReviewer(versioning, req, ctx);
      ensureEvidence(versioning, req, ctx);
      ensureRecordId(versioning, ctx);

      // Soft warnings
      if ((versioning.riskLevel === "medium" || versioning.riskLevel === "high") && versioning.evidence.length === 0) {
        warn(`${ctx}: medium/high risk calculator has zero evidence links (should not happen if requireEvidence=true)`);
      }
    } catch (e) {
      failures.push(String(e?.message ?? e));
    }
  }

  if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`\n[QA-VERSIONING] FAIL (${failures.length}):`);
    for (const msg of failures) {
      // eslint-disable-next-line no-console
      console.error(`- ${msg}`);
    }
    process.exit(1);
  }

  info("PASS");
  process.exit(0);
}

main();
