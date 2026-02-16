'use client';

import { useRef, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface PremiseInputProps {
  value: number | null;
  onChange: (value: number) => void;
  onBlur?: () => void;
  disabled?: boolean;
  tabIndex?: number;
  className?: string;
}

/**
 * Input não-controlado para premissas de projeção.
 * Usa defaultValue + key para evitar re-renders do React durante foco/digitação,
 * prevenindo loops de unmount/remount causados por react-table.
 * Só dispara onChange no blur, após validação.
 */
export function PremiseInput({
  value,
  onChange,
  onBlur,
  disabled = false,
  tabIndex,
  className,
}: PremiseInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const formatted = value != null ? value.toFixed(2) : '0.00';

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(',', '.');
    const numValue = parseFloat(raw);
    if (!isNaN(numValue)) {
      const clamped = Math.max(0, Math.min(100, numValue));
      onChange(clamped);
      // Atualiza o valor exibido no input após blur
      e.target.value = clamped.toFixed(2);
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
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      if (inputRef.current) {
        inputRef.current.value = formatted;
      }
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative inline-flex items-center">
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
        aria-label="Taxa percentual"
      />
      <span className="ml-1 text-xs text-muted-foreground">%</span>
    </div>
  );
}
