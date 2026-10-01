const fs = require('fs');
let code = fs.readFileSync('src/js/main/components/TimelinePlacementModal.tsx', 'utf8');

code = code.replace(
  "width: '420px'",
  "width: '460px'"
);

// Add whiteSpace: nowrap to the flex labels for Use Playhead and Custom Timecode
code = code.replace(
  /cursor: 'pointer', color: mode === 'playhead' \? '#fff' : '#9ca3af' }}/g,
  "cursor: 'pointer', color: mode === 'playhead' ? '#fff' : '#9ca3af', whiteSpace: 'nowrap' }}"
);
code = code.replace(
  /cursor: 'pointer', color: mode === 'custom' \? '#fff' : '#9ca3af' }}/g,
  "cursor: 'pointer', color: mode === 'custom' ? '#fff' : '#9ca3af', whiteSpace: 'nowrap' }}"
);
code = code.replace(
  /cursor: 'not-allowed', color: '#9ca3af' }}/g,
  "cursor: 'not-allowed', color: '#9ca3af', whiteSpace: 'nowrap' }}"
);

fs.writeFileSync('src/js/main/components/TimelinePlacementModal.tsx', code);
console.log('Patched modal width');
