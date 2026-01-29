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
import { BalanceSheetTable } from '@/components/tables/BalanceSheetTable';
import { BalanceSheetCalculated } from '@/core/types';

export default async function BalanceSheetPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getModelById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  // Parse model_data para extrair Balanço calculado
  const modelData = result.data.model_data as {
    balanceSheet?: BalanceSheetCalculated[];
  };
  const balanceSheetData = modelData?.balanceSheet || [];

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
              <BreadcrumbLink href={`/model/${params.id}/view/balance-sheet`}>
                {result.data.company_name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Balanço Patrimonial</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <Suspense fallback={<BalanceSheetSkeleton />}>
          <BalanceSheetTable data={balanceSheetData} />
        </Suspense>
      </div>
    </>
  );
}

function BalanceSheetSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
