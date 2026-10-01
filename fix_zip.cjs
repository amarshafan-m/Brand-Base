const fs = require('fs');
const file = 'src/js/main/filesystem/BrandExportService.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'const relativeDir = path.dirname(asset.filePath).replace(/\\\\/g, \'/\');',
  'let relativeDir = path.dirname(asset.filePath).replace(/\\\\/g, \'/\');\n            if (relativeDir === \'.\') relativeDir = \'\';'
);

code = code.replace(
  'const relativeDir = path.dirname(asset.metadata.thumbnailPath).replace(/\\\\/g, \'/\');',
  'let relativeDir = path.dirname(asset.metadata.thumbnailPath).replace(/\\\\/g, \'/\');\n            if (relativeDir === \'.\') relativeDir = \'\';'
);

fs.writeFileSync(file, code);
console.log("Success");
