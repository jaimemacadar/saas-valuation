"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Loader2, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

interface CashApplicationsTableProps {
  data: BalanceSheetCalculated[];
  projectionInputs?: BalanceSheetProjectionInputs[];
  modelId?: string;
  onProjectionChange?: (data: BalanceSheetProjectionInputs[]) => void;
}

type RowType = "header" | "value" | "total" | "premise";

interface AuxRow {
  key: string;
  label: string;
  type: RowType;
  values: Record<number, number | null>;
  tooltip?: string;
  premiseField?: keyof BalanceSheetProjectionInputs;
  premiseScale?: number;
  premiseUnit?: string;
}

export function CashApplicationsTable({
  data,
  projectionInputs,
  modelId,
  onProjectionChange,
}: CashApplicationsTableProps) {
  const [localProjections, setLocalProjections] = useState<BalanceSheetProjectionInputs[]>(
    projectionInputs || []
  );
  useEffect(() => {
    setLocalProjections(projectionInputs || []);
  }, [projectionInputs]);
  const [showPremises, setShowPremises] = useState(false);
  const [showDecimals, setShowDecimals] = useState(false);

  const { isSaving, lastSavedAt, save } = useBPProjectionPersist({
    modelId: modelId || "",
  });

  const hasPremises = !!(projectionInputs && projectionInputs.length > 0);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

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
      {
        key: "saldo-inicial",
        label: "Aplicações Financeiras (início)",
        type: "header",
        tooltip: "Saldo de Aplicações Financeiras do período anterior",
        values: Object.fromEntries(
          sortedYears.map((y, i) => {
            const prevY = i === 0 ? y : sortedYears[i - 1];
            return [y, byYear[prevY]?.ativoCirculante.aplicacoesFinanceiras ?? null];
          })
        ),
      },
      {
        key: "novas-aplicacoes",
        label: "(+) Novas Aplicações",
        type: "value",
        tooltip: "Será calculado pelo FCFF em implementação futura",
        values: Object.fromEntries(
          sortedYears.map((y) => [y, y === 0 ? null : byYear[y]?.novasAplicacoes ?? null])
        ),
      },
      {
        key: "receitas-financeiras",
        label: "(+) Receitas Financeiras",
        type: "value",
        tooltip: "Taxa de Juros × Saldo Inicial",
        values: Object.fromEntries(
          sortedYears.map((y) => [y, y === 0 ? null : byYear[y]?.receitasFinanceiras ?? null])
        ),
      },
      ...(hasPremises
        ? [
            {
              key: "taxaJurosAplicacoes",
              label: "↳ Taxa de Juros (% a.a.)",
              type: "premise" as RowType,
              premiseField: "taxaJurosAplicacoes" as keyof BalanceSheetProjectionInputs,
              premiseScale: 1,
              values: Object.fromEntries(
                sortedYears.map((y) => [y, getPremiseDisplay("taxaJurosAplicacoes", y, 1)])
              ),
            },
          ]
        : []),
      {
        key: "saldo-final",
        label: "(=) Aplicações Financeiras (final)",
        type: "total",
        tooltip: "Saldo Inicial + Novas Aplicações + Receitas Financeiras",
        values: Object.fromEntries(
          sortedYears.map((y) => [y, byYear[y]?.ativoCirculante.aplicacoesFinanceiras ?? null])
        ),
      },
    ];
  }, [data, localProjections, hasPremises]);

  const visibleRows = useMemo(() => {
    return rows.filter((row) => {
      if (row.type !== "premise") return true;
      return showPremises;
    });
  }, [rows, showPremises]);

  const sortedYears = data.map((d) => d.year).sort((a, b) => a - b);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado de Aplicações Financeiras disponível
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="decimals-toggle-cash" className="text-xs text-muted-foreground cursor-pointer">
              Decimais
            </Label>
            <Switch
              id="decimals-toggle-cash"
              checked={showDecimals}
              onCheckedChange={setShowDecimals}
            />
          </div>
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
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px] min-w-[200px] font-semibold sticky left-0 z-10 bg-card" />
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
                  "group",
                  row.type === "header" && "bg-muted-alt border-t-2",
                  row.type === "total" && "bg-muted-alt",
                  row.type === "premise" && "bg-premise-bg"
                )}
              >
                {/* Coluna de label */}
                <TableCell
                  className={cn(
                    "sticky left-0 z-10 transition-colors",
                    row.type === "header" && "bg-muted-alt group-hover:bg-muted-alt",
                    row.type === "total" && "bg-muted-alt group-hover:bg-muted-alt",
                    row.type === "premise" && "bg-premise-bg group-hover:bg-muted-alt",
                    row.type === "value" && "bg-card group-hover:bg-muted-alt"
                  )}
                >
                  <div
                    className={cn(
                      "min-w-[240px] whitespace-nowrap flex items-center gap-1.5",
                      row.type === "header" && "font-bold text-sm",
                      row.type === "total" && "font-bold",
                      row.type === "value" && "text-muted-foreground",
                      row.type === "premise" && "text-xs text-muted-foreground pl-4"
                    )}
                  >
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
                          row.type === "value" && "text-muted-foreground",
                          value !== null && value < 0 && "text-red-600"
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
