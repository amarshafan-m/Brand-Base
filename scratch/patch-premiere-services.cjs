const fs = require('fs');
let code = fs.readFileSync('src/js/main/premiere/PremiereAssetImportService.ts', 'utf8');

code = code.replace(
  `    const context = await this.premiereAdapter.getContext();
    if (!context.projectAvailable) {
      throw new Error("No Premiere project is open.");
    }`,
  ""
);

fs.writeFileSync('src/js/main/premiere/PremiereAssetImportService.ts', code);

let code2 = fs.readFileSync('src/js/main/premiere/PremiereTimelineService.ts', 'utf8');
code2 = code2.replace(
  `    const context = await this.premiereAdapter.getTimelineContext();
    if (!context.sequenceAvailable) {
      throw new Error("No active sequence available.");
    }`,
  ""
);
fs.writeFileSync('src/js/main/premiere/PremiereTimelineService.ts', code2);
console.log('Removed overly strict project availability checks');
