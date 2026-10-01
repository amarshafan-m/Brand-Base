const fs = require('fs');
let code = fs.readFileSync('src/jsx/ppro/brandbase.ts', 'utf8');

code = code.replace(
  /var inserted = false;[\s\S]*?catch\s*\(e\)\s*\{\s*\}/,
  `
  var inserted = false;
  var lastError = "";
  try {
    var vTrack = seq.videoTracks[vt];
    if (vTrack) {
      if (placement.editMode === "overwrite") {
        vTrack.overwriteClip(targetItem, time);
      } else {
        vTrack.insertClip(targetItem, time);
      }
      inserted = true;
    }
  } catch (e) {
    lastError = e.message;
  }

  if (!inserted) {
    var at = placement.audioTrackIndex !== undefined ? placement.audioTrackIndex : 0;
    var aTrack = seq.audioTracks[at];
    if (aTrack) {
      try {
        if (placement.editMode === "overwrite") {
          aTrack.overwriteClip(targetItem, time);
        } else {
          aTrack.insertClip(targetItem, time);
        }
        inserted = true;
      } catch(e) {
        lastError = e.message;
      }
    }
  }
  
  if (!inserted) throw new Error("Failed to place on timeline: " + lastError);
  `
);

fs.writeFileSync('src/jsx/ppro/brandbase.ts', code);
console.log('Patched bbPlaceOnTimeline to throw error');
