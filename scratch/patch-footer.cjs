const fs = require('fs');
let code = fs.readFileSync('src/js/main/pages/LibraryPage.tsx', 'utf8');

code = code.replace(
  /<div style=\{\{ padding: settings\?\.compactMode \? '8px' : '12px', fontSize: '12px' \}\}>/g,
  '<div className="asset-card-footer" style={{ padding: settings?.compactMode ? "8px" : "12px", fontSize: "12px" }}>'
);

fs.writeFileSync('src/js/main/pages/LibraryPage.tsx', code);
console.log('Patched LibraryPage.tsx for footer class');

let css = fs.readFileSync('src/js/main/app.css', 'utf8');
css += `\n\n.asset-card-footer { transition: background-color 0.2s; }\n.asset-card:hover .asset-card-footer { background-color: rgba(255, 255, 255, 0.05); }\n.asset-card-footer:hover { background-color: rgba(255, 255, 255, 0.1) !important; }`;
fs.writeFileSync('src/js/main/app.css', css);
console.log('Patched app.css for footer hover');

