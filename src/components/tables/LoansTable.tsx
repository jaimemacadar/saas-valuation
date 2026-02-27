"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Loader2,
  Check,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  BalanceSheetCalculated,
  BalanceSheetProjectionInputs,
  IndicadoresCalculated,
} from "@/core/types";
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
  indicadoresData?: IndicadoresCalculated[];
}

type RowType =
  | "header"
  | "value"
  | "subtotal"
  | "total"
  | "premise"
  | "annotation";

interface AuxRow {
  key: string;
  label: string;
  type: RowType;
  values: Record<number, number | null>;
  tooltip?: string;
  premiseField?: keyof BalanceSheetProjectionInputs;
  groupKey?: string;
  premiseGroup?: string;
}

export function LoansTable({
  data,
  projectionInputs,
  modelId,
  onProjectionChange,
  indicadoresData,
}: LoansTableProps) {
  const [localProjections, setLocalProjections] = useState<
    BalanceSheetProjectionInputs[]
  >(projectionInputs || []);
  useEffect(() => {
    setLocalProjections(projectionInputs || []);
  }, [projectionInputs]);
  const [showAllPremises, setShowAllPremises] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showDecimals, setShowDecimals] = useState(false);

  const { isSaving, lastSavedAt, save } = useBPProjectionPersist({
    modelId: modelId || "",
  });

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
    (
      year: number,
      field: keyof BalanceSheetProjectionInputs,
      value: number,
    ) => {
      setLocalProjections((prev) => {
        const updated = prev.map((p) =>
          p.year === year ? { ...p, [field]: value } : p,
        );
        onProjectionChange?.(updated);
        if (modelId) save(updated);
        return updated;
      });
    },
    [modelId, save, onProjectionChange],
  );

  const handleCopyRight = useCallback(
    (field: keyof BalanceSheetProjectionInputs) => {
      setLocalProjections((prev) => {
        const year1 = prev.find((p) => p.year === 1);
        if (!year1) return prev;
        const val = year1[field] as number;
        const updated = prev.map((p) =>
          p.year > 1 ? { ...p, [field]: val } : p,
        );
        onProjectionChange?.(updated);
        if (modelId) save(updated);
        return updated;
      });
    },
    [modelId, save, onProjectionChange],
  );

  const handleApplyTrend = useCallback(
    (
      field: keyof BalanceSheetProjectionInputs,
      startVal: number,
      endVal: number,
    ) => {
      setLocalProjections((prev) => {
        const projected = prev
          .filter((p) => p.year > 0)
          .sort((a, b) => a.year - b.year);
        if (projected.length < 2) return prev;
        const n = projected.length;
        const updated = prev.map((p) => {
          if (p.year === 0) return p;
          const i = projected.findIndex((py) => py.year === p.year);
          return {
            ...p,
            [field]: startVal + (endVal - startVal) * (i / (n - 1)),
          };
        });
        onProjectionChange?.(updated);
        if (modelId) save(updated);
        return updated;
      });
    },
    [modelId, save, onProjectionChange],
  );

  const getRefKey = (field: string, year: number) => `${field}-${year}`;

  const premiseOrder: (keyof BalanceSheetProjectionInputs)[] = [
    "taxaNovosEmprestimosCP",
    "taxaNovosEmprestimosLP",
    "taxaJurosEmprestimo",
  ];

  const focusNext = (field: string, currentYear: number) => {
    const years = data
      .filter((d) => d.year > 0)
      .sort((a, b) => a.year - b.year);
    const idx = years.findIndex((y) => y.year === currentYear);
    if (idx < years.length - 1) {
      inputRefs.current.get(getRefKey(field, years[idx + 1].year))?.focus();
    }
  };

  const focusPrevious = (field: string, currentYear: number) => {
    const years = data
      .filter((d) => d.year > 0)
      .sort((a, b) => a.year - b.year);
    const idx = years.findIndex((y) => y.year === currentYear);
    if (idx > 0) {
      inputRefs.current.get(getRefKey(field, years[idx - 1].year))?.focus();
    }
  };

  const focusNextRow = (currentField: string, year: number) => {
    const idx = premiseOrder.indexOf(
      currentField as keyof BalanceSheetProjectionInputs,
    );
    if (idx >= 0 && idx < premiseOrder.length - 1) {
      inputRefs.current.get(getRefKey(premiseOrder[idx + 1], year))?.focus();
    }
  };

  const rows: AuxRow[] = useMemo(() => {
    const sortedYears = data.map((d) => d.year).sort((a, b) => a - b);
    const byYear = Object.fromEntries(data.map((d) => [d.year, d]));

    const getPremise = (
      field: keyof BalanceSheetProjectionInputs,
      year: number,
    ): number | null => {
      if (year === 0) return null;
      const p = localProjections.find((lp) => lp.year === year);
      return p ? (p[field] as number) : null;
    };

    return [
      // ── Bloco CP ──
      {
        key: "hdr-cp",
        label: "EMPRÉSTIMOS DE CURTO PRAZO",
        type: "header",
        values: {},
      },
      {
        key: "emp-cp-inicio",
        label: "(=) Empréstimos CP (início)",
        type: "value",
        values: Object.fromEntries(
          sortedYears.map((y, i) => {
            const prevY = i === 0 ? y : sortedYears[i - 1];
            return [
              y,
              byYear[prevY]?.passivoCirculante.emprestimosFinanciamentosCP ??
                null,
            ];
          }),
        ),
      },
      {
        key: "novos-cp",
        label: "(+) Novos Empréstimos CP",
        type: "value",
        groupKey: "cp",
        values: Object.fromEntries(
          sortedYears.map((y) => [
            y,
            y === 0
              ? null
              : (byYear[y]?.novosEmprestimosFinanciamentosCP ?? null),
          ]),
        ),
      },
      ...(hasPremises
        ? [
            {
              key: "taxaNovosEmprestimosCP",
              label: "↳ Taxa Novos Empréstimos CP (%)",
              type: "premise" as RowType,
              premiseGroup: "cp",
              premiseField:
                "taxaNovosEmprestimosCP" as keyof BalanceSheetProjectionInputs,
              values: Object.fromEntries(
                sortedYears.map((y) => [
                  y,
                  getPremise("taxaNovosEmprestimosCP", y),
                ]),
              ),
            },
          ]
        : []),
      {
        key: "desp-fin-cp",
        label: "(-) Despesas Financeiras CP",
        type: "value" as RowType,
        tooltip: "Empréstimos CP × Taxa de Juros",
        values: Object.fromEntries(
          sortedYears.map((y) => [
            y,
            y === 0 ? null : -(byYear[y]?.despesasFinanceirasCP ?? 0) || null,
          ]),
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
          ]),
        ),
      },

      // ── Bloco LP ──
      {
        key: "hdr-lp",
        label: "EMPRÉSTIMOS DE LONGO PRAZO",
        type: "header",
        values: {},
      },
      {
        key: "emp-lp-inicio",
        label: "(=) Empréstimos LP (início)",
        type: "value",
        values: Object.fromEntries(
          sortedYears.map((y, i) => {
            const prevY = i === 0 ? y : sortedYears[i - 1];
            return [
              y,
              byYear[prevY]?.passivoRealizavelLP.emprestimosFinanciamentosLP ??
                null,
            ];
          }),
        ),
      },
      {
        key: "novos-lp",
        label: "(+) Novos Empréstimos LP",
        type: "value",
        groupKey: "lp",
        values: Object.fromEntries(
          sortedYears.map((y) => [
            y,
            y === 0
              ? null
              : (byYear[y]?.novosEmprestimosFinanciamentosLP ?? null),
          ]),
        ),
      },
      ...(hasPremises
        ? [
            {
              key: "taxaNovosEmprestimosLP",
              label: "↳ Taxa Novos Empréstimos LP (%)",
              type: "premise" as RowType,
              premiseGroup: "lp",
              premiseField:
                "taxaNovosEmprestimosLP" as keyof BalanceSheetProjectionInputs,
              values: Object.fromEntries(
                sortedYears.map((y) => [
                  y,
                  getPremise("taxaNovosEmprestimosLP", y),
                ]),
              ),
            },
          ]
        : []),
      {
        key: "desp-fin-lp",
        label: "(-) Despesas Financeiras LP",
        type: "value" as RowType,
        tooltip: "Empréstimos LP × Taxa de Juros",
        values: Object.fromEntries(
          sortedYears.map((y) => [
            y,
            y === 0 ? null : -(byYear[y]?.despesasFinanceirasLP ?? 0) || null,
          ]),
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
          ]),
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
            const cp =
              byYear[y]?.passivoCirculante.emprestimosFinanciamentosCP ?? 0;
            const lp =
              byYear[y]?.passivoRealizavelLP.emprestimosFinanciamentosLP ?? 0;
            return [y, cp + lp];
          }),
        ),
      },
      {
        key: "desp-financeiras",
        label: "└─ Despesas Financeiras (Juros)",
        type: "annotation",
        tooltip: "Dívida Total × Taxa de Juros — alimenta a DRE",
        values: Object.fromEntries(
          sortedYears.map((y) => [
            y,
            y === 0 ? null : (byYear[y]?.despesasFinanceiras ?? null),
          ]),
        ),
      },

      // ── Indicadores ──
      {
        key: "emprestimos-ebitda",
        label: "Empréstimos / EBITDA (x)",
        type: "annotation",
        tooltip: "Dívida Total ÷ EBITDA — alavancagem da dívida",
        values: Object.fromEntries(
          sortedYears.map((y) => {
            const indicador = indicadoresData
              ?.find((ind) => ind.year === y)
              ?.indicadores.find((i) => i.id === "emprestimos-ebitda");
            return [y, indicador?.value ?? null];
          }),
        ),
      },
      ...(hasPremises
        ? [
            {
              key: "hdr-taxa-juros",
              label: "Taxa de Juros",
              type: "header" as RowType,
              groupKey: "taxa-juros",
              values: {},
            },
            {
              key: "taxaJurosEmprestimo",
              label: "↳ Taxa de Juros (% a.a.)",
              type: "premise" as RowType,
              premiseGroup: "taxa-juros",
              premiseField:
                "taxaJurosEmprestimo" as keyof BalanceSheetProjectionInputs,
              values: Object.fromEntries(
                sortedYears.map((y) => [
                  y,
                  getPremise("taxaJurosEmprestimo", y),
                ]),
              ),
              tooltip: "Base para Despesas Financeiras e Kd no WACC",
            },
          ]
        : []),
    ];
  }, [data, localProjections, hasPremises, indicadoresData]);

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
        <p className="text-xs text-muted-foreground italic pl-1 self-end">
          Valores em R$ (Reais)
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label
              htmlFor="decimals-toggle-loans"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              Decimais
            </Label>
            <Switch
              id="decimals-toggle-loans"
              checked={showDecimals}
              onCheckedChange={setShowDecimals}
            />
          </div>
          {hasPremises ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllPremises((prev) => !prev)}
              className="h-7 gap-1.5 text-xs"
            >
              {showAllPremises ? (
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
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[240px] min-w-[200px] font-semibold sticky left-0 z-10 bg-card" />
              {sortedYears.map((y) => (
                <TableHead
                  key={y}
                  className="w-[110px] min-w-[100px] text-right font-semibold"
                >
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
                  "group",
                  row.type === "header" && "bg-muted-alt border-t-1",
                  row.type === "total" && "bg-muted-alt",
                  row.type === "subtotal" && "bg-muted-alt",
                  row.type === "premise" && "bg-premise-bg",
                  row.type === "annotation" && "bg-annotation-bg",
                )}
              >
                {/* Coluna de label */}
                <TableCell
                  className={cn(
                    "sticky left-0 z-10 transition-colors",
                    row.type === "header" && "bg-muted-alt group-hover:bg-muted-alt",
                    row.type === "total" && "bg-muted-alt group-hover:bg-muted-alt",
                    row.type === "subtotal" && "bg-muted-alt group-hover:bg-muted-alt",
                    row.type === "premise" && "bg-premise-bg group-hover:bg-muted-alt",
                    row.type === "annotation" && "bg-annotation-bg group-hover:bg-muted-alt",
                    row.type === "value" && "bg-card group-hover:bg-muted-alt",
                  )}
                >
                  <div
                    className={cn(
                      "min-w-[200px] whitespace-nowrap flex items-center gap-1.5",
                      row.type === "header" && "font-bold text-sm",
                      row.type === "total" && "font-bold",
                      row.type === "subtotal" && "font-semibold",
                      row.type === "value" && "text-muted-foreground",
                      row.type === "premise" &&
                        "text-xs text-muted-foreground pl-4",
                      row.type === "annotation" &&
                        "text-xs text-muted-foreground pl-4 italic",
                      row.groupKey && hasPremises && "cursor-pointer",
                    )}
                    onClick={
                      row.groupKey && hasPremises
                        ? () => toggleGroup(row.groupKey!)
                        : undefined
                    }
                  >
                    {/* Botão de toggle por seção nos headers */}
                    {row.groupKey && hasPremises ? (
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
                          <div className="text-right text-xs text-muted-foreground">
                            —
                          </div>
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
                            onCopyRight={() =>
                              handleCopyRight(row.premiseField!)
                            }
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

                  if (row.type === "header") {
                    return <TableCell key={y} />;
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
                          row.type === "value" && "text-muted-foreground",
                          row.type === "annotation" &&
                            "text-xs text-muted-foreground italic",
                          value !== null && value < 0 && "text-red-600",
                        )}
                      >
                        {row.key === "emprestimos-ebitda" && value !== null
                          ? `${value.toFixed(2)}x`
                          : value !== null
                            ? formatCurrency(value, {
                                showSymbol: false,
                                minimumFractionDigits: showDecimals ? 2 : 0,
                                maximumFractionDigits: showDecimals ? 2 : 0,
                              })
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
