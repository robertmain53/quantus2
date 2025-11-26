import { NextResponse } from "next/server";

interface EcbCache {
  rates: Map<string, Map<string, number>>;
  fetchedAt: number;
}

const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const ECB_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml";

let cache: EcbCache | null = null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = (searchParams.get("base") ?? "USD").toUpperCase();
  const quote = (searchParams.get("quote") ?? "EUR").toUpperCase();
  const dateParam = searchParams.get("date") ?? undefined;

  if (!(base === "USD" && quote === "EUR")) {
    return NextResponse.json({ error: "Only USD to EUR is supported" }, { status: 400 });
  }

  const { rates } = await loadEcbRates();
  const orderedDates = Array.from(rates.keys()).sort((a, b) => (a < b ? 1 : -1));
  let targetDate: string | undefined = dateParam ?? orderedDates[0];

  if (targetDate && !rates.has(targetDate)) {
    targetDate = orderedDates.find((d) => d <= targetDate) ?? orderedDates[0];
  }

  const dateRates = targetDate ? rates.get(targetDate) : undefined;
  const usdRate = dateRates?.get("USD");

  if (!usdRate) {
    return NextResponse.json({ error: "Rate unavailable" }, { status: 503 });
  }

  const usdToEur = 1 / usdRate;

  return NextResponse.json({
    base,
    quote,
    rate: Number(usdToEur.toFixed(6)),
    dateUsed: targetDate,
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
