# Architectural Decisions

## ADR-001: React in a direct UXP panel

**Decision:** Keep the generated React + TypeScript UXP panel and Bolt Vite build integration.

**Why:** It is already a working non-WebView Premiere scaffold. Replacing it would create migration risk without delivering product value.

## ADR-002: No CEP, hybrid plugin, or WebView

**Decision:** Brand Base is a direct UXP panel only. The manifest has WebView permissions removed and the inactive WebView host source is excluded from compilation.

**Why:** The product brief explicitly excludes these architectures. This also removes unused surface area and dependencies from the Phase 0 configuration.

## ADR-003: Minimum Premiere version 25.6

**Decision:** Set `premierepro` minimum version to 25.6.

**Why:** Adobe documents `Project.getActiveProject`, `Project.getActiveSequence`, and `Project.importFiles` from 25.6. Earlier host versions cannot satisfy the planned first integration reliably.

## ADR-004: Permission-based local storage

**Decision:** Request user-selected filesystem access with `localFileSystem: "request"`, persistent UXP tokens, and entry-based APIs.

**Why:** The product is local-first but should not ask for unrestricted disk access. Node's filesystem module is not part of Brand Base's application architecture.

## ADR-005: Local metadata with repository interfaces

**Decision:** Store metadata JSON locally and abstract it with repository interfaces before building any cloud capability.

**Why:** It enables offline use now while providing a controlled seam for later sync without coupling React UI to persistence.

## ADR-006: Capability-gated Premiere commands

**Decision:** No Premiere-facing action is shown as functional until its current UXP API is documented, wrapped, detected at runtime, and tested.

**Why:** This prevents CEP-era assumptions, fake connection states, and unsupported workflows.

## ADR-007: Interface-first in-memory data layer

**Decision:** Phase 2 services depend on repository contracts and are composed with in-memory repositories in one application container.

**Why:** It makes business rules and UI integration testable now, while allowing Phase 3 to replace only repository implementations with UXP filesystem repositories.

## ADR-008: ISO timestamps, centralized schema version, and pure migrations

**Decision:** Persist dates as ISO 8601 UTC strings, use one `CURRENT_SCHEMA_VERSION`, and migrate plain serializable records through an ordered migration abstraction.

**Why:** Records stay portable across UXP runtime upgrades and can be validated before Phase 3 persistence writes them.

## ADR-009: Development seed through services only

**Decision:** Optional demo data is created through the application container only in development mode.

**Why:** Pages never own mock arrays, and production repositories begin empty until the user creates a local library.
