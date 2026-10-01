BRAND BASE
Professional Brand Asset Management System for Adobe Premiere Pro
===============================================================

PURPOSE
-------

Brand Base is a local-first creative asset management plugin for
Adobe Premiere Pro.

It provides a centralized Brand Library inside Premiere Pro where
creative teams can organize, manage, preview, search and reuse:

• Logos
• Logo variants
• Images
• Video
• Audio
• Music
• SFX
• Graphics
• MOGRTs
• Lower thirds
• Titles
• End cards
• Templates
• Presets
• Brand colors
• Typography
• Brand packages

The plugin separates:

1. Brand Base Library
2. Premiere Pro Project
3. Premiere Pro Timeline

Brand Base owns the reusable brand asset library.

Premiere Pro owns the editing project and timeline.


===============================================================
1. HIGH-LEVEL ARCHITECTURE
===============================================================

                    BRAND BASE
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                        REACT UI                             │
│                                                             │
│ Dashboard                                                   │
│ Asset Library                                               │
│ Brands                                                      │
│ Colors                                                      │
│ Typography                                                  │
│ Audio                                                       │
│ Graphics                                                    │
│ MOGRTs                                                      │
│ Templates                                                   │
│ Presets                                                     │
│ Packages                                                    │
│ Favorites                                                   │
│ Recent                                                      │
│ Settings                                                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION HOOKS / STATE                  │
│                                                             │
│ useApplicationData                                          │
│ useAssetImport                                              │
│ usePremiereContext                                          │
│ usePremiereTimeline                                         │
│ globalRevision / reload synchronization                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION SERVICES                     │
│                                                             │
│ AssetService                                                │
│ BrandService                                                │
│ ColorService                                                │
│ TypographyService                                           │
│ PackageService                                              │
│ RecentService                                               │
│ SettingsService                                             │
│ AssetIntegrityService                                       │
│ AssetImportQueue                                             │
│ FileIdentityService                                         │
│ PremiereTimelineService                                     │
└───────────────────────┬───────────────────┬─────────────────┘
                        │                   │
                        ▼                   ▼
             ┌──────────────────┐   ┌────────────────────────┐
             │ REPOSITORY LAYER │   │ PREMIERE ADAPTER       │
             │                  │   │                        │
             │ AssetRepository  │   │ UxPPremiereAdapter     │
             │ BrandRepository  │   │                        │
             │ ColorRepository  │   │ Adobe Premiere UXP API │
             │ TypographyRepo   │   │                        │
             │ PackageRepo      │   │ Project                │
             │ SettingsRepo     │   │ Sequence               │
             │ RecentRepo       │   │ SequenceEditor         │
             └────────┬─────────┘   └────────────┬───────────┘
                      │                          │
                      ▼                          ▼
             ┌──────────────────┐       ┌────────────────────┐
             │ STORAGE LAYER    │       │ PREMIERE PRO       │
             │                  │       │                    │
             │ UXP Filesystem   │       │ Project            │
             │ Local JSON       │       │ Sequences          │
             │ Brand folders    │       │ Tracks             │
             │ Asset binaries   │       │ Timeline            │
             └──────────────────┘       └────────────────────┘

===============================================================
2. CORE ARCHITECTURAL PRINCIPLE
===============================

The architecture follows strict separation of concerns.

React UI
↓
Application Services
↓
Repository Interfaces
↓
Storage Implementations

Premiere operations follow a separate path:

React UI
↓
Premiere Application Service
↓
Premiere Integration Adapter
↓
Adobe Premiere UXP API
↓
Premiere Pro

The React UI must NEVER directly manipulate:

• UXP filesystem
• Premiere objects
• Premiere timeline
• persistent JSON
• native file paths

All such operations must pass through the appropriate service layer.

===============================================================
3. TECHNOLOGY STACK
===================

Platform:

Adobe Premiere Pro

Extension Technology:

Adobe UXP

Minimum target:

Premiere Pro 25.6+

Frontend:

React
TypeScript

Build:

Vite / Bolt UXP

Plugin ID:

com.brandbase.premiere

Rendering:

React UI inside native UXP panel

WebView:

NOT USED

Hybrid C++:

NOT USED

CEP:

NOT USED

ExtendScript:

NOT USED

Node.js filesystem APIs:

NOT USED inside UXP runtime

===============================================================
4. FRONTEND / UI ARCHITECTURE
=============================

The UI is responsible only for:

• displaying information
• collecting user input
• triggering application actions
• showing loading states
• showing errors
• displaying previews
• displaying Premiere status
• displaying library status

Main UI structure:

App
│
└── AppShell
│
├── Sidebar
│
├── TopBar
│
└── MainContent
│
├── Home
├── Assets
├── Brands
├── Colors
├── Typography
├── Audio
├── Graphics
├── MOGRTs
├── Templates
├── Presets
├── Packages
├── Favorites
├── Recent
└── Settings

===============================================================
5. DASHBOARD ARCHITECTURE
=========================

Dashboard provides a high-level overview of the Brand Library.

Dashboard components:

• Current Brand
• Premiere Project Status
• Active Sequence
• Asset Count
• Brand Count
• Favorite Count
• Recent Assets
• Recently Added
• Quick Import
• Quick Search
• Brand Colors
• Typography Summary
• Storage Usage
• Library Health
• Recent Activity

Example:

┌───────────────────────────────────────────────────────────┐
│ Brand Base                              Premiere Connected │
├───────────────┬───────────────────────────────────────────┤
│               │                                             │
│ Current Brand │        Asset Overview                       │
│               │                                             │
│ ACME          │  24 Assets    6 Brands    12 Favorites    │
│               │                                             │
├───────────────┼───────────────────────────────────────────┤
│               │                                             │
│ Quick Actions │        Recent Assets                       │
│               │                                             │
│ Import Asset  │  Logo   Video   Music   Graphic            │
│ New Brand     │                                             │
│ New Package   │                                             │
│               │                                             │
└───────────────┴───────────────────────────────────────────┘

===============================================================
6. BRAND ARCHITECTURE
=====================

A Brand is the top-level organizational entity.

Brand:

Brand
├── Identity
├── Assets
├── Colors
├── Typography
└── Packages

Example:

ACME CORPORATION
│
├── Logos
├── Images
├── Videos
├── Music
├── SFX
├── Graphics
├── MOGRTs
├── Templates
├── Presets
├── Brand Colors
└── Typography

Brand rules:

• Every asset belongs to a brand.
• Every color belongs to a brand.
• Every typography style belongs to a brand.
• Packages belong to a brand.
• Brands are isolated from each other.
• Only one brand can be the default brand.
• Default brand can change.
• Brands can be archived.
• Archived brands are not deleted permanently.

===============================================================
7. ASSET ARCHITECTURE
=====================

Asset
│
├── Identity
│   ├── id
│   ├── brandId
│   └── name
│
├── File Information
│   ├── extension
│   ├── filePath
│   ├── size
│   └── type
│
├── Metadata
│   ├── originalName
│   ├── description
│   ├── importedAt
│   └── updatedAt
│
├── Organization
│   ├── category
│   ├── tags
│   └── favorite
│
└── Status
├── healthy
├── broken
└── orphan

Supported asset types:

IMAGE
VIDEO
AUDIO
MUSIC
SFX
GRAPHIC
LOGO
MOGRT
TEMPLATE
PRESET
OTHER

===============================================================
8. ASSET IMPORT PIPELINE
========================

User selects:

    IMPORT ASSET
         │
         ▼
 UXP File Picker
         │
         ▼
  File Classification
         │
         ▼
  Active Brand Check
         │
         ▼
   Duplicate Check
         │
         ▼
   User Confirmation
         │
         ▼
   Asset Import Queue
         │
         ▼
   COPY INTO LIBRARY
         │
         ▼
   Metadata Creation
         │
         ▼
   Repository Save
         │
         ▼
   UI Refresh

IMPORTANT:

Source files are COPY-ONLY.

Brand Base never moves or deletes the user's original source file
during normal import.

===============================================================
9. FILE SAFETY ARCHITECTURE
===========================

Source File
│
│ COPY
▼
Brand Base Library
│
▼
Sanitized Filename
│
▼
Brand/category folder

Path safety rules:

• No ../ traversal
• No absolute paths in persistent metadata
• No null-byte filenames
• Filename sanitization
• Library-relative paths
• UXP persistent tokens used for source resolution
• Native paths only at API boundaries

Persistent metadata stores:

brands/acme/logos/acme-primary.png

NOT:

/Users/amarshafan/Desktop/...

===============================================================
10. FILE IDENTITY / DUPLICATE ARCHITECTURE
==========================================

Brand Base intentionally does NOT fake cryptographic checksums.

Current UXP limitation:

SHA-256 content hashing is not relied upon.

Therefore:

FileIdentityService
│
├── filename
├── file size
└── available file metadata
│
▼
potential duplicate
│
▼
User confirmation

Possible duplicate:

┌──────────────────────────────┐
│ Potential Duplicate          │
│                              │
│ Existing: Logo.png           │
│ New:      Logo.png           │
│                              │
│ [Review] [Import Anyway]     │
│ [Cancel]                     │
└──────────────────────────────┘

No silent deduplication.

===============================================================
11. ASSET INTEGRITY ARCHITECTURE
================================

Brand Base maintains metadata separately from physical files.

Integrity states:

HEALTHY
Metadata exists
Binary exists

BROKEN
Metadata exists
Binary missing

ORPHAN
Binary exists
Metadata missing

Integrity scan:

Library
↓
Physical folder scan
↓
Compare against metadata
↓
Classify
├── Healthy
├── Broken
└── Orphan

Integrity scanning is explicit/on-demand.

It does not continuously scan the entire library.

===============================================================
12. DELETE ARCHITECTURE
=======================

Asset delete:

User
↓
Delete Asset
↓
Remove metadata
↓
Keep physical binary

Result:

metadata = deleted
binary = preserved

The binary becomes detectable as:

ORPHAN

Brand delete:

User
↓
Archive Brand
↓
Move brand folder
↓
deleted-<brand-id>-<timestamp>

The binary assets remain recoverable.

===============================================================
13. LOCAL STORAGE ARCHITECTURE
==============================

Brand Base uses the UXP local filesystem.

Storage architecture:

Brand Base Library
│
├── library.json
├── brands.json
├── recent.json
│
└── brands/
│
├── <brand-id>/
│   │
│   ├── metadata.json
│   ├── assets.json
│   ├── colors.json
│   ├── typography.json
│   ├── packages.json
│   │
│   ├── logos/
│   ├── images/
│   ├── video/
│   ├── audio/
│   ├── music/
│   ├── sfx/
│   ├── graphics/
│   ├── mogrts/
│   ├── templates/
│   ├── presets/
│   └── other/
│
└── <brand-id>/

This is a SHARDED DATA MODEL.

Instead of storing the entire application inside one JSON file,
data is separated into manageable files.

===============================================================
14. SAFE WRITE ARCHITECTURE
===========================

Brand Base uses defensive JSON persistence.

Write process:

Application
│
▼
Serialize JSON
│
▼
Validate serialized data
│
▼
Write .tmp
│
▼
Move existing file → .bak
│
▼
Move .tmp → final
│
▼
Best-effort cleanup .bak

On startup:

Library
↓
Check recovery files
↓
Recover when necessary
↓
Validate library
↓
Load application

IMPORTANT:

UXP does not provide the same atomic rename guarantees as a
traditional desktop filesystem.

Brand Base therefore does NOT falsely claim atomic writes.

===============================================================
15. REPOSITORY ARCHITECTURE
===========================

The application does not depend directly on UXP filesystem code.

Instead:

Application Service
│
▼
Repository Interface
│
├───────────────┐
▼               ▼
InMemory Repository   UXP Repository

Interfaces:

AssetRepository
BrandRepository
ColorRepository
TypographyRepository
PackageRepository
SettingsRepository
RecentRepository
BackupRepository

This makes the system replaceable and testable.

===============================================================
16. APPLICATION SERVICE ARCHITECTURE
====================================

Services contain business logic.

AssetService
├── create
├── update
├── delete
├── search
├── filter
├── favorite
└── duplicate validation

BrandService
├── create
├── update
├── archive
├── setDefault
└── validation

ColorService
├── create
├── update
├── normalize
└── validation

TypographyService
├── create
├── update
└── validation

PackageService
├── create
├── update
└── manage assets

RecentService
├── viewed
├── imported
└── recent list

SettingsService
├── load
├── update
└── persistence

AssetIntegrityService
├── scan
├── detect broken
└── detect orphan

AssetImportQueue
├── queue files
├── process independently
├── pause for duplicate confirmation
└── resume

===============================================================
17. PREMIERE PRO INTEGRATION ARCHITECTURE
=========================================

Brand Base does NOT treat Premiere Pro as its database.

Instead:

Brand Base Library
│
│ reusable assets
▼
Premiere Integration
│
▼
Premiere Pro

Premiere owns:

• Project
• Project Items
• Sequences
• Tracks
• Timeline
• Playhead
• Editing state

Brand Base owns:

• Brands
• Asset library
• Metadata
• Brand colors
• Typography
• Packages
• Asset organization

===============================================================
18. PREMIERE ADAPTER
====================

React must never directly call Adobe Premiere APIs.

Instead:

React
↓
Premiere Service
↓
UxPPremiereAdapter
↓
Adobe Premiere UXP API

Adapter responsibilities:

• get active project
• get active sequence
• inspect tracks
• resolve project items
• import supported assets
• communicate with timeline services

===============================================================
19. PREMIERE CONTEXT
====================

Brand Base displays:

Premiere Status

Examples:

● Project: Marketing Campaign
Sequence: Main Edit

or:

○ No Premiere Project Open

Context can be refreshed manually.

The application avoids aggressive polling.

===============================================================
20. TIMELINE ARCHITECTURE
=========================

Timeline operations are isolated inside:

PremiereTimelineService

Flow:

Asset
↓
Resolve physical file
↓
Resolve Premiere Project
↓
Resolve ProjectItem
↓
Resolve active Sequence
↓
Resolve target track
↓
Resolve playhead/custom position
↓
Create Premiere Action
↓
Insert / Overwrite
↓
Execute Premiere transaction

Supported timeline operations:

INSERT

OVERWRITE

Conceptually:

                Premiere Timeline
                       │
      ┌────────────────┼────────────────┐
      │                │                │
    Video            Audio            Other
      │                │
      ▼                ▼
   Track V1          Track A1
      │                │
      └────────┬───────┘
               ▼
           Asset

Timeline placement UI:

┌──────────────────────────────────────┐
│ Place Asset                           │
│                                      │
│ Project       Marketing Video        │
│ Sequence      Main Edit              │
│ Position      Playhead               │
│ Video Track   V2                     │
│ Audio Track   A2                     │
│                                      │
│ [Insert]             [Overwrite]     │
└──────────────────────────────────────┘

===============================================================
21. PREMIERE TIMELINE SAFETY
============================

Immediately before timeline modification:

1. Re-read active Premiere project.
2. Re-read active sequence.
3. Resolve the project item again.
4. Validate target track.
5. Validate timeline position.
6. Execute operation.
7. Handle failure safely.

Reason:

React state can become stale if the user changes the Premiere
project or sequence while Brand Base is open.

===============================================================
22. REACT STATE ARCHITECTURE
============================

Brand Base has two different state domains.

LOCAL LIBRARY STATE
│
├── brands
├── assets
├── colors
├── typography
├── packages
├── settings
└── recent

PREMIERE STATE
│
├── project
├── sequence
├── tracks
├── playhead
└── timeline context

These states must remain conceptually separate.

===============================================================
23. GLOBAL STATE SYNCHRONIZATION
================================

Brand Base uses a lightweight revision mechanism.

Example:

Repository change
↓
Service completes
↓
triggerGlobalReload()
↓
revision++
↓
React hooks refresh

This avoids:

• recreating the application container
• unnecessary filesystem traversal
• infinite React loops
• stale brand state

===============================================================
24. ERROR ARCHITECTURE
======================

Errors are domain-specific.

Examples:

NotFoundError
ValidationError
DuplicateError
PotentialDuplicateError
LibraryInitializationError
LibraryValidationError
AssetIntegrityError
PremiereIntegrationError

Errors are handled by the appropriate layer.

Example:

Premiere error
↓
Premiere Service
↓
UI-friendly error
↓
Toast / Modal / Status message

===============================================================
25. SETTINGS ARCHITECTURE
=========================

Settings are persistent but separate from assets.

Settings:

General
Appearance
Library
Premiere Pro
Data & Backup
About

Settings flow:

React
↓
SettingsService
↓
SettingsRepository
↓
settings persistence

Settings never directly modify the filesystem from React.

===============================================================
26. MIGRATION ARCHITECTURE
==========================

Persistent data contains a schema version.

Example:

schemaVersion: "v1"

Migration flow:

Stored Data
↓
Read
↓
Check Version
↓
Migration Pipeline
↓
Current Schema
↓
Application

Migrations are non-mutating during reads.

Persistence is handled safely through the storage layer.

===============================================================
27. TESTING ARCHITECTURE
========================

Unit tests cover:

• repositories
• services
• validation
• colors
• typography
• asset filtering
• duplicate detection
• path safety
• token resolution
• safe writes
• recovery
• brand archiving
• asset isolation
• integrity detection

Architecture allows services to be tested without Premiere Pro.

In-memory repositories are used for isolated tests.

===============================================================
28. PERFORMANCE ARCHITECTURE
============================

Brand Base is designed for potentially large libraries.

Performance principles:

• Sharded JSON
• Lazy loading where appropriate
• No unnecessary filesystem traversal
• Explicit integrity scans
• Lightweight metadata
• No large binary data inside JSON
• No video hashing
• No continuous full-library scanning
• No aggressive Premiere polling
• UI virtualization can be introduced for very large libraries

Large media files remain physical files.

JSON stores metadata and references.

===============================================================
29. DATA OWNERSHIP
==================

BRAND BASE OWNS:

Brand information
Asset metadata
Brand colors
Typography
Packages
Favorites
Recent history
Library structure
Library binaries

PREMIERE OWNS:

Project
Sequence
Timeline
Tracks
Playhead
Project Items
Editing state

Neither system should incorrectly become the source of truth
for the other system's data.

===============================================================
30. FUTURE CLOUD ARCHITECTURE
=============================

The local architecture is intentionally designed to support
future cloud synchronization.

Current:

React
↓
Services
↓
Repository Interfaces
↓
UXP Local Repository
↓
Local Filesystem

Future:

React
↓
Services
↓
Repository Interfaces
↓
Sync Layer
↓
┌──────────────────────────────┐
│ Local Repository             │
│                              │
│ UXP Filesystem               │
└──────────────┬───────────────┘
│
│ Sync
▼
┌──────────────────────────────┐
│ Brand Base Cloud API         │
│                              │
│ Authentication              │
│ Brands                       │
│ Metadata                     │
│ Permissions                  │
│ Sync                         │
│ Search                       │
│ Collaboration                │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│ PostgreSQL                   │
│                              │
│ Users                        │
│ Organizations                │
│ Brands                       │
│ Assets Metadata              │
│ Permissions                  │
│ Packages                     │
└──────────────────────────────┘
│
▼
┌──────────────────────────────┐
│ Object Storage               │
│                              │
│ S3 / R2 / Cloud Storage      │
│ Large media                  │
│ Videos                       │
│ Images                       │
│ Audio                        │
│ MOGRTs                       │
│ Packages                     │
└──────────────────────────────┘

IMPORTANT:

PostgreSQL stores metadata.

Object storage stores large media.

Large video/audio files should NOT be stored inside PostgreSQL.

===============================================================
31. FUTURE BYO STORAGE
======================

Brand Base can eventually support:

• Amazon S3
• Cloudflare R2
• Google Drive
• Dropbox
• OneDrive
• Other S3-compatible storage

Architecture:

Brand Base
│
▼
Storage Provider Interface
│
├── Local UXP
├── Brand Base Cloud
├── S3
├── R2
├── Google Drive
├── Dropbox
└── OneDrive

The application layer does not need to know which storage provider
is being used.

===============================================================
32. FUTURE TEAM COLLABORATION
=============================

Future architecture:

Organization
│
├── Members
├── Roles
├── Permissions
├── Brands
│    ├── Assets
│    ├── Colors
│    ├── Typography
│    └── Packages
│
└── Activity

Possible roles:

Owner
Admin
Editor
Contributor
Viewer

Future capabilities:

• approvals
• asset locking
• version history
• comments
• audit logs
• brand compliance
• shared libraries

===============================================================
33. FUTURE AI ARCHITECTURE
==========================

AI should sit ABOVE the existing repository/service architecture.

Example:

User:

"Find the corporate intro video."

    ↓

AI Search Service

    ↓

Semantic Search

    ↓

AssetRepository

    ↓

Relevant Assets

Future AI capabilities:

• semantic asset search
• natural-language search
• automatic tagging
• asset classification
• duplicate assistance
• brand compliance
• smart recommendations
• related asset discovery
• automatic metadata generation

AI must not bypass the application's repository and safety layers.

===============================================================
34. BRAND COMPLIANCE — FUTURE
=============================

Future Brand Compliance Service:

Asset
↓
Brand Rules
↓
Validation
├── Logo rules
├── Color rules
├── Typography rules
├── File rules
└── Usage rules
↓
Compliance Result

Example:

✓ Approved Logo
✓ Approved Brand Color
⚠ Incorrect Typography
✕ Unapproved Logo Variant

===============================================================
35. BRAND PACKAGE ARCHITECTURE
==============================

A Brand Package is a curated collection of assets.

Example:

ACME CORPORATE PACKAGE
│
├── Primary Logo
├── Secondary Logo
├── Brand Colors
├── Typography
├── Intro
├── Outro
├── Lower Third
├── End Card
├── Background Music
├── SFX
└── Social Templates

Package flow:

Brand
↓
Package
↓
Assets
↓
Export / Import

Future package formats may support:

• ZIP
• BBPACKAGE
• Cloud package
• Team package

===============================================================
36. APPLICATION CONTAINER
=========================

The ApplicationContainer is the composition root.

It connects:

Repositories
↓
Services
↓
Application
↓
React

Conceptually:

ApplicationContainer
│
├── AssetRepository
├── BrandRepository
├── ColorRepository
├── TypographyRepository
├── PackageRepository
├── SettingsRepository
├── RecentRepository
│
├── AssetService
├── BrandService
├── ColorService
├── TypographyService
├── PackageService
├── SettingsService
├── RecentService
│
├── AssetIntegrityService
├── AssetImportQueue
├── FileIdentityService
│
└── PremiereTimelineService

This makes dependency management centralized.

===============================================================
37. SECURITY / SAFETY PRINCIPLES
================================

Brand Base follows:

1. No arbitrary filesystem writes.
2. No source-file movement during import.
3. No unsafe path persistence.
4. No fake checksum.
5. No silent duplicate deletion.
6. No automatic binary deletion.
7. No undocumented Premiere APIs.
8. No direct Premiere manipulation from React.
9. No Node filesystem APIs in UXP runtime.
10. No false atomicity guarantees.
11. No destructive recovery.
12. No cloud dependency for core local functionality.

===============================================================
38. CURRENT IMPLEMENTATION STATUS
=================================

COMPLETED:

Phase 0
Architecture + UXP scaffold

Phase 1
UI shell + navigation + dashboard

Phase 2
Domain models + repositories + application services

Phase 3
UXP filesystem persistence

Phase 3.1
Persistence/import safety hardening

Phase 4
Brand Management

Phase 5
Asset Library + Import Management

Phase 5.1
Asset integrity + import hardening

Phase 6A
Premiere project/sequence context + project import architecture

Phase 6B
Timeline/sequence integration
↓
Implementation phase

===============================================================
39. PROJECT STRUCTURE
=====================

src/
│
├── app/
│   └── application.ts
│
├── components/
│   ├── assets/
│   ├── brands/
│   ├── colors/
│   ├── typography/
│   ├── packages/
│   ├── premiere/
│   └── common/
│
├── domain/
│   ├── models.ts
│   ├── validation.ts
│   ├── errors.ts
│   └── migrations.ts
│
├── filesystem/
│   ├── LibraryManager
│   ├── LibraryValidator
│   ├── UxPAssetRepository
│   ├── UxPBrandRepository
│   ├── UxPColorRepository
│   ├── UxPTypographyRepository
│   ├── UxPPackageRepository
│   ├── UxPSettingsRepository
│   ├── UxPRecentRepository
│   └── io
│
├── hooks/
│   ├── useApplicationData
│   ├── useAssetImport
│   ├── usePremiereContext
│   └── usePremiereTimeline
│
├── layouts/
│   ├── AppShell
│   ├── Sidebar
│   └── TopBar
│
├── pages/
│   ├── Home
│   ├── Assets
│   ├── Brands
│   ├── Colors
│   ├── Typography
│   ├── Audio
│   ├── Graphics
│   ├── MOGRTs
│   ├── Templates
│   ├── Presets
│   ├── Packages
│   ├── Favorites
│   ├── Recent
│   └── Settings
│
├── repositories/
│   ├── contracts.ts
│   └── in-memory.ts
│
├── services/
│   ├── AssetService
│   ├── BrandService
│   ├── ColorService
│   ├── TypographyService
│   ├── PackageService
│   ├── RecentService
│   ├── SettingsService
│   ├── AssetIntegrityService
│   ├── AssetImportQueue
│   ├── FileIdentityService
│   ├── PremiereTimelineService
│   └── container.ts
│
├── premiere/
│   └── UxPPremiereAdapter
│
└── utils/
├── id
├── date
├── color
└── file-classification

===============================================================
40. THE MOST IMPORTANT ARCHITECTURAL RULE
=========================================

                THE LIBRARY IS THE PRODUCT.

             PREMIERE IS THE ENVIRONMENT.

Brand Base's primary responsibility is to maintain a reliable,
organized, reusable Brand Asset Library.

Premiere Pro is the creative environment where those assets are
used.

Therefore:

Brand Base
= Source of Truth for reusable brand assets

Premiere Pro
= Source of Truth for editing state and timeline

This separation allows Brand Base to eventually evolve from a
Premiere Pro plugin into a complete cross-application Brand Asset
Management platform while keeping the same core architecture.

===============================================================
41. FINAL ARCHITECTURE
======================

                     BRAND BASE
                          │
                          ▼
                ┌─────────────────┐
                │    REACT UI     │
                └────────┬────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ APPLICATION SERVICES │
              └──────────┬───────────┘
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
   ┌─────────────────┐      ┌────────────────────┐
   │ REPOSITORIES    │      │ PREMIERE SERVICES  │
   └────────┬────────┘      └─────────┬──────────┘
            │                         │
            ▼                         ▼
   ┌─────────────────┐      ┌────────────────────┐
   │ UXP FILESYSTEM  │      │ PREMIERE UXP API   │
   └────────┬────────┘      └─────────┬──────────┘
            │                         │
            ▼                         ▼
   ┌─────────────────┐      ┌────────────────────┐
   │ BRAND LIBRARY   │      │ PREMIERE PRO       │
   │                 │      │                    │
   │ Assets          │      │ Project            │
   │ Brands          │      │ Sequence           │
   │ Colors          │      │ Timeline           │
   │ Typography      │      │ Tracks             │
   │ Packages        │      │ Playhead           │
   └─────────────────┘      └────────────────────┘

FUTURE:

                     BRAND BASE
                          │
                          ▼
                 APPLICATION LAYER
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
      LOCAL REPOSITORY           CLOUD REPOSITORY
             │                         │
             ▼                         ▼
      UXP FILESYSTEM             BRAND BASE API
                                       │
                          ┌────────────┴────────────┐
                          ▼                         ▼
                     PostgreSQL              Object Storage
                     Metadata                 Large Media

This architecture keeps Brand Base:

• local-first
• modular
• testable
• safe
• scalable
• Premiere-native
• cloud-ready
• team-ready
• AI-ready

without requiring the core application to be rewritten later.
