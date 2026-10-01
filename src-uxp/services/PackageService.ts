import { DuplicateError, NotFoundError } from "../domain/errors";
import type { BrandPackage, EntityId } from "../domain/models";
import { CURRENT_SCHEMA_VERSION } from "../domain/schema";
import { validateBrandPackage } from "../domain/validation";
import type { AssetRepository, BrandRepository, PackageRepository } from "../repositories/contracts";
import { now } from "../utils/date";
import type { IdGenerator } from "../utils/id";

export interface CreatePackageInput { brandId: EntityId; name: string; description?: string; assetIds?: EntityId[]; }

export class PackageService {
  constructor(private readonly packages: PackageRepository, private readonly brands: BrandRepository, private readonly assets: AssetRepository, private readonly ids: IdGenerator) {}
  getAll = (): Promise<BrandPackage[]> => this.packages.getAll();
  getByBrandId = (brandId: EntityId): Promise<BrandPackage[]> => this.packages.getByBrandId(brandId);

  async create(input: CreatePackageInput): Promise<BrandPackage> {
    await this.requireBrand(input.brandId);
    const name = input.name.trim();
    if ((await this.packages.getByBrandId(input.brandId)).some((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase())) throw new DuplicateError("Package", `A package named '${name}' already exists for this brand.`);
    const timestamp = now();
    const brandPackage = validateBrandPackage({ id: this.ids.generate(), brandId: input.brandId, name, description: input.description?.trim() ?? "", assetIds: [...new Set(input.assetIds ?? [])], createdAt: timestamp, updatedAt: timestamp, schemaVersion: CURRENT_SCHEMA_VERSION });
    await this.assertAssetReferences(brandPackage.brandId, brandPackage.assetIds);
    return this.packages.create(brandPackage);
  }

  async update(brandPackage: BrandPackage): Promise<BrandPackage> {
    if (!await this.packages.getById(brandPackage.id)) throw new NotFoundError("Package", brandPackage.id);
    await this.requireBrand(brandPackage.brandId);
    const updated = validateBrandPackage({ ...brandPackage, name: brandPackage.name.trim(), updatedAt: now() });
    await this.assertAssetReferences(updated.brandId, updated.assetIds);
    return this.packages.update(updated);
  }

  async delete(id: EntityId): Promise<void> { if (!await this.packages.getById(id)) throw new NotFoundError("Package", id); await this.packages.delete(id); }

  async addAssetReference(packageId: EntityId, assetId: EntityId): Promise<BrandPackage> {
    const brandPackage = await this.requirePackage(packageId);
    if (brandPackage.assetIds.includes(assetId)) throw new DuplicateError("Package asset", "This asset is already in the package.");
    return this.update({ ...brandPackage, assetIds: [...brandPackage.assetIds, assetId] });
  }

  async removeAssetReference(packageId: EntityId, assetId: EntityId): Promise<BrandPackage> {
    const brandPackage = await this.requirePackage(packageId);
    return this.update({ ...brandPackage, assetIds: brandPackage.assetIds.filter((id) => id !== assetId) });
  }

  private async requireBrand(id: EntityId): Promise<void> { if (!await this.brands.getById(id)) throw new NotFoundError("Brand", id); }
  private async requirePackage(id: EntityId): Promise<BrandPackage> { const item = await this.packages.getById(id); if (!item) throw new NotFoundError("Package", id); return item; }
  private async assertAssetReferences(brandId: EntityId, assetIds: EntityId[]): Promise<void> {
    for (const assetId of assetIds) {
      const asset = await this.assets.getById(assetId);
      if (!asset) throw new NotFoundError("Asset", assetId);
      if (asset.brandId !== brandId) throw new DuplicateError("Package asset", "A package can only reference assets from its own brand.");
    }
  }
}
