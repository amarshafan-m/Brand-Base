const fs = require('fs');
const path = require('path');
const os = require('os');

const fontDirs = [
  '/System/Library/Fonts',
  '/System/Library/Fonts/Supplemental',
  '/Library/Fonts',
  path.join(os.homedir(), 'Library', 'Fonts')
];

let count = 0;
fontDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    count += files.length;
    console.log(dir, files.length);
  } else {
    console.log(dir, 'MISSING');
  }
});
console.log('Total files:', count);
