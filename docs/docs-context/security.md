---
tipo: doc
nome: security
descrição: Políticas de segurança, autenticação, gestão de segredos e requisitos de conformidade
categoria: segurança
gerado: 2026-01-27
status: preenchido
scaffoldVersion: "2.0.0"
---

## Notas de Segurança & Conformidade

O projeto SaaS Valuation aplica boas práticas de segurança em todas as camadas. Todas as trocas de dados usam HTTPS e operações sensíveis são protegidas por autenticação e autorização. O código é revisado para vulnerabilidades e segue padrões de codificação segura.

## Autenticação & Autorização

A autenticação é gerenciada pelo Supabase, usando tokens JWT para sessões. Papéis e permissões de usuários são aplicados na aplicação, com verificações em rotas de API e lógica central. Apenas usuários autenticados acessam endpoints e dados sensíveis.

## Segredos & Dados Sensíveis

Segredos (chaves de API, credenciais de banco) são armazenados em variáveis de ambiente e nunca são versionados. O Supabase gerencia criptografia em repouso e em trânsito. Desenvolvedores devem rotacionar segredos regularmente e evitar logar informações sensíveis.

## Conformidade & Políticas

- GDPR: Dados de usuários tratados conforme regulamentos de privacidade.
- SOC2: Segue boas práticas de segurança e controles operacionais.

## Resposta a Incidentes

Em caso de incidente de segurança, siga o plano de resposta: conter, investigar, remediar e documentar. O Supabase fornece logs de auditoria e controles de acesso para apoiar investigações.

---

Veja também: [Notas de Arquitetura](./architecture.md)
