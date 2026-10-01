const fs = require('fs');
const file = 'src/js/main/layouts/TopBar.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'onChange={(e) => onSearchChange(e.target.value)}',
  'onChange={(e) => { const v = e.target.value; onSearchChange(v); if (v && (activePage === "home" || activePage === "settings")) { onNavigate("assets"); } }}'
);

fs.writeFileSync(file, code);
