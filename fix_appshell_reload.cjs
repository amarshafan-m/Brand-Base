const fs = require('fs');
const file = 'src/js/main/layouts/AppShell.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import { useApplicationData, triggerGlobalReload }')) {
  code = code.replace(
    'import { useApplicationData } from "../hooks/useApplicationData";',
    'import { useApplicationData, triggerGlobalReload } from "../hooks/useApplicationData";'
  );
}

fs.writeFileSync(file, code);
console.log("Success");
