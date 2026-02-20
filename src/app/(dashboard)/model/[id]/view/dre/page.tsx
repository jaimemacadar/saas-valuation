import { notFound } from 'next/navigation';
import { getModelById } from '@/lib/actions/models';
import { PageHeader } from '@/components/page-header';
import { DRETable } from '@/components/tables/DRETable';
import { DRECalculated, DREProjectionInputs } from '@/core/types';

export default async function DREPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getModelById(id);

  if (!result.success || !result.data) {
    notFound();
  }

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
          <h1 className="text-2xl font-bold">Demonstração de Resultado do Exercício - DRE</h1>
          <p className="text-muted-foreground">
            Visualize a Demonstração de Resultado do Exercício projetada para os próximos anos.
          </p>
        </div>

        <DRETable
          data={dreData}
          projectionInputs={dreProjection}
          modelId={id}
        />
      </div>
    </>
  );
}
