'use client';

import { useEffect, useMemo, useState } from "react";

import {
  type ConversionContext,
  buildConversionTable,
  convertValue,
  getUnitById
} from "@/lib/conversions";
import { SharedChart } from "@/components/shared-chart";

interface ConversionCalculatorProps {
  fromUnitId: string;
  toUnitId: string;
}

export function ConversionCalculator({ fromUnitId, toUnitId }: ConversionCalculatorProps) {
  const storageKey = useMemo(() => `converter-${fromUnitId}-${toUnitId}`, [fromUnitId, toUnitId]);
  const [direction, setDirection] = useState<"forward" | "reverse">("forward");
  const [inputValue, setInputValue] = useState<string>("1");
  const [showChart, setShowChart] = useState(false);
  const [proMode, setProMode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "p") {
        setProMode((prev) => !prev);
      }
      if (event.key.toLowerCase() === "r") {
        setInputValue("1");
        setDirection("forward");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { inputValue?: string; direction?: "forward" | "reverse" };
        if (parsed.inputValue) setInputValue(parsed.inputValue);
        if (parsed.direction === "forward" || parsed.direction === "reverse") {
          setDirection(parsed.direction);
        }
      }
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ inputValue, direction }));
    } catch {
      /* ignore */
    }
  }, [storageKey, inputValue, direction]);

  const context = useMemo<ConversionContext | null>(() => {
    const from = getUnitById(fromUnitId);
    const to = getUnitById(toUnitId);

    if (!from || !to || from.kind !== to.kind) {
      return null;
    }

    return { from, to, kind: from.kind };
  }, [fromUnitId, toUnitId]);

  const parsedValue = Number.parseFloat(inputValue);
  const isValid = !Number.isNaN(parsedValue);

  const targetValue = useMemo(() => {
    if (!context || !isValid) {
      return NaN;
    }

    return convertValue(parsedValue, direction, context);
  }, [context, direction, parsedValue, isValid]);

  const table = useMemo(() => {
    if (!context) {
      return [];
    }
    const tableSeeds = direction === "forward" ? [1, 5, 10, 25, 50, 100] : [1, 10, 50, 100, 500];
    return buildConversionTable(tableSeeds, context, direction);
  }, [context, direction]);

  if (!context) {
    return (
      <section className="space-y-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        <p>Interactive converter unavailable for this calculator.</p>
        <p className="text-red-600">
          We could not resolve compatible units for this experience. Please verify the slug
          follows the pattern `from-unit-to-unit-converter`.
        </p>
      </section>
    );
  }

  const fromUnit = direction === "forward" ? context.from : context.to;
  const toUnit = direction === "forward" ? context.to : context.from;

  const caution =
    Number.isFinite(parsedValue) && parsedValue < 0
      ? "Questo valore negativo potrebbe non essere previsto per questa conversione."
      : Number.isFinite(parsedValue) && parsedValue > 1e9
        ? "Valore molto grande: verifica che l'unità sia corretta."
        : null;

  const handleSwap = () => {
    setDirection((state) => (state === "forward" ? "reverse" : "forward"));
    setInputValue(Number.isFinite(parsedValue) ? parsedValue.toString() : "1");
  };

  return (
    <section className="bento-grid converter-bento">
      <div className="bento-tile  bento-span-2 p-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-slate-900">
              Interactive Converter
            </h2>
            <p className="text-sm text-slate-500">
              Convert between {context.from.label.toLowerCase()} and{" "}
              {context.to.label.toLowerCase()} with precision rounding.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={handleSwap}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-slate-700"
            >
              Swap units
            </button>
            <button
              type="button"
              onClick={() => setProMode((prev) => !prev)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 shadow-sm hover:border-slate-300"
            >
              {proMode ? "Pro On (P)" : "Pro Off (P)"}
            </button>
          </div>
        </header>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              {fromUnit.label} ({fromUnit.symbol})
            </span>
            <input
              type="number"
              inputMode="decimal"
              value={inputValue}
              onChange={(event) => setInputValue(sanitizeInput(event.target.value))}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-lg font-semibold text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            {caution && <p className="text-xs text-amber-600">{caution}</p>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              {toUnit.label} ({toUnit.symbol})
            </span>
            <input
              type="text"
              readOnly
              value={isValid ? formatNumber(targetValue, toUnit.decimalPlaces) : "—"}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-lg font-semibold text-slate-900 shadow-sm"
            />
            {isValid && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(formatNumber(targetValue, toUnit.decimalPlaces));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="text-xs font-semibold text-slate-600 underline underline-offset-4 hover:text-slate-800"
              >
                {copied ? "Copiato!" : "Copia risultato"}
              </button>
            )}
          </label>
        </div>
      </div>

     {table.length > 0 && proMode && (
        <div className="bento-tile bento-span-2 p-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Visualization
            </h3>
            <button
              type="button"
              onClick={() => setShowChart((prev) => !prev)}
              className="text-xs font-semibold text-slate-600 underline underline-offset-4 hover:text-slate-800"
            >
              {showChart ? "Hide chart" : "Load chart"}
            </button>
          </div>
          {showChart ? (
            <div className="mt-3">
              <SharedChart
                description="Reference curve for common inputs"
                points={table.map((row) => ({
                  label: `${row.input} ${fromUnit.symbol}`,
                  value: row.output
                }))}
              />
            </div>
          ) : (
            <div className="mt-3 h-24 animate-pulse rounded-xl bg-slate-100" />
          )}
        </div>
      )}
      
      <div className="bento-tile bento-span-2 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Quick reference table
        </h3>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left font-semibold text-slate-700">
              <tr>
                <th className="px-4 py-3">{fromUnit.label}</th>
                <th className="px-4 py-3">{toUnit.label}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {table.map((row) => (
                <tr key={`${direction}-${row.input}`}>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {formatNumber(row.input, fromUnit.decimalPlaces)} {fromUnit.symbol}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatNumber(row.output, toUnit.decimalPlaces)} {toUnit.symbol}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

  

 
    </section>
  );
}

function formatNumber(value: number, decimals = 4) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return value.toLocaleString("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0
  });
}

function sanitizeInput(raw: string) {
  if (!raw) return "";
  let value = raw.replace(/[,\\s]/g, "").toLowerCase();
  const suffixes: Record<string, number> = { k: 1_000, m: 1_000_000, b: 1_000_000_000 };
  const suffix = value.slice(-1);
  let factor = 1;
  if (suffix in suffixes) {
    factor = suffixes[suffix];
    value = value.slice(0, -1);
  }
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) return raw;
  return String(parsed * factor);
}
