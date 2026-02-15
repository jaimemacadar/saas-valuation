'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createModel } from '@/lib/actions/models';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewModelPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const modelData = {
      company_name: formData.get('company_name') as string,
      ticker_symbol: formData.get('ticker_symbol') as string | undefined,
      description: formData.get('description') as string | undefined,
    };

    try {
      const result = await createModel(modelData);

      if (result.success && result.data) {
        router.push(`/model/${result.data.id}/view/dre`);
      } else {
        setError(result.error || 'Erro ao criar modelo');
      }
    } catch (err) {
      setError('Erro inesperado ao criar modelo');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Valuations", href: "/dashboard/models" },
          { label: "Novo Valuation" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Criar Novo Valuation</h1>
              <p className="text-sm text-muted-foreground">
                Preencha as informações básicas da empresa
              </p>
            </div>
          </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Estas informações podem ser editadas posteriormente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="company_name">
                  Nome da Empresa <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="company_name"
                  name="company_name"
                  placeholder="Ex: Empresa ABC Ltda"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticker_symbol">Ticker/Símbolo (opcional)</Label>
                <Input
                  id="ticker_symbol"
                  name="ticker_symbol"
                  placeholder="Ex: ABCD3"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Descreva brevemente a empresa e o objetivo do valuation..."
                  rows={4}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Modelo
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Após criar o modelo, você será redirecionado para a tela de visualização</li>
              <li>Use a navegação lateral para acessar as diferentes seções</li>
              <li>Preencha os dados do Ano Base (DRE e Balanço Patrimonial)</li>
              <li>Defina as Premissas de Projeção para os anos futuros</li>
              <li>Visualize as projeções e análises de valuation</li>
            </ol>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
}
