const fs = require('fs');

let page = fs.readFileSync('src/js/main/pages/ColorsPage.tsx', 'utf8');

// Ensure Icon is imported
if (!page.includes('import { Icon } from')) {
  page = page.replace(
    `import { EditColorModal } from "../components/EditColorModal";`,
    `import { EditColorModal } from "../components/EditColorModal";\nimport { Icon } from "../components/Icon";`
  );
}

// Replace the copy span
page = page.replace(
  `<span style={{ fontSize: '10px', marginLeft: '4px' }}>📋</span>`,
  `<span style={{ marginLeft: '6px', opacity: 0.7 }}><Icon name="copy" size={12} /></span>`
);

// Replace the delete times with Icon
page = page.replace(
  `&times;`,
  `<Icon name="x" size={16} />`
);

// Improve the styling of the text
page = page.replace(
  `style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', cursor: 'copy' }}`,
  `style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', cursor: 'copy' }}`
);
page = page.replace(
  `padding: '4px', cursor: 'pointer', color: '#ff6b6b', fontSize: '18px', fontWeight: 'bold'`,
  `padding: '4px', cursor: 'pointer', color: '#ff6b6b', display: 'flex', alignItems: 'center'`
);


fs.writeFileSync('src/js/main/pages/ColorsPage.tsx', page);
console.log('Patched ColorsPage.tsx UI');
