'use client';

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DRECalculated } from '@/core/types';
import { formatCurrency, formatCompactNumber, formatPercentage } from '@/lib/utils/formatters';

interface EBITDAChartProps {
  data: DRECalculated[];
}

export function EBITDAChart({ data }: EBITDAChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado disponível para o gráfico
      </div>
    );
  }

  // Calcula EBITDA e margem
  const chartData = data.map((year) => {
    const receitaLiquida = year.receitaLiquida;
    const ebitda = year.ebitda;
    const margemEbitda = receitaLiquida > 0 ? (ebitda / receitaLiquida) * 100 : 0;

    return {
      ano: year.year === 0 ? 'Base' : `Ano ${year.year}`,
      ebitda,
      margemEbitda,
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}:{' '}
              {entry.dataKey === 'margemEbitda'
                ? formatPercentage(entry.value / 100)
                : formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">EBITDA e Margem</h3>
        <p className="text-sm text-muted-foreground">
          Evolução do EBITDA (aproximado) e margem percentual
        </p>
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
            yAxisId="left"
            className="text-xs"
            tick={{ fill: 'var(--foreground)' }}
            tickFormatter={(value) => formatCompactNumber(value)}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            className="text-xs"
            tick={{ fill: 'var(--foreground)' }}
            tickFormatter={(value) => `${value.toFixed(0)}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="margemEbitda"
            name="Margem EBITDA (%)"
            fill="var(--primary)"
            fillOpacity={0.2}
            stroke="var(--primary)"
            strokeWidth={0}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="ebitda"
            name="EBITDA"
            stroke="var(--chart-2)"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
