const fs = require('fs');
const file = 'src/js/main/services/container.ts';
let code = fs.readFileSync(file, 'utf8');

// Fix double instantiation
code = code.replace(
  '  const updaterService = new UpdaterService();\n  const updaterService = new UpdaterService();',
  '  const updaterService = new UpdaterService();'
);

const uxpReturn = `  return {
    assetRepository, brandRepository, colorRepository, typographyRepository, packageRepository, settingsRepository, recentRepository,
    assetService, brandService, colorService, typographyService, packageService, settingsService, recentService, assetIntegrityService, premiereAdapter, premiereAssetImportService, premiereTimelineService, brandExportService, brandImportService,
  };`;
  
const uxpNewReturn = `  const updaterService = new UpdaterService();
  return {
    updaterService,
    assetRepository, brandRepository, colorRepository, typographyRepository, packageRepository, settingsRepository, recentRepository,
    assetService, brandService, colorService, typographyService, packageService, settingsService, recentService, assetIntegrityService, premiereAdapter, premiereAssetImportService, premiereTimelineService, brandExportService, brandImportService,
  };`;

code = code.replace(uxpReturn, uxpNewReturn);

fs.writeFileSync(file, code);
console.log("Success");
