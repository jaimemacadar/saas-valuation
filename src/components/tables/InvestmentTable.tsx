"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Loader2, Check, Eye, EyeOff, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BalanceSheetCalculated, BalanceSheetProjectionInputs } from "@/core/types";
import { formatCurrency } from "@/lib/utils/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PremiseInput } from "./PremiseInput";
import { useBPProjectionPersist } from "@/hooks/useBPProjectionPersist";

interface InvestmentTableProps {
  data: BalanceSheetCalculated[];
  projectionInputs?: BalanceSheetProjectionInputs[];
  modelId?: string;
  onProjectionChange?: (data: BalanceSheetProjectionInputs[]) => void;
}

type RowType = "header" | "value" | "subtotal" | "total" | "premise" | "annotation";

interface AuxRow {
  key: string;
  label: string;
  type: RowType;
  /** year → valor monetário (null = exibir "—") */
  values: Record<number, number | null>;
  tooltip?: string;
  hasChildPremise?: boolean;
  premiseField?: keyof BalanceSheetProjectionInputs;
  /** Multiplicador para converter valor armazenado em valor de exibição (padrão: 1) */
  premiseScale?: number;
  /** Unidade exibida após o input (padrão: "%") */
  premiseUnit?: string;
  parentKey?: string;
}

export function InvestmentTable({
  data,
  projectionInputs,
  modelId,
  onProjectionChange,
}: InvestmentTableProps) {
  const [localProjections, setLocalProjections] = useState<BalanceSheetProjectionInputs[]>(
    projectionInputs || []
  );
  const [showPremises, setShowPremises] = useState(false);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());

  const { isSaving, lastSavedAt, save } = useBPProjectionPersist({
    modelId: modelId || "",
  });

  const hasPremises = !!(projectionInputs && projectionInputs.length > 0);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const toggleAccount = useCallback((key: string) => {
    setExpandedAccounts((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handlePremiseChange = useCallback(
    (year: number, field: keyof BalanceSheetProjectionInputs, displayValue: number, scale = 1) => {
      const storageValue = displayValue / scale;
      setLocalProjections((prev) => {
        const updated = prev.map((p) =>
          p.year === year ? { ...p, [field]: storageValue } : p
        );
        onProjectionChange?.(updated);
        if (modelId) save(updated);
        return updated;
      });
    },
    [modelId, save, onProjectionChange]
  );

  const handleCopyRight = useCallback(
    (field: keyof BalanceSheetProjectionInputs, scale = 1) => {
      setLocalProjections((prev) => {
        const year1 = prev.find((p) => p.year === 1);
        if (!year1) return prev;
        const year1StorageValue = year1[field] as number;
        const updated = prev.map((p) =>
          p.year > 1 ? { ...p, [field]: year1StorageValue } : p
        );
        onProjectionChange?.(updated);
        if (modelId) save(updated);
        return updated;
      });
    },
    [modelId, save, onProjectionChange]
  );

  const handleApplyTrend = useCallback(
    (
      field: keyof BalanceSheetProjectionInputs,
      startDisplayVal: number,
      endDisplayVal: number,
      scale = 1
    ) => {
      setLocalProjections((prev) => {
        const projected = prev.filter((p) => p.year > 0).sort((a, b) => a.year - b.year);
        if (projected.length < 2) return prev;
        const n = projected.length;
        const updated = prev.map((p) => {
          if (p.year === 0) return p;
          const i = projected.findIndex((py) => py.year === p.year);
          const interpolatedDisplay =
            startDisplayVal + (endDisplayVal - startDisplayVal) * (i / (n - 1));
          return { ...p, [field]: interpolatedDisplay / scale };
        });
        onProjectionChange?.(updated);
        if (modelId) save(updated);
        return updated;
      });
    },
    [modelId, save, onProjectionChange]
  );

  const getRefKey = (field: string, year: number) => `${field}-${year}`;

  const focusNext = (field: string, currentYear: number) => {
    const years = data.filter((d) => d.year > 0).sort((a, b) => a.year - b.year);
    const idx = years.findIndex((y) => y.year === currentYear);
    if (idx < years.length - 1) {
      inputRefs.current.get(getRefKey(field, years[idx + 1].year))?.focus();
    }
  };

  const focusPrevious = (field: string, currentYear: number) => {
    const years = data.filter((d) => d.year > 0).sort((a, b) => a.year - b.year);
    const idx = years.findIndex((y) => y.year === currentYear);
    if (idx > 0) {
      inputRefs.current.get(getRefKey(field, years[idx - 1].year))?.focus();
    }
  };

  const premiseOrder: (keyof BalanceSheetProjectionInputs)[] = [
    "indiceImobilizadoVendas",
    "taxaDepreciacao",
  ];

  const focusNextRow = (currentField: string, year: number) => {
    const idx = premiseOrder.indexOf(currentField as keyof BalanceSheetProjectionInputs);
    if (idx < premiseOrder.length - 1) {
      inputRefs.current.get(getRefKey(premiseOrder[idx + 1], year))?.focus();
    }
  };

  const rows: AuxRow[] = useMemo(() => {
    const sortedYears = data.map((d) => d.year).sort((a, b) => a - b);
    const byYear = Object.fromEntries(data.map((d) => [d.year, d]));

    const getPremiseDisplay = (
      field: keyof BalanceSheetProjectionInputs,
      year: number,
      scale = 1
    ): number | null => {
      if (year === 0) return null;
      const p = localProjections.find((lp) => lp.year === year);
      if (!p) return null;
      return (p[field] as number) * scale;
    };

    return [
      // ── Bloco 1: Saldo Inicial ──
      {
        key: "imob-bruto-inicio",
        label: "Imobilizado Bruto (início)",
        type: "header",
        values: Object.fromEntries(
          sortedYears.map((y, i) => {
            const prevY = i === 0 ? y : sortedYears[i - 1];
            return [y, byYear[prevY]?.ativoRealizavelLP.imobilizadoBruto ?? null];
          })
        ),
      },
      {
        key: "depr-acum-inicio",
        label: "(-) Depr. Acumulada (início)",
        type: "value",
        values: Object.fromEntries(
          sortedYears.map((y, i) => {
            const prevY = i === 0 ? y : sortedYears[i - 1];
            const val = byYear[prevY]?.ativoRealizavelLP.depreciacaoAcumulada;
            return [y, val != null ? -val : null];
          })
        ),
      },
      {
        key: "imob-liq-inicio",
        label: "(=) Imobilizado Líquido Inicial",
        type: "subtotal",
        values: Object.fromEntries(
          sortedYears.map((y, i) => {
            const prevY = i === 0 ? y : sortedYears[i - 1];
            const prev = byYear[prevY];
            if (!prev) return [y, null];
            return [
              y,
              prev.ativoRealizavelLP.imobilizadoBruto -
                prev.ativoRealizavelLP.depreciacaoAcumulada,
            ];
          })
        ),
      },

      {
        key: "capex",
        label: "(+) CAPEX",
        type: "value",
        hasChildPremise: hasPremises,
        values: Object.fromEntries(
          sortedYears.map((y) => [y, y === 0 ? null : byYear[y]?.capex ?? null])
        ),
      },
      ...(hasPremises
        ? [
            {
              key: "indiceImobilizadoVendas",
              label: "↳ CAPEX s/ vendas (%)",
              type: "premise" as RowType,
              parentKey: "capex",
              premiseField: "indiceImobilizadoVendas" as keyof BalanceSheetProjectionInputs,
              premiseScale: 100,
              values: Object.fromEntries(
                sortedYears.map((y) => [y, getPremiseDisplay("indiceImobilizadoVendas", y, 100)])
              ),
            },
          ]
        : []),
      // ── Bloco 3: Saldos Finais ──
      {
        key: "depreciacao-periodo",
        label: "(-) Depreciação do Período",
        type: "value",
        hasChildPremise: hasPremises,
        values: Object.fromEntries(
          sortedYears.map((y) => {
            const val = byYear[y]?.depreciacaoAnual;
            return [y, y === 0 ? null : val != null ? -val : null];
          })
        ),
      },
      ...(hasPremises
        ? [
            {
              key: "taxaDepreciacao",
              label: "↳ Taxa de Depreciação (%)",
              type: "premise" as RowType,
              parentKey: "depreciacao-periodo",
              premiseField: "taxaDepreciacao" as keyof BalanceSheetProjectionInputs,
              premiseScale: 1,
              values: Object.fromEntries(
                sortedYears.map((y) => [y, getPremiseDisplay("taxaDepreciacao", y, 1)])
              ),
            },
          ]
        : []),
      {
        key: "imob-liq-final",
        label: "(=) Imobilizado Líquido Final",
        type: "total",
        tooltip: "Imob. Líquido Inicial + CAPEX − Depreciação do Período",
        values: Object.fromEntries(
          sortedYears.map((y) => [y, byYear[y]?.ativoRealizavelLP.imobilizado ?? null])
        ),
      },
    ];
  }, [data, localProjections, hasPremises]);

  const visibleRows = useMemo(() => {
    return rows.filter((row) => {
      if (row.type !== "premise") return true;
      if (!row.parentKey) return true;
      if (showPremises) return true;
      return expandedAccounts.has(row.parentKey);
    });
  }, [rows, showPremises, expandedAccounts]);

  const sortedYears = data.map((d) => d.year).sort((a, b) => a - b);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado de Investimento disponível
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Indicador de salvamento */}
      {modelId && hasPremises ? (
        <div className="flex items-center justify-end text-sm text-muted-foreground">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : lastSavedAt ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span>
                Salvo às{" "}
                {lastSavedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground italic pl-1 self-end">Valores em R$ (Reais)</p>
        {hasPremises ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPremises((prev) => !prev)}
            className="h-7 gap-1.5 text-xs"
          >
            {showPremises ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                Ocultar premissas
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                Exibir premissas
              </>
            )}
          </Button>
        ) : null}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px] min-w-[200px] font-semibold" />
              {sortedYears.map((y) => (
                <TableHead key={y} className="w-[110px] min-w-[100px] text-right font-semibold">
                  {y === 0 ? "Ano Base" : `Ano ${y}`}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map((row) => (
              <TableRow
                key={row.key}
                className={cn(
                  row.type === "header" && "bg-muted/60 border-t-2",
                  row.type === "total" && "bg-muted/50",
                  row.type === "subtotal" && "bg-muted/30",
                  row.type === "premise" && "bg-blue-50/50 dark:bg-blue-950/20",
                  row.type === "annotation" && "bg-amber-50/30 dark:bg-amber-950/20"
                )}
              >
                {/* Coluna de label */}
                <TableCell>
                  <div
                    className={cn(
                      "min-w-[240px] whitespace-nowrap flex items-center gap-1.5",
                      row.type === "header" && "font-bold text-sm",
                      row.type === "total" && "font-bold",
                      row.type === "subtotal" && "font-semibold",
                      row.type === "premise" && "text-xs text-muted-foreground pl-4",
                      row.type === "annotation" && "text-xs text-muted-foreground pl-4 italic",
                      row.hasChildPremise &&
                        "cursor-pointer select-none hover:text-foreground/80 transition-colors"
                    )}
                    onClick={
                      row.hasChildPremise ? () => toggleAccount(row.key) : undefined
                    }
                  >
                    {row.hasChildPremise ? (
                      <span className="text-muted-foreground/60 flex-shrink-0">
                        {showPremises || expandedAccounts.has(row.key) ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </span>
                    ) : null}
                    <span>{row.label}</span>
                  </div>
                </TableCell>

                {/* Colunas de anos */}
                {sortedYears.map((y) => {
                  const value = row.values[y];

                  if (row.type === "premise" && row.premiseField) {
                    if (y === 0) {
                      return (
                        <TableCell key={y}>
                          <div className="text-right text-xs text-muted-foreground">—</div>
                        </TableCell>
                      );
                    }
                    const scale = row.premiseScale ?? 1;
                    return (
                      <TableCell key={y}>
                        <div className="flex justify-end">
                          <PremiseInput
                            value={value}
                            onChange={(newVal) =>
                              handlePremiseChange(y, row.premiseField!, newVal, scale)
                            }
                            disabled={!modelId}
                            showCopyRight={y === 1}
                            onCopyRight={() => handleCopyRight(row.premiseField!, scale)}
                            showTrend={y === 1}
                            onApplyTrend={(start, end) =>
                              handleApplyTrend(row.premiseField!, start, end, scale)
                            }
                            ref={(el) => {
                              const k = getRefKey(row.key, y);
                              if (el) inputRefs.current.set(k, el);
                              else inputRefs.current.delete(k);
                            }}
                            onNavigateNext={() => focusNext(row.key, y)}
                            onNavigatePrevious={() => focusPrevious(row.key, y)}
                            onNavigateDown={() => focusNextRow(row.key, y)}
                            {...(row.premiseUnit !== undefined && { unit: row.premiseUnit })}
                          />
                        </div>
                      </TableCell>
                    );
                  }

                  return (
                    <TableCell key={y}>
                      <div
                        className={cn(
                          "text-right tabular-nums",
                          row.type === "header" && "font-bold text-sm",
                          row.type === "total" && "font-bold",
                          row.type === "subtotal" && "font-semibold",
                          row.type === "annotation" && "text-xs text-muted-foreground italic",
                          value !== null && value < 0 && "text-red-600"
                        )}
                      >
                        {value !== null
                          ? formatCurrency(value, { showSymbol: false })
                          : "—"}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
