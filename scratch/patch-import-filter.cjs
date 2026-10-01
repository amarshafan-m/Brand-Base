const fs = require('fs');
let code = fs.readFileSync('src/js/main/hooks/useAssetImport.ts', 'utf8');

code = code.replace(
  /export function useAssetImport\(activeBrandId: string \| undefined\) \{/,
  "export function useAssetImport(activeBrandId: string | undefined, allowedExtensions?: string[]) {"
);

// Remove the hardcoded extensions array
code = code.replace(
  /const extensions = \[\n\s+"png", "jpg", [^\]]+\];/g,
  `const extensions = allowedExtensions || [
        "png", "jpg", "jpeg", "webp", "svg", "gif", "psd", "psb", "ai", "eps", "pdf", "tif", "tiff",
        "mp4", "mov", "avi", "webm", "m4v", "mkv", "mxf", "prores",
        "mp3", "wav", "aac", "m4a", "aif", "aiff", "flac",
        "mogrt", "prproj", "aep", "prfpset",
        "ttf", "otf", "woff", "woff2"
      ];`
);

fs.writeFileSync('src/js/main/hooks/useAssetImport.ts', code);
console.log('Patched useAssetImport.ts');
