"use client";

import { useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  BalanceSheetCalculated,
  BalanceSheetProjectionInputs,
  DRECalculated,
} from "@/core/types";
import { formatCurrency, formatCompactNumber } from "@/lib/utils/formatters";

const CHART_CONFIG = {
  colors: {
    capitalGiro: "var(--primary-800)", // Navy blue (âncora exata da escala)
    ncg: "var(--primary-400)", // Azul médio
    vendasNcg: "var(--neutral-400)", // Cinza neutro para linha indicadora
  },
  line: {
    strokeWidth: 2,
    dotRadius: 4,
    activeDotRadius: 6,
  },
} as const;

const INDICATOR_LINE_PROPS = {
  yAxisId: "right" as const,
  type: "monotone" as const,
  dataKey: "vendasCapitalGiro",
  name: "Vendas / Capital de Giro (x)",
  stroke: CHART_CONFIG.colors.vendasNcg,
  strokeWidth: CHART_CONFIG.line.strokeWidth,
  dot: {
    r: CHART_CONFIG.line.dotRadius,
    fill: CHART_CONFIG.colors.vendasNcg,
  },
  activeDot: { r: CHART_CONFIG.line.activeDotRadius },
  connectNulls: false,
};

interface TooltipPayloadEntry {
  name: string;
  value: number | null;
  color: string;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-md">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => {
          if (entry.value === null || entry.value === undefined) return null;
          const isMultiple = entry.dataKey === "vendasCapitalGiro";
          return (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}:{" "}
              {isMultiple
                ? `${entry.value.toFixed(2)}x`
                : formatCurrency(entry.value)}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
}

interface WorkingCapitalChartProps {
  data: BalanceSheetCalculated[];
  projectionInputs?: BalanceSheetProjectionInputs[];
  dreData?: DRECalculated[];
}

export function WorkingCapitalChart({
  data,
  dreData,
}: WorkingCapitalChartProps) {
  const [showNcg, setShowNcg] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado disponivel para o grafico
      </div>
    );
  }

  const dreByYear = Object.fromEntries(
    (dreData ?? []).map((d) => [d.year, d.receitaBruta]),
  );

  const chartData = data
    .filter((d) => d.year > 0)
    .sort((a, b) => a.year - b.year)
    .map((d) => {
      const capitalGiro = d.capitalGiro;
      const ncg = d.ncg;
      const vendas = dreByYear[d.year] ?? null;
      const vendasCapitalGiro = capitalGiro !== 0 && capitalGiro !== null && vendas !== null
        ? vendas / Math.abs(capitalGiro)
        : null;

      return {
        ano: `Ano ${d.year}`,
        capitalGiro,
        ncg,
        vendasCapitalGiro,
      };
    });

  const barDataKey = showNcg ? "ncg" : "capitalGiro";
  const barName = showNcg
    ? "NCG (Variacao)"
    : "Capital de Giro";
  const barColor = showNcg
    ? CHART_CONFIG.colors.ncg
    : CHART_CONFIG.colors.capitalGiro;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Evolucao do Capital de Giro</h3>
          <p className="text-sm text-muted-foreground">
            Capital de Giro e indicador Vendas/Capital de Giro por ano projetado
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">
            Capital de Giro
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={showNcg}
            onClick={() => setShowNcg((prev) => !prev)}
            className={[
              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              showNcg ? "bg-primary" : "bg-input",
            ].join(" ")}
          >
            <span
              className={[
                "inline-block h-4 w-4 rounded-full bg-card shadow transition-transform",
                showNcg ? "translate-x-4" : "translate-x-0.5",
              ].join(" ")}
            />
          </button>
          <span className="text-xs text-muted-foreground">NCG (Var.)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={chartData}
          margin={{ top: 5, right: 50, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="ano"
            className="text-xs"
            tick={{ fill: "var(--foreground)" }}
          />
          <YAxis
            yAxisId="left"
            className="text-xs"
            tick={{ fill: "var(--foreground)" }}
            tickFormatter={(value) => formatCompactNumber(value)}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            className="text-xs"
            tick={{ fill: "var(--foreground)" }}
            tickFormatter={(value) => `${value.toFixed(1)}x`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
          <Bar
            yAxisId="left"
            dataKey={barDataKey}
            name={barName}
            fill={barColor}
            radius={[4, 4, 0, 0]}
          >
            <LabelList
              dataKey={barDataKey}
              position="center"
              formatter={(value) => formatCompactNumber(Number(value))}
              style={{ fill: "var(--primary-foreground)", fontSize: 15, fontWeight: 600 }}
            />
          </Bar>
          <Line {...INDICATOR_LINE_PROPS}>
            <LabelList
              dataKey="vendasCapitalGiro"
              position="top"
              formatter={(value) =>
                value != null ? `${Number(value).toFixed(2)}x` : ""
              }
              style={{
                fill: CHART_CONFIG.colors.vendasNcg,
                fontSize: 15,
                fontWeight: 500,
              }}
            />
          </Line>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
