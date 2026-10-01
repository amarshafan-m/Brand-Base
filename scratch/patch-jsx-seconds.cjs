const fs = require('fs');
let code = fs.readFileSync('src/jsx/ppro/brandbase.ts', 'utf8');

code = code.replace(
  "if (placement.mode !== \"playhead\" && placement.ticks) {",
  "if (placement.mode !== \"playhead\") {\n    if (placement.ticks) time.ticks = placement.ticks;\n    if (placement.customSeconds !== undefined) time.seconds = placement.customSeconds;"
);

fs.writeFileSync('src/jsx/ppro/brandbase.ts', code);
console.log('Patched ExtendScript to support customSeconds');
