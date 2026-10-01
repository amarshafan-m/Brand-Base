import type { EntityId, Asset } from "../domain/models";
import type { AssetRepository, BrandRepository } from "../repositories/contracts";
import type { LibraryManager } from "../filesystem/LibraryManager";
import { getFolderIfExists } from "../filesystem/io";

export interface OrphanBinary {
  path: string;
  filename: string;
  extension: string;
  size: number;
}

export interface IntegrityReport {
  healthy: Asset[];
  broken: Asset[];
  orphans: OrphanBinary[];
}

export class AssetIntegrityService {
  constructor(
    private readonly assets: AssetRepository,
    private readonly brands: BrandRepository,
    private readonly libraryManager: LibraryManager
  ) {}

  async checkBrand(brandId: EntityId): Promise<IntegrityReport> {
    const brand = await this.brands.getById(brandId);
    if (!brand) throw new Error(`Brand ${brandId} not found`);

    const assets = await this.assets.getByBrandId(brandId);
    const healthy: Asset[] = [];
    const broken: Asset[] = [];
    const orphans: OrphanBinary[] = [];

    // Find physical files
    const libraryFolder = this.libraryManager.getLibraryFolder();
    if (!libraryFolder) throw new Error("Library not initialized");

    const brandsFolder = await getFolderIfExists(libraryFolder, "brands");
    const brandFolder = brandsFolder ? await getFolderIfExists(brandsFolder, brandId) : null;
    
    const physicalFiles = new Map<string, any>(); // library-relative path -> file size
    
    if (brandFolder) {
      const folders = await brandFolder.getEntries();
      for (const folder of folders) {
        if (folder.isFolder && folder.name !== "deleted") {
          const files = await folder.getEntries();
          for (const file of files) {
            if (file.isFile && file.name !== "assets.json") {
              const relativePath = `brands/${brandId}/${folder.name}/${file.name}`;
              try {
                const metadata = await file.getMetadata();
                physicalFiles.set(relativePath, { size: metadata?.size || 0 });
              } catch {
                physicalFiles.set(relativePath, { size: 0 });
              }
            }
          }
        }
      }
    }

    // Check Metadata vs Physical
    const trackedPaths = new Set<string>();
    
    for (const asset of assets) {
      if (asset.filePath.startsWith("uxp-token:")) {
         // Should never be persisted, but if it is, it's broken
         broken.push(asset);
         continue;
      }
      
      trackedPaths.add(asset.filePath);
      if (physicalFiles.has(asset.filePath)) {
        healthy.push(asset);
      } else {
        broken.push(asset);
      }
    }

    // Identify Orphans
    for (const [path, info] of physicalFiles.entries()) {
      if (!trackedPaths.has(path)) {
        const parts = path.split("/");
        const filename = parts[parts.length - 1];
        const extParts = filename.split(".");
        const extension = extParts.length > 1 ? extParts[extParts.length - 1].toLowerCase() : "";
        
        orphans.push({
          path,
          filename,
          extension,
          size: info.size
        });
      }
    }

    return { healthy, broken, orphans };
  }
}
