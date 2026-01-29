import { Suspense } from 'react';
import Link from 'next/link';
import { getModels } from '@/lib/actions/models';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DRETable } from '@/components/tables/DRETable';
import { BalanceSheetTable } from '@/components/tables/BalanceSheetTable';
import { FCFFTable } from '@/components/tables/FCFFTable';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { FCFFChart } from '@/components/charts/FCFFChart';
import { Skeleton } from '@/components/ui/skeleton';
import { DRECalculated, BalanceSheetCalculated, FCFFCalculated } from '@/core/types';

export default async function DashboardPage() {
  const modelsResult = await getModels();

  // Pega o primeiro modelo para demonstração (você pode modificar isso depois)
  const firstModel = modelsResult.success && modelsResult.data?.[0] ? modelsResult.data[0] : null;
  const modelData = firstModel ? (firstModel.model_data as {
    dre?: DRECalculated[];
    balanceSheet?: BalanceSheetCalculated[];
    fcff?: FCFFCalculated[];
  } | undefined) : undefined;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Demonstrações Financeiras</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {firstModel ? (
          <Tabs defaultValue="dre" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="dre">DRE</TabsTrigger>
              <TabsTrigger value="balanco">Balanço Patrimonial</TabsTrigger>
              <TabsTrigger value="fcff">Fluxo de Caixa</TabsTrigger>
            </TabsList>

            <TabsContent value="dre" className="space-y-4">
              <div className="rounded-xl bg-muted/50 p-4">
                <h2 className="text-lg font-semibold mb-4">
                  DRE Projetado - {firstModel.company_name}
                </h2>
                <Suspense fallback={<TableSkeleton />}>
                  <DRETable data={modelData?.dre || []} />
                </Suspense>
              </div>

              <div className="rounded-xl bg-muted/50 p-4 min-h-[400px]">
                <Suspense fallback={<ChartSkeleton />}>
                  <RevenueChart data={modelData?.dre || []} />
                </Suspense>
              </div>
            </TabsContent>

            <TabsContent value="balanco" className="space-y-4">
              <div className="rounded-xl bg-muted/50 p-4">
                <h2 className="text-lg font-semibold mb-4">
                  Balanço Patrimonial - {firstModel.company_name}
                </h2>
                <Suspense fallback={<TableSkeleton />}>
                  <BalanceSheetTable data={modelData?.balanceSheet || []} />
                </Suspense>
              </div>
            </TabsContent>

            <TabsContent value="fcff" className="space-y-4">
              <div className="rounded-xl bg-muted/50 p-4">
                <h2 className="text-lg font-semibold mb-4">
                  Fluxo de Caixa Livre (FCFF) - {firstModel.company_name}
                </h2>
                <Suspense fallback={<TableSkeleton />}>
                  <FCFFTable data={modelData?.fcff || []} />
                </Suspense>
              </div>

              <div className="rounded-xl bg-muted/50 p-4 min-h-[400px]">
                <Suspense fallback={<ChartSkeleton />}>
                  <FCFFChart data={modelData?.fcff || []} />
                </Suspense>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl bg-muted/50 p-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Nenhum modelo encontrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie seu primeiro modelo de valuation para começar
              </p>
              <Link
                href="/model/new"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Criar Primeiro Modelo
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function TableSkeleton() {
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
