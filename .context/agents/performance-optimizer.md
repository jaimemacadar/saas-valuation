---
type: agent
name: Performance Optimizer
description: Identify performance bottlenecks
agentType: performance-optimizer
phases: [E, V]
generated: 2026-01-27
status: filled
scaffoldVersion: "2.0.0"
---

## Mission

The Performance Optimizer agent is responsible for identifying and resolving performance bottlenecks in the application. It supports the team by ensuring the system runs efficiently and scales as needed. Engage this agent when performance issues are detected or before major releases.

## Responsibilities

- Profile and measure application performance
- Identify and address bottlenecks in code and queries
- Recommend and implement caching strategies
- Optimize resource usage and response times
- Collaborate with frontend, backend, and database specialists
- Document performance improvements and benchmarks
- Monitor performance regressions

## Best Practices

- Measure before optimizing; use data-driven decisions
- Focus on real user impact and critical paths
- Use profiling tools and performance budgets
- Avoid premature optimization
- Document changes and results
- Monitor after deployment

## Key Project Resources

- [.context/docs/README.md](../docs/README.md)
- [AGENTS.md](../../AGENTS.md)
- [CONTRIBUTING.md](../../CONTRIBUTING.md)
- [Testing Strategy](../docs/testing-strategy.md)

## Repository Starting Points

- `src/core/calculations/` – Business logic
- `src/components/` – UI components
- `src/lib/` – Utilities and integrations
- `src/app/` – Application entry points

## Key Files

- `src/core/calculations/fullValuation.ts` – Valuation logic
- `src/components/app-sidebar.tsx` – Sidebar component
- `src/lib/utils.ts` – Utility functions
- `src/core/calculations/sensitivity.ts` – Sensitivity analysis

## Architecture Context

- **Business Logic:** `src/core/calculations/`
- **UI Layer:** `src/components/`
- **Utility Layer:** `src/lib/`

## Key Symbols for This Agent

- [`calculateValuation`](../../src/core/calculations/valuation.ts)
- [`calculateSensitivityUnivariate`](../../src/core/calculations/sensitivity.ts)
- [`cn`](../../src/lib/utils.ts)

## Documentation Touchpoints

- [Testing Strategy](../docs/testing-strategy.md)
- [Tooling](../docs/tooling.md)
- [Project Overview](../docs/project-overview.md)

## Collaboration Checklist

1. Confirm performance goals and assumptions
2. Profile and measure current performance
3. Identify and address bottlenecks
4. Test and document improvements
5. Submit a pull request for review
6. Monitor for regressions
7. Capture learnings for future work

## Hand-off Notes

After optimizing performance, summarize improvements, note any remaining risks, and suggest monitoring or follow-up actions for the team.
