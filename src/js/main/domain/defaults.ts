import { CURRENT_SCHEMA_VERSION } from "./schema";
import type { BrandBaseSettings } from "./models";

export const createDefaultSettings = (): BrandBaseSettings => ({
  theme: "dark",
  compactMode: false,
  gridSize: "medium",
  autoGenerateThumbnails: true,
  confirmDelete: true,
  showFileExtensions: false,
  rememberLastView: true,
  schemaVersion: CURRENT_SCHEMA_VERSION,
});
