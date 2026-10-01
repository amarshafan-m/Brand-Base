const fs = require('fs');
let code = fs.readFileSync('src/js/main/app.css', 'utf8');

code = code.replace(
  /\.color-card:hover \.color-card-delete \{ opacity: 0\.8; \}/,
  ""
);

code = code.replace(
  /\.color-card-delete \{\n  width: 24px;\n  height: 24px;\n  border-radius: 4px;\n  cursor: pointer;\n  color: var\(--text-muted\);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  opacity: 0;\n  transition: all 0\.2s;\n\}/g,
  `.color-card-delete {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.4;
  transition: all 0.2s;
}`
);

fs.writeFileSync('src/js/main/app.css', code);
console.log('Patched x button');
