"use client";

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
  IndicadoresCalculated,
} from "@/core/types";
import { formatCurrency, formatCompactNumber } from "@/lib/utils/formatters";

const CHART_CONFIG = {
  colors: {
    emprestimosCP: "#c1121f",
    emprestimosLP: "#780000", //#d62828
    emprestimosEbitda: "#adb5bd", // Green for the ratio line
  },
  line: {
    strokeWidth: 2,
    dotRadius: 4,
    activeDotRadius: 6,
  },
} as const;

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
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => {
          if (entry.value === null || entry.value === undefined) return null;
          const isRatio = entry.dataKey === "emprestimosEbitda";
          return (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}:{" "}
              {isRatio
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

interface LoansChartProps {
  data: BalanceSheetCalculated[];
  projectionInputs?: BalanceSheetProjectionInputs[];
  indicadoresData?: IndicadoresCalculated[];
}

export function LoansChart({ data, indicadoresData }: LoansChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado disponivel para o grafico
      </div>
    );
  }

  const emprestimosEbitdaByYear = Object.fromEntries(
    (indicadoresData ?? []).map((ind) => {
      const indicador = ind.indicadores.find(
        (i) => i.id === "emprestimos-ebitda",
      );
      return [ind.year, indicador?.value ?? null];
    }),
  );

  const chartData = data
    .filter((d) => d.year > 0)
    .sort((a, b) => a.year - b.year)
    .map((d) => {
      const emprestimosCP = d.passivoCirculante.emprestimosFinanciamentosCP;
      const emprestimosLP = d.passivoRealizavelLP.emprestimosFinanciamentosLP;

      return {
        ano: `Ano ${d.year}`,
        emprestimosCP,
        emprestimosLP,
        emprestimosEbitda: emprestimosEbitdaByYear[d.year] ?? null,
      };
    });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Evolucao dos Emprestimos</h3>
        <p className="text-sm text-muted-foreground">
          Emprestimos de Curto e Longo Prazo e indicador Emprestimos/EBITDA por
          ano projetado
        </p>
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
            tick={{ fill: "hsl(var(--foreground))" }}
          />
          <YAxis
            yAxisId="left"
            className="text-xs"
            tick={{ fill: "hsl(var(--foreground))" }}
            tickFormatter={(value) => formatCompactNumber(value)}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            className="text-xs"
            tick={{ fill: "hsl(var(--foreground))" }}
            tickFormatter={(value) => `${value.toFixed(1)}x`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
          <Bar
            yAxisId="left"
            dataKey="emprestimosLP"
            name="Emprestimos LP"
            fill={CHART_CONFIG.colors.emprestimosLP}
            radius={[0, 0, 0, 0]}
            stackId="a"
          >
            <LabelList
              dataKey="emprestimosLP"
              position="center"
              formatter={(value) => formatCompactNumber(Number(value))}
              style={{ fill: "#ffffff", fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
          <Bar
            yAxisId="left"
            dataKey="emprestimosCP"
            name="Emprestimos CP"
            fill={CHART_CONFIG.colors.emprestimosCP}
            radius={[4, 4, 0, 0]}
            stackId="a"
          >
            <LabelList
              dataKey="emprestimosCP"
              position="center"
              formatter={(value) => formatCompactNumber(Number(value))}
              style={{ fill: "#ffffff", fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="emprestimosEbitda"
            name="Empréstimos/EBITDA (x)"
            stroke={CHART_CONFIG.colors.emprestimosEbitda}
            strokeWidth={CHART_CONFIG.line.strokeWidth}
            dot={{
              r: CHART_CONFIG.line.dotRadius,
              fill: CHART_CONFIG.colors.emprestimosEbitda,
            }}
            activeDot={{ r: CHART_CONFIG.line.activeDotRadius }}
            connectNulls={false}
          >
            <LabelList
              dataKey="emprestimosEbitda"
              position="top"
              formatter={(value) =>
                value != null ? `${Number(value).toFixed(2)}x` : ""
              }
              style={{
                fill: CHART_CONFIG.colors.emprestimosEbitda,
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
