const fs = require('fs');
const path = require('path');
// ... copy getFontFamily from before
function getFontFamily(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(12);
    fs.readSync(fd, buffer, 0, 12, 0);
    const tag = buffer.toString('utf8', 0, 4);
    if (tag === 'ttcf') { fs.closeSync(fd); return null; }
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
    if (!nameOffset) { fs.closeSync(fd); return null; }
    const nameHeader = Buffer.alloc(6);
    fs.readSync(fd, nameHeader, 0, 6, nameOffset);
    const count = nameHeader.readUInt16BE(2);
    const stringOffset = nameHeader.readUInt16BE(4) + nameOffset;
    const nameRecords = Buffer.alloc(count * 12);
    fs.readSync(fd, nameRecords, 0, count * 12, nameOffset + 6);
    let familyName = null;
    for (let i = 0; i < count; i++) {
      const p = i * 12;
      const platformID = nameRecords.readUInt16BE(p);
      const nameID = nameRecords.readUInt16BE(p + 6);
      const length = nameRecords.readUInt16BE(p + 8);
      const offset = nameRecords.readUInt16BE(p + 10);
      if (nameID === 1) {
        const strBuf = Buffer.alloc(length);
        fs.readSync(fd, strBuf, 0, length, stringOffset + offset);
        if (platformID === 3 || platformID === 0) { familyName = strBuf.swap16().toString('utf16le'); } 
        else if (platformID === 1) { familyName = strBuf.toString('binary'); }
        if (platformID === 3 || platformID === 0) break;
      }
    }
    fs.closeSync(fd);
    return familyName ? familyName.replace(/\0/g, '') : null;
  } catch(e) { return null; }
}

const p = '/Applications/Adobe Premiere Pro 2026/Adobe Premiere Pro 2026.app/Contents/CEP/extensions/com.adobe.frameio/fonts/2BBD24_0_unhinted_0.ttf';
console.log("Real Name:", getFontFamily(p));
