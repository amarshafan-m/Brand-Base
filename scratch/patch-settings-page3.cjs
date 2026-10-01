const fs = require('fs');
const path = 'src/js/main/pages/SettingsPage.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Fetch all brands
code = code.replace(
  'return { settings, defaultBrandName };',
  'const allBrands = await c.brandService.getAll();\n    return { settings, defaultBrandName, allBrands };'
);

// 2. Add brand select dropdown instead of span
const oldSpan = `<span className="setting-value" style={{ color: '#9ca3af', fontSize: '13px' }}>{defaultBrandName}</span>`;
const newSelect = `
                <select value={settings.defaultBrandId || ""} onChange={(e) => updateSetting('defaultBrandId', e.target.value)} style={{ padding: '4px 8px', background: '#232323', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}>
                  <option value="" disabled>Select a brand</option>
                  {data.allBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
`;

code = code.replace(oldSpan, newSelect);

fs.writeFileSync(path, code);
