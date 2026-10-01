import { DuplicateError, NotFoundError, PotentialDuplicateError } from "../domain/errors";
import type { Asset, AssetSearchCriteria, AssetSortOptions, EntityId } from "../domain/models";
import { CURRENT_SCHEMA_VERSION } from "../domain/schema";
import { validateAsset } from "../domain/validation";
import type { AssetRepository, BrandRepository } from "../repositories/contracts";
import { filterAssets, sortAssets } from "../utils/asset-query";
import { now } from "../utils/date";
import type { IdGenerator } from "../utils/id";
import { fileIdentityService } from "./ChecksumService";

export type CreateAssetInput = Omit<Asset, "id" | "createdAt" | "updatedAt" | "schemaVersion" | "favorite"> & { 
  favorite?: boolean;
  /** If true, bypasses duplicate name checking and imports anyway. */
  importAnyway?: boolean;
  /** Size of the file in bytes, for fingerprinting. */
  fileSize?: number;
};

export class AssetService {
  constructor(
    private readonly assets: AssetRepository, 
    private readonly brands: BrandRepository, 
    private readonly ids: IdGenerator
  ) {}
  
  getAll = (): Promise<Asset[]> => this.assets.getAll();
  getById = async (id: EntityId): Promise<Asset> => this.requireAsset(id);
  getByBrandId = (brandId: EntityId): Promise<Asset[]> => this.assets.getByBrandId(brandId);
  getFavorites = (): Promise<Asset[]> => this.assets.getFavorites();

  async create(input: CreateAssetInput): Promise<Asset> {
    await this.requireBrand(input.brandId);
    
    // Duplicate Detection Logic
    if (!input.importAnyway) {
      const existing = await this.assets.getByBrandId(input.brandId);
      const match = existing.find(
        (asset) => asset.type === input.type && 
                   asset.name.trim().toLocaleLowerCase() === input.name.trim().toLocaleLowerCase()
      );
      
      if (match) {
        // True content identity is impossible in this phase.
        // We only generate a display fingerprint.
        const identity = fileIdentityService.fingerprint(input.name, input.fileSize);
        
        throw new PotentialDuplicateError(
          "Asset", 
          `Potential duplicate detected: An asset named '${input.name.trim()}' already exists. Since exact content cannot be verified (fingerprint: ${identity.fingerprint}), please choose how to proceed.`,
          match.id
        );
      }
    }
    
    const timestamp = now();
    const asset = validateAsset({ 
      ...input, 
      id: this.ids.generate(), 
      name: input.name.trim(), 
      tags: [...new Set(input.tags.map((tag) => tag.trim()).filter(Boolean))], 
      favorite: input.favorite ?? false, 
      createdAt: timestamp, 
      updatedAt: timestamp, 
      schemaVersion: CURRENT_SCHEMA_VERSION 
    });
    
    return this.assets.create(asset);
  }

  async update(asset: Asset): Promise<Asset> {
    await this.requireAsset(asset.id);
    await this.requireBrand(asset.brandId);
    const updated = validateAsset({ ...asset, name: asset.name.trim(), tags: [...new Set(asset.tags.map((tag) => tag.trim()).filter(Boolean))], updatedAt: now() });
    return this.assets.update(updated);
  }

  delete = async (id: EntityId): Promise<void> => { await this.requireAsset(id); await this.assets.delete(id); };
  favorite = async (id: EntityId): Promise<Asset> => this.setFavorite(id, true);
  unfavorite = async (id: EntityId): Promise<Asset> => this.setFavorite(id, false);

  async duplicateMetadata(id: EntityId, name = ""): Promise<Asset> {
    const source = await this.requireAsset(id);
    return this.create({ ...source, name: name.trim() || `${source.name} Copy`, favorite: false, importAnyway: true });
  }

  async search(criteria: AssetSearchCriteria = {}, sort?: AssetSortOptions): Promise<Asset[]> {
    return sortAssets(filterAssets(await this.assets.search(criteria), criteria), sort);
  }

  private async setFavorite(id: EntityId, favorite: boolean): Promise<Asset> {
    return this.update({ ...(await this.requireAsset(id)), favorite });
  }

  private async requireAsset(id: EntityId): Promise<Asset> {
    const asset = await this.assets.getById(id);
    if (!asset) throw new NotFoundError("Asset", id);
    return asset;
  }

  private async requireBrand(id: EntityId): Promise<void> {
    if (!await this.brands.getById(id)) throw new NotFoundError("Brand", id);
  }
}
