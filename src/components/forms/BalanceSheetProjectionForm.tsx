"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save, CheckCircle2, Sparkles } from "lucide-react";
import { BalanceSheetProjectionTable } from "./BalanceSheetProjectionTable";
import { BalanceSheetProjectionInputs, BalanceSheetBaseInputs, DREBaseInputs } from "@/core/types";
import { saveBalanceSheetProjection } from "@/lib/actions/models";
import { generateBalanceSheetProjectionDefaults } from "@/lib/utils/projection-defaults";

interface BalanceSheetProjectionFormProps {
  modelId: string;
  initialData?: BalanceSheetProjectionInputs[];
  balanceBase?: BalanceSheetBaseInputs;
  dreBase?: DREBaseInputs;
}

export function BalanceSheetProjectionForm({
  modelId,
  initialData,
  balanceBase,
  dreBase,
}: BalanceSheetProjectionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [projectionData, setProjectionData] = useState<BalanceSheetProjectionInputs[]>(
    initialData || []
  );

  const handleGenerateDefaults = () => {
    if (!balanceBase || !dreBase) {
      setError("Configure primeiro os dados do ano base (DRE e Balanço) para gerar premissas automáticas");
      return;
    }

    const defaults = generateBalanceSheetProjectionDefaults(balanceBase, dreBase, 5);
    setProjectionData(defaults);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await saveBalanceSheetProjection(modelId, projectionData);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Erro ao salvar premissas");
      }
    } catch (err) {
      setError("Erro inesperado ao salvar premissas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Premissas salvas com sucesso!
        </div>
      )}

      {balanceBase && dreBase && projectionData.length === 0 && (
        <div className="rounded-lg bg-blue-500/10 p-4 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Gerar Premissas Automáticas
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-200 mb-3">
                Crie automaticamente 5 anos de projeção com prazos médios calculados a partir do ano base e taxas padrão conservadoras.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateDefaults}
                className="border-blue-500/50 hover:bg-blue-500/10"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Defaults
              </Button>
            </div>
          </div>
        </div>
      )}

      <BalanceSheetProjectionTable
        data={projectionData}
        onChange={setProjectionData}
        maxYears={10}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading || projectionData.length === 0}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Premissas
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
