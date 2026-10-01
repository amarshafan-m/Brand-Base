const fs = require('fs');
let code = fs.readFileSync('src/js/main/pages/LibraryPage.tsx', 'utf8');

const getExtString = `
  const getExtensionsForPage = (p: string): string[] | undefined => {
    if (p === "audio") return ["mp3", "wav", "aac", "m4a", "aif", "aiff", "flac"];
    if (p === "graphics") return ["png", "jpg", "jpeg", "webp", "svg", "gif", "psd", "psb", "ai", "eps", "pdf", "tif", "tiff"];
    if (p === "video") return ["mp4", "mov", "avi", "webm", "m4v", "mkv", "mxf", "prores"];
    if (p === "mogrts") return ["mogrt"];
    if (p === "templates") return ["prproj", "aep"];
    if (p === "presets") return ["prfpset"];
    return undefined;
  };
`;

code = code.replace(
  /const \{ importFiles: _importFiles, importing, duplicatePrompt, handleDuplicateResolve \} = useAssetImport\(activeBrandId\);/,
  getExtString + "\n  const { importFiles: _importFiles, importing, duplicatePrompt, handleDuplicateResolve } = useAssetImport(activeBrandId, getExtensionsForPage(page));"
);

code = code.replace(
  /if \(p === "audio"\) return \["audio", "music", "sfx"\];/,
  'if (p === "audio") return ["audio", "music", "sfx"];\n    if (p === "video") return ["video"];'
);

code = code.replace(
  /page === "audio" \? "Audio" :/,
  'page === "audio" ? "Audio" :\n             page === "video" ? "Video" :'
);

code = code.replace(
  /Drop audio files here/,
  'Drop {page === "video" ? "video" : page} files here'
);

fs.writeFileSync('src/js/main/pages/LibraryPage.tsx', code);
console.log('Patched LibraryPage.tsx');
