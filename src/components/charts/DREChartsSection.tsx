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

// Carregar gráficos dinamicamente sem SSR para evitar problemas de hydration com recharts
const RevenueChart = dynamic(
  () => import('@/components/charts/RevenueChart').then((mod) => mod.RevenueChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const CostCompositionChart = dynamic(
  () => import('@/components/charts/CostCompositionChart').then((mod) => mod.CostCompositionChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const EBITDAChart = dynamic(
  () => import('@/components/charts/EBITDAChart').then((mod) => mod.EBITDAChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

interface DREChartsSectionProps {
  data: DRECalculated[];
}

export function DREChartsSection({ data }: DREChartsSectionProps) {
  return (
    <div className="space-y-6">
      <RevenueChart data={data} />
      <CostCompositionChart data={data} />
      <EBITDAChart data={data} />
    </div>
  );
}
