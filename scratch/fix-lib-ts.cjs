const fs = require('fs');
let code = fs.readFileSync('src/js/main/pages/LibraryPage.tsx', 'utf8');
code = code.replace(
  /asset\.type === 'video'/g,
  '(asset.type as string) === "video"'
);
code = code.replace(
  /asset\.type === 'audio'/g,
  '(asset.type as string) === "audio"'
);
code = code.replace(
  /asset\.type === 'music'/g,
  '(asset.type as string) === "music"'
);
code = code.replace(
  /asset\.type === 'sfx'/g,
  '(asset.type as string) === "sfx"'
);
code = code.replace(
  /asset\.type === 'mogrt'/g,
  '(asset.type as string) === "mogrt"'
);
fs.writeFileSync('src/js/main/pages/LibraryPage.tsx', code);
