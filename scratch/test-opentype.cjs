const fs = require('fs');
const opentype = require('opentype.js');
const fontPath = '/Users/amarshafanm/Library/Application Support/Adobe/CoreSync/plugins/livetype/.r/.13407.otf';
try {
  const buffer = fs.readFileSync(fontPath);
  const font = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
  console.log('Names:', font.names);
} catch (e) {
  console.log(e);
}
