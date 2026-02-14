"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { saveBalanceSheetBase } from "@/lib/actions/models";
import { BalanceSheetBaseInputs } from "@/core/types";
import { formatCurrency } from "@/lib/utils/formatters";

interface BalanceSheetBaseFormProps {
  modelId: string;
  initialData?: BalanceSheetBaseInputs;
}

export function BalanceSheetBaseForm({ modelId, initialData }: BalanceSheetBaseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<BalanceSheetBaseInputs>(
    initialData || {
      ativoCirculante: {
        caixaEquivalentes: 0,
        aplicacoesFinanceiras: 0,
        contasReceber: 0,
        estoques: 0,
        ativosBiologicos: 0,
        outrosCreditos: 0,
      },
      ativoRealizavelLP: {
        investimentos: 0,
        ativoImobilizadoBruto: 0,
        depreciacaoAcumulada: 0,
        intangivel: 0,
      },
      passivoCirculante: {
        fornecedores: 0,
        impostosAPagar: 0,
        obrigacoesSociaisETrabalhistas: 0,
        emprestimosFinanciamentosCP: 0,
        outrasObrigacoes: 0,
      },
      passivoRealizavelLP: {
        emprestimosFinanciamentosLP: 0,
      },
      patrimonioLiquido: {
        capitalSocial: 0,
        lucrosAcumulados: 0,
      },
    }
  );

  const handleChange = (
    section: keyof BalanceSheetBaseInputs,
    field: string,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: numValue,
      },
    }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

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

  // Cálculos totais
  const totalAtivoCirculante =
    formData.ativoCirculante.caixaEquivalentes +
    formData.ativoCirculante.aplicacoesFinanceiras +
    formData.ativoCirculante.contasReceber +
    formData.ativoCirculante.estoques +
    formData.ativoCirculante.ativosBiologicos +
    formData.ativoCirculante.outrosCreditos;

  const imobilizado =
    formData.ativoRealizavelLP.ativoImobilizadoBruto -
    formData.ativoRealizavelLP.depreciacaoAcumulada;

  const totalAtivoRealizavelLP =
    formData.ativoRealizavelLP.investimentos +
    imobilizado +
    formData.ativoRealizavelLP.intangivel;

  const ativoTotal = totalAtivoCirculante + totalAtivoRealizavelLP;

  const totalPassivoCirculante =
    formData.passivoCirculante.fornecedores +
    formData.passivoCirculante.impostosAPagar +
    formData.passivoCirculante.obrigacoesSociaisETrabalhistas +
    formData.passivoCirculante.emprestimosFinanciamentosCP +
    formData.passivoCirculante.outrasObrigacoes;

  const totalPassivoRealizavelLP = formData.passivoRealizavelLP.emprestimosFinanciamentosLP;

  const totalPatrimonioLiquido =
    formData.patrimonioLiquido.capitalSocial + formData.patrimonioLiquido.lucrosAcumulados;

  const passivoTotal = totalPassivoCirculante + totalPassivoRealizavelLP + totalPatrimonioLiquido;

  const balanceado = Math.abs(ativoTotal - passivoTotal) < 0.01;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Balanço Patrimonial</CardTitle>
          <CardDescription>
            Insira os valores do balanço patrimonial do ano base (último ano fiscal encerrado)
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

          {!balanceado && (
            <div className="rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-600">
              ⚠️ Ativo Total e Passivo Total não estão balanceados
            </div>
          )}

          {/* ATIVO CIRCULANTE */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">Ativo Circulante</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="caixaEquivalentes">Caixa e Equivalentes</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="caixaEquivalentes"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.ativoCirculante.caixaEquivalentes}
                    onChange={(e) => handleChange("ativoCirculante", "caixaEquivalentes", e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aplicacoesFinanceiras">Aplicações Financeiras</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="aplicacoesFinanceiras"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.ativoCirculante.aplicacoesFinanceiras}
                    onChange={(e) => handleChange("ativoCirculante", "aplicacoesFinanceiras", e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contasReceber">Contas a Receber</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="contasReceber"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.ativoCirculante.contasReceber}
                    onChange={(e) => handleChange("ativoCirculante", "contasReceber", e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estoques">Estoques</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="estoques"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.ativoCirculante.estoques}
                    onChange={(e) => handleChange("ativoCirculante", "estoques", e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total Ativo Circulante</span>
                <span className="font-semibold">{formatCurrency(totalAtivoCirculante)}</span>
              </div>
            </div>
          </div>

          {/* ATIVO REALIZÁVEL LP */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">Ativo Realizável Longo Prazo</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ativoImobilizadoBruto">Ativo Imobilizado Bruto</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="ativoImobilizadoBruto"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.ativoRealizavelLP.ativoImobilizadoBruto}
                    onChange={(e) => handleChange("ativoRealizavelLP", "ativoImobilizadoBruto", e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depreciacaoAcumulada">(-) Depreciação Acumulada</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="depreciacaoAcumulada"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.ativoRealizavelLP.depreciacaoAcumulada}
                    onChange={(e) => handleChange("ativoRealizavelLP", "depreciacaoAcumulada", e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total Ativo Realizável LP</span>
                <span className="font-semibold">{formatCurrency(totalAtivoRealizavelLP)}</span>
              </div>
            </div>
          </div>

          {/* PASSIVO CIRCULANTE */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">Passivo Circulante</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fornecedores">Fornecedores</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="fornecedores"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.passivoCirculante.fornecedores}
                    onChange={(e) => handleChange("passivoCirculante", "fornecedores", e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emprestimosFinanciamentosCP">Empréstimos/Financiamentos CP</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="emprestimosFinanciamentosCP"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.passivoCirculante.emprestimosFinanciamentosCP}
                    onChange={(e) => handleChange("passivoCirculante", "emprestimosFinanciamentosCP", e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total Passivo Circulante</span>
                <span className="font-semibold">{formatCurrency(totalPassivoCirculante)}</span>
              </div>
            </div>
          </div>

          {/* PASSIVO REALIZÁVEL LP */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">Passivo Realizável Longo Prazo</h3>

            <div className="space-y-2">
              <Label htmlFor="emprestimosFinanciamentosLP">Empréstimos/Financiamentos LP</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  id="emprestimosFinanciamentosLP"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.passivoRealizavelLP.emprestimosFinanciamentosLP}
                  onChange={(e) => handleChange("passivoRealizavelLP", "emprestimosFinanciamentosLP", e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* PATRIMÔNIO LÍQUIDO */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">Patrimônio Líquido</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="capitalSocial">Capital Social</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="capitalSocial"
                    type="number"
                    step="0.01"
                    value={formData.patrimonioLiquido.capitalSocial}
                    onChange={(e) => handleChange("patrimonioLiquido", "capitalSocial", e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lucrosAcumulados">Lucros Acumulados</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="lucrosAcumulados"
                    type="number"
                    step="0.01"
                    value={formData.patrimonioLiquido.lucrosAcumulados}
                    onChange={(e) => handleChange("patrimonioLiquido", "lucrosAcumulados", e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Resumo Final */}
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Ativo Total</span>
              <span className="font-medium">{formatCurrency(ativoTotal)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t pt-2">
              <span>Passivo Total</span>
              <span className={balanceado ? "text-green-600" : "text-destructive"}>
                {formatCurrency(passivoTotal)}
              </span>
            </div>
            {balanceado && (
              <div className="text-xs text-green-600 text-center pt-2">
                ✓ Balanço equilibrado
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isLoading || !balanceado} className="w-full">
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
