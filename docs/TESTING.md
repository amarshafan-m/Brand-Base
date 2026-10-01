# Testing Strategy

## Phase 2 status

Vitest runs the actual pure TypeScript domain/data layer through `npm test`. Coverage includes validation, color conversion and normalization, settings defaults, IDs, dates, migrations, search/filter/sort behavior, in-memory repository lifecycle, default-brand rules, duplicate assets, package reference protection, and color-source-of-truth behavior.

## Test layers for subsequent phases

| Area | Test approach |
| --- | --- |
| Models and migrations | deterministic fixture tests for valid, old, malformed, and future-version data |
| Color utilities | table-driven conversions with tolerances and round-trip checks |
| Search, filters, sort | in-memory fixture index including case, tag, type, date, size, and combined filters |
| Validation and duplicate detection | file metadata fixtures, safe-name/path cases, and checksum collisions |
| Repositories | contract tests run against an in-memory UXP filesystem adapter and UXP integration smoke tests |
| Services | error translation, command orchestration, and no direct UI persistence |
| Premiere adapter | capability-gated integration tests in supported Premiere versions |
| UI | focused interaction and accessibility tests for empty, loading, error, narrow-panel, and confirmation states |

## Required test cases

- A migration is idempotent and never alters media files.
- A package keeps asset references instead of duplicating file data.
- Search is case-insensitive and does not trigger a filesystem scan per keypress.
- A rejected traversal path cannot create or overwrite an entry outside the library.
- Delete, reset, move, restore, and import failure paths produce actionable results.
- Premiere import handles missing project, missing file, unsupported media, unavailable module, denied permission, and API failure.

## Tooling decision

Vitest 3 is pinned as a development-only test runner compatible with this scaffold's existing TypeScript/Node typing stack. Future filesystem tests must use an adapter contract or UXP integration environment rather than Node filesystem calls in application code.
