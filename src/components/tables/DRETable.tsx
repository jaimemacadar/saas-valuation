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
  field: string; // Campo de referência (não usado diretamente)
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
      values: Object.fromEntries(data.map((d) => [d.year, d.receitaBruta])),
    },
    {
      label: '(-) Impostos sobre Vendas',
      type: 'value',
      field: 'impostos',
      values: Object.fromEntries(data.map((d) => [d.year, d.impostosEDevolucoes * -1])),
    },
    {
      label: 'Receita Líquida',
      type: 'total',
      field: 'receitaLiquida',
      values: Object.fromEntries(data.map((d) => [d.year, d.receitaLiquida])),
    },
    {
      label: '(-) CMV',
      type: 'value',
      field: 'cmv',
      values: Object.fromEntries(data.map((d) => [d.year, d.cmv * -1])),
    },
    {
      label: 'Lucro Bruto',
      type: 'subtotal',
      field: 'lucrobruto',
      values: Object.fromEntries(data.map((d) => [d.year, d.lucroBruto])),
    },
    {
      label: '(-) Despesas Operacionais',
      type: 'value',
      field: 'despesasOperacionais',
      values: Object.fromEntries(
        data.map((d) => [d.year, d.despesasOperacionais * -1])
      ),
    },
    {
      label: 'EBIT',
      type: 'total',
      field: 'ebit',
      values: Object.fromEntries(data.map((d) => [d.year, d.ebit])),
    },
    {
      label: '(+) Depreciação e Amortização',
      type: 'value',
      field: 'depreciacaoAmortizacao',
      values: Object.fromEntries(data.map((d) => [d.year, d.depreciacaoAmortizacao])),
    },
    {
      label: 'EBITDA',
      type: 'subtotal',
      field: 'ebitda',
      values: Object.fromEntries(data.map((d) => [d.year, d.ebitda])),
    },
    {
      label: '(-) Despesas Financeiras',
      type: 'value',
      field: 'despesasFinanceiras',
      values: Object.fromEntries(
        data.map((d) => [d.year, d.despesasFinanceiras * -1])
      ),
    },
    {
      label: 'LAIR',
      type: 'subtotal',
      field: 'lucroAntesIR',
      values: Object.fromEntries(data.map((d) => [d.year, d.lucroAntesIR])),
    },
    {
      label: '(-) IR/CSLL',
      type: 'value',
      field: 'irCSLL',
      values: Object.fromEntries(data.map((d) => [d.year, d.irCSLL * -1])),
    },
    {
      label: 'Lucro Líquido',
      type: 'total',
      field: 'lucroLiquido',
      values: Object.fromEntries(data.map((d) => [d.year, d.lucroLiquido])),
    },
    {
      label: '(-) Dividendos',
      type: 'value',
      field: 'dividendos',
      values: Object.fromEntries(data.map((d) => [d.year, d.dividendos * -1])),
    },
  ];

  // Cria colunas dinamicamente
  const columns: ColumnDef<DRERowData>[] = [
    {
      accessorKey: 'label',
      header: '',
      cell: ({ row }) => {
        const rowType = row.original.type;
        return (
          <div
            className={cn(
              'font-medium min-w-[200px] whitespace-nowrap',
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
      id: `year-${yearData.year}`,
      header: yearData.year === 0 ? 'Ano Base' : `Ano ${yearData.year}`,
      cell: ({ row }: { row: { original: DRERowData } }) => {
        const value = row.original.values[yearData.year];
        const rowType = row.original.type;
        const isMargin = row.original.isMargin;

        return (
          <div
            className={cn(
              'text-right tabular-nums',
              rowType === 'total' && 'font-bold border-t-2 border-t-foreground',
              rowType === 'subtotal' && 'font-semibold',
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
