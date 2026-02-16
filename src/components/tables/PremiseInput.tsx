'use client';

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PremiseInputProps {
  value: number | null;
  onChange: (value: number) => void;
  onBlur?: () => void;
  disabled?: boolean;
  tabIndex?: number;
  className?: string;
}

export function PremiseInput({
  value,
  onChange,
  onBlur,
  disabled = false,
  tabIndex,
  className,
}: PremiseInputProps) {
  const [displayValue, setDisplayValue] = useState(
    value !== null ? value.toFixed(2) : '0.00'
  );
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevValueRef = useRef(value);

  // Sincroniza com mudanças externas do value quando não está focado
  if (value !== prevValueRef.current && !isFocused) {
    prevValueRef.current = value;
  }

  useEffect(() => {
    if (!isFocused && value !== null && value !== prevValueRef.current) {
      setDisplayValue(value.toFixed(2));
      prevValueRef.current = value;
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    // Remove formatação ao focar (só número)
    if (value !== null) {
      setDisplayValue(value.toString());
    }
  };

  const handleBlur = () => {
    setIsFocused(false);

    // Valida e formata
    const numValue = parseFloat(displayValue);
    if (!isNaN(numValue)) {
      const clamped = Math.max(0, Math.min(100, numValue));
      setDisplayValue(clamped.toFixed(2));
      onChange(clamped);
      prevValueRef.current = clamped;
    } else {
      const fallback = value !== null ? value : 0;
      setDisplayValue(fallback.toFixed(2));
      prevValueRef.current = fallback;
    }

    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Permite apenas números, ponto e vírgula
    const cleaned = rawValue.replace(/[^\d.,]/g, '').replace(',', '.');
    setDisplayValue(cleaned);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
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
