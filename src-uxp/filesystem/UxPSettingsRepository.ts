import { SettingsRepository } from "../repositories/contracts";
import { BrandBaseSettings } from "../domain/models";
import { LibraryManager } from "./LibraryManager";
import { getFileIfExists, readJson, writeJsonSafe } from "./io";
import { createDefaultSettings } from "../domain/defaults";

export class UxPSettingsRepository implements SettingsRepository {
  constructor(private libraryManager: LibraryManager) {}

  async get(): Promise<BrandBaseSettings> {
    try {
      const folder = this.libraryManager.getLibraryFolder();
      const file = await getFileIfExists(folder, "library.json");
      if (!file) return createDefaultSettings();
      const data = await readJson<BrandBaseSettings>(file);
      return {
        ...createDefaultSettings(),
        ...data,
        libraryLocation: this.libraryManager.getLibraryPath(),
      };
    } catch (e) {
      return createDefaultSettings();
    }
  }

  async update(settings: BrandBaseSettings): Promise<BrandBaseSettings> {
    const folder = this.libraryManager.getLibraryFolder();
    await writeJsonSafe(folder, "library.json", settings);
    return settings;
  }
}
