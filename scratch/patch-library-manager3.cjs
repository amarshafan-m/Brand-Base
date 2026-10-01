const fs = require('fs');
const path = 'src/js/main/filesystem/LibraryManager.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'const { NodeFolder } = require("./io");\n    return new NodeFolder(this.currentLibrary, "library");',
  'return new NodeFolder(this.currentLibrary, "library");'
);

fs.writeFileSync(path, code);
