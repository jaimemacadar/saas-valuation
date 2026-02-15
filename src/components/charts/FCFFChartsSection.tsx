'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { FCFFCalculated } from '@/core/types';

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

const FCFFChart = dynamic(
  () => import('@/components/charts/FCFFChart').then((mod) => mod.FCFFChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

interface FCFFChartsSectionProps {
  data: FCFFCalculated[];
}

export function FCFFChartsSection({ data }: FCFFChartsSectionProps) {
  return <FCFFChart data={data} />;
}
