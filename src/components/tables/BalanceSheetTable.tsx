'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  ColumnDef,
  flexRender,
  ExpandedState,
} from '@tanstack/react-table';
import { BalanceSheetCalculated } from '@/core/types';
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
import { ChevronRight, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BalanceSheetTableProps {
  data: BalanceSheetCalculated[];
}

type BalanceSheetRowData = {
  label: string;
  type: 'section' | 'item' | 'subtotal' | 'total';
  field?: string; // Campo de referência (não usado diretamente)
  values: Record<string, number | null>;
  subRows?: BalanceSheetRowData[];
};

export function BalanceSheetTable({ data }: BalanceSheetTableProps) {
  const [expanded, setExpanded] = useState<ExpandedState>({});

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
      year.ativoTotal - (year.passivoTotal + year.patrimonioLiquido.total)
    );
    return diff < 0.01; // Tolerância de R$ 0,01
  });

  // Constrói as linhas da tabela com hierarquia
  const rows: BalanceSheetRowData[] = [
    {
      label: 'ATIVO',
      type: 'section',
      values: Object.fromEntries(data.map((d) => [d.year, d.ativoTotal])),
      subRows: [
        {
          label: 'Ativo Circulante',
          type: 'subtotal',
          values: Object.fromEntries(data.map((d) => [d.year, d.ativoCirculante.total])),
          subRows: [
            {
              label: 'Caixa e Equivalentes',
              type: 'item',
              field: 'caixa',
              values: Object.fromEntries(data.map((d) => [d.year, d.ativoCirculante.caixaEquivalentes])),
            },
            {
              label: 'Contas a Receber',
              type: 'item',
              field: 'contasReceber',
              values: Object.fromEntries(data.map((d) => [d.year, d.ativoCirculante.contasReceber])),
            },
            {
              label: 'Estoques',
              type: 'item',
              field: 'estoques',
              values: Object.fromEntries(data.map((d) => [d.year, d.ativoCirculante.estoques])),
            },
          ],
        },
        {
          label: 'Ativo Não Circulante',
          type: 'subtotal',
          values: Object.fromEntries(
            data.map((d) => [d.year, d.ativoTotal - d.ativoCirculante.total])
          ),
          subRows: [
            {
              label: 'Imobilizado',
              type: 'item',
              field: 'imobilizado',
              values: Object.fromEntries(data.map((d) => [d.year, d.ativoRealizavelLP.imobilizado])),
            },
          ],
        },
      ],
    },
    {
      label: 'PASSIVO',
      type: 'section',
      values: Object.fromEntries(data.map((d) => [d.year, d.passivoTotal])),
      subRows: [
        {
          label: 'Passivo Circulante',
          type: 'subtotal',
          values: Object.fromEntries(data.map((d) => [d.year, d.passivoCirculante.total])),
          subRows: [
            {
              label: 'Fornecedores',
              type: 'item',
              field: 'fornecedores',
              values: Object.fromEntries(data.map((d) => [d.year, d.passivoCirculante.fornecedores])),
            },
          ],
        },
        {
          label: 'Passivo Não Circulante',
          type: 'subtotal',
          values: Object.fromEntries(
            data.map((d) => [d.year, d.passivoRealizavelLP.total])
          ),
          subRows: [
            {
              label: 'Empréstimos e Financiamentos LP',
              type: 'item',
              field: 'emprestimosFinanciamentosLP',
              values: Object.fromEntries(
                data.map((d) => [d.year, d.passivoRealizavelLP.emprestimosFinanciamentosLP])
              ),
            },
          ],
        },
      ],
    },
    {
      label: 'PATRIMÔNIO LÍQUIDO',
      type: 'total',
      field: 'patrimonioLiquido',
      values: Object.fromEntries(data.map((d) => [d.year, d.patrimonioLiquido.total])),
    },
  ];

  const columns: ColumnDef<BalanceSheetRowData>[] = [
    {
      accessorKey: 'label',
      header: '',
      cell: ({ row }) => {
        const canExpand = row.getCanExpand();
        const rowType = row.original.type;

        return (
          <div
            className={cn(
              'flex items-center gap-2 min-w-[200px] whitespace-nowrap',
              rowType === 'section' && 'font-bold text-base',
              rowType === 'subtotal' && 'font-semibold',
              rowType === 'total' && 'font-bold',
              rowType === 'item' && 'text-muted-foreground'
            )}
            style={{ paddingLeft: `${row.depth * 1.5}rem` }}
          >
            {canExpand && (
              <button
                onClick={row.getToggleExpandedHandler()}
                className="cursor-pointer"
              >
                {row.getIsExpanded() ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            {row.original.label}
          </div>
        );
      },
    },
    ...data.map((yearData) => ({
      id: `year-${yearData.year}`,
      header: yearData.year === 0 ? 'Ano Base' : `Ano ${yearData.year}`,
      cell: ({ row }: { row: { original: BalanceSheetRowData } }) => {
        const value = row.original.values[yearData.year];
        const rowType = row.original.type;

        return (
          <div
            className={cn(
              'text-right tabular-nums',
              rowType === 'section' && 'font-bold border-t-2 border-t-foreground',
              rowType === 'subtotal' && 'font-semibold border-t',
              rowType === 'total' && 'font-bold border-t-2 border-t-foreground'
            )}
          >
            {value !== null ? formatCurrency(value) : '-'}
          </div>
        );
      },
    })),
  ];

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
                  row.original.type === 'section' && 'bg-muted/50',
                  row.original.type === 'total' && 'bg-muted/50'
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
