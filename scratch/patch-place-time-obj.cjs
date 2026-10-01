const fs = require('fs');
let code = fs.readFileSync('src/jsx/ppro/brandbase.ts', 'utf8');

code = code.replace(
  /var placeTime = time\.seconds;[\s\S]*?var vt = /m,
  `var placeTime = time.seconds;

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
  
  // MUST pass a Time object, not a Number! 
  // Otherwise Premiere ignores the Number and defaults to playhead.
  var placeTimeObj = seq.getPlayerPosition();
  placeTimeObj.seconds = placeTime;
  
  var vt = `
);

// Replace insertClip/overwriteClip to use placeTimeObj
code = code.replace(/vTrack\.overwriteClip\(targetItem, placeTime\)/g, "vTrack.overwriteClip(targetItem, placeTimeObj)");
code = code.replace(/vTrack\.insertClip\(targetItem, placeTime\)/g, "vTrack.insertClip(targetItem, placeTimeObj)");
code = code.replace(/aTrack\.overwriteClip\(targetItem, placeTime\)/g, "aTrack.overwriteClip(targetItem, placeTimeObj)");
code = code.replace(/aTrack\.insertClip\(targetItem, placeTime\)/g, "aTrack.insertClip(targetItem, placeTimeObj)");

fs.writeFileSync('src/jsx/ppro/brandbase.ts', code);
console.log('Patched ExtendScript to use placeTimeObj (Time object)');
