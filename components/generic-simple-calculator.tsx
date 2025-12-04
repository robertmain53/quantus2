'use client';

import { useEffect, useMemo, useState } from "react";

import type {
  CalculatorConfig,
  CalculatorFormConfig,
  CalculatorFormField,
  CalculatorFormOutput,
  CalculatorLogicConfig,
  FormulaLogicConfig
} from "@/lib/calculator-config";
import { SharedResultsTable } from "@/components/shared-results-table";
import { SharedChart } from "@/components/shared-chart";

interface GenericSimpleCalculatorProps {
  config: CalculatorConfig | null;
}

interface CompiledOutput extends CalculatorFormOutput {
  evaluate: (variables: Record<string, number>) => number;
}

export function GenericSimpleCalculator({ config }: GenericSimpleCalculatorProps) {
  const form = config?.form;
  const logic = isFormulaLogic(config?.logic) ? (config?.logic ?? null) : null;

  if (!form || !logic) {
    return (
      <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <h2 className="text-base font-semibold">Formula configuration required</h2>
        <p>
          Provide <code>form.fields</code>, <code>form.result.outputs</code>, and{" "}
          <code>logic.type = &quot;formula&quot;</code> with output expressions in{" "}
          <code>config_json</code> to enable the simple calculator experience.
        </p>
      </section>
    );
  }

  return <SimpleCalculatorForm form={form} logic={logic} />;
}

interface SimpleCalculatorFormProps {
  form: CalculatorFormConfig;
  logic: FormulaLogicConfig;
}

function SimpleCalculatorForm({ form, logic }: SimpleCalculatorFormProps) {
  const fieldsSource = form.fields;
  const fields = useMemo(
    () => (fieldsSource ? [...fieldsSource] : []),
    [fieldsSource]
  );
  const fieldIds = useMemo(() => fields.map((field) => field.id), [fields]);

  const initialValues = useMemo(() => {
    return fields.reduce<Record<string, string>>((acc, field) => {
      acc[field.id] = field.defaultValue ?? "";
      return acc;
    }, {});
  }, [fields]);

  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [fetchMeta, setFetchMeta] = useState<Record<string, string>>({});

  const fetchableFields = useMemo(() => fields.filter((field) => field.fetchUrl), [fields]);
  const fetchSignature = useMemo(() => {
    return fetchableFields
      .map((field) => {
        const dateKey = field.fetchDateField ? values[field.fetchDateField] ?? "" : "";
        return `${field.id}:${dateKey}`;
      })
      .join("|");
  }, [fetchableFields, values]);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (fetchableFields.length === 0) {
      return;
    }

    fetchableFields.forEach(async (field) => {
      try {
        const url = new URL(field.fetchUrl!, window.location.origin);
        if (field.fetchDateField && values[field.fetchDateField]) {
          url.searchParams.set("date", values[field.fetchDateField]);
        }
        const response = await fetch(url.toString());
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as {
          rate?: number;
          dateUsed?: string;
          fetchedAt?: string;
        };
        if (typeof data.rate === "number") {
          setValues((prev) => ({ ...prev, [field.id]: String(data.rate) }));
          const metaParts: string[] = [];
          if (data.dateUsed) metaParts.push(`Rate date ${data.dateUsed}`);
          if (data.fetchedAt) metaParts.push(`Fetched ${data.fetchedAt}`);
          setFetchMeta((prev) => ({ ...prev, [field.id]: metaParts.join(" · ") }));
        }
      } catch (error) {
        console.error(`Failed to fetch ${field.id} from ${field.fetchUrl}`, error);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchSignature]);

  const compiledOutputs = useMemo<CompiledOutput[]>(() => {
    return logic.outputs.map((output) => ({
      ...output,
      evaluate: compileExpression(output.expression, fieldIds)
    }));
  }, [logic.outputs, fieldIds]);

  const numericValues = useMemo<Record<string, number>>(() => {
    return fieldIds.reduce<Record<string, number>>((acc, id) => {
      const raw = values[id];
      const parsed = Number.parseFloat(raw);
      if (!Number.isNaN(parsed)) {
        acc[id] = parsed;
      }
      return acc;
    }, {});
  }, [values, fieldIds]);

  const outputs = useMemo(() => {
    return compiledOutputs.map((output) => {
      const value = output.evaluate(numericValues);
      return {
        id: output.id,
        label: output.label,
        value,
        unit: output.unit,
        format: output.format
      };
    });
  }, [compiledOutputs, numericValues]);

  const [showDetails, setShowDetails] = useState(false);
  const [showChart, setShowChart] = useState(false);

  return (
    <section className="bento-grid">
      <div className="bento-tile p-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Inputs
          </h3>
          <button
            type="button"
            className="text-xs font-semibold text-slate-500 underline underline-offset-4 hover:text-slate-700"
            onClick={() => setValues(initialValues)}
          >
            Reset
          </button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.id} className="space-y-2">
              <span className="text-sm font-medium text-slate-700">{field.label}</span>
              {renderInput(field, values[field.id] ?? "", (next) =>
                setValues((prev) => ({ ...prev, [field.id]: next }))
              )}
              {renderFieldMeta(field, fetchMeta[field.id])}
            </label>
          ))}
        </div>
      </div>

      <div className="bento-tile p-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Results
          </h3>
          <span className="text-xs font-semibold text-emerald-600">Updates as you type</span>
        </div>
        {outputs.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {outputs.map((output) => (
              <div
                key={output.id}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="text-sm font-medium text-slate-600">{output.label}</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {formatOutputValue(output.value, output.format, output.unit)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">Start entering values to see calculated results.</p>
        )}
        {outputs.length > 0 && (
          <div className="mt-4">
            <SharedResultsTable outputs={outputs} />
          </div>
        )}
      </div>

      <div className="bento-tile bento-span-2 p-6">
        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:border-slate-300"
        >
          <span>How this is calculated</span>
          <span aria-hidden className="text-slate-500">{showDetails ? "▲" : "▼"}</span>
        </button>

        {showDetails && (
          <div className="mt-4 space-y-4 text-sm text-slate-700">
            {compiledOutputs.map((output) => (
              <div
                key={`audit-${output.id}`}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <p className="text-sm font-semibold text-slate-800">{output.label}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">Expression</p>
                <code className="mt-1 block overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                  {getOutputExpression(compiledOutputs, output.id)}
                </code>
                <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">Inputs used</p>
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  {fieldIds.map((id) => (
                    <li key={`input-${output.id}-${id}`} className="flex justify-between">
                      <span className="text-slate-500">{id}</span>
                      <span className="font-semibold text-slate-800">
                        {Number.isFinite(numericValues[id])
                          ? numericValues[id].toLocaleString("en-US", {
                              maximumFractionDigits: 6
                            })
                          : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {outputs.length > 1 && (
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
                description="Trend across computed outputs"
                points={outputs.map((o, idx) => ({
                  label: o.label ?? `Output ${idx + 1}`,
                  value: o.value
                }))}
              />
            </div>
          ) : (
            <div className="mt-3 h-24 animate-pulse rounded-xl bg-slate-100" />
          )}
        </div>
      )}
    </section>
  );
}

function renderInput(
  field: CalculatorFormField,
  value: string,
  onChange: (value: string) => void
) {
  if (field.type === "date") {
    return (
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      >
        <option value="">Select...</option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  const inputType = field.type === "integer" ? "number" : "number";
  const step =
    field.step ??
    (field.type === "integer"
      ? 1
      : field.type === "percent"
        ? 0.01
        : field.type === "currency"
          ? 0.01
          : "any");

  return (
    <input
      type={inputType}
      inputMode="decimal"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      min={field.min}
      max={field.max}
      step={step}
      placeholder={field.placeholder}
      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
    />
  );
}

function renderFieldMeta(field: CalculatorFormField, fetchedMeta?: string) {
  const hints: string[] = [];

  if (field.helpText) {
    hints.push(field.helpText);
  }
  if (field.placeholder) {
    hints.push(field.placeholder);
  }
  if (typeof field.min === "number") {
    hints.push(`Min ${field.min}`);
  }
  if (typeof field.max === "number") {
    hints.push(`Max ${field.max}`);
  }
  if (fetchedMeta) {
    hints.push(fetchedMeta);
  }

  if (hints.length === 0) {
    return null;
  }

  return <p className="text-xs text-slate-500">{hints.join(" · ")}</p>;
}

function compileExpression(expression: string, fieldIds: string[]) {
  const uniqueFieldIds = Array.from(new Set(fieldIds));
  const helperEntries: Array<[string, unknown]> = [
    ["pow", Math.pow],
    ["min", Math.min],
    ["max", Math.max],
    ["abs", Math.abs],
    ["sqrt", Math.sqrt],
    ["log", Math.log],
    ["exp", Math.exp],
    ["Math", Math]
  ];
  const helperKeys = helperEntries.map(([key]) => key);

  try {
    // eslint-disable-next-line no-new-func
    const evaluator = new Function(
      ...uniqueFieldIds,
      ...helperKeys,
      `"use strict"; return (${expression});`
    ) as (...args: unknown[]) => number;

    return (variables: Record<string, number>) => {
      const computedValues = uniqueFieldIds.map((id) => variables[id] ?? NaN);
      const helperValues = helperEntries.map(([, value]) => value);
      const args: unknown[] = [...computedValues, ...helperValues];
      try {
        const result = evaluator(...args);
        return typeof result === "number" && Number.isFinite(result) ? result : NaN;
      } catch {
        return NaN;
      }
    };
  } catch {
    return () => NaN;
  }
}

function formatOutputValue(value: number, format?: string, unit?: string) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  if (!format) {
    return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
  }

  switch (format) {
    case "currency": {
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2
      });
      return formatter.format(value);
    }
    case "percent": {
      return `${(value * 100).toFixed(2)}%`;
    }
    case "decimal": {
      return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
    }
    case "integer": {
      return Math.round(value).toLocaleString("en-US");
    }
    default: {
      const formatted = value.toLocaleString("en-US", { maximumFractionDigits: 4 });
      return unit ? `${formatted} ${unit}` : formatted;
    }
  }
}

function isFormulaLogic(
  logic: CalculatorLogicConfig | null | undefined
): logic is FormulaLogicConfig {
  if (!logic || logic.type !== "formula") {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(logic, "outputs") && Array.isArray((logic as FormulaLogicConfig).outputs);
}

function getOutputExpression(outputs: CompiledOutput[], outputId: string) {
  const match = outputs.find((o) => o.id === outputId);
  return match && "expression" in match ? (match as unknown as { expression?: string }).expression ?? "" : "";
}
