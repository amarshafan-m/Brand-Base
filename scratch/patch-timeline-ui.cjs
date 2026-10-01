const fs = require('fs');
let code = fs.readFileSync('src/js/main/components/TimelinePlacementModal.tsx', 'utf8');

// Replace standard radios with custom styled ones
code = code.replace(
  /<label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>\s*<input type="radio" checked={mode === "playhead"} onChange={\(\) => setMode\("playhead"\)} \/> Use Playhead\s*<\/label>/g,
  `<label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: mode === 'playhead' ? '#fff' : '#9ca3af' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: \`1px solid \${mode === 'playhead' ? '#3b82f6' : '#4b5563'}\`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: mode === 'playhead' ? '#3b82f6' : 'transparent' }}>
                    {mode === 'playhead' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  Use Playhead
                </label>`
);

code = code.replace(
  /<label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', opacity: 0\.5 }}>\s*<input type="radio" disabled \/> Custom Timecode\s*<\/label>/g,
  `<label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', opacity: 0.5, cursor: 'not-allowed', color: '#9ca3af' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
                  </div>
                  Custom Timecode
                </label>`
);

code = code.replace(
  /<label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>\s*<input type="radio" checked={editMode === "insert"} onChange={\(\) => setEditMode\("insert"\)} \/> Insert\s*<\/label>/g,
  `<label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: editMode === 'insert' ? '#fff' : '#9ca3af' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: \`1px solid \${editMode === 'insert' ? '#3b82f6' : '#4b5563'}\`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: editMode === 'insert' ? '#3b82f6' : 'transparent' }}>
                    {editMode === 'insert' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  Insert
                </label>`
);

code = code.replace(
  /<label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>\s*<input type="radio" checked={editMode === "overwrite"} onChange={\(\) => setEditMode\("overwrite"\)} \/> Overwrite\s*<\/label>/g,
  `<label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: editMode === 'overwrite' ? '#fff' : '#9ca3af' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: \`1px solid \${editMode === 'overwrite' ? '#3b82f6' : '#4b5563'}\`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: editMode === 'overwrite' ? '#3b82f6' : 'transparent' }}>
                    {editMode === 'overwrite' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  Overwrite
                </label>`
);

// Format description texts to be lighter
code = code.replace(
  /<div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>/g,
  `<div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>`
);

fs.writeFileSync('src/js/main/components/TimelinePlacementModal.tsx', code);
console.log('Patched TimelinePlacementModal UI');
