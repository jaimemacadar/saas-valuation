import Link from "next/link";
import { getModels } from "@/lib/actions/models";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ModelCard } from "./model-card";

export default async function ModelsPage() {
  const result = await getModels();
  const models = result.success && result.data ? result.data : [];

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Valuations" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Valuations</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seus modelos de valuation
            </p>
          </div>
          <Button asChild>
            <Link href="/model/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Valuation
            </Link>
          </Button>
        </div>

        {models.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {models.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl bg-muted/50 p-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                Nenhum modelo encontrado
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie seu primeiro modelo de valuation para começar
              </p>
              <Button asChild>
                <Link href="/model/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Modelo
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
