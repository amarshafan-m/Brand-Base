const fs = require('fs');
const path = 'src/js/main/components/FontPicker.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace the deepScanDirs logic
const oldLogic = `        deepScanDirs.forEach(dir => {
          const files = walkSync(dir);
          files.forEach(fullPath => {
             let name = getFontFamily(fullPath);
             if (!name) name = path.basename(fullPath).replace(/\\.(ttf|otf|ttc)$/i, '').replace(/-(Bold|Regular|Italic|Medium|Light|Thin|Black)$/i, '').replace(/([a-z])([A-Z])/g, '$1 $2');
             if (name) fontSet.add(name);
          });
        });`;

const newLogic = `        deepScanDirs.forEach(dir => {
          const files = walkSync(dir);
          files.forEach(fullPath => {
             let name = getFontFamily(fullPath);
             // Skip if no valid name found in TTF headers (prevents garbage like 2BBD24_0_unhinted_0)
             if (name && !name.toLowerCase().includes("unhinted")) fontSet.add(name);
          });
        });`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync(path, code);
