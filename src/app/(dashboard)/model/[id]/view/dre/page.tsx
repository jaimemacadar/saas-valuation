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
import { DRETable } from '@/components/tables/DRETable';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { CostCompositionChart } from '@/components/charts/CostCompositionChart';
import { EBITDAChart } from '@/components/charts/EBITDAChart';
import { DRECalculated } from '@/core/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function DREPage({ params }: { params: { id: string } }) {
  const result = await getModelById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  // Parse model_data para extrair DRE calculado
  const modelData = result.data.model_data as { dre?: DRECalculated[] };
  const dreData = modelData?.dre || [];

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
              <BreadcrumbLink href={`/model/${params.id}/view/dre`}>
                {result.data.company_name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>DRE Projetado</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table">Tabela</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <Suspense fallback={<DRETableSkeleton />}>
            <DRETable data={dreData} />
          </Suspense>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <Suspense fallback={<ChartSkeleton />}>
            <RevenueChart data={dreData} />
          </Suspense>
          <Suspense fallback={<ChartSkeleton />}>
            <CostCompositionChart data={dreData} />
          </Suspense>
          <Suspense fallback={<ChartSkeleton />}>
            <EBITDAChart data={dreData} />
          </Suspense>
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}

function DRETableSkeleton() {
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
