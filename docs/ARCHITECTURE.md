# Brand Base Architecture

## Scope

Brand Base is a local-first Adobe Premiere Pro UXP panel. It has no WebView, hybrid native component, account requirement, cloud dependency, or CEP compatibility layer. The Phase 0 scaffold uses React 19, TypeScript, Vite, Sass, and the Bolt UXP build integration.

## Dependency direction

```text
React UI (components, layouts, pages, dialogs, hooks)
        ↓
application services
        ↓
repository interfaces
        ↓
in-memory repositories (Phase 2)
```

The future cloud path extends the repository layer rather than changing pages or components:

```text
local repository + cloud repository → sync service → Brand Base API
```

## Rules

- React components do not call `require("uxp")`, `require("premierepro")`, persistence, or network APIs.
- Services own workflows, validation, error translation, logging, and capability checks.
- Repository interfaces describe data operations; local implementations own tokens, JSON metadata, and file-entry handling.
- The Premiere integration is isolated under `src/premiere/`. Nothing outside that layer imports the Premiere module.
- Persistent application data is separate from transient UI state. Stores may cache view state and loaded records, but persistence still flows through services and repositories.
- Asset files stay on disk; JSON stores metadata and references only.

## Planned source layout

Phase 1+ will add only folders that have a concrete owner:

```text
src/
  components/ layouts/ pages/ dialogs/
  hooks/ stores/
  models/ types/ utils/
  services/ repositories/ storage/ filesystem/
  premiere/ sync/
```

The Phase 2 implementation now has platform-independent `src/domain/`, `src/repositories/`, `src/services/`, and `src/utils/` layers. `src/app/application.ts` composes the single in-memory application container; React hooks load data from its services. No component constructs a repository directly.

Phase 3 will replace the composition's in-memory implementations with UXP filesystem repositories while retaining the same repository contracts and service APIs. The existing `src/api/` directory remains the Bolt scaffold adapter boundary; it is not part of the domain/data layer.

## Runtime boundaries

- UXP panel UI: React renders directly in the UXP panel.
- Local storage: UXP `storage.localFileSystem` uses entry objects and persisted user-granted access tokens.
- Premiere: `require("premierepro")` is used only after a runtime capability check.
- Network: no production Brand Base feature depends on network access. The manifest's localhost WebSocket permission exists solely for Bolt development hot reload.

## Scalability decisions

The metadata index will be loaded once, held in memory, and updated on successful repository writes. Search, filtering, sorting, recent activity, and duplicate detection operate on that index rather than rescanning the library on every interaction. Future phases will add pagination, thumbnail cache ownership, and virtualization when the asset views are introduced.

## Phase 2 composition

- Domain models, validation, errors, schema constants, and migrations are pure TypeScript and do not import React, UXP, filesystem, or Premiere code.
- Services validate inputs and enforce business rules such as one default brand, normalized colors, and unique package asset references.
- In-memory repositories clone records at their boundaries so callers cannot mutate repository state indirectly.
- Seed records are created exclusively through services by `seedDevelopmentData()`. They run only in the Bolt development mode and are never persistent production data.
