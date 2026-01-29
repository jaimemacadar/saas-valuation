import { Suspense } from 'react';
import Link from 'next/link';
import { getModels } from '@/lib/actions/models';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FileText, ArrowRight } from 'lucide-react';

export default async function DashboardPage() {
  const modelsResult = await getModels();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus modelos de valuation
          </p>
        </div>
        <Button asChild>
          <Link href="/models/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Modelo
          </Link>
        </Button>
      </div>

      <Suspense fallback={<ModelsGridSkeleton />}>
        <ModelsGrid models={modelsResult.success && modelsResult.data ? modelsResult.data : []} />
      </Suspense>
    </div>
  );
}

function ModelsGrid({
  models,
}: {
  models: Array<{
    id: string;
    company_name: string;
    description?: string | null;
    updated_at: string;
  }>;
}) {
  if (models.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum modelo criado</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
            Comece criando seu primeiro modelo de valuation para uma empresa.
          </p>
          <Button asChild>
            <Link href="/models/new">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Modelo
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {models.map((model) => (
        <Card key={model.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>{model.company_name}</CardTitle>
            <CardDescription>
              {model.description || 'Sem descrição'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Atualizado em{' '}
              {new Date(model.updated_at).toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/model/${model.id}/view/dre`}>
                Abrir Modelo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function ModelsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-32" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
