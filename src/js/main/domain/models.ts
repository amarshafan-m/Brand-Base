export type EntityId = string;
export type ISODateString = string;

export type SerializableValue =
  | string
  | number
  | boolean
  | null
  | SerializableValue[]
  | { [key: string]: SerializableValue };

export type AssetType =
  | "logo"
  | "image"
  | "video"
  | "audio"
  | "music"
  | "sfx"
  | "graphic"
  | "mogrt"
  | "template"
  | "preset"
  | "font"
  | "other";

export type AssetStatus = "approved" | "draft" | "archived" | "deprecated";
export type BrandColorType = "primary" | "secondary" | "accent" | "background" | "text" | "custom";
export type TypographyRole = "heading" | "subheading" | "body" | "caption" | "display" | "custom";
export type BrandBaseTheme = "dark" | "light" | "system";
export type GridSize = number | "small" | "medium" | "large";
export type RecentEntityType = "asset" | "brand" | "color" | "typography" | "package";
export type RecentAction = "viewed" | "created" | "updated" | "imported";

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface BrandSettings {
  readonly values: Record<string, SerializableValue>;
}

export interface Brand {
  id: EntityId;
  name: string;
  description: string;
  isDefault: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  logoIds: EntityId[];
  colorIds: EntityId[];
  typography: EntityId[];
  packageIds: EntityId[];
  settings: BrandSettings;
  schemaVersion: number;
}

export interface Asset {
  id: EntityId;
  brandId: EntityId;
  name: string;
  type: AssetType;
  category: string;
  filePath: string;
  thumbnailPath?: string;
  mimeType?: string;
  extension?: string;
  size?: number;
  checksum?: string;
  tags: string[];
  favorite: boolean;
  status: AssetStatus;
  version: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  metadata: Record<string, SerializableValue>;
  schemaVersion: number;
}

export interface BrandColor {
  id: EntityId;
  brandId: EntityId;
  name: string;
  hex: string;
  rgb: RGBColor;
  hsl: HSLColor;
  usage: BrandColorType;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  schemaVersion: number;
}

export interface TypographyStyle {
  id: EntityId;
  brandId: EntityId;
  name: string;
  role: TypographyRole;
  fontFamily: string;
  fontWeight: string;
  fontSize?: number;
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  usage?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  schemaVersion: number;
}

export interface BrandPackage {
  id: EntityId;
  brandId: EntityId;
  name: string;
  description: string;
  assetIds: EntityId[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
  schemaVersion: number;
}

export interface BrandBaseSettings {
  defaultBrandId?: EntityId;
  libraryLocation?: string;
  theme: BrandBaseTheme;
  compactMode: boolean;
  gridSize: GridSize;
  autoGenerateThumbnails: boolean;
  confirmDelete: boolean;
  showFileExtensions: boolean;
  rememberLastView: boolean;
  schemaVersion: number;
}

export interface RecentItem {
  id: EntityId;
  entityId: EntityId;
  entityType: RecentEntityType;
  action: RecentAction;
  timestamp: ISODateString;
}

export interface AssetSearchCriteria {
  brandId?: EntityId;
  type?: AssetType;
  category?: string;
  tags?: string[];
  favorite?: boolean;
  status?: AssetStatus;
  extension?: string;
  query?: string;
}

export type AssetSortField = "name" | "createdAt" | "updatedAt" | "size" | "type";
export type SortDirection = "asc" | "desc";

export interface AssetSortOptions {
  field: AssetSortField;
  direction: SortDirection;
}

export type AssetFilter = Omit<AssetSearchCriteria, "query">;
