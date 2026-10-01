import { useState, useRef } from "react";
import { applicationContainer } from "../app/application";
import { triggerGlobalReload } from "./useApplicationData";
import { getBaseName, detectAssetType, getExtension } from "../utils/file-classification";
import { AssetImportQueue } from "../services/AssetImportQueue";
import { uxp } from "../globals";

export interface DuplicatePrompt {
  file: any;
  token: string;
  name: string;
  type: any;
  extension: string;
  fileSize: number;
  message: string;
}

export function useAssetImport(activeBrandId: string | undefined) {
  const [importing, setImporting] = useState(false);
  const [duplicatePrompt, setDuplicatePrompt] = useState<DuplicatePrompt | null>(null);
  
  const queueRef = useRef<AssetImportQueue | null>(null);

  const importFiles = async () => {
    if (!activeBrandId) {
      alert("No active brand selected. Please select or create a brand to import assets.");
      return;
    }

    try {
      const fs = uxp.storage.localFileSystem;
      
      const extensions = [
        "png", "jpg", "jpeg", "svg", "gif", "psd", "ai", "eps", "pdf",
        "mp4", "mov", "avi", "webm", "m4v", 
        "mp3", "wav", "aac", "m4a", "aif", "aiff",
        "mogrt", "prproj", "txt", "ttf", "otf"
      ];
      
      const files = await fs.getFileForOpening({ allowMultiple: true, types: extensions });
      if (!files) return;
      
      let fileArray: any[] = [];
      if (Array.isArray(files)) {
        fileArray = files;
      } else if (files && typeof (files as any)[Symbol.iterator] === 'function') {
        fileArray = Array.from(files as any);
      } else if (files && typeof (files as any).length === 'number') {
        fileArray = Array.prototype.slice.call(files);
      } else {
        fileArray = [files];
      }
      
      if (fileArray.length === 0) return;

      // Some UXP versions might not strictly have `isFile` boolean flag perfectly set on arrays.
      // We'll filter for anything that has a `name` and is not explicitly a folder.
      const toProcess = fileArray.filter((f: any) => f.isFile || (f.name && !f.isFolder));
      if (toProcess.length === 0) {
         alert("No valid files were selected for import.");
         return;
      }
      
      setImporting(true);

      const queue = new AssetImportQueue(
        async (file, importAnyway) => {
          const token = await fs.createPersistentToken(file as any);
          const name = getBaseName(file.name);
          const extension = getExtension(file.name);
          const type = detectAssetType(file.name);
          const metadataResult = await file.getMetadata();
          const fileSize = metadataResult?.size ?? 0;

          const asset = await applicationContainer.assetService.create({
            brandId: activeBrandId,
            name,
            type,
            category: "Imported",
            filePath: `uxp-token:${token}`,
            extension,
            size: fileSize,
            tags: [],
            favorite: false,
            status: "approved",
            version: "1.0",
            metadata: { originalFilename: file.name },
            importAnyway,
            fileSize
          });
          
          await applicationContainer.recentService.recordImported(asset.id, "asset").catch(console.error);
        },
        (file, error) => {
          setDuplicatePrompt({
            file,
            token: "",
            name: getBaseName(file.name),
            type: detectAssetType(file.name),
            extension: getExtension(file.name),
            fileSize: 0,
            message: error.message
          });
        },
        () => {
          setImporting(false);
          triggerGlobalReload();
        },
        (file, error) => {
          console.error(`Failed to import ${file.name}:`, error);
          alert(`Failed to import ${file.name}: ${error.message}`);
        }
      );
      
      queueRef.current = queue;
      await queue.start(toProcess as any[]);
      
    } catch (e: any) {
      console.error(e);
      alert(`Import failed: ${e.message}`);
      setImporting(false);
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
