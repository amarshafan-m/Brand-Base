const fs = require('fs');

let page = fs.readFileSync('src/js/main/components/AssetDetailPanel.tsx', 'utf8');

page = page.replace(
  `<button onClick={toggleFavorite} style={{ background: 'transparent', color: asset.favorite ? '#fbbf24' : '#6b7280', border: 'none', cursor: 'pointer' }}>
            <Icon name="star" size={16} />
          </button>`,
  `<button onClick={toggleFavorite} className={\`detail-panel-action is-star \${asset.favorite ? 'is-active' : ''}\`} title="Toggle Favorite">
            <Icon name={asset.favorite ? "starFilled" : "star"} size={16} />
          </button>`
);

page = page.replace(
  `<button onClick={onClose} style={{ background: 'transparent', color: '#6b7280', border: 'none', cursor: 'pointer' }}>
            <Icon name="x" size={16} />
          </button>`,
  `<button onClick={onClose} className="detail-panel-action is-close" title="Close Panel">
            <Icon name="x" size={16} />
          </button>`
);

fs.writeFileSync('src/js/main/components/AssetDetailPanel.tsx', page);
console.log('Patched AssetDetailPanel.tsx to use CSS hover classes and filled star');
