'use client';

import { useState } from 'react';
import { BalanceSheetStructureChartSection } from '@/components/charts/BalanceSheetStructureChartSection';
import type { BalanceSheetCalculated, IndicadoresCalculated } from '@/core/types';

interface BalanceSheetChartsToggleProps {
  data: BalanceSheetCalculated[];
  indicadoresData?: IndicadoresCalculated[];
}

export function BalanceSheetChartsToggle({
  data,
  indicadoresData,
}: BalanceSheetChartsToggleProps) {
  const [activeChart, setActiveChart] = useState<'ativo' | 'passivo'>('ativo');

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
          <button
            type="button"
            onClick={() => setActiveChart('ativo')}
            className={[
              'rounded-md px-3 py-1 text-sm font-medium transition-all',
              activeChart === 'ativo'
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            Estrutura do Ativo
          </button>
          <button
            type="button"
            onClick={() => setActiveChart('passivo')}
            className={[
              'rounded-md px-3 py-1 text-sm font-medium transition-all',
              activeChart === 'passivo'
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            Estrutura do Passivo
          </button>
        </div>
      </div>

      {activeChart === 'ativo' ? (
        <BalanceSheetStructureChartSection
          data={data}
          indicadoresData={indicadoresData}
          onlyAtivo
        />
      ) : (
        <BalanceSheetStructureChartSection
          data={data}
          indicadoresData={indicadoresData}
          onlyPassivo
        />
      )}
    </div>
  );
}
