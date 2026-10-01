const fs = require('fs');
const file = 'src/js/main/services/container.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'settingsService,\n    updaterService,',
  'settingsService,'
);
code = code.replace(
  '    recentService,',
  '    updaterService,\n    recentService,'
);
code = code.replace(
  'settingsService,',
  'settingsService,\n    updaterService,'
);

fs.writeFileSync(file, code);
console.log("Success");
