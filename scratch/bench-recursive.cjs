const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    try {
      if (fs.statSync(dirFile).isDirectory()) {
        // skip some huge obvious non-font dirs if needed, but whatever
         // optimization
        walkSync(dirFile, filelist);
      } else {
        if (file.toLowerCase().endsWith('.ttf') || file.toLowerCase().endsWith('.otf')) {
          filelist.push(dirFile);
        }
      }
    } catch(e) {}
  }
  return filelist;
}

console.time('Walk');
const pr = walkSync('/Applications/Adobe Premiere Pro 2026/Adobe Premiere Pro 2026.app');
const cep1 = walkSync('/Library/Application Support/Adobe/CEP/extensions');
console.timeEnd('Walk');
console.log('Found:', pr.length + cep1.length);
