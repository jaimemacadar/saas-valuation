"use client";

import { useState } from "react";
import {
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import type { BalanceSheetCalculated, IndicadoresCalculated } from "@/core/types";
import { formatCurrency, formatCompactNumber } from "@/lib/utils/formatters";

const COLORS = {
  ativoNaoCirculante: "var(--primary-800)",
  ativoCirculante: "var(--primary-500)",
  passivoCirculante: "var(--alt-500)",
  passivoNaoCirculante: "var(--alt-800)",
  patrimonioLiquido: "var(--alt-900)",
  emprestimosEbitda: "var(--neutral-400)",
  plLucroLiquido: "var(--amber)",
  vendasImobilizado: "var(--neutral-400)",
} as const;

const LINE_CONFIG = {
  strokeWidth: 2,
  dotRadius: 4,
  activeDotRadius: 6,
} as const;

const INDICATOR_KEYS = new Set([
  "emprestimosEbitda",
  "plLucroLiquido",
  "vendasImobilizado",
]);

const PERCENT_INDICATOR_KEYS = new Set(["plLucroLiquido"]);

interface ChartRow {
  ano: string;
  ativoNaoCirculante: number;
  ativoCirculante: number;
  patrimonioLiquido: number;
  passivoNaoCirculante: number;
  passivoCirculante: number;
  ativoNaoCirculante_pct: number;
  ativoCirculante_pct: number;
  patrimonioLiquido_pct: number;
  passivoNaoCirculante_pct: number;
  passivoCirculante_pct: number;
  emprestimosEbitda: number | null;
  plLucroLiquido: number | null;
  vendasImobilizado: number | null;
}

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
  showPercent: boolean;
  chartDataByLabel: Record<string, ChartRow>;
}

const NOMINAL_KEYS: Record<string, keyof ChartRow> = {
  ativoNaoCirculante_pct: "ativoNaoCirculante",
  ativoCirculante_pct: "ativoCirculante",
  patrimonioLiquido_pct: "patrimonioLiquido",
  passivoNaoCirculante_pct: "passivoNaoCirculante",
  passivoCirculante_pct: "passivoCirculante",
};

function CustomTooltip({
  active,
  payload,
  label,
  showPercent,
  chartDataByLabel,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const row = label ? chartDataByLabel[label] : undefined;

  const barEntries = payload.filter((e) => !INDICATOR_KEYS.has(e.dataKey));
  const indicatorEntries = payload.filter((e) => INDICATOR_KEYS.has(e.dataKey));

  const nominalTotal = row
    ? barEntries.reduce((sum, entry) => {
        const nominalKey = NOMINAL_KEYS[entry.dataKey];
        const val = nominalKey
          ? (row[nominalKey] as number)
          : (entry.value ?? 0);
        return sum + val;
      }, 0)
    : null;

  return (
    <div className="rounded-lg border bg-card p-3 shadow-md">
      <p className="font-semibold mb-2">{label}</p>

      {barEntries.map((entry, index) => {
        if (entry.value === null || entry.value === undefined) return null;

        if (showPercent && row) {
          const nominalKey = NOMINAL_KEYS[entry.dataKey];
          const nominal = nominalKey ? (row[nominalKey] as number) : null;
          return (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toFixed(1)}%
              {nominal !== null && (
                <span className="text-muted-foreground ml-1">
                  ({formatCurrency(nominal)})
                </span>
              )}
            </p>
          );
        }

        return (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        );
      })}

      {barEntries.length > 0 && (
        <p className="text-sm font-semibold mt-1 border-t pt-1">
          Total:{" "}
          {showPercent && nominalTotal !== null
            ? formatCurrency(nominalTotal)
            : formatCurrency(
                barEntries.reduce((sum, e) => sum + (e.value ?? 0), 0)
              )}
        </p>
      )}

      {indicatorEntries.length > 0 && (
        <div className="mt-2 pt-1 border-t">
          {indicatorEntries.map((entry, index) => {
            if (entry.value === null || entry.value === undefined) return null;
            const formatted = PERCENT_INDICATOR_KEYS.has(entry.dataKey)
              ? `${entry.value.toFixed(1)}%`
              : `${entry.value.toFixed(2)}x`;
            return (
              <p
                key={index}
                style={{ color: entry.color }}
                className="text-sm"
              >
                {entry.name}: {formatted}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface BalanceSheetStructureChartProps {
  data: BalanceSheetCalculated[];
  indicadoresData?: IndicadoresCalculated[];
  onlyPassivo?: boolean;
  onlyAtivo?: boolean;
}

export function BalanceSheetStructureChart({
  data,
  indicadoresData,
  onlyPassivo = false,
  onlyAtivo = false,
}: BalanceSheetStructureChartProps) {
  const [showPercent, setShowPercent] = useState(false);
  const [showEmprestimosEbitda, setShowEmprestimosEbitda] = useState(true);
  const [showPlLucroLiquido, setShowPlLucroLiquido] = useState(true);
  const [showVendasImobilizado, setShowVendasImobilizado] = useState(true);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado disponivel para o grafico
      </div>
    );
  }

  const emprestimosEbitdaByYear = Object.fromEntries(
    (indicadoresData ?? []).map((ind) => {
      const val = ind.indicadores.find((i) => i.id === "emprestimos-ebitda");
      return [ind.year, val?.value ?? null];
    })
  );

  const plLucroLiquidoByYear = Object.fromEntries(
    (indicadoresData ?? []).map((ind) => {
      const val = ind.indicadores.find((i) => i.id === "lucro-liquido-pl");
      return [ind.year, val?.value ?? null];
    })
  );

  const vendasImobilizadoByYear = Object.fromEntries(
    (indicadoresData ?? []).map((ind) => {
      const val = ind.indicadores.find((i) => i.id === "vendas-imobilizado");
      return [ind.year, val?.value ?? null];
    })
  );

  const chartData: ChartRow[] = data
    .filter((d) => d.year > 0)
    .sort((a, b) => a.year - b.year)
    .map((d) => {
      const anc = d.ativoRealizavelLP.total;
      const ac = d.ativoCirculante.total;
      const totalAtivo = anc + ac;

      const pl = d.patrimonioLiquido.total;
      const pnc = d.passivoRealizavelLP.total;
      const pc = d.passivoCirculante.total;
      const totalPassivo = pl + pnc + pc;

      return {
        ano: `Ano ${d.year}`,
        ativoNaoCirculante: anc,
        ativoCirculante: ac,
        patrimonioLiquido: pl,
        passivoNaoCirculante: pnc,
        passivoCirculante: pc,
        ativoNaoCirculante_pct: totalAtivo > 0 ? (anc / totalAtivo) * 100 : 0,
        ativoCirculante_pct: totalAtivo > 0 ? (ac / totalAtivo) * 100 : 0,
        patrimonioLiquido_pct: totalPassivo > 0 ? (pl / totalPassivo) * 100 : 0,
        passivoNaoCirculante_pct:
          totalPassivo > 0 ? (pnc / totalPassivo) * 100 : 0,
        passivoCirculante_pct: totalPassivo > 0 ? (pc / totalPassivo) * 100 : 0,
        emprestimosEbitda: emprestimosEbitdaByYear[d.year] ?? null,
        plLucroLiquido: plLucroLiquidoByYear[d.year] ?? null,
        vendasImobilizado: vendasImobilizadoByYear[d.year] ?? null,
      };
    });

  const chartDataByLabel = Object.fromEntries(
    chartData.map((row) => [row.ano, row])
  );

  const labelStyle = {
    fill: "var(--primary-foreground)",
    fontSize: 12,
    fontWeight: 600,
  };

  const labelFormatter = showPercent
    ? (value: unknown) => `${Number(value).toFixed(1)}%`
    : (value: unknown) => formatCompactNumber(Number(value));

  const yAxisFormatter = showPercent
    ? (value: number) => `${value.toFixed(0)}%`
    : (value: number) => formatCompactNumber(value);

  const yAxisDomain = showPercent ? ([0, 100] as [number, number]) : undefined;

  const tooltipContent = (props: object) => (
    <CustomTooltip
      {...(props as CustomTooltipProps)}
      showPercent={showPercent}
      chartDataByLabel={chartDataByLabel}
    />
  );

  return (
    <div className="space-y-8">
      {/* Switch Nominal / % */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Nominal</span>
          <button
            type="button"
            role="switch"
            aria-checked={showPercent}
            onClick={() => setShowPercent((prev) => !prev)}
            className={[
              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              showPercent ? "bg-primary" : "bg-input",
            ].join(" ")}
          >
            <span
              className={[
                "inline-block h-4 w-4 rounded-full bg-card shadow transition-transform",
                showPercent ? "translate-x-4" : "translate-x-0.5",
              ].join(" ")}
            />
          </button>
          <span className="text-xs text-muted-foreground">% do Total</span>
        </div>
      </div>

      {/* Ativo */}
      {!onlyPassivo && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Estrutura do Ativo</h3>
              <p className="text-sm text-muted-foreground">
                Ativo Circulante e Ativo Nao Circulante por ano projetado
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 mr-[50px]">
              <button
                type="button"
                onClick={() => setShowVendasImobilizado((p) => !p)}
                className={[
                  "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-all",
                  showVendasImobilizado
                    ? "border-current"
                    : "border-border text-muted-foreground",
                ].join(" ")}
                style={
                  showVendasImobilizado
                    ? { color: COLORS.vendasImobilizado }
                    : undefined
                }
              >
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: showVendasImobilizado
                      ? COLORS.vendasImobilizado
                      : "var(--muted-foreground)",
                  }}
                />
                Vendas / Imobilizado
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={380}>
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
                tickFormatter={yAxisFormatter}
                domain={yAxisDomain}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                className="text-xs"
                tick={{ fill: "var(--foreground)" }}
                tickFormatter={(v) => `${v.toFixed(1)}x`}
              />
              <Tooltip
                content={tooltipContent}
                cursor={{ fill: "var(--muted-alt)", opacity: 0.5 }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar
                yAxisId="left"
                dataKey={
                  showPercent ? "ativoNaoCirculante_pct" : "ativoNaoCirculante"
                }
                name="Ativo Nao Circulante"
                fill={COLORS.ativoNaoCirculante}
                stackId="ativo"
                radius={[0, 0, 0, 0]}
              >
                <LabelList
                  dataKey={
                    showPercent
                      ? "ativoNaoCirculante_pct"
                      : "ativoNaoCirculante"
                  }
                  position="center"
                  formatter={labelFormatter}
                  style={labelStyle}
                />
              </Bar>
              <Bar
                yAxisId="left"
                dataKey={
                  showPercent ? "ativoCirculante_pct" : "ativoCirculante"
                }
                name="Ativo Circulante"
                fill={COLORS.ativoCirculante}
                stackId="ativo"
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey={
                    showPercent ? "ativoCirculante_pct" : "ativoCirculante"
                  }
                  position="center"
                  formatter={labelFormatter}
                  style={labelStyle}
                />
              </Bar>
              {showVendasImobilizado && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="vendasImobilizado"
                  name="Vendas / Imobilizado"
                  stroke={COLORS.vendasImobilizado}
                  strokeWidth={LINE_CONFIG.strokeWidth}
                  dot={{
                    r: LINE_CONFIG.dotRadius,
                    fill: COLORS.vendasImobilizado,
                  }}
                  activeDot={{ r: LINE_CONFIG.activeDotRadius }}
                  connectNulls={false}
                >
                  <LabelList
                    dataKey="vendasImobilizado"
                    position="top"
                    formatter={(v: unknown) =>
                      v != null ? `${Number(v).toFixed(2)}x` : ""
                    }
                    style={{
                      fill: COLORS.vendasImobilizado,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  />
                </Line>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Passivo */}
      {!onlyAtivo && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Estrutura do Passivo</h3>
              <p className="text-sm text-muted-foreground">
                Passivo Circulante, Passivo Nao Circulante e Patrimonio Liquido por
                ano projetado
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 mr-[50px]">
              <button
                type="button"
                onClick={() => setShowEmprestimosEbitda((p) => !p)}
                className={[
                  "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-all",
                  showEmprestimosEbitda
                    ? "border-current"
                    : "border-border text-muted-foreground",
                ].join(" ")}
                style={
                  showEmprestimosEbitda
                    ? { color: COLORS.emprestimosEbitda }
                    : undefined
                }
              >
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: showEmprestimosEbitda
                      ? COLORS.emprestimosEbitda
                      : "var(--muted-foreground)",
                  }}
                />
                Empréstimos / EBITDA
              </button>
              <button
                type="button"
                onClick={() => setShowPlLucroLiquido((p) => !p)}
                className={[
                  "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-all",
                  showPlLucroLiquido
                    ? "border-current"
                    : "border-border text-muted-foreground",
                ].join(" ")}
                style={
                  showPlLucroLiquido
                    ? { color: COLORS.plLucroLiquido }
                    : undefined
                }
              >
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: showPlLucroLiquido
                      ? COLORS.plLucroLiquido
                      : "var(--muted-foreground)",
                  }}
                />
                Lucro Líquido / PL
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={380}>
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
                tickFormatter={yAxisFormatter}
                domain={yAxisDomain}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                className="text-xs"
                tick={{ fill: "var(--foreground)" }}
                tickFormatter={(v) => `${v.toFixed(1)}x`}
              />
              <YAxis yAxisId="right2" orientation="right" hide />
              <Tooltip content={tooltipContent} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar
                yAxisId="left"
                dataKey={
                  showPercent ? "patrimonioLiquido_pct" : "patrimonioLiquido"
                }
                name="Patrimonio Liquido"
                fill={COLORS.patrimonioLiquido}
                stackId="passivo"
                radius={[0, 0, 0, 0]}
              >
                <LabelList
                  dataKey={
                    showPercent ? "patrimonioLiquido_pct" : "patrimonioLiquido"
                  }
                  position="center"
                  formatter={labelFormatter}
                  style={labelStyle}
                />
              </Bar>
              <Bar
                yAxisId="left"
                dataKey={
                  showPercent
                    ? "passivoNaoCirculante_pct"
                    : "passivoNaoCirculante"
                }
                name="Passivo Nao Circulante"
                fill={COLORS.passivoNaoCirculante}
                stackId="passivo"
                radius={[0, 0, 0, 0]}
              >
                <LabelList
                  dataKey={
                    showPercent
                      ? "passivoNaoCirculante_pct"
                      : "passivoNaoCirculante"
                  }
                  position="center"
                  formatter={labelFormatter}
                  style={labelStyle}
                />
              </Bar>
              <Bar
                yAxisId="left"
                dataKey={
                  showPercent ? "passivoCirculante_pct" : "passivoCirculante"
                }
                name="Passivo Circulante"
                fill={COLORS.passivoCirculante}
                stackId="passivo"
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey={
                    showPercent ? "passivoCirculante_pct" : "passivoCirculante"
                  }
                  position="center"
                  formatter={labelFormatter}
                  style={labelStyle}
                />
              </Bar>
              {showEmprestimosEbitda && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="emprestimosEbitda"
                  name="Empréstimos / EBITDA"
                  stroke={COLORS.emprestimosEbitda}
                  strokeWidth={LINE_CONFIG.strokeWidth}
                  dot={{
                    r: LINE_CONFIG.dotRadius,
                    fill: COLORS.emprestimosEbitda,
                  }}
                  activeDot={{ r: LINE_CONFIG.activeDotRadius }}
                  connectNulls={false}
                >
                  <LabelList
                    dataKey="emprestimosEbitda"
                    position="top"
                    formatter={(v: unknown) =>
                      v != null ? `${Number(v).toFixed(2)}x` : ""
                    }
                    style={{
                      fill: COLORS.emprestimosEbitda,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  />
                </Line>
              )}
              {showPlLucroLiquido && (
                <Line
                  yAxisId="right2"
                  type="monotone"
                  dataKey="plLucroLiquido"
                  name="Lucro Líquido / PL"
                  stroke={COLORS.plLucroLiquido}
                  strokeWidth={LINE_CONFIG.strokeWidth}
                  dot={{
                    r: LINE_CONFIG.dotRadius,
                    fill: COLORS.plLucroLiquido,
                  }}
                  activeDot={{ r: LINE_CONFIG.activeDotRadius }}
                  connectNulls={false}
                >
                  <LabelList
                    dataKey="plLucroLiquido"
                    position="top"
                    formatter={(v: unknown) =>
                      v != null ? `${Number(v).toFixed(1)}%` : ""
                    }
                    style={{
                      fill: COLORS.plLucroLiquido,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  />
                </Line>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
