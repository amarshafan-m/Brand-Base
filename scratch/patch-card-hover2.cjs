const fs = require('fs');
let css = fs.readFileSync('src/js/main/app.css', 'utf8');

// Change border color to white on hover and remove blue shadow
css = css.replace(
  "border-color: var(--primary);\n  background-color: var(--bg-main);\n  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.1);",
  "border-color: #ffffff;\n  background-color: var(--bg-main);\n  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);"
);

// Improve the x hover state
css = css.replace(
  ".color-card-delete {\n  padding: 4px;",
  ".color-card-delete {\n  padding: 6px;\n  border-radius: 6px;"
);

css = css.replace(
  ".color-card-delete:hover {\n  opacity: 1 !important;\n  color: #ff6b6b;\n  transform: scale(1.1);\n}",
  ".color-card-delete:hover {\n  opacity: 1 !important;\n  color: #ff6b6b;\n  background: rgba(255, 107, 107, 0.15);\n}"
);

fs.writeFileSync('src/js/main/app.css', css);
console.log('Patched app.css for white border and improved x hover');
