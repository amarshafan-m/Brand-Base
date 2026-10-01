const fs = require('fs');
const file = 'src/js/main/services/container.ts';
let code = fs.readFileSync(file, 'utf8');

// I will just use regex to insert updaterService where needed.
// Find the return block: `return {\n    assetRepository,`
code = code.replace(
  /return \{\n    assetRepository,/,
  'return {\n    updaterService,\n    assetRepository,'
);

fs.writeFileSync(file, code);
console.log("Success");
