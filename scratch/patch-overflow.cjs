const fs = require('fs');
const path = 'src/js/main/pages/SettingsPage.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/overflow: 'hidden'/g, "overflow: 'visible'");

fs.writeFileSync(path, code);
