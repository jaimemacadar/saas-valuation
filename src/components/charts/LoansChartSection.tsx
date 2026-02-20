'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { BalanceSheetCalculated, BalanceSheetProjectionInputs, IndicadoresCalculated } from '@/core/types';

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

const LoansChart = dynamic(
  () => import('@/components/charts/LoansChart').then((mod) => mod.LoansChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

interface LoansChartSectionProps {
  data: BalanceSheetCalculated[];
  projectionInputs?: BalanceSheetProjectionInputs[];
  indicadoresData?: IndicadoresCalculated[];
}

export function LoansChartSection({
  data,
  projectionInputs,
  indicadoresData,
}: LoansChartSectionProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <LoansChart
        data={data}
        projectionInputs={projectionInputs}
        indicadoresData={indicadoresData}
      />
    </div>
  );
}
