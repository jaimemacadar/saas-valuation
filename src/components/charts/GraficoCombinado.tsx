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
import { formatCurrency, formatCompactNumber } from "@/lib/utils/formatters";

/* ─── Tipos públicos ─── */

export interface BarConfig {
  /** Chave do campo nos dados */
  dataKey: string;
  /** Nome exibido na legenda */
  name: string;
  /** Cor da barra (hex, oklch, css var, etc.) */
  color: string;
}

export interface LinhaConfig {
  /** Chave do campo nos dados */
  dataKey: string;
  /** Nome exibido na legenda */
  name: string;
  /** Cor da linha */
  color: string;
  /** Formatador do valor no tooltip e nos labels (padrão: 2 casas + "x") */
  valueFormatter?: (value: number) => string;
}

/** Ponto de dado genérico — deve conter ao menos a chave do eixo X e os dataKeys configurados */
export type GraficoCombinadoDado = Record<string, number | string | null>;

export interface GraficoCombinadoProps {
  /** Array de dados */
  data: GraficoCombinadoDado[];
  /** Chave usada no eixo X (ex: "ano") */
  xAxisKey: string;
  /** Barra principal (sempre visível ou exibida quando toggle = false) */
  barPrimaria: BarConfig;
  /** Barra alternativa opcional — quando fornecida, aparece um toggle para alternar */
  barSecundaria?: BarConfig;
  /** Linha indicadora no eixo Y direito */
  linha: LinhaConfig;
  /** Título do gráfico */
  title: string;
  /** Subtítulo / descrição */
  description?: string;
  /** Texto extra exibido após a descrição (ex: "Ano Base: 2,5x") */
  labelAnoBase?: string;
  /** Rótulo do toggle — lado esquerdo (padrão: nome da barPrimaria) */
  toggleLabelPrimaria?: string;
  /** Rótulo do toggle — lado direito (padrão: nome da barSecundaria) */
  toggleLabelSecundaria?: string;
  /** Formatador do eixo Y esquerdo (padrão: formatCompactNumber) */
  leftAxisFormatter?: (value: number) => string;
  /** Formatador do eixo Y direito (padrão: valor.toFixed(1) + "x") */
  rightAxisFormatter?: (value: number) => string;
  /** Altura do gráfico em px (padrão: 400) */
  height?: number;
}

/* ─── Tooltip customizado ─── */

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
  linhaDataKey: string;
  linhaFormatter: (v: number) => string;
}

function CustomTooltip({
  active,
  payload,
  label,
  linhaDataKey,
  linhaFormatter,
}: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((entry, index) => {
        if (entry.value === null || entry.value === undefined) return null;
        const isLinha = entry.dataKey === linhaDataKey;
        return (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}:{" "}
            {isLinha
              ? linhaFormatter(entry.value)
              : formatCurrency(entry.value)}
          </p>
        );
      })}
    </div>
  );
}

/* ─── Componente principal ─── */

export function GraficoCombinado({
  data,
  xAxisKey,
  barPrimaria,
  barSecundaria,
  linha,
  title,
  description,
  labelAnoBase,
  toggleLabelPrimaria,
  toggleLabelSecundaria,
  leftAxisFormatter = (v) => formatCompactNumber(v),
  rightAxisFormatter = (v) => `${v.toFixed(1)}x`,
  height = 400,
}: GraficoCombinadoProps) {
  const [showSecundaria, setShowSecundaria] = useState(false);

  const linhaFormatter = linha.valueFormatter ?? ((v) => `${v.toFixed(2)}x`);
  const temToggle = !!barSecundaria;

  const barAtiva = temToggle && showSecundaria ? barSecundaria! : barPrimaria;

  const labelToggleEsq = toggleLabelPrimaria ?? barPrimaria.name;
  const labelToggleDir =
    toggleLabelSecundaria ?? barSecundaria?.name ?? "";

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado disponível para o gráfico
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
              {labelAnoBase && (
                <span className="ml-2 font-medium text-foreground">
                  {labelAnoBase}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Toggle switch — exibido apenas quando barSecundaria está configurada */}
        {temToggle && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">
              {labelToggleEsq}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={showSecundaria}
              onClick={() => setShowSecundaria((prev) => !prev)}
              className={[
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                showSecundaria ? "bg-primary" : "bg-input",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-block h-4 w-4 rounded-full bg-background shadow transition-transform",
                  showSecundaria ? "translate-x-4" : "translate-x-0.5",
                ].join(" ")}
              />
            </button>
            <span className="text-xs text-muted-foreground">
              {labelToggleDir}
            </span>
          </div>
        )}
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={data}
          margin={{ top: 5, right: 50, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

          <XAxis
            dataKey={xAxisKey}
            className="text-xs"
            tick={{ fill: "currentColor" }}
          />

          {/* Eixo esquerdo — valores monetários (barras) */}
          <YAxis
            yAxisId="left"
            className="text-xs"
            tick={{ fill: "currentColor" }}
            tickFormatter={leftAxisFormatter}
          />

          {/* Eixo direito — múltiplo / indicador (linha) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            className="text-xs"
            tick={{ fill: "currentColor" }}
            tickFormatter={rightAxisFormatter}
          />

          <Tooltip
            content={
              <CustomTooltip
                linhaDataKey={linha.dataKey}
                linhaFormatter={linhaFormatter}
              />
            }
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />

          <Bar
            yAxisId="left"
            dataKey={barAtiva.dataKey}
            name={barAtiva.name}
            fill={barAtiva.color}
            radius={[4, 4, 0, 0]}
          >
            <LabelList
              dataKey={barAtiva.dataKey}
              position="center"
              formatter={(value: unknown) =>
                formatCompactNumber(Number(value))
              }
              style={{ fill: "var(--primary-foreground)", fontSize: 13, fontWeight: 600 }}
            />
          </Bar>

          <Line
            yAxisId="right"
            type="monotone"
            dataKey={linha.dataKey}
            name={linha.name}
            stroke={linha.color}
            strokeWidth={2}
            dot={{ r: 4, fill: linha.color }}
            activeDot={{ r: 6 }}
            connectNulls={false}
          >
            <LabelList
              dataKey={linha.dataKey}
              position="top"
              formatter={(value: unknown) =>
                value != null ? linhaFormatter(Number(value)) : ""
              }
              style={{
                fill: linha.color,
                fontSize: 13,
                fontWeight: 500,
              }}
            />
          </Line>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
