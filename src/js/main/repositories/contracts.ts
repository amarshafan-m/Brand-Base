import type {
  Asset,
  AssetSearchCriteria,
  Brand,
  BrandBaseSettings,
  BrandColor,
  BrandPackage,
  EntityId,
  RecentItem,
  TypographyStyle,
} from "../domain/models";

export interface AssetRepository {
  getAll(): Promise<Asset[]>;
  getById(id: EntityId): Promise<Asset | undefined>;
  getByBrandId(brandId: EntityId): Promise<Asset[]>;
  create(asset: Asset): Promise<Asset>;
  update(asset: Asset): Promise<Asset>;
  delete(id: EntityId): Promise<void>;
  search(criteria: AssetSearchCriteria): Promise<Asset[]>;
  getFavorites(): Promise<Asset[]>;
}

export interface BrandRepository {
  getAll(): Promise<Brand[]>;
  getById(id: EntityId): Promise<Brand | undefined>;
  create(brand: Brand): Promise<Brand>;
  update(brand: Brand): Promise<Brand>;
  delete(id: EntityId): Promise<void>;
  setDefault(id: EntityId): Promise<Brand>;
}

export interface ColorRepository {
  getAll(): Promise<BrandColor[]>;
  getById(id: EntityId): Promise<BrandColor | undefined>;
  getByBrandId(brandId: EntityId): Promise<BrandColor[]>;
  create(color: BrandColor): Promise<BrandColor>;
  update(color: BrandColor): Promise<BrandColor>;
  delete(id: EntityId): Promise<void>;
}

export interface TypographyRepository {
  getAll(): Promise<TypographyStyle[]>;
  getById(id: EntityId): Promise<TypographyStyle | undefined>;
  getByBrandId(brandId: EntityId): Promise<TypographyStyle[]>;
  create(style: TypographyStyle): Promise<TypographyStyle>;
  update(style: TypographyStyle): Promise<TypographyStyle>;
  delete(id: EntityId): Promise<void>;
}

export interface PackageRepository {
  getAll(): Promise<BrandPackage[]>;
  getById(id: EntityId): Promise<BrandPackage | undefined>;
  getByBrandId(brandId: EntityId): Promise<BrandPackage[]>;
  create(brandPackage: BrandPackage): Promise<BrandPackage>;
  update(brandPackage: BrandPackage): Promise<BrandPackage>;
  delete(id: EntityId): Promise<void>;
}

export interface SettingsRepository {
  get(): Promise<BrandBaseSettings>;
  update(settings: BrandBaseSettings): Promise<BrandBaseSettings>;
}

export interface RecentRepository {
  getRecent(limit: number): Promise<RecentItem[]>;
  add(item: RecentItem): Promise<RecentItem>;
  remove(id: EntityId): Promise<void>;
  clear(): Promise<void>;
}

export interface BackupSnapshot {
  schemaVersion: number;
  exportedAt: string;
  metadata: Record<string, unknown>;
}

export interface BackupRepository {
  exportMetadata(): Promise<BackupSnapshot>;
  importMetadata(snapshot: BackupSnapshot): Promise<void>;
  createBackup(): Promise<BackupSnapshot>;
  restoreBackup(snapshot: BackupSnapshot): Promise<void>;
}
