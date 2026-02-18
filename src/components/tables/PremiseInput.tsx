'use client';

import { useRef, KeyboardEvent, useState, forwardRef, useImperativeHandle } from 'react';
import { ChevronsRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PremiseInputProps {
  value: number | null;
  onChange: (value: number) => void;
  onBlur?: () => void;
  disabled?: boolean;
  tabIndex?: number;
  className?: string;
  showCopyRight?: boolean;
  onCopyRight?: () => void;
  showTrend?: boolean;
  onApplyTrend?: (startValue: number, endValue: number) => void;
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
  onNavigateDown?: () => void;
  /** Valor mínimo aceito (padrão: 0) */
  min?: number;
  /** Valor máximo aceito (padrão: 100) */
  max?: number;
  /** Unidade exibida após o input (padrão: "%") */
  unit?: string;
  /** Casas decimais exibidas (padrão: 2) */
  decimals?: number;
}

/**
 * Input não-controlado para premissas de projeção.
 * Usa defaultValue + key para evitar re-renders do React durante foco/digitação,
 * prevenindo loops de unmount/remount causados por react-table.
 * Só dispara onChange no blur, após validação.
 */
export const PremiseInput = forwardRef<HTMLInputElement, PremiseInputProps>(function PremiseInput(
  {
    value,
    onChange,
    onBlur,
    disabled = false,
    tabIndex,
    className,
    showCopyRight = false,
    onCopyRight,
    showTrend = false,
    onApplyTrend,
    onNavigateNext,
    onNavigatePrevious,
    onNavigateDown,
    min = 0,
    max = 100,
    unit = '%',
    decimals = 2,
  },
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [startValue, setStartValue] = useState('');
  const [endValue, setEndValue] = useState('');

  // Expõe o input element via ref
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  const formatted = value != null ? value.toFixed(decimals) : (0).toFixed(decimals);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(',', '.');
    const numValue = parseFloat(raw);
    if (!isNaN(numValue)) {
      const clamped = Math.max(min, Math.min(max, numValue));
      onChange(clamped);
      // Atualiza o valor exibido no input após blur
      e.target.value = clamped.toFixed(decimals);
    } else {
      // Valor inválido: restaura o valor original
      e.target.value = formatted;
    }
    onBlur?.();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Seleciona todo o texto ao focar para facilitar edição
    e.target.select();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      inputRef.current?.blur();
      if (e.shiftKey) {
        onNavigatePrevious?.();
      } else {
        onNavigateNext?.();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
      onNavigateDown?.();
    } else if (e.key === 'Escape') {
      if (inputRef.current) {
        inputRef.current.value = formatted;
      }
      inputRef.current?.blur();
    }
  };

  const handleApplyTrend = () => {
    const start = parseFloat(startValue.replace(',', '.'));
    const end = parseFloat(endValue.replace(',', '.'));

    if (!isNaN(start) && !isNaN(end) && onApplyTrend) {
      const clampedStart = Math.max(min, Math.min(max, start));
      const clampedEnd = Math.max(min, Math.min(max, end));
      onApplyTrend(clampedStart, clampedEnd);
      setIsPopoverOpen(false);
      setStartValue('');
      setEndValue('');
    }
  };

  return (
    <div className="relative inline-flex items-center gap-1">
      <input
        ref={inputRef}
        key={formatted}
        type="text"
        inputMode="decimal"
        defaultValue={formatted}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        tabIndex={tabIndex}
        className={cn(
          'w-20 h-7 px-2 text-xs text-right',
          'border border-input rounded-md',
          'bg-background',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
          'transition-colors',
          className
        )}
        aria-label={`Valor em ${unit}`}
      />
      <span className="text-xs text-muted-foreground">{unit}</span>

      {showCopyRight && onCopyRight && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onCopyRight}
                disabled={disabled}
                aria-label="Copiar para todos os anos"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copiar para todos os anos</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {showTrend && onApplyTrend && (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={disabled}
                    aria-label="Aplicar tendência"
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Aplicar tendência</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Aplicar Tendência</h4>
                <p className="text-xs text-muted-foreground">
                  Define valores inicial e final para interpolação linear entre os anos.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="start-value" className="text-xs">
                    Valor inicial (%)
                  </Label>
                  <Input
                    id="start-value"
                    type="text"
                    inputMode="decimal"
                    placeholder="Ex: 5.0"
                    value={startValue}
                    onChange={(e) => setStartValue(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="end-value" className="text-xs">
                    Valor final (%)
                  </Label>
                  <Input
                    id="end-value"
                    type="text"
                    inputMode="decimal"
                    placeholder="Ex: 15.0"
                    value={endValue}
                    onChange={(e) => setEndValue(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setStartValue('');
                    setEndValue('');
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApplyTrend}
                  disabled={!startValue || !endValue}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
});
