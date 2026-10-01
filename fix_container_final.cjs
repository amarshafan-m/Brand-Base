const fs = require('fs');
const file = 'src/js/main/services/container.ts';
let code = fs.readFileSync(file, 'utf8');

// 1. Clean up my bad injections
code = code.replace(/updaterService, /g, '');
code = code.replace(/    updaterService,\n/g, '');

// 2. We need to instantiate UpdaterService in both containers (or at least provide it)
const importStr = 'import { UpdaterService } from "./UpdaterService";';
if (!code.includes(importStr)) {
  code = code.replace(
    'import { SettingsService } from "./SettingsService";',
    'import { SettingsService } from "./SettingsService";\nimport { UpdaterService } from "./UpdaterService";'
  );
}

// 3. Inject instantiation in createWebStorageApplicationContainer
code = code.replace(
  'const brandImportService = new BrandImportService(brandService, assetService, colorService, typographyService, libraryManager);',
  'const brandImportService = new BrandImportService(brandService, assetService, colorService, typographyService, libraryManager);\n  const updaterService = new UpdaterService();'
);
// And return it
code = code.replace(
  /return \{\n\s*assetRepository,/,
  'return {\n    updaterService,\n    assetRepository,'
);

// 4. Inject instantiation in createUxpApplicationContainer
code = code.replace(
  'const brandImportService = new BrandImportService(brandService, assetService, colorService, typographyService, libraryManager);',
  'const brandImportService = new BrandImportService(brandService, assetService, colorService, typographyService, libraryManager);\n  const updaterService = new UpdaterService();'
);
// And return it (it might be the second match of return {)
// Let's do it safely
code = code.replace(
  /return \{\n\s*assetRepository: uxpAssetRepo,/,
  'return {\n    updaterService,\n    assetRepository: uxpAssetRepo,'
);

fs.writeFileSync(file, code);
console.log("Success");
