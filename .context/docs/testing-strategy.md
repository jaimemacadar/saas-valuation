---
type: doc
name: testing-strategy
description: Test frameworks, patterns, coverage requirements, and quality gates
category: testing
generated: 2026-01-27
status: unfilled
scaffoldVersion: "2.0.0"
---

## Testing Strategy

Quality is maintained through automated tests, code reviews, and continuous integration. All business logic and calculations are covered by unit and integration tests. Contributors are expected to write and maintain tests for new features and bug fixes.

## Test Types

- **Unit**: Jest, files named `*.test.ts` in `src/core/calculations/` and `src/lib/actions/`
- **Integration**: Jest, scenarios covering API endpoints and multi-module flows
- **E2E**: (Not implemented) — future support planned

## Running Tests

- All tests: `npm run test`
- Watch mode: `npm run test -- --watch`
- Coverage: `npm run test -- --coverage`

## Quality Gates

- Minimum 80% code coverage required for merges
- All code must pass ESLint and Prettier checks before merging

## Troubleshooting

If tests are flaky or fail due to environment issues, clear caches and reinstall dependencies. For persistent issues, consult the team or review recent changes.

---

See also: [Development Workflow](./development-workflow.md)
