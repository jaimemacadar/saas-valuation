"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Loader2, Check, ChevronRight, ChevronDown } from "lucide-react";
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

interface LoansTableProps {
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
  values: Record<number, number | null>;
  tooltip?: string;
  premiseField?: keyof BalanceSheetProjectionInputs;
  /** Chave do grupo que este header de seção controla */
  groupKey?: string;
  /** Grupo ao qual a premissa pertence (para toggle por seção) */
  premiseGroup?: string;
}

export function LoansTable({
  data,
  projectionInputs,
  modelId,
  onProjectionChange,
}: LoansTableProps) {
  const [localProjections, setLocalProjections] = useState<BalanceSheetProjectionInputs[]>(
    projectionInputs || []
  );
  const [showAllPremises, setShowAllPremises] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const { isSaving, lastSavedAt, save } = useBPProjectionPersist({ modelId: modelId || "" });

  const hasPremises = !!(projectionInputs && projectionInputs.length > 0);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const toggleGroup = useCallback((groupKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  }, []);

  const handlePremiseChange = useCallback(
    (year: number, field: keyof BalanceSheetProjectionInputs, value: number) => {
      setLocalProjections((prev) => {
        const updated = prev.map((p) =>
          p.year === year ? { ...p, [field]: value } : p
        );
        onProjectionChange?.(updated);
        if (modelId) save(updated);
        return updated;
      });
    },
    [modelId, save, onProjectionChange]
  );

  const handleCopyRight = useCallback(
    (field: keyof BalanceSheetProjectionInputs) => {
      setLocalProjections((prev) => {
        const year1 = prev.find((p) => p.year === 1);
        if (!year1) return prev;
        const val = year1[field] as number;
        const updated = prev.map((p) => (p.year > 1 ? { ...p, [field]: val } : p));
        onProjectionChange?.(updated);
        if (modelId) save(updated);
        return updated;
      });
    },
    [modelId, save, onProjectionChange]
  );

  const handleApplyTrend = useCallback(
    (field: keyof BalanceSheetProjectionInputs, startVal: number, endVal: number) => {
      setLocalProjections((prev) => {
        const projected = prev.filter((p) => p.year > 0).sort((a, b) => a.year - b.year);
        if (projected.length < 2) return prev;
        const n = projected.length;
        const updated = prev.map((p) => {
          if (p.year === 0) return p;
          const i = projected.findIndex((py) => py.year === p.year);
          return { ...p, [field]: startVal + (endVal - startVal) * (i / (n - 1)) };
        });
        onProjectionChange?.(updated);
        if (modelId) save(updated);
        return updated;
      });
    },
    [modelId, save, onProjectionChange]
  );

  const getRefKey = (field: string, year: number) => `${field}-${year}`;

  const premiseOrder: (keyof BalanceSheetProjectionInputs)[] = [
    "taxaJurosEmprestimo",
    "taxaNovosEmprestimosCP",
    "taxaNovosEmprestimosLP",
  ];

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

  const focusNextRow = (currentField: string, year: number) => {
    const idx = premiseOrder.indexOf(currentField as keyof BalanceSheetProjectionInputs);
    if (idx >= 0 && idx < premiseOrder.length - 1) {
      inputRefs.current.get(getRefKey(premiseOrder[idx + 1], year))?.focus();
    }
  };

  const rows: AuxRow[] = useMemo(() => {
    const sortedYears = data.map((d) => d.year).sort((a, b) => a - b);
    const byYear = Object.fromEntries(data.map((d) => [d.year, d]));

    const getPremise = (
      field: keyof BalanceSheetProjectionInputs,
      year: number
    ): number | null => {
      if (year === 0) return null;
      const p = localProjections.find((lp) => lp.year === year);
      return p ? (p[field] as number) : null;
    };

    return [
      // ── Premissas Globais ──
      {
        key: "hdr-emprestimos",
        label: "EMPRÉSTIMOS E FINANCIAMENTOS",
        type: "header",
        groupKey: "emprestimos",
        values: {},
      },
      ...(hasPremises
        ? [
            {
              key: "taxaJurosEmprestimo",
              label: "↳ Taxa de Juros (% a.a.)",
              type: "premise" as RowType,
              premiseGroup: "emprestimos",
              premiseField: "taxaJurosEmprestimo" as keyof BalanceSheetProjectionInputs,
              values: Object.fromEntries(
                sortedYears.map((y) => [y, getPremise("taxaJurosEmprestimo", y)])
              ),
              tooltip: "Base para Despesas Financeiras e Kd no WACC",
            },
          ]
        : []),

      // ── Bloco CP ──
      {
        key: "hdr-cp",
        label: "Curto Prazo (CP)",
        type: "header",
        groupKey: "cp",
        values: {},
      },
      ...(hasPremises
        ? [
            {
              key: "taxaNovosEmprestimosCP",
              label: "↳ Taxa Novos Empréstimos CP (%)",
              type: "premise" as RowType,
              premiseGroup: "cp",
              premiseField: "taxaNovosEmprestimosCP" as keyof BalanceSheetProjectionInputs,
              values: Object.fromEntries(
                sortedYears.map((y) => [y, getPremise("taxaNovosEmprestimosCP", y)])
              ),
            },
          ]
        : []),
      {
        key: "emp-cp-inicio",
        label: "Empréstimos CP (início)",
        type: "value",
        values: Object.fromEntries(
          sortedYears.map((y, i) => {
            const prevY = i === 0 ? y : sortedYears[i - 1];
            return [y, byYear[prevY]?.passivoCirculante.emprestimosFinanciamentosCP ?? null];
          })
        ),
      },
      {
        key: "novos-cp",
        label: "(+) Novos Empréstimos CP",
        type: "value",
        values: Object.fromEntries(
          sortedYears.map((y) => [
            y,
            y === 0 ? null : byYear[y]?.novosEmprestimosFinanciamentosCP ?? null,
          ])
        ),
      },
      {
        key: "emp-cp-final",
        label: "(=) Empréstimos CP (final)",
        type: "subtotal",
        values: Object.fromEntries(
          sortedYears.map((y) => [
            y,
            byYear[y]?.passivoCirculante.emprestimosFinanciamentosCP ?? null,
          ])
        ),
      },

      // ── Bloco LP ──
      {
        key: "hdr-lp",
        label: "Longo Prazo (LP)",
        type: "header",
        groupKey: "lp",
        values: {},
      },
      ...(hasPremises
        ? [
            {
              key: "taxaNovosEmprestimosLP",
              label: "↳ Taxa Novos Empréstimos LP (%)",
              type: "premise" as RowType,
              premiseGroup: "lp",
              premiseField: "taxaNovosEmprestimosLP" as keyof BalanceSheetProjectionInputs,
              values: Object.fromEntries(
                sortedYears.map((y) => [y, getPremise("taxaNovosEmprestimosLP", y)])
              ),
            },
          ]
        : []),
      {
        key: "emp-lp-inicio",
        label: "Empréstimos LP (início)",
        type: "value",
        values: Object.fromEntries(
          sortedYears.map((y, i) => {
            const prevY = i === 0 ? y : sortedYears[i - 1];
            return [y, byYear[prevY]?.passivoRealizavelLP.emprestimosFinanciamentosLP ?? null];
          })
        ),
      },
      {
        key: "novos-lp",
        label: "(+) Novos Empréstimos LP",
        type: "value",
        values: Object.fromEntries(
          sortedYears.map((y) => [
            y,
            y === 0 ? null : byYear[y]?.novosEmprestimosFinanciamentosLP ?? null,
          ])
        ),
      },
      {
        key: "emp-lp-final",
        label: "(=) Empréstimos LP (final)",
        type: "subtotal",
        values: Object.fromEntries(
          sortedYears.map((y) => [
            y,
            byYear[y]?.passivoRealizavelLP.emprestimosFinanciamentosLP ?? null,
          ])
        ),
      },

      // ── Totais e Juros ──
      {
        key: "divida-total",
        label: "(=) Dívida Total",
        type: "total",
        tooltip: "CP (final) + LP (final)",
        values: Object.fromEntries(
          sortedYears.map((y) => {
            const cp = byYear[y]?.passivoCirculante.emprestimosFinanciamentosCP ?? 0;
            const lp = byYear[y]?.passivoRealizavelLP.emprestimosFinanciamentosLP ?? 0;
            return [y, cp + lp];
          })
        ),
      },
      {
        key: "desp-financeiras",
        label: "└─ Despesas Financeiras (Juros)",
        type: "annotation",
        tooltip: "Dívida Total × Taxa de Juros — alimenta a DRE",
        values: Object.fromEntries(
          sortedYears.map((y) => [y, y === 0 ? null : byYear[y]?.despesasFinanceiras ?? null])
        ),
      },
    ];
  }, [data, localProjections, hasPremises]);

  const visibleRows = useMemo(() => {
    return rows.filter((row) => {
      if (row.type !== "premise") return true;
      if (showAllPremises) return true;
      if (row.premiseGroup && expandedGroups.has(row.premiseGroup)) return true;
      return false;
    });
  }, [rows, showAllPremises, expandedGroups]);

  const sortedYears = data.map((d) => d.year).sort((a, b) => a - b);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado de Empréstimos disponível
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
                {lastSavedAt.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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
            onClick={() => setShowAllPremises((prev) => !prev)}
            className="h-7 gap-1.5 text-xs"
          >
            {showAllPremises ? (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Ocultar premissas
              </>
            ) : (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
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
              <TableHead className="w-[240px] min-w-[200px] font-semibold" />
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
                      "min-w-[200px] whitespace-nowrap flex items-center gap-1.5",
                      row.type === "header" && "font-bold text-sm",
                      row.type === "total" && "font-bold",
                      row.type === "subtotal" && "font-semibold",
                      row.type === "premise" && "text-xs text-muted-foreground pl-4",
                      row.type === "annotation" && "text-xs text-muted-foreground pl-4 italic"
                    )}
                  >
                    {/* Botão de toggle por seção nos headers */}
                    {row.type === "header" && row.groupKey && hasPremises ? (
                      <button
                        className="cursor-pointer flex-shrink-0 text-muted-foreground"
                        onClick={() => toggleGroup(row.groupKey!)}
                        title={
                          showAllPremises || expandedGroups.has(row.groupKey)
                            ? "Ocultar premissas desta seção"
                            : "Exibir premissas desta seção"
                        }
                      >
                        {showAllPremises || expandedGroups.has(row.groupKey) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
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
                    return (
                      <TableCell key={y}>
                        <div className="flex justify-end">
                          <PremiseInput
                            value={value}
                            onChange={(newVal) =>
                              handlePremiseChange(y, row.premiseField!, newVal)
                            }
                            disabled={!modelId}
                            showCopyRight={y === 1}
                            onCopyRight={() => handleCopyRight(row.premiseField!)}
                            showTrend={y === 1}
                            onApplyTrend={(start, end) =>
                              handleApplyTrend(row.premiseField!, start, end)
                            }
                            ref={(el) => {
                              const k = getRefKey(row.key, y);
                              if (el) inputRefs.current.set(k, el);
                              else inputRefs.current.delete(k);
                            }}
                            onNavigateNext={() => focusNext(row.key, y)}
                            onNavigatePrevious={() => focusPrevious(row.key, y)}
                            onNavigateDown={() => focusNextRow(row.key, y)}
                          />
                        </div>
                      </TableCell>
                    );
                  }

                  if (row.type === "annotation" && value === null) {
                    return <TableCell key={y} />;
                  }

                  return (
                    <TableCell key={y}>
                      <div
                        className={cn(
                          "text-right tabular-nums",
                          row.type === "total" && "font-bold",
                          row.type === "subtotal" && "font-semibold",
                          row.type === "annotation" && "text-xs text-muted-foreground italic",
                          value !== null && value < 0 && "text-red-600"
                        )}
                      >
                        {value !== null ? formatCurrency(value, { showSymbol: false }) : "—"}
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
