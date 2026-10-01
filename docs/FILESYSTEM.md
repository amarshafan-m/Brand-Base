# Brand Base Filesystem Architecture

## Core Philosophy

Brand Base utilizes a strict local-first paradigm backed by Adobe UXP's `localFileSystem` APIs. Persistence operates completely offline with no implicit cloud dependencies.

### 1. Safety by Design
Brand Base strictly enforces **COPY-only** semantics when bridging files from the host OS into the Brand Library. 
- Original user source files are NEVER modified, moved, renamed, or deleted. 
- All external binaries are copied into `brands/<brand-id>/<category>/<safe-name>`.
- Deleting an asset removes its metadata reference. The underlying binary is deliberately left as an `ORPHAN` rather than deleted, guaranteeing no accidental data loss.

### 2. Consistency States
Brand Base acknowledges the risk of incomplete filesystem operations (e.g. power loss during import). The `AssetIntegrityService` maps the library into three explicit states:
- **HEALTHY**: Asset metadata exists, and the physical binary file is present.
- **BROKEN**: Asset metadata exists, but the physical binary is missing. The UI preserves the metadata safely but marks the asset as unavailable, allowing safe cleanup.
- **ORPHAN**: A physical binary exists in the library, but no metadata tracks it. (Commonly occurs during partial import failure, or post-deletion). Brand Base **does not automatically delete orphan binaries.**

### 3. Partial Import Behavior
Import relies on two sequential physical operations:
1. Copy the source binary into the Library.
2. Mutate and persist `assets.json`.

If Step 1 succeeds but Step 2 fails, the application correctly isolates the error to the specific file. The UI does not simulate a success. The resulting file safely falls back to an `ORPHAN` state, discoverable by integrity checks.
