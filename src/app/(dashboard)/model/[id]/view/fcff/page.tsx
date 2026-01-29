import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getModelById } from '@/lib/actions/models';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/model/${params.id}/view/fcff`}>
                {result.data.company_name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Fluxo de Caixa Livre</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
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
    </>
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
