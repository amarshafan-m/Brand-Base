const fs = require('fs');
const file = 'src/js/main/layouts/AppShell.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'const { data: settings } = useApplicationData(c => c.settingsService.getSettings(), []);',
  'const loadSettings = React.useCallback((c: any) => c.settingsService.getSettings(), []);\n  const { data: settings } = useApplicationData(loadSettings, [loadSettings]);'
);

if (!code.includes('import React')) {
  code = 'import React from "react";\n' + code;
}

fs.writeFileSync(file, code);
console.log("Success");
