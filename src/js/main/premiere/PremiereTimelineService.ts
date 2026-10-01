import type { PremiereAdapter, TimelinePlacement, PremiereTimelineContext } from "./models";
import type { LibraryManager } from "../filesystem/LibraryManager";
import { getFileIfExists, getFolderIfExists } from "../filesystem/io";
import type { Asset } from "../domain/models";

const TIMELINE_SUPPORTED_TYPES = new Set(["image", "video", "audio", "music", "sfx", "graphic", "logo", "mogrt"]);

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

    let nativePath: string;

    if (asset.filePath.startsWith('absolute:')) {
      nativePath = asset.filePath.substring(9);
    } else {
      // Resolve through library path directly using Node.js — most reliable cross-platform
      const libPath = this.libraryManager.getLibraryPath();
      if (!libPath) throw new Error("Library not initialized");

      const nodePath = (window as any).require ? (window as any).require('path') : null;
      const nodeFs = (window as any).require ? (window as any).require('fs') : null;

      if (nodePath && nodeFs) {
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

    await this.premiereAdapter.placeOnTimeline(nativePath, placement);
  }

  async applyColorToSelection(hexColor: string): Promise<void> {
    if (typeof (this.premiereAdapter as any).applyColorToSelection === 'function') {
      return (this.premiereAdapter as any).applyColorToSelection(hexColor);
    }
  }

  async applyFontToSelection(fontName: string): Promise<void> {
    if (typeof (this.premiereAdapter as any).applyFontToSelection === 'function') {
      return (this.premiereAdapter as any).applyFontToSelection(fontName);
    }
  }

  async createTextLayer(fontFamily: string, fontWeight: string, fontSize: number, text: string, hexColor: string): Promise<any> {
    if (typeof (this.premiereAdapter as any).createTextLayer === 'function') {
      return (this.premiereAdapter as any).createTextLayer(fontFamily, fontWeight, fontSize, text, hexColor);
    }
    throw new Error("Create text layer is not supported in this environment.");
  }
}
