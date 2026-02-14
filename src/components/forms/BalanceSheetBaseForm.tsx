"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { saveBalanceSheetBase } from "@/lib/actions/models";
import { BalanceSheetBaseInputs } from "@/core/types";

interface BalanceSheetBaseFormProps {
  modelId: string;
  initialData?: BalanceSheetBaseInputs;
}

export function BalanceSheetBaseForm({ modelId, initialData }: BalanceSheetBaseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<BalanceSheetBaseInputs>({
    caixa: initialData?.caixa || 0,
    contasReceber: initialData?.contasReceber || 0,
    estoques: initialData?.estoques || 0,
    ativoCirculante: initialData?.ativoCirculante || 0,
    imobilizado: initialData?.imobilizado || 0,
    ativoTotal: initialData?.ativoTotal || 0,
    contasPagar: initialData?.contasPagar || 0,
    passivoCirculante: initialData?.passivoCirculante || 0,
    passivoNaoCirculante: initialData?.passivoNaoCirculante || 0,
    dividasLongoPrazo: initialData?.dividasLongoPrazo || 0,
    passivoTotal: initialData?.passivoTotal || 0,
    patrimonioLiquido: initialData?.patrimonioLiquido || 0,
  });

  // Calcular totais automaticamente
  useEffect(() => {
    const ativoCirculante = formData.caixa + formData.contasReceber + formData.estoques;
    const ativoTotal = ativoCirculante + formData.imobilizado;
    const passivoTotal = formData.passivoCirculante + formData.passivoNaoCirculante;

    setFormData(prev => ({
      ...prev,
      ativoCirculante,
      ativoTotal,
      passivoTotal,
    }));
  }, [
    formData.caixa,
    formData.contasReceber,
    formData.estoques,
    formData.imobilizado,
    formData.passivoCirculante,
    formData.passivoNaoCirculante,
  ]);

  // Verificar balanço
  const balanceDifference = formData.ativoTotal - (formData.passivoTotal + formData.patrimonioLiquido);
  const isBalanced = Math.abs(balanceDifference) < 0.01;

  const handleChange = (field: keyof BalanceSheetBaseInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    if (!isBalanced) {
      setError("O balanço não está equilibrado. Ativo Total deve ser igual a Passivo Total + Patrimônio Líquido");
      setIsLoading(false);
      return;
    }

    try {
      const result = await saveBalanceSheetBase(modelId, formData);

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
          <CardTitle>Balanço Patrimonial</CardTitle>
          <CardDescription>
            Insira os valores do balanço patrimonial do ano base
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Dados salvos com sucesso!
            </div>
          )}

          {/* Status do Balanço */}
          <div className={`rounded-lg p-3 text-sm flex items-center gap-2 ${
            isBalanced
              ? 'bg-green-500/10 text-green-600'
              : 'bg-yellow-500/10 text-yellow-600'
          }`}>
            {isBalanced ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Balanço equilibrado
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                Diferença: R$ {Math.abs(balanceDifference).toFixed(2)} - Ajuste o Patrimônio Líquido
              </>
            )}
          </div>

          {/* ATIVO */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">ATIVO</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="caixa">
                  Caixa e Equivalentes <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="caixa"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.caixa}
                    onChange={(e) => handleChange("caixa", e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contasReceber">
                  Contas a Receber <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="contasReceber"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.contasReceber}
                    onChange={(e) => handleChange("contasReceber", e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estoques">
                  Estoques <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="estoques"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.estoques}
                    onChange={(e) => handleChange("estoques", e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ativoCirculante" className="text-muted-foreground">
                  Ativo Circulante (calculado)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="ativoCirculante"
                    type="number"
                    value={formData.ativoCirculante.toFixed(2)}
                    className="pl-10 bg-muted"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imobilizado">
                  Ativo Imobilizado <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="imobilizado"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.imobilizado}
                    onChange={(e) => handleChange("imobilizado", e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ativoTotal" className="font-bold">
                  ATIVO TOTAL (calculado)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="ativoTotal"
                    type="number"
                    value={formData.ativoTotal.toFixed(2)}
                    className="pl-10 bg-muted font-bold"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PASSIVO */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">PASSIVO</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contasPagar">
                  Fornecedores <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="contasPagar"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.contasPagar}
                    onChange={(e) => handleChange("contasPagar", e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passivoCirculante">
                  Passivo Circulante <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="passivoCirculante"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.passivoCirculante}
                    onChange={(e) => handleChange("passivoCirculante", e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    placeholder="0,00"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Total de obrigações de curto prazo
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dividasLongoPrazo">
                  Dívidas de Longo Prazo <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="dividasLongoPrazo"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.dividasLongoPrazo}
                    onChange={(e) => handleChange("dividasLongoPrazo", e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passivoNaoCirculante">
                  Passivo Não Circulante <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="passivoNaoCirculante"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.passivoNaoCirculante}
                    onChange={(e) => handleChange("passivoNaoCirculante", e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    placeholder="0,00"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Total de obrigações de longo prazo
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passivoTotal" className="font-bold">
                  PASSIVO TOTAL (calculado)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="passivoTotal"
                    type="number"
                    value={formData.passivoTotal.toFixed(2)}
                    className="pl-10 bg-muted font-bold"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PATRIMÔNIO LÍQUIDO */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">PATRIMÔNIO LÍQUIDO</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patrimonioLiquido" className="font-bold">
                  Patrimônio Líquido <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="patrimonioLiquido"
                    type="number"
                    step="0.01"
                    value={formData.patrimonioLiquido}
                    onChange={(e) => handleChange("patrimonioLiquido", e.target.value)}
                    className="pl-10 font-bold"
                    required
                    disabled={isLoading}
                    placeholder="0,00"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Ajuste este valor para equilibrar o balanço
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">
                  Passivo + PL (calculado)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    type="number"
                    value={(formData.passivoTotal + formData.patrimonioLiquido).toFixed(2)}
                    className="pl-10 bg-muted"
                    disabled
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Deve ser igual ao Ativo Total
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading || !isBalanced}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && <Save className="mr-2 h-4 w-4" />}
            Salvar Balanço
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
