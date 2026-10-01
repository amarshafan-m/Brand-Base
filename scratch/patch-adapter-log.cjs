const fs = require('fs');
let code = fs.readFileSync('src/js/main/premiere/CEPPremiereAdapter.ts', 'utf8');

code = code.replace(
  "require('fs').writeFileSync('/Users/amarshafanm/Desktop/premiere_error.txt'",
  "require('fs').writeFileSync(__dirname + '/../../../../premiere_error.txt'"
);

fs.writeFileSync('src/js/main/premiere/CEPPremiereAdapter.ts', code);
console.log('Patched CEPPremiereAdapter to log to workspace');
