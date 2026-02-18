"use client";

import { useCallback, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { BalanceSheetProjectionInputs } from "@/core/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BalanceSheetProjectionTableProps {
  data: BalanceSheetProjectionInputs[];
  onChange: (data: BalanceSheetProjectionInputs[]) => void;
  maxYears?: number;
}

export function BalanceSheetProjectionTable({
  data,
  onChange,
  maxYears = 10,
}: BalanceSheetProjectionTableProps) {
  const handleCellChange = useCallback(
    (rowIndex: number, field: keyof BalanceSheetProjectionInputs, value: string) => {
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

    const newYear: BalanceSheetProjectionInputs = {
      year: (lastYear?.year || 0) + 1,
      taxaDepreciacao: lastYear?.taxaDepreciacao || 20,
      indiceImobilizadoVendas: lastYear?.indiceImobilizadoVendas || 0.05,
      prazoCaixaEquivalentes: lastYear?.prazoCaixaEquivalentes || 54,
      prazoAplicacoesFinanceiras: lastYear?.prazoAplicacoesFinanceiras || 18,
      prazoContasReceber: lastYear?.prazoContasReceber || 45,
      prazoEstoques: lastYear?.prazoEstoques || 11,
      prazoAtivosBiologicos: lastYear?.prazoAtivosBiologicos || 0,
      prazoFornecedores: lastYear?.prazoFornecedores || 22,
      prazoImpostosAPagar: lastYear?.prazoImpostosAPagar || 7,
      prazoObrigacoesSociais: lastYear?.prazoObrigacoesSociais || 11,
      taxaNovosEmprestimosCP: lastYear?.taxaNovosEmprestimosCP || 5,
      taxaNovosEmprestimosLP: lastYear?.taxaNovosEmprestimosLP || 5,
      taxaJurosEmprestimo: lastYear?.taxaJurosEmprestimo || 12,
    };

    onChange([...data, newYear]);
  }, [data, maxYears, onChange]);

  // Colunas para Taxas e Índices
  const taxasColumns: ColumnDef<BalanceSheetProjectionInputs>[] = useMemo(
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
        accessorKey: "taxaDepreciacao",
        header: () => <div className="text-center">Taxa Depreciação<br/>(%)</div>,
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={getValue() as number}
            onChange={(e) => handleCellChange(row.index, "taxaDepreciacao", e.target.value)}
            className="text-center h-8"
            placeholder="20.0"
          />
        ),
      },
      {
        accessorKey: "indiceImobilizadoVendas",
        header: () => <div className="text-center">Índice Imob./Vendas<br/>(decimal)</div>,
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={getValue() as number}
            onChange={(e) => handleCellChange(row.index, "indiceImobilizadoVendas", e.target.value)}
            className="text-center h-8"
            placeholder="0.05"
          />
        ),
      },
      {
        accessorKey: "taxaNovosEmprestimosCP",
        header: () => <div className="text-center">Novos Emp. CP<br/>(%)</div>,
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            step="0.01"
            value={getValue() as number}
            onChange={(e) => handleCellChange(row.index, "taxaNovosEmprestimosCP", e.target.value)}
            className="text-center h-8"
            placeholder="5.0"
          />
        ),
      },
      {
        accessorKey: "taxaNovosEmprestimosLP",
        header: () => <div className="text-center">Novos Emp. LP<br/>(%)</div>,
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            step="0.01"
            value={getValue() as number}
            onChange={(e) => handleCellChange(row.index, "taxaNovosEmprestimosLP", e.target.value)}
            className="text-center h-8"
            placeholder="5.0"
          />
        ),
      },
      {
        accessorKey: "taxaJurosEmprestimo",
        header: () => <div className="text-center">Taxa Juros<br/>(% a.a.)</div>,
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            step="0.01"
            value={getValue() as number}
            onChange={(e) => handleCellChange(row.index, "taxaJurosEmprestimo", e.target.value)}
            className="text-center h-8"
            placeholder="12.0"
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

  // Colunas para Prazos Médios - Ativo
  const prazosAtivoColumns: ColumnDef<BalanceSheetProjectionInputs>[] = useMemo(
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
        accessorKey: "prazoCaixaEquivalentes",
        header: () => <div className="text-center">Caixa<br/>(dias)</div>,
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            step="1"
            min="0"
            max="360"
            value={getValue() as number}
            onChange={(e) => handleCellChange(row.index, "prazoCaixaEquivalentes", e.target.value)}
            className="text-center h-8"
          />
        ),
      },
      {
        accessorKey: "prazoAplicacoesFinanceiras",
        header: () => <div className="text-center">Aplicações<br/>(dias)</div>,
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            step="1"
            min="0"
            max="360"
            value={getValue() as number}
            onChange={(e) => handleCellChange(row.index, "prazoAplicacoesFinanceiras", e.target.value)}
            className="text-center h-8"
          />
        ),
      },
      {
        accessorKey: "prazoContasReceber",
        header: () => <div className="text-center">Contas Receber<br/>(dias)</div>,
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            step="1"
            min="0"
            max="360"
            value={getValue() as number}
            onChange={(e) => handleCellChange(row.index, "prazoContasReceber", e.target.value)}
            className="text-center h-8"
          />
        ),
      },
      {
        accessorKey: "prazoEstoques",
        header: () => <div className="text-center">Estoques<br/>(dias)</div>,
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            step="1"
            min="0"
            max="360"
            value={getValue() as number}
            onChange={(e) => handleCellChange(row.index, "prazoEstoques", e.target.value)}
            className="text-center h-8"
          />
        ),
      },
    ],
    [handleCellChange]
  );

  // Colunas para Prazos Médios - Passivo
  const prazosPassivoColumns: ColumnDef<BalanceSheetProjectionInputs>[] = useMemo(
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
        accessorKey: "prazoFornecedores",
        header: () => <div className="text-center">Fornecedores<br/>(dias)</div>,
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            step="1"
            min="0"
            max="360"
            value={getValue() as number}
            onChange={(e) => handleCellChange(row.index, "prazoFornecedores", e.target.value)}
            className="text-center h-8"
          />
        ),
      },
      {
        accessorKey: "prazoImpostosAPagar",
        header: () => <div className="text-center">Impostos a Pagar<br/>(dias)</div>,
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            step="1"
            min="0"
            max="360"
            value={getValue() as number}
            onChange={(e) => handleCellChange(row.index, "prazoImpostosAPagar", e.target.value)}
            className="text-center h-8"
          />
        ),
      },
      {
        accessorKey: "prazoObrigacoesSociais",
        header: () => <div className="text-center">Obrigações Sociais<br/>(dias)</div>,
        cell: ({ row, getValue }) => (
          <Input
            type="number"
            step="1"
            min="0"
            max="360"
            value={getValue() as number}
            onChange={(e) => handleCellChange(row.index, "prazoObrigacoesSociais", e.target.value)}
            className="text-center h-8"
          />
        ),
      },
    ],
    [handleCellChange]
  );

  const taxasTable = useReactTable({
    data,
    columns: taxasColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const prazosAtivoTable = useReactTable({
    data,
    columns: prazosAtivoColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const prazosPassivoTable = useReactTable({
    data,
    columns: prazosPassivoColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const renderTable = <T,>(table: ReturnType<typeof useReactTable<T>>) => (
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
                  colSpan={table.getAllColumns().length}
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
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="taxas" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="taxas">Taxas e Índices</TabsTrigger>
          <TabsTrigger value="prazos-ativo">Prazos Médios - Ativo</TabsTrigger>
          <TabsTrigger value="prazos-passivo">Prazos Médios - Passivo</TabsTrigger>
        </TabsList>

        <TabsContent value="taxas" className="space-y-4">
          {renderTable(taxasTable)}
          <div className="rounded-lg bg-blue-500/10 p-4 text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-2">💡 Sobre Taxas e Índices</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>Taxa Depreciação:</strong> % anual sobre Ativo Imobilizado Bruto</li>
              <li><strong>Índice Imob./Vendas:</strong> CAPEX como % da Receita Bruta (ex: 0.05 = 5%)</li>
              <li><strong>Novos Emp. CP/LP:</strong> % de crescimento da dívida de curto e longo prazo</li>
              <li><strong>Taxa Juros:</strong> % a.a. sobre dívida total → base para despesas financeiras e Kd no WACC</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="prazos-ativo" className="space-y-4">
          {renderTable(prazosAtivoTable)}
          <div className="rounded-lg bg-blue-500/10 p-4 text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-2">💡 Sobre Prazos Médios - Ativo</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>Prazos em dias:</strong> Número de dias que o valor fica &quot;girando&quot; no ativo</li>
              <li><strong>Fórmula:</strong> Saldo da conta = (Prazo / 360) × Receita Bruta</li>
              <li><strong>Exemplo:</strong> 45 dias de Contas a Receber significa que clientes pagam em 45 dias</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="prazos-passivo" className="space-y-4">
          {renderTable(prazosPassivoTable)}
          <div className="rounded-lg bg-blue-500/10 p-4 text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-2">💡 Sobre Prazos Médios - Passivo</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>Prazos em dias:</strong> Número de dias que a empresa leva para pagar</li>
              <li><strong>Fórmula:</strong> Saldo da conta = (Prazo / 360) × Receita Bruta</li>
              <li><strong>Exemplo:</strong> 30 dias de Fornecedores significa que a empresa paga em 30 dias</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>

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
    </div>
  );
}
