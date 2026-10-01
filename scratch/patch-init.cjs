const fs = require('fs');
let code = fs.readFileSync('src/js/main/index-react.tsx', 'utf8');

code = code.replace(
  'import { initializeCEP } from "../lib/utils/init-cep";',
  'import { initializeCEP } from "../lib/utils/init-cep";\nimport { initBolt } from "../lib/utils/bolt";'
);

code = code.replace(
  'initializeCEP();',
  'initializeCEP();\ninitBolt(true);'
);

fs.writeFileSync('src/js/main/index-react.tsx', code);
console.log('Patched index-react.tsx to call initBolt');
