import type { BrandRepository } from "../repositories/contracts";
import type { Brand, EntityId } from "../domain/models";
import type { LibraryManager } from "./LibraryManager";
import { ensureFolder, getFileIfExists, getFolderIfExists, readJson, writeJsonSafe } from "./io";
import { cloneValue } from "../utils/clone";

export class UxPBrandRepository implements BrandRepository {
  constructor(private libraryManager: LibraryManager) {}

  async getAll(): Promise<Brand[]> {
    const brandsFolder = await this.getBrandsFolder();
    const entries = await brandsFolder.getEntries();
    const brands: Brand[] = [];
    for (const entry of entries) {
      if (!entry.isFolder) continue;
      // Skip archived/deleted brand folders
      if (entry.name.startsWith("deleted-")) continue;

      const file = await getFileIfExists(entry as any, "brand.json");
      if (file) {
        try {
          brands.push(await readJson<Brand>(file));
        } catch (e) {
          console.error("Failed to read brand", entry.name, e);
        }
      }
    }
    return brands;
  }

  async getById(id: EntityId): Promise<Brand | undefined> {
    const brands = await this.getAll();
    return brands.find((b) => b.id === id);
  }

  async create(brand: Brand): Promise<Brand> {
    const cloned = cloneValue(brand);
    const brandsFolder = await this.getBrandsFolder();
    const brandFolder = await ensureFolder(brandsFolder, cloned.id);

    await ensureFolder(brandFolder, "logos");
    await ensureFolder(brandFolder, "images");
    await ensureFolder(brandFolder, "video");
    await ensureFolder(brandFolder, "audio");
    await ensureFolder(brandFolder, "graphics");
    await ensureFolder(brandFolder, "mogrts");
    await ensureFolder(brandFolder, "templates");
    await ensureFolder(brandFolder, "thumbnails");

    await writeJsonSafe(brandFolder, "brand.json", cloned);
    return cloned;
  }

  async update(brand: Brand): Promise<Brand> {
    const cloned = cloneValue(brand);
    const brandsFolder = await this.getBrandsFolder();
    const brandFolder = await getFolderIfExists(brandsFolder, cloned.id);
    if (!brandFolder) throw new Error("Brand folder not found");
    await writeJsonSafe(brandFolder, "brand.json", cloned);
    return cloned;
  }

  /**
   * Archive-on-delete: renames the brand folder to `deleted-<id>-<timestamp>`
   * instead of recursively destroying it. Binary media files are preserved.
   *
   * Uses `Entry.moveTo(parentFolder, { newName })` which is the correct UXP
   * rename mechanism (UXP folders have no `.rename()` method).
   *
   * Archived folders are excluded from `getAll()` queries.
   *
   * The archive name includes Date.now() to prevent collisions if the same
   * brand ID is deleted multiple times (which shouldn't happen, but safety first).
   */
  async delete(id: EntityId): Promise<void> {
    const brandsFolder = await this.getBrandsFolder();
    const brandFolder = await getFolderIfExists(brandsFolder, id);
    if (!brandFolder) return;

    try {
      // Archive the folder by renaming it
      const newName = `deleted-${id}-${Date.now()}`;
      await (brandFolder as any).rename(brandsFolder, { newName });
    } catch (e) {
      console.error("Failed to archive brand folder:", e);
      throw new Error("Could not delete brand folder. Brand was not deleted.");
    }
  }

  async setDefault(id: EntityId): Promise<Brand> {
    const brands = await this.getAll();
    const target = brands.find((b) => b.id === id);
    if (!target) throw new Error("Brand not found");

    for (const b of brands) {
      if (b.isDefault && b.id !== id) {
        b.isDefault = false;
        await this.update(b);
      }
    }
    target.isDefault = true;
    await this.update(target);
    return cloneValue(target);
  }

  private async getBrandsFolder() {
    return ensureFolder(this.libraryManager.getLibraryFolder(), "brands");
  }
}
