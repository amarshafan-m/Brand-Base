const fs = require('fs');
const file = 'cep.config.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'org: "Amarshafan M",',
  'org: "Amarshafan_M",'
);

fs.writeFileSync(file, code);
console.log("Success");
