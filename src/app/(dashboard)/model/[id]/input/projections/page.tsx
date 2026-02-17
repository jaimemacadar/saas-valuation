import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DREProjectionForm } from "@/components/forms/DREProjectionForm";
import { BalanceSheetProjectionForm } from "@/components/forms/BalanceSheetProjectionForm";
import { getModelById } from "@/lib/actions/models";
import { PageHeader } from "@/components/page-header";
import type { DREBaseInputs, BalanceSheetBaseInputs, DREProjectionInputs, BalanceSheetProjectionInputs } from "@/core/types";

export const metadata: Metadata = {
  title: "Premissas de Projeção | SaaS Valuation",
  description: "Configure as premissas de projeção para DRE e Balanço Patrimonial",
};

interface ProjectionsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectionsPage({ params }: ProjectionsPageProps) {
  const { id } = await params;

  // Buscar dados do modelo
  const modelResult = await getModelById(id);
  const companyName = modelResult.success && modelResult.data ? modelResult.data.company_name : "";
  const modelData = modelResult.success && modelResult.data
    ? (modelResult.data.model_data as any)
    : {};

  const dreBase = modelData.dreBase as DREBaseInputs | undefined;
  const balanceBase = modelData.balanceSheetBase as BalanceSheetBaseInputs | undefined;
  const dreProjection = modelData.dreProjection as DREProjectionInputs[] | undefined;
  const balanceSheetProjection = modelData.balanceSheetProjection as BalanceSheetProjectionInputs[] | undefined;

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Valuations", href: "/dashboard/models" },
          { label: companyName, href: `/model/${id}/view/dre` },
          { label: "Entrada de Dados" },
          { label: "Premissas de Projeção" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Premissas de Projeção</h1>
        <p className="text-muted-foreground">
          Configure as taxas de crescimento, margens e prazos médios para projetar os demonstrativos financeiros.
        </p>
      </div>
      <Tabs defaultValue="dre" className="w-full">
        <TabsList>
          <TabsTrigger value="dre">DRE</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balanço Patrimonial</TabsTrigger>
        </TabsList>

        <TabsContent value="dre" className="space-y-4">
          <DREProjectionForm
            modelId={id}
            initialData={dreProjection}
            dreBase={dreBase}
          />
        </TabsContent>

        <TabsContent value="balance-sheet" className="space-y-4">
          <BalanceSheetProjectionForm
            modelId={id}
            initialData={balanceSheetProjection}
            balanceBase={balanceBase}
            dreBase={dreBase}
          />
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
