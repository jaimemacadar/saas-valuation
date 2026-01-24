import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, FileText, Calendar, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  // Carregar modelos do usuário
  const { data: models } = await supabase
    .from("financial_models")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Modelos</h1>
          <p className="mt-2 text-secondary-600">
            Gerencie seus modelos de valuation
          </p>
        </div>
        <Link href="/model/new">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Novo Modelo
          </Button>
        </Link>
      </div>

      {/* Models List */}
      {models && models.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <Link key={model.id} href={`/model/${model.id}`}>
              <Card className="group cursor-pointer transition-all hover:shadow-lg">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg group-hover:text-primary-600">
                        {model.company_name}
                      </h3>
                      {model.ticker_symbol && (
                        <p className="mt-1 text-sm font-mono text-secondary-600">
                          {model.ticker_symbol}
                        </p>
                      )}
                    </div>
                    <TrendingUp className="h-5 w-5 text-secondary-400 group-hover:text-primary-500" />
                  </div>

                  {model.description && (
                    <p className="mt-3 text-sm text-secondary-600 line-clamp-2">
                      {model.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-xs text-secondary-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(model.updated_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="h-16 w-16 text-secondary-300" />
            <h3 className="mt-4 text-lg font-semibold">
              Nenhum modelo criado ainda
            </h3>
            <p className="mt-2 text-sm text-secondary-600 max-w-md">
              Comece criando seu primeiro modelo de valuation. É rápido e fácil!
            </p>
            <Link href="/model/new" className="mt-6">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Criar Primeiro Modelo
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      {models && models.length > 0 && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Total de Modelos</p>
                <p className="mt-1 text-2xl font-bold">{models.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Criados este mês</p>
                <p className="mt-1 text-2xl font-bold">
                  {
                    models.filter((m) => {
                      const created = new Date(m.created_at);
                      const now = new Date();
                      return (
                        created.getMonth() === now.getMonth() &&
                        created.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-success-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">
                  Atualizado recentemente
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {
                    models.filter((m) => {
                      const updated = new Date(m.updated_at);
                      const now = new Date();
                      const diffDays =
                        (now.getTime() - updated.getTime()) /
                        (1000 * 60 * 60 * 24);
                      return diffDays <= 7;
                    }).length
                  }
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-warning-500" />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
