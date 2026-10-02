import { useState, useRef, useEffect } from "react";
import { applicationContainer } from "../app/application";
import { triggerGlobalReload } from "./useApplicationData";
import { getBaseName, detectAssetType, getExtension } from "../utils/file-classification";
import { AssetImportQueue } from "../services/AssetImportQueue";
import { generateThumbnail, extractMogrtThumbnail } from "../utils/thumbnail";

export interface DuplicatePrompt {
  file: any;
  token: string;
  name: string;
  type: any;
  extension: string;
  fileSize: number;
  message: string;
}

export function useAssetImport(activeBrandId: string | undefined, allowedExtensions?: string[]) {
  const [importing, setImporting] = useState(false);
  const [duplicatePrompt, setDuplicatePrompt] = useState<DuplicatePrompt | null>(null);
  
  const isMounted = useRef(true);
  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);
  
  const queueRef = useRef<AssetImportQueue | null>(null);

  const importFiles = async () => {
    if (!activeBrandId) {
      throw new Error("No active brand selected. Please create or select a brand first.");
    }

    try {
      // @ts-ignore
      if (!window.cep || !window.cep.fs) {
          alert("CEP filesystem not available.");
          return;
      }
      
      const extensions = allowedExtensions || [
        "png", "jpg", "jpeg", "webp", "svg", "gif", "psd", "psb", "ai", "eps", "pdf", "tif", "tiff",
        "mp4", "mov", "avi", "webm", "m4v", "mkv", "mxf", "prores",
        "mp3", "wav", "aac", "m4a", "aif", "aiff", "flac",
        "mogrt", "prproj", "aep",
        "ttf", "otf", "woff", "woff2"
      ];
      
      // CEP showOpenDialogEx(allowMultipleSelection, chooseDirectory, title, initialPath, fileType, friendlyFilePrefix, prompt)
      // showOpenDialogEx properly filters file types on Windows (showOpenDialog does not)
      // Pass the raw extensions array (without dots), CEP handles Windows formatting internally
      const friendlyPrefix = allowedExtensions ? "Supported Files" : "All Brand Base Assets";
      // @ts-ignore
      const result = window.cep.fs.showOpenDialogEx(true, false, "Select Assets to Import", "", extensions, friendlyPrefix, "Import");
      if (result.err || !result.data || result.data.length === 0) {
         return; // User cancelled
      }
      
      const files = result.data.map((p: string) => {
        let cleanPath = p;
        if (cleanPath.startsWith("file://")) {
          cleanPath = decodeURIComponent(cleanPath.replace("file://", ""));
        }
        return cleanPath;
      }); // Array of absolute string paths
      if (!files || files.length === 0) return;
      
      setImporting(true);

      const queue = new AssetImportQueue(
        async (filePath, importAnyway) => {
          const nodeFs = window.require('fs');
          const nodePath = window.require('path');
          const name = getBaseName(nodePath.basename(filePath));
          const extension = getExtension(nodePath.basename(filePath));
          const type = detectAssetType(nodePath.basename(filePath));
          const { fsp } = require('../filesystem/io');
          const stat = fsp ? await fsp.stat(filePath) : nodeFs.statSync(filePath);
          const fileSize = stat.size;

          const asset = await applicationContainer.assetService.create({
            brandId: activeBrandId,
            name,
            type,
            category: "Imported",
            filePath: `absolute:${filePath}`,
            extension,
            size: fileSize,
            tags: [],
            favorite: false,
            status: "approved",
            version: "1.0",
            metadata: { originalFilename: nodePath.basename(filePath) },
            importAnyway,
            fileSize
          });
          
          try {
            const settings = await applicationContainer.settingsService.getSettings();
            if (settings.autoGenerateThumbnails) {
              const libPath = (applicationContainer as any).assetRepository?.libraryManager?.getLibraryPath?.();
              if (libPath && asset.filePath) {
                const absoluteDestPath = nodePath.join(libPath, asset.filePath);
                
                if (type === 'image' || type === 'logo' || type === 'graphic') {
                  const thumbRelativePath = `brands/${activeBrandId}/thumbnails/${asset.id}.webp`;
                  const absoluteThumbPath = nodePath.join(libPath, thumbRelativePath);
                  
                  const success = await generateThumbnail(absoluteDestPath, absoluteThumbPath);
                  if (success) {
                    const updatedAsset = { ...asset, metadata: { ...asset.metadata, thumbnailPath: thumbRelativePath } };
                    await applicationContainer.assetService.update(updatedAsset);
                  }
                } else if (type === 'mogrt') {
                  const thumbRelativePath = `brands/${activeBrandId}/thumbnails/${asset.id}_preview.png`;
                  const absoluteThumbPath = nodePath.join(libPath, thumbRelativePath);
                  
                  // Ensure thumbnail directory exists
                  const fs = typeof window !== 'undefined' && window.require ? window.require('fs') : null;
                  if (fs) {
                     const dir = nodePath.dirname(absoluteThumbPath);
                     if (!fs.existsSync(dir)) {
                         fs.mkdirSync(dir, { recursive: true });
                     }
                  }

                  const success = await extractMogrtThumbnail(absoluteDestPath, absoluteThumbPath);
                  if (success) {
                    const updatedAsset = { ...asset, metadata: { ...asset.metadata, thumbnailPath: thumbRelativePath } };
                    await applicationContainer.assetService.update(updatedAsset);
                  }
                }
              }
            }
          } catch (e) {
            console.warn("Failed to generate thumbnail for", asset.name, e);
          }
          
          await applicationContainer.recentService.recordImported(asset.id, "asset").catch(console.error);
        },
        (filePath, error) => {
          const p = window.require('path');
          setDuplicatePrompt({
            file: filePath,
            token: "",
            name: getBaseName(p.basename(filePath)),
            type: detectAssetType(p.basename(filePath)),
            extension: getExtension(p.basename(filePath)),
            fileSize: 0,
            message: error.message
          });
        },
        () => {
          if (isMounted.current) setImporting(false);
          triggerGlobalReload();
        },
        (filePath, error) => {
          console.error(`Failed to import ${filePath}:`, error);
        }
      );
      
      queueRef.current = queue;
      await queue.start(files);
      
    } catch (e: any) {
      console.error(e);
      if (isMounted.current) setImporting(false);
      throw e;
    }
  };

  const handleDuplicateResolve = async (importAnyway: boolean) => {
    if (!duplicatePrompt || !queueRef.current) {
      setDuplicatePrompt(null);
      return;
    }
    const { file } = duplicatePrompt;
    setDuplicatePrompt(null);
    await queueRef.current.resolveDuplicate(file, importAnyway);
  };

  return {
    importing,
    duplicatePrompt,
    importFiles,
    handleDuplicateResolve
  };
}
