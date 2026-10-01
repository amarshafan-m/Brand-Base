const fs = require('fs');
let code = fs.readFileSync('src/jsx/ppro/brandbase.ts', 'utf8');

code = code.replace(
  /vTrack\.overwriteClip\(targetItem, time\.seconds\)/g,
  "vTrack.overwriteClip(targetItem, time.ticks)"
);
code = code.replace(
  /vTrack\.insertClip\(targetItem, time\.seconds\)/g,
  "vTrack.insertClip(targetItem, time.ticks)"
);
code = code.replace(
  /aTrack\.overwriteClip\(targetItem, time\.seconds\)/g,
  "aTrack.overwriteClip(targetItem, time.ticks)"
);
code = code.replace(
  /aTrack\.insertClip\(targetItem, time\.seconds\)/g,
  "aTrack.insertClip(targetItem, time.ticks)"
);

fs.writeFileSync('src/jsx/ppro/brandbase.ts', code);
console.log('Patched ExtendScript to use time.ticks');
