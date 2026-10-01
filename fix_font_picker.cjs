const fs = require('fs');
const file = 'src/js/main/components/FontPicker.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCode = `        fontDirs.forEach(dir => {
          if (fs.existsSync(dir)) {
            try {
              const files = fs.readdirSync(dir);
              files.forEach((file: string) => {
                if (file.toLowerCase().endsWith('.ttf') || file.toLowerCase().endsWith('.otf') || file.toLowerCase().endsWith('.ttc')) {
                  const fullPath = path.join(dir, file);
                  let name = getFontFamily(fullPath);
                  if (!name) name = file.replace(/\\.(ttf|otf|ttc)$/i, '').replace(/-(Bold|Regular|Italic|Medium|Light|Thin|Black)$/i, '').replace(/([a-z])([A-Z])/g, '$1 $2');
                  if (name) fontSet.add(name);
                }
              });
            } catch (e) {
              // Ignore
            }
          }
        });`;

const newCode = `        // 1. Scan standard directories flat
        fontDirs.forEach(dir => {
          if (fs.existsSync(dir)) {
            try {
              const files = fs.readdirSync(dir);
              files.forEach((file: string) => {
                if (file.toLowerCase().endsWith('.ttf') || file.toLowerCase().endsWith('.otf') || file.toLowerCase().endsWith('.ttc')) {
                  const fullPath = path.join(dir, file);
                  let name = getFontFamily(fullPath);
                  if (!name) name = file.replace(/\\.(ttf|otf|ttc)$/i, '').replace(/-(Bold|Regular|Italic|Medium|Light|Thin|Black)$/i, '').replace(/([a-z])([A-Z])/g, '$1 $2');
                  if (name) fontSet.add(name);
                }
              });
            } catch (e) {
              // Ignore
            }
          }
        });

        // 2. Scan Adobe directories recursively (REVERTED)
        const adobeDirs = os.platform() === 'win32' ? [
          'C:\\\\Program Files\\\\Common Files\\\\Adobe\\\\Fonts',
          'C:\\\\Program Files (x86)\\\\Common Files\\\\Adobe\\\\Fonts',
          path.join(process.env.APPDATA || '', 'Adobe', 'CEP', 'extensions')
        ] : [
          '/Library/Application Support/Adobe/Fonts',
          path.join(os.homedir(), 'Library', 'Application Support', 'Adobe', 'Fonts'),
          path.join(os.homedir(), 'Library', 'Application Support', 'Adobe', 'CEP', 'extensions'),
          '/Library/Application Support/Adobe/CEP/extensions'
        ];

        adobeDirs.forEach(dir => {
          if (fs.existsSync(dir)) {
            try {
              const files = walkSync(dir);
              files.forEach((fullPath: string) => {
                let name = getFontFamily(fullPath);
                if (!name) name = path.basename(fullPath).replace(/\\.(ttf|otf|ttc)$/i, '').replace(/-(Bold|Regular|Italic|Medium|Light|Thin|Black)$/i, '').replace(/([a-z])([A-Z])/g, '$1 $2');
                if (name) fontSet.add(name);
              });
            } catch (e) {}
          }
        });`;

code = code.replace(oldCode, newCode);
fs.writeFileSync(file, code);
console.log("Success");
