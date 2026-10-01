const fs = require('fs');
let code = fs.readFileSync('src/js/main/app.css', 'utf8');

code = code.replace(
  /\.detail-panel-action\.is-star\.is-active \{\n  color: #fbbf24;\n\}/g,
  `.detail-panel-action.is-star.is-active {
  color: #fbbf24;
}
.detail-panel-action.is-star.is-active svg path {
  fill: currentColor !important;
  stroke: none !important;
}`
);

fs.writeFileSync('src/js/main/app.css', code);
console.log('Patched app.css for star filled');
