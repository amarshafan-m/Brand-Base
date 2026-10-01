const fs = require('fs');
const glob = require('glob');

function patch(filePath, patches) {
  let code = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  for (const [from, to] of patches) {
    if (!code.includes(from)) continue;
    code = code.split(from).join(to);
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(filePath, code);
    console.log(`Patched: ${filePath}`);
  }
}

// 1. SettingsPage
patch('src/js/main/pages/SettingsPage.tsx', [
  [`background: '#14161a'`, `background: 'var(--bg-card)'`],
  [`border: '1px solid #262a33'`, `border: '1px solid var(--border)'`],
  [`color: '#f3f4f6'`, `color: 'var(--text-main)'`],
  [`color: '#9ca3af'`, `color: 'var(--text-muted)'`],
  [`borderBottom: '1px solid #262a33'`, `borderBottom: '1px solid var(--border)'`],
]);

// 2. Sidebar
patch('src/js/main/layouts/Sidebar.tsx', [
  [`color: '#f3f4f6'`, `color: 'var(--text-main)'`],
  [`color: '#9ca3af'`, `color: 'var(--text-muted)'`],
  [`color: '#6b7280'`, `color: 'var(--text-muted)'`],
  [`color: activePage === item.id ? '#ffffff' : '#9ca3af'`, `color: activePage === item.id ? 'var(--text-main)' : 'var(--text-muted)'`],
  [`color: activePage === "settings" ? '#ffffff' : '#9ca3af'`, `color: activePage === "settings" ? 'var(--text-main)' : 'var(--text-muted)'`],
  [`background: activePage === item.id ? '#2563eb' : 'transparent'`, `background: activePage === item.id ? 'var(--primary)' : 'transparent'`],
  [`background: activePage === "settings" ? '#2563eb' : 'transparent'`, `background: activePage === "settings" ? 'var(--primary)' : 'transparent'`],
]);

// 3. TopBar
patch('src/js/main/layouts/TopBar.tsx', [
  [`background: '#0d0f12'`, `background: 'var(--bg-main)'`],
  [`background: '#14161a'`, `background: 'var(--bg-card)'`],
  [`borderBottom: '1px solid #262a33'`, `borderBottom: '1px solid var(--border)'`],
  [`border: '1px solid #262a33'`, `border: '1px solid var(--border)'`],
  [`color: '#9ca3af'`, `color: 'var(--text-muted)'`],
  [`color: '#ffffff'`, `color: 'var(--text-main)'`],
  [`border: '1px solid #374151'`, `border: '1px solid var(--border)'`],
]);

// 4. LibraryPage
patch('src/js/main/pages/LibraryPage.tsx', [
  [`background: '#14161a'`, `background: 'var(--bg-card)'`],
  [`background: '#0d0f12'`, `background: 'var(--bg-main)'`],
  [`border: '1px solid #262a33'`, `border: '1px solid var(--border)'`],
  [`borderBottom: '1px solid #262a33'`, `borderBottom: '1px solid var(--border)'`],
  [`color: '#ffffff'`, `color: 'var(--text-main)'`],
  [`color: '#f3f4f6'`, `color: 'var(--text-main)'`],
  [`color: '#9ca3af'`, `color: 'var(--text-muted)'`],
  [`border: selectedAssetId === asset.id ? '2px solid #2563eb' : '1px solid #262a33'`, `border: selectedAssetId === asset.id ? '2px solid var(--primary)' : '1px solid var(--border)'`],
]);

// 5. Dropdown
patch('src/js/main/components/Dropdown.tsx', [
  [`backgroundColor: '#111'`, `backgroundColor: 'var(--bg-card)'`],
  [`backgroundColor: '#222'`, `backgroundColor: 'var(--bg-hover)'`],
  [`border: '1px solid #444'`, `border: '1px solid var(--border)'`],
  [`color: '#fff'`, `color: 'var(--text-main)'`],
  [`color: '#888'`, `color: 'var(--text-muted)'`],
]);
