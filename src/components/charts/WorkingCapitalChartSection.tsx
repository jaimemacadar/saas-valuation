'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { BalanceSheetCalculated, BalanceSheetProjectionInputs, DRECalculated } from '@/core/types';

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

const WorkingCapitalChart = dynamic(
  () => import('@/components/charts/WorkingCapitalChart').then((mod) => mod.WorkingCapitalChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

interface WorkingCapitalChartSectionProps {
  data: BalanceSheetCalculated[];
  projectionInputs?: BalanceSheetProjectionInputs[];
  dreData?: DRECalculated[];
}

export function WorkingCapitalChartSection({
  data,
  projectionInputs,
  dreData,
}: WorkingCapitalChartSectionProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <WorkingCapitalChart
        data={data}
        projectionInputs={projectionInputs}
        dreData={dreData}
      />
    </div>
  );
}
