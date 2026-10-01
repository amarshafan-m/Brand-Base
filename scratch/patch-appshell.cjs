const fs = require('fs');
let code = fs.readFileSync('src/js/main/layouts/AppShell.tsx', 'utf8');

code = code.replace(
  /"assets", "colors", "typography", "audio", "graphics", "mogrts",/g,
  '"assets", "colors", "typography", "audio", "video", "graphics", "mogrts",'
);

fs.writeFileSync('src/js/main/layouts/AppShell.tsx', code);
console.log('Patched AppShell.tsx');
