const fs = require('fs');

// 1. Add "light" to models
let models = fs.readFileSync('src/js/main/domain/models.ts', 'utf8');
models = models.replace(
  `export type BrandBaseTheme = "dark" | "system";`,
  `export type BrandBaseTheme = "dark" | "light" | "system";`
);
fs.writeFileSync('src/js/main/domain/models.ts', models);
console.log('Patched: models.ts');

// 2. Add "light" to validation
let validation = fs.readFileSync('src/js/main/domain/validation.ts', 'utf8');
validation = validation.replace(
  `if (settings.theme !== "dark" && settings.theme !== "system") issues.push("Settings theme is invalid.");`,
  `if (settings.theme !== "dark" && settings.theme !== "light" && settings.theme !== "system") issues.push("Settings theme is invalid.");`
);
fs.writeFileSync('src/js/main/domain/validation.ts', validation);
console.log('Patched: validation.ts');

// 3. Put Theme Dropdown back into SettingsPage with Light/Dark/System
let settings = fs.readFileSync('src/js/main/pages/SettingsPage.tsx', 'utf8');
settings = settings.replace(
  `        <div className="settings-group" style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#f3f4f6', fontWeight: 600 }}>Appearance</h3>
          <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', background: '#14161a', border: '1px solid #262a33', borderRadius: '8px', overflow: 'visible', flexShrink: 0 }}>
            
            <SettingRow `,
  `        <div className="settings-group" style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#f3f4f6', fontWeight: 600 }}>Appearance</h3>
          <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', background: '#14161a', border: '1px solid #262a33', borderRadius: '8px', overflow: 'visible', flexShrink: 0 }}>
            <SettingRow 
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
              detail="Brand Base follows Premiere's professional dark visual language by default.">
              Theme
            </SettingRow>
            
            <SettingRow `
);
fs.writeFileSync('src/js/main/pages/SettingsPage.tsx', settings);
console.log('Patched: SettingsPage.tsx');

// 4. Add Light Theme variables to CSS
let appCss = fs.readFileSync('src/js/main/app.css', 'utf8');
if (!appCss.includes('data-theme="light"')) {
  appCss += `\n
:root[data-theme="light"], .brand-base-app[data-theme="light"] {
  --bg-main: #f9fafb;
  --bg-sidebar: #f3f4f6;
  --bg-card: #ffffff;
  --bg-hover: #e5e7eb;
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --text-main: #111827;
  --text-muted: #6b7280;
  --border: #d1d5db;
  --success: #16a34a;
  --danger: #dc2626;
  --danger-bg: #fef2f2;
  --warning: #d97706;
}
`;
  fs.writeFileSync('src/js/main/app.css', appCss);
  console.log('Patched: app.css (Light theme)');
}

// 5. Connect the theme to AppShell so it actually changes DOM class or dataset
let appShell = fs.readFileSync('src/js/main/layouts/AppShell.tsx', 'utf8');
if (!appShell.includes('data-theme={')) {
  // We need to fetch settings
  appShell = appShell.replace(
    `export function AppShell() {
  const [activePage, setActivePage] = useState<PageId>("home");`,
    `import { useApplicationData } from "../hooks/useApplicationData";\nexport function AppShell() {
  const [activePage, setActivePage] = useState<PageId>("home");
  const { data: settings } = useApplicationData(c => c.settingsService.getSettings(), []);`
  );

  appShell = appShell.replace(
    `    <div className={\`brand-base-app \${collapsed ? "brand-base-app--compact" : ""}\`} style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-main)', color: 'var(--text-main)' }}>`,
    `    <div className={\`brand-base-app \${collapsed ? "brand-base-app--compact" : ""}\`} data-theme={settings?.theme === 'system' ? undefined : settings?.theme} style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-main)', color: 'var(--text-main)' }}>`
  );
  fs.writeFileSync('src/js/main/layouts/AppShell.tsx', appShell);
  console.log('Patched: AppShell.tsx');
}
