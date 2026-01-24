---
type: doc
name: security
description: Security policies, authentication, secrets management, and compliance requirements
category: security
generated: 2026-01-24
status: unfilled
scaffoldVersion: "2.0.0"
---

## Security & Compliance Notes

Este documento captura as políticas e proteções que mantêm o projeto seguro e em conformidade com padrões de segurança.

## Authentication & Authorization

- **Identity Provider**: Supabase Auth
- **Token Format**: JWT (JSON Web Tokens)
- **Session Strategy**: Tokens armazenados em cookies HTTP-only
- **Role/Permission Model**: RBAC (Role-Based Access Control) gerenciado pelo Supabase
- **Password Policy**: Mínimo 8 caracteres, implementado pelo Supabase

## Secrets & Sensitive Data

- **Storage**: Variáveis de ambiente (.env.local) nunca comitadas no repositório
- **Supabase Keys**: Chaves públicas (anon key) e privadas (service role key) segregadas
- **Rotation**: Credenciais rotacionadas via dashboard do Supabase
- **Encryption**: Dados sensíveis criptografados em trânsito (HTTPS) e em repouso (Supabase)
- **Data Classification**: Dados financeiros classificados como sensíveis

## Compliance & Policies

- Conformidade com melhores práticas de segurança web (OWASP)
- Dados financeiros tratados com confidencialidade
- Políticas de acesso baseadas em princípio de privilégio mínimo

## Incident Response

- Logs e erros capturados na camada de integração
- Monitoramento via dashboard Supabase
- Contatos e procedimentos de escalação a serem definidos em produção

---

Veja também: [Architecture Notes](./architecture.md)
