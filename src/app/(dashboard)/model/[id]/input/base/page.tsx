import { notFound } from 'next/navigation';
import { getModelById } from '@/lib/actions/models';
import { PageHeader } from '@/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DREBaseForm } from '@/components/forms/DREBaseForm';
import { BalanceSheetBaseForm } from '@/components/forms/BalanceSheetBaseForm';
import { DREBaseInputs, BalanceSheetBaseInputs } from '@/core/types';

export default async function AnoBasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getModelById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  // Extract initial data from model_data
  const modelData = result.data.model_data as any;
  const dreBaseData = modelData?.dreBase as DREBaseInputs | undefined;
  const balanceSheetBaseData = modelData?.balanceSheetBase as BalanceSheetBaseInputs | undefined;

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Valuations", href: "/dashboard/models" },
          { label: result.data.company_name, href: `/model/${id}/view/balance-sheet` },
          { label: "Entrada de Dados" },
          { label: "Ano Base" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 px-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Formulário Ano Base</h1>
          <p className="text-muted-foreground">
            Insira os dados financeiros do último ano fiscal encerrado (ano base) para projeção.
          </p>
        </div>

        <Tabs defaultValue="dre" className="w-full">
          <TabsList>
            <TabsTrigger value="dre">DRE</TabsTrigger>
            <TabsTrigger value="balance-sheet">Balanço Patrimonial</TabsTrigger>
          </TabsList>

          <TabsContent value="dre" className="space-y-4">
            <DREBaseForm modelId={id} initialData={dreBaseData} />
          </TabsContent>

          <TabsContent value="balance-sheet" className="space-y-4">
            <BalanceSheetBaseForm modelId={id} initialData={balanceSheetBaseData} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
