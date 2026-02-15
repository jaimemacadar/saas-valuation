import { notFound } from 'next/navigation';
import { getModelById } from '@/lib/actions/models';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { DRETable } from '@/components/tables/DRETable';
import { DREChartsSection } from '@/components/charts/DREChartsSection';
import { DRECalculated } from '@/core/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function DREPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getModelById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  // Parse model_data para extrair DRE calculado
  const modelData = result.data.model_data as { dre?: DRECalculated[] };
  const dreData = modelData?.dre || [];

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Meus Modelos", href: "/dashboard/models" },
          { label: result.data.company_name, href: `/model/${id}/view/dre` },
          { label: "DRE Projetado" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table">Tabela</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <DRETable data={dreData} />
        </TabsContent>

        <TabsContent value="charts">
          <DREChartsSection data={dreData} />
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}
