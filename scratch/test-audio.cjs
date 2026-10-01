const fs = require('fs');
let code = fs.readFileSync('src/js/main/pages/LibraryPage.tsx', 'utf8');

// We will inject an AudioPreview wrapper around the Icon for audio types.
code = code.replace(
  /<Icon name=\{asset\.type === 'video'.*?\/>/g,
  `{ (asset.type === 'audio' || asset.type === 'music' || asset.type === 'sfx') ? (
      <div 
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
        onMouseEnter={(e) => { const a = e.currentTarget.querySelector('audio'); if (a) { a.play().catch(console.error); } }}
        onMouseLeave={(e) => { const a = e.currentTarget.querySelector('audio'); if (a) { a.pause(); a.currentTime = 0; } }}
      >
        <Icon name="audio" size={settings?.gridSize === 'small' ? 24 : settings?.gridSize === 'large' ? 48 : 32} strokeWidth={1.5} />
        <audio src={"file://" + ((applicationContainer as any).assetRepository?.libraryManager?.getLibraryPath?.() || '') + "/" + asset.filePath} style={{ display: 'none' }} loop />
      </div>
  ) : (
      $&
  ) }`
);

fs.writeFileSync('src/js/main/pages/LibraryPage.tsx', code);
console.log('Patched audio preview');
