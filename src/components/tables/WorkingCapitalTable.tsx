"use client";

import { useState, useMemo, useCallback, useRef } from "react";
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

interface WorkingCapitalTableProps {
  data: BalanceSheetCalculated[];
  projectionInputs?: BalanceSheetProjectionInputs[];
  modelId?: string;
  onProjectionChange?: (data: BalanceSheetProjectionInputs[]) => void;
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
  hasChildPremise?: boolean;
  premiseField?: keyof BalanceSheetProjectionInputs;
  parentKey?: string;
  /** Grupo ao qual a premissa pertence (para toggle por bloco) */
  premiseGroup?: "ativoCirculante" | "passivoCirculante";
  /** Chave do grupo que este header controla */
  groupKey?: "ativoCirculante" | "passivoCirculante";
}

export function WorkingCapitalTable({
  data,
  projectionInputs,
  modelId,
  onProjectionChange,
}: WorkingCapitalTableProps) {
  const [localProjections, setLocalProjections] = useState<
    BalanceSheetProjectionInputs[]
  >(projectionInputs || []);
  const [showAllPremises, setShowAllPremises] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(
    new Set(),
  );
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

  const toggleAccount = useCallback((key: string) => {
    setExpandedAccounts((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
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
    "prazoCaixaEquivalentes",
    "prazoContasReceber",
    "prazoEstoques",
    "prazoOutrosCreditos",
    "prazoFornecedores",
    "prazoImpostosAPagar",
    "prazoObrigacoesSociais",
    "prazoOutrasObrigacoes",
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
      // ── ATIVO CIRCULANTE ──
      {
        key: "hdr-ac",
        label: "ATIVO CIRCULANTE",
        type: "header",
        groupKey: "ativoCirculante",
        values: Object.fromEntries(
          sortedYears.map((y) => [y, byYear[y]?.ativoCirculante.total ?? null]),
        ),
      },
      {
        key: "caixa",
        label: "Caixa e Equivalentes",
        type: "value",
        hasChildPremise: hasPremises,
        values: Object.fromEntries(
          sortedYears.map((y) => [
            y,
            byYear[y]?.ativoCirculante.caixaEquivalentes ?? null,
          ]),
        ),
      },
      ...(hasPremises
        ? [
            {
              key: "prazoCaixaEquivalentes",
              label: "↳ Prazo Médio (dias) — Rec. Bruta",
              type: "premise" as RowType,
              parentKey: "caixa",
              premiseGroup: "ativoCirculante" as const,
              premiseField:
                "prazoCaixaEquivalentes" as keyof BalanceSheetProjectionInputs,
              values: Object.fromEntries(
                sortedYears.map((y) => [
                  y,
                  getPremise("prazoCaixaEquivalentes", y),
                ]),
              ),
            },
          ]
        : []),
      {
        key: "contasReceber",
        label: "Contas a Receber",
        type: "value",
        hasChildPremise: hasPremises,
        values: Object.fromEntries(
          sortedYears.map((y) => [
            y,
            byYear[y]?.ativoCirculante.contasReceber ?? null,
          ]),
        ),
      },
      ...(hasPremises
        ? [
            {
              key: "prazoContasReceber",
              label: "↳ Prazo Médio (dias) — Rec. Bruta",
              type: "premise" as RowType,
              parentKey: "contasReceber",
              premiseGroup: "ativoCirculante" as const,
              premiseField:
                "prazoContasReceber" as keyof BalanceSheetProjectionInputs,
              values: Object.fromEntries(
                sortedYears.map((y) => [
                  y,
                  getPremise("prazoContasReceber", y),
                ]),
              ),
            },
          ]
        : []),
      {
        key: "estoques",
        label: "Estoques",
        type: "value",
        hasChildPremise: hasPremises,
        values: Object.fromEntries(
          sortedYears.map((y) => [
            y,
            byYear[y]?.ativoCirculante.estoques ?? null,
          ]),
        ),
      },
      ...(hasPremises
        ? [
            {
              key: "prazoEstoques",
              label: "↳ Prazo Médio (dias) — CMV",
              type: "premise" as RowType,
              parentKey: "estoques",
              premiseGroup: "ativoCirculante" as const,
              premiseField:
                "prazoEstoques" as keyof BalanceSheetProjectionInputs,
              values: Object.fromEntries(
                sortedYears.map((y) => [y, getPremise("prazoEstoques", y)]),
              ),
            },
          ]
        : []),
      {
        key: "outrosCreditos",
        label: "Outros Créditos",
        type: "value",
        hasChildPremise: hasPremises,
        values: Object.fromEntries(
          sortedYears.map((y) => [
            y,
            byYear[y]?.ativoCirculante.outrosCreditos ?? null,
          ]),
        ),
      },
      ...(hasPremises
        ? [
            {
              key: "prazoOutrosCreditos",
              label: "↳ Prazo Médio (dias) — Rec. Bruta",
              type: "premise" as RowType,
              parentKey: "outrosCreditos",
              premiseGroup: "ativoCirculante" as const,
              premiseField:
                "prazoOutrosCreditos" as keyof BalanceSheetProjectionInputs,
              values: Object.fromEntries(
                sortedYears.map((y) => [
                  y,
                  getPremise("prazoOutrosCreditos", y),
                ]),
              ),
            },
          ]
        : []),
      // ── PASSIVO CIRCULANTE ──
      {
        key: "hdr-pc",
        label: "PASSIVO CIRCULANTE",
        type: "header",
        groupKey: "passivoCirculante",
        values: Object.fromEntries(
          sortedYears.map((y) => {
            const pc = byYear[y]?.passivoCirculante;
            if (!pc) return [y, null];
            return [
              y,
              pc.fornecedores +
                pc.impostosAPagar +
                pc.obrigacoesSociaisETrabalhistas +
                pc.outrasObrigacoes,
            ];
          }),
        ),
      },
      {
        key: "fornecedores",
        label: "Fornecedores",
        type: "value",
        hasChildPremise: hasPremises,
        values: Object.fromEntries(
          sortedYears.map((y) => [
            y,
            byYear[y]?.passivoCirculante.fornecedores ?? null,
          ]),
        ),
      },
      ...(hasPremises
        ? [
            {
              key: "prazoFornecedores",
              label: "↳ Prazo Médio (dias) — CMV",
              type: "premise" as RowType,
              parentKey: "fornecedores",
              premiseGroup: "passivoCirculante" as const,
              premiseField:
                "prazoFornecedores" as keyof BalanceSheetProjectionInputs,
              values: Object.fromEntries(
                sortedYears.map((y) => [y, getPremise("prazoFornecedores", y)]),
              ),
            },
          ]
        : []),
      {
        key: "impostos",
        label: "Impostos a Pagar",
        type: "value",
        hasChildPremise: hasPremises,
        values: Object.fromEntries(
          sortedYears.map((y) => [
            y,
            byYear[y]?.passivoCirculante.impostosAPagar ?? null,
          ]),
        ),
      },
      ...(hasPremises
        ? [
            {
              key: "prazoImpostosAPagar",
              label: "↳ Prazo Médio (dias) — Imp. e Devoluções",
              type: "premise" as RowType,
              parentKey: "impostos",
              premiseGroup: "passivoCirculante" as const,
              premiseField:
                "prazoImpostosAPagar" as keyof BalanceSheetProjectionInputs,
              values: Object.fromEntries(
                sortedYears.map((y) => [
                  y,
                  getPremise("prazoImpostosAPagar", y),
                ]),
              ),
            },
          ]
        : []),
      {
        key: "obrigacoes",
        label: "Obrig. Sociais e Trabalhistas",
        type: "value",
        hasChildPremise: hasPremises,
        values: Object.fromEntries(
          sortedYears.map((y) => [
            y,
            byYear[y]?.passivoCirculante.obrigacoesSociaisETrabalhistas ?? null,
          ]),
        ),
      },
      ...(hasPremises
        ? [
            {
              key: "prazoObrigacoesSociais",
              label: "↳ Prazo Médio (dias) — Desp. Operacionais",
              type: "premise" as RowType,
              parentKey: "obrigacoes",
              premiseGroup: "passivoCirculante" as const,
              premiseField:
                "prazoObrigacoesSociais" as keyof BalanceSheetProjectionInputs,
              values: Object.fromEntries(
                sortedYears.map((y) => [
                  y,
                  getPremise("prazoObrigacoesSociais", y),
                ]),
              ),
            },
          ]
        : []),
      {
        key: "outrasObrig",
        label: "Outras Obrigações",
        type: "value",
        hasChildPremise: hasPremises,
        values: Object.fromEntries(
          sortedYears.map((y) => [
            y,
            byYear[y]?.passivoCirculante.outrasObrigacoes ?? null,
          ]),
        ),
      },
      ...(hasPremises
        ? [
            {
              key: "prazoOutrasObrigacoes",
              label: "↳ Prazo Médio (dias) — Rec. Bruta",
              type: "premise" as RowType,
              parentKey: "outrasObrig",
              premiseGroup: "passivoCirculante" as const,
              premiseField:
                "prazoOutrasObrigacoes" as keyof BalanceSheetProjectionInputs,
              values: Object.fromEntries(
                sortedYears.map((y) => [
                  y,
                  getPremise("prazoOutrasObrigacoes", y),
                ]),
              ),
            },
          ]
        : []),
      // ── Resultados ──
      {
        key: "capitalGiro",
        label: "Capital de Giro",
        type: "total",
        tooltip: "AC − PC (excl. Empréstimos CP) + Emp. CP",
        values: Object.fromEntries(
          sortedYears.map((y) => [y, byYear[y]?.capitalGiro ?? null]),
        ),
      },
      {
        key: "ncg-formula",
        label: "└─ AC − PC + Emp. CP",
        type: "annotation",
        values: {},
      },
      {
        key: "ncg",
        label: "NCG (Variação)",
        type: "total",
        tooltip: "Variação da Necessidade de Capital de Giro entre períodos",
        values: Object.fromEntries(
          sortedYears.map((y) => [y, byYear[y]?.ncg ?? null]),
        ),
      },
    ];
  }, [data, localProjections, hasPremises]);

  const isPremiseVisible = useCallback(
    (row: AuxRow): boolean => {
      if (showAllPremises) return true;
      if (row.premiseGroup && expandedGroups.has(row.premiseGroup)) return true;
      if (row.parentKey && expandedAccounts.has(row.parentKey)) return true;
      return false;
    },
    [showAllPremises, expandedGroups, expandedAccounts],
  );

  const visibleRows = useMemo(() => {
    return rows.filter((row) => {
      if (row.type !== "premise") return true;
      return isPremiseVisible(row);
    });
  }, [rows, isPremiseVisible]);

  const sortedYears = data.map((d) => d.year).sort((a, b) => a - b);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado de Capital de Giro disponível
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
            <Label htmlFor="decimals-toggle-wc" className="text-xs text-muted-foreground cursor-pointer">
              Decimais
            </Label>
            <Switch
              id="decimals-toggle-wc"
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
              <TableHead className="w-[230px] min-w-[200px] font-semibold sticky left-0 z-10 bg-card" />
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
            {visibleRows.map((row) => {
              const isMutedAlt = ["hdr-ac", "hdr-pc", "capitalGiro", "ncg"].includes(row.key);
              return (
              <TableRow
                key={row.key}
                className={cn(
                  "group",
                  row.type === "header" && "bg-muted/60 border-t-2",
                  row.type === "total" && "bg-muted/50",
                  row.type === "subtotal" && "bg-muted/30",
                  row.type === "premise" && "bg-premise-bg",
                  row.type === "annotation" &&
                    "bg-amber-50/30 dark:bg-annotation-bg",
                  isMutedAlt && "bg-muted-alt",
                )}
              >
                {/* Coluna de label */}
                <TableCell
                  className={cn(
                    "sticky left-0 z-10 transition-colors",
                    row.type === "header" && "bg-muted/60 group-hover:bg-muted-alt",
                    row.type === "total" && "bg-muted/50 group-hover:bg-muted-alt",
                    row.type === "subtotal" && "bg-muted/30 group-hover:bg-muted-alt",
                    row.type === "premise" && "bg-premise-bg group-hover:bg-muted-alt",
                    //row.type === "annotation" && "bg-amber-50/30 dark:bg-amber-950/10",
                    row.type === "value" && "bg-card group-hover:bg-muted-alt",
                    isMutedAlt && "bg-muted-alt group-hover:bg-muted-alt",
                  )}
                >
                  <div
                    className={cn(
                      "min-w-[240px] whitespace-nowrap flex items-center gap-1.5",
                      row.type === "header" && "font-bold text-sm",
                      row.type === "total" && "font-bold",
                      row.type === "subtotal" && "font-semibold",
                      row.type === "value" && "text-muted-foreground",
                      row.type === "premise" &&
                        "text-xs text-muted-foreground pl-4",
                      row.type === "annotation" &&
                        "text-xs text-muted-foreground pl-4 italic",
                      row.hasChildPremise && "cursor-pointer",
                    )}
                    onClick={
                      row.hasChildPremise
                        ? () => toggleAccount(row.key)
                        : undefined
                    }
                  >
                    {/* Botão de toggle por grupo no header */}
                    {row.type === "header" && row.groupKey && hasPremises ? (
                      <button
                        className="cursor-pointer flex-shrink-0 text-muted-foreground"
                        onClick={() => toggleGroup(row.groupKey!)}
                        title={
                          expandedGroups.has(row.groupKey)
                            ? "Ocultar premissas"
                            : "Exibir premissas"
                        }
                      >
                        {showAllPremises || expandedGroups.has(row.groupKey) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    ) : null}
                    {/* Chevron para toggle individual */}
                    {row.hasChildPremise ? (
                      <span
                        className="text-muted-foreground/60 flex-shrink-0 cursor-pointer"
                        onClick={() => toggleAccount(row.key)}
                      >
                        {expandedAccounts.has(row.key) ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </span>
                    ) : row.type === "value" && hasPremises ? (
                      <span className="h-3.5 w-3.5 flex-shrink-0 inline-block" />
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
                            unit="dias"
                            min={0}
                            max={9999}
                            decimals={0}
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

                  if (row.type === "annotation" && !row.values[y]) {
                    return <TableCell key={y} />;
                  }

                  return (
                    <TableCell key={y}>
                      <div
                        className={cn(
                          "text-right tabular-nums",
                          row.type === "header" && "font-bold text-sm",
                          row.type === "total" && "font-bold",
                          row.type === "subtotal" && "font-semibold",
                          row.type === "value" && "text-muted-foreground",
                          row.type === "annotation" &&
                            "text-xs text-muted-foreground italic",
                          value !== null && value < 0 && "text-red-600",
                        )}
                      >
                        {value !== null
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
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
