"use client";

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatInputNumber, parseInputNumber } from "@/lib/utils/formatters";

interface FinancialInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function FinancialInput({
  id,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "0,00",
  className = "",
}: FinancialInputProps) {
  const [displayValue, setDisplayValue] = useState(() => formatInputNumber(value));
  const [isFocused, setIsFocused] = useState(false);

  // Sincroniza com valor externo apenas quando não está em foco
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatInputNumber(value));
    }
  }, [value, isFocused]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setDisplayValue(raw);
      onChange(raw);
    },
    [onChange]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Formata o valor ao sair do campo
    const parsed = parseInputNumber(displayValue);
    setDisplayValue(formatInputNumber(parsed));
  }, [displayValue]);

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <Label htmlFor={id} className="text-sm whitespace-nowrap">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative w-35">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
          R$
        </span>
        <Input
          id={id}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="pl-8 h-9 text-right"
          required={required}
          disabled={disabled}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
