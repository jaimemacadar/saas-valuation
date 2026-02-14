"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { saveDREBase } from "@/lib/actions/models";
import { DREBaseInputs } from "@/core/types";

interface DREBaseFormProps {
  modelId: string;
  initialData?: DREBaseInputs;
}

export function DREBaseForm({ modelId, initialData }: DREBaseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<DREBaseInputs>({
    receita: initialData?.receita || 0,
    custoMercadoriaVendida: initialData?.custoMercadoriaVendida || 0,
    despesasOperacionais: initialData?.despesasOperacionais || 0,
    despesasFinanceiras: initialData?.despesasFinanceiras || 0,
    taxaImposto: initialData?.taxaImposto || 0,
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

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Demonstração do Resultado do Exercício (DRE)</CardTitle>
          <CardDescription>
            Insira os valores da DRE do ano base (último ano fiscal encerrado)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="receita">
                Receita Bruta <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="receita"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.receita}
                  onChange={(e) => handleChange("receita", e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custoMercadoriaVendida">
                Custo da Mercadoria Vendida (CMV) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="custoMercadoriaVendida"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.custoMercadoriaVendida}
                  onChange={(e) => handleChange("custoMercadoriaVendida", e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="despesasOperacionais">
                Despesas Operacionais <span className="text-destructive">*</span>
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
              <p className="text-xs text-muted-foreground">
                Inclui despesas administrativas, comerciais e gerais
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="despesasFinanceiras">
                Despesas Financeiras <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="despesasFinanceiras"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.despesasFinanceiras}
                  onChange={(e) => handleChange("despesasFinanceiras", e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  placeholder="0,00"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Juros e encargos financeiros
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxaImposto">
                Taxa de Imposto <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="taxaImposto"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.taxaImposto}
                  onChange={(e) => handleChange("taxaImposto", e.target.value)}
                  className="pr-10"
                  required
                  disabled={isLoading}
                  placeholder="0,34"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  (decimal)
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Alíquota efetiva de IR/CSLL (ex: 0,34 para 34%)
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && <Save className="mr-2 h-4 w-4" />}
            Salvar DRE
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
