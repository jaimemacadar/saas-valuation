import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getModelById } from '@/lib/actions/models';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { BalanceSheetTable } from '@/components/tables/BalanceSheetTable';
import { BalanceSheetCalculated } from '@/core/types';

export default async function BalanceSheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getModelById(id);

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
      <PageHeader
        breadcrumbs={[
          { label: "Valuations", href: "/dashboard/models" },
          { label: result.data.company_name, href: `/model/${id}/view/balance-sheet` },
          { label: "Balanço Patrimonial" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Balanço Patrimonial</h1>
          <p className="text-muted-foreground">
            Visualize o Balanço Patrimonial projetado com ativos, passivos e patrimônio líquido.
          </p>
        </div>
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
