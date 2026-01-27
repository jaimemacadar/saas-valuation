---
type: doc
name: glossary
description: Project terminology, type definitions, domain entities, and business rules
category: glossary
generated: 2026-01-27
status: unfilled
scaffoldVersion: "2.0.0"
---

## Glossary & Domain Concepts

**SaaS Valuation**: A web application for modeling, analyzing, and valuing SaaS businesses using financial and operational data.

**Supabase**: Backend-as-a-service platform providing authentication, database, and storage.

**Valuation Model**: A set of assumptions and calculations used to estimate the value of a SaaS company.

**DRE (Demonstração do Resultado do Exercício)**: Income statement, a financial report showing revenues, expenses, and profit.

**Balance Sheet**: Financial statement showing assets, liabilities, and equity.

**FCFF (Free Cash Flow to Firm)**: Cash flow available to all capital providers after operating expenses and investments.

**WACC (Weighted Average Cost of Capital)**: Average rate a company is expected to pay to finance its assets.

**Sensitivity Analysis**: Technique to determine how different values of an input affect a particular output.

## Type Definitions

- [ValuationModel](../../src/types/valuation.ts#L3)
- [DCFAssumptions](../../src/types/valuation.ts#L19)
- [DCFResult](../../src/types/valuation.ts#L30)
- [User](../../src/types/user.ts#L2)
- [Company](../../src/types/company.ts#L2)
- [BalanceSheet](../../src/types/financial.ts#L23)
- [CalculationResult](../../src/types/index.ts#L8)
- [ApiResponse](../../src/types/index.ts#L14)
- [AuthSession](../../src/types/user.ts#L39)

## Enumerations

- [ValuationMethod](../../src/types/valuation.ts#L17)
- [UserRole](../../src/types/user.ts#L13)
- [SubscriptionTier](../../src/types/user.ts#L15)
- [Status](../../src/types/index.ts#L41)
- [Period](../../src/types/financial.ts#L65)
- [CompanySector](../../src/types/company.ts#L38)

## Core Terms

- **Model**: A saved set of company data and assumptions for valuation.
- **Assumptions**: Key variables and parameters used in financial models.
- **Projection**: Forecast of future financial results.
- **Inputs**: User-provided or calculated data used in models.
- **Result**: Output of a calculation or valuation process.

## Acronyms & Abbreviations

- **DRE**: Demonstração do Resultado do Exercício (Income Statement)
- **FCFF**: Free Cash Flow to Firm
- **WACC**: Weighted Average Cost of Capital

## Personas / Actors

- **Founder**: Wants to estimate company value for fundraising or exit.
- **Investor**: Evaluates SaaS companies for investment opportunities.
- **Analyst**: Runs scenarios and sensitivity analyses.

---

See also: [Project Overview](./project-overview.md)
