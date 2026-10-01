import type { AssetRepository } from "../repositories/contracts";
import type { Asset, AssetSearchCriteria, EntityId } from "../domain/models";
import type { LibraryManager } from "./LibraryManager";
import { ensureFolder, getFileIfExists, getFolderIfExists, readJson, validateEntryName, writeJsonSafe } from "./io";
import { cloneValue } from "../utils/clone";
import { matchesAssetCriteria } from "../utils/asset-query";
import { uxp } from "../globals";

const fs = uxp.storage.localFileSystem;

/**
 * Sanitize a user-facing asset name into a safe filesystem name.
 * - Strips everything except alphanumeric, dash, underscore, period.
 * - Lowercases.
 * - Truncates to 200 characters.
 * - Rejects empty results.
 */
function sanitizeFilename(name: string): string {
  let safe = name.replace(/[^a-z0-9_.\-]/gi, "_").toLowerCase();
  // Collapse multiple underscores
  safe = safe.replace(/_+/g, "_").replace(/^_|_$/g, "");
  // Truncate
  if (safe.length > 200) safe = safe.substring(0, 200);
  // Must not be empty
  if (!safe) safe = "asset";
  // Must not be a reserved name
  const reserved = new Set(["con", "prn", "aux", "nul", "com1", "lpt1"]);
  if (reserved.has(safe)) safe = `_${safe}`;
  return safe;
}

const TYPE_FOLDER_MAP: Record<string, string> = {
  logo: "logos",
  image: "images",
  video: "video",
  audio: "audio",
  music: "audio",
  sfx: "audio",
  graphic: "graphics",
  mogrt: "mogrts",
  template: "templates",
  font: "fonts",
};

function getFolderNameForType(type: string): string {
  return TYPE_FOLDER_MAP[type] || "other";
}

/**
 * Validate that a library-relative path stays inside the library.
 * Rejects absolute paths and traversal attempts.
 */
function assertLibraryRelativePath(filePath: string): void {
  if (!filePath) throw new Error("Asset filePath is empty.");
  // Must not be absolute
  if (filePath.startsWith("/") || filePath.startsWith("\\") || /^[a-z]:/i.test(filePath)) {
    throw new Error("Asset filePath must be library-relative, not absolute.");
  }
  // Must not contain traversal
  const segments = filePath.split(/[/\\]/);
  if (segments.some((s) => s === ".." || s === ".")) {
    throw new Error("Asset filePath contains path traversal.");
  }
}

export class UxPAssetRepository implements AssetRepository {
  constructor(private libraryManager: LibraryManager) {}

  async getAll(): Promise<Asset[]> {
    const brandsFolder = await this.getBrandsFolder();
    const entries = await brandsFolder.getEntries();
    let allAssets: Asset[] = [];
    for (const entry of entries) {
      if (entry.isFolder && !entry.name.startsWith("deleted-")) {
        allAssets = allAssets.concat(await this.getAssetsForBrandFolder(entry as any));
      }
    }
    return allAssets;
  }

  async getById(id: EntityId): Promise<Asset | undefined> {
    const assets = await this.getAll();
    return assets.find((a) => a.id === id);
  }

  async getByBrandId(brandId: EntityId): Promise<Asset[]> {
    const brandsFolder = await this.getBrandsFolder();
    const brandFolder = await getFolderIfExists(brandsFolder, brandId);
    if (!brandFolder) return [];
    return this.getAssetsForBrandFolder(brandFolder);
  }

  async create(asset: Asset): Promise<Asset> {
    const cloned = cloneValue(asset);
    const brandsFolder = await this.getBrandsFolder();
    const brandFolder = await ensureFolder(brandsFolder, asset.brandId);

    // ------------------------------------------------------------------
    // Token resolution: if filePath starts with "uxp-token:", resolve
    // the token, copy the file into the library, and replace with a
    // stable library-relative path BEFORE persisting metadata.
    // ------------------------------------------------------------------
    if (cloned.filePath.startsWith("uxp-token:") || cloned.filePath.startsWith("absolute:")) {
      const isAbsolute = cloned.filePath.startsWith("absolute:");
      const token = isAbsolute ? cloned.filePath.substring("absolute:".length) : cloned.filePath.substring("uxp-token:".length);

      if (!token) {
        throw new Error("Invalid empty UXP token in asset filePath.");
      }

      let sourceFile: any;
      try {
        if (isAbsolute) {
          // @ts-ignore
          const nodeFs = typeof window !== 'undefined' && window.require ? window.require('fs') : require('fs');
          // @ts-ignore
          const nodePath = typeof window !== 'undefined' && window.require ? window.require('path') : require('path');
          sourceFile = {
             isFile: true,
             name: nodePath.basename(token),
             nativePath: token,
             copyTo: async (destFolder: any, opts: any) => {
                 const destPath = nodePath.join(destFolder.nativePath, nodePath.basename(token));
                 if (!opts.overwrite && nodeFs.existsSync(destPath)) throw new Error("EntryExists");
                 await nodeFs.promises.copyFile(token, destPath);
             }
          };
        } else {
          sourceFile = await fs.getEntryForPersistentToken(token);
        }
      } catch {
        throw new Error("Failed to resolve asset source file token. The file may no longer be accessible.");
      }

      if (!sourceFile || !sourceFile.isFile) {
        throw new Error("Asset source token does not point to a valid file.");
      }

      const folderName = getFolderNameForType(cloned.type);
      const destFolder = await ensureFolder(brandFolder, folderName);

      const safeName = sanitizeFilename(cloned.name) + (cloned.extension ? `.${cloned.extension}` : "");

      // Copy file into library
      try {
        await sourceFile.copyTo(destFolder, { overwrite: false });
        // Rename to safe name if needed (copyTo preserves original name)
        const copiedName = sourceFile.name;
        if (copiedName !== safeName) {
          const copiedEntry = await destFolder.getEntry(copiedName);
          await copiedEntry.moveTo(destFolder, { newName: safeName, overwrite: true });
        }
      } catch (copyErr: any) {
        // If overwrite:false fails because file exists, try with overwrite
        if (copyErr?.message?.includes("exists") || copyErr?.code === "EntryExists") {
          await sourceFile.copyTo(destFolder, { overwrite: true });
          const copiedName = sourceFile.name;
          if (copiedName !== safeName) {
            const copiedEntry = await destFolder.getEntry(copiedName);
            await copiedEntry.moveTo(destFolder, { newName: safeName, overwrite: true });
          }
        } else {
          throw new Error("Failed to copy asset file into library: " + String(copyErr));
        }
      }

      // Set the stable library-relative path
      cloned.filePath = `brands/${asset.brandId}/${folderName}/${safeName}`;
    }

    // ------------------------------------------------------------------
    // Verify the final filePath is library-relative and safe
    // ------------------------------------------------------------------
    assertLibraryRelativePath(cloned.filePath);

    // Persist metadata
    const assets = await this.getByBrandId(asset.brandId);
    assets.push(cloned);
    await this.saveAssetsForBrand(brandFolder, assets);
    return cloned;
  }

  async update(asset: Asset): Promise<Asset> {
    const cloned = cloneValue(asset);

    // Tokens must never be persisted in an update
    if (cloned.filePath.startsWith("uxp-token:")) {
      throw new Error("Cannot update an asset with an unresolved UXP token as filePath.");
    }
    assertLibraryRelativePath(cloned.filePath);

    const brandsFolder = await this.getBrandsFolder();
    const brandFolder = await getFolderIfExists(brandsFolder, asset.brandId);
    if (!brandFolder) throw new Error("Brand not found");

    const assets = await this.getAssetsForBrandFolder(brandFolder);
    const index = assets.findIndex((a) => a.id === asset.id);
    if (index === -1) throw new Error("Asset not found");
    assets[index] = cloned;
    await this.saveAssetsForBrand(brandFolder, assets);
    return cloned;
  }

  /**
   * Deletes asset metadata and removes the physical file from the library.
   */
  async delete(id: EntityId): Promise<void> {
    const asset = await this.getById(id);
    if (!asset) return;

    const brandsFolder = await this.getBrandsFolder();
    const brandFolder = await getFolderIfExists(brandsFolder, asset.brandId);
    if (!brandFolder) return;

    // Remove metadata AND physical file
    const assets = await this.getAssetsForBrandFolder(brandFolder);
    const filtered = assets.filter((a) => a.id !== id);
    await this.saveAssetsForBrand(brandFolder, filtered);
    
    // Delete physical file if it's library-relative
    if (asset.filePath && !asset.filePath.startsWith('uxp-token:') && !asset.filePath.startsWith('absolute:')) {
      // BUG FIX: Check if any other asset in the library points to this exact same file path (e.g. metadata duplicates)
      const isShared = filtered.some(a => a.filePath === asset.filePath);
      
      if (!isShared) {
        try {
          const p = typeof window !== 'undefined' && window.require ? window.require('path') : require('path');
          const fsp = typeof window !== 'undefined' && window.require ? window.require('fs').promises : require('fs').promises;
          const f = typeof window !== 'undefined' && window.require ? window.require('fs') : require('fs');
          
          const libPath = this.libraryManager.getLibraryPath();
          const absPath = p.join(libPath, asset.filePath);
          
          if (f.existsSync(absPath)) {
            await fsp.unlink(absPath);
          }
          
          // BUG FIX: Also delete the generated thumbnail to prevent library bloat
          if (asset.metadata && asset.metadata.thumbnailPath) {
            const absThumbPath = p.join(libPath, asset.metadata.thumbnailPath);
            if (f.existsSync(absThumbPath)) {
              await fsp.unlink(absThumbPath);
            }
          }
        } catch (e) {
          console.warn('Could not delete physical asset files:', e);
        }
      }
    }
  }

  async search(criteria: AssetSearchCriteria): Promise<Asset[]> {
    const all = await this.getAll();
    return all.filter((asset) => matchesAssetCriteria(asset, criteria));
  }

  async getFavorites(): Promise<Asset[]> {
    const all = await this.getAll();
    return all.filter((a) => a.favorite);
  }

  private async getBrandsFolder() {
    return ensureFolder(this.libraryManager.getLibraryFolder(), "brands");
  }

  private async getAssetsForBrandFolder(brandFolder: any): Promise<Asset[]> {
    const file = await getFileIfExists(brandFolder, "assets.json");
    if (!file) return [];
    try {
      const assets = await readJson<Asset[]>(file);
      if (!Array.isArray(assets)) return [];
      // Filter out any assets with unresolved tokens (should never happen, but safety)
      return assets.filter((a) => !a.filePath?.startsWith("uxp-token:"));
    } catch {
      return [];
    }
  }

  private async saveAssetsForBrand(brandFolder: any, assets: Asset[]) {
    // Final safety: never persist unresolved tokens
    for (const asset of assets) {
      if (asset.filePath?.startsWith("uxp-token:")) {
        throw new Error(`Refusing to persist asset "${asset.name}" with unresolved UXP token.`);
      }
    }
    await writeJsonSafe(brandFolder, "assets.json", assets);
  }
}
