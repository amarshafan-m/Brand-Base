const fs = require('fs');
let code = fs.readFileSync('src/jsx/index.ts', 'utf8');

code += `\n
import * as brandbase from "./ppro/brandbase";
//@ts-ignore
const host = typeof $ !== 'undefined' ? $ : window;
//@ts-ignore
host["com_brandbase_premiere_cep"] = { ...brandbase, hostMethod };
`;

fs.writeFileSync('src/jsx/index.ts', code);
console.log('Patched src/jsx/index.ts');
