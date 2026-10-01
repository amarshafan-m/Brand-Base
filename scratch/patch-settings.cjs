const fs = require('fs');
let settings = fs.readFileSync('src/js/main/pages/SettingsPage.tsx', 'utf8');

const themeRow = `            <SettingRow 
              control={
                <Dropdown 
                  value={data.settings.theme || "system"} 
                  onChange={(val) => updateSetting('theme', val)} 
                  options={[
                    { value: "dark", label: "Dark" },
                    { value: "light", label: "Light" },
                    { value: "system", label: "System" }
                  ]} 
                />
              } 
              detail="Brand Base follows Premiere's professional visual language by default.">
              Theme
            </SettingRow>
`;

// Insert after <div className="settings-card"... under Appearance
const target = `<h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#f3f4f6', fontWeight: 600 }}>Appearance</h3>
          <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', background: '#14161a', border: '1px solid #262a33', borderRadius: '8px', overflow: 'visible', flexShrink: 0 }}>`;

if (settings.includes(target)) {
  settings = settings.replace(target, target + '\n' + themeRow);
  fs.writeFileSync('src/js/main/pages/SettingsPage.tsx', settings);
  console.log('Successfully inserted Theme dropdown');
} else {
  console.error('Could not find Appearance block in SettingsPage.tsx');
}
