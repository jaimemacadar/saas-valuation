'use client';

import { useState } from 'react';
import { LoansChartSection } from '@/components/charts/LoansChartSection';
import { BalanceSheetStructureChartSection } from '@/components/charts/BalanceSheetStructureChartSection';
import type { BalanceSheetCalculated, BalanceSheetProjectionInputs, IndicadoresCalculated } from '@/core/types';

interface LoansChartsToggleProps {
  data: BalanceSheetCalculated[];
  projectionInputs?: BalanceSheetProjectionInputs[];
  indicadoresData?: IndicadoresCalculated[];
}

export function LoansChartsToggle({
  data,
  projectionInputs,
  indicadoresData,
}: LoansChartsToggleProps) {
  const [activeChart, setActiveChart] = useState<'loans' | 'passivo'>('loans');

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
          <button
            type="button"
            onClick={() => setActiveChart('loans')}
            className={[
              'rounded-md px-3 py-1 text-sm font-medium transition-all',
              activeChart === 'loans'
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            Evolução dos Empréstimos
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

      {activeChart === 'loans' ? (
        <LoansChartSection
          data={data}
          projectionInputs={projectionInputs}
          indicadoresData={indicadoresData}
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
