const fs = require('fs');
let code = fs.readFileSync('src/js/main/pages/LibraryPage.tsx', 'utf8');

code = code.replace(
  /<div \n                key=\{asset\.id\} \n                onClick=\{\(\) => setSelectedAssetId\(asset\.id\)\}/g,
  `<div \n                className="asset-card"\n                key={asset.id} \n                onClick={() => setSelectedAssetId(asset.id)}`
);

fs.writeFileSync('src/js/main/pages/LibraryPage.tsx', code);
console.log('Patched LibraryPage.tsx for asset-card class');

