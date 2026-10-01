const fs = require('fs');

let code = fs.readFileSync('src/js/main/pages/LibraryPage.tsx', 'utf8');

if (!code.includes('const { data: settings } = useApplicationData((c) => c.settingsService.getSettings(), []);')) {
  // Add settings fetch
  code = code.replace(
    `const { data: assets, loading } = useAssets(activeBrandId);`,
    `const { data: assets, loading } = useAssets(activeBrandId);\n  const { data: settings } = useApplicationData((c) => c.settingsService.getSettings(), []);`
  );

  // Implement styles based on settings
  code = code.replace(
    `          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {filteredAssets.map(asset => (
              <div 
                key={asset.id} 
                onClick={() => setSelectedAssetId(asset.id)}
                style={{ 
                  width: '180px', 
                  background: '#14161a', 
                  border: selectedAssetId === asset.id ? '2px solid #2563eb' : '1px solid #262a33', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  cursor: 'pointer',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  boxShadow: selectedAssetId === asset.id ? '0 4px 15px rgba(37, 99, 235, 0.3)' : '0 2px 5px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ height: '110px', background: '#0d0f12', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #262a33' }}>
                  <Icon name={asset.type === 'video' ? 'motion' : asset.type === 'audio' ? 'audio' : asset.type === 'mogrt' ? 'template' : 'assets'} size={32} strokeWidth={1.5} />
                </div>
                <div style={{ padding: '12px', fontSize: '12px' }}>
                  <div style={{ fontWeight: 600, color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>{asset.name}</div>
                  <div style={{ color: '#9ca3af', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 500 }}>
                    <span style={{ textTransform: 'uppercase' }}>{asset.extension || asset.type}</span>
                    <span>{formatSize(asset.size)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>`,
    `          <div style={{ display: 'flex', flexWrap: 'wrap', gap: settings?.compactMode ? '8px' : '16px' }}>
            {filteredAssets.map(asset => {
              let w = '180px';
              let h = '110px';
              if (settings?.gridSize === 'small') { w = '140px'; h = '80px'; }
              if (settings?.gridSize === 'large') { w = '240px'; h = '160px'; }
              
              return (
              <div 
                key={asset.id} 
                onClick={() => setSelectedAssetId(asset.id)}
                style={{ 
                  width: w, 
                  background: '#14161a', 
                  border: selectedAssetId === asset.id ? '2px solid #2563eb' : '1px solid #262a33', 
                  borderRadius: settings?.compactMode ? '8px' : '12px', 
                  overflow: 'hidden', 
                  cursor: 'pointer',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  boxShadow: selectedAssetId === asset.id ? '0 4px 15px rgba(37, 99, 235, 0.3)' : '0 2px 5px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ height: h, background: '#0d0f12', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #262a33' }}>
                  <Icon name={asset.type === 'video' ? 'motion' : asset.type === 'audio' ? 'audio' : asset.type === 'mogrt' ? 'template' : 'assets'} size={settings?.gridSize === 'small' ? 24 : settings?.gridSize === 'large' ? 48 : 32} strokeWidth={1.5} />
                </div>
                <div style={{ padding: settings?.compactMode ? '8px' : '12px', fontSize: '12px' }}>
                  <div style={{ fontWeight: 600, color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>{asset.name}</div>
                  <div style={{ color: '#9ca3af', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 500 }}>
                    <span style={{ textTransform: 'uppercase' }}>{asset.extension || asset.type}</span>
                    <span>{formatSize(asset.size)}</span>
                  </div>
                </div>
              </div>
            )})}
          </div>`
  );

  fs.writeFileSync('src/js/main/pages/LibraryPage.tsx', code);
  console.log('Patched LibraryPage.tsx');
}
