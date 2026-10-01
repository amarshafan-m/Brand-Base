const fs = require('fs');

function getFontFamily(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(12);
    fs.readSync(fd, buffer, 0, 12, 0);
    
    // Check if TTF/OTF or TTC
    const tag = buffer.toString('utf8', 0, 4);
    if (tag === 'ttcf') {
        // Just fallback to filename for TTC to save time, TTC parsing is slightly complex
        fs.closeSync(fd);
        return null;
    }
    
    const numTables = buffer.readUInt16BE(4);
    const tableRecords = Buffer.alloc(numTables * 16);
    fs.readSync(fd, tableRecords, 0, numTables * 16, 12);
    
    let nameOffset = 0;
    for (let i = 0; i < numTables; i++) {
      const p = i * 16;
      if (tableRecords.toString('utf8', p, p + 4) === 'name') {
        nameOffset = tableRecords.readUInt32BE(p + 8);
        break;
      }
    }
    
    if (!nameOffset) {
        fs.closeSync(fd);
        return null;
    }
    
    // Read name table header
    const nameHeader = Buffer.alloc(6);
    fs.readSync(fd, nameHeader, 0, 6, nameOffset);
    const count = nameHeader.readUInt16BE(2);
    const stringOffset = nameHeader.readUInt16BE(4) + nameOffset;
    
    // Read name records
    const nameRecords = Buffer.alloc(count * 12);
    fs.readSync(fd, nameRecords, 0, count * 12, nameOffset + 6);
    
    let familyName = null;
    
    for (let i = 0; i < count; i++) {
      const p = i * 12;
      const platformID = nameRecords.readUInt16BE(p);
      const encodingID = nameRecords.readUInt16BE(p + 2);
      const nameID = nameRecords.readUInt16BE(p + 6);
      const length = nameRecords.readUInt16BE(p + 8);
      const offset = nameRecords.readUInt16BE(p + 10);
      
      // nameID 1 is Font Family Name
      if (nameID === 1) {
        const strBuf = Buffer.alloc(length);
        fs.readSync(fd, strBuf, 0, length, stringOffset + offset);
        
        if (platformID === 3 || platformID === 0) { // Windows (UTF-16BE) or Unicode
          familyName = strBuf.swap16().toString('utf16le');
        } else if (platformID === 1) { // Mac (MacRoman)
          familyName = strBuf.toString('binary');
        }
        
        // Prefer Windows/Unicode over Mac if both exist, so keep going or break based on preference
        if (platformID === 3 || platformID === 0) break;
      }
    }
    
    fs.closeSync(fd);
    
    // Clean up null bytes from UTF16 conversion sometimes
    return familyName ? familyName.replace(/\0/g, '') : null;
  } catch(e) {
    return null;
  }
}

const os = require('os');
const path = require('path');
const fontDirs = [
  '/System/Library/Fonts',
  '/System/Library/Fonts/Supplemental',
  '/Library/Fonts',
  path.join(os.homedir(), 'Library', 'Fonts'),
  path.join(os.homedir(), 'Library', 'Application Support', 'Adobe', 'CoreSync', 'plugins', 'livetype', '.r')
];

let fonts = [];
console.time('FastRead');
fontDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      if (file.toLowerCase().endsWith('.ttf') || file.toLowerCase().endsWith('.otf') || file.toLowerCase().endsWith('.ttc')) {
        const fullPath = path.join(dir, file);
        let name = getFontFamily(fullPath);
        if (name) {
          fonts.push(name);
        } else {
          // Fallback to filename
          let fn = file.replace(/\.(ttf|otf|ttc)$/i, '').replace(/-(Bold|Regular|Italic|Medium|Light|Thin|Black)$/i, '').replace(/([a-z])([A-Z])/g, '$1 $2');
          fonts.push(fn);
        }
      }
    });
  }
});
console.timeEnd('FastRead');
console.log('Parsed fonts:', new Set(fonts).size);
