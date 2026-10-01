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

    const context = await this.premiereAdapter.getContext();
    if (!context.projectAvailable) {
      throw new Error("No Premiere project is open.");
    }

    // Resolve physical path
    const libraryFolder = this.libraryManager.getLibraryFolder();
    if (!libraryFolder) throw new Error("Library not initialized");

    const parts = asset.filePath.split("/"); // e.g. brands/b1/images/file.jpg
    if (parts.length < 3) throw new Error("Invalid asset path structure");

    let current: any = libraryFolder;
    for (let i = 0; i < parts.length - 1; i++) {
      current = await getFolderIfExists(current, parts[i]);
      if (!current) throw new Error("File unavailable (Folder missing)");
    }
    
    const file = await getFileIfExists(current, parts[parts.length - 1]);
    if (!file) throw new Error("File unavailable (Binary missing)");

    const nativePath = (file as any).nativePath;
    if (!nativePath) throw new Error("Could not resolve native OS path for asset.");

    await this.premiereAdapter.importFiles([nativePath]);
  }
}
