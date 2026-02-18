"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { saveBalanceSheetBase } from "@/lib/actions/models";
import { BalanceSheetBaseInputs } from "@/core/types";
import { formatCurrency, parseInputNumber } from "@/lib/utils/formatters";
import { FinancialInput } from "@/components/ui/financial-input";

interface BalanceSheetBaseFormProps {
  modelId: string;
  initialData?: BalanceSheetBaseInputs;
}

// Função helper para garantir estrutura completa de dados
const getInitialFormData = (data?: BalanceSheetBaseInputs): BalanceSheetBaseInputs => {
  const defaults: BalanceSheetBaseInputs = {
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
  };

  if (!data) return defaults;

  // Mesclar dados iniciais com valores padrão para garantir todas as propriedades
  return {
    ativoCirculante: {
      ...defaults.ativoCirculante,
      ...data.ativoCirculante,
    },
    ativoRealizavelLP: {
      ...defaults.ativoRealizavelLP,
      ...data.ativoRealizavelLP,
    },
    passivoCirculante: {
      ...defaults.passivoCirculante,
      ...data.passivoCirculante,
    },
    passivoRealizavelLP: {
      ...defaults.passivoRealizavelLP,
      ...data.passivoRealizavelLP,
    },
    patrimonioLiquido: {
      ...defaults.patrimonioLiquido,
      ...data.patrimonioLiquido,
    },
  };
};

export function BalanceSheetBaseForm({ modelId, initialData }: BalanceSheetBaseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<BalanceSheetBaseInputs>(() =>
    getInitialFormData(initialData)
  );

  const handleChange = (
    section: keyof BalanceSheetBaseInputs,
    field: string,
    value: string
  ) => {
    const numValue = parseInputNumber(value);
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
    <form onSubmit={handleSubmit} className="max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Balanço Patrimonial</CardTitle>
          <CardDescription>
            Insira os valores do balanço patrimonial do ano base (último ano fiscal encerrado)
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

          {!balanceado ? (
            <div className="rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-600">
              ⚠️ Ativo Total e Passivo Total não estão balanceados
            </div>
          ) : null}

          {/* Layout de duas colunas: Ativo | Passivo + PL */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* COLUNA ESQUERDA - ATIVO */}
            <div className="flex flex-col space-y-6">
              {/* ATIVO CIRCULANTE */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold border-b pb-2">Ativo Circulante</h3>

                <div className="space-y-3">
                  <FinancialInput
                    id="caixaEquivalentes"
                    label="Caixa e Equivalentes"
                    value={formData.ativoCirculante.caixaEquivalentes}
                    onChange={(value) => handleChange("ativoCirculante", "caixaEquivalentes", value)}
                    disabled={isLoading}
                  />

                  <FinancialInput
                    id="aplicacoesFinanceiras"
                    label="Aplicações Financeiras"
                    value={formData.ativoCirculante.aplicacoesFinanceiras}
                    onChange={(value) => handleChange("ativoCirculante", "aplicacoesFinanceiras", value)}
                    disabled={isLoading}
                  />

                  <FinancialInput
                    id="contasReceber"
                    label="Contas a Receber"
                    value={formData.ativoCirculante.contasReceber}
                    onChange={(value) => handleChange("ativoCirculante", "contasReceber", value)}
                    disabled={isLoading}
                  />

                  <FinancialInput
                    id="estoques"
                    label="Estoques"
                    value={formData.ativoCirculante.estoques}
                    onChange={(value) => handleChange("ativoCirculante", "estoques", value)}
                    disabled={isLoading}
                  />
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

                <div className="space-y-3">
                  <FinancialInput
                    id="ativoImobilizadoBruto"
                    label="Ativo Imobilizado Bruto"
                    value={formData.ativoRealizavelLP.ativoImobilizadoBruto}
                    onChange={(value) => handleChange("ativoRealizavelLP", "ativoImobilizadoBruto", value)}
                    disabled={isLoading}
                  />

                  <FinancialInput
                    id="depreciacaoAcumulada"
                    label="(-) Depreciação Acumulada"
                    value={formData.ativoRealizavelLP.depreciacaoAcumulada}
                    onChange={(value) => handleChange("ativoRealizavelLP", "depreciacaoAcumulada", value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="rounded-lg bg-muted p-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Total Ativo Realizável LP</span>
                    <span className="font-semibold">{formatCurrency(totalAtivoRealizavelLP)}</span>
                  </div>
                </div>
              </div>

              {/* Total do Ativo */}
              <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-3 mt-auto">
                <div className="flex justify-between text-sm font-semibold">
                  <span>ATIVO TOTAL</span>
                  <span>{formatCurrency(ativoTotal)}</span>
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA - PASSIVO + PL */}
            <div className="flex flex-col space-y-6">
              {/* PASSIVO CIRCULANTE */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold border-b pb-2">Passivo Circulante</h3>

                <div className="space-y-3">
                  <FinancialInput
                    id="fornecedores"
                    label="Fornecedores"
                    value={formData.passivoCirculante.fornecedores}
                    onChange={(value) => handleChange("passivoCirculante", "fornecedores", value)}
                    disabled={isLoading}
                  />

                  <FinancialInput
                    id="emprestimosFinanciamentosCP"
                    label="Empréstimos/Financ. CP"
                    value={formData.passivoCirculante.emprestimosFinanciamentosCP}
                    onChange={(value) => handleChange("passivoCirculante", "emprestimosFinanciamentosCP", value)}
                    disabled={isLoading}
                  />
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

                <div className="space-y-3">
                  <FinancialInput
                    id="emprestimosFinanciamentosLP"
                    label="Empréstimos/Financ. LP"
                    value={formData.passivoRealizavelLP.emprestimosFinanciamentosLP}
                    onChange={(value) => handleChange("passivoRealizavelLP", "emprestimosFinanciamentosLP", value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="rounded-lg bg-muted p-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Total Passivo Realizável LP</span>
                    <span className="font-semibold">{formatCurrency(totalPassivoRealizavelLP)}</span>
                  </div>
                </div>
              </div>

              {/* PATRIMÔNIO LÍQUIDO */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold border-b pb-2">Patrimônio Líquido</h3>

                <div className="space-y-3">
                  <FinancialInput
                    id="capitalSocial"
                    label="Capital Social"
                    value={formData.patrimonioLiquido.capitalSocial}
                    onChange={(value) => handleChange("patrimonioLiquido", "capitalSocial", value)}
                    disabled={isLoading}
                  />

                  <FinancialInput
                    id="lucrosAcumulados"
                    label="Lucros Acumulados"
                    value={formData.patrimonioLiquido.lucrosAcumulados}
                    onChange={(value) => handleChange("patrimonioLiquido", "lucrosAcumulados", value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="rounded-lg bg-muted p-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Total Patrimônio Líquido</span>
                    <span className="font-semibold">{formatCurrency(totalPatrimonioLiquido)}</span>
                  </div>
                </div>
              </div>

              {/* Total do Passivo */}
              <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-3 mt-auto">
                <div className="flex justify-between text-sm font-semibold">
                  <span>PASSIVO TOTAL</span>
                  <span className={balanceado ? "text-green-600" : "text-destructive"}>
                    {formatCurrency(passivoTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status do Balanceamento */}
          {balanceado ? (
            <div className="rounded-lg border-2 border-green-500/20 bg-green-500/5 p-3 text-center">
              <div className="text-sm text-green-600 font-medium">
                ✓ Balanço Patrimonial Equilibrado
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Ativo Total = Passivo Total: {formatCurrency(ativoTotal)}
              </div>
            </div>
          ) : null}
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
