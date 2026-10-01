const fs = require('fs');
let code = fs.readFileSync('src/jsx/ppro/brandbase.ts', 'utf8');

code = code.replace(
  "app.project.importFiles([nativePath], true, app.project.getInsertionBin(), false);",
  "var tBin = app.project.rootItem; try { tBin = app.project.getInsertionBin() || app.project.rootItem; } catch(e) {}\n    app.project.importFiles([nativePath], true, tBin, false);"
);

fs.writeFileSync('src/jsx/ppro/brandbase.ts', code);
console.log('Patched bbPlaceOnTimeline');
