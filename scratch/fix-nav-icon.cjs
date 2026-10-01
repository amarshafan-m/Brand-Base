const fs = require('fs');
let code = fs.readFileSync('src/js/main/types/navigation.ts', 'utf8');
code = code.replace(
  /\| "audio"\n  \| "graphics"/g,
  '| "audio"\n  | "video"\n  | "graphics"'
);
fs.writeFileSync('src/js/main/types/navigation.ts', code);
