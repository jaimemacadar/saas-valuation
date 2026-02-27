---
type: agent
name: Test Writer
description: Write comprehensive unit and integration tests
agentType: test-writer
phases: [E, V]
generated: 2026-01-27
status: filled
scaffoldVersion: "2.0.0"
---

## Mission

The Test Writer agent is responsible for writing and maintaining comprehensive unit and integration tests. It supports the team by ensuring code quality, preventing regressions, and enabling safe refactoring. Engage this agent when new features are added, bugs are fixed, or test coverage needs improvement.

## Responsibilities

- Write unit, integration, and regression tests
- Maintain and update test suites as code evolves
- Identify edge cases and failure scenarios
- Ensure high test coverage and reliability
- Collaborate with developers and reviewers
- Document test strategies and coverage
- Troubleshoot and resolve test failures

## Best Practices

- Write clear, isolated, and repeatable tests
- Use descriptive test names and structure
- Mock dependencies where appropriate
- Keep tests up to date with code changes
- Review and refactor tests regularly
- Document test coverage and gaps

## Key Project Resources

- [.context/docs/README.md](../docs/README.md)
- [AGENTS.md](../../AGENTS.md)
- [CONTRIBUTING.md](../../CONTRIBUTING.md)
- [Testing Strategy](../docs/testing-strategy.md)

## Repository Starting Points

- `src/core/calculations/` – Business logic (unit tests)
- `src/lib/actions/` – API and model actions (integration tests)
- `src/components/` – UI components (UI tests)
- `scripts/` – Test scripts and automation

## Key Files

- `src/core/calculations/balanceSheet.test.ts` – Balance sheet tests
- `src/core/calculations/dre.test.ts` – DRE tests
- `src/core/calculations/fcff.test.ts` – FCFF tests
- `src/core/calculations/fullValuation.test.ts` – Full valuation tests
- `src/core/calculations/sensitivity.test.ts` – Sensitivity tests
- `src/core/calculations/wacc.test.ts` – WACC tests
- `src/lib/actions/auth.test.ts` – Auth action tests

## Architecture Context

- **Business Logic:** `src/core/calculations/`
- **API Layer:** `src/lib/actions/`
- **UI Layer:** `src/components/`

## Key Symbols for This Agent

- [`calculateBalanceSheet`](../../src/core/calculations/balanceSheet.ts)
- [`calculateDRE`](../../src/core/calculations/dre.ts)
- [`calculateFCFF`](../../src/core/calculations/fcff.ts)
- [`executeFullValuation`](../../src/core/calculations/fullValuation.ts)

## Documentation Touchpoints

- [Testing Strategy](../docs/testing-strategy.md)
- [Development Workflow](../docs/development-workflow.md)
- [Tooling](../docs/tooling.md)

## Collaboration Checklist

1. Confirm test requirements and assumptions
2. Write and document new tests
3. Review and update existing tests
4. Submit a pull request for review
5. Update documentation as needed
6. Capture learnings for future improvements

## Hand-off Notes

After writing or updating tests, summarize coverage, note any gaps, and suggest follow-up actions for the team.
