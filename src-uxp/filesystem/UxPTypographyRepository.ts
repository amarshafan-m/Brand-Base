import { TypographyRepository } from "../repositories/contracts";
import { TypographyStyle, EntityId } from "../domain/models";
import { LibraryManager } from "./LibraryManager";
import { ensureFolder, getFileIfExists, getFolderIfExists, readJson, writeJsonSafe } from "./io";
import { cloneValue } from "../utils/clone";

export class UxPTypographyRepository implements TypographyRepository {
  constructor(private libraryManager: LibraryManager) {}

  async getAll(): Promise<TypographyStyle[]> {
    const brandsFolder = await this.getBrandsFolder();
    const entries = await brandsFolder.getEntries();
    let allStyles: TypographyStyle[] = [];
    for (const entry of entries) {
      if (entry.isFolder && !entry.name.startsWith("deleted-")) {
        allStyles = allStyles.concat(await this.getStylesForBrandFolder(entry as any));
      }
    }
    return allStyles;
  }

  async getById(id: EntityId): Promise<TypographyStyle | undefined> {
    const styles = await this.getAll();
    return styles.find((s) => s.id === id);
  }

  async getByBrandId(brandId: EntityId): Promise<TypographyStyle[]> {
    const brandsFolder = await this.getBrandsFolder();
    const brandFolder = await getFolderIfExists(brandsFolder, brandId);
    if (!brandFolder) return [];
    return this.getStylesForBrandFolder(brandFolder);
  }

  async create(style: TypographyStyle): Promise<TypographyStyle> {
    const cloned = cloneValue(style);
    const styles = await this.getByBrandId(style.brandId);
    styles.push(cloned);
    await this.saveStylesForBrand(style.brandId, styles);
    return cloned;
  }

  async update(style: TypographyStyle): Promise<TypographyStyle> {
    const cloned = cloneValue(style);
    const styles = await this.getByBrandId(style.brandId);
    const index = styles.findIndex((s) => s.id === style.id);
    if (index === -1) throw new Error("Typography not found");
    styles[index] = cloned;
    await this.saveStylesForBrand(style.brandId, styles);
    return cloned;
  }

  async delete(id: EntityId): Promise<void> {
    const style = await this.getById(id);
    if (!style) return;
    const styles = await this.getByBrandId(style.brandId);
    const filtered = styles.filter((s) => s.id !== id);
    await this.saveStylesForBrand(style.brandId, filtered);
  }

  private async getBrandsFolder() {
    return ensureFolder(this.libraryManager.getLibraryFolder(), "brands");
  }

  private async getStylesForBrandFolder(brandFolder: any): Promise<TypographyStyle[]> {
    const file = await getFileIfExists(brandFolder, "typography.json");
    if (!file) return [];
    try {
      return await readJson<TypographyStyle[]>(file);
    } catch {
      return [];
    }
  }

  private async saveStylesForBrand(brandId: string, styles: TypographyStyle[]) {
    const brandsFolder = await this.getBrandsFolder();
    const brandFolder = await ensureFolder(brandsFolder, brandId);
    await writeJsonSafe(brandFolder, "typography.json", styles);
  }
}
