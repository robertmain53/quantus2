'use client';

import { useMemo, useState } from "react";

import {
  type CalculatorComponentType,
  validateCalculatorConfig
} from "@/lib/calculator-config";

import { GenericConverter } from "@/components/generic-converter";
import { GenericSimpleCalculator } from "@/components/generic-simple-calculator";

const SAMPLE_CONFIG = `{
  "version": "1.0.0",
  "metadata": {
    "title": "Meters to Feet Converter",
    "description": "Convert meters to feet with precision and see worked examples."
  },
  "logic": {
    "type": "conversion",
    "fromUnitId": "meter",
    "toUnitId": "foot"
  },
  "page_content": {
    "introduction": [
      "Convert meters to feet instantly with engineering-grade precision.",
      "Adjust any value to see the corresponding conversion."
    ],
    "methodology": [
      "We anchor the conversion to SI base units and apply the official 3.28084 multiplier.",
      "All results are rounded to four decimal places for readability."
    ],
    "faqs": [
      {
        "question": "How many feet are in a meter?",
        "answer": "One meter equals approximately 3.28084 feet."
      }
    ],
    "citations": [
      {
        "label": "NIST Guide to SI Units",
        "url": "https://www.nist.gov/pml/owm/si-units"
      }
    ]
  },
  "links": {
    "internal": [
      "/conversions/length/meters-to-centimeters-converter"
    ]
  }
}`;

export function ConfigPlayground() {
  const [rawConfig, setRawConfig] = useState<string>(SAMPLE_CONFIG);
  const [componentType, setComponentType] = useState<CalculatorComponentType>("converter");

  const validation = useMemo(() => validateCalculatorConfig(rawConfig, "playground"), [rawConfig]);
  const validationErrors = validation.errors;
  const parsedConfig = validation.config;

  const inferredComponentType = useMemo<CalculatorComponentType | null>(() => {
    if (!parsedConfig || !parsedConfig.logic) {
      return null;
    }
    if (parsedConfig.logic.type === "conversion") {
      return "converter";
    }
    if (parsedConfig.logic.type === "formula") {
      return "simple_calc";
    }
    return null;
  }, [parsedConfig]);

  const activeComponentType = inferredComponentType ?? componentType;

  const preview = useMemo(() => {
    if (!parsedConfig || validationErrors.length > 0) {
      return null;
    }

    switch (activeComponentType) {
      case "converter":
        return <GenericConverter config={parsedConfig} />;
      case "simple_calc":
        return <GenericSimpleCalculator config={parsedConfig} />;
      case "advanced_calc":
        return (
          <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            <h2 className="text-base font-semibold">Advanced calculator preview</h2>
            <p>
              Support for advanced calculators will be added once the engine contract is finalized.
              Validation succeeds, but runtime rendering is not available yet.
            </p>
          </section>
        );
      default:
        return null;
    }
  }, [activeComponentType, parsedConfig, validationErrors.length]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Select component type
            <select
              value={componentType}
              onChange={(event) => setComponentType(event.target.value as CalculatorComponentType)}
              className="w-48 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              <option value="converter">converter</option>
              <option value="simple_calc">simple_calc</option>
              <option value="advanced_calc">advanced_calc</option>
            </select>
          </label>
          {inferredComponentType && (
            <p className="text-xs text-slate-500">
              Inferred from config: <span className="font-medium">{inferredComponentType}</span>
            </p>
          )}
        </div>
        <textarea
          value={rawConfig}
          onChange={(event) => setRawConfig(event.target.value)}
          spellCheck={false}
          className="h-[540px] w-full rounded-xl border border-slate-300 bg-slate-900 font-mono text-sm text-slate-100 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        {validationErrors.length > 0 ? (
          <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <h2 className="font-semibold">Validation errors</h2>
            <ul className="list-disc space-y-1 pl-5">
              {validationErrors.map((error, index) => (
                <li key={`error-${index}`}>{error}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Config validated successfully. Paste this JSON into the CSV once the review is
            complete.
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p>
            Paste <code>config_json</code> on the left to preview how the generic engines will render
            that configuration. Validation runs automatically as you type.
          </p>
        </div>
        <div className="space-y-4">
          {preview ?? (
            <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm shadow-slate-200">
              <h2 className="text-base font-semibold text-slate-800">Awaiting valid config</h2>
              <p>Fix validation errors to render the interactive preview.</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
