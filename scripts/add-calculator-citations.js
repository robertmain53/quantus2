#!/usr/bin/env node

/**
 * Add authoritative citations to calculator configs (non-converters)
 * based on category and subcategory.
 * Outputs no-citations.csv for calculators without authoritative sources.
 */

const fs = require("fs");
const path = require("path");

const CONFIGS_DIR = path.join(__dirname, "..", "data", "configs");
const CSV_PATH = path.join(__dirname, "..", "data", "calc.csv");
const NO_CITATIONS_PATH = path.join(__dirname, "..", "data", "no-citations.csv");

// Simple CSV parser
function parseCSV(content) {
  const lines = content.split("\n").filter(line => line.trim());
  const headers = lines[0].split(",");
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    rows.push(row);
  }

  return rows;
}

// Authoritative citations by category and subcategory
const CITATIONS_BY_CATEGORY = {
  // ============ FINANCE ============
  "Finance/Retirement": [
    {
      label: "IRS Publication 590-B — Distributions from Individual Retirement Arrangements",
      url: "https://www.irs.gov/publications/p590b"
    },
    {
      label: "IRS Required Minimum Distribution Worksheets",
      url: "https://www.irs.gov/retirement-plans/plan-participant-employee/required-minimum-distribution-worksheets"
    },
    {
      label: "Social Security Administration — Retirement Benefits",
      url: "https://www.ssa.gov/benefits/retirement/"
    }
  ],
  "Finance/Taxes": [
    {
      label: "IRS Publication 15-T — Federal Income Tax Withholding Methods",
      url: "https://www.irs.gov/publications/p15t"
    },
    {
      label: "IRS Publication 505 — Tax Withholding and Estimated Tax",
      url: "https://www.irs.gov/publications/p505"
    },
    {
      label: "IRS Tax Withholding Estimator",
      url: "https://www.irs.gov/individuals/tax-withholding-estimator"
    }
  ],
  "Finance/Loans": [
    {
      label: "CFPB Regulation Z — 12 CFR § 1026.22 Determination of Annual Percentage Rate",
      url: "https://www.consumerfinance.gov/rules-policy/regulations/1026/22/"
    },
    {
      label: "CFPB Appendix J — Annual Percentage Rate Computations for Closed-End Credit",
      url: "https://www.consumerfinance.gov/rules-policy/regulations/1026/j/"
    },
    {
      label: "CFPB Annual Percentage Rate Tables",
      url: "https://www.consumerfinance.gov/compliance/compliance-resources/other-applicable-requirements/annual-percentage-rate-tables/"
    }
  ],
  "Finance/Bonds": [
    {
      label: "SEC — Securities and Exchange Commission Yield Calculation Guidance",
      url: "https://www.sec.gov/rules/proposed/482.txt"
    },
    {
      label: "FINRA — Fixed Income and Bonds",
      url: "https://www.finra.org/investors/investing/investment-products/bonds"
    },
    {
      label: "U.S. Treasury — Treasury Securities",
      url: "https://www.treasurydirect.gov/marketable-securities/"
    }
  ],
  "Finance/Corporate": [
    {
      label: "SEC — Non-GAAP Financial Measures Guidance",
      url: "https://www.sec.gov/corpfin/non-gaap-financial-measures"
    },
    {
      label: "FASB — Financial Accounting Standards Board",
      url: "https://www.fasb.org/"
    },
    {
      label: "CFA Institute — Global Investment Performance Standards (GIPS)",
      url: "https://rpc.cfainstitute.org/gips-standards"
    }
  ],
  "Finance/Investing": [
    {
      label: "SEC — Investor.gov Educational Resources",
      url: "https://www.investor.gov/"
    },
    {
      label: "CFA Institute — Global Investment Performance Standards (GIPS)",
      url: "https://rpc.cfainstitute.org/gips-standards"
    },
    {
      label: "FINRA — Investment Products",
      url: "https://www.finra.org/investors/investing/investment-products"
    }
  ],
  "Finance/Personal": [
    {
      label: "CFPB — Consumer Financial Protection Bureau",
      url: "https://www.consumerfinance.gov/"
    },
    {
      label: "Federal Reserve — Consumer Credit",
      url: "https://www.federalreserve.gov/releases/g19/current/"
    },
    {
      label: "IRS Publication 17 — Your Federal Income Tax",
      url: "https://www.irs.gov/publications/p17"
    }
  ],
  "Finance/Real Estate": [
    {
      label: "HUD — FHA Single Family Housing Policy Handbook 4000.1",
      url: "https://www.hud.gov/program_offices/housing/sfh/handbook_4000-1"
    },
    {
      label: "HUD — Property Valuation and Appraisals (HUD 4155.2)",
      url: "https://www.hud.gov/sites/documents/4155-2_4.pdf"
    },
    {
      label: "Fannie Mae — Selling Guide",
      url: "https://selling-guide.fanniemae.com/"
    }
  ],
  "Finance/Insurance": [
    {
      label: "NAIC — National Association of Insurance Commissioners",
      url: "https://content.naic.org/"
    },
    {
      label: "Insurance Information Institute",
      url: "https://www.iii.org/"
    }
  ],
  "Finance/Trading": [
    {
      label: "OCC — Options Clearing Corporation",
      url: "https://www.theocc.com/"
    },
    {
      label: "CBOE — Chicago Board Options Exchange Education",
      url: "https://www.cboe.com/education/"
    },
    {
      label: "Columbia University — Black-Scholes Model (Academic Reference)",
      url: "https://www.columbia.edu/~mh2078/FoundationsFE/BlackScholes.pdf"
    }
  ],
  "Finance/Valuation": [
    {
      label: "CFA Institute — Equity Valuation Standards",
      url: "https://rpc.cfainstitute.org/"
    },
    {
      label: "FASB ASC 820 — Fair Value Measurement",
      url: "https://www.fasb.org/"
    },
    {
      label: "AICPA — Valuation Services",
      url: "https://www.aicpa-cima.com/"
    }
  ],

  // ============ BUSINESS ============
  "Business/Accounting": [
    {
      label: "FASB — Financial Accounting Standards Board (GAAP)",
      url: "https://www.fasb.org/"
    },
    {
      label: "SEC — Financial Reporting Manual",
      url: "https://www.sec.gov/corpfin/cf-manual"
    },
    {
      label: "AICPA — American Institute of CPAs",
      url: "https://www.aicpa-cima.com/"
    }
  ],

  // ============ CONSTRUCTION ============
  "Construction/Materials": [
    {
      label: "ACI — American Concrete Institute Standards",
      url: "https://www.concrete.org/publications/typesofpublications/standards(codesandspecs).aspx"
    },
    {
      label: "ACI 211.1-91 — Standard Practice for Selecting Proportions for Concrete",
      url: "https://www.concrete.org/"
    },
    {
      label: "ASTM International — Construction Standards",
      url: "https://www.astm.org/"
    }
  ],

  // ============ HEALTH ============
  "Health/Fitness": [
    {
      label: "CDC — Body Mass Index (BMI) Categories",
      url: "https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html"
    },
    {
      label: "NIH — National Institutes of Health Metabolic Research",
      url: "https://www.nih.gov/"
    },
    {
      label: "ACSM — American College of Sports Medicine Guidelines",
      url: "https://www.acsm.org/"
    },
    {
      label: "PubMed — Mifflin-St Jeor Equation (PMID: 2305711)",
      url: "https://pubmed.ncbi.nlm.nih.gov/2305711/"
    }
  ],

  // ============ AUTOMOTIVE ============
  "Automotive/Performance": [
    {
      label: "EPA — FuelEconomy.gov Official Fuel Economy Information",
      url: "https://www.fueleconomy.gov/"
    },
    {
      label: "EPA — 40 CFR Part 600 Fuel Economy Regulations",
      url: "https://www.ecfr.gov/current/title-40/chapter-I/subchapter-Q/part-600"
    },
    {
      label: "SAE International — Automotive Engineering Standards",
      url: "https://www.sae.org/"
    }
  ],

  // ============ LIFESTYLE ============
  "Lifestyle/Time": [
    {
      label: "NIST — Time and Frequency Division",
      url: "https://www.nist.gov/pml/time-and-frequency-division"
    },
    {
      label: "ISO 8601 — Date and Time Format Standard",
      url: "https://www.iso.org/iso-8601-date-and-time-format.html"
    }
  ]
};

// Specific calculator overrides (more targeted citations)
const CALCULATOR_SPECIFIC_CITATIONS = {
  // Retirement calculators
  "401k": [
    {
      label: "IRS — 401(k) Plan Contribution Limits",
      url: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits"
    },
    {
      label: "IRS Publication 560 — Retirement Plans for Small Business",
      url: "https://www.irs.gov/publications/p560"
    },
    {
      label: "Department of Labor — 401(k) Plans",
      url: "https://www.dol.gov/agencies/ebsa/about-ebsa/our-activities/resource-center/faqs/401k-plans"
    }
  ],
  "roth-ira": [
    {
      label: "IRS — Roth IRAs",
      url: "https://www.irs.gov/retirement-plans/roth-iras"
    },
    {
      label: "IRS Publication 590-A — Contributions to Individual Retirement Arrangements",
      url: "https://www.irs.gov/publications/p590a"
    }
  ],
  "social-security": [
    {
      label: "SSA — Primary Insurance Amount Formula",
      url: "https://www.ssa.gov/oact/cola/piaformula.html"
    },
    {
      label: "SSA — Social Security Benefit Calculation",
      url: "https://www.ssa.gov/oact/progdata/retirebenefit2.html"
    },
    {
      label: "SSA — Benefit Amounts",
      url: "https://www.ssa.gov/oact/cola/Benefits.html"
    }
  ],
  "rmd": [
    {
      label: "IRS — Required Minimum Distributions (RMDs)",
      url: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-required-minimum-distributions-rmds"
    },
    {
      label: "IRS Publication 590-B — Distributions from IRAs",
      url: "https://www.irs.gov/publications/p590b"
    },
    {
      label: "Investor.gov — RMD Calculator",
      url: "https://www.investor.gov/financial-tools-calculators/calculators/required-minimum-distribution-calculator"
    }
  ],
  // Tax calculators
  "income-tax": [
    {
      label: "IRS — Tax Brackets and Rates",
      url: "https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments-for-tax-year-2024"
    },
    {
      label: "IRS Publication 17 — Your Federal Income Tax",
      url: "https://www.irs.gov/publications/p17"
    }
  ],
  "estate-tax": [
    {
      label: "IRS — Estate Tax",
      url: "https://www.irs.gov/businesses/small-businesses-self-employed/estate-tax"
    },
    {
      label: "IRS Publication 559 — Survivors, Executors, and Administrators",
      url: "https://www.irs.gov/publications/p559"
    }
  ],
  "gift-tax": [
    {
      label: "IRS — Gift Tax",
      url: "https://www.irs.gov/businesses/small-businesses-self-employed/frequently-asked-questions-on-gift-taxes"
    },
    {
      label: "IRS — Estate and Gift Tax FAQs",
      url: "https://www.irs.gov/newsroom/estate-and-gift-tax-faqs"
    }
  ],
  "self-employment-tax": [
    {
      label: "IRS — Self-Employment Tax",
      url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes"
    },
    {
      label: "IRS Schedule SE",
      url: "https://www.irs.gov/forms-pubs/about-schedule-se-form-1040"
    }
  ],
  "capital-gains": [
    {
      label: "IRS — Capital Gains and Losses",
      url: "https://www.irs.gov/taxtopics/tc409"
    },
    {
      label: "IRS Publication 544 — Sales and Other Dispositions of Assets",
      url: "https://www.irs.gov/publications/p544"
    }
  ],
  // Health calculators
  "bmi": [
    {
      label: "CDC — About Adult BMI",
      url: "https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html"
    },
    {
      label: "NIH — Calculate Your Body Mass Index",
      url: "https://www.nhlbi.nih.gov/health/educational/lose_wt/BMI/bmicalc.htm"
    }
  ],
  "bmr": [
    {
      label: "PubMed — Mifflin-St Jeor Equation for Resting Energy Expenditure (PMID: 2305711)",
      url: "https://pubmed.ncbi.nlm.nih.gov/2305711/"
    },
    {
      label: "PubMed — Comparison of Predictive Equations for Resting Metabolic Rate (PMID: 15883556)",
      url: "https://pubmed.ncbi.nlm.nih.gov/15883556/"
    }
  ],
  "heart-rate": [
    {
      label: "ACSM — Target Heart Rate Recommendations",
      url: "https://www.acsm.org/"
    },
    {
      label: "American Heart Association — Target Heart Rates",
      url: "https://www.heart.org/en/healthy-living/fitness/fitness-basics/target-heart-rates"
    }
  ],
  // Options/Trading calculators
  "black-scholes": [
    {
      label: "Columbia University — Black-Scholes Model",
      url: "https://www.columbia.edu/~mh2078/FoundationsFE/BlackScholes.pdf"
    },
    {
      label: "Nobel Prize — The Sveriges Riksbank Prize in Economic Sciences 1997",
      url: "https://www.nobelprize.org/prizes/economic-sciences/1997/summary/"
    }
  ],
  "option": [
    {
      label: "OCC — Options Clearing Corporation",
      url: "https://www.theocc.com/"
    },
    {
      label: "CBOE — Options Education",
      url: "https://www.cboe.com/education/"
    }
  ],
  // Loan calculators
  "mortgage": [
    {
      label: "CFPB — Understand Loan Options",
      url: "https://www.consumerfinance.gov/owning-a-home/loan-options/"
    },
    {
      label: "CFPB — Explore Interest Rates",
      url: "https://www.consumerfinance.gov/owning-a-home/explore-rates/"
    },
    {
      label: "Fannie Mae — Loan Terms Glossary",
      url: "https://www.fanniemae.com/glossary"
    }
  ],
  // Real estate calculators
  "cap-rate": [
    {
      label: "HUD — Multifamily Underwriting Guidelines",
      url: "https://www.hud.gov/program_offices/housing/mfh"
    },
    {
      label: "Appraisal Institute — Income Capitalization Approach",
      url: "https://www.appraisalinstitute.org/"
    }
  ],
  "1031-exchange": [
    {
      label: "IRS — Like-Kind Exchanges Under IRC Section 1031",
      url: "https://www.irs.gov/businesses/small-businesses-self-employed/like-kind-exchanges-real-estate-tax-tips"
    },
    {
      label: "IRS Publication 544 — Sales and Other Dispositions of Assets",
      url: "https://www.irs.gov/publications/p544"
    }
  ],
  // Fuel/Automotive
  "fuel": [
    {
      label: "EPA — FuelEconomy.gov",
      url: "https://www.fueleconomy.gov/"
    },
    {
      label: "EPA — How Vehicles Are Tested",
      url: "https://www.fueleconomy.gov/feg/how_tested.shtml"
    }
  ]
};

function slugFromPath(urlPath) {
  const parts = urlPath.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

function normalizeUrl(url) {
  return url.toLowerCase().replace(/\/$/, "").replace(/^https?:\/\//, "").replace(/^www\./, "");
}

function normalizeLabel(label) {
  return label.toLowerCase().replace(/[—–-]/g, "").replace(/\s+/g, " ").trim();
}

function hasSimilarCitation(existingCitations, newCitation) {
  if (!existingCitations || !Array.isArray(existingCitations)) {
    return false;
  }

  const newUrl = normalizeUrl(newCitation.url);
  const newLabel = normalizeLabel(newCitation.label);

  for (const existing of existingCitations) {
    const existingUrl = normalizeUrl(existing.url || "");
    const existingLabel = normalizeLabel(existing.label || "");

    if (existingUrl && newUrl && existingUrl === newUrl) {
      return true;
    }

    // Check for key identifiers in labels
    const keyIds = ["irs.gov", "sec.gov", "ssa.gov", "cdc.gov", "cfpb", "fasb", "finra", "acsm", "epa"];
    for (const id of keyIds) {
      if (newUrl.includes(id) && existingUrl.includes(id)) {
        // Same authority, check if similar path
        if (newUrl.split("/").slice(0, 3).join("/") === existingUrl.split("/").slice(0, 3).join("/")) {
          return true;
        }
      }
    }
  }

  return false;
}

function getSpecificCitations(slug) {
  // Check for specific calculator matches
  for (const [key, citations] of Object.entries(CALCULATOR_SPECIFIC_CITATIONS)) {
    if (slug.includes(key)) {
      return citations;
    }
  }
  return null;
}

function getCategoryCitations(category, subcategory) {
  const key = `${category}/${subcategory}`;
  return CITATIONS_BY_CATEGORY[key] || null;
}

function main() {
  const csvContent = fs.readFileSync(CSV_PATH, "utf8");
  const rows = parseCSV(csvContent);

  // Build map of non-converter calculators
  const calculators = [];
  for (const row of rows) {
    if (row.category !== "Conversions" && !row.slug.includes("converter")) {
      calculators.push({
        slug: slugFromPath(row.slug),
        category: row.category,
        subcategory: row.subcategory,
        title: row.title,
        path: row.slug
      });
    }
  }

  console.log(`Found ${calculators.length} calculator entries`);

  const configFiles = fs.readdirSync(CONFIGS_DIR).filter(f => f.endsWith(".json") && !f.includes("_raw_output"));

  let updatedCount = 0;
  let skippedCount = 0;
  const noCitations = [];

  for (const calc of calculators) {
    const filename = `${calc.slug}.json`;
    const configPath = path.join(CONFIGS_DIR, filename);

    if (!fs.existsSync(configPath)) {
      noCitations.push({
        ...calc,
        reason: "Config file not found"
      });
      continue;
    }

    // Get citations - first try specific, then category
    let citations = getSpecificCitations(calc.slug);
    if (!citations) {
      citations = getCategoryCitations(calc.category, calc.subcategory);
    }

    if (!citations) {
      noCitations.push({
        ...calc,
        reason: "No authoritative sources defined for category"
      });
      continue;
    }

    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (e) {
      console.error(`Failed to parse ${filename}: ${e.message}`);
      noCitations.push({
        ...calc,
        reason: "Failed to parse config JSON"
      });
      continue;
    }

    // Ensure page_content and citations exist
    if (!config.page_content) {
      config.page_content = {};
    }
    if (!config.page_content.citations) {
      config.page_content.citations = [];
    }

    // Add citations that don't already exist
    let addedCount = 0;
    for (const citation of citations) {
      if (!hasSimilarCitation(config.page_content.citations, citation)) {
        config.page_content.citations.push(citation);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
      console.log(`Updated ${calc.slug}: added ${addedCount} citation(s)`);
      updatedCount++;
    } else {
      skippedCount++;
    }
  }

  // Write no-citations.csv
  if (noCitations.length > 0) {
    const csvHeader = "category,subcategory,slug,title,reason\n";
    const csvRows = noCitations.map(c =>
      `"${c.category}","${c.subcategory}","${c.slug}","${c.title}","${c.reason}"`
    ).join("\n");
    fs.writeFileSync(NO_CITATIONS_PATH, csvHeader + csvRows);
    console.log(`\nWrote ${noCitations.length} entries to no-citations.csv`);
  }

  console.log(`\nSummary:`);
  console.log(`  Updated: ${updatedCount} configs`);
  console.log(`  Skipped (already had citations): ${skippedCount} configs`);
  console.log(`  No citations available: ${noCitations.length} configs`);
}

main();
