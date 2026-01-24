---
type: doc
name: glossary
description: Project terminology, type definitions, domain entities, and business rules
category: glossary
generated: 2026-01-24
status: unfilled
scaffoldVersion: "2.0.0"
---

## Glossary & Domain Concepts

Este documento define a terminologia específica do projeto, tipos de domínio, entidades de negócio e conceitos fundamentais usados na aplicação SaaS Valuation.

## Type Definitions

- [Company](../../src/types/company.ts) — Interface que define dados da empresa
- [Financial](../../src/types/financial.ts) — Interface para dados financeiros
- [Valuation](../../src/types/valuation.ts) — Interface para resultados de valuation
- [User](../../src/types/user.ts) — Interface de usuário

## Enumerations

- Enums relacionados a tipos financeiros e métodos de valuation (ver [src/types/](../../src/types/))

## Core Terms

- **Company**: Entidade empresarial sendo avaliada, com dados cadastrais e histórico
- **Financial Data**: Conjunto de dados financeiros históricos e projetados (receitas, custos, margens)
- **Valuation**: Processo e resultado de avaliação do valor de uma empresa SaaS
- **MRR**: Monthly Recurring Revenue (Receita Recorrente Mensal)
- **ARR**: Annual Recurring Revenue (Receita Recorrente Anual)
- **Churn**: Taxa de cancelamento de clientes
- **LTV**: Lifetime Value (Valor do tempo de vida do cliente)
- **CAC**: Customer Acquisition Cost (Custo de Aquisição de Cliente)

## Acronyms & Abbreviations

- **SaaS**: Software as a Service
- **MVP**: Minimum Viable Product
- **DCF**: Discounted Cash Flow (Fluxo de Caixa Descontado)
- **EBITDA**: Earnings Before Interest, Taxes, Depreciation and Amortization

## Personas / Actors

- **Analista Financeiro**: Profissional que utiliza a plataforma para avaliar empresas SaaS, gerar relatórios e tomar decisões de investimento
- **Empreendedor SaaS**: Fundador ou CEO que busca entender o valor de sua empresa e métricas de performance
- **Investidor**: Pessoa ou fundo que avalia múltiplas empresas para decisões de investimento

## Domain Rules & Invariants

- Dados financeiros devem ser validados quanto a consistência temporal
- Métricas de valuation devem seguir padrões reconhecidos da indústria
- Projeções financeiras requerem pelo menos 12 meses de dados históricos

---

Veja também: [Project Overview](./project-overview.md)
