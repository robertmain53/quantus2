import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import axios from "axios";
import dotenv from "dotenv";
import archiver from "archiver";
import slugify from "slugify";
import puppeteer from "puppeteer";

dotenv.config();

const SERPER_API_KEY = process.env.SERPER_API_KEY;
if (!SERPER_API_KEY) {
  console.error("❌ Missing SERPER_API_KEY in .env");
  process.exit(1);
}

// ------------ CONFIG ------------
const RESULTS_PER_KEYWORD = 20;
const OUTPUT_DIR = path.join(process.cwd(), "../../input");
const KEYWORDS_FILE = path.join(process.cwd(), "keywords.txt");
const FETCH_DELAY_MS = 14000;
const PAGE_TIMEOUT_MS = 40000;
// -------------------------------

// map "engine" → { gl, hl }
const ENGINE_MAP = {
  "google.com": { gl: "us", hl: "en" },
  "google.es": { gl: "es", hl: "es" },
  "google.fr": { gl: "fr", hl: "fr" },
  "google.it": { gl: "it", hl: "it" },
  "google.de": { gl: "de", hl: "de" }
};

// small CLI parser
function parseCli() {
  const args = process.argv.slice(2);
  let engine = "google.com";
  const keywordParts = [];

  for (const arg of args) {
    if (arg.startsWith("--engine=")) {
      engine = arg.replace("--engine=", "").trim();
    } else {
      keywordParts.push(arg);
    }
  }

  const singleCliKeyword = keywordParts.join(" ").trim();
  return { engine, singleCliKeyword };
}

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

async function getSerpResults(keyword, engine) {
  const url = "https://google.serper.dev/search";

  const engineCfg = ENGINE_MAP[engine] || ENGINE_MAP["google.com"];

  const payload = {
    q: keyword,
    num: RESULTS_PER_KEYWORD,
    gl: engineCfg.gl,
    hl: engineCfg.hl
  };

  const headers = {
    "X-API-KEY": SERPER_API_KEY,
    "Content-Type": "application/json"
  };

  const { data } = await axios.post(url, payload, { headers });
  const organic = data.organic || [];
  return organic.slice(0, RESULTS_PER_KEYWORD).map((item, idx) => ({
    title: item.title,
    url: item.link,
    position: idx + 1
  }));
}

async function savePageAsMHTML(page, url, filePath) {
  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: PAGE_TIMEOUT_MS
  });

  const cdp = await page.target().createCDPSession();
  const { data: mhtml } = await cdp.send("Page.captureSnapshot", {
    format: "mhtml"
  });

  await fsp.writeFile(filePath, mhtml, "utf8");
}

async function zipFolder(folderPath, zipPath) {
  await fsp.mkdir(path.dirname(zipPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", (err) => reject(err));

    archive.pipe(output);
    archive.directory(folderPath, false);
    archive.finalize();
  });
}

async function processKeyword(keyword, page, engine, customFilename = null) {
  const slug = slugify(keyword, { lower: true, strict: true, trim: true });

  const zipFilename = customFilename || `${slug}.zip`;
  const zipPath = path.join(OUTPUT_DIR, zipFilename);

  if (fs.existsSync(zipPath)) {
    console.log(`\n⏭️ Skipping keyword "${keyword}": ZIP file already exists at ${zipPath}`);
    return;
  }

  const keywordDir = path.join(OUTPUT_DIR, slug);
  await fsp.mkdir(keywordDir, { recursive: true });

  console.log(`\n🔎 Keyword: "${keyword}" (engine: ${engine})`);
  let results;
  try {
    results = await getSerpResults(keyword, engine);
  } catch (err) {
    console.error("  ❌ Failed SERP:", err.message);
    return;
  }

  const manifest = {
    keyword,
    engine,
    ts: new Date().toISOString(),
    results: []
  };

  for (const result of results) {
    const safeTitle = slugify(result.title || "page", {
      lower: true,
      strict: true,
      trim: true
    });

    const filename = `${String(result.position).padStart(2, "0")}-${safeTitle}.mhtml`;
    const filePath = path.join(keywordDir, filename);

    console.log(`  → [${result.position}] ${result.url}`);

    try {
      await savePageAsMHTML(page, result.url, filePath);
      manifest.results.push({
        ...result,
        file: filename,
        status: "ok"
      });
    } catch (err) {
      console.warn(`    ⚠️ Failed to capture MHTML: ${err.message}`);
      manifest.results.push({
        ...result,
        file: null,
        status: "error",
        error: err.message
      });
    }

    await wait(FETCH_DELAY_MS);
  }

  const manifestPath = path.join(keywordDir, "manifest.json");
  await fsp.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  await zipFolder(keywordDir, zipPath);

  console.log(`  ✅ Done: ${zipPath}`);
}

async function readKeywordsFromFile(defaultEngine) {
  try {
    const raw = await fsp.readFile(KEYWORDS_FILE, "utf8");
    const lines = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    // each line can be:
    // google.it|calcolatore cilindro
    // google.it|calcolatore cilindro|custom-filename.zip
    // or just: calcolatore cilindro
    return lines.map((line) => {
      const hasPipe = line.includes("|");
      if (hasPipe) {
        const parts = line.split("|").map(p => p.trim());
        const engine = parts[0];
        let keyword = "";
        let filename = null;

        if (parts.length === 2) {
          // engine|keyword
          keyword = parts[1];
        } else if (parts.length >= 3) {
          // engine|keyword|filename (last part is filename)
          filename = parts[parts.length - 1];
          keyword = parts.slice(1, -1).join("|"); // everything in between
        }

        return {
          engine: engine || defaultEngine,
          keyword,
          filename
        };
      } else {
        return {
          engine: defaultEngine,
          keyword: line,
          filename: null
        };
      }
    });
  } catch (err) {
    return [];
  }
}

async function main() {
  await fsp.mkdir(OUTPUT_DIR, { recursive: true });

  const { engine: cliEngine, singleCliKeyword } = parseCli();

  let keywordEnginePairs = [];

  if (singleCliKeyword) {
    keywordEnginePairs = [{ engine: cliEngine, keyword: singleCliKeyword }];
  } else {
    keywordEnginePairs = await readKeywordsFromFile(cliEngine);
  }

  if (!keywordEnginePairs.length) {
    console.log("ℹ️ No keywords. Examples:");
    console.log('   node index.js --engine=google.it "calcolatore volume cilindro"');
    console.log("   or in keywords.txt:");
    console.log("   google.fr|calcul volume cylindre");
    console.log("   google.es|conversor de torque");
    process.exit(0);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();

  for (const { engine, keyword, filename } of keywordEnginePairs) {
    await processKeyword(keyword, page, engine, filename);
  }

  await browser.close();
  console.log("\n🎉 All done.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
