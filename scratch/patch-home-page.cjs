const fs = require('fs');
const path = 'src/js/main/pages/HomePage.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('useAssetImport')) {
  code = code.replace(
    'import { useState, useEffect } from "react";',
    'import { useState, useEffect } from "react";\nimport { useAssetImport } from "../hooks/useAssetImport";'
  );
}

const hookInsert = `  const activeBrand = data?.activeBrand;
  const hasAssets = (data?.totalAssets ?? 0) > 0;
  
  const { importFiles } = useAssetImport(activeBrand?.id);`;

code = code.replace(
  '  const activeBrand = data?.activeBrand;\n  const hasAssets = (data?.totalAssets ?? 0) > 0;',
  hookInsert
);

code = code.replace(
  'onClick={() => onShowNotice("Add Asset is available in Phase 5.")}',
  'onClick={() => importFiles()}'
);

code = code.replace(
  'onClick={() => onShowNotice(hasAssets ? "Asset grid rendering is planned for Phase 5." : "Asset creation is planned for Phase 5.")}',
  'onClick={() => hasAssets ? onNavigate("assets") : importFiles()}'
);

fs.writeFileSync(path, code);
