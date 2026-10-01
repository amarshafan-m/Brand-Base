import { DuplicateError, NotFoundError, ValidationError } from "../domain/errors";
import type { Brand, BrandSettings, EntityId } from "../domain/models";
import { CURRENT_SCHEMA_VERSION } from "../domain/schema";
import { validateBrand } from "../domain/validation";
import type { BrandRepository, SettingsRepository } from "../repositories/contracts";
import { now } from "../utils/date";
import type { IdGenerator } from "../utils/id";

export interface CreateBrandInput {
  name: string;
  description?: string;
  isDefault?: boolean;
  settings?: BrandSettings;
}

export class BrandService {
  constructor(
    private readonly brands: BrandRepository,
    private readonly settings: SettingsRepository,
    private readonly ids: IdGenerator,
  ) {}

  getAll = (): Promise<Brand[]> => this.brands.getAll();
  getById = async (id: EntityId): Promise<Brand> => this.requireBrand(id);

  async create(input: CreateBrandInput): Promise<Brand> {
    const existing = await this.brands.getAll();
    if (existing.some((brand) => brand.name.trim().toLocaleLowerCase() === input.name.trim().toLocaleLowerCase())) {
      throw new DuplicateError("Brand", `A brand named '${input.name.trim()}' already exists.`);
    }
    const timestamp = now();
    const shouldBeDefault = existing.length === 0 || input.isDefault === true;
    const brand: Brand = validateBrand({
      id: (input as any).id || this.ids.generate(),
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
      isDefault: shouldBeDefault,
      createdAt: timestamp,
      updatedAt: timestamp,
      logoIds: [],
      colorIds: [],
      typography: [],
      packageIds: [],
      settings: input.settings ?? { values: {} },
      schemaVersion: CURRENT_SCHEMA_VERSION,
    });
    await this.brands.create(brand);
    return shouldBeDefault ? this.setDefault(brand.id) : brand;
  }

  async update(brand: Brand): Promise<Brand> {
    const previous = await this.requireBrand(brand.id);
    if (previous.isDefault && !brand.isDefault) {
      throw new ValidationError("Use setDefault to replace the current default brand.");
    }
    const matching = await this.brands.getAll();
    if (matching.some((item) => item.id !== brand.id && item.name.trim().toLocaleLowerCase() === brand.name.trim().toLocaleLowerCase())) {
      throw new DuplicateError("Brand", `A brand named '${brand.name.trim()}' already exists.`);
    }
    const updated = validateBrand({ ...brand, name: brand.name.trim(), updatedAt: now() });
    await this.brands.update(updated);
    return updated.isDefault ? this.setDefault(updated.id) : updated;
  }

  async delete(id: EntityId): Promise<void> {
    const brand = await this.requireBrand(id);
    const settings = await this.settings.get();
    const isCurrentlyActive = brand.isDefault || settings.defaultBrandId === id;
    
    await this.brands.delete(id);
    if (!isCurrentlyActive) return;

    const remaining = (await this.brands.getAll()).sort((left, right) => left.createdAt.localeCompare(right.createdAt));
    if (remaining[0]) {
      await this.setDefault(remaining[0].id);
    } else {
      const settings = await this.settings.get();
      await this.settings.update({ ...settings, defaultBrandId: undefined });
    }
  }

  async duplicate(id: EntityId, name = ""): Promise<Brand> {
    const source = await this.requireBrand(id);
    const candidate = name.trim() || `${source.name} Copy`;
    return this.create({ name: candidate, description: source.description, settings: source.settings });
  }

  async setDefault(id: EntityId): Promise<Brand> {
    const defaultBrand = await this.brands.setDefault(id);
    const settings = await this.settings.get();
    await this.settings.update({ ...settings, defaultBrandId: id });
    return defaultBrand;
  }

  private async requireBrand(id: EntityId): Promise<Brand> {
    const brand = await this.brands.getById(id);
    if (!brand) throw new NotFoundError("Brand", id);
    return brand;
  }
}
