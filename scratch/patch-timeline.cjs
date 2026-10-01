const fs = require('fs');
const path = 'src/js/main/components/TimelinePlacementModal.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import { Dropdown }')) {
  code = code.replace(
    'import { Button } from "./ui";',
    'import { Button } from "./ui";\nimport { Dropdown } from "./Dropdown";'
  );
}

const oldModeSelect = `<select 
                  value={placement.mode} 
                  onChange={e => setPlacement({ ...placement, mode: e.target.value as any })}
                  style={{ padding: '8px', backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff', borderRadius: '4px', width: '100%' }}
                >
                  <option value="playhead">At Playhead</option>
                  <option value="custom">Custom Time</option>
                </select>`;

const newModeSelect = `<Dropdown 
                  value={placement.mode} 
                  onChange={val => setPlacement({ ...placement, mode: val as any })} 
                  options={[
                    { value: "playhead", label: "At Playhead" },
                    { value: "custom", label: "Custom Time" }
                  ]} 
                />`;

code = code.replace(oldModeSelect, newModeSelect);

const oldEditModeSelect = `<select 
                  value={placement.editMode} 
                  onChange={e => setPlacement({ ...placement, editMode: e.target.value as any })}
                  style={{ padding: '8px', backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff', borderRadius: '4px', width: '100%' }}
                >
                  <option value="insert">Insert (Ripple)</option>
                  <option value="overwrite">Overwrite</option>
                </select>`;

const newEditModeSelect = `<Dropdown 
                  value={placement.editMode} 
                  onChange={val => setPlacement({ ...placement, editMode: val as any })} 
                  options={[
                    { value: "insert", label: "Insert (Ripple)" },
                    { value: "overwrite", label: "Overwrite" }
                  ]} 
                />`;

code = code.replace(oldEditModeSelect, newEditModeSelect);
fs.writeFileSync(path, code);
