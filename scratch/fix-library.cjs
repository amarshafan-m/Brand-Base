const fs = require('fs');
let code = fs.readFileSync('src/js/main/pages/LibraryPage.tsx', 'utf8');

code = code.replace(
  /\{\s*\(\s*asset\.type === 'audio' \|\| asset\.type === 'music' \|\| asset\.type === 'sfx'\s*\)\s*\?/g,
  `(asset.type === 'audio' || asset.type === 'music' || asset.type === 'sfx') ?`
);

code = code.replace(
  /<\/>\n  \) \}\n                  \)\}/g,
  `/>\n  )\n                  )}`
);

code = code.replace(
  /strokeWidth=\{1\.5\} \/>\n  \) \}/,
  `strokeWidth={1.5} />\n  )`
);

fs.writeFileSync('src/js/main/pages/LibraryPage.tsx', code);
console.log('Fixed LibraryPage syntax error');
