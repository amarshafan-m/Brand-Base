const fs = require('fs');
let code = fs.readFileSync('src/jsx/ppro/brandbase.ts', 'utf8');

code = code.replace(
  "return app.project.importFiles(filePaths, true, app.project.getInsertionBin(), false);",
  "var targetBin = app.project.rootItem;\n  try { targetBin = app.project.getInsertionBin() || app.project.rootItem; } catch(e) {}\n  return app.project.importFiles(filePaths, true, targetBin, false);"
);

fs.writeFileSync('src/jsx/ppro/brandbase.ts', code);
console.log('Patched bbImportFiles');
