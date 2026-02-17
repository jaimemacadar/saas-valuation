import { notFound } from 'next/navigation';
import { getModelById } from '@/lib/actions/models';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { DRETable } from '@/components/tables/DRETable';
import { DREChartsSection } from '@/components/charts/DREChartsSection';
import { DRECalculated, DREProjectionInputs } from '@/core/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function DREPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getModelById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  // Parse model_data para extrair DRE calculado e premissas
  const modelData = result.data.model_data as {
    dre?: DRECalculated[];
    dreProjection?: DREProjectionInputs[];
  };
  const dreData = modelData?.dre || [];
  const dreProjection = modelData?.dreProjection || [];

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Valuations", href: "/dashboard/models" },
          { label: result.data.company_name, href: `/model/${id}/view/dre` },
          { label: "DRE Projetado" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">DRE Projetado</h1>
          <p className="text-muted-foreground">
            Visualize a Demonstração de Resultado do Exercício projetada para os próximos anos.
          </p>
        </div>
        <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table">Tabela</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <DRETable
            data={dreData}
            projectionInputs={dreProjection}
            modelId={id}
          />
        </TabsContent>

        <TabsContent value="charts">
          <DREChartsSection data={dreData} />
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}
