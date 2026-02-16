'use client';

import { useState, useRef, KeyboardEvent } from 'react';
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
  const [editingValue, setEditingValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Display: valor formatado quando não está editando, input bruto quando está
  const displayValue = isEditing
    ? editingValue
    : (value != null ? value.toFixed(2) : '0.00');

  const handleFocus = () => {
    setIsEditing(true);
    setEditingValue(value != null ? value.toString() : '0');
  };

  const handleBlur = () => {
    setIsEditing(false);

    const numValue = parseFloat(editingValue);
    if (!isNaN(numValue)) {
      const clamped = Math.max(0, Math.min(100, numValue));
      onChange(clamped);
    }

    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleaned = rawValue.replace(/[^\d.,]/g, '').replace(',', '.');
    setEditingValue(cleaned);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setEditingValue(value != null ? value.toString() : '0');
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
