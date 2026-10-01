const fs = require('fs');

let libPage = fs.readFileSync('src/js/main/pages/LibraryPage.tsx', 'utf8');

libPage = libPage.replace(
  `<EmptyState title="No assets found" description="No assets found in this category." icon="assets" />`,
  `<EmptyState title="No assets found" description="No assets found in this category." icon="assets" action={<Button variant="secondary" onClick={importFiles} disabled={importing || !activeBrandId}>{importing ? "Importing..." : "Import Assets"}</Button>} />`
);

fs.writeFileSync('src/js/main/pages/LibraryPage.tsx', libPage);
console.log('Patched LibraryPage.tsx with EmptyState action');
