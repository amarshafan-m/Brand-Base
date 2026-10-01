import { DuplicateError, NotFoundError } from "../domain/errors";
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
import { filterAssets } from "../utils/asset-query";
import { cloneValue } from "../utils/clone";
import type {
  AssetRepository,
  BrandRepository,
  ColorRepository,
  PackageRepository,
  RecentRepository,
  SettingsRepository,
  TypographyRepository,
} from "./contracts";

interface Identified { id: EntityId; }

abstract class InMemoryRepository<T extends Identified> {
  protected readonly records = new Map<EntityId, T>();
  protected readonly entityName: string;

  protected constructor(entityName: string, initial: T[] = []) {
    this.entityName = entityName;
    initial.forEach((item) => this.records.set(item.id, cloneValue(item)));
  }

  async getAll(): Promise<T[]> {
    return Array.from(this.records.values(), cloneValue);
  }

  async getById(id: EntityId): Promise<T | undefined> {
    const record = this.records.get(id);
    return record ? cloneValue(record) : undefined;
  }

  async create(record: T): Promise<T> {
    if (this.records.has(record.id)) throw new DuplicateError(this.entityName, `${this.entityName} id '${record.id}' already exists.`);
    this.records.set(record.id, cloneValue(record));
    return cloneValue(record);
  }

  async update(record: T): Promise<T> {
    if (!this.records.has(record.id)) throw new NotFoundError(this.entityName, record.id);
    this.records.set(record.id, cloneValue(record));
    return cloneValue(record);
  }

  async delete(id: EntityId): Promise<void> {
    if (!this.records.delete(id)) throw new NotFoundError(this.entityName, id);
  }
}

export class InMemoryAssetRepository extends InMemoryRepository<Asset> implements AssetRepository {
  constructor(initial: Asset[] = []) { super("Asset", initial); }
  async getByBrandId(brandId: EntityId): Promise<Asset[]> { return (await this.getAll()).filter((asset) => asset.brandId === brandId); }
  async search(criteria: AssetSearchCriteria): Promise<Asset[]> { return filterAssets(await this.getAll(), criteria); }
  async getFavorites(): Promise<Asset[]> { return (await this.getAll()).filter((asset) => asset.favorite); }
}

export class InMemoryBrandRepository extends InMemoryRepository<Brand> implements BrandRepository {
  constructor(initial: Brand[] = []) { super("Brand", initial); }
  async setDefault(id: EntityId): Promise<Brand> {
    if (!this.records.has(id)) throw new NotFoundError("Brand", id);
    for (const [brandId, brand] of this.records) this.records.set(brandId, { ...brand, isDefault: brandId === id });
    return cloneValue(this.records.get(id)!);
  }
}

export class InMemoryColorRepository extends InMemoryRepository<BrandColor> implements ColorRepository {
  constructor(initial: BrandColor[] = []) { super("Color", initial); }
  async getByBrandId(brandId: EntityId): Promise<BrandColor[]> { return (await this.getAll()).filter((color) => color.brandId === brandId); }
}

export class InMemoryTypographyRepository extends InMemoryRepository<TypographyStyle> implements TypographyRepository {
  constructor(initial: TypographyStyle[] = []) { super("Typography", initial); }
  async getByBrandId(brandId: EntityId): Promise<TypographyStyle[]> { return (await this.getAll()).filter((style) => style.brandId === brandId); }
}

export class InMemoryPackageRepository extends InMemoryRepository<BrandPackage> implements PackageRepository {
  constructor(initial: BrandPackage[] = []) { super("Package", initial); }
  async getByBrandId(brandId: EntityId): Promise<BrandPackage[]> { return (await this.getAll()).filter((brandPackage) => brandPackage.brandId === brandId); }
}

export class InMemorySettingsRepository implements SettingsRepository {
  private settings: BrandBaseSettings;
  constructor(initial: BrandBaseSettings) { this.settings = cloneValue(initial); }
  async get(): Promise<BrandBaseSettings> { return cloneValue(this.settings); }
  async update(settings: BrandBaseSettings): Promise<BrandBaseSettings> { this.settings = cloneValue(settings); return cloneValue(this.settings); }
}

export class InMemoryRecentRepository implements RecentRepository {
  private readonly records = new Map<EntityId, RecentItem>();
  constructor(initial: RecentItem[] = []) { initial.forEach((item) => this.records.set(item.id, cloneValue(item))); }
  async getRecent(limit: number): Promise<RecentItem[]> {
    return Array.from(this.records.values())
      .sort((left, right) => right.timestamp.localeCompare(left.timestamp))
      .slice(0, Math.max(0, limit))
      .map(cloneValue);
  }
  async add(item: RecentItem): Promise<RecentItem> { this.records.set(item.id, cloneValue(item)); return cloneValue(item); }
  async remove(id: EntityId): Promise<void> { if (!this.records.delete(id)) throw new NotFoundError("Recent item", id); }
  async clear(): Promise<void> { this.records.clear(); }
}
