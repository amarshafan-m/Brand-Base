const fs = require('fs');
const file = 'src/js/main/pages/LibraryPage.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('isMounted.current')) {
  if (!code.includes('import { useState, useEffect, useRef }')) {
    code = code.replace('import { useState, useEffect }', 'import { useState, useEffect, useRef }');
    if (!code.includes('import { useState, useEffect, useRef }')) {
       code = code.replace('import { useState }', 'import { useState, useEffect, useRef }');
    }
  }

  code = code.replace(
    '  const { data: assets, loading } = useAssets(activeBrandId);',
    `  const { data: assets, loading } = useAssets(activeBrandId);
  const isMounted = useRef(true);
  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);`
  );

  code = code.replace(
    '        onShowNotice(`Integrity check found ${results.broken.length} missing files.`);',
    `        if (isMounted.current) onShowNotice(\`Integrity check found \${results.broken.length} missing files.\`);`
  );
  code = code.replace(
    '        onShowNotice("All assets are healthy.");',
    `        if (isMounted.current) onShowNotice("All assets are healthy.");`
  );
  code = code.replace(
    '      onShowNotice(`Integrity check failed: ${e.message}`);',
    `      if (isMounted.current) onShowNotice(\`Integrity check failed: \${e.message}\`);`
  );
  code = code.replace(
    '      setIntegrityScanning(false);',
    `      if (isMounted.current) setIntegrityScanning(false);`
  );

  fs.writeFileSync(file, code);
  console.log("Success");
}
