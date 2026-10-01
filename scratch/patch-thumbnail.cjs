const fs = require('fs');
let code = fs.readFileSync('src/js/main/components/AssetDetailPanel.tsx', 'utf8');

const target = \`          {asset.type === 'logo' || asset.type === 'image' || asset.type === 'graphic' ? (
            <img src={asset.metadata?.thumbnailPath ? \\\`file://\${asset.metadata.thumbnailPath}\\\` : \\\`file://\${asset.filePath}\\\`} alt={asset.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = \\\`<span style="font-size: 32px; color: #fff;">\${asset.name.slice(0, 1)}</span>\\\`; }} />
          ) : (\`;

const replacement = \`          {asset.type === 'logo' || asset.type === 'image' || asset.type === 'graphic' ? (
            <img 
              src={\\\`file://\${(applicationContainer as any).assetRepository?.libraryManager?.getLibraryPath?.() || ''}/\${asset.metadata?.thumbnailPath || asset.filePath}\\\`} 
              alt={asset.name} 
              style={{ width: '80%', height: '80%', objectFit: 'contain' }} 
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = \\\`<span style="font-size: 32px; color: #fff;">\${asset.name.slice(0, 1)}</span>\\\`; }} 
            />
          ) : (\`;

code = code.replace(target, replacement);

fs.writeFileSync('src/js/main/components/AssetDetailPanel.tsx', code);
console.log('Patched thumbnail rendering');
