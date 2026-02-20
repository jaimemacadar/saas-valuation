'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { FCFFCalculated } from '@/core/types';
import { formatCurrency, formatCompactNumber } from '@/lib/utils/formatters';

interface FCFFChartProps {
  data: FCFFCalculated[];
}

export function FCFFChart({ data }: FCFFChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado disponível para o gráfico
      </div>
    );
  }

  // Formata dados para Recharts
  const chartData = data.map((year) => ({
    ano: year.year === 0 ? 'Base' : `Ano ${year.year}`,
    fcff: year.fcff,
  }));

  // Cores condicionais para barras
  const getBarColor = (value: number) => {
    return value >= 0
      ? 'var(--chart-2)' // Verde
      : 'var(--destructive)'; // Vermelho
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="rounded-lg border bg-card p-3 shadow-md">
          <p className="font-semibold mb-2">{label}</p>
          <p
            style={{
              color: getBarColor(value),
            }}
            className="text-sm"
          >
            FCFF: {formatCurrency(value)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {value >= 0 ? 'Geração positiva de caixa' : 'Consumo de caixa'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Fluxo de Caixa Livre (FCFF)</h3>
        <p className="text-sm text-muted-foreground">
          Geração de caixa livre para a firma por ano
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
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
            tickFormatter={(value) => formatCompactNumber(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
          <ReferenceLine
            y={0}
            stroke="var(--foreground)"
            strokeDasharray="3 3"
            strokeWidth={1}
          />
          <Bar dataKey="fcff" name="FCFF" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.fcff)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="rounded-lg border bg-card p-3">
          <div className="text-xs text-muted-foreground">FCFF Médio</div>
          <div className="text-lg font-semibold mt-1">
            {formatCurrency(
              data.reduce((sum, d) => sum + d.fcff, 0) / data.length
            )}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="text-xs text-muted-foreground">FCFF Acumulado</div>
          <div className="text-lg font-semibold mt-1">
            {formatCurrency(data.reduce((sum, d) => sum + d.fcff, 0))}
          </div>
        </div>
      </div>
    </div>
  );
}
