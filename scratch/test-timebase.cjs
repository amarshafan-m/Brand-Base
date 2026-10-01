const fs = require('fs');
let code = fs.readFileSync('src/jsx/ppro/brandbase.ts', 'utf8');

code = code.replace(
  "if (placement.mode !== \"playhead\") {",
  `if (placement.mode !== "playhead") {
    if (placement.customTimecode) {
        var parts = placement.customTimecode.split(':');
        if (parts.length === 4) {
            var h = parseInt(parts[0], 10);
            var m = parseInt(parts[1], 10);
            var s = parseInt(parts[2], 10);
            var f = parseInt(parts[3], 10);
            var totalSeconds = h * 3600 + m * 60 + s;
            var frameTicks = parseInt(seq.timebase, 10);
            time.ticks = String((totalSeconds * 254016000000) + (f * frameTicks));
        }
    }
`
);

fs.writeFileSync('src/jsx/ppro/brandbase.ts', code);
console.log('Patched ExtendScript with timecode parser');
