import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getModelById } from '@/lib/actions/models';
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Balanço Patrimonial Projetado</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Projeção de ativos, passivos e patrimônio líquido
        </p>
      </div>

      <Suspense fallback={<BalanceSheetSkeleton />}>
        <BalanceSheetTable data={balanceSheetData} />
      </Suspense>
    </div>
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
