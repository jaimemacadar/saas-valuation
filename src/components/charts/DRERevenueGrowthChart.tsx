'use client';

import { DRECalculated } from '@/core/types';
import { GraficoCombinado } from '@/components/charts/GraficoCombinado';
import { formatCompactNumber } from '@/lib/utils/formatters';

interface DRERevenueGrowthChartProps {
  data: DRECalculated[];
}

export function DRERevenueGrowthChart({ data }: DRERevenueGrowthChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado disponível para o gráfico
      </div>
    );
  }

  const chartData = data
    .filter((year) => year.year > 0)
    .map((year, index, filteredData) => {
      const receitaBruta = year.receitaBruta;
      let crescimentoAnual: number | null = null;

      if (index > 0) {
        const anoAnterior = filteredData[index - 1].receitaBruta;
        if (anoAnterior && anoAnterior !== 0) {
          crescimentoAnual = ((receitaBruta - anoAnterior) / anoAnterior) * 100;
        }
      }

      return {
        ano: `Ano ${year.year}`,
        receitaBruta,
        crescimentoAnual,
      };
    });

  return (
    <GraficoCombinado
      data={chartData}
      xAxisKey="ano"
      barPrimaria={{
        dataKey: 'receitaBruta',
        name: 'Receita Bruta',
        color: 'var(--primary)',
      }}
      linha={{
        dataKey: 'crescimentoAnual',
        name: 'Crescimento Anual',
        color: 'var(--neutral-400)',
        valueFormatter: (v) => `${v.toFixed(1)}%`,
      }}
      title="Vendas e Crescimento Anual"
      description="Evolução da receita bruta e taxa de crescimento anual"
      leftAxisFormatter={(v) => formatCompactNumber(v)}
      rightAxisFormatter={(v) => `${v.toFixed(1)}%`}
    />
  );
}
