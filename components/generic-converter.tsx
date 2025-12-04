'use client';

import type { CalculatorConfig, ConversionLogicConfig } from "@/lib/calculator-config";
import { ConversionCalculator } from "@/components/conversion-calculator";

interface GenericConverterProps {
  config: CalculatorConfig | null;
}

export function GenericConverter({ config }: GenericConverterProps) {
  const conversionLogic = getConversionLogic(config);

  if (!conversionLogic) {
    return (
      <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <h2 className="text-base font-semibold">Converter configuration required</h2>
        <p>
          Provide <code>logic.type = &quot;conversion&quot;</code> with <code>fromUnitId</code> and{" "}
          <code>toUnitId</code> inside <code>config_json</code> to enable the interactive
          experience.
        </p>
      </section>
    );
  }

  return (
    <div className="bento-grid  bento-span-1 "> 
      <div className="bento-tile bento-span-2  p-3">
        <ConversionCalculator
          fromUnitId={conversionLogic.fromUnitId}
          toUnitId={conversionLogic.toUnitId}
        />
      </div>
      <div className=" p-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          How this is calculated
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          Conversions use precise factors from our unit library. We normalize to SI base units,
          then apply the forward and reverse factors so swapping directions keeps accuracy.
        </p>
      </div>
    </div>
  );
}

function getConversionLogic(config: CalculatorConfig | null): ConversionLogicConfig | null {
  if (!config) {
    return null;
  }
  const logic = config.logic;
  return isConversionLogic(logic) ? logic : null;
}

function isConversionLogic(
  logic: CalculatorConfig["logic"] | null | undefined
): logic is ConversionLogicConfig {
  return Boolean(
    logic &&
    logic.type === "conversion" &&
    "fromUnitId" in logic &&
    "toUnitId" in logic
  );
}
