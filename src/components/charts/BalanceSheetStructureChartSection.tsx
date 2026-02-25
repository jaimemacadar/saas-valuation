'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { BalanceSheetCalculated, IndicadoresCalculated } from '@/core/types';

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-[800px] w-full" />
    </div>
  );
}

const BalanceSheetStructureChart = dynamic(
  () =>
    import('@/components/charts/BalanceSheetStructureChart').then(
      (mod) => mod.BalanceSheetStructureChart
    ),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

interface BalanceSheetStructureChartSectionProps {
  data: BalanceSheetCalculated[];
  indicadoresData?: IndicadoresCalculated[];
  onlyPassivo?: boolean;
  onlyAtivo?: boolean;
}

export function BalanceSheetStructureChartSection({
  data,
  indicadoresData,
  onlyPassivo,
  onlyAtivo,
}: BalanceSheetStructureChartSectionProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <BalanceSheetStructureChart
        data={data}
        indicadoresData={indicadoresData}
        onlyPassivo={onlyPassivo}
        onlyAtivo={onlyAtivo}
      />
    </div>
  );
}
