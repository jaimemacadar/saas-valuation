'use client';

import { useState } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { DRECalculated } from '@/core/types';
import { formatCurrency, formatCompactNumber } from '@/lib/utils/formatters';

interface DRECostsChartProps {
  data: DRECalculated[];
}

export function DRECostsChart({ data }: DRECostsChartProps) {
  const [showPercent, setShowPercent] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado disponível para o gráfico
      </div>
    );
  }

  const chartData = data
    .filter((year) => year.year > 0)
    .map((year) => {
      const impostos = Math.abs(year.impostosEDevolucoes);
      const cmv = Math.abs(year.cmv);
      const despesasOperacionais = Math.abs(year.despesasOperacionais);
      const despesasFinanceiras = Math.abs(year.despesasFinanceiras);
      const irCSLL = Math.abs(year.irCSLL);
      const total = impostos + cmv + despesasOperacionais + despesasFinanceiras + irCSLL;

      return {
        ano: `Ano ${year.year}`,
        impostos,
        cmv,
        despesasOperacionais,
        despesasFinanceiras,
        irCSLL,
        total,
        impostos_pct: total > 0 ? (impostos / total) * 100 : 0,
        cmv_pct: total > 0 ? (cmv / total) * 100 : 0,
        despesasOperacionais_pct: total > 0 ? (despesasOperacionais / total) * 100 : 0,
        despesasFinanceiras_pct: total > 0 ? (despesasFinanceiras / total) * 100 : 0,
        irCSLL_pct: total > 0 ? (irCSLL / total) * 100 : 0,
      };
    });

  const labelStyle = {
    fill: 'var(--primary-foreground)',
    fontSize: 11,
    fontWeight: 600,
  };

  const labelFormatter = (value: unknown) => {
    if (typeof value === 'number') {
      return showPercent ? `${value.toFixed(1)}%` : formatCompactNumber(value);
    }
    return String(value);
  };

  const yAxisFormatter = showPercent
    ? (value: number) => `${value.toFixed(0)}%`
    : (value: number) => formatCompactNumber(value);

  const yAxisDomain = showPercent ? ([0, 100] as [number, number]) : undefined;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div className="rounded-lg border bg-card p-3 shadow-md">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const pct = total > 0 ? (entry.value / total) * 100 : 0;
            return (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.name}: {formatCurrency(entry.value)}
                {showPercent && total > 0 && ` (${pct.toFixed(1)}%)`}
              </p>
            );
          })}
          <p className="font-semibold mt-2 pt-2 border-t text-sm">
            Total: {formatCurrency(total)}
            {showPercent && ' (100%)'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Estrutura de Custos</h3>
          <p className="text-sm text-muted-foreground">
            Composicao dos custos e despesas do DRE
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="ano"
            className="text-xs"
            tick={{ fill: 'var(--foreground)' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'var(--foreground)' }}
            tickFormatter={yAxisFormatter}
            domain={yAxisDomain}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
          <Bar
            dataKey={showPercent ? "impostos_pct" : "impostos"}
            name="Impostos"
            stackId="custos"
            fill="var(--primary-900)"
            radius={[0, 0, 0, 0]}
          >
            <LabelList
              dataKey={showPercent ? "impostos_pct" : "impostos"}
              position="center"
              formatter={labelFormatter}
              style={labelStyle}
            />
          </Bar>
          <Bar
            dataKey={showPercent ? "cmv_pct" : "cmv"}
            name="CMV"
            stackId="custos"
            fill="var(--primary-700)"
          >
            <LabelList
              dataKey={showPercent ? "cmv_pct" : "cmv"}
              position="center"
              formatter={labelFormatter}
              style={labelStyle}
            />
          </Bar>
          <Bar
            dataKey={showPercent ? "despesasOperacionais_pct" : "despesasOperacionais"}
            name="Despesas Operacionais"
            stackId="custos"
            fill="var(--amber-500)"
          >
            <LabelList
              dataKey={showPercent ? "despesasOperacionais_pct" : "despesasOperacionais"}
              position="center"
              formatter={labelFormatter}
              style={labelStyle}
            />
          </Bar>
          <Bar
            dataKey={showPercent ? "despesasFinanceiras_pct" : "despesasFinanceiras"}
            name="Despesas Financeiras"
            stackId="custos"
            fill="var(--neutral-600)"
          >
            <LabelList
              dataKey={showPercent ? "despesasFinanceiras_pct" : "despesasFinanceiras"}
              position="center"
              formatter={labelFormatter}
              style={labelStyle}
            />
          </Bar>
          <Bar
            dataKey={showPercent ? "irCSLL_pct" : "irCSLL"}
            name="IR/CSLL"
            stackId="custos"
            fill="var(--alt-700)"
            radius={[4, 4, 0, 0]}
          >
            <LabelList
              dataKey={showPercent ? "irCSLL_pct" : "irCSLL"}
              position="center"
              formatter={labelFormatter}
              style={labelStyle}
            />
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
