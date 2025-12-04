'use client';

import { useMemo, useRef } from "react";

interface Point {
  label: string;
  value: number;
}

interface SharedChartProps {
  title?: string;
  description?: string;
  points: Point[];
  xLabel?: string;
  yLabel?: string;
}

export function SharedChart({ title, description, points, xLabel, yLabel }: SharedChartProps) {
  const validPoints = useMemo(() => points.filter((p) => Number.isFinite(p.value)), [points]);
  const svgRef = useRef<SVGSVGElement | null>(null);

  if (validPoints.length < 1) {
    return (
      <div className="space-y-2">
        {title && (
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
        )}
        {description && <p className="text-xs text-slate-500">{description}</p>}
        <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
        <p className="text-xs text-slate-500">Add inputs to see a visualization.</p>
      </div>
    );
  }

  const { min, max } =
    validPoints.length === 1
      ? { min: validPoints[0].value, max: validPoints[0].value }
      : validPoints.reduce(
          (acc, p) => ({
            min: Math.min(acc.min, p.value),
            max: Math.max(acc.max, p.value)
          }),
          { min: validPoints[0].value, max: validPoints[0].value }
        );

  const range = max - min || 1;
  const height = 120;
  const width = 320;
  const margin = 8;
  const firstLabel = validPoints[0]?.label ?? "";
  const lastLabel = validPoints[validPoints.length - 1]?.label ?? "";
  const formatLabel = (text: string) => (text.length > 14 ? `${text.slice(0, 12)}…` : text);

  const path = validPoints
    .map((p, idx) => {
      const x =
        validPoints.length === 1
          ? width / 2
          : margin + (idx / (validPoints.length - 1)) * (width - margin * 2);
      const y = height - margin - ((p.value - min) / range) * (height - margin * 2);
      return `${idx === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const handleExportCsv = () => {
    const header = "label,value\n";
    const rows = validPoints.map((p) => `${escapeCsv(p.label)},${p.value}`).join("\n");
    downloadFile("chart.csv", "text/csv", header + rows);
  };

  const handleExportJson = () => {
    downloadFile("chart.json", "application/json", JSON.stringify(validPoints, null, 2));
  };

  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const blob = new Blob([svgRef.current.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    downloadUrl("chart.svg", url);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          {title && (
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
          )}
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={handleExportCsv}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 shadow-sm hover:border-slate-300"
          >
            CSV
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 shadow-sm hover:border-slate-300"
          >
            JSON
          </button>
          <button
            type="button"
            onClick={handleExportSvg}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 shadow-sm hover:border-slate-300"
          >
            SVG
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={title ?? "Chart"}
        >
          <rect width={width} height={height} fill="#f8fafc" />
          <line
            x1={margin}
            y1={height - margin}
            x2={width - margin}
            y2={height - margin}
            stroke="#cbd5e1"
            strokeWidth={1}
          />
          <line
            x1={margin}
            y1={margin}
            x2={margin}
            y2={height - margin}
            stroke="#cbd5e1"
            strokeWidth={1}
          />
          <path d={path} fill="none" stroke="#0ea5e9" strokeWidth={2} />
          {xLabel && (
            <text
              x={width / 2}
              y={height - 2}
              textAnchor="middle"
              fontSize="10"
              fill="#475569"
            >
              {xLabel}
            </text>
          )}
          {yLabel && (
            <text
              x={10}
              y={height / 2}
              textAnchor="middle"
              fontSize="10"
              fill="#475569"
              transform={`rotate(-90 10 ${height / 2})`}
            >
              {yLabel}
            </text>
          )}
          <text x={width - margin} y={height - 12} textAnchor="end" fontSize="10" fill="#94a3b8">
            {formatLabel(lastLabel)}
          </text>
          <text x={margin} y={height - 12} textAnchor="start" fontSize="10" fill="#94a3b8">
            {formatLabel(firstLabel)}
          </text>
          <text x={margin + 2} y={margin + 10} fontSize="10" fill="#94a3b8">
            {max.toLocaleString("en-US", { maximumFractionDigits: 4 })}
          </text>
          <text x={margin + 2} y={height - margin - 4} fontSize="10" fill="#94a3b8">
            {min.toLocaleString("en-US", { maximumFractionDigits: 4 })}
          </text>
          {validPoints.map((p, idx) => {
            const x =
              validPoints.length === 1
                ? width / 2
                : margin + (idx / (validPoints.length - 1)) * (width - margin * 2);
            const y = height - margin - ((p.value - min) / range) * (height - margin * 2);
            return <circle key={p.label + idx} cx={x} cy={y} r={3} fill="#1e3a8a" />;
          })}
        </svg>
      </div>
      <p className="text-xs text-slate-500">
        Range {min.toLocaleString("en-US")} → {max.toLocaleString("en-US")} across{" "}
        {validPoints.length} point{validPoints.length === 1 ? "" : "s"}.
      </p>
    </div>
  );
}

function downloadFile(filename: string, type: string, content: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  downloadUrl(filename, url);
  URL.revokeObjectURL(url);
}

function downloadUrl(filename: string, url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
