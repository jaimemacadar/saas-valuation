// src/types/index.ts
export * from "./financial";
export * from "./company";
export * from "./valuation";
export * from "./user";

// Common types
export interface CalculationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ResponseMeta {
  page?: number;
  perPage?: number;
  total?: number;
  timestamp: Date;
}

export interface PaginationParams {
  page: number;
  perPage: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type Status = "idle" | "loading" | "success" | "error";
