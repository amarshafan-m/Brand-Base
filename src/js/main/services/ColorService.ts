import { DuplicateError, NotFoundError } from "../domain/errors";
import type { BrandColor, BrandColorType, EntityId } from "../domain/models";
import { CURRENT_SCHEMA_VERSION } from "../domain/schema";
import { validateBrandColor } from "../domain/validation";
import type { BrandRepository, ColorRepository } from "../repositories/contracts";
import { hexToRgb, normalizeHex, rgbToHsl } from "../utils/color";
import { now } from "../utils/date";
import type { IdGenerator } from "../utils/id";

export interface CreateColorInput { brandId: EntityId; name: string; hex: string; usage?: BrandColorType; }

export class ColorService {
  constructor(private readonly colors: ColorRepository, private readonly brands: BrandRepository, private readonly ids: IdGenerator) {}
  getAll = (): Promise<BrandColor[]> => this.colors.getAll();
  getByBrandId = (brandId: EntityId): Promise<BrandColor[]> => this.colors.getByBrandId(brandId);

  async create(input: CreateColorInput): Promise<BrandColor> {
    await this.requireBrand(input.brandId);
    const existing = await this.colors.getByBrandId(input.brandId);
    if (existing.some((color) => color.name.trim().toLocaleLowerCase() === input.name.trim().toLocaleLowerCase())) throw new DuplicateError("Color", `A color named '${input.name.trim()}' already exists for this brand.`);
    const timestamp = now();
    return this.colors.create(this.fromHex({ ...input, id: this.ids.generate(), createdAt: timestamp, updatedAt: timestamp, schemaVersion: CURRENT_SCHEMA_VERSION }));
  }

  async update(color: BrandColor): Promise<BrandColor> {
    if (!await this.colors.getById(color.id)) throw new NotFoundError("Color", color.id);
    await this.requireBrand(color.brandId);
    return this.colors.update(this.fromHex({ ...color, name: color.name.trim(), updatedAt: now() }));
  }

  async delete(id: EntityId): Promise<void> { if (!await this.colors.getById(id)) throw new NotFoundError("Color", id); await this.colors.delete(id); }

  private fromHex(color: Omit<Pick<BrandColor, "id" | "brandId" | "name" | "hex" | "usage" | "createdAt" | "updatedAt" | "schemaVersion">, "usage"> & { usage?: BrandColorType }): BrandColor {
    const hex = normalizeHex(color.hex);
    const rgb = hexToRgb(hex);
    return validateBrandColor({ ...color, hex, rgb, hsl: rgbToHsl(rgb), usage: color.usage ?? "custom" });
  }

  private async requireBrand(id: EntityId): Promise<void> { if (!await this.brands.getById(id)) throw new NotFoundError("Brand", id); }
}
