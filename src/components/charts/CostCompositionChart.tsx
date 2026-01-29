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
} from 'recharts';
import { DRECalculated } from '@/core/types';
import { formatCurrency, formatCompactNumber } from '@/lib/utils/formatters';

interface CostCompositionChartProps {
  data: DRECalculated[];
}

export function CostCompositionChart({ data }: CostCompositionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado disponível para o gráfico
      </div>
    );
  }

  // Formata dados para Recharts
  const chartData = data.map((year) => ({
    ano: year.ano === 0 ? 'Base' : `Ano ${year.ano}`,
    cmv: year.cmv,
    despesasOperacionais: year.despesasOperacionais,
    impostos: year.impostos,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
          <p className="text-sm font-semibold mt-2 pt-2 border-t">
            Total: {formatCurrency(total)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Composição de Custos</h3>
        <p className="text-sm text-muted-foreground">
          Estrutura de custos e despesas por ano
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
            tick={{ fill: 'hsl(var(--foreground))' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'hsl(var(--foreground))' }}
            tickFormatter={(value) => formatCompactNumber(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
          <Bar
            dataKey="cmv"
            name="CMV"
            stackId="a"
            fill="hsl(var(--destructive))"
          />
          <Bar
            dataKey="despesasOperacionais"
            name="Despesas Operacionais"
            stackId="a"
            fill="hsl(24.6 95% 53.1%)"
          />
          <Bar
            dataKey="impostos"
            name="IR/CSLL"
            stackId="a"
            fill="hsl(47.9 95.8% 53.1%)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
