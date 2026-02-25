'use client';

import { useState } from 'react';
import { DRERevenueGrowthChartSection } from '@/components/charts/DRERevenueGrowthChartSection';
import { DRECostsChartSection } from '@/components/charts/DRECostsChartSection';
import type { DRECalculated } from '@/core/types';

interface DREChartsToggleProps {
  data: DRECalculated[];
}

export function DREChartsToggle({ data }: DREChartsToggleProps) {
  const [activeChart, setActiveChart] = useState<'vendas' | 'custos'>('vendas');

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
          <button
            type="button"
            onClick={() => setActiveChart('vendas')}
            className={[
              'rounded-md px-3 py-1 text-sm font-medium transition-all',
              activeChart === 'vendas'
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            Vendas e Crescimento
          </button>
          <button
            type="button"
            onClick={() => setActiveChart('custos')}
            className={[
              'rounded-md px-3 py-1 text-sm font-medium transition-all',
              activeChart === 'custos'
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            Estrutura de Custos
          </button>
        </div>
      </div>

      {activeChart === 'vendas' ? (
        <DRERevenueGrowthChartSection data={data} />
      ) : (
        <DRECostsChartSection data={data} />
      )}
    </div>
  );
}
