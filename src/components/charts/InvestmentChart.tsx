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
  IndicadoresCalculated,
} from "@/core/types";
import { formatCurrency, formatCompactNumber } from "@/lib/utils/formatters";

// Chart configuration constants for maintainability and consistency
const CHART_CONFIG = {
  colors: {
    imobilizado: "var(--primary-800)", // Navy blue (âncora exata da escala)
    vendas: "var(--primary-400)", // Azul médio
    vendasImobilizado: "var(--neutral-400)", // Cinza neutro para linha indicadora
  },
  line: {
    strokeWidth: 2,
    dotRadius: 4,
    activeDotRadius: 6,
  },
} as const;

// Line props configuration for the indicator line
const INDICATOR_LINE_PROPS = {
  yAxisId: "right",
  type: "monotone" as const,
  dataKey: "vendasImobilizado",
  name: "Vendas / Imobilizado (x)",
  stroke: CHART_CONFIG.colors.vendasImobilizado,
  strokeWidth: CHART_CONFIG.line.strokeWidth,
  dot: {
    r: CHART_CONFIG.line.dotRadius,
    fill: CHART_CONFIG.colors.vendasImobilizado,
  },
  activeDot: { r: CHART_CONFIG.line.activeDotRadius },
  connectNulls: false,
};

// Tooltip props interface
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

// Custom tooltip component defined outside render to prevent recreation
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-md">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => {
          if (entry.value === null || entry.value === undefined) return null;
          const isMultiple = entry.dataKey === "vendasImobilizado";
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

interface InvestmentChartProps {
  data: BalanceSheetCalculated[];
  projectionInputs?: BalanceSheetProjectionInputs[];
  dreData?: DRECalculated[];
  indicadoresData?: IndicadoresCalculated[];
}

export function InvestmentChart({
  data,
  projectionInputs,
  dreData,
  indicadoresData,
}: InvestmentChartProps) {
  const [showVendas, setShowVendas] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado disponível para o gráfico
      </div>
    );
  }

  // Montar mapa de receita bruta (vendas) por ano a partir da DRE
  const dreByYear = Object.fromEntries(
    (dreData ?? []).map((d) => [d.year, d.receitaBruta]),
  );

  // Montar mapa do indicador Vendas/Imobilizado por ano a partir dos indicadores calculados
  const vendasImobilizadoByYear = Object.fromEntries(
    (indicadoresData ?? []).flatMap((ic) =>
      ic.indicadores
        .filter((ind) => ind.id === "vendas-imobilizado")
        .map((ind) => [ic.year, ind.value]),
    ),
  );

  // Obter indicador Vendas/Imobilizado do Ano Base (year === 0)
  const vendasImobilizadoAnoBase = vendasImobilizadoByYear[0] ?? null;

  // Filtrar apenas anos projetados (year > 0), seguindo padrão dos outros gráficos
  const chartData = data
    .filter((d) => d.year > 0)
    .sort((a, b) => a.year - b.year)
    .map((d) => {
      const imobilizadoLiquidoFinal = d.ativoRealizavelLP.imobilizado;
      const vendas = dreByYear[d.year] ?? null;
      const vendasImobilizado = vendasImobilizadoByYear[d.year] ?? null;

      return {
        ano: `Ano ${d.year}`,
        imobilizadoLiquidoFinal,
        vendas,
        vendasImobilizado,
      };
    });

  const barDataKey = showVendas ? "vendas" : "imobilizadoLiquidoFinal";
  const barName = showVendas
    ? "Vendas (Receita Bruta)"
    : "Imobilizado Líquido Final";
  const barColor = showVendas
    ? CHART_CONFIG.colors.vendas
    : CHART_CONFIG.colors.imobilizado;

  return (
    <div className="space-y-4">
      {/* Cabecalho com switch */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Evolucao do Imobilizado</h3>
          <p className="text-sm text-muted-foreground">
            Imobilizado Liquido Final e Índice Vendas/Imobilizado por ano
            projetado
            {vendasImobilizadoAnoBase !== null && (
              <span className="ml-2 font-medium text-foreground">
                (Ano Base: {vendasImobilizadoAnoBase.toFixed(2)}x)
              </span>
            )}
          </p>
        </div>

        {/* Switch manual usando button + estado — nao depende do componente Switch do shadcn */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">
            Imobilizado Liq.
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={showVendas}
            onClick={() => setShowVendas((prev) => !prev)}
            className={[
              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              showVendas ? "bg-primary" : "bg-input",
            ].join(" ")}
          >
            <span
              className={[
                "inline-block h-4 w-4 rounded-full bg-card shadow transition-transform",
                showVendas ? "translate-x-4" : "translate-x-0.5",
              ].join(" ")}
            />
          </button>
          <span className="text-xs text-muted-foreground">Vendas</span>
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
          {/* Eixo esquerdo: valores monetarios (barras) */}
          <YAxis
            yAxisId="left"
            className="text-xs"
            tick={{ fill: "var(--foreground)" }}
            tickFormatter={(value) => formatCompactNumber(value)}
          />
          {/* Eixo direito: multiplo Vendas/Imobilizado (linha) */}
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
              style={{
                fill: "var(--primary-foreground)",
                fontSize: 15,
                fontWeight: 600,
              }}
            />
          </Bar>
          <Line {...INDICATOR_LINE_PROPS}>
            <LabelList
              dataKey="vendasImobilizado"
              position="top"
              formatter={(value) =>
                value != null ? `${Number(value).toFixed(2)}x` : ""
              }
              style={{
                fill: CHART_CONFIG.colors.vendasImobilizado,
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
