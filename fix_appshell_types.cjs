const fs = require('fs');
const file = 'src/js/main/layouts/AppShell.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'const loadSettings = React.useCallback((c: any) => c.settingsService.getSettings(), []);',
  'const loadSettings = React.useCallback(async (c: any) => await c.settingsService.getSettings(), []);'
);

// If the type still fails, we can add import type { ApplicationContainer } and type it correctly
if (!code.includes('import type { ApplicationContainer }')) {
    code = 'import type { ApplicationContainer } from "../services/container";\n' + code;
    code = code.replace(
        'const loadSettings = React.useCallback(async (c: any) => await c.settingsService.getSettings(), []);',
        'const loadSettings = React.useCallback(async (c: ApplicationContainer) => await c.settingsService.getSettings(), []);'
    );
}

fs.writeFileSync(file, code);
console.log("Success");
