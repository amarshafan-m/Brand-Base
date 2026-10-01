const fs = require('fs');
const file = 'src/js/main/layouts/AppShell.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import { activeContainer as applicationContainer }')) {
  code = code.replace(
    'import type { ApplicationContainer } from "../services/container";',
    'import type { ApplicationContainer } from "../services/container";\nimport { activeContainer as applicationContainer } from "../services/container";'
  );
}

fs.writeFileSync(file, code);
console.log("Success");
