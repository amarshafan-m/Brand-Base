const fs = require('fs');
let code = fs.readFileSync('src/js/main/components/TimelinePlacementModal.tsx', 'utf8');
code = code.replace("width: '460px'", "width: '490px'");
fs.writeFileSync('src/js/main/components/TimelinePlacementModal.tsx', code);
