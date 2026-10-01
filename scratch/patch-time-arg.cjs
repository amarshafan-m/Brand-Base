const fs = require('fs');
let code = fs.readFileSync('src/jsx/ppro/brandbase.ts', 'utf8');

code = code.replace(
  /vTrack\.overwriteClip\(targetItem, time\)/g,
  "vTrack.overwriteClip(targetItem, time.seconds)"
);
code = code.replace(
  /vTrack\.insertClip\(targetItem, time\)/g,
  "vTrack.insertClip(targetItem, time.seconds)"
);
code = code.replace(
  /aTrack\.overwriteClip\(targetItem, time\)/g,
  "aTrack.overwriteClip(targetItem, time.seconds)"
);
code = code.replace(
  /aTrack\.insertClip\(targetItem, time\)/g,
  "aTrack.insertClip(targetItem, time.seconds)"
);

fs.writeFileSync('src/jsx/ppro/brandbase.ts', code);
console.log('Patched ExtendScript to use time.seconds');
