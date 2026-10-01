const fs = require('fs');
const path = 'src/js/main/main.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/import \{ evalScript \} from "\.\/lib\/utils\/cep";/, 'import { evalScript } from "./lib/utils/cep";');
code += `\nsetTimeout(async () => {
  try {
    const res = await evalScript("var o=[]; for(var k in app){ if(k.toLowerCase().indexOf('font') !== -1) o.push(k); } JSON.stringify(o);");
    console.log("Premiere Font Properties:", res);
  } catch(e) {}
}, 2000);`;
fs.writeFileSync(path, code);
