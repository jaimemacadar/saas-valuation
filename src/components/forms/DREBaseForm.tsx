"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { saveDREBase } from "@/lib/actions/models";
import { DREBaseInputs } from "@/core/types";
import { formatCurrency } from "@/lib/utils/formatters";

interface DREBaseFormProps {
  modelId: string;
  initialData?: DREBaseInputs;
}

export function DREBaseForm({ modelId, initialData }: DREBaseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<DREBaseInputs>({
    receitaBruta: initialData?.receitaBruta || 0,
    impostosEDevolucoes: initialData?.impostosEDevolucoes || 0,
    cmv: initialData?.cmv || 0,
    despesasOperacionais: initialData?.despesasOperacionais || 0,
    irCSLL: initialData?.irCSLL || 0,
    dividendos: initialData?.dividendos || 0,
  });

  const handleChange = (field: keyof DREBaseInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await saveDREBase(modelId, formData);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Erro ao salvar dados");
      }
    } catch (err) {
      setError("Erro inesperado ao salvar dados");
    } finally {
      setIsLoading(false);
    }
  };

  // Cálculos derivados para exibição
  const receitaLiquida = formData.receitaBruta - formData.impostosEDevolucoes;
  const lucroBruto = receitaLiquida - formData.cmv;
  const ebit = lucroBruto - formData.despesasOperacionais;
  const lucroAntesIR = ebit; // Simplificado - sem desp. financeiras no form base
  const lucroLiquido = lucroAntesIR - formData.irCSLL;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Demonstração do Resultado do Exercício (DRE)</CardTitle>
          <CardDescription>
            Insira os valores da DRE do ano base (último ano fiscal encerrado)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Dados salvos com sucesso!
            </div>
          )}

          {/* Receita */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">Receita</h3>

            <div className="space-y-2">
              <Label htmlFor="receitaBruta">
                Receita Bruta <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="receitaBruta"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.receitaBruta}
                  onChange={(e) => handleChange("receitaBruta", e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="impostosEDevolucoes">
                (-) Impostos e Devoluções <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="impostosEDevolucoes"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.impostosEDevolucoes}
                  onChange={(e) => handleChange("impostosEDevolucoes", e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">= Receita Líquida</span>
                <span className="font-semibold">{formatCurrency(receitaLiquida)}</span>
              </div>
            </div>
          </div>

          {/* Custos e Despesas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">Custos e Despesas</h3>

            <div className="space-y-2">
              <Label htmlFor="cmv">
                (-) Custo das Mercadorias Vendidas (CMV) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="cmv"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cmv}
                  onChange={(e) => handleChange("cmv", e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">= Lucro Bruto</span>
                <span className="font-semibold">{formatCurrency(lucroBruto)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="despesasOperacionais">
                (-) Despesas Operacionais <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="despesasOperacionais"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.despesasOperacionais}
                  onChange={(e) => handleChange("despesasOperacionais", e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">= EBIT</span>
                <span className="font-semibold">{formatCurrency(ebit)}</span>
              </div>
            </div>
          </div>

          {/* Impostos e Dividendos */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">Impostos e Dividendos</h3>

            <div className="space-y-2">
              <Label htmlFor="irCSLL">
                (-) IR/CSLL <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="irCSLL"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.irCSLL}
                  onChange={(e) => handleChange("irCSLL", e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">= Lucro Líquido</span>
                <span className="font-semibold">{formatCurrency(lucroLiquido)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dividendos">
                (-) Dividendos
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="dividendos"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.dividendos}
                  onChange={(e) => handleChange("dividendos", e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          {/* Resumo Final */}
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Receita Líquida</span>
              <span className="font-medium">{formatCurrency(receitaLiquida)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Lucro Bruto</span>
              <span className="font-medium">{formatCurrency(lucroBruto)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>EBIT</span>
              <span className="font-medium">{formatCurrency(ebit)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t pt-2">
              <span>Lucro Líquido</span>
              <span className={lucroLiquido >= 0 ? "text-green-600" : "text-destructive"}>
                {formatCurrency(lucroLiquido)}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Dados
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
