const fs = require('fs');
let css = fs.readFileSync('src/js/main/app.css', 'utf8');

// Remove old hover that turns x red globally
css = css.replace(
  ".color-card:hover .color-card-delete {\n  opacity: 1;\n}",
  ""
);

// Make x slightly visible normally, and fully visible on hover
css = css.replace(
  "opacity: 0.5;\n  transition: opacity 0.2s, color 0.2s, transform 0.2s;\n}\n\n.color-card-delete:hover {\n  color: #ff6b6b;\n  transform: scale(1.1);\n}",
  "opacity: 0.3;\n  transition: opacity 0.2s, color 0.2s, transform 0.2s;\n}\n\n.color-card-delete:hover {\n  opacity: 1;\n  color: #ff6b6b;\n  transform: scale(1.1);\n}"
);

if (!css.includes('.detail-panel-action.is-star:hover path')) {
  css += `

.detail-panel-action.is-star:hover path {
  fill: currentColor !important;
}
`;
}

fs.writeFileSync('src/js/main/app.css', css);
console.log('Patched app.css');
