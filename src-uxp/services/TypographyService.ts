import { NotFoundError } from "../domain/errors";
import type { EntityId, TypographyStyle } from "../domain/models";
import { CURRENT_SCHEMA_VERSION } from "../domain/schema";
import { validateTypographyStyle } from "../domain/validation";
import type { BrandRepository, TypographyRepository } from "../repositories/contracts";
import type { IdGenerator } from "../utils/id";

export type CreateTypographyInput = Omit<TypographyStyle, "id" | "schemaVersion">;

export class TypographyService {
  constructor(private readonly typography: TypographyRepository, private readonly brands: BrandRepository, private readonly ids: IdGenerator) {}
  getAll = (): Promise<TypographyStyle[]> => this.typography.getAll();
  getByBrandId = (brandId: EntityId): Promise<TypographyStyle[]> => this.typography.getByBrandId(brandId);

  async create(input: CreateTypographyInput): Promise<TypographyStyle> {
    await this.requireBrand(input.brandId);
    return this.typography.create(validateTypographyStyle({ ...input, id: this.ids.generate(), fontFamily: input.fontFamily.trim(), fontWeight: input.fontWeight.trim(), schemaVersion: CURRENT_SCHEMA_VERSION }));
  }

  async update(style: TypographyStyle): Promise<TypographyStyle> {
    if (!await this.typography.getById(style.id)) throw new NotFoundError("Typography", style.id);
    await this.requireBrand(style.brandId);
    return this.typography.update(validateTypographyStyle({ ...style, fontFamily: style.fontFamily.trim(), fontWeight: style.fontWeight.trim() }));
  }

  async delete(id: EntityId): Promise<void> { if (!await this.typography.getById(id)) throw new NotFoundError("Typography", id); await this.typography.delete(id); }
  async duplicate(id: EntityId): Promise<TypographyStyle> {
    const style = await this.typography.getById(id);
    if (!style) throw new NotFoundError("Typography", id);
    const { id: _id, schemaVersion: _schemaVersion, ...input } = style;
    return this.create(input);
  }
  private async requireBrand(id: EntityId): Promise<void> { if (!await this.brands.getById(id)) throw new NotFoundError("Brand", id); }
}
