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

const DRERevenueGrowthChart = dynamic(
  () => import('@/components/charts/DRERevenueGrowthChart').then((mod) => mod.DRERevenueGrowthChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

interface DRERevenueGrowthChartSectionProps {
  data: DRECalculated[];
}

export function DRERevenueGrowthChartSection({ data }: DRERevenueGrowthChartSectionProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <DRERevenueGrowthChart data={data} />
    </div>
  );
}
