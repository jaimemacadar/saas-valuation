import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DREProjectionForm } from "@/components/forms/DREProjectionForm";
import { BalanceSheetProjectionForm } from "@/components/forms/BalanceSheetProjectionForm";
import { getModelById } from "@/lib/actions/models";
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
  const modelData = modelResult.success && modelResult.data
    ? (modelResult.data.model_data as any)
    : {};

  const dreBase = modelData.dreBase as DREBaseInputs | undefined;
  const balanceBase = modelData.balanceSheetBase as BalanceSheetBaseInputs | undefined;
  const dreProjection = modelData.dreProjection as DREProjectionInputs[] | undefined;
  const balanceSheetProjection = modelData.balanceSheetProjection as BalanceSheetProjectionInputs[] | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Premissas de Projeção</h1>
        <p className="text-muted-foreground mt-2">
          Configure as premissas de crescimento, margens e prazos médios para projetar os demonstrativos
        </p>
      </div>

      <Tabs defaultValue="dre" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dre">DRE</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balanço Patrimonial</TabsTrigger>
        </TabsList>

        <TabsContent value="dre" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Premissas de Projeção - DRE</CardTitle>
              <CardDescription>
                Configure as taxas de crescimento e margens para cada ano de projeção da DRE
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DREProjectionForm
                modelId={id}
                initialData={dreProjection}
                dreBase={dreBase}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Premissas de Projeção - Balanço Patrimonial</CardTitle>
              <CardDescription>
                Configure os prazos médios, taxas e índices para projeção do Balanço Patrimonial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BalanceSheetProjectionForm
                modelId={id}
                initialData={balanceSheetProjection}
                balanceBase={balanceBase}
                dreBase={dreBase}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
