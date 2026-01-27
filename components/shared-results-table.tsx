import type { CalculatorFormOutput } from "@/lib/calculator-config";
import { formatDisplayValue, getDisplayUnit } from "@/lib/formatting";

interface SharedResultsTableProps {
  outputs: Array<{
    id: string;
    label: string;
    value: number;
    unit?: string;
    format?: string;
  }>;
}

export function SharedResultsTable({ outputs }: SharedResultsTableProps) {
  if (!outputs.length) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">
              Output
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">
              Value
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700">
              Unit
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {outputs.map((output) => (
            <tr key={output.id}>
              <td className="px-4 py-3 text-slate-800">{output.label}</td>
              <td className="px-4 py-3 font-semibold text-slate-900">
                {formatDisplayValue(output.value, output.format, output.unit)}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {getDisplayUnit(output.format, output.unit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
