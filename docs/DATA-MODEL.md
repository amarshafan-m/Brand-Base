# Brand Base Data Model

All persisted records include `schemaVersion`. IDs are stable strings and relationships use IDs instead of embedded binary data. Timestamps use ISO 8601 UTC strings.

## Asset

```ts
type AssetType =
  | "logo" | "image" | "video" | "audio" | "music" | "sfx"
  | "graphic" | "mogrt" | "template" | "preset" | "font" | "other";

type AssetStatus = "approved" | "draft" | "archived" | "deprecated";

interface Asset {
  id: string; brandId: string; name: string; type: AssetType; category: string;
  filePath: string; thumbnailPath?: string; mimeType?: string; extension?: string;
  size?: number; checksum?: string; tags: string[]; favorite: boolean;
  status: AssetStatus; version: string; createdAt: string; updatedAt: string;
  metadata: Record<string, unknown>; schemaVersion: number;
}
```

`filePath` and `thumbnailPath` are library-relative serializable references, not unserialized UXP entry objects. Phase 2 does not resolve, validate, or persist these paths; Phase 3 will add the UXP filesystem boundary.

## Brand

```ts
interface Brand {
  id: string; name: string; description?: string; isDefault: boolean;
  createdAt: string; updatedAt: string; logoIds: string[]; colorIds: string[];
  typography: string[]; packageIds: string[];
  settings: Record<string, unknown>; schemaVersion: number;
}
```

## Color and typography

```ts
interface RGBColor { r: number; g: number; b: number; }
interface HSLColor { h: number; s: number; l: number; }

interface BrandColor {
  id: string; brandId: string; name: string; hex: string;
  rgb: RGBColor; hsl: HSLColor;
  usage: "primary" | "secondary" | "accent" | "background" | "text" | "custom";
  createdAt: string; updatedAt: string; schemaVersion: number;
}

interface TypographyStyle {
  id: string; brandId: string;
  role: "heading" | "subheading" | "body" | "caption" | "display" | "custom";
  fontFamily: string;
  fontWeight: string; fontSize?: number; lineHeight?: number;
  letterSpacing?: number; color?: string; usage?: string; schemaVersion: number;
}
```

Typography records store the requested family name. They do not claim that a font is installed or available.

## Brand package and settings

```ts
interface BrandPackage {
  id: string; brandId: string; name: string; description?: string;
  assetIds: string[]; createdAt: string; updatedAt: string; schemaVersion: number;
}

interface BrandBaseSettings {
  defaultBrandId?: string; libraryLocation?: string; theme: "dark" | "system";
  compactMode: boolean; gridSize: "small" | "medium" | "large";
  autoGenerateThumbnails: boolean; confirmDelete: boolean;
  showFileExtensions: boolean; rememberLastView: boolean; schemaVersion: number;
}
```

Packages reference existing asset IDs and never duplicate source media by default.

## Versioning and migrations

Repositories will accept supported historical schema versions, migrate data in memory, validate it, and persist only after successful migration. A migration must be idempotent, ordered, and covered by a fixture-based test. Binary assets are never altered by a metadata migration.

`CURRENT_SCHEMA_VERSION` is the sole current-version constant (currently `1`). `migrateRecord()` returns current records unchanged, applies ordered migrations for older records, and rejects newer unknown records. Persistent timestamps are ISO 8601 UTC strings; date formatting happens only in UI-facing utilities.

## Integrity invariants

- Every referenced brand and asset must exist unless the record is explicitly marked for recovery.
- A default brand is unique per library.
- Favorite is asset metadata, not a duplicate collection.
- Checksums identify content only; filename similarity never overwrites an asset automatically.
- User-controlled strings are validated before persistence and never rendered as HTML.
