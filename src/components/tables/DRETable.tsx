'use client';

import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { DRECalculated } from '@/core/types';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatters';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface DRETableProps {
  data: DRECalculated[];
  showMargins?: boolean;
}

type DRERowData = {
  label: string;
  type: 'header' | 'value' | 'subtotal' | 'total';
  field: keyof DRECalculated | 'margin';
  values: Record<string, number | null>;
  isMargin?: boolean;
};

export function DRETable({ data, showMargins = true }: DRETableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado de DRE disponível
      </div>
    );
  }

  // Constrói as linhas da tabela
  const rows: DRERowData[] = [
    {
      label: 'Receita Bruta',
      type: 'value',
      field: 'receita',
      values: Object.fromEntries(data.map((d) => [d.ano, d.receita])),
    },
    {
      label: '(-) Impostos sobre Vendas',
      type: 'value',
      field: 'impostos',
      values: Object.fromEntries(data.map((d) => [d.ano, d.impostos * -1])),
    },
    {
      label: 'Receita Líquida',
      type: 'total',
      field: 'receita',
      values: Object.fromEntries(
        data.map((d) => [d.ano, d.receita - d.impostos])
      ),
    },
    {
      label: '(-) CMV',
      type: 'value',
      field: 'cmv',
      values: Object.fromEntries(data.map((d) => [d.ano, d.cmv * -1])),
    },
    {
      label: 'Lucro Bruto',
      type: 'subtotal',
      field: 'lucrobruto',
      values: Object.fromEntries(data.map((d) => [d.ano, d.lucrobruto])),
    },
    {
      label: '(-) Despesas Operacionais',
      type: 'value',
      field: 'despesasOperacionais',
      values: Object.fromEntries(
        data.map((d) => [d.ano, d.despesasOperacionais * -1])
      ),
    },
    {
      label: 'EBIT',
      type: 'total',
      field: 'ebit',
      values: Object.fromEntries(data.map((d) => [d.ano, d.ebit])),
    },
    {
      label: '(-) Despesas Financeiras',
      type: 'value',
      field: 'despesasFinanceiras',
      values: Object.fromEntries(
        data.map((d) => [d.ano, d.despesasFinanceiras * -1])
      ),
    },
    {
      label: 'LAIR',
      type: 'subtotal',
      field: 'lucroAntesImpostos',
      values: Object.fromEntries(data.map((d) => [d.ano, d.lucroAntesImpostos])),
    },
    {
      label: '(-) IR/CSLL',
      type: 'value',
      field: 'impostos',
      values: Object.fromEntries(data.map((d) => [d.ano, d.impostos * -1])),
    },
    {
      label: 'Lucro Líquido',
      type: 'total',
      field: 'lucroLiquido',
      values: Object.fromEntries(data.map((d) => [d.ano, d.lucroLiquido])),
    },
  ];

  // Cria colunas dinamicamente
  const columns: ColumnDef<DRERowData>[] = [
    {
      accessorKey: 'label',
      header: 'Linha',
      cell: ({ row }) => {
        const rowType = row.original.type;
        return (
          <div
            className={cn(
              'font-medium',
              rowType === 'total' && 'font-bold',
              rowType === 'subtotal' && 'font-semibold'
            )}
          >
            {row.original.label}
          </div>
        );
      },
    },
    ...data.map((yearData) => ({
      id: `year-${yearData.ano}`,
      header: yearData.ano === 0 ? 'Ano Base' : `Ano ${yearData.ano}`,
      cell: ({ row }: { row: { original: DRERowData } }) => {
        const value = row.original.values[yearData.ano];
        const rowType = row.original.type;
        const isMargin = row.original.isMargin;

        return (
          <div
            className={cn(
              'text-right tabular-nums',
              rowType === 'total' && 'font-bold border-t-2 border-t-foreground',
              rowType === 'subtotal' && 'font-semibold border-t',
              value !== null && value < 0 && 'text-red-600'
            )}
          >
            {value !== null
              ? isMargin
                ? formatPercentage(value)
                : formatCurrency(value)
              : '-'}
          </div>
        );
      },
    })),
  ];

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    header.id !== 'label' && 'text-right',
                    'font-semibold'
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
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
                row.original.type === 'total' && 'bg-muted/50',
                row.original.type === 'subtotal' && 'bg-muted/30'
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
  );
}
