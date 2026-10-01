const fs = require('fs');
const os = require('os');
const path = require('path');
const opentype = require('opentype.js');

const fontDirs = [
  '/System/Library/Fonts',
  '/System/Library/Fonts/Supplemental',
  '/Library/Fonts',
  path.join(os.homedir(), 'Library', 'Fonts'),
  path.join(os.homedir(), 'Library', 'Application Support', 'Adobe', 'CoreSync', 'plugins', 'livetype', '.r')
];

let fonts = [];
console.time('Read');
fontDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      if (file.toLowerCase().endsWith('.ttf') || file.toLowerCase().endsWith('.otf') || file.toLowerCase().endsWith('.ttc')) {
        const fullPath = path.join(dir, file);
        try {
          const buffer = fs.readFileSync(fullPath);
          const font = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
          let name = null;
          if (font.names.macintosh && font.names.macintosh.fontFamily) name = Object.values(font.names.macintosh.fontFamily)[0];
          else if (font.names.windows && font.names.windows.fontFamily) name = Object.values(font.names.windows.fontFamily)[0];
          
          if (name) fonts.push(name);
        } catch(e) {}
      }
    });
  }
});
console.timeEnd('Read');
console.log('Parsed fonts:', new Set(fonts).size);
