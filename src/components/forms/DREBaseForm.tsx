"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { saveDREBase } from "@/lib/actions/models";
import { DREBaseInputs } from "@/core/types";
import { formatCurrency, parseInputNumber } from "@/lib/utils/formatters";
import { FinancialInput } from "@/components/ui/financial-input";

interface DREBaseFormProps {
  modelId: string;
  initialData?: DREBaseInputs;
}

// Função helper para garantir estrutura completa de dados
const getInitialFormData = (data?: DREBaseInputs): DREBaseInputs => {
  const defaults: DREBaseInputs = {
    receitaBruta: 0,
    impostosEDevolucoes: 0,
    cmv: 0,
    despesasOperacionais: 0,
    irCSLL: 0,
    dividendos: 0,
  };

  if (!data) return defaults;

  return {
    receitaBruta: data.receitaBruta ?? defaults.receitaBruta,
    impostosEDevolucoes: data.impostosEDevolucoes ?? defaults.impostosEDevolucoes,
    cmv: data.cmv ?? defaults.cmv,
    despesasOperacionais: data.despesasOperacionais ?? defaults.despesasOperacionais,
    irCSLL: data.irCSLL ?? defaults.irCSLL,
    dividendos: data.dividendos ?? defaults.dividendos,
  };
};

export function DREBaseForm({ modelId, initialData }: DREBaseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<DREBaseInputs>(() =>
    getInitialFormData(initialData)
  );

  const handleChange = (field: keyof DREBaseInputs, value: string) => {
    const numValue = parseInputNumber(value);
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
    <form onSubmit={handleSubmit} className="max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Demonstração do Resultado do Exercício (DRE)</CardTitle>
          <CardDescription>
            Insira os valores da DRE do ano base (último ano fiscal encerrado)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Dados salvos com sucesso!
            </div>
          ) : null}

          {/* Receita */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">Receita</h3>

            <div className="space-y-3">
              <FinancialInput
                id="receitaBruta"
                label="Receita Bruta"
                value={formData.receitaBruta}
                onChange={(value) => handleChange("receitaBruta", value)}
                required
                disabled={isLoading}
              />

              <FinancialInput
                id="impostosEDevolucoes"
                label="(-) Impostos e Devoluções"
                value={formData.impostosEDevolucoes}
                onChange={(value) => handleChange("impostosEDevolucoes", value)}
                required
                disabled={isLoading}
              />
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

            <div className="space-y-3">
              <FinancialInput
                id="cmv"
                label="(-) CMV"
                value={formData.cmv}
                onChange={(value) => handleChange("cmv", value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="rounded-lg bg-muted p-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">= Lucro Bruto</span>
                <span className="font-semibold">{formatCurrency(lucroBruto)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <FinancialInput
                id="despesasOperacionais"
                label="(-) Despesas Operacionais"
                value={formData.despesasOperacionais}
                onChange={(value) => handleChange("despesasOperacionais", value)}
                required
                disabled={isLoading}
              />
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

            <div className="space-y-3">
              <FinancialInput
                id="irCSLL"
                label="(-) IR/CSLL"
                value={formData.irCSLL}
                onChange={(value) => handleChange("irCSLL", value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="rounded-lg bg-muted p-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">= Lucro Líquido</span>
                <span className="font-semibold">{formatCurrency(lucroLiquido)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <FinancialInput
                id="dividendos"
                label="(-) Dividendos"
                value={formData.dividendos}
                onChange={(value) => handleChange("dividendos", value)}
                disabled={isLoading}
              />
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
