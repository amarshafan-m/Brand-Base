import type { PremiereAdapter, TimelinePlacement, PremiereTimelineContext } from "./models";
import type { LibraryManager } from "../filesystem/LibraryManager";
import { getFileIfExists, getFolderIfExists } from "../filesystem/io";
import type { Asset } from "../domain/models";

const TIMELINE_SUPPORTED_TYPES = new Set(["image", "video", "audio", "music", "sfx", "graphic", "logo"]);

export class PremiereTimelineService {
  constructor(
    private readonly premiereAdapter: PremiereAdapter,
    private readonly libraryManager: LibraryManager
  ) {}

  isSupported(assetType: string): boolean {
    return TIMELINE_SUPPORTED_TYPES.has(assetType);
  }
  
  async getTimelineContext(): Promise<PremiereTimelineContext> {
    return this.premiereAdapter.getTimelineContext();
  }

  async placeAssetOnTimeline(asset: Asset, placement: TimelinePlacement): Promise<void> {
    if (!this.isSupported(asset.type)) {
      throw new Error(`Timeline integration unavailable for this asset type: ${asset.type}`);
    }

    const context = await this.premiereAdapter.getTimelineContext();
    if (!context.sequenceAvailable) {
      throw new Error("No active Premiere sequence.");
    }
    
    // validate track index
    if (placement.videoTrackIndex !== undefined && context.videoTrackCount !== undefined) {
      if (placement.videoTrackIndex >= context.videoTrackCount || placement.videoTrackIndex < 0) {
        throw new Error(`Target video track V${placement.videoTrackIndex + 1} does not exist or is invalid.`);
      }
    }

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

    const nativePath = (file as any).nativePath;
    if (!nativePath) throw new Error("Could not resolve native OS path for asset.");

    await this.premiereAdapter.placeOnTimeline(nativePath, placement);
  }
}
