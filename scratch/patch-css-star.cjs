const fs = require('fs');
let css = fs.readFileSync('src/js/main/app.css', 'utf8');

css = css.replace(
  ".detail-panel-action.is-star:hover path {\n  fill: currentColor !important;\n}",
  ""
);

fs.writeFileSync('src/js/main/app.css', css);
console.log('Reverted star fill on hover');
