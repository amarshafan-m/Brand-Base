const fs = require('fs');

let code = fs.readFileSync('src/js/main/premiere/PremiereAssetImportService.ts', 'utf8');
code = code.replace(
  "const nativePath = (file as any).nativePath;",
  "const nativePath = typeof file === 'string' ? file : (file as any).nativePath;"
);
fs.writeFileSync('src/js/main/premiere/PremiereAssetImportService.ts', code);

let code2 = fs.readFileSync('src/js/main/premiere/PremiereTimelineService.ts', 'utf8');
code2 = code2.replace(
  "const nativePath = (file as any).nativePath;",
  "const nativePath = typeof file === 'string' ? file : (file as any).nativePath;"
);
fs.writeFileSync('src/js/main/premiere/PremiereTimelineService.ts', code2);

console.log('Patched nativePath resolution');
