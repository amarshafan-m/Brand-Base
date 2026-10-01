const fs = require('fs');
let code = fs.readFileSync('src/js/main/components/TimelinePlacementModal.tsx', 'utf8');

code = code.replace(
  "width: '400px'",
  "width: '420px'"
);

code = code.replace(
  "Use Playhead",
  "<span style={{ whiteSpace: 'nowrap' }}>Use Playhead</span>"
);

code = code.replace(
  "Custom Timecode",
  "<span style={{ whiteSpace: 'nowrap' }}>Custom Timecode</span>"
);

// We need to add flexShrink: 0 to the circles so they don't squash
code = code.replace(
  /width: '16px', height: '16px', borderRadius: '50%'/g,
  "width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0"
);

fs.writeFileSync('src/js/main/components/TimelinePlacementModal.tsx', code);
console.log('Patched UI width and wrapping');
