import { notFound } from 'next/navigation';
import { getModelById } from '@/lib/actions/models';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { FCFFTable } from '@/components/tables/FCFFTable';
import { FCFFChartsSection } from '@/components/charts/FCFFChartsSection';
import { FCFFCalculated } from '@/core/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function FCFFPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getModelById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  // Parse model_data para extrair FCFF calculado
  const modelData = result.data.model_data as { fcff?: FCFFCalculated[] };
  const fcffData = modelData?.fcff || [];

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Valuations", href: "/dashboard/models" },
          { label: result.data.company_name, href: `/model/${id}/view/fcff` },
          { label: "Fluxo de Caixa Livre" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 px-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Fluxo de Caixa Livre</h1>
          <p className="text-muted-foreground">
            Visualize o Fluxo de Caixa Livre para a Firma (FCFF) projetado, base para o cálculo de valuation.
          </p>
        </div>
        <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table">Tabela</TabsTrigger>
          <TabsTrigger value="chart">Gráfico</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <FCFFTable data={fcffData} />
        </TabsContent>

        <TabsContent value="chart">
          <FCFFChartsSection data={fcffData} />
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}
