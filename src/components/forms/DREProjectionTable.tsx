"use client";

import { useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { DREProjectionInputs } from "@/core/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface DREProjectionTableProps {
  data: DREProjectionInputs[];
  onChange: (data: DREProjectionInputs[]) => void;
  maxYears?: number;
}

export function DREProjectionTable({
  data,
  onChange,
  maxYears = 10,
}: DREProjectionTableProps) {
  const handleCellChange = useCallback(
    (rowIndex: number, field: keyof DREProjectionInputs, value: string) => {
      const numValue = field === "year" ? parseInt(value) || 1 : parseFloat(value) || 0;

      const newData = [...data];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [field]: numValue,
      };

      onChange(newData);
    },
    [data, onChange]
  );

  const removeYear = useCallback(
    (rowIndex: number) => {
      const newData = data.filter((_, index) => index !== rowIndex);
      onChange(newData);
    },
    [data, onChange]
  );

  const addYear = useCallback(() => {
    if (data.length >= maxYears) return;

    const lastYear = data.length > 0 ? data[data.length - 1] : null;

    const newYear: DREProjectionInputs = {
      year: (lastYear?.year || 0) + 1,
      receitaBrutaGrowth: lastYear?.receitaBrutaGrowth || 5,
      impostosEDevolucoesRate: lastYear?.impostosEDevolucoesRate || 8,
      cmvRate: lastYear?.cmvRate || 30,
      despesasOperacionaisRate: lastYear?.despesasOperacionaisRate || 40,
      irCSLLRate: lastYear?.irCSLLRate || 34,
      dividendosRate: lastYear?.dividendosRate || 20,
    };

    onChange([...data, newYear]);
  }, [data, maxYears, onChange]);

  const columns: ColumnDef<DREProjectionInputs>[] = useMemo(
    () => [
      {
        accessorKey: "year",
        header: "Ano",
        cell: ({ row }) => (
          <div className="font-medium text-center">
            Ano {row.original.year}
          </div>
        ),
      },
      {
        accessorKey: "receitaBrutaGrowth",
        header: () => <div className="text-center">Crescimento<br/>Receita (%)</div>,
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            step="0.01"
            value={getValue() as number}
            onChange={(e) => handleCellChange(row.index, "receitaBrutaGrowth", e.target.value)}
            className="text-center h-8"
            placeholder="5.0"
          />
        ),
      },
      {
        accessorKey: "impostosEDevolucoesRate",
        header: () => <div className="text-center">Impostos/Dev<br/>(%)</div>,
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={getValue() as number}
            onChange={(e) => handleCellChange(row.index, "impostosEDevolucoesRate", e.target.value)}
            className="text-center h-8"
            placeholder="8.0"
          />
        ),
      },
      {
        accessorKey: "cmvRate",
        header: () => <div className="text-center">CMV<br/>(%)</div>,
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={getValue() as number}
            onChange={(e) => handleCellChange(row.index, "cmvRate", e.target.value)}
            className="text-center h-8"
            placeholder="30.0"
          />
        ),
      },
      {
        accessorKey: "despesasOperacionaisRate",
        header: () => <div className="text-center">Desp. Op.<br/>(%)</div>,
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={getValue() as number}
            onChange={(e) => handleCellChange(row.index, "despesasOperacionaisRate", e.target.value)}
            className="text-center h-8"
            placeholder="40.0"
          />
        ),
      },
      {
        accessorKey: "irCSLLRate",
        header: () => <div className="text-center">IR/CSLL<br/>(%)</div>,
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={getValue() as number}
            onChange={(e) => handleCellChange(row.index, "irCSLLRate", e.target.value)}
            className="text-center h-8"
            placeholder="34.0"
          />
        ),
      },
      {
        accessorKey: "dividendosRate",
        header: () => <div className="text-center">Dividendos<br/>(%)</div>,
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={getValue() as number}
            onChange={(e) => handleCellChange(row.index, "dividendosRate", e.target.value)}
            className="text-center h-8"
            placeholder="20.0"
          />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeYear(row.index)}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [handleCellChange, removeYear]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-xs"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-2 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhum ano de projeção. Clique em &quot;Adicionar Ano&quot; para começar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {data.length} de {maxYears} anos configurados
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addYear}
          disabled={data.length >= maxYears}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Ano
        </Button>
      </div>

      <div className="rounded-lg bg-blue-500/10 p-4 text-sm text-blue-900 dark:text-blue-100">
        <p className="font-medium mb-2">💡 Dica</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li><strong>Crescimento Receita:</strong> % de aumento sobre receita bruta do ano anterior</li>
          <li><strong>Impostos/Dev e CMV:</strong> % sobre receita bruta ou líquida respectivamente</li>
          <li><strong>Desp. Op.:</strong> % sobre receita líquida</li>
          <li><strong>IR/CSLL:</strong> % sobre lucro antes dos impostos</li>
          <li><strong>Dividendos:</strong> % sobre lucro líquido</li>
        </ul>
      </div>
    </div>
  );
}
