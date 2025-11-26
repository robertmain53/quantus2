import { NextResponse } from "next/server";

interface EcbCache {
  rates: Map<string, Map<string, number>>;
  fetchedAt: number;
}

const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const ECB_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.xml";
const SUPPORTED = new Set(["USD", "EUR", "GBP"]);

let cache: EcbCache | null = null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = (searchParams.get("base") ?? "USD").toUpperCase();
  const quote = (searchParams.get("quote") ?? "EUR").toUpperCase();
  const dateParam = searchParams.get("date") ?? undefined;

  if (!SUPPORTED.has(base) || !SUPPORTED.has(quote)) {
    return NextResponse.json({ error: "Only USD, EUR, and GBP are supported" }, { status: 400 });
  }

  const { rates } = await loadEcbRates();
  const orderedDates = Array.from(rates.keys()).sort((a, b) => (a < b ? 1 : -1));
  let targetDate: string | undefined = dateParam ?? orderedDates[0];

  if (targetDate && !rates.has(targetDate)) {
    const lookupDate = targetDate;
    targetDate = orderedDates.find((d) => d <= lookupDate);
  }

  const resolvedDate = targetDate ?? orderedDates[0];
  const dateRates = resolvedDate ? rates.get(resolvedDate) : undefined;
  const rate = resolveRate(base, quote, dateRates);
  if (!Number.isFinite(rate)) {
    return NextResponse.json({ error: "Rate unavailable" }, { status: 503 });
  }

  return NextResponse.json({
    base,
    quote,
    rate: Number(rate.toFixed(6)),
    dateUsed: resolvedDate,
    source: "ECB reference rate",
    fetchedAt: new Date().toISOString()
  });
}

async function loadEcbRates(): Promise<EcbCache> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache;
  }

  const response = await fetch(ECB_URL, { next: { revalidate: 60 * 60 } });
  if (!response.ok) {
    if (cache) return cache;
    throw new Error("Failed to fetch ECB rates");
  }

  const xml = await response.text();
  const rates = parseEcbXml(xml);
  cache = { rates, fetchedAt: now };
  return cache;
}

function parseEcbXml(xml: string): Map<string, Map<string, number>> {
  const rates = new Map<string, Map<string, number>>();
  const dayRegex = /<Cube time=['"]([^'"]+)['"]>([\s\S]*?)<\/Cube>/g;
  let dayMatch: RegExpExecArray | null;

  while ((dayMatch = dayRegex.exec(xml)) !== null) {
    const date = dayMatch[1];
    const dayBlock = dayMatch[2];
    const currencyRegex = /<Cube currency=['"]([A-Z]{3})['"] rate=['"]([0-9.]+)['"]\s*\/?/g;
    let currencyMatch: RegExpExecArray | null;
    const dayRates = new Map<string, number>();

    while ((currencyMatch = currencyRegex.exec(dayBlock)) !== null) {
      const currency = currencyMatch[1];
      const rate = Number.parseFloat(currencyMatch[2]);
      if (Number.isFinite(rate)) {
        dayRates.set(currency, rate);
      }
    }

    if (dayRates.size > 0) {
      rates.set(date, dayRates);
    }
  }

  return rates;
}

function resolveRate(
  base: string,
  quote: string,
  dateRates?: Map<string, number>
): number {
  if (!dateRates) return NaN;
  if (base === quote) return 1;

  // ECB gives rates as 1 EUR = X <currency>.
  const toEur = (currency: string) => {
    if (currency === "EUR") return 1;
    const rate = dateRates.get(currency);
    return rate ? 1 / rate : NaN;
  };

  const fromEur = (currency: string) => {
    if (currency === "EUR") return 1;
    return dateRates.get(currency) ?? NaN;
  };

  if (base === "EUR") {
    return fromEur(quote);
  }

  if (quote === "EUR") {
    return toEur(base);
  }

  const eurPerBase = toEur(base);
  const quotePerEur = fromEur(quote);
  return eurPerBase * quotePerEur;
}
