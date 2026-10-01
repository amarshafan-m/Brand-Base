const fs = require('fs');
let code = fs.readFileSync('src/js/main/pages/LibraryPage.tsx', 'utf8');

const target = `<div style={{ height: h, background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border)' }}>
                  <Icon name={asset.type === 'video' ? 'motion' : asset.type === 'audio' ? 'audio' : asset.type === 'mogrt' ? 'template' : 'assets'} size={settings?.gridSize === 'small' ? 24 : settings?.gridSize === 'large' ? 48 : 32} strokeWidth={1.5} />
                </div>`;

const replacement = `<div style={{ height: h, background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>
                  {asset.type === 'logo' || asset.type === 'image' || asset.type === 'graphic' ? (
                    <img 
                      src={"file://" + ((applicationContainer as any).assetRepository?.libraryManager?.getLibraryPath?.() || '') + "/" + (asset.metadata?.thumbnailPath || asset.filePath)} 
                      alt={asset.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = \`<span style="font-size: 24px; color: var(--text-muted); font-weight: bold;">\${asset.name.slice(0, 1)}</span>\`; }} 
                    />
                  ) : (
                    <Icon name={asset.type === 'video' ? 'motion' : (asset.type === 'audio' || asset.type === 'music' || asset.type === 'sfx') ? 'audio' : asset.type === 'mogrt' ? 'template' : 'assets'} size={settings?.gridSize === 'small' ? 24 : settings?.gridSize === 'large' ? 48 : 32} strokeWidth={1.5} />
                  )}
                </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/js/main/pages/LibraryPage.tsx', code);
console.log('Patched thumbnails into grid');
