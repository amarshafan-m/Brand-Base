const fs = require('fs');
let code = fs.readFileSync('src/jsx/ppro/brandbase.ts', 'utf8');

code = code.replace(
  /var time = seq\.getPlayerPosition\(\);[\s\S]*?var vt = /m,
  `var time = seq.getPlayerPosition();
  var placeTime = time.seconds;

  if (placement.mode !== "playhead") {
    if (placement.customTimecode) {
        var parts = placement.customTimecode.split(':');
        if (parts.length === 4) {
            var h = parseInt(parts[0], 10) || 0;
            var m = parseInt(parts[1], 10) || 0;
            var s = parseInt(parts[2], 10) || 0;
            var f = parseInt(parts[3], 10) || 0;
            var fps = 254016000000 / parseInt(seq.timebase, 10);
            placeTime = (h * 3600) + (m * 60) + s + (f / fps);
        }
    }
  }
  
  var vt = `
);

// Replace insertClip/overwriteClip to use placeTime
code = code.replace(/vTrack\.overwriteClip\(targetItem, [^\)]+\)/g, "vTrack.overwriteClip(targetItem, placeTime)");
code = code.replace(/vTrack\.insertClip\(targetItem, [^\)]+\)/g, "vTrack.insertClip(targetItem, placeTime)");
code = code.replace(/aTrack\.overwriteClip\(targetItem, [^\)]+\)/g, "aTrack.overwriteClip(targetItem, placeTime)");
code = code.replace(/aTrack\.insertClip\(targetItem, [^\)]+\)/g, "aTrack.insertClip(targetItem, placeTime)");

fs.writeFileSync('src/jsx/ppro/brandbase.ts', code);
console.log('Patched ExtendScript for proper timecode parsing to seconds');
