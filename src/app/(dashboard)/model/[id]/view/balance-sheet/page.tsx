import { notFound } from 'next/navigation';
import { getModelById } from '@/lib/actions/models';
import { PageHeader } from '@/components/page-header';
import { BalanceSheetTable } from '@/components/tables/BalanceSheetTable';
import { InvestmentTable } from '@/components/tables/InvestmentTable';
import { CashApplicationsTable } from '@/components/tables/CashApplicationsTable';
import { WorkingCapitalTable } from '@/components/tables/WorkingCapitalTable';
import { LoansTable } from '@/components/tables/LoansTable';
import { DRETable } from '@/components/tables/DRETable';
import { FCFFTable } from '@/components/tables/FCFFTable';
import { BalanceSheetCalculated, BalanceSheetProjectionInputs, DRECalculated, DREProjectionInputs, FCFFCalculated, IndicadoresCalculated } from '@/core/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvestmentChartSection } from '@/components/charts/InvestmentChartSection';
import { WorkingCapitalChartSection } from '@/components/charts/WorkingCapitalChartSection';
import { LoansChartsToggle } from '@/components/charts/LoansChartsToggle';
import { BalanceSheetChartsToggle } from '@/components/charts/BalanceSheetChartsToggle';
import { FCFFChartsSection } from '@/components/charts/FCFFChartsSection';
import { DREChartsToggle } from '@/components/charts/DREChartsToggle';

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

  const modelData = result.data.model_data as {
    balanceSheet?: BalanceSheetCalculated[];
    balanceSheetProjection?: BalanceSheetProjectionInputs[];
    dre?: DRECalculated[];
    dreProjection?: DREProjectionInputs[];
    fcff?: FCFFCalculated[];
    indicadores?: IndicadoresCalculated[];
  };

  const balanceSheetData = modelData?.balanceSheet || [];
  const balanceSheetProjection = modelData?.balanceSheetProjection || [];
  const dreData = modelData?.dre || [];
  const dreProjection = modelData?.dreProjection || [];
  const fcffData = modelData?.fcff || [];
  const indicadoresData = modelData?.indicadores || [];

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Valuations", href: "/dashboard/models" },
          { label: result.data.company_name, href: `/model/${id}/view/balance-sheet` },
          { label: "Projeções Financeiras" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 px-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Projeções Financeiras</h1>
          <p className="text-muted-foreground">
            Visualize a DRE, Balanço Patrimonial e Fluxo de Caixa Livre projetados.
          </p>
        </div>

        <Tabs defaultValue="dre" className="w-full">
          <TabsList>
            <TabsTrigger value="dre">DRE</TabsTrigger>
            <TabsTrigger value="balance-sheet">Balanço Patrimonial</TabsTrigger>
            <TabsTrigger value="cash-applications">Aplicações Financeiras</TabsTrigger>
            <TabsTrigger value="investment">Investimento</TabsTrigger>
            <TabsTrigger value="working-capital">Capital de Giro</TabsTrigger>
            <TabsTrigger value="loans">Empréstimos</TabsTrigger>
            <TabsTrigger value="fcff">Fluxo de Caixa Livre</TabsTrigger>
          </TabsList>

          <TabsContent value="dre" className="space-y-4">
            <DRETable
              data={dreData}
              projectionInputs={dreProjection}
              modelId={id}
            />
            <DREChartsToggle data={dreData} />
          </TabsContent>

          <TabsContent value="balance-sheet" className="space-y-4">
            <BalanceSheetTable data={balanceSheetData} />
            <BalanceSheetChartsToggle
              data={balanceSheetData}
              indicadoresData={indicadoresData}
            />
          </TabsContent>

          <TabsContent value="cash-applications" className="space-y-4">
            <CashApplicationsTable
              data={balanceSheetData}
              projectionInputs={balanceSheetProjection}
              modelId={id}
            />
          </TabsContent>

          <TabsContent value="investment" className="space-y-4">
            <InvestmentTable
              data={balanceSheetData}
              projectionInputs={balanceSheetProjection}
              modelId={id}
            />
            <InvestmentChartSection
              data={balanceSheetData}
              projectionInputs={balanceSheetProjection}
              dreData={dreData}
              indicadoresData={indicadoresData}
            />
          </TabsContent>

          <TabsContent value="working-capital" className="space-y-4">
            <WorkingCapitalTable
              data={balanceSheetData}
              projectionInputs={balanceSheetProjection}
              modelId={id}
            />
            <WorkingCapitalChartSection
              data={balanceSheetData}
              projectionInputs={balanceSheetProjection}
              dreData={dreData}
            />
          </TabsContent>

          <TabsContent value="loans" className="space-y-4">
            <LoansTable
              data={balanceSheetData}
              projectionInputs={balanceSheetProjection}
              modelId={id}
              indicadoresData={indicadoresData}
            />
            <LoansChartsToggle
              data={balanceSheetData}
              projectionInputs={balanceSheetProjection}
              indicadoresData={indicadoresData}
            />
          </TabsContent>

          <TabsContent value="fcff" className="space-y-4">
            <FCFFTable data={fcffData} />
            <FCFFChartsSection data={fcffData} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
