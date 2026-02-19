'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { BalanceSheetCalculated, BalanceSheetProjectionInputs, DRECalculated, IndicadoresCalculated } from '@/core/types';

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

// Carregamento dinamico sem SSR para evitar problemas de hydration com recharts
const InvestmentChart = dynamic(
  () => import('@/components/charts/InvestmentChart').then((mod) => mod.InvestmentChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

interface InvestmentChartSectionProps {
  data: BalanceSheetCalculated[];
  projectionInputs?: BalanceSheetProjectionInputs[];
  dreData?: DRECalculated[];
  indicadoresData?: IndicadoresCalculated[];
}

export function InvestmentChartSection({
  data,
  projectionInputs,
  dreData,
  indicadoresData,
}: InvestmentChartSectionProps) {
  return (
    <div className="rounded-lg border p-4">
      <InvestmentChart
        data={data}
        projectionInputs={projectionInputs}
        dreData={dreData}
        indicadoresData={indicadoresData}
      />
    </div>
  );
}
