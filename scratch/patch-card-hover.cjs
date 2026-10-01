const fs = require('fs');
let page = fs.readFileSync('src/js/main/pages/ColorsPage.tsx', 'utf8');

const target = `                className="color-card"\n                key={c.id} \n                onClick={() => handleOpenModal(c)}\n                style={{ \n                  display: 'flex', alignItems: 'center', padding: '12px', \n                  border: '1px solid var(--border)', borderRadius: '6px', \n                  marginRight: '12px', marginBottom: '12px',\n                  backgroundColor: 'var(--bg-card)', cursor: 'pointer', minWidth: '200px',\n                  justifyContent: 'space-between'\n                }}\n              >`;

const replacement = `                className="color-card"\n                key={c.id} \n                onClick={() => handleOpenModal(c)}\n              >`;

page = page.replace(target, replacement);
fs.writeFileSync('src/js/main/pages/ColorsPage.tsx', page);
console.log('Removed inline styles from ColorsPage.tsx');

let css = fs.readFileSync('src/js/main/app.css', 'utf8');

css += `

/* Color Card Styles */
.color-card {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  margin-right: 12px;
  margin-bottom: 12px;
  background-color: var(--bg-card);
  cursor: pointer;
  min-width: 200px;
  justify-content: space-between;
  transition: all 0.2s;
}

.color-card:hover {
  border-color: var(--primary);
  background-color: var(--bg-main);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.1);
  transform: translateY(-1px);
}
`;

// Update color-card-delete logic again
css = css.replace(
  "opacity: 0.3;\n  transition: opacity 0.2s, color 0.2s, transform 0.2s;\n}\n\n.color-card-delete:hover {\n  opacity: 1;\n  color: #ff6b6b;\n  transform: scale(1.1);\n}",
  "opacity: 0;\n  transition: opacity 0.2s, color 0.2s, transform 0.2s;\n}\n\n.color-card:hover .color-card-delete {\n  opacity: 0.5;\n}\n\n.color-card-delete:hover {\n  opacity: 1 !important;\n  color: #ff6b6b;\n  transform: scale(1.1);\n}"
);

fs.writeFileSync('src/js/main/app.css', css);
console.log('Patched app.css with card hover states');
