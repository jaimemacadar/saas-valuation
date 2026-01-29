import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getModelById } from '@/lib/actions/models';
import { Skeleton } from '@/components/ui/skeleton';
import { FCFFTable } from '@/components/tables/FCFFTable';
import { FCFFChart } from '@/components/charts/FCFFChart';
import { FCFFCalculated } from '@/core/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function FCFFPage({ params }: { params: { id: string } }) {
  const result = await getModelById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  // Parse model_data para extrair FCFF calculado
  const modelData = result.data.model_data as { fcff?: FCFFCalculated[] };
  const fcffData = modelData?.fcff || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Fluxo de Caixa Livre (FCFF)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Free Cash Flow to the Firm projetado
        </p>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table">Tabela</TabsTrigger>
          <TabsTrigger value="chart">Gráfico</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <Suspense fallback={<FCFFTableSkeleton />}>
            <FCFFTable data={fcffData} />
          </Suspense>
        </TabsContent>

        <TabsContent value="chart" className="space-y-6">
          <Suspense fallback={<ChartSkeleton />}>
            <FCFFChart data={fcffData} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FCFFTableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
