#!/usr/bin/env node

/**
 * Add international standards citations to converter configs
 * based on conversion type (subcategory).
 * Avoids duplicates by checking existing citation labels/URLs.
 */

const fs = require("fs");
const path = require("path");

// Simple CSV parser for this specific use case
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

const CONFIGS_DIR = path.join(__dirname, "..", "data", "configs");
const CSV_PATH = path.join(__dirname, "..", "data", "calc.csv");

// Standards citations mapped by conversion subcategory
const STANDARDS_BY_SUBCATEGORY = {
  Length: [
    {
      label: "ISO 80000-3:2019 — Space and time",
      url: "https://www.iso.org/standard/64974.html"
    },
    {
      label: "NIST SP 811 — Guide for the Use of the International System of Units",
      url: "https://www.nist.gov/pml/special-publication-811"
    },
    {
      label: "BIPM SI Brochure (9th edition, 2019)",
      url: "https://www.bipm.org/en/publications/si-brochure"
    }
  ],
  Area: [
    {
      label: "ISO 80000-3:2019 — Space and time",
      url: "https://www.iso.org/standard/64974.html"
    },
    {
      label: "NIST SP 811 — Guide for the Use of the International System of Units",
      url: "https://www.nist.gov/pml/special-publication-811"
    }
  ],
  Volume: [
    {
      label: "ISO 80000-3:2019 — Space and time",
      url: "https://www.iso.org/standard/64974.html"
    },
    {
      label: "NIST SP 811 — Guide for the Use of the International System of Units",
      url: "https://www.nist.gov/pml/special-publication-811"
    }
  ],
  Angle: [
    {
      label: "ISO 80000-3:2019 — Space and time",
      url: "https://www.iso.org/standard/64974.html"
    },
    {
      label: "NIST SP 811 — Guide for the Use of the International System of Units",
      url: "https://www.nist.gov/pml/special-publication-811"
    }
  ],
  Weight: [
    {
      label: "ISO 80000-4:2019 — Mechanics",
      url: "https://www.iso.org/standard/64975.html"
    },
    {
      label: "BIPM SI Brochure (9th edition, 2019)",
      url: "https://www.bipm.org/en/publications/si-brochure"
    },
    {
      label: "NIST SP 811 — Guide for the Use of the International System of Units",
      url: "https://www.nist.gov/pml/special-publication-811"
    }
  ],
  Density: [
    {
      label: "ISO 80000-4:2019 — Mechanics",
      url: "https://www.iso.org/standard/64975.html"
    },
    {
      label: "NIST SP 811 — Guide for the Use of the International System of Units",
      url: "https://www.nist.gov/pml/special-publication-811"
    }
  ],
  Pressure: [
    {
      label: "ISO 80000-4:2019 — Mechanics",
      url: "https://www.iso.org/standard/64975.html"
    },
    {
      label: "NIST SP 811 — Guide for the Use of the International System of Units",
      url: "https://www.nist.gov/pml/special-publication-811"
    }
  ],
  Energy: [
    {
      label: "ISO 80000-4:2019 — Mechanics",
      url: "https://www.iso.org/standard/64975.html"
    },
    {
      label: "NIST SP 811 — Guide for the Use of the International System of Units",
      url: "https://www.nist.gov/pml/special-publication-811"
    }
  ],
  Power: [
    {
      label: "ISO 80000-4:2019 — Mechanics",
      url: "https://www.iso.org/standard/64975.html"
    },
    {
      label: "NIST SP 811 — Guide for the Use of the International System of Units",
      url: "https://www.nist.gov/pml/special-publication-811"
    }
  ],
  Temperature: [
    {
      label: "ISO 80000-5:2019 — Thermodynamics",
      url: "https://www.iso.org/standard/64976.html"
    },
    {
      label: "NIST SP 330 — The International System of Units (SI)",
      url: "https://www.nist.gov/pml/special-publication-330"
    },
    {
      label: "BIPM SI Brochure (9th edition, 2019)",
      url: "https://www.bipm.org/en/publications/si-brochure"
    }
  ],
  Time: [
    {
      label: "ISO 80000-3:2019 — Space and time",
      url: "https://www.iso.org/standard/64974.html"
    },
    {
      label: "BIPM SI Brochure (9th edition, 2019)",
      url: "https://www.bipm.org/en/publications/si-brochure"
    }
  ],
  Speed: [
    {
      label: "ISO 80000-3:2019 — Space and time",
      url: "https://www.iso.org/standard/64974.html"
    },
    {
      label: "NIST SP 811 — Guide for the Use of the International System of Units",
      url: "https://www.nist.gov/pml/special-publication-811"
    }
  ],
  Frequency: [
    {
      label: "ISO 80000-3:2019 — Space and time",
      url: "https://www.iso.org/standard/64974.html"
    },
    {
      label: "BIPM SI Brochure (9th edition, 2019)",
      url: "https://www.bipm.org/en/publications/si-brochure"
    }
  ],
  "Data Converter": [
    {
      label: "IEC 80000-13:2008 — Information science and technology",
      url: "https://www.iso.org/standard/31898.html"
    },
    {
      label: "NIST SP 811 — Guide for the Use of the International System of Units",
      url: "https://www.nist.gov/pml/special-publication-811"
    }
  ],
  "Data Storage": [
    {
      label: "IEC 80000-13:2008 — Information science and technology",
      url: "https://www.iso.org/standard/31898.html"
    },
    {
      label: "NIST SP 811 — Guide for the Use of the International System of Units",
      url: "https://www.nist.gov/pml/special-publication-811"
    }
  ],
  "Data Transfer": [
    {
      label: "IEC 80000-13:2008 — Information science and technology",
      url: "https://www.iso.org/standard/31898.html"
    },
    {
      label: "NIST SP 811 — Guide for the Use of the International System of Units",
      url: "https://www.nist.gov/pml/special-publication-811"
    }
  ],
  Illuminance: [
    {
      label: "ISO 80000-7:2019 — Light and radiation",
      url: "https://www.iso.org/standard/64978.html"
    },
    {
      label: "NIST SP 811 — Guide for the Use of the International System of Units",
      url: "https://www.nist.gov/pml/special-publication-811"
    }
  ],
  "Fuel Economy": [
    {
      label: "ISO 80000-3:2019 — Space and time",
      url: "https://www.iso.org/standard/64974.html"
    },
    {
      label: "ISO 80000-4:2019 — Mechanics",
      url: "https://www.iso.org/standard/64975.html"
    },
    {
      label: "NIST SP 811 — Guide for the Use of the International System of Units",
      url: "https://www.nist.gov/pml/special-publication-811"
    }
  ],
  Cooking: [
    {
      label: "NIST SP 811 — Guide for the Use of the International System of Units",
      url: "https://www.nist.gov/pml/special-publication-811"
    },
    {
      label: "NIST Handbook 133 — Checking the Net Contents of Packaged Goods",
      url: "https://www.nist.gov/pml/owm/handbook-133-current-edition"
    }
  ]
  // Currency: No ISO standard for exchange rates (rates are market-based)
};

function slugFromPath(urlPath) {
  // /conversions/length/feet-to-kilometers-converter -> feet-to-kilometers-converter
  const parts = urlPath.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

function normalizeUrl(url) {
  // Normalize URL for comparison
  return url.toLowerCase().replace(/\/$/, "").replace(/^https?:\/\//, "").replace(/^www\./, "");
}

function normalizeLabel(label) {
  // Normalize label for comparison - remove special chars and lowercase
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

    // Check if URL matches
    if (existingUrl && newUrl && existingUrl === newUrl) {
      return true;
    }

    // Check if label contains key standard identifier
    const standardIds = ["iso 80000", "iec 80000", "nist sp 811", "nist sp 330", "bipm si brochure"];
    for (const id of standardIds) {
      if (newLabel.includes(id) && existingLabel.includes(id)) {
        return true;
      }
    }
  }

  return false;
}

function main() {
  // Read CSV to get category/subcategory mappings
  const csvContent = fs.readFileSync(CSV_PATH, "utf8");
  const rows = parseCSV(csvContent);

  // Build a map of slug -> subcategory for Conversions category
  const slugToSubcategory = new Map();
  for (const row of rows) {
    if (row.category === "Conversions") {
      const slug = slugFromPath(row.slug);
      slugToSubcategory.set(slug, row.subcategory);
    }
  }

  console.log(`Found ${slugToSubcategory.size} conversion entries in CSV`);

  // Process each config file
  const configFiles = fs.readdirSync(CONFIGS_DIR).filter(f => f.endsWith(".json") && !f.includes("_raw_output"));

  let updatedCount = 0;
  let skippedCount = 0;
  let notFoundCount = 0;

  for (const filename of configFiles) {
    const slug = filename.replace(".json", "");
    const subcategory = slugToSubcategory.get(slug);

    if (!subcategory) {
      // Not a conversion tool
      continue;
    }

    const standardsCitations = STANDARDS_BY_SUBCATEGORY[subcategory];
    if (!standardsCitations) {
      console.log(`No standards defined for subcategory: ${subcategory} (${slug})`);
      notFoundCount++;
      continue;
    }

    const configPath = path.join(CONFIGS_DIR, filename);
    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (e) {
      console.error(`Failed to parse ${filename}: ${e.message}`);
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
    for (const citation of standardsCitations) {
      if (!hasSimilarCitation(config.page_content.citations, citation)) {
        config.page_content.citations.push(citation);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
      console.log(`Updated ${slug}: added ${addedCount} citation(s)`);
      updatedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log(`\nSummary:`);
  console.log(`  Updated: ${updatedCount} configs`);
  console.log(`  Skipped (already had citations): ${skippedCount} configs`);
  console.log(`  No standards for subcategory: ${notFoundCount} configs`);
}

main();
