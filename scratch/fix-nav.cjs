const fs = require('fs');
let code = fs.readFileSync('src/js/main/types/navigation.ts', 'utf8');
code = code.replace(
  /\| "graphics"/,
  '| "video"\n  | "graphics"'
); // Just making sure both PageId and IconName have it. Let's do it manually.
fs.writeFileSync('src/js/main/types/navigation.ts', code);
