const fs = require('fs');

let libPage = fs.readFileSync('src/js/main/pages/LibraryPage.tsx', 'utf8');

libPage = libPage.replace(
  `  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);`,
  `  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  
  // Reset selected asset when navigating to a different page/category
  React.useEffect(() => {
    setSelectedAssetId(null);
  }, [page]);`
);

// We need to ensure React is accessible. If `import React, { useState } from 'react'` is used, `React.useEffect` works. If `import { useState } from 'react'` is used without `React`, we should add `useEffect` to the import.
if (!libPage.includes('useEffect') && libPage.includes('import { useState')) {
  libPage = libPage.replace('import { useState', 'import { useState, useEffect');
  libPage = libPage.replace('React.useEffect', 'useEffect');
}

fs.writeFileSync('src/js/main/pages/LibraryPage.tsx', libPage);
console.log('Patched LibraryPage.tsx to reset selectedAssetId on page change');
