import type { storage } from "uxp";
import { getFileIfExists, getFolderIfExists, readJson, recoverFromBackup } from "./io";
import { CURRENT_SCHEMA_VERSION } from "../domain/schema";

export interface LibraryValidationResult {
  valid: boolean;
  reason?: string;
  recovered?: boolean;
}

export class LibraryValidator {
  async validate(folder: storage.Folder): Promise<LibraryValidationResult> {
    let recovered = false;

    // ------------------------------------------------------------------
    // 1. Recover from interrupted writes on critical files
    // ------------------------------------------------------------------
    for (const criticalFile of ["library.json", "brands.json", "recent.json"]) {
      if (await recoverFromBackup(folder, criticalFile)) {
        recovered = true;
      }
    }

    // ------------------------------------------------------------------
    // 2. library.json must exist and be parseable
    // ------------------------------------------------------------------
    const libraryFile = await getFileIfExists(folder, "library.json");
    if (!libraryFile) {
      return { valid: false, reason: "Missing library.json" };
    }

    let metadata: Record<string, unknown>;
    try {
      metadata = await readJson<Record<string, unknown>>(libraryFile);
    } catch {
      return { valid: false, reason: "Malformed library.json — file cannot be parsed as JSON" };
    }

    if (typeof metadata !== "object" || metadata === null) {
      return { valid: false, reason: "library.json does not contain a valid object" };
    }

    // ------------------------------------------------------------------
    // 3. Schema version check
    // ------------------------------------------------------------------
    const schemaVersion = metadata.schemaVersion;
    if (typeof schemaVersion !== "number" || schemaVersion < 1) {
      return { valid: false, reason: "library.json is missing a valid schemaVersion" };
    }
    if (schemaVersion > CURRENT_SCHEMA_VERSION) {
      return {
        valid: false,
        reason: `Library was created by a newer version (schema v${schemaVersion}, this plugin supports v${CURRENT_SCHEMA_VERSION})`,
      };
    }

    // ------------------------------------------------------------------
    // 4. Required directories
    // ------------------------------------------------------------------
    const brandsFolder = await getFolderIfExists(folder, "brands");
    if (!brandsFolder) {
      return { valid: false, reason: "Missing required 'brands' directory" };
    }

    // ------------------------------------------------------------------
    // 5. brands.json — optional but if present must be parseable
    // ------------------------------------------------------------------
    const brandsFile = await getFileIfExists(folder, "brands.json");
    if (brandsFile) {
      try {
        const brandsData = await readJson<unknown>(brandsFile);
        if (!Array.isArray(brandsData)) {
          return { valid: false, reason: "brands.json is malformed — expected an array" };
        }
      } catch {
        return { valid: false, reason: "brands.json cannot be parsed as JSON" };
      }
    }

    // ------------------------------------------------------------------
    // 6. recent.json — optional but if present must be parseable
    // ------------------------------------------------------------------
    const recentFile = await getFileIfExists(folder, "recent.json");
    if (recentFile) {
      try {
        const recentData = await readJson<unknown>(recentFile);
        if (!Array.isArray(recentData)) {
          return { valid: false, reason: "recent.json is malformed — expected an array" };
        }
      } catch {
        return { valid: false, reason: "recent.json cannot be parsed as JSON" };
      }
    }

    // ------------------------------------------------------------------
    // 7. Validate defaultBrandId if set
    // ------------------------------------------------------------------
    const defaultBrandId = metadata.defaultBrandId;
    if (defaultBrandId !== undefined && defaultBrandId !== null && typeof defaultBrandId === "string" && defaultBrandId.trim()) {
      const brandFolder = await getFolderIfExists(brandsFolder, defaultBrandId);
      if (!brandFolder) {
        // Not a hard failure — we can reset the default.
        // But we report it so the caller is aware.
        console.warn(`LibraryValidator: defaultBrandId "${defaultBrandId}" does not have a matching brand folder.`);
      }
    }

    // ------------------------------------------------------------------
    // 8. Spot-check brand folders for parseable brand.json
    // ------------------------------------------------------------------
    try {
      const brandEntries = await brandsFolder.getEntries();
      for (const entry of brandEntries) {
        if (!entry.isFolder) continue;
        // Skip archived/deleted brand folders
        if (entry.name.startsWith("deleted-")) continue;

        const brandFile = await getFileIfExists(entry as any, "brand.json");
        if (brandFile) {
          try {
            await readJson<Record<string, unknown>>(brandFile);
          } catch {
            console.warn(`LibraryValidator: brand.json in "${entry.name}" is unreadable. Brand may be corrupted.`);
          }
        }
      }
    } catch {
      // Non-fatal — we still consider the library valid
      console.warn("LibraryValidator: could not enumerate brand folders.");
    }

    return { valid: true, recovered };
  }
}

export const libraryValidator = new LibraryValidator();
