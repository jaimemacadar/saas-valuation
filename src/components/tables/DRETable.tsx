'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { Loader2, Check } from 'lucide-react';
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
import { PremiseInput } from './PremiseInput';
import { useDREProjectionPersist } from '@/hooks/useDREProjectionPersist';

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
  // State local de premissas para UX responsiva
  const [localProjections, setLocalProjections] = useState<DREProjectionInputs[]>(
    projectionInputs || []
  );

  // Hook de persistência com debounce — API imperativa (save chamado explicitamente)
  const { isSaving, lastSavedAt, save } = useDREProjectionPersist({
    modelId: modelId || '',
    debounceMs: 800,
  });

  // Helper para extrair valores de premissa
  const getPremiseValues = (field: keyof DREProjectionInputs): Record<string, number | null> => {
    if (!localProjections || localProjections.length === 0) return {};
    return Object.fromEntries(
      localProjections.map((p) => [p.year, p[field] as number])
    );
  };

  // Handler para atualizar premissas
  const handlePremiseChange = (year: number, field: keyof DREProjectionInputs, value: number) => {
    const updated = localProjections.map((p) =>
      p.year === year ? { ...p, [field]: value } : p
    );
    setLocalProjections(updated);
    onProjectionChange?.(updated);

    // Dispara save com debounce
    if (modelId) {
      save(updated);
    }
  };

  // Constrói as linhas da tabela com premissas intercaladas
  const rows: DRERowData[] = [
    {
      label: 'Receita Bruta',
      type: 'value',
      field: 'receita',
      values: Object.fromEntries(data.map((d) => [d.year, d.receitaBruta])),
    },
    ...(projectionInputs && projectionInputs.length > 0 ? [{
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
    ...(projectionInputs && projectionInputs.length > 0 ? [{
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
    ...(projectionInputs && projectionInputs.length > 0 ? [{
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
    ...(projectionInputs && projectionInputs.length > 0 ? [{
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
    ...(projectionInputs && projectionInputs.length > 0 ? [{
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
    ...(projectionInputs && projectionInputs.length > 0 ? [{
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
        const premiseField = row.original.premiseField;

        // Renderiza input editável para premissas
        if (rowType === 'premise' && premiseField) {
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
                onChange={(newValue) => handlePremiseChange(yearData.year, premiseField, newValue)}
                disabled={!modelId}
              />
            </div>
          );
        }

        // Renderiza valores calculados (read-only)
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
      {modelId && projectionInputs && projectionInputs.length > 0 && (
        <div className="flex items-center justify-end text-sm text-muted-foreground">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : lastSavedAt ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span>Salvo às {lastSavedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </>
          ) : null}
        </div>
      )}

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
    </div>
  );
}
