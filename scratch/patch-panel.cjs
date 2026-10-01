const fs = require('fs');
let code = fs.readFileSync('src/js/main/components/AssetDetailPanel.tsx', 'utf8');

code = code.replace(
  'disabled={!context?.projectAvailable || !isImportSupported || importing}',
  'disabled={!isImportSupported || importing}'
);
code = code.replace(
  'disabled={!timelineContext?.sequenceAvailable || !isImportSupported}',
  'disabled={!isImportSupported}'
);

fs.writeFileSync('src/js/main/components/AssetDetailPanel.tsx', code);
console.log('Patched panel to remove disabled checks');
