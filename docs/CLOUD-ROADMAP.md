# Cloud-Ready Roadmap

## Current release boundary

The initial Brand Base release is offline and local-first. It requires no account, server, subscription, or cloud storage. Phase 0 adds no network service, sync job, credential store, or cloud repository.

## Extension point

Pages call services, and services depend on repository interfaces. The local implementations are the only concrete repositories in the first release. A later cloud release can add `CloudAssetRepository`, `CloudBrandRepository`, `CloudColorRepository`, `CloudTypographyRepository`, and `CloudPackageRepository` behind the same interfaces.

## Future flow

```text
local metadata/cache ↔ sync queue ↔ sync service ↔ Brand Base API
                                           ↙              ↘
                                      PostgreSQL      object storage / CDN
```

Binary creative media is stored as a file reference plus checksum and version metadata. It must not be stored in PostgreSQL. A future provider can be local storage, customer-owned storage, S3-compatible storage, Google Drive, Dropbox, OneDrive, or Brand Base cloud.

## Future states

The data layer will reserve these sync states without implementing their behavior: `local-only`, `syncing`, `synced`, `remote-updated`, `conflict`, and `error`.

## Deferred concerns

Organizations, teams, roles, permissions, shared brands, asset locking, approvals, audit logs, comments, semantic search, and automated compliance are intentionally out of scope. Their future introduction must not bypass repository interfaces or mutate local binary files without an explicit user action.
