const fs = require('fs');

let page = fs.readFileSync('src/js/main/pages/ColorsPage.tsx', 'utf8');

page = page.replace(
  `key={c.id}`,
  `className="color-card"\n                key={c.id}`
);

page = page.replace(
  `style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', cursor: 'copy' }}`,
  `className="color-card-copy"`
);

page = page.replace(
  `<span style={{ marginLeft: '6px', opacity: 0.7 }}>`,
  `<span className="copy-icon">`
);

page = page.replace(
  `style={{ padding: '4px', cursor: 'pointer', color: '#ff6b6b', display: 'flex', alignItems: 'center' }}`,
  `className="color-card-delete"`
);

fs.writeFileSync('src/js/main/pages/ColorsPage.tsx', page);
console.log('Patched ColorsPage.tsx to use CSS hover classes');
