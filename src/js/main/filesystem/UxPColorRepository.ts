import { ColorRepository } from "../repositories/contracts";
import { BrandColor, EntityId } from "../domain/models";
import { LibraryManager } from "./LibraryManager";
import { ensureFolder, getFileIfExists, getFolderIfExists, readJson, writeJsonSafe } from "./io";
import { cloneValue } from "../utils/clone";

export class UxPColorRepository implements ColorRepository {
  constructor(private libraryManager: LibraryManager) {}

  async getAll(): Promise<BrandColor[]> {
    const brandsFolder = await this.getBrandsFolder();
    const entries = await brandsFolder.getEntries();
    let allColors: BrandColor[] = [];
    for (const entry of entries) {
      if (entry.isFolder && !entry.name.startsWith("deleted-")) {
        allColors = allColors.concat(await this.getColorsForBrandFolder(entry as any));
      }
    }
    return allColors;
  }

  async getById(id: EntityId): Promise<BrandColor | undefined> {
    const colors = await this.getAll();
    return colors.find((c) => c.id === id);
  }

  async getByBrandId(brandId: EntityId): Promise<BrandColor[]> {
    const brandsFolder = await this.getBrandsFolder();
    const brandFolder = await getFolderIfExists(brandsFolder, brandId);
    if (!brandFolder) return [];
    return this.getColorsForBrandFolder(brandFolder);
  }

  async create(color: BrandColor): Promise<BrandColor> {
    const cloned = cloneValue(color);
    const colors = await this.getByBrandId(color.brandId);
    colors.push(cloned);
    await this.saveColorsForBrand(color.brandId, colors);
    return cloned;
  }

  async update(color: BrandColor): Promise<BrandColor> {
    const cloned = cloneValue(color);
    const colors = await this.getByBrandId(color.brandId);
    const index = colors.findIndex((c) => c.id === color.id);
    if (index === -1) throw new Error("Color not found");
    colors[index] = cloned;
    await this.saveColorsForBrand(color.brandId, colors);
    return cloned;
  }

  async delete(id: EntityId): Promise<void> {
    const color = await this.getById(id);
    if (!color) return;
    const colors = await this.getByBrandId(color.brandId);
    const filtered = colors.filter((c) => c.id !== id);
    await this.saveColorsForBrand(color.brandId, filtered);
  }

  private async getBrandsFolder() {
    return ensureFolder(this.libraryManager.getLibraryFolder(), "brands");
  }

  private async getColorsForBrandFolder(brandFolder: any): Promise<BrandColor[]> {
    const file = await getFileIfExists(brandFolder, "colors.json");
    if (!file) return [];
    try {
      return await readJson<BrandColor[]>(file);
    } catch {
      return [];
    }
  }

  private async saveColorsForBrand(brandId: string, colors: BrandColor[]) {
    const brandsFolder = await this.getBrandsFolder();
    const brandFolder = await ensureFolder(brandsFolder, brandId);
    await writeJsonSafe(brandFolder, "colors.json", colors);
  }
}
