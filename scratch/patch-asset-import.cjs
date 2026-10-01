const fs = require('fs');
const path = 'src/js/main/hooks/useAssetImport.ts';
let code = `import { useState, useRef } from "react";
import { applicationContainer } from "../app/application";
import { triggerGlobalReload } from "./useApplicationData";
import { getBaseName, detectAssetType, getExtension } from "../utils/file-classification";
import { AssetImportQueue } from "../services/AssetImportQueue";
// @ts-ignore
const nodeFs = require('fs');
// @ts-ignore
const nodePath = require('path');

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
      // @ts-ignore
      if (!window.cep || !window.cep.fs) {
          alert("CEP filesystem not available.");
          return;
      }
      
      const extensions = [
        "png", "jpg", "jpeg", "svg", "gif", "psd", "ai", "eps", "pdf",
        "mp4", "mov", "avi", "webm", "m4v", 
        "mp3", "wav", "aac", "m4a", "aif", "aiff",
        "mogrt", "prproj", "txt", "ttf", "otf"
      ];
      
      // CEP showOpenDialog(allowMultiple, chooseDirectory, title, initialPath, fileTypes)
      // @ts-ignore
      const result = window.cep.fs.showOpenDialog(true, false, "Select Assets to Import", "", extensions);
      if (result.err) {
         console.error(result.err);
         return;
      }
      
      const files = result.data; // Array of absolute string paths
      if (!files || files.length === 0) return;
      
      setImporting(true);

      const queue = new AssetImportQueue(
        async (filePath, importAnyway) => {
          const name = getBaseName(nodePath.basename(filePath));
          const extension = getExtension(nodePath.basename(filePath));
          const type = detectAssetType(nodePath.basename(filePath));
          const stat = nodeFs.statSync(filePath);
          const fileSize = stat.size;

          const asset = await applicationContainer.assetService.create({
            brandId: activeBrandId,
            name,
            type,
            category: "Imported",
            filePath: \`absolute:\${filePath}\`,
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
          
          await applicationContainer.recentService.recordImported(asset.id, "asset").catch(console.error);
        },
        (filePath, error) => {
          setDuplicatePrompt({
            file: filePath,
            token: "",
            name: getBaseName(nodePath.basename(filePath)),
            type: detectAssetType(nodePath.basename(filePath)),
            extension: getExtension(nodePath.basename(filePath)),
            fileSize: 0,
            message: error.message
          });
        },
        () => {
          setImporting(false);
          triggerGlobalReload();
        },
        (filePath, error) => {
          console.error(\`Failed to import \${filePath}:\`, error);
          alert(\`Failed to import \${nodePath.basename(filePath)}: \${error.message}\`);
        }
      );
      
      queueRef.current = queue;
      await queue.start(files);
      
    } catch (e: any) {
      console.error(e);
      alert(\`Import failed: \${e.message}\`);
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
`;
fs.writeFileSync(path, code);
