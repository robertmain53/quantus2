// lib/reviewers.ts
export type ReviewerProfile = {
  slug: string;
  name: string;
  role?: string;
  credentials?: string;
  bio?: string;
  scope?: string[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Deterministic reviewer directory.
 * - Generates stable slugs from versioning.reviewedBy.name.
 * - Provides optional canonical enrichment (role/credentials/scope).
 *
 * Expand this list as you add reviewers. For unknown reviewers, we still
 * generate a slug on the fly (byName -> slug), so the route remains functional.
 */
const REVIEWERS_SEED: Array<Omit<ReviewerProfile, "slug"> & { slug?: string }> = [
  // Example:
  // {
  //   name: "Ugo Candido",
  //   role: "Technical Reviewer",
  //   credentials: "MBA, M.Eng. (Industrial Engineering)",
  //   scope: ["Methodology review", "Edge-case validation", "Governance sign-off"]
  // }

  {
    name: "Ugo Candido",
    role: "Technical Reviewer",
    credentials: "MBA, M.Eng. (Industrial Engineering)",
    bio:
      "Leveraging a foundational background in industrial technology and a specialized degree in Management Engineering (Materials Science), Ugo Candido directs the platform's architectural and computational integrity. An alumnus of M.I.B. Trieste (MBA), he applies rigorous systems engineering methodologies derived from extensive tenure as Head of International Projects. Currently CEO of Yeah Up, his functional role as Lead Technologist prioritizes high-precision data modeling and cross-jurisdictional compliance. He orchestrates the validation of engineering algorithms, ensuring strict adherence to technical standards and operational reliability within complex material calculation frameworks.",
    scope: ["Methodology review", "Edge-case validation", "Governance sign-off"]
  }
];

export function getReviewerDirectory() {
  const bySlug: Record<string, ReviewerProfile> = {};
  const byName: Record<string, ReviewerProfile> = {};

  for (const r of REVIEWERS_SEED) {
    const slug = (r.slug ?? slugify(r.name)).trim();
    const profile: ReviewerProfile = {
      slug,
      name: r.name,
      role: r.role,
      credentials: r.credentials,
      bio: r.bio,
      scope: r.scope
    };
    bySlug[slug] = profile;
    byName[r.name] = profile;
  }

  return {
    bySlug,
    byName,
    /**
     * Resolve a reviewer by name; if not seeded, produce a minimal deterministic profile.
     */
    resolveByName(name: string): ReviewerProfile {
      const existing = byName[name];
      if (existing) return existing;
      const slug = slugify(name);
      const minimal: ReviewerProfile = { slug, name };
      // Note: not caching minimal; deterministic per-call and avoids accidental persistence.
      return minimal;
    }
  };
}

export function reviewerSlugFromName(name: string) {
  return slugify(name);
}
