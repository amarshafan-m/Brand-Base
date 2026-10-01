const fs = require('fs');
const path = 'src/js/main/components/EditColorModal.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import { Dropdown }')) {
  code = code.replace(
    'import { Button } from "./ui";',
    'import { Button } from "./ui";\nimport { Dropdown } from "./Dropdown";'
  );
}

const oldSelect = `<select value={usage} onChange={e => setUsage(e.target.value as BrandColorType)} style={{ padding: '8px', backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="accent">Accent</option>
              <option value="background">Background</option>
              <option value="text">Text</option>
            </select>`;

const newSelect = `<Dropdown 
              value={usage} 
              onChange={val => setUsage(val as BrandColorType)} 
              options={[
                { value: "primary", label: "Primary" },
                { value: "secondary", label: "Secondary" },
                { value: "accent", label: "Accent" },
                { value: "background", label: "Background" },
                { value: "text", label: "Text" }
              ]} 
            />`;

code = code.replace(oldSelect, newSelect);
fs.writeFileSync(path, code);
