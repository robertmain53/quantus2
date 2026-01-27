const CURRENCY_SYMBOL_TO_CODE: Record<string, string> = {
  "$": "USD",
  "US$": "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  "C$": "CAD",
  "A$": "AUD",
  "NZ$": "NZD",
  "CHF": "CHF"
};

const CURRENCY_LOCALE: Record<string, string> = {
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  JPY: "ja-JP",
  AUD: "en-AU",
  CAD: "en-CA",
  CHF: "de-CH",
  CNY: "zh-CN",
  HKD: "en-HK",
  SGD: "en-SG",
  NZD: "en-NZ",
  SEK: "sv-SE",
  NOK: "nb-NO",
  DKK: "da-DK",
  PLN: "pl-PL",
  CZK: "cs-CZ",
  HUF: "hu-HU",
  RON: "ro-RO",
  TRY: "tr-TR",
  RUB: "ru-RU",
  INR: "en-IN",
  BRL: "pt-BR",
  MXN: "es-MX",
  ZAR: "en-ZA",
  KRW: "ko-KR",
  THB: "th-TH",
  IDR: "id-ID",
  MYR: "ms-MY",
  PHP: "en-PH",
  AED: "ar-AE",
  SAR: "ar-SA",
  ILS: "he-IL"
};

export function resolveCurrencyCode(unit?: string, unitId?: string): string | null {
  if (unitId) {
    const upperId = unitId.trim().toUpperCase();
    if (/^[A-Z]{3}$/.test(upperId)) {
      return upperId;
    }
  }

  if (!unit) {
    return null;
  }

  const raw = unit.trim();
  if (!raw) {
    return null;
  }

  const upper = raw.toUpperCase();
  if (upper === "CURRENCY") {
    return "USD";
  }

  if (/^[A-Z]{3}$/.test(upper)) {
    return upper;
  }

  if (raw in CURRENCY_SYMBOL_TO_CODE) {
    return CURRENCY_SYMBOL_TO_CODE[raw];
  }

  const match = upper.match(/\b[A-Z]{3}\b/);
  if (match) {
    return match[0];
  }

  return null;
}

export function resolveCurrencyLocale(currencyCode: string): string {
  return CURRENCY_LOCALE[currencyCode] ?? "en-US";
}

export function formatCurrencyValue(
  value: number,
  currencyCode: string,
  decimals = 2,
  locale?: string
) {
  const resolvedLocale = locale ?? resolveCurrencyLocale(currencyCode);
  const formatter = new Intl.NumberFormat(resolvedLocale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: decimals,
    minimumFractionDigits: Math.min(2, Math.max(0, decimals))
  });
  return formatter.format(value);
}

export function formatNumberValue(value: number, decimals = 4, locale = "en-US") {
  return value.toLocaleString(locale, { maximumFractionDigits: decimals });
}

export function getDisplayUnit(format?: string, unit?: string, unitId?: string) {
  const currencyCode = resolveCurrencyCode(unit, unitId);
  if ((format === "currency" || unit?.toLowerCase() === "currency") && currencyCode) {
    return currencyCode;
  }
  return unit ?? "—";
}

export function formatDisplayValue(
  value: number,
  format?: string,
  unit?: string,
  unitId?: string,
  decimals?: number
) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  const currencyCode = resolveCurrencyCode(unit, unitId);
  if (format === "currency" || unit?.toLowerCase() === "currency" || currencyCode) {
    if (currencyCode) {
      return formatCurrencyValue(value, currencyCode, decimals ?? 2);
    }
    if (unit && unit.trim()) {
      return `${formatNumberValue(value, decimals ?? 2)} ${unit.trim()}`;
    }
    return formatCurrencyValue(value, "USD", decimals ?? 2);
  }

  switch (format) {
    case "percent":
      return `${(value * 100).toFixed(2)}%`;
    case "integer":
      return Math.round(value).toLocaleString("en-US");
    case "decimal":
      return formatNumberValue(value, decimals ?? 4);
    default:
      return formatNumberValue(value, decimals ?? 4);
  }
}
