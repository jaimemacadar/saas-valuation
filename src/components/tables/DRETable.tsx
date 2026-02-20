"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { Loader2, Check, Info, ChevronRight, ChevronDown, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DRECalculated, DREProjectionInputs } from "@/core/types";
import { formatCurrency, formatPercentage } from "@/lib/utils/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PremiseInput } from "./PremiseInput";
import { useDREProjectionPersist } from "@/hooks/useDREProjectionPersist";

interface DRETableProps {
  data: DRECalculated[];
  showMargins?: boolean;
  projectionInputs?: DREProjectionInputs[];
  modelId?: string;
  onProjectionChange?: (data: DREProjectionInputs[]) => void;
}

type DRERowData = {
  label: string;
  type: "header" | "value" | "subtotal" | "total" | "premise" | "annotation";
  field: string;
  values: Record<string, number | null>;
  isMargin?: boolean;
  premiseField?: keyof DREProjectionInputs;
  premiseTooltip?: string;
  tooltip?: string;
  parentField?: string;
  hasPremise?: boolean;
  noBorderTop?: boolean;
};

export function DRETable({
  data,
  showMargins = true,
  projectionInputs,
  modelId,
  onProjectionChange,
}: DRETableProps) {
  // State local de premissas para UX responsiva
  const [localProjections, setLocalProjections] = useState<
    DREProjectionInputs[]
  >(projectionInputs || []);

  // Estado de visibilidade das premissas
  const [showAllPremises, setShowAllPremises] = useState(false);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(
    new Set(),
  );

  const toggleAccount = useCallback((field: string) => {
    setExpandedAccounts((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  }, []);

  // Hook de persistência com debounce — API imperativa (save chamado explicitamente)
  const { isSaving, lastSavedAt, save } = useDREProjectionPersist({
    modelId: modelId || "",
    debounceMs: 800,
  });

  const hasPremises = !!(projectionInputs && projectionInputs.length > 0);

  // Sistema de refs bidimensional para navegação Tab/Enter
  // inputRefs[premiseRowIndex][yearIndex] = HTMLInputElement
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // Handler para atualizar premissas — estável via useCallback
  const handlePremiseChange = useCallback(
    (year: number, field: keyof DREProjectionInputs, value: number) => {
      setLocalProjections((prev) => {
        const updated = prev.map((p) =>
          p.year === year ? { ...p, [field]: value } : p,
        );
        onProjectionChange?.(updated);
        if (modelId) {
          save(updated);
        }
        return updated;
      });
    },
    [modelId, save, onProjectionChange],
  );

  // Handler para copiar valor do Ano 1 para todos os anos seguintes
  const handleCopyRight = useCallback(
    (field: keyof DREProjectionInputs) => {
      setLocalProjections((prev) => {
        const year1Value = prev.find((p) => p.year === 1)?.[field] as
          | number
          | undefined;
        if (year1Value === undefined) return prev;

        const updated = prev.map((p) =>
          p.year > 1 ? { ...p, [field]: year1Value } : p,
        );
        onProjectionChange?.(updated);
        if (modelId) {
          save(updated);
        }
        return updated;
      });
    },
    [modelId, save, onProjectionChange],
  );

  // Handler para aplicar tendência (interpolação linear)
  const handleApplyTrend = useCallback(
    (
      field: keyof DREProjectionInputs,
      startValue: number,
      endValue: number,
    ) => {
      setLocalProjections((prev) => {
        // Filtra apenas anos projetados (> 0) e ordena
        const projectedYears = prev
          .filter((p) => p.year > 0)
          .sort((a, b) => a.year - b.year);
        if (projectedYears.length < 2) return prev;

        const n = projectedYears.length;

        const updated = prev.map((p) => {
          if (p.year === 0) return p; // Ano base não muda

          const index = projectedYears.findIndex((py) => py.year === p.year);
          if (index === -1) return p;

          // Interpolação linear: valor[i] = valorInicial + (valorFinal - valorInicial) * (i / (n - 1))
          const interpolatedValue =
            startValue + (endValue - startValue) * (index / (n - 1));

          return { ...p, [field]: interpolatedValue };
        });

        onProjectionChange?.(updated);
        if (modelId) {
          save(updated);
        }
        return updated;
      });
    },
    [modelId, save, onProjectionChange],
  );

  // Navegação entre inputs
  // Gera chave única para o mapa de refs
  const getRefKey = useCallback((premiseField: string, year: number) => {
    return `${premiseField}-${year}`;
  }, []);

  // Foca no próximo input na mesma linha (Tab)
  const focusNextInput = useCallback(
    (premiseField: string, currentYear: number) => {
      const years = data
        .filter((d) => d.year > 0)
        .sort((a, b) => a.year - b.year);
      const currentIndex = years.findIndex((y) => y.year === currentYear);
      if (currentIndex < years.length - 1) {
        const nextYear = years[currentIndex + 1].year;
        const nextKey = getRefKey(premiseField, nextYear);
        inputRefs.current.get(nextKey)?.focus();
      }
    },
    [data, getRefKey],
  );

  // Foca no input anterior na mesma linha (Shift+Tab)
  const focusPreviousInput = useCallback(
    (premiseField: string, currentYear: number) => {
      const years = data
        .filter((d) => d.year > 0)
        .sort((a, b) => a.year - b.year);
      const currentIndex = years.findIndex((y) => y.year === currentYear);
      if (currentIndex > 0) {
        const prevYear = years[currentIndex - 1].year;
        const prevKey = getRefKey(premiseField, prevYear);
        inputRefs.current.get(prevKey)?.focus();
      }
    },
    [data, getRefKey],
  );

  // Foca no input da mesma coluna na próxima linha de premissa (Enter)
  const focusNextRow = useCallback(
    (currentPremiseField: string, year: number) => {
      // Define a ordem das premissas
      const premiseOrder: (keyof DREProjectionInputs)[] = [
        "receitaBrutaGrowth",
        "impostosEDevolucoesRate",
        "cmvRate",
        "despesasOperacionaisRate",
        "irCSLLRate",
        "dividendosRate",
      ];

      const currentIndex = premiseOrder.indexOf(
        currentPremiseField as keyof DREProjectionInputs,
      );
      if (currentIndex < premiseOrder.length - 1) {
        const nextPremiseField = premiseOrder[currentIndex + 1];
        const nextKey = getRefKey(nextPremiseField, year);
        inputRefs.current.get(nextKey)?.focus();
      }
    },
    [getRefKey],
  );

  // Memoiza rows para evitar novas referências a cada render
  const rows: DRERowData[] = useMemo(() => {
    const getPremiseValues = (
      field: keyof DREProjectionInputs,
    ): Record<string, number | null> => {
      if (!localProjections || localProjections.length === 0) return {};
      return Object.fromEntries(
        localProjections.map((p) => [p.year, p[field] as number]),
      );
    };

    return [
      {
        label: "Receita Bruta",
        type: "total",
        field: "receita",
        hasPremise: hasPremises,
        noBorderTop: true,
        values: Object.fromEntries(data.map((d) => [d.year, d.receitaBruta])),
      },
      ...(hasPremises
        ? [
            {
              label: "Crescimento anual (%)",
              type: "premise" as const,
              field: "receitaBrutaGrowth",
              parentField: "receita",
              premiseField: "receitaBrutaGrowth" as keyof DREProjectionInputs,
              premiseTooltip:
                "% crescimento sobre receita bruta do ano anterior",
              values: getPremiseValues("receitaBrutaGrowth"),
            },
          ]
        : []),
      {
        label: "(-) Impostos sobre Vendas",
        type: "value",
        field: "impostos",
        hasPremise: hasPremises,
        values: Object.fromEntries(
          data.map((d) => [d.year, d.impostosEDevolucoes * -1]),
        ),
      },
      ...(hasPremises
        ? [
            {
              label: "Impostos s/ vendas (%)",
              type: "premise" as const,
              field: "impostosEDevolucoesRate",
              parentField: "impostos",
              premiseField:
                "impostosEDevolucoesRate" as keyof DREProjectionInputs,
              premiseTooltip: "% sobre Receita Bruta",
              values: getPremiseValues("impostosEDevolucoesRate"),
            },
          ]
        : []),
      {
        label: "Receita Líquida",
        type: "total",
        field: "receitaLiquida",
        values: Object.fromEntries(data.map((d) => [d.year, d.receitaLiquida])),
      },
      {
        label: "(-) CMV",
        type: "value",
        field: "cmv",
        hasPremise: hasPremises,
        values: Object.fromEntries(data.map((d) => [d.year, d.cmv * -1])),
      },
      ...(hasPremises
        ? [
            {
              label: "CMV (%)",
              type: "premise" as const,
              field: "cmvRate",
              parentField: "cmv",
              premiseField: "cmvRate" as keyof DREProjectionInputs,
              premiseTooltip: "% sobre Receita Líquida",
              values: getPremiseValues("cmvRate"),
            },
          ]
        : []),
      {
        label: "Lucro Bruto",
        type: "subtotal",
        field: "lucrobruto",
        values: Object.fromEntries(data.map((d) => [d.year, d.lucroBruto])),
      },
      {
        label: "(-) Despesas Operacionais",
        type: "value",
        field: "despesasOperacionais",
        hasPremise: hasPremises,
        values: Object.fromEntries(
          data.map((d) => [d.year, d.despesasOperacionais * -1]),
        ),
      },
      ...(hasPremises
        ? [
            {
              label: "Despesas operacionais (%)",
              type: "premise" as const,
              field: "despesasOperacionaisRate",
              parentField: "despesasOperacionais",
              premiseField:
                "despesasOperacionaisRate" as keyof DREProjectionInputs,
              premiseTooltip: "% sobre Receita Líquida",
              values: getPremiseValues("despesasOperacionaisRate"),
            },
          ]
        : []),
      {
        label: "Lucro Operacional (EBIT)",
        type: "total",
        field: "ebit",
        values: Object.fromEntries(data.map((d) => [d.year, d.ebit])),
      },
      {
        label: "└─ EBITDA",
        type: "annotation",
        field: "ebitda",
        values: Object.fromEntries(data.map((d) => [d.year, d.ebitda])),
        tooltip: "EBIT + Depreciação e Amortização",
      },
      {
        label: "(-) Despesas Financeiras",
        type: "value",
        field: "despesasFinanceiras",
        values: Object.fromEntries(
          data.map((d) => [d.year, d.despesasFinanceiras * -1]),
        ),
      },
      {
        label: "Lucro antes de IR/CSLL (LAIR)",
        type: "total",
        field: "lucroAntesIR",
        values: Object.fromEntries(data.map((d) => [d.year, d.lucroAntesIR])),
      },
      {
        label: "(-) IR/CSLL",
        type: "value",
        field: "irCSLL",
        hasPremise: hasPremises,
        values: Object.fromEntries(data.map((d) => [d.year, d.irCSLL * -1])),
      },
      ...(hasPremises
        ? [
            {
              label: "IR/CSLL (%)",
              type: "premise" as const,
              field: "irCSLLRate",
              parentField: "irCSLL",
              premiseField: "irCSLLRate" as keyof DREProjectionInputs,
              premiseTooltip: "% sobre LAIR",
              values: getPremiseValues("irCSLLRate"),
            },
          ]
        : []),
      {
        label: "Lucro Líquido",
        type: "total",
        field: "lucroLiquido",
        values: Object.fromEntries(data.map((d) => [d.year, d.lucroLiquido])),
      },
      {
        label: "(-) Dividendos",
        type: "value",
        field: "dividendos",
        hasPremise: hasPremises,
        values: Object.fromEntries(
          data.map((d) => [d.year, d.dividendos * -1]),
        ),
      },
      ...(hasPremises
        ? [
            {
              label: "Dividendos (%)",
              type: "premise" as const,
              field: "dividendosRate",
              parentField: "dividendos",
              premiseField: "dividendosRate" as keyof DREProjectionInputs,
              premiseTooltip: "% sobre Lucro Líquido",
              values: getPremiseValues("dividendosRate"),
            },
          ]
        : []),
    ];
  }, [data, localProjections, hasPremises]);

  // Filtra rows de premissa que não estão visíveis
  const visibleRows = useMemo(() => {
    return rows.filter((row) => {
      if (row.type !== "premise") return true;
      if (!row.parentField) return true;
      if (showAllPremises) return true;
      return expandedAccounts.has(row.parentField);
    });
  }, [rows, showAllPremises, expandedAccounts]);

  // Memoiza columns para evitar novas referências a cada render
  const columns: ColumnDef<DRERowData>[] = useMemo(
    () => [
      {
        accessorKey: "label",
        header: "",
        cell: ({ row }) => {
          const rowType = row.original.type;
          const premiseTooltip = row.original.premiseTooltip;
          const tooltip = row.original.tooltip;
          const tooltipText = premiseTooltip || tooltip;
          const hasPremise = row.original.hasPremise;
          const field = row.original.field;

          const isExpanded =
            hasPremise && (showAllPremises || expandedAccounts.has(field));

          return (
            <div
              className={cn(
                "font-medium min-w-[200px] whitespace-nowrap flex items-center gap-1.5",
                rowType === "total" && "font-bold",
                rowType === "subtotal" && "font-semibold",
                rowType === "premise" && "text-xs text-muted-foreground pl-6",
                rowType === "annotation" &&
                  "text-xs text-muted-foreground pl-6 italic",
                hasPremise &&
                  "cursor-pointer select-none hover:text-foreground/80 transition-colors",
              )}
              onClick={hasPremise ? () => toggleAccount(field) : undefined}
            >
              {hasPremise ? (
                <span className="text-muted-foreground/60 flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200" />
                  )}
                </span>
              ) : null}
              <span>{row.original.label}</span>
              {tooltipText ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 cursor-help text-muted-foreground/60 hover:text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="text-xs">{tooltipText}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : null}
            </div>
          );
        },
      },
      ...data.map((yearData) => ({
        id: `year-${yearData.year}`,
        header: yearData.year === 0 ? "Ano Base" : `Ano ${yearData.year}`,
        cell: ({ row }: { row: { original: DRERowData } }) => {
          const value = row.original.values[yearData.year];
          const rowType = row.original.type;
          const isMargin = row.original.isMargin;
          const premiseField = row.original.premiseField;

          // Renderiza input editável para premissas
          if (rowType === "premise" && premiseField) {
            // Ano Base não é editável
            if (yearData.year === 0) {
              return (
                <div className="text-right text-xs text-muted-foreground">
                  —
                </div>
              );
            }

            // Renderiza PremiseInput para anos projetados
            return (
              <div className="flex justify-end">
                <PremiseInput
                  value={value}
                  onChange={(newValue) =>
                    handlePremiseChange(yearData.year, premiseField, newValue)
                  }
                  disabled={!modelId}
                  showCopyRight={yearData.year === 1}
                  onCopyRight={() => handleCopyRight(premiseField)}
                  showTrend={yearData.year === 1}
                  onApplyTrend={(start, end) =>
                    handleApplyTrend(premiseField, start, end)
                  }
                  ref={(el) => {
                    const key = getRefKey(premiseField, yearData.year);
                    if (el) {
                      inputRefs.current.set(key, el);
                    } else {
                      inputRefs.current.delete(key);
                    }
                  }}
                  onNavigateNext={() =>
                    focusNextInput(premiseField, yearData.year)
                  }
                  onNavigatePrevious={() =>
                    focusPreviousInput(premiseField, yearData.year)
                  }
                  onNavigateDown={() =>
                    focusNextRow(premiseField, yearData.year)
                  }
                />
              </div>
            );
          }

          // Renderiza valores calculados (read-only)
          return (
            <div
              className={cn(
                "text-right tabular-nums",
                rowType === "total" && "font-bold",
                rowType === "total" &&
                  !row.original.noBorderTop &&
                  "border-t-2 border-t-foreground",
                rowType === "subtotal" && "font-semibold",
                rowType === "annotation" &&
                  "text-xs text-muted-foreground italic",
                value !== null && value < 0 && "text-red-600",
              )}
            >
              {value !== null
                ? isMargin
                  ? formatPercentage(value)
                  : formatCurrency(value, { showSymbol: false })
                : "-"}
            </div>
          );
        },
      })),
    ],
    [data, handlePremiseChange, modelId, showAllPremises, expandedAccounts, toggleAccount],
  );

  const table = useReactTable({
    data: visibleRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado de DRE disponível
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
        <p className="text-xs text-muted-foreground italic pl-1 mb-0.4 self-end">Valores em R$ (Reais)</p>
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

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.id === "label" && "w-[220px] min-w-[200px]",
                      header.id !== "label" &&
                        "w-[110px] min-w-[100px] text-right",
                      "font-semibold",
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  row.original.type === "total" && "bg-muted/50",
                  row.original.type === "subtotal" && "bg-muted/30",
                  row.original.type === "premise" &&
                    "bg-blue-50/50 dark:bg-blue-950/20",
                  row.original.type === "annotation" &&
                    "bg-amber-50/30 dark:bg-amber-950/20",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
