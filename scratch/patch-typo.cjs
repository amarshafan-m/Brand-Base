const fs = require('fs');
const path = 'src/js/main/components/EditTypographyModal.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import { Dropdown }')) {
  code = code.replace(
    'import { Button } from "./ui";',
    'import { Button } from "./ui";\nimport { Dropdown } from "./Dropdown";'
  );
}

const oldFontWeightSelect = `<select value={fontWeight} onChange={e => setFontWeight(e.target.value)} style={{ padding: '8px', backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}>
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">SemiBold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="800">ExtraBold (800)</option>
            <option value="900">Black (900)</option>
          </select>`;

const newFontWeightSelect = `<Dropdown 
            value={fontWeight} 
            onChange={val => setFontWeight(val)} 
            options={[
              { value: "400", label: "Regular (400)" },
              { value: "500", label: "Medium (500)" },
              { value: "600", label: "SemiBold (600)" },
              { value: "700", label: "Bold (700)" },
              { value: "800", label: "ExtraBold (800)" },
              { value: "900", label: "Black (900)" }
            ]} 
          />`;

code = code.replace(oldFontWeightSelect, newFontWeightSelect);

const oldRoleSelect = `<select value={role} onChange={e => setRole(e.target.value as any)} style={{ padding: '8px', backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}>
            <option value="heading">Heading</option>
            <option value="subheading">Subheading</option>
            <option value="body">Body</option>
            <option value="caption">Caption</option>
            <option value="mono">Monospace</option>
          </select>`;

const newRoleSelect = `<Dropdown 
            value={role} 
            onChange={val => setRole(val as any)} 
            options={[
              { value: "heading", label: "Heading" },
              { value: "subheading", label: "Subheading" },
              { value: "body", label: "Body" },
              { value: "caption", label: "Caption" },
              { value: "mono", label: "Monospace" }
            ]} 
          />`;

code = code.replace(oldRoleSelect, newRoleSelect);
fs.writeFileSync(path, code);
