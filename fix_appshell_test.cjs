const fs = require('fs');
const file = 'src/js/main/layouts/AppShell.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '// if (active) setUpdateInfo({ hasUpdate: true',
  'if (active) setUpdateInfo({ hasUpdate: true'
);

fs.writeFileSync(file, code);
console.log("Success");
