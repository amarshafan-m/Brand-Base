const fs = require('fs');
const file = 'src/js/main/hooks/useAssetImport.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('isMounted.current')) {
  if (!code.includes('import { useState, useRef, useEffect }')) {
    code = code.replace('import { useState, useRef }', 'import { useState, useRef, useEffect }');
  }

  code = code.replace(
    '  const [duplicatePrompt, setDuplicatePrompt] = useState<DuplicatePrompt | null>(null);',
    `  const [duplicatePrompt, setDuplicatePrompt] = useState<DuplicatePrompt | null>(null);
  
  const isMounted = useRef(true);
  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);`
  );

  code = code.replace(
    '          setImporting(false);',
    `          if (isMounted.current) setImporting(false);`
  );
  
  code = code.replace(
    '        () => {\n          if (isMounted.current) setImporting(false);\n          triggerGlobalReload();\n        },',
    `        () => {
          if (isMounted.current) setImporting(false);
          triggerGlobalReload();
        },`
  );
  
  code = code.replace(
    '      setImporting(false);',
    `      if (isMounted.current) setImporting(false);`
  );

  fs.writeFileSync(file, code);
  console.log("Success");
}
