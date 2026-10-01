const fs = require('fs');
let css = fs.readFileSync('src/js/main/app.css', 'utf8');

css = css.replace(
  /\.color-card-delete \{[\s\S]*?\}/,
  `.color-card-delete {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
}`
);

css = css.replace(
  /\.color-card-delete:hover \{[\s\S]*?\}/,
  `.color-card-delete:hover {
  opacity: 1 !important;
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.05);
}`
);

fs.writeFileSync('src/js/main/app.css', css);
console.log('Patched color card delete hover using regex');
