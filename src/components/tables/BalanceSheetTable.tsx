"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  ColumnDef,
  flexRender,
  ExpandedState,
} from "@tanstack/react-table";
import { BalanceSheetCalculated } from "@/core/types";
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
import { ChevronRight, ChevronDown, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface BalanceSheetTableProps {
  data: BalanceSheetCalculated[];
}

type BalanceSheetRowData = {
  label: string;
  type: "section" | "item" | "subtotal" | "total";
  field?: string; // Campo de referência (não usado diretamente)
  values: Record<string, number | null>;
  subRows?: BalanceSheetRowData[];
};

export function BalanceSheetTable({ data }: BalanceSheetTableProps) {
  const [expanded, setExpanded] = useState<ExpandedState>(true);
  const [showDecimals, setShowDecimals] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado de Balanço Patrimonial disponível
      </div>
    );
  }

  // Valida se Ativo = Passivo + PL
  const isBalanced = data.every((year) => {
    const diff = Math.abs(
      year.ativoTotal - (year.passivoTotal + year.patrimonioLiquido.total),
    );
    return diff < 0.01; // Tolerância de R$ 0,01
  });

  // Constrói as linhas da tabela com hierarquia - memoizado
  const rows: BalanceSheetRowData[] = useMemo(
    () => [
      {
        label: "ATIVO",
        type: "section" as const,
        values: Object.fromEntries(data.map((d) => [d.year, d.ativoTotal])),
        subRows: [
          {
            label: "Ativo Circulante",
            type: "subtotal" as const,
            values: Object.fromEntries(
              data.map((d) => [d.year, d.ativoCirculante.total]),
            ),
            subRows: [
              {
                label: "Caixa e Equivalentes",
                type: "item" as const,
                field: "caixa",
                values: Object.fromEntries(
                  data.map((d) => [
                    d.year,
                    d.ativoCirculante.caixaEquivalentes,
                  ]),
                ),
              },
              {
                label: "Contas a Receber",
                type: "item" as const,
                field: "contasReceber",
                values: Object.fromEntries(
                  data.map((d) => [d.year, d.ativoCirculante.contasReceber]),
                ),
              },
              {
                label: "Estoques",
                type: "item" as const,
                field: "estoques",
                values: Object.fromEntries(
                  data.map((d) => [d.year, d.ativoCirculante.estoques]),
                ),
              },
            ],
          },
          {
            label: "Ativo Não Circulante",
            type: "subtotal" as const,
            values: Object.fromEntries(
              data.map((d) => [d.year, d.ativoTotal - d.ativoCirculante.total]),
            ),
            subRows: [
              {
                label: "Imobilizado",
                type: "item" as const,
                field: "imobilizado",
                values: Object.fromEntries(
                  data.map((d) => [d.year, d.ativoRealizavelLP.imobilizado]),
                ),
              },
            ],
          },
        ],
      },
      {
        label: "PASSIVO",
        type: "section" as const,
        values: Object.fromEntries(data.map((d) => [d.year, d.passivoTotal])),
        subRows: [
          {
            label: "Passivo Circulante",
            type: "subtotal" as const,
            values: Object.fromEntries(
              data.map((d) => [d.year, d.passivoCirculante.total]),
            ),
            subRows: [
              {
                label: "Fornecedores",
                type: "item" as const,
                field: "fornecedores",
                values: Object.fromEntries(
                  data.map((d) => [d.year, d.passivoCirculante.fornecedores]),
                ),
              },
            ],
          },
          {
            label: "Passivo Não Circulante",
            type: "subtotal" as const,
            values: Object.fromEntries(
              data.map((d) => [d.year, d.passivoRealizavelLP.total]),
            ),
            subRows: [
              {
                label: "Empréstimos e Financiamentos LP",
                type: "item" as const,
                field: "emprestimosFinanciamentosLP",
                values: Object.fromEntries(
                  data.map((d) => [
                    d.year,
                    d.passivoRealizavelLP.emprestimosFinanciamentosLP,
                  ]),
                ),
              },
            ],
          },
        ],
      },
      {
        label: "PATRIMÔNIO LÍQUIDO",
        type: "total" as const,
        field: "patrimonioLiquido",
        values: Object.fromEntries(
          data.map((d) => [d.year, d.patrimonioLiquido.total]),
        ),
      },
    ],
    [data],
  );

  const fractionDigits = showDecimals ? 2 : 0;

  const columns: ColumnDef<BalanceSheetRowData>[] = useMemo(
    () => [
      {
        accessorKey: "label",
        header: "",
        cell: ({ row }) => {
          const canExpand = row.getCanExpand();
          const rowType = row.original.type;

          return (
            <div
              className={cn(
                "flex items-center gap-2 min-w-[200px] max-w-[400px]",
                rowType === "section" && "font-bold text-base",
                rowType === "subtotal" && "font-semibold",
                rowType === "total" && "font-bold",
                rowType === "item" && "text-muted-foreground",
              )}
            >
              {canExpand ? (
                <button
                  onClick={row.getToggleExpandedHandler()}
                  className="cursor-pointer flex-shrink-0"
                >
                  {row.getIsExpanded() ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <span className="h-4 w-4 flex-shrink-0" />
              )}
              <span className="truncate" title={row.original.label}>
                {row.original.label}
              </span>
            </div>
          );
        },
      },
      ...data.map((yearData) => ({
        id: `year-${yearData.year}`,
        header: yearData.year === 0 ? "Ano Base" : `Ano ${yearData.year}`,
        cell: ({ row }: { row: { original: BalanceSheetRowData } }) => {
          const value = row.original.values[yearData.year];
          const rowType = row.original.type;

          return (
            <div
              className={cn(
                "text-right tabular-nums",
                rowType === "section" &&
                  "font-bold border-t-2 border-t-foreground",
                rowType === "subtotal" && "font-semibold",
                rowType === "total" &&
                  "font-bold border-t-2 border-t-foreground",
                rowType === "item" && "text-muted-foreground",
              )}
            >
              {value !== null
                ? formatCurrency(value, {
                    showSymbol: false,
                    minimumFractionDigits: fractionDigits,
                    maximumFractionDigits: fractionDigits,
                  })
                : "-"}
            </div>
          );
        },
      })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, fractionDigits],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.subRows,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {isBalanced ? (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Balanço equilibrado
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Balanço desbalanceado
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground italic pl-1 self-end">
            Valores em R$ (Reais)
          </p>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="decimals-toggle"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              Decimais
            </Label>
            <Switch
              id="decimals-toggle"
              checked={showDecimals}
              onCheckedChange={setShowDecimals}
            />
          </div>
        </div>

        <div className="rounded-md border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        header.id === "label" &&
                          "w-[250px] min-w-[200px] sticky left-0 z-10 bg-card",
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
              {table.getRowModel().rows.map((row) => {
                const isMuted =
                  row.original.type === "section" ||
                  row.original.type === "total";
                return (
                  <TableRow
                    key={row.id}
                    className={cn(isMuted && "bg-muted-alt")}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          cell.column.id === "label" && "sticky left-0 z-10",
                          cell.column.id === "label" &&
                            isMuted &&
                            "bg-muted-alt",
                          cell.column.id === "label" && !isMuted && "bg-card",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
