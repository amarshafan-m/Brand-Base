const fs = require('fs');
let code = fs.readFileSync('src/js/main/types/navigation.ts', 'utf8');

code = code.replace(
  /\| "graphics"/,
  '| "video"\n  | "graphics"'
);

code = code.replace(
  /\| "graphics"/,
  '| "video"\n  | "graphics"'
); // There are two PageId and IconName

code = code.replace(
  /\{ id: "graphics", label: "Graphics", icon: "graphics" \},/,
  '{ id: "video", label: "Video", icon: "video" },\n      { id: "graphics", label: "Graphics", icon: "graphics" },'
);

fs.writeFileSync('src/js/main/types/navigation.ts', code);
console.log('Patched navigation.ts');
