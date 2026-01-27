---
type: doc
name: development-workflow
description: Day-to-day engineering processes, branching, and contribution guidelines
category: workflow
generated: 2026-01-27
status: unfilled
scaffoldVersion: "2.0.0"
---

## Development Workflow

The SaaS Valuation repository follows a modern, collaborative workflow to ensure code quality and rapid iteration. Developers work on feature branches, submit pull requests for review, and rely on automated tests to maintain stability. All contributions are expected to follow the documented conventions and best practices.

## Branching & Releases

- **Branching Model**: Trunk-based development on `main` with short-lived feature branches.
- **Release Cadence**: Releases are cut from `main` as needed; no strict schedule.
- **Tagging**: Semantic versioning tags (e.g., `v1.2.0`) are used for releases.

## Local Development

- Install dependencies: `npm install`
- Run development server: `npm run dev`
- Build for production: `npm run build`
- Run tests: `npm run test`

## Code Review Expectations

All code changes must be submitted via pull request and reviewed by at least one other contributor. Reviewers check for code quality, adherence to conventions, test coverage, and security considerations. See [AGENTS.md](../../AGENTS.md) for agent collaboration and review tips.

## Onboarding Tasks

New contributors should start by reading the [Project Overview](./project-overview.md) and [Architecture Notes](./architecture.md). Look for issues labeled "good first issue" or consult the team for onboarding guidance.

---

See also: [Testing Strategy](./testing-strategy.md), [Tooling](./tooling.md)
