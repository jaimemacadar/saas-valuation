"use client";

import * as React from "react";
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
          value={formatInputNumber(value)}
          onChange={(e) => onChange(e.target.value)}
          className="pl-8 h-9 text-right"
          required={required}
          disabled={disabled}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
