const fs = require('fs');
const path = 'src/js/main/pages/BrandsPage.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/className="brand-card" style=\{\{[^}]+\}\}/g, 'className="brand-card"');
code = code.replace(/<div className="brand-card-stats" style=\{\{[^}]+\}\}>/g, '<div className="brand-card-stats">');
code = code.replace(/<div className="brand-card-actions" style=\{\{[^}]+\}\}/g, '<div className="brand-card-actions"');

fs.writeFileSync(path, code);
