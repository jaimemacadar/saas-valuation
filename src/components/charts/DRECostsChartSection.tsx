'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { DRECalculated } from '@/core/types';

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

const DRECostsChart = dynamic(
  () => import('@/components/charts/DRECostsChart').then((mod) => mod.DRECostsChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

interface DRECostsChartSectionProps {
  data: DRECalculated[];
}

export function DRECostsChartSection({ data }: DRECostsChartSectionProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <DRECostsChart data={data} />
    </div>
  );
}
