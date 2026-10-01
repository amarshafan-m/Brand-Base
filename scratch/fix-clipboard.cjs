const fs = require('fs');

let page = fs.readFileSync('src/js/main/pages/ColorsPage.tsx', 'utf8');

if (!page.includes('import { copyToClipboard }')) {
  page = page.replace(
    `import { Icon } from "../components/Icon";`,
    `import { Icon } from "../components/Icon";\nimport { copyToClipboard } from "../utils/clipboard";`
  );
}

page = page.replace(
  `navigator.clipboard.writeText((c as any).value || c.hex);`,
  `copyToClipboard((c as any).value || c.hex);`
);

fs.writeFileSync('src/js/main/pages/ColorsPage.tsx', page);
console.log('Patched ColorsPage.tsx to use fallback clipboard API');
