const fs = require('fs');
const file = 'src/js/main/components/FontPicker.tsx';
let code = fs.readFileSync(file, 'utf8');

const anchor = '// Deep recursive scanning of Premiere Pro / CEP is removed to prevent UI freezing';
const insertion = `
        // 2. Scan Adobe directories recursively (REVERTED)
        const adobeDirs = os.platform() === 'win32' ? [
          'C:\\\\Program Files\\\\Common Files\\\\Adobe\\\\Fonts',
          'C:\\\\Program Files (x86)\\\\Common Files\\\\Adobe\\\\Fonts',
          path.join(process.env.APPDATA || '', 'Adobe', 'CEP', 'extensions')
        ] : [
          '/Library/Application Support/Adobe/Fonts',
          path.join(os.homedir(), 'Library', 'Application Support', 'Adobe', 'Fonts'),
          path.join(os.homedir(), 'Library', 'Application Support', 'Adobe', 'CEP', 'extensions'),
          '/Library/Application Support/Adobe/CEP/extensions',
          '/Applications/Adobe Premiere Pro 2026/Adobe Premiere Pro 2026.app/Contents/CEP/extensions'
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
        });
`;

if (code.includes(anchor) && !code.includes('adobeDirs.forEach')) {
  code = code.replace(anchor, insertion);
  fs.writeFileSync(file, code);
  console.log("Success");
} else {
  console.log("Already inserted or anchor missing");
}
