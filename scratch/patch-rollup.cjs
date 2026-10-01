const fs = require('fs');
let code = fs.readFileSync('vite.es.config.ts', 'utf8');

code = code.replace(
  "    output: {\n      file: outPath,",
  "    output: {\n      file: outPath,\n      format: 'iife',\n      name: cepConfig.id.replace(/\\./g, '_'),"
);

fs.writeFileSync('vite.es.config.ts', code);
console.log('Patched rollup config');
