const fs = require('fs');
const path = 'src/js/main/filesystem/UxPAssetRepository.ts';
let code = fs.readFileSync(path, 'utf8');

// The logic inside create() is:
// if (cloned.filePath.startsWith("uxp-token:")) ...

// We will add support for "absolute:" prefix which is just the native path.
code = code.replace(
  /if \(cloned\.filePath\.startsWith\("uxp-token:"\)\) \{/,
  `if (cloned.filePath.startsWith("uxp-token:") || cloned.filePath.startsWith("absolute:")) {
      const isAbsolute = cloned.filePath.startsWith("absolute:");
      const token = isAbsolute ? cloned.filePath.substring("absolute:".length) : cloned.filePath.substring("uxp-token:".length);
`
);

code = code.replace(
  /sourceFile = await fs\.getEntryForPersistentToken\(token\);/g,
  `if (isAbsolute) {
          // @ts-ignore
          const nodeFs = require('fs');
          // @ts-ignore
          const nodePath = require('path');
          sourceFile = {
             isFile: true,
             name: nodePath.basename(token),
             nativePath: token,
             copyTo: async (destFolder, opts) => {
                 const destPath = nodePath.join(destFolder.nativePath, nodePath.basename(token));
                 if (!opts.overwrite && nodeFs.existsSync(destPath)) throw new Error("EntryExists");
                 nodeFs.copyFileSync(token, destPath);
             }
          };
        } else {
          sourceFile = await fs.getEntryForPersistentToken(token);
        }`
);

fs.writeFileSync(path, code);
