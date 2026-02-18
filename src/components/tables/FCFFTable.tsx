'use client';

import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { FCFFCalculated } from '@/core/types';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface FCFFTableProps {
  data: FCFFCalculated[];
}

type FCFFRowData = {
  label: string;
  type: 'value' | 'subtotal' | 'total';
  field: keyof FCFFCalculated;
  values: Record<string, number | null>;
  description?: string;
};

export function FCFFTable({ data }: FCFFTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado de FCFF disponível
      </div>
    );
  }

  // Constrói as linhas da tabela
  const rows: FCFFRowData[] = [
    {
      label: 'EBIT',
      type: 'value',
      field: 'ebit',
      values: Object.fromEntries(data.map((d) => [d.year, d.ebit])),
      description: 'Earnings Before Interest and Taxes',
    },
    {
      label: '(-) Impostos sobre EBIT',
      type: 'value',
      field: 'impostos',
      values: Object.fromEntries(data.map((d) => [d.year, d.impostos * -1])),
    },
    {
      label: 'NOPAT',
      type: 'subtotal',
      field: 'nopat',
      values: Object.fromEntries(data.map((d) => [d.year, d.nopat])),
      description: 'Net Operating Profit After Taxes',
    },
    {
      label: '(+) Depreciação',
      type: 'value',
      field: 'depreciacaoAmortizacao',
      values: Object.fromEntries(data.map((d) => [d.year, d.depreciacaoAmortizacao])),
    },
    {
      label: '(-) CAPEX',
      type: 'value',
      field: 'capex',
      values: Object.fromEntries(data.map((d) => [d.year, d.capex * -1])),
      description: 'Capital Expenditure',
    },
    {
      label: '(-) Variação NCG',
      type: 'value',
      field: 'ncg',
      values: Object.fromEntries(
        data.map((d) => [d.year, d.ncg * -1])
      ),
      description: 'Necessidade de Capital de Giro',
    },
    {
      label: 'FCFF',
      type: 'total',
      field: 'fcff',
      values: Object.fromEntries(data.map((d) => [d.year, d.fcff])),
      description: 'Free Cash Flow to the Firm',
    },
  ];

  const columns: ColumnDef<FCFFRowData>[] = [
    {
      accessorKey: 'label',
      header: 'Linha',
      cell: ({ row }) => {
        const rowType = row.original.type;
        return (
          <div className="space-y-1">
            <div
              className={cn(
                'font-medium',
                rowType === 'total' && 'font-bold text-base',
                rowType === 'subtotal' && 'font-semibold'
              )}
            >
              {row.original.label}
            </div>
            {row.original.description && (
              <div className="text-xs text-muted-foreground">
                {row.original.description}
              </div>
            )}
          </div>
        );
      },
    },
    ...data.map((yearData) => ({
      id: `year-${yearData.year}`,
      header: yearData.year === 0 ? 'Ano Base' : `Ano ${yearData.year}`,
      cell: ({ row }: { row: { original: FCFFRowData } }) => {
        const value = row.original.values[yearData.year];
        const rowType = row.original.type;
        const isFCFF = row.original.field === 'fcff';

        return (
          <div
            className={cn(
              'text-right tabular-nums',
              rowType === 'total' && 'font-bold text-base border-t-2 border-t-foreground',
              rowType === 'subtotal' && 'font-semibold border-t',
              // Cores condicionais para valores negativos/positivos
              value !== null && isFCFF && value >= 0 && 'text-green-600',
              value !== null && isFCFF && value < 0 && 'text-red-600'
            )}
          >
            {value !== null ? formatCurrency(value, { showSymbol: false }) : '-'}
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

  // Calcula estatísticas
  const totalFCFF = data.reduce((sum, year) => sum + year.fcff, 0);
  const positiveFCFFCount = data.filter((year) => year.fcff > 0).length;
  const negativeFCFFCount = data.filter((year) => year.fcff < 0).length;

  return (
    <div className="space-y-4">
      {/* Indicadores rápidos */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">FCFF Total</div>
          <div
            className={cn(
              'text-2xl font-bold mt-1',
              totalFCFF >= 0 ? 'text-green-600' : 'text-red-600'
            )}
          >
            {formatCurrency(totalFCFF)}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Anos Positivos</div>
          <div className="text-2xl font-bold mt-1 text-green-600">
            {positiveFCFFCount}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Anos Negativos</div>
          <div className="text-2xl font-bold mt-1 text-red-600">
            {negativeFCFFCount}
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.id === 'label' && 'w-[220px] min-w-[200px]',
                      header.id !== 'label' && 'w-[110px] min-w-[100px] text-right',
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
    </div>
  );
}
