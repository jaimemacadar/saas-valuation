'use client';

import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { DRECalculated, DREProjectionInputs } from '@/core/types';
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
  projectionInputs?: DREProjectionInputs[];
  modelId?: string;
  onProjectionChange?: (data: DREProjectionInputs[]) => void;
}

type DRERowData = {
  label: string;
  type: 'header' | 'value' | 'subtotal' | 'total' | 'premise';
  field: string;
  values: Record<string, number | null>;
  isMargin?: boolean;
  premiseField?: keyof DREProjectionInputs;
  premiseTooltip?: string;
};

export function DRETable({
  data,
  showMargins = true,
  projectionInputs,
  modelId,
  onProjectionChange
}: DRETableProps) {
  // Helper para extrair valores de premissa
  const getPremiseValues = (field: keyof DREProjectionInputs): Record<string, number | null> => {
    if (!projectionInputs) return {};
    return Object.fromEntries(
      projectionInputs.map((p) => [p.year, p[field] as number])
    );
  };

  // Constrói as linhas da tabela com premissas intercaladas
  const rows: DRERowData[] = [
    {
      label: 'Receita Bruta',
      type: 'value',
      field: 'receita',
      values: Object.fromEntries(data.map((d) => [d.year, d.receitaBruta])),
    },
    ...(projectionInputs ? [{
      label: '↳ Taxa de crescimento',
      type: 'premise' as const,
      field: 'receitaBrutaGrowth',
      premiseField: 'receitaBrutaGrowth' as keyof DREProjectionInputs,
      premiseTooltip: '% crescimento sobre receita bruta do ano anterior',
      values: getPremiseValues('receitaBrutaGrowth'),
    }] : []),
    {
      label: '(-) Impostos sobre Vendas',
      type: 'value',
      field: 'impostos',
      values: Object.fromEntries(data.map((d) => [d.year, d.impostosEDevolucoes * -1])),
    },
    ...(projectionInputs ? [{
      label: '↳ Taxa sobre receita bruta',
      type: 'premise' as const,
      field: 'impostosEDevolucoesRate',
      premiseField: 'impostosEDevolucoesRate' as keyof DREProjectionInputs,
      premiseTooltip: '% sobre Receita Bruta',
      values: getPremiseValues('impostosEDevolucoesRate'),
    }] : []),
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
    ...(projectionInputs ? [{
      label: '↳ Taxa CMV',
      type: 'premise' as const,
      field: 'cmvRate',
      premiseField: 'cmvRate' as keyof DREProjectionInputs,
      premiseTooltip: '% sobre Receita Líquida',
      values: getPremiseValues('cmvRate'),
    }] : []),
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
    ...(projectionInputs ? [{
      label: '↳ Taxa despesas operacionais',
      type: 'premise' as const,
      field: 'despesasOperacionaisRate',
      premiseField: 'despesasOperacionaisRate' as keyof DREProjectionInputs,
      premiseTooltip: '% sobre Receita Líquida',
      values: getPremiseValues('despesasOperacionaisRate'),
    }] : []),
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
    ...(projectionInputs ? [{
      label: '↳ Taxa IR/CSLL',
      type: 'premise' as const,
      field: 'irCSLLRate',
      premiseField: 'irCSLLRate' as keyof DREProjectionInputs,
      premiseTooltip: '% sobre LAIR',
      values: getPremiseValues('irCSLLRate'),
    }] : []),
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
    ...(projectionInputs ? [{
      label: '↳ Taxa de dividendos',
      type: 'premise' as const,
      field: 'dividendosRate',
      premiseField: 'dividendosRate' as keyof DREProjectionInputs,
      premiseTooltip: '% sobre Lucro Líquido',
      values: getPremiseValues('dividendosRate'),
    }] : []),
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
              rowType === 'subtotal' && 'font-semibold',
              rowType === 'premise' && 'text-xs text-muted-foreground pl-4'
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
              rowType === 'premise' && 'text-xs',
              value !== null && value < 0 && 'text-red-600'
            )}
          >
            {rowType === 'premise'
              ? value !== null ? formatPercentage(value / 100) : '—'
              : value !== null
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

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum dado de DRE disponível
      </div>
    );
  }

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
                row.original.type === 'subtotal' && 'bg-muted/30',
                row.original.type === 'premise' && 'bg-blue-50/50 dark:bg-blue-950/20'
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
