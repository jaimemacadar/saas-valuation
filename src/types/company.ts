// src/types/company.ts
export interface Company {
  id: string;
  name: string;
  ticker?: string;
  sector?: string;
  industry?: string;
  country?: string;
  currency: string;
  description?: string;
  foundedYear?: number;
  employeeCount?: number;
  website?: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface CompanyCreate {
  name: string;
  ticker?: string;
  sector?: string;
  industry?: string;
  country?: string;
  currency: string;
  description?: string;
  foundedYear?: number;
  employeeCount?: number;
  website?: string;
  logo?: string;
}

export interface CompanyUpdate extends Partial<CompanyCreate> {
  id: string;
}

export type CompanySector =
  | "Technology"
  | "Healthcare"
  | "Finance"
  | "Consumer"
  | "Industrial"
  | "Energy"
  | "Materials"
  | "Utilities"
  | "Real Estate"
  | "Communications"
  | "Other";
