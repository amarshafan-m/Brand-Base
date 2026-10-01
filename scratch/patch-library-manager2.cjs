const fs = require('fs');
const path = 'src/js/main/filesystem/LibraryManager.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'return new (require("./io").NodeFolder)(this.currentLibrary, "library");',
  'const { NodeFolder } = require("./io");\n    return new NodeFolder(this.currentLibrary, "library");'
);

// Actually, wait, it's better to just use the import we already have at the top!
// But `NodeFolder` is not imported at the top. Let's add it.

code = code.replace(
  'import { ensureFolder, getFileIfExists, recoverFromBackup, writeJsonSafe } from "./io";',
  'import { NodeFolder, ensureFolder, getFileIfExists, recoverFromBackup, writeJsonSafe } from "./io";'
);

code = code.replace(
  'return new (require("./io").NodeFolder)(this.currentLibrary, "library");',
  'return new NodeFolder(this.currentLibrary, "library");'
);

fs.writeFileSync(path, code);
