const fs = require('fs');
let code = fs.readFileSync('src/js/main/premiere/CEPPremiereAdapter.ts', 'utf8');

code = code.replace(
  "console.error(\"CEPPremiereAdapter getContext error:\", e);",
  "console.error(\"CEPPremiereAdapter getContext error:\", JSON.stringify(e));\n      applicationContainer.settingsService.updateSettings({ ...applicationContainer.settingsService.getSettings(), lastError: JSON.stringify(e) });" // Save to settings so I can see it? Or just use write_to_file... No, let's just make it throw so the panel catches it? Or I can just write it to a file!
);
// Actually, let's just write to a file in the user's desktop!
code = code.replace(
  "console.error(\"CEPPremiereAdapter getContext error:\", e);",
  "require('fs').writeFileSync('/Users/amarshafanm/Desktop/premiere_error.txt', JSON.stringify(e));\n      console.error(\"CEPPremiereAdapter getContext error:\", e);"
);
fs.writeFileSync('src/js/main/premiere/CEPPremiereAdapter.ts', code);
console.log('Patched CEPPremiereAdapter to log errors to file');
