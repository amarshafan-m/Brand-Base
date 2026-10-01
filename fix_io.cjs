const fs = require('fs');
const file = 'src/js/main/filesystem/io.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'return JSON.parse(content);',
  `try { return JSON.parse(content); } catch (e) { console.error("Failed to parse JSON file at " + p, e); throw new Error("Invalid JSON file"); }`
);

fs.writeFileSync(file, code);
console.log("Success");
