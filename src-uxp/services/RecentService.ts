import type { EntityId, RecentAction, RecentEntityType, RecentItem } from "../domain/models";
import type { RecentRepository } from "../repositories/contracts";
import { now } from "../utils/date";
import type { IdGenerator } from "../utils/id";

export const MAX_RECENT_ITEMS = 50;

export class RecentService {
  constructor(private readonly recent: RecentRepository, private readonly ids: IdGenerator) {}
  getRecent = (limit = MAX_RECENT_ITEMS): Promise<RecentItem[]> => this.recent.getRecent(Math.min(Math.max(0, limit), MAX_RECENT_ITEMS));
  recordViewed = (entityId: EntityId, entityType: RecentEntityType): Promise<RecentItem> => this.record(entityId, entityType, "viewed");
  recordCreated = (entityId: EntityId, entityType: RecentEntityType): Promise<RecentItem> => this.record(entityId, entityType, "created");
  recordUpdated = (entityId: EntityId, entityType: RecentEntityType): Promise<RecentItem> => this.record(entityId, entityType, "updated");
  recordImported = (entityId: EntityId, entityType: RecentEntityType): Promise<RecentItem> => this.record(entityId, entityType, "imported");

  private async record(entityId: EntityId, entityType: RecentEntityType, action: RecentAction): Promise<RecentItem> {
    const item = await this.recent.add({ id: this.ids.generate(), entityId, entityType, action, timestamp: now() });
    const items = await this.recent.getRecent(MAX_RECENT_ITEMS + 1);
    await Promise.all(items.slice(MAX_RECENT_ITEMS).map((stale) => this.recent.remove(stale.id)));
    return item;
  }
}
