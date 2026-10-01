const fs = require('fs');
let css = fs.readFileSync('src/js/main/app.css', 'utf8');

css = css.replace(
\`.color-card:hover .color-card-delete {
  opacity: 1;
}\`,
  ''
);

css = css.replace(
\`.color-card-delete {
  padding: 4px;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  opacity: 0.5;
  transition: opacity 0.2s, color 0.2s, transform 0.2s;
}\`,
\`.color-card-delete {
  padding: 4px;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  opacity: 0.3;
  transition: opacity 0.2s, color 0.2s, transform 0.2s;
}\`
);

css = css.replace(
\`.color-card-delete:hover {
  color: #ff6b6b;
  transform: scale(1.1);
}\`,
\`.color-card-delete:hover {
  opacity: 1;
  color: #ff6b6b;
  transform: scale(1.1);
}\`
);

// Add star hover fill
css += \`\n
.detail-panel-action.is-star:hover path {
  fill: currentColor !important;
}
\`;

fs.writeFileSync('src/js/main/app.css', css);
console.log('Patched app.css');
