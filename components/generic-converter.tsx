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
          Provide <code>logic.type = "conversion"</code> with <code>fromUnitId</code> and{" "}
          <code>toUnitId</code> inside <code>config_json</code> to enable the interactive
          experience.
        </p>
      </section>
    );
  }

  return (
    <ConversionCalculator
      fromUnitId={conversionLogic.fromUnitId}
      toUnitId={conversionLogic.toUnitId}
    />
  );
}

function getConversionLogic(config: CalculatorConfig | null): ConversionLogicConfig | null {
  if (!config || !config.logic) {
    return null;
  }
  return config.logic.type === "conversion" ? config.logic : null;
}
