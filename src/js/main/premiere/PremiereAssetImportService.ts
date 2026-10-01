import type { PremiereAdapter } from "./models";
import type { LibraryManager } from "../filesystem/LibraryManager";
import { getFileIfExists, getFolderIfExists } from "../filesystem/io";
import type { Asset } from "../domain/models";

const SUPPORTED_TYPES = new Set(["image", "video", "audio", "music", "sfx", "graphic", "logo"]);

export class PremiereAssetImportService {
  constructor(
    private readonly premiereAdapter: PremiereAdapter,
    private readonly libraryManager: LibraryManager
  ) {}

  isSupported(assetType: string): boolean {
    return SUPPORTED_TYPES.has(assetType);
  }

  async importAsset(asset: Asset): Promise<void> {
    if (!this.isSupported(asset.type)) {
      throw new Error(`Premiere integration unavailable for this asset type: ${asset.type}`);
    }

    let nativePath: string;

    // Handle absolute paths (set during import from file chooser)
    if (asset.filePath.startsWith('absolute:')) {
      nativePath = asset.filePath.substring(9);
    } else {
      // Resolve through library folder structure
      const libPath = this.libraryManager.getLibraryPath();
      if (!libPath) throw new Error("Library not initialized");

      // Build the full native path directly using Node.js path module
      const nodePath = (window as any).require ? (window as any).require('path') : null;
      const nodeFs = (window as any).require ? (window as any).require('fs') : null;

      if (nodePath && nodeFs) {
        // Direct path resolution — most reliable cross-platform approach
        const fullPath = nodePath.join(libPath, asset.filePath);
        if (nodeFs.existsSync(fullPath)) {
          nativePath = fullPath;
        } else {
          throw new Error("File unavailable: " + asset.filePath);
        }
      } else {
        // Fallback: walk through NodeFolder objects
        const libraryFolder = this.libraryManager.getLibraryFolder();
        if (!libraryFolder) throw new Error("Library not initialized");

        const parts = asset.filePath.split("/");
        if (parts.length < 3) throw new Error("Invalid asset path structure");

        let current: any = libraryFolder;
        for (let i = 0; i < parts.length - 1; i++) {
          current = await getFolderIfExists(current, parts[i]);
          if (!current) throw new Error("File unavailable (Folder missing)");
        }
        
        const file = await getFileIfExists(current, parts[parts.length - 1]);
        if (!file) throw new Error("File unavailable (Binary missing)");

        nativePath = typeof file === 'string' ? file : (file as any).nativePath;
      }
    }

    if (!nativePath) throw new Error("Could not resolve native OS path for asset.");

    await this.premiereAdapter.importFiles([nativePath]);
  }
}
