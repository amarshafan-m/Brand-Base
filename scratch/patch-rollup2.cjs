const fs = require('fs');
let code = fs.readFileSync('vite.es.config.ts', 'utf8');

code = code.replace(
  "      name: cepConfig.id.replace(/\\./g, '_'),",
  "      name: `window['${cepConfig.id}']`," // Wait, Rollup name must be a valid identifier or deep property. 'com.brandbase.premiere.cep' might work. Let's try it.
);
code = code.replace("`window['${cepConfig.id}']`", "cepConfig.id");

fs.writeFileSync('vite.es.config.ts', code);
console.log('Patched rollup config to use exact ID');
