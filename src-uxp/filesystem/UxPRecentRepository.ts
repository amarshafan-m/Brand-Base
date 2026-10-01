import { RecentRepository } from "../repositories/contracts";
import { RecentItem, EntityId } from "../domain/models";
import { LibraryManager } from "./LibraryManager";
import { getFileIfExists, readJson, writeJsonSafe } from "./io";
import { cloneValue } from "../utils/clone";

export class UxPRecentRepository implements RecentRepository {
  constructor(private libraryManager: LibraryManager) {}

  async getRecent(limit: number): Promise<RecentItem[]> {
    const items = await this.readAll();
    // Assuming already sorted by timestamp descending or we need to sort it
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return items.slice(0, limit);
  }

  async add(item: RecentItem): Promise<RecentItem> {
    const cloned = cloneValue(item);
    let items = await this.readAll();
    // Remove if same entity exists to promote to top
    items = items.filter(i => i.entityId !== item.entityId);
    items.unshift(cloned);
    // Keep max 100
    if (items.length > 100) items = items.slice(0, 100);
    await this.writeAll(items);
    return cloned;
  }

  async remove(id: EntityId): Promise<void> {
    const items = await this.readAll();
    const filtered = items.filter(i => i.id !== id);
    await this.writeAll(filtered);
  }

  async clear(): Promise<void> {
    await this.writeAll([]);
  }

  private async readAll(): Promise<RecentItem[]> {
    try {
      const folder = this.libraryManager.getLibraryFolder();
      const file = await getFileIfExists(folder, "recent.json");
      if (!file) return [];
      return await readJson<RecentItem[]>(file);
    } catch {
      return [];
    }
  }

  private async writeAll(items: RecentItem[]): Promise<void> {
    const folder = this.libraryManager.getLibraryFolder();
    await writeJsonSafe(folder, "recent.json", items);
  }
}
